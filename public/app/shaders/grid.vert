uniform sampler2D tDiffuse;
//varying vec2 vUv;
varying vec4 vColor;

void main() {
//  vUv = uv;
  vec2 dir = texture2D(tDiffuse, position.xy).xy;

  vec2 pos = position.xy - 0.5;

  bool start = bool(position.z == 0.0);

  if (start) {
    pos = pos + dir;
  }

  vColor = start ? vec4(1, 1, 1, 1) : vec4(0, 0, 0, 1);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0, 1);
}
