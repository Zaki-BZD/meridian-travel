// Colors are written straight to the sRGB framebuffer (Canvas is `flat`, and
// these ShaderMaterials skip tone mapping), so values here are sRGB.

export const earthVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const earthFragment = /* glsl */ `
  uniform sampler2D uMask;    // white = water
  uniform sampler2D uLights;  // city lights (NASA Black Marble)
  uniform vec3 uSun;          // light direction, view space
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  const vec3 OCEAN_DEEP = vec3(0.030, 0.075, 0.160);
  const vec3 OCEAN_SHALLOW = vec3(0.060, 0.140, 0.270);
  const vec3 LAND = vec3(0.115, 0.180, 0.285);
  const vec3 GOLD = vec3(0.914, 0.761, 0.486);

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPos);

    float water = texture2D(uMask, vUv).r;
    float land = 1.0 - smoothstep(0.3, 0.7, water);
    float coast = 1.0 - smoothstep(0.0, 0.42, abs(water - 0.5));
    float lights = texture2D(uLights, vUv).r;

    float diff = max(dot(n, uSun), 0.0);
    float shade = 0.28 + 0.72 * smoothstep(-0.15, 0.9, dot(n, uSun));
    float facing = max(dot(n, v), 0.0);

    vec3 ocean = mix(OCEAN_DEEP, OCEAN_SHALLOW, pow(facing, 2.0));
    vec3 col = mix(ocean, LAND, land) * shade;

    // gold coastlines, brighter on the lit side
    col += GOLD * coast * (0.18 + 0.32 * diff);

    // city lights glow strongest on the night side
    float night = 1.0 - smoothstep(0.0, 0.45, diff);
    col += GOLD * pow(lights, 1.6) * land * (0.35 + 1.25 * night);

    // sun glint on the water
    vec3 r = reflect(-uSun, n);
    col += vec3(1.0, 0.86, 0.62) * pow(max(dot(r, v), 0.0), 80.0) * water * 0.16;

    // cool rim light
    float rim = pow(1.0 - facing, 3.0);
    col += vec3(0.32, 0.52, 0.92) * rim * 0.55;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragment = /* glsl */ `
  uniform vec3 uSun;
  varying vec3 vNormal;
  void main() {
    vec3 n = normalize(vNormal);
    float intensity = pow(clamp(0.66 - dot(n, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.2);
    float sunSide = clamp(dot(n, uSun) * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = mix(vec3(0.28, 0.50, 0.95), vec3(0.95, 0.76, 0.46), sunSide * 0.55);
    gl_FragColor = vec4(color * intensity * 1.6, intensity);
  }
`;

export const arcVertex = /* glsl */ `
  varying float vProgress;
  void main() {
    vProgress = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const arcFragment = /* glsl */ `
  uniform float uDraw;      // 0..1 how much of the arc is drawn
  uniform float uTime;
  uniform float uOffset;    // per-arc phase so pulses don't sync
  uniform float uPulse;     // 0 disables the travelling light (reduced motion)
  uniform float uIntensity;
  uniform vec3 uColor;
  varying float vProgress;

  void main() {
    if (vProgress > uDraw) discard;
    float drawing = step(uDraw, 0.999);
    float head = smoothstep(0.14, 0.0, uDraw - vProgress) * drawing;
    float t = fract(uTime * 0.22 + uOffset);
    float comet = smoothstep(0.09, 0.0, abs(vProgress - t)) * uPulse * (1.0 - drawing);
    float ends = smoothstep(0.0, 0.04, vProgress);
    float a = (0.42 + head * 1.6 + comet * 1.4) * ends * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;
