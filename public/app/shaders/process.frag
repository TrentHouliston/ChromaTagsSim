varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform int width;
uniform int height;

/**
 * @brief Converts a colour in RGB to HSL
 *
 * @param colour a vec3 containing the RGB value
 * @return       a vec3 containing the HLS value
 */
vec3 rgb2hls(vec3 colour) {
  float maxc = max(max(colour.r, colour.g), colour.b);
  float minc = min(min(colour.r, colour.g), colour.b);

  float h = 0.0;
  float l = (minc + maxc) / 2.0;
  float s = 0.0;

  if (minc == maxc)
    return vec3(h, l, s);

  if (l <= 0.5)
    s = (maxc - minc) / (maxc + minc);
  else
    s = (maxc - minc) / (2.0 - maxc - minc);

  float rc = (maxc - colour.r) / (maxc - minc);
  float gc = (maxc - colour.g) / (maxc - minc);
  float bc = (maxc - colour.b) / (maxc - minc);

  if (colour.r == maxc)
    h = bc - gc;
  else if (colour.g == maxc)
    h = 2.0 + rc - bc;
  else
    h = 4.0 + gc - rc;

  h = mod(h / 6.0, 1.0);

  return vec3(h, l, s);
}

void main() {
  vec3 original = texture2D(tDiffuse, vUv).rgb;
  
  original = rgb2hls(original);
  float pixelJump = 5.0;

  float tdx = pixelJump / float(width);
  float tdy = pixelJump / float(height);

  vec2 total = vec2(0, 0);

  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      vec2 neighbor = vUv + vec2(float(dx) * tdx, float(dy) * tdy);
      vec3 neighborColor = texture2D(tDiffuse, neighbor).rgb;
      neighborColor = rgb2hls(neighborColor);

      vec3 delta = neighborColor - original;
      vec2 dir = normalize(vec2(dx, dy));

      total = total + dir * delta.r;// + dir * delta.g + dir * delta.b;
    }
  }
  
  // The most a gradient can possibly be is 1.0
  total = (total + 1.0) / 2.0;

  vec3 color = vec3(total, 0);

//  if (vUv.y > 0.5) {
//    color = original;
//  }

  gl_FragColor = vec4(color, 1);
}
