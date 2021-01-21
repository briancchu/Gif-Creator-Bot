uniform float time;

varying vec3 v_position;

float trianglewave(float x, float amplitude, float frequency) {
  return abs(mod(4.0 * x * amplitude * frequency, amplitude * 4.0) - amplitude * 2.0) - amplitude;
}

void main() {
  vec3 t_position = position + vec3(0.0, 1.0, 0.0) * trianglewave(position.x + time, 2.0, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(t_position, 1.0);
  v_position = position;
}
