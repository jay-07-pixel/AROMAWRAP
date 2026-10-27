import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RefObject } from "react";
import { SHRINE_POSITION, SHRINE_SCALE, smoothStep } from "@/components/experience/cartonScene";

type HomeTempleProps = {
  pose: RefObject<{ shrine: number }>;
  position?: { x: number; y: number; z: number };
  scale?: number;
  /** A flat brass plate for dhoop cups, in shrine space. Without it, the shrine holds a stick bowl. */
  plate?: { radius: number; top: number; z: number };
};

function woodMaterial(color: string) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.78,
    metalness: 0.02,
    transparent: true,
    opacity: 0,
  });
}

function creamMaterial(color: string) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0,
    transparent: true,
    opacity: 0,
  });
}

function brassMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#c6a15a",
    roughness: 0.38,
    metalness: 0.62,
    transparent: true,
    opacity: 0,
  });
}

/**
 * Compact home mandir. Reveal is driven by the shared scroll pose.
 */
export function HomeTemple({
  pose,
  position = SHRINE_POSITION,
  scale = SHRINE_SCALE,
  plate,
}: HomeTempleProps) {
  const root = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);

  const materials = useMemo(
    () => ({
      step: woodMaterial("#a67c52"),
      wood: woodMaterial("#7a4e2d"),
      cream: creamMaterial("#f4ead7"),
      niche: creamMaterial("#fbf6ec"),
      brass: brassMaterial(),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((material) => material.dispose());
    };
  }, [materials]);

  useFrame(() => {
    const reveal = smoothStep(pose.current.shrine);
    const rootGroup = root.current;
    if (!rootGroup) return;
    rootGroup.visible = reveal > 0.015;
    rootGroup.position.y = position.y + (1 - reveal) * -0.28;
    Object.values(materials).forEach((material) => {
      material.opacity = reveal;
      material.depthWrite = reveal > 0.92;
    });
    if (light.current) {
      light.current.intensity = reveal * 0.14;
    }
  });

  return (
    <group
      ref={root}
      position={[position.x, position.y, position.z]}
      scale={scale}
      visible={false}
    >
      <mesh position={[0, 0.02, 0.02]} material={materials.step} castShadow receiveShadow>
        <boxGeometry args={[0.96, 0.04, 0.56]} />
      </mesh>
      <mesh position={[0, 0.08, 0]} material={materials.wood} castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.08, 0.42]} />
      </mesh>
      <mesh position={[0, 0.125, 0.02]} material={materials.cream} receiveShadow>
        <boxGeometry args={[0.62, 0.016, 0.28]} />
      </mesh>
      <mesh position={[0, 0.52, -0.16]} material={materials.cream} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.76, 0.045]} />
      </mesh>
      <mesh position={[0, 0.5, -0.132]} material={materials.niche} receiveShadow>
        <boxGeometry args={[0.42, 0.46, 0.02]} />
      </mesh>
      <mesh position={[-0.28, 0.46, 0.05]} material={materials.wood} castShadow>
        <boxGeometry args={[0.055, 0.62, 0.055]} />
      </mesh>
      <mesh position={[0.28, 0.46, 0.05]} material={materials.wood} castShadow>
        <boxGeometry args={[0.055, 0.62, 0.055]} />
      </mesh>
      <mesh position={[0, 0.78, 0.04]} material={materials.brass} castShadow>
        <boxGeometry args={[0.66, 0.045, 0.07]} />
      </mesh>
      <mesh position={[0, 0.9, -0.02]} material={materials.cream} castShadow>
        <boxGeometry args={[0.78, 0.045, 0.34]} />
      </mesh>
      <mesh position={[0, 1.0, -0.02]} material={materials.wood} castShadow>
        <boxGeometry args={[0.46, 0.08, 0.22]} />
      </mesh>
      <mesh position={[0, 1.1, -0.02]} material={materials.brass} castShadow>
        <sphereGeometry args={[0.045, 16, 12]} />
      </mesh>
      {plate ? (
        <>
          <mesh position={[0, plate.top - 0.006, plate.z]} material={materials.brass} castShadow receiveShadow>
            <cylinderGeometry args={[plate.radius, plate.radius * 0.94, 0.012, 40]} />
          </mesh>
          <mesh position={[0, plate.top, plate.z]} rotation={[Math.PI / 2, 0, 0]} material={materials.brass}>
            <torusGeometry args={[plate.radius, 0.006, 8, 40]} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0.2, 0.24]} material={materials.brass} castShadow>
            <cylinderGeometry args={[0.075, 0.09, 0.045, 20]} />
          </mesh>
          <mesh position={[0, 0.224, 0.24]} rotation={[Math.PI / 2, 0, 0]} material={materials.brass}>
            <torusGeometry args={[0.07, 0.008, 8, 20]} />
          </mesh>
        </>
      )}
      <pointLight
        ref={light}
        position={plate ? [0, plate.top + 0.14, plate.z + 0.04] : [0, 0.28, 0.22]}
        color="#ffd7a8"
        distance={1.8}
        decay={2}
        intensity={0}
      />
    </group>
  );
}
