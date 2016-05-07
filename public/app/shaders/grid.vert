uniform sampler2D tDiffuse;
uniform int numLines;
//varying vec2 vUv;
varying vec4 vColor;

void main() {
//  vUv = uv;
  vec2 dir = texture2D(tDiffuse, position.xy).xy * 2.0 - 1.0;
  dir = normalize(dir);
  dir = dir / float(numLines);

  vec2 pos = position.xy - 0.5;

  bool start = bool(position.z == 0.0);

  if (!start) {
    pos = pos + dir;
  }

  vColor = start ? vec4(1, 1, 1, 1) : vec4(0, 0, 0, 1);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0, 1);
}
