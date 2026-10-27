import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import type { DeviTextures } from "@/components/experience/deviTextures";
import { extractFace, lerp, smoothStep } from "@/components/experience/cartonScene";
import {
  BOX_DEPTH,
  BOX_HEIGHT,
  BOX_WIDTH,
  CLOSED_DEVI_POSE,
  CUP_BOTTOM_RADIUS,
  CUP_COUNT,
  CUP_HEIGHT,
  CUP_TOP_RADIUS,
  LIT_CUPS,
  PLATE,
  SHRINE_POSITION,
  SHRINE_SCALE,
  TRAY_TRAVEL,
  TRAY_WALL,
  asideTransform,
  createPlateLayout,
  createTrayLayout,
  resolveCupPose,
  trayOffset,
  type DeviPose,
} from "@/components/experience/deviScene";
import { HomeTemple } from "@/components/experience/HomeTemple";
import { FragranceSmoke, type SmokeSource } from "@/components/experience/FragranceSmoke";

gsap.registerPlugin(ScrollTrigger);

type DeviBoxProps = {
  textures: DeviTextures;
  trackRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
};

function paperMaterial(map: THREE.Texture) {
  return new THREE.MeshStandardMaterial({
    map,
    color: "#ffffff",
    roughness: 0.9,
    metalness: 0,
    toneMapped: false,
  });
}

function PanelMesh({
  geometry,
  material,
  interior,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  interior: THREE.Material;
}) {
  return (
    <>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      <mesh geometry={geometry} material={interior} />
    </>
  );
}

/** Final exploded positions. Every printed side ends up facing the viewer, around the tray of cups. */
const EXPLODE = {
  front: { x: -1.45, pull: 0.45, turn: 0.22 },
  back: { x: 1.5, pull: 0.9, z: -0.1, turn: Math.PI - 0.22 },
  bands: { x: 0.8, y: BOX_HEIGHT / 2 + 0.35, z: 0.15, tilt: 1.1, pull: 0.95 },
};

/**
 * Printed sleeve. The open ends show the tray, as on the real sleeve.
 * Exploded, each panel first pulls straight off the box, then moves to its place so it never cuts through the tray.
 */
function Sleeve({ textures, pose }: { textures: DeviTextures; pose: RefObject<DeviPose> }) {
  const front = useRef<THREE.Group>(null);
  const back = useRef<THREE.Group>(null);
  const top = useRef<THREE.Group>(null);
  const bottom = useRef<THREE.Group>(null);

  const faces = useMemo(() => {
    const box = new THREE.BoxGeometry(BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH);
    const next = {
      top: extractFace(box, 2),
      bottom: extractFace(box, 3),
      front: extractFace(box, 4),
      back: extractFace(box, 5),
    };
    box.dispose();
    return next;
  }, []);

  const materials = useMemo(
    () => ({
      front: paperMaterial(textures.front),
      back: paperMaterial(textures.back),
      top: paperMaterial(textures.top),
      bottom: paperMaterial(textures.bottom),
      interior: new THREE.MeshStandardMaterial({
        color: "#3d1416",
        roughness: 0.95,
        metalness: 0,
        side: THREE.BackSide,
        toneMapped: false,
      }),
    }),
    [textures],
  );

  useEffect(() => {
    const geometries = Object.values(faces);
    const mats = Object.values(materials);
    return () => {
      geometries.forEach((geometry) => geometry.dispose());
      mats.forEach((material) => material.dispose());
    };
  }, [faces, materials]);

  useFrame(() => {
    const open = pose.current.open;
    const pull = smoothStep(open / 0.45);
    const move = smoothStep((open - 0.25) / 0.75);
    const { front: f, back: b, bands } = EXPLODE;

    if (front.current) {
      front.current.position.set(f.x * move, 0, BOX_DEPTH / 2 + f.pull * pull);
      front.current.rotation.set(0, f.turn * move, 0);
    }
    if (back.current) {
      const across = smoothStep((open - 0.2) / 0.5);
      const swing = smoothStep((open - 0.45) / 0.55);
      const settle = smoothStep((open - 0.6) / 0.4);
      back.current.position.set(b.x * across, 0, lerp(-BOX_DEPTH / 2 - b.pull * pull, b.z, settle));
      back.current.rotation.set(0, b.turn * swing, 0);
    }
    if (top.current) {
      top.current.position.set(
        -bands.x * move,
        lerp(BOX_HEIGHT / 2, bands.y, pull),
        bands.z * move,
      );
      top.current.rotation.set(bands.tilt * move, 0, 0);
    }
    if (bottom.current) {
      const rise = smoothStep((open - 0.25) / 0.5);
      const settle = smoothStep((open - 0.65) / 0.35);
      bottom.current.position.set(
        bands.x * rise,
        lerp(-BOX_HEIGHT / 2, bands.y, rise),
        lerp(bands.pull * pull, bands.z, settle),
      );
      bottom.current.rotation.set(-(Math.PI - bands.tilt) * rise, 0, 0);
    }
  });

  return (
    <group>
      <group ref={front} position={[0, 0, BOX_DEPTH / 2]}>
        <group position={[0, 0, -BOX_DEPTH / 2]}>
          <PanelMesh geometry={faces.front} material={materials.front} interior={materials.interior} />
        </group>
      </group>
      <group ref={back} position={[0, 0, -BOX_DEPTH / 2]}>
        <group position={[0, 0, BOX_DEPTH / 2]}>
          <PanelMesh geometry={faces.back} material={materials.back} interior={materials.interior} />
        </group>
      </group>
      <group ref={top} position={[0, BOX_HEIGHT / 2, 0]}>
        <group position={[0, -BOX_HEIGHT / 2, 0]}>
          <PanelMesh geometry={faces.top} material={materials.top} interior={materials.interior} />
        </group>
      </group>
      <group ref={bottom} position={[0, -BOX_HEIGHT / 2, 0]}>
        <group position={[0, BOX_HEIGHT / 2, 0]}>
          <PanelMesh geometry={faces.bottom} material={materials.bottom} interior={materials.interior} />
        </group>
      </group>
    </group>
  );
}

/** Unprinted inner tray, open toward the front panel. It slides out of the sleeve's open end. */
function Tray({ board, pose }: { board: string; pose: RefObject<DeviPose> }) {
  const group = useRef<THREE.Group>(null);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: board, roughness: 0.92, metalness: 0, toneMapped: false }),
    [board],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    if (group.current) group.current.position.x = trayOffset(pose.current);
  });

  const width = BOX_WIDTH - 0.008;
  const height = BOX_HEIGHT - 0.008;
  const depth = BOX_DEPTH - 0.008;
  return (
    <group ref={group}>
      <mesh position={[0, 0, -depth / 2 + TRAY_WALL / 2]} material={material} castShadow receiveShadow>
        <boxGeometry args={[width, height, TRAY_WALL]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`end${side}`} position={[side * (width / 2 - TRAY_WALL / 2), 0, 0]} material={material} castShadow receiveShadow>
          <boxGeometry args={[TRAY_WALL, height, depth]} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`edge${side}`} position={[0, side * (height / 2 - TRAY_WALL / 2), 0]} material={material} castShadow receiveShadow>
          <boxGeometry args={[width, TRAY_WALL, depth]} />
        </mesh>
      ))}
    </group>
  );
}

const plateLayout = createPlateLayout();

function DhoopCups({ textures, pose }: { textures: DeviTextures; pose: RefObject<DeviPose> }) {
  const group = useRef<THREE.Group>(null);
  const layout = useMemo(() => createTrayLayout(), []);

  const assets = useMemo(() => {
    const body = new THREE.CylinderGeometry(CUP_TOP_RADIUS, CUP_BOTTOM_RADIUS, CUP_HEIGHT, 32);
    const top = new THREE.CircleGeometry(CUP_TOP_RADIUS * 0.93, 32);
    top.rotateX(-Math.PI / 2);
    const flame = new THREE.SphereGeometry(1, 14, 10);
    return {
      body,
      top,
      flame,
      charcoal: new THREE.MeshStandardMaterial({ color: "#2e2a28", roughness: 1, metalness: 0, toneMapped: false }),
      granules: new THREE.MeshStandardMaterial({
        map: textures.granules,
        roughness: 0.95,
        metalness: 0,
        toneMapped: false,
      }),
      ember: new THREE.MeshBasicMaterial({
        map: textures.granules,
        color: "#ff7a2a",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
      flameOuter: new THREE.MeshBasicMaterial({
        color: "#ffa640",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
      flameInner: new THREE.MeshBasicMaterial({
        color: "#fff0c4",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    };
  }, [textures]);

  useEffect(() => {
    return () => {
      Object.values(assets).forEach((asset) => asset.dispose());
    };
  }, [assets]);

  useFrame((state) => {
    const root = group.current;
    if (!root) return;
    const burn = smoothStep(pose.current.burn);
    const settle = 1 - smoothStep(pose.current.smoke) * 0.3;
    assets.ember.opacity = burn * 0.45;
    assets.flameOuter.opacity = burn * 0.75 * settle;
    assets.flameInner.opacity = burn * 0.9 * settle;
    const time = state.clock.elapsedTime;

    layout.forEach((cup, index) => {
      const node = root.children[index];
      if (!node) return;
      const order = LIT_CUPS.indexOf(index);
      const placed = resolveCupPose(cup, order >= 0 ? plateLayout[order] : null, pose.current, order, LIT_CUPS.length);
      node.position.set(placed.x, placed.y, placed.z);
      node.rotation.set(placed.rx, placed.ry, placed.rz);
      node.scale.setScalar(placed.scale);
      if (order < 0) return;
      const flicker = 1 + Math.sin(time * 13 + index * 2.1) * 0.08 + Math.sin(time * 7.3 + index) * 0.06;
      const outer = node.children[3];
      const inner = node.children[4];
      outer.visible = burn > 0.01;
      inner.visible = burn > 0.01;
      outer.scale.set(0.026, 0.07 * flicker * burn + 0.001, 0.026);
      inner.scale.set(0.012, 0.04 * flicker * burn + 0.001, 0.012);
    });
  });

  return (
    <group ref={group}>
      {layout.map((_, index) => {
        const lit = LIT_CUPS.includes(index);
        return (
          <group key={index}>
            <mesh geometry={assets.body} material={assets.charcoal} castShadow receiveShadow />
            <mesh geometry={assets.top} material={assets.granules} position={[0, CUP_HEIGHT / 2 + 0.002, 0]} />
            {lit ? (
              <>
                <mesh geometry={assets.top} material={assets.ember} position={[0, CUP_HEIGHT / 2 + 0.004, 0]} />
                <mesh geometry={assets.flame} material={assets.flameOuter} position={[0, CUP_HEIGHT / 2 + 0.06, 0]} visible={false} />
                <mesh geometry={assets.flame} material={assets.flameInner} position={[0, CUP_HEIGHT / 2 + 0.04, 0]} visible={false} />
              </>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

const cupLayout = createTrayLayout();
const smokeEuler = new THREE.Euler();
const smokeOffset = new THREE.Vector3();

/** Sambrani smoke is dense, so each lit cup feeds two ribbons. */
const RIBBONS_PER_CUP = 2;

function CupSmoke({ pose }: { pose: RefObject<DeviPose> }) {
  const locate = useCallback(
    (index: number, source: SmokeSource) => {
      const order = index % LIT_CUPS.length;
      const strand = Math.floor(index / LIT_CUPS.length);
      const placed = resolveCupPose(cupLayout[LIT_CUPS[order]], plateLayout[order], pose.current, order, LIT_CUPS.length);
      smokeEuler.set(placed.rx, placed.ry, placed.rz);
      smokeOffset.set((strand - 0.5) * 0.04, (CUP_HEIGHT / 2 + 0.09) * placed.scale, 0).applyEuler(smokeEuler);
      source.position.set(placed.x, placed.y, placed.z).add(smokeOffset);
      source.yaw = order * 1.1 + strand * 1.6;
      source.tilt = 0;
    },
    [pose],
  );
  return (
    <FragranceSmoke
      pose={pose}
      count={LIT_CUPS.length * RIBBONS_PER_CUP}
      locate={locate}
      width={0.11}
      height={0.85}
      color="#9d9497"
    />
  );
}

/** Distance at which a centred width x height box fills the view. */
function fitDistance(camera: THREE.PerspectiveCamera, width: number, height: number) {
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  return Math.max(height / 2 / tanHalf, width / 2 / (tanHalf * camera.aspect));
}

function Studio({ textures, pose }: { textures: DeviTextures; pose: RefObject<DeviPose> }) {
  const { camera, gl } = useThree();
  const boxAnchor = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);

  const controls = useMemo(() => {
    const next = new OrbitControls(camera, gl.domElement);
    next.enablePan = false;
    next.enableZoom = false;
    next.enableDamping = true;
    next.dampingFactor = 0.08;
    next.target.set(0, 0, 0);
    next.minDistance = 2.4;
    next.maxDistance = 9;
    next.autoRotate = false;
    return next;
  }, [camera, gl]);

  useFrame(() => {
    const aside = asideTransform(pose.current.aside);
    if (boxAnchor.current) {
      boxAnchor.current.position.set(aside.x, aside.y, aside.z);
      boxAnchor.current.scale.setScalar(aside.scale);
    }
    if (glow.current) glow.current.intensity = smoothStep(pose.current.burn) * 0.18;

    const lens = camera as THREE.PerspectiveCamera;
    const openT = smoothStep(pose.current.open);
    const slideT = smoothStep(pose.current.slide);
    const temple = Math.max(smoothStep(pose.current.aside), smoothStep(pose.current.shrine));
    let distance = lerp(fitDistance(lens, 2.0, 1.7), fitDistance(lens, 5.3, 2.3), openT);
    distance = lerp(distance, fitDistance(lens, BOX_WIDTH + TRAY_TRAVEL + 0.8, 1.9), slideT);
    distance = lerp(distance, fitDistance(lens, 4.0, 2.4), temple);
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(distance);
    controls.target.set(
      lerp(openT * 0.12 + (slideT * TRAY_TRAVEL) / 2, -0.31, temple),
      lerp(openT * 0.2, 0.06, temple),
      0,
    );
    camera.position.copy(controls.target).add(offset);
    controls.update();
  });

  useEffect(() => {
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    [textures.front, textures.back, textures.top, textures.bottom].forEach((texture) => {
      texture.anisotropy = anisotropy;
      texture.needsUpdate = true;
    });
  }, [gl, textures]);

  useEffect(() => {
    gl.domElement.style.touchAction = "pan-y";
    return () => controls.dispose();
  }, [controls, gl]);

  const plateY = SHRINE_POSITION.y + PLATE.top * SHRINE_SCALE;
  const plateZ = SHRINE_POSITION.z + PLATE.z * SHRINE_SCALE;

  return (
    <>
      <hemisphereLight args={["#f7f4ef", "#d9d3cb", 0.82]} />
      <ambientLight intensity={0.38} />
      <directionalLight
        position={[0.55, 6.4, 1.6]}
        intensity={0.48}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00025}
        shadow-normalBias={0.02}
        shadow-radius={8}
        shadow-camera-near={2}
        shadow-camera-far={12}
        shadow-camera-left={-2.6}
        shadow-camera-right={2.6}
        shadow-camera-top={1.8}
        shadow-camera-bottom={-1.8}
      />
      <directionalLight position={[-1.1, 2.4, 2.2]} intensity={0.16} />
      <group ref={boxAnchor}>
        <Sleeve textures={textures} pose={pose} />
        <Tray board={textures.board} pose={pose} />
      </group>
      <DhoopCups textures={textures} pose={pose} />
      <HomeTemple pose={pose} position={SHRINE_POSITION} scale={SHRINE_SCALE} plate={PLATE} />
      <CupSmoke pose={pose} />
      <pointLight
        ref={glow}
        position={[SHRINE_POSITION.x, plateY + 0.18, plateZ + 0.12]}
        color="#ffb066"
        distance={1.4}
        decay={2}
        intensity={0}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BOX_HEIGHT / 2 - 0.005, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <shadowMaterial args={[{ opacity: 0.16, transparent: true }]} />
      </mesh>
    </>
  );
}

export function DeviBox({ textures, trackRef, reducedMotion }: DeviBoxProps) {
  const pose = useRef<DeviPose>({ ...CLOSED_DEVI_POSE });

  useEffect(() => {
    const state = pose.current;
    Object.assign(state, CLOSED_DEVI_POSE);

    const trigger = trackRef.current;
    if (reducedMotion || !trigger) return;

    const context = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
        })
        .to(state, { open: 1, duration: 1.2 })
        .to(state, { open: 1, duration: 0.4 })
        .to(state, { open: 0, duration: 1 })
        .to(state, { slide: 1, duration: 1.6, ease: "power1.inOut" }, "-=0.25")
        .addLabel("temple", "-=0.15")
        .to(state, { aside: 1, duration: 1.4 }, "temple")
        .to(state, { shrine: 1, duration: 1 }, "temple+=0.9")
        .to(state, { place: 1, duration: 1.6 }, "temple+=1.1")
        .to(state, { burn: 1, duration: 0.7 })
        .to(state, { smoke: 1, duration: 1.2 }, "-=0.3")
        .to(state, { smoke: 1, duration: 1 });
    }, trigger);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      window.clearTimeout(refresh);
      context.revert();
      Object.assign(state, CLOSED_DEVI_POSE);
    };
  }, [reducedMotion, trackRef]);

  return (
    <Canvas
      shadows
      dpr={[1.5, 2]}
      camera={{ position: [1.45, 1.25, 3.9], fov: 30, near: 0.05, far: 40 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onCreated={({ gl: renderer }) => {
        renderer.setClearColor("#f3f0eb");
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <Studio textures={textures} pose={pose} />
    </Canvas>
  );
}
