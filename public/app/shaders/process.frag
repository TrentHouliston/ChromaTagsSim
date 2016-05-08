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

vec3 convertColour(vec3 inColour) {
  return rgb2hls(inColour);
  // return rgb2hls(vec3(1.0 - inColour.r, inColour.g, 1.0 - inColour.b));
}

void main() {
  vec3 original = texture2D(tDiffuse, vUv).rgb;
  original = convertColour(original);
  
  float pixelJump = 5.0;

  float tdx = pixelJump / float(width);
  float tdy = pixelJump / float(height);

  vec2 hDir = vec2(0, 0);
  vec2 lDir = vec2(0, 0);
  vec2 sDir = vec2(0, 0);
  bool valid = true;

  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      
      // Distance to the neigboring pixels we are checking
      vec2 neighborOffset = vec2(float(dx) * tdx, float(dy) * tdy);
      
      // Look at neighbours on either side
      vec2 neighbor = vUv + neighborOffset;
      
      // Get the colours of our neighbours
      vec3 neighborColor = texture2D(tDiffuse, neighbor).rgb;

      // Convert colours to hls
      neighborColor = convertColour(neighborColor);

      // Get the difference between the two colours
      vec3 delta = neighborColor - original;
      
      // Normalise the angles
      delta.x = mod(delta.x, 0.5);
      
      // Get a unit vector for the direction
      vec2 dir = normalize(vec2(dx, dy));

      hDir = hDir + dir * delta.r;
      lDir = lDir + dir * delta.g;
    }
  }
  
  // z component cross product identifies the valid regions
  float v = cross(vec3(lDir, 0), vec3(hDir, 0)).z;
  
  vec3 color = vec3((lDir + 1.0) / 2.0, 0);
  color = vec3(v,v,v);
  gl_FragColor = vec4(color, 1);
}
