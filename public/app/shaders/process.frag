varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform int width;
uniform int height;

vec3 rgb2hls(vec3 colour);

void main() {
  vec3 original = texture2D(tDiffuse, vUv).rgb;

  float tdx = 1.0 / float(width);
  float tdy = 1.0 / float(height);

  vec2 rDir = vec2(0, 0);
  vec2 gDir = vec2(0, 0);
  vec2 bDir = vec2(0, 0);

  vec2 total = vec2(0, 0);

  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      vec2 neighbor = vUv + vec2(float(dx) * tdx, float(dy) * tdy);
      vec3 neighborColor = texture2D(tDiffuse, neighbor).rgb;

      vec3 delta = neighborColor - original;
      vec2 dir = normalize(vec2(dx, dy));

      total = total + dir * delta.r + dir * delta.g + dir * delta.b;
    }
  }

  vec3 color = vec3(total, 0);

//  if (vUv.y > 0.5) {
//    color = original;
//  }

  gl_FragColor = vec4(color, 1);
}
