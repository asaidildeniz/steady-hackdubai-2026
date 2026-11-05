#!/bin/sh
# Downloads the on-phone sentence model (all-MiniLM-L6-v2, ExecuTorch export by Software Mansion)
# into assets/models and checks it against the published hashes. Run once after cloning: npm run fetch-model
# The files are bundled into the app; the app itself never downloads anything.
set -e
cd "$(dirname "$0")/.."
BASE="https://huggingface.co/software-mansion/react-native-executorch-all-MiniLM-L6-v2/resolve/v0.10.0"
mkdir -p assets/models

curl -fsSL -o assets/models/all-minilm-l6-v2.pte "$BASE/xnnpack/all_minilm_l6_v2_xnnpack_fp32.pte"
curl -fsSL -o assets/models/all-minilm-l6-v2-tokenizer.tok "$BASE/tokenizer.json"

echo "3e59e86abfe09d5aa533fec095cef1f38cbdf21d9d5798996daea4d38a54dac7  assets/models/all-minilm-l6-v2.pte" | shasum -a 256 -c -
test "$(git hash-object --no-filters assets/models/all-minilm-l6-v2-tokenizer.tok)" = "37314224068f08749ef4d185512fb3a9e93c4ab9" \
  && echo "assets/models/all-minilm-l6-v2-tokenizer.tok: OK"
