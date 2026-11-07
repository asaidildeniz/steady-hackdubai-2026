import golden from '@/content/golden.json';
import { content } from '@/content/types';
import { type Tags, tagsFromText } from '@/lib/matching';
import { closestTags, type GoldenCase, goldenScore, type Scored, scoreTags, type TagIndex } from '@/lib/meaning';

// The on-phone sentence model (all-MiniLM-L6-v2 through React Native ExecuTorch). The model files ship
// inside the app (assets/models), so nothing is ever downloaded or sent. In Expo Go, on an unsupported
// phone, or if loading fails, meaningTags returns null and Steady uses keyword matching alone.

type Embed = (text: string) => Promise<ArrayLike<number>>;
type Matcher = { embed: Embed; index: TagIndex };

// For the demo screen's model check only; holds no user text.
export type EmbedderStatus =
  | { state: 'idle' | 'loading' | 'off' }
  | { state: 'ready'; seconds: number; phrases: number }
  | { state: 'failed'; error: string };

let status: EmbedderStatus = { state: 'idle' };
let loading: Promise<Matcher | null> | null = null;

async function load(): Promise<Matcher | null> {
  const started = Date.now();
  status = { state: 'loading' };
  try {
    // Expo Go (or any build without the model's native parts) can't run it. Check the native modules
    // before loading the library: in development, a library that fails while loading is reported as a
    // crash even inside this try, so it must never be required where it can't work.
    const { Platform, TurboModuleRegistry } = require('react-native');
    const native =
      Platform.OS !== 'web' && // the web has no native modules at all
      ['ReactNativeBlobUtil', 'RnExecutorch', 'ETInstaller'].every((m) => TurboModuleRegistry.get(m));
    if (!native) {
      status = { state: 'off' };
      return null;
    }
    // Required lazily, and the catch keeps the app running on any phone the model doesn't support.
    const { createTextEmbedder } = require('react-native-executorch');
    const { Asset } = require('expo-asset');
    const local = async (module: number) => {
      const [asset] = await Asset.loadAsync(module);
      return (asset.localUri as string).replace(/^file:\/\//, '');
    };
    const embedder = await createTextEmbedder({
      modelPath: await local(require('../../assets/models/all-minilm-l6-v2.pte')),
      tokenizerPath: await local(require('../../assets/models/all-minilm-l6-v2-tokenizer.tok')),
    });
    const embed: Embed = (text) => embedder.embed(text);

    // Embed every tag's label and example phrases once, in memory only.
    const index: TagIndex = [];
    for (const layer of ['feelings', 'themes', 'needs'] as const) {
      for (const tag of content.taxonomy[layer]) {
        for (const phrase of [tag.label, ...tag.examplePhrases]) {
          index.push({ layer, id: tag.id, phrase, vec: await embed(phrase) });
        }
      }
    }
    status = { state: 'ready', seconds: Math.round((Date.now() - started) / 100) / 10, phrases: index.length };
    return { embed, index };
  } catch (e) {
    status = { state: 'failed', error: e instanceof Error ? e.message : String(e) };
    return null; // keyword matching only
  }
}

// Called once when the app starts, so the model is warm before anyone types.
export function startEmbedder() {
  loading ??= load();
}

export const embedderStatus = () => status;

// Waits at most a few seconds for a model that is still loading, then gives up quietly.
async function matcher(): Promise<Matcher | null> {
  if (!loading) return null;
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
  return Promise.race([loading, timeout]);
}

// Tags by meaning, or null when the model isn't available. The text is used once and not kept.
export async function meaningTags(text: string): Promise<Tags | null> {
  const m = await matcher();
  if (!m || !text.trim()) return null;
  return closestTags(await m.embed(text), m.index, content.matching.meaningThreshold);
}

// Demo model check: Abel's golden set at several thresholds, plus which sentences miss at `missesAt`.
export async function goldenReport(thresholds: number[], missesAt: number) {
  const m = await matcher();
  if (!m) return null;
  const run = async (text: string) => ({ keywords: tagsFromText(text), scores: scoreTags(await m.embed(text), m.index) });
  const cases: (GoldenCase & { text: string })[] = [];
  for (const g of golden.sentences) cases.push({ ...(await run(g.text)), expected: g.feelings, text: g.text });
  const neutral: (Omit<GoldenCase, 'expected'> & { text: string })[] = [];
  for (const text of golden.neutral) neutral.push({ ...(await run(text)), text });
  const misses = cases.filter((c) => goldenScore([c], [], missesAt).hits === 0).map((c) => c.text);
  const alarms = neutral.filter((c) => goldenScore([], [c], missesAt).falseAlarms > 0).map((c) => c.text);
  return { rows: thresholds.map((t) => goldenScore(cases, neutral, t)), misses, alarms };
}

// Demo model check: the tags a sentence would get and the closest scores, to tune the threshold.
export async function explain(text: string): Promise<{ tags: Tags; top: Scored[] } | null> {
  const m = await matcher();
  if (!m || !text.trim()) return null;
  const vec = await m.embed(text);
  return { tags: closestTags(vec, m.index, content.matching.meaningThreshold), top: scoreTags(vec, m.index).slice(0, 5) };
}
