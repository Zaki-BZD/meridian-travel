"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, useTexture } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Euler,
  type Group,
  type Mesh,
  type ShaderMaterial,
  Quaternion,
  Vector3,
} from "three";
import { DESTINATIONS, HOME, formatPrice, type Destination } from "@/data/destinations";
import { greatCircleArc, latLngToVector3 } from "@/lib/geo";
import {
  arcFragment,
  arcVertex,
  atmosphereFragment,
  atmosphereVertex,
  earthFragment,
  earthVertex,
} from "./shaders";

export type GlobeProps = {
  /** Start the arc animation (after the intro loader). */
  active: boolean;
  /** Render loop runs only while the hero is on screen. */
  inView: boolean;
  reduced: boolean;
  mobile: boolean;
  coarse: boolean;
  highlighted: string | null;
  onHighlight: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  onReady?: () => void;
};

// Light from the upper left, toward the headline. View space.
const SUN = new Vector3(-0.55, 0.45, 0.7).normalize();
const GOLD = new Color("#e9c27c");
const SAND = new Color("#f4efe6");

// Face Europe / Africa toward the camera on load, tilted to show the north.
const CENTER_LNG = 22;
const INITIAL_ROT_Y = Math.PI / 2 - ((CENTER_LNG + 180) * Math.PI) / 180;
const INITIAL_TILT = 0.38;

/** Rotation that makes a flat marker lie on the surface, facing outward. */
const surfaceQuaternion = (p: Vector3) => new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), p.clone().normalize());

const ARC_STAGGER = 0.16;
const ARC_DURATION = 1.25;
const GLOW = 0.22;

const arcUniforms = (index: number, reduced: boolean, intensity: number) => ({
  uDraw: { value: reduced ? 1 : 0 },
  uTime: { value: 0 },
  uOffset: { value: index * 0.17 },
  uPulse: { value: reduced ? 0 : 1 },
  uIntensity: { value: intensity },
  uColor: { value: GOLD },
});

export default function Globe(props: GlobeProps) {
  const { inView, mobile } = props;
  return (
    <Canvas
      flat
      frameloop={inView ? "always" : "never"}
      dpr={mobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, mobile ? 4.1 : 3.85], fov: 40, near: 0.1, far: 50 }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}

function Scene({ active, reduced, mobile, coarse, highlighted, onHighlight, onSelect, onReady }: GlobeProps) {
  const startAt = useRef<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = hovered ?? highlighted;

  useEffect(() => onReady?.(), [onReady]);

  // World-space direction of each pin, for swinging the camera round to it.
  const pinDirs = useMemo(
    () =>
      new Map(
        DESTINATIONS.map((d) => [
          d.slug,
          latLngToVector3(d.lat, d.lng, 1).applyEuler(new Euler(0, INITIAL_ROT_Y, 0)).applyEuler(new Euler(INITIAL_TILT, 0, 0)),
        ]),
      ),
    [],
  );
  const camTarget = useMemo(() => new Vector3(), []);

  useFrame(({ clock, camera }, delta) => {
    if (active && startAt.current === null) startAt.current = clock.elapsedTime;

    // Highlighted from the HTML list (not by hovering the pin itself): bring it into view.
    const dir = highlighted && !hovered ? pinDirs.get(highlighted) : undefined;
    if (dir) {
      const dist = camera.position.length();
      // keep a little elevation so far-south pins don't hit the polar clamp
      camTarget.copy(dir).setY(Math.max(-0.45, Math.min(0.6, dir.y))).normalize().multiplyScalar(dist);
      camera.position.lerp(camTarget, reduced ? 1 : 1 - Math.exp(-delta * 3.2)).setLength(dist);
    }
  });

  const setHover = (slug: string | null) => {
    setHovered(slug);
    onHighlight(slug);
    document.body.style.cursor = slug ? "pointer" : "";
  };

  return (
    <>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={!coarse}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.45}
        autoRotate={!reduced && !focus}
        autoRotateSpeed={0.35}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.72}
      />

      {!mobile && <Stars />}

      <group rotation={[INITIAL_TILT, 0, 0]}>
        <group rotation={[0, INITIAL_ROT_Y, 0]}>
          <Earth mobile={mobile} />
          <HomeMarker reduced={reduced} />
          {DESTINATIONS.map((d, i) => (
            <Route
              key={d.slug}
              destination={d}
              index={i}
              startAt={startAt}
              reduced={reduced}
              mobile={mobile}
              focused={focus === d.slug}
              dimmed={!!focus && focus !== d.slug}
              onHover={setHover}
              onSelect={onSelect}
            />
          ))}
        </group>
      </group>

      <Atmosphere />
    </>
  );
}

function Earth({ mobile }: { mobile: boolean }) {
  const [mask, lights] = useTexture([
    mobile ? "/textures/earth-mask-sm.jpg" : "/textures/earth-mask.jpg",
    "/textures/earth-lights.jpg",
  ]);
  const uniforms = useMemo(
    () => ({ uMask: { value: mask }, uLights: { value: lights }, uSun: { value: SUN } }),
    [mask, lights],
  );
  const seg = mobile ? 64 : 128;

  // Earth blocks pointer events so pins on the far side can't be hovered/clicked.
  const block = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();

  return (
    <mesh onPointerOver={block} onPointerMove={block} onClick={block}>
      <sphereGeometry args={[1, seg, seg / 2]} />
      <shaderMaterial vertexShader={earthVertex} fragmentShader={earthFragment} uniforms={uniforms} />
    </mesh>
  );
}

function Atmosphere() {
  const uniforms = useMemo(() => ({ uSun: { value: SUN } }), []);
  return (
    <mesh scale={1.16} raycast={() => null}>
      <sphereGeometry args={[1, 64, 32]} />
      <shaderMaterial
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        uniforms={uniforms}
        side={BackSide}
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function Stars() {
  const geometry = useMemo(() => {
    const count = 700;
    const pos = new Float32Array(count * 3);
    const v = new Vector3();
    // deterministic pseudo-random so renders are stable
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      v.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize().multiplyScalar(9 + rand() * 9);
      pos.set([v.x, v.y, v.z], i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geometry} raycast={() => null}>
      <pointsMaterial color="#cfd8e8" size={0.028} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}

function HomeMarker({ reduced }: { reduced: boolean }) {
  const pos = useMemo(() => latLngToVector3(HOME.lat, HOME.lng, 1.002), []);
  return (
    <group position={pos} quaternion={surfaceQuaternion(pos)}>
      <mesh raycast={() => null}>
        <circleGeometry args={[0.014, 24]} />
        <meshBasicMaterial color={SAND} />
      </mesh>
      <PulseRing color={SAND} reduced={reduced} delay={0} />
    </group>
  );
}

function PulseRing({ color, reduced, delay, scale = 1 }: { color: Color; reduced: boolean; delay: number; scale?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const mat = m.material as ShaderMaterial & { opacity: number };
    if (reduced) {
      m.scale.setScalar(1.6 * scale);
      mat.opacity = 0.35;
      return;
    }
    const t = (clock.elapsedTime * 0.7 + delay) % 1;
    m.scale.setScalar((1 + t * 2.6) * scale);
    mat.opacity = (1 - t) * 0.8;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0.001]} raycast={() => null}>
      <ringGeometry args={[0.016, 0.02, 40]} />
      <meshBasicMaterial color={color} transparent depthWrite={false} />
    </mesh>
  );
}

type RouteProps = {
  destination: Destination;
  index: number;
  startAt: React.RefObject<number | null>;
  reduced: boolean;
  mobile: boolean;
  focused: boolean;
  dimmed: boolean;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
};

function Route({ destination: d, index, startAt, reduced, mobile, focused, dimmed, onHover, onSelect }: RouteProps) {
  const pin = useMemo(() => latLngToVector3(d.lat, d.lng, 1.002), [d.lat, d.lng]);

  const { line, glow } = useMemo(() => {
    const home = latLngToVector3(HOME.lat, HOME.lng, 1);
    const curve = new CatmullRomCurve3(greatCircleArc(home, latLngToVector3(d.lat, d.lng, 1), 1.001, 64));
    const radial = mobile ? 4 : 6;
    return {
      line: { curve, radius: mobile ? 0.0045 : 0.0034, radial },
      glow: { curve, radius: mobile ? 0.011 : 0.009, radial },
    };
  }, [d.lat, d.lng, mobile]);

  const lineUniforms = useMemo(() => arcUniforms(index, reduced, 1), [index, reduced]);
  const glowUniforms = useMemo(() => arcUniforms(index, reduced, GLOW), [index, reduced]);
  const lineMat = useRef<ShaderMaterial>(null);
  const glowMat = useRef<ShaderMaterial>(null);

  const pinGroup = useRef<Group>(null);
  const shown = useRef(reduced ? 1 : 0);

  useFrame(({ clock }, delta) => {
    let draw = 1;
    if (!reduced) {
      const start = startAt.current;
      draw = start === null ? 0 : Math.min(1, Math.max(0, (clock.elapsedTime - start - index * ARC_STAGGER) / ARC_DURATION));
      draw = 1 - Math.pow(1 - draw, 3); // ease-out
    }
    const emphasis = focused ? 2.2 : dimmed ? 0.35 : 1;
    const k = Math.min(1, delta * 8);
    for (const [mat, base] of [
      [lineMat.current, 1],
      [glowMat.current, GLOW],
    ] as const) {
      if (!mat) continue;
      const u = mat.uniforms;
      u.uDraw.value = draw;
      u.uTime.value = clock.elapsedTime;
      // ease intensity toward the hover state
      u.uIntensity.value += (base * emphasis - u.uIntensity.value) * k;
    }

    // pin pops in as its arc lands
    const target = reduced ? 1 : draw > 0.92 ? 1 : 0;
    shown.current += (target - shown.current) * Math.min(1, delta * 10);
    const s = shown.current * (focused ? 1.5 : 1);
    pinGroup.current?.scale.setScalar(Math.max(s, 0.0001));
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(d.slug);
  };
  const out = () => onHover(null);
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(d.slug);
  };

  return (
    <group>
      <mesh raycast={() => null}>
        <tubeGeometry args={[line.curve, 96, line.radius, line.radial, false]} />
        <shaderMaterial
          vertexShader={arcVertex}
          fragmentShader={arcFragment}
          ref={lineMat}
          uniforms={lineUniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      {!mobile && (
        <mesh raycast={() => null}>
          <tubeGeometry args={[glow.curve, 96, glow.radius, glow.radial, false]} />
          <shaderMaterial
            vertexShader={arcVertex}
            fragmentShader={arcFragment}
            ref={glowMat}
            uniforms={glowUniforms}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      )}

      <group position={pin} quaternion={surfaceQuaternion(pin)}>
        <group ref={pinGroup}>
          <mesh raycast={() => null}>
            <circleGeometry args={[0.013, 24]} />
            <meshBasicMaterial color={GOLD} />
          </mesh>
          <PulseRing color={GOLD} reduced={reduced} delay={index * 0.21} />
        </group>
        {/* generous invisible hit area */}
        <mesh onPointerOver={over} onPointerOut={out} onClick={click}>
          <sphereGeometry args={[mobile ? 0.09 : 0.06, 12, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {focused && (
          <Html center position={[0, 0, 0.02]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div className="-translate-y-10 whitespace-nowrap rounded-full border border-gold-400/30 bg-navy-950/85 px-3.5 py-1.5 text-center shadow-lg backdrop-blur-sm">
              <span className="font-display text-sm text-sand">{d.name}</span>
              <span className="ml-2 text-[11px] tracking-wide text-gold-400">from {formatPrice(d.priceFrom)}</span>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
