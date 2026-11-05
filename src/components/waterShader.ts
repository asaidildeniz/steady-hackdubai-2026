// Steady's own water shader (SkSL, run by Skia on the phone's graphics chip). Written for Steady, inspired by
// the fluid-in-a-glass-sphere look of shader orbs; no third-party shader code. Inputs:
//   res    canvas size in pixels
//   time   seconds, always running, so the water never stops moving
//   breath 0 when breathed out, 1 when breathed in; it stirs the water a little as the drop fills
//   drift  how fast the drop is floating (x, y); the water inside lags behind, like water in a moving glass
export const WATER_SKSL = `
uniform float2 res;
uniform float time;
uniform float breath;
uniform float2 drift;

const float3 deep  = float3(0.38, 0.52, 0.60);
const float3 sea   = float3(0.55, 0.69, 0.75);
const float3 mist  = float3(0.86, 0.91, 0.93);
const float3 aqua  = float3(0.70, 0.89, 0.88);
const float3 lilac = float3(0.83, 0.76, 0.91);

half4 main(float2 pos) {
  float2 uv = (pos - 0.5 * res) / (0.46 * res.x);
  // A living outline: the edge breathes in slow, uneven waves, never a perfect circle.
  float ang = atan(uv.y, uv.x);
  float edge = 1.0 + 0.024 * sin(3.0 * ang + time * 1.1) + 0.014 * sin(5.0 * ang - time * 1.6) + 0.007 * sin(7.0 * ang + time * 2.3);
  float r = length(uv) / edge;
  if (r > 1.0) { return half4(0.0); }
  float z = sqrt(max(0.0, 1.0 - r * r));
  float3 n = float3(uv, z);

  // Looking into a sphere: the water bends more towards the edge.
  float2 q = uv / (0.5 + 0.5 * z) - drift * 0.6;

  // Slow folding currents: each layer bends the next, so the water folds into itself.
  float t = time * 0.25 + breath * 1.1;
  float2 p = q * 2.3;
  for (int i = 1; i < 9; i++) {
    float fi = float(i);
    p += (0.78 + 0.22 * breath) / fi * sin(fi * p.yx + t * (0.55 + 0.12 * fi) + float2(0.4, 1.9) * fi);
  }
  float v = 0.5 + 0.5 * sin(p.x + p.y);
  float w = 0.5 + 0.5 * sin(p.x * 0.8 - p.y * 1.2 + t);

  float3 col = mix(deep, sea, smoothstep(0.0, 0.5, v));
  col = mix(col, mist, smoothstep(0.45, 1.0, v));
  col = mix(col, aqua, 0.55 * smoothstep(0.6, 1.0, w) * (1.0 - v));
  col = mix(col, lilac, 0.5 * smoothstep(0.65, 1.0, 1.0 - w) * v);

  // Fine bright lines where currents meet, like light caught in moving water.
  float caustic = pow(abs(sin(p.x * 1.7 - p.y * 0.6)), 14.0);
  col += 0.16 * caustic * (0.4 + 0.6 * z);

  // Light from the top left, a thin glassy rim, a soft highlight and a faint glow low on the right.
  float3 L = normalize(float3(-0.45, -0.55, 0.7));
  col *= 0.82 + 0.28 * clamp(dot(n, L), 0.0, 1.0);
  col = mix(col, float3(0.92, 0.96, 0.97), 0.42 * pow(1.0 - z, 3.0));
  float2 d = uv - float2(-0.4, -0.44);
  col += 0.55 * exp(-dot(d, d) * 34.0);
  float2 d2 = uv - float2(0.44, 0.5);
  col += 0.12 * exp(-dot(d2, d2) * 16.0);

  float a = 1.0 - smoothstep(0.985, 1.0, r);
  return half4(half3(clamp(col, 0.0, 1.0) * a), half(a));
}
`;
