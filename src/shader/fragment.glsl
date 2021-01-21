uniform float time;

varying vec3 v_position;

void main() {
  gl_FragColor = vec4(1.0, v_position.y / 10.0 + 0.5, 0.0, 1.0);
}
