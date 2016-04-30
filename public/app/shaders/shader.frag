#define M_PI 3.1415926535897932384626433832795
#define M_SQRT2 1.41421356237309504880

varying vec2 vUv;
uniform sampler2D image;
uniform int width;
uniform int height;

/**
 * @brief Converts a colour in RGB to HSL
 *
 * @param colour a vec3 containing the RGB value
 * @return     a vec3 containing the HLS value
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
  // Number of pixels to use on the line
  const int lineSize = 150;

  // Number of pixels to jump out for the gradient
  const int jumpSize = 10;

  // Make our cardinal directions vector
  mat3 directions[3];
  directions[0][0] = vec3(-M_SQRT2,  -M_SQRT2, 0.0); // - -
  directions[0][1] = vec3(  -1.0,   0.0  , 0.0); // - 0
  directions[0][2] = vec3(-M_SQRT2,   M_SQRT2, 0.0); // - +
  directions[1][0] = vec3(   0.0,  -1.0  , 0.0); // 0 -
  directions[1][1] = vec3(   0.0,   0.0  , 0.0);
  directions[1][2] = vec3(   0.0,   1.0  , 0.0); // 0 +
  directions[2][0] = vec3( M_SQRT2,  -M_SQRT2, 0.0); // + -
  directions[2][1] = vec3(   1.0,   0.0  , 0.0); // + 0
  directions[2][2] = vec3( M_SQRT2,   M_SQRT2, 0.0); // + +

  // 1 pixel of movement up/down left/right
  float ns = 1.0 / float(height);
  float ew = 1.0 / float(width);

  // Get our centre pixel location (every lineSize pixels)
  vec2 c = vec2(vUv.x - mod(vUv.x, float(lineSize) * ew) + ((ew * float(lineSize)) / 2.0)
        , vUv.y - mod(vUv.y, float(lineSize) * ns) + ((ns * float(lineSize)) / 2.0));

  vec4 realColour = texture2D(image, vUv);

  // Get our surrounding pixel values
  mat3 pixels[3];
  for (int x = -1; x < 2; ++x) {
    for (int y = -1; y < 2; ++y) {
      pixels[1 + x][1 + y] = texture2D(image, vec2(c.x + float(x) * ew * float(jumpSize), c.y + float(y) * ns * float(jumpSize))).rgb;
    }
  }

  // Calculate our colour deltas for each pixel
  mat3 rgbDeltas[3];
  mat3 hlsDeltas[3];
  mat3 glsDeltas[3];
  for (int x = -1; x < 2; ++x) {
    for (int y = -1; y < 2; ++y) {

      // Our centre pixel in RGB, HLS and GLS
      vec3 rgbC = pixels[1][1];
      vec3 hlsC = rgb2hls(rgbC);
      vec3 glsC = rgb2hls(vec3(1.0 - rgbC.r, rgbC.g, 1.0 - rgbC.b));

      // Our side pixel in rgb hls and gls
      vec3 rgbS = pixels[1 + x][1 + y];
      vec3 hlsS = rgb2hls(rgbS);
      vec3 glsS = rgb2hls(vec3(1.0 - rgbS.r, rgbS.g, 1.0 - rgbS.b));

      // Difference between the two values values
      rgbDeltas[1 + x][1 + y] = rgbS - rgbC;
      hlsDeltas[1 + x][1 + y] = hlsS - hlsC;
      glsDeltas[1 + x][1 + y] = glsS - glsC;

      // Mod by 1 to correct rotation on hue components
      // hlsDeltas[1 + x][1 + y].x = mod(hlsDeltas[x + 1][y + 1].x, 1.0);
      // glsDeltas[1 + x][1 + y].x = mod(hlsDeltas[x + 1][y + 1].x, 1.0);
    }
  }

  // Vectors to store the direction values
  mat3 rgbDir = mat3(0,0,0,0,0,0,0,0,0);
  mat3 hlsDir = mat3(0,0,0,0,0,0,0,0,0);
  mat3 glsDir = mat3(0,0,0,0,0,0,0,0,0);

  // Get our difference values for each pixel and add it into the vector
  for (int x = 0; x < 2; ++x) {
    for (int y = 0; y < 2; ++y) {

      // rgb directions
      rgbDir[0].xy = rgbDir[0].xy + (rgbDeltas[1 + x][1 + y].r * directions[1 + x][1 + y].xy);
      rgbDir[1].xy = rgbDir[1].xy + (rgbDeltas[1 + x][1 + y].g * directions[1 + x][1 + y].xy);
      rgbDir[2].xy = rgbDir[2].xy + (rgbDeltas[1 + x][1 + y].b * directions[1 + x][1 + y].xy);

      rgbDir[0].xy = rgbDir[0].xy + (rgbDeltas[1 - x][1 - y].r * directions[1 - x][1 - y].xy);
      rgbDir[1].xy = rgbDir[1].xy + (rgbDeltas[1 - x][1 - y].g * directions[1 - x][1 - y].xy);
      rgbDir[2].xy = rgbDir[2].xy + (rgbDeltas[1 - x][1 - y].b * directions[1 - x][1 - y].xy);

      // hls directions
      hlsDir[0].xy = hlsDir[0].xy + (hlsDeltas[1 + x][1 + y].r * directions[1 + x][1 + y].xy);
      hlsDir[1].xy = hlsDir[1].xy + (hlsDeltas[1 + x][1 + y].g * directions[1 + x][1 + y].xy);
      hlsDir[2].xy = hlsDir[2].xy + (hlsDeltas[1 + x][1 + y].b * directions[1 + x][1 + y].xy);

      hlsDir[0].xy = hlsDir[0].xy + (hlsDeltas[1 - x][1 - y].r * directions[1 - x][1 - y].xy);
      hlsDir[1].xy = hlsDir[1].xy + (hlsDeltas[1 - x][1 - y].g * directions[1 - x][1 - y].xy);
      hlsDir[2].xy = hlsDir[2].xy + (hlsDeltas[1 - x][1 - y].b * directions[1 - x][1 - y].xy);

      // gls directions
      glsDir[0].xy = glsDir[0].xy + (glsDeltas[1 + x][1 + y].r * directions[1 + x][1 + y].xy);
      glsDir[1].xy = glsDir[1].xy + (glsDeltas[1 + x][1 + y].g * directions[1 + x][1 + y].xy);
      glsDir[2].xy = glsDir[2].xy + (glsDeltas[1 + x][1 + y].b * directions[1 + x][1 + y].xy);

      glsDir[0].xy = glsDir[0].xy + (glsDeltas[1 - x][1 - y].r * directions[1 - x][1 - y].xy);
      glsDir[1].xy = glsDir[1].xy + (glsDeltas[1 - x][1 - y].g * directions[1 - x][1 - y].xy);
      glsDir[2].xy = glsDir[2].xy + (glsDeltas[1 - x][1 - y].b * directions[1 - x][1 - y].xy);
    }
  }

  // Now that we know our line direction shade our pixel based on how close we are to it
  vec2 point = vUv - c;
  vec2 line1 = hlsDir[0].xy;

  // This value is an indication of how close to "perfect" our shape is
  float value = cross(hlsDir[1], hlsDir[0]).z;

  // Get the distance to the point from this line and the distance along it (direction)
  float d2p = 1.0 - abs(dot(point, normalize(vec2(-line1.y, line1.x))) / (float(lineSize) * ew));
  float d2t = (dot(normalize(point), normalize(line1)) + 1.0) / 2.0;

  float r = d2p * d2p * d2p;// * sqrt(sqrt(d2t)) ;//* d2t;
  r = r > 0.7 ? 1.0 : 0.0;



  // float g = dot(point, (glsDir[1].xy / 8.0)) / (float(lineSize) * ew);
  // float b = dot(point, (glsDir[2].xy / 8.0)) / (float(lineSize) * ew);

  // r = 0.0;
  // b = 0.0;

  // value = value > 0.5 ? 1.0 : 0.0;

  vec3 colour = (realColour.rgb * (1.0 - r)) + vec3(r,r,r);
  // colour = (realColour * value);

  float range = 1.0 + 2.0 * M_SQRT2;
  // colour = (hlsDeltas[2][0].rrr + 1.0) / 2.0;
  // colour = rgb2hls(realColour.rgb).rrr;

  gl_FragColor = vec4(colour, 1.0);

  if (realColour.a == 0.0) {
    gl_FragColor = vec4(0,0,0,1);
  }
//  gl_FragColor = realColour;
}
