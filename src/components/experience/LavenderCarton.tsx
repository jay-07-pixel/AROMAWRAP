import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import type { CartonTextures } from "@/components/experience/cartonTextures";
import {
  CARTON_DEPTH,
  CARTON_HEIGHT,
  CARTON_WIDTH,
  CLOSED_POSE,
  STICK_COUNT,
  STICK_LENGTH,
  STICK_RADIUS,
  asideTransform,
  createHolderLayout,
  createStickLayout,
  extractFace,
  resolveStickPose,
  smoothStep,
  type CartonPose,
} from "@/components/experience/cartonScene";
import { HomeTemple } from "@/components/experience/HomeTemple";
import { FragranceSmoke, type SmokeSource } from "@/components/experience/FragranceSmoke";

gsap.registerPlugin(ScrollTrigger);

type LavenderCartonProps = {
  textures: CartonTextures;
  trackRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
};

function paperMaterial(map: THREE.Texture, transparent: boolean) {
  return new THREE.MeshStandardMaterial({
    map,
    color: "#ffffff",
    roughness: 0.9,
    metalness: 0,
    transparent,
    toneMapped: false,
  });
}

function useCartonFaces() {
  return useMemo(() => {
    const box = new THREE.BoxGeometry(CARTON_WIDTH, CARTON_HEIGHT, CARTON_DEPTH);
    const faces = {
      warning: extractFace(box, 0),
      social: extractFace(box, 1),
      top: extractFace(box, 2),
      bottom: extractFace(box, 3),
      front: extractFace(box, 4),
      back: extractFace(box, 5),
    };
    box.dispose();
    return faces;
  }, []);
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

function IncenseSticks({ pose }: { pose: RefObject<CartonPose> }) {
  const group = useRef<THREE.Group>(null);
  const layout = useMemo(() => createStickLayout(STICK_COUNT), []);
  const holders = useMemo(() => createHolderLayout(STICK_COUNT), []);
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(STICK_RADIUS, STICK_RADIUS, STICK_LENGTH, 8, 1),
    [],
  );
  const emberGeometry = useMemo(() => new THREE.SphereGeometry(1, 10, 8), []);
  const materials = useMemo(
    () =>
      layout.map(
        (stick) =>
          new THREE.MeshStandardMaterial({
            color: stick.color,
            roughness: 0.84,
            metalness: 0,
            toneMapped: false,
          }),
      ),
    [layout],
  );
  const emberMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffb15a",
        transparent: true,
        opacity: 0,
        toneMapped: false,
      }),
    [],
  );
  const haloMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffd7a1",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      emberGeometry.dispose();
      materials.forEach((material) => material.dispose());
      emberMaterial.dispose();
      haloMaterial.dispose();
    };
  }, [emberGeometry, emberMaterial, geometry, haloMaterial, materials]);

  useFrame(() => {
    const root = group.current;
    if (!root) return;
    root.visible = pose.current.sticks > 0.001 || pose.current.place > 0.001;
    const burn = smoothStep(pose.current.burn);
    emberMaterial.opacity = burn * 0.95;
    haloMaterial.opacity = burn * 0.28;
    layout.forEach((stick, index) => {
      const mesh = root.children[index] as THREE.Object3D;
      const placed = resolveStickPose(stick, holders[index], pose.current, index, layout.length);
      mesh.position.set(placed.x, placed.y, placed.z);
      mesh.rotation.set(placed.rx, placed.ry, placed.rz);
      mesh.scale.setScalar(placed.scale);
      const ember = mesh.children[1] as THREE.Object3D;
      const halo = mesh.children[2] as THREE.Object3D;
      const glow = (0.004 + burn * 0.016) / placed.scale;
      if (!ember || !halo) return;
      ember.scale.setScalar(glow);
      halo.scale.setScalar(glow * 2.4);
    });
  });

  return (
    <group ref={group}>
      {layout.map((stick, index) => (
        <group key={index}>
          <mesh geometry={geometry} material={materials[index]} castShadow />
          <mesh
            geometry={emberGeometry}
            material={emberMaterial}
            position={[0, STICK_LENGTH / 2, 0]}
          />
          <mesh
            geometry={emberGeometry}
            material={haloMaterial}
            position={[0, STICK_LENGTH / 2, 0]}
          />
        </group>
      ))}
    </group>
  );
}

const tipEuler = new THREE.Euler();
const tipOffset = new THREE.Vector3();

/** Smoke rises from each burning stick tip. */
function StickSmoke({ pose }: { pose: RefObject<CartonPose> }) {
  const layout = useMemo(() => createStickLayout(STICK_COUNT), []);
  const holders = useMemo(() => createHolderLayout(STICK_COUNT), []);
  const locate = useCallback(
    (index: number, source: SmokeSource) => {
      const placed = resolveStickPose(layout[index], holders[index], pose.current, index, layout.length);
      tipEuler.set(placed.rx, placed.ry, placed.rz);
      tipOffset.set(0, (STICK_LENGTH * placed.scale) / 2, 0).applyEuler(tipEuler);
      source.position.set(placed.x, placed.y, placed.z).add(tipOffset);
      source.yaw = placed.ry;
      source.tilt = placed.rz * 0.12;
    },
    [holders, layout, pose],
  );
  return <FragranceSmoke pose={pose} count={STICK_COUNT} locate={locate} />;
}

function ExplodedCarton({
  textures,
  pose,
}: {
  textures: CartonTextures;
  pose: RefObject<CartonPose>;
}) {
  const faces = useCartonFaces();
  const frontPivot = useRef<THREE.Group>(null);
  const backPivot = useRef<THREE.Group>(null);
  const warningSlide = useRef<THREE.Group>(null);
  const warningPivot = useRef<THREE.Group>(null);
  const socialSlide = useRef<THREE.Group>(null);
  const socialPivot = useRef<THREE.Group>(null);
  const topPivot = useRef<THREE.Group>(null);
  const bottomPivot = useRef<THREE.Group>(null);

  const materials = useMemo(
    () => ({
      front: paperMaterial(textures.front, false),
      back: paperMaterial(textures.back, false),
      warning: paperMaterial(textures.warning, false),
      social: paperMaterial(textures.social, false),
      top: paperMaterial(textures.top, true),
      bottom: paperMaterial(textures.bottom, true),
      interior: new THREE.MeshStandardMaterial({
        color: "#5c3f78",
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
    const open = smoothStep(pose.current.open);
    const flap = smoothStep(pose.current.flap);
    const frontTravel = open * 0.14;
    const sideTravel = open * 0.38;

    if (frontPivot.current) {
      frontPivot.current.position.set(0, 0, frontTravel);
      frontPivot.current.rotation.set(0, 0, 0);
    }
    if (backPivot.current) {
      backPivot.current.position.set(open * 0.26, open * 0.04, -open * 0.46);
      backPivot.current.rotation.set(0, open * 0.16, 0);
    }
    if (warningSlide.current) {
      warningSlide.current.position.set(sideTravel, 0, frontTravel * 0.2);
    }
    if (warningPivot.current) {
      warningPivot.current.rotation.set(0, -open * 1.2, 0);
    }
    if (socialSlide.current) {
      socialSlide.current.position.set(-sideTravel, 0, frontTravel * 0.2);
    }
    if (socialPivot.current) {
      socialPivot.current.rotation.set(0, open * 1.2, 0);
    }
    if (topPivot.current) {
      // Past vertical the lid leans toward the camera, leaving the opening clear for the sticks.
      topPivot.current.rotation.set(Math.max(open * 1.05, flap * 1.9), 0, 0);
    }
    if (bottomPivot.current) {
      bottomPivot.current.rotation.set(open * 1.05, 0, 0);
    }
  });

  return (
    <group>
      <group ref={frontPivot}>
        <PanelMesh geometry={faces.front} material={materials.front} interior={materials.interior} />
        <group ref={topPivot} position={[0, CARTON_HEIGHT / 2, CARTON_DEPTH / 2]}>
          <group position={[0, -CARTON_HEIGHT / 2, -CARTON_DEPTH / 2]}>
            <PanelMesh geometry={faces.top} material={materials.top} interior={materials.interior} />
          </group>
        </group>
      </group>
      <group ref={backPivot}>
        <PanelMesh geometry={faces.back} material={materials.back} interior={materials.interior} />
        <group position={[0, 0, -CARTON_DEPTH / 2 + 0.01]} rotation={[0, Math.PI, 0]}>
          <group position={[0, 0, CARTON_DEPTH / 2]}>
            <mesh geometry={faces.back} material={materials.back} />
          </group>
        </group>
        <group ref={bottomPivot} position={[0, -CARTON_HEIGHT / 2, -CARTON_DEPTH / 2]}>
          <group position={[0, CARTON_HEIGHT / 2, CARTON_DEPTH / 2]}>
            <PanelMesh geometry={faces.bottom} material={materials.bottom} interior={materials.interior} />
          </group>
        </group>
      </group>
      <group ref={warningSlide}>
        <group ref={warningPivot} position={[CARTON_WIDTH / 2, 0, CARTON_DEPTH / 2]}>
          <group position={[-CARTON_WIDTH / 2, 0, -CARTON_DEPTH / 2]}>
            <PanelMesh geometry={faces.warning} material={materials.warning} interior={materials.interior} />
          </group>
        </group>
      </group>
      <group ref={socialSlide}>
        <group ref={socialPivot} position={[-CARTON_WIDTH / 2, 0, CARTON_DEPTH / 2]}>
          <group position={[CARTON_WIDTH / 2, 0, -CARTON_DEPTH / 2]}>
            <PanelMesh geometry={faces.social} material={materials.social} interior={materials.interior} />
          </group>
        </group>
      </group>
    </group>
  );
}

function Studio({
  textures,
  pose,
}: {
  textures: CartonTextures;
  pose: RefObject<CartonPose>;
}) {
  const { camera, gl } = useThree();
  const cartonAnchor = useRef<THREE.Group>(null);

  const controls = useMemo(() => {
    const next = new OrbitControls(camera, gl.domElement);
    next.enablePan = false;
    next.enableZoom = false;
    next.enableDamping = true;
    next.dampingFactor = 0.08;
    next.target.set(0, 0, 0);
    next.minDistance = 2.4;
    next.maxDistance = 7.5;
    next.autoRotate = false;
    return next;
  }, [camera, gl]);

  useFrame(() => {
    const aside = asideTransform(pose.current.aside);
    if (cartonAnchor.current) {
      cartonAnchor.current.position.set(aside.x, aside.y, aside.z);
      cartonAnchor.current.scale.setScalar(aside.scale);
    }

    const openT = smoothStep(pose.current.open);
    const sticksT = smoothStep(pose.current.sticks);
    const asideT = smoothStep(pose.current.aside);
    const shrineT = smoothStep(pose.current.shrine);
    const temple = Math.max(asideT, shrineT);
    const flapT = smoothStep(pose.current.flap);
    const framed = Math.max(openT * 1.2, flapT * 0.7, sticksT * 1.75);
    const lifted = Math.max(openT * 0.22, flapT * 0.22, sticksT * 0.62);
    // Ease back while sticks are in the air, so the lifted sticks stay in frame.
    const place = pose.current.place;
    const flight = smoothStep(place / 0.3) * (1 - smoothStep((place - 0.6) / 0.4));
    const distance = 4.15 + framed * (1 - temple) + temple * 0.95 + flight * 1.0;
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(distance);
    controls.target.set(
      asideT * -0.1 + shrineT * 0.18,
      lifted * (1 - temple) + temple * 0.24 + flight * 0.45,
      0,
    );
    camera.position.copy(controls.target).add(offset);
    controls.update();
  });

  useEffect(() => {
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    [textures.front, textures.back, textures.warning, textures.social, textures.top, textures.bottom].forEach(
      (texture) => {
        texture.anisotropy = anisotropy;
        texture.needsUpdate = true;
      },
    );
  }, [gl, textures]);

  useEffect(() => {
    gl.domElement.style.touchAction = "pan-y";
    return () => controls.dispose();
  }, [controls, gl]);

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
        shadow-camera-left={-2.4}
        shadow-camera-right={2.4}
        shadow-camera-top={1.8}
        shadow-camera-bottom={-1.8}
      />
      <directionalLight position={[-1.1, 2.4, 2.2]} intensity={0.16} />
      <group ref={cartonAnchor}>
        <ExplodedCarton textures={textures} pose={pose} />
      </group>
      <IncenseSticks pose={pose} />
      <HomeTemple pose={pose} />
      <StickSmoke pose={pose} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -CARTON_HEIGHT / 2 - 0.02, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <shadowMaterial args={[{ opacity: 0.16, transparent: true }]} />
      </mesh>
    </>
  );
}

export function LavenderCarton({ textures, trackRef, reducedMotion }: LavenderCartonProps) {
  const pose = useRef<CartonPose>({ ...CLOSED_POSE });

  useEffect(() => {
    const state = pose.current;
    Object.assign(state, CLOSED_POSE);

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
        .to(state, { open: 1, duration: 0.5 })
        .to(state, { open: 0, duration: 1 })
        .to(state, { flap: 1, duration: 0.6 })
        .to(state, { sticks: 1, duration: 1.1 })
        .to(state, { sticks: 1, duration: 0.3 })
        .addLabel("temple")
        .to(state, { aside: 1, duration: 1.4 }, "temple")
        .to(state, { shrine: 1, duration: 1.2 }, "temple+=0.3")
        .to(state, { place: 1, duration: 1.6 }, "temple+=0.5")
        .to(state, { burn: 1, duration: 0.7 })
        .to(state, { smoke: 1, duration: 1.2 }, "-=0.3")
        .to(state, { smoke: 1, duration: 1 });
    }, trigger);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      window.clearTimeout(refresh);
      context.revert();
      Object.assign(state, CLOSED_POSE);
    };
  }, [reducedMotion, trackRef]);

  return (
    <Canvas
      shadows
      dpr={[1.5, 2]}
      camera={{ position: [0.72, 0.2, 4.15], fov: 30, near: 0.05, far: 40 }}
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
