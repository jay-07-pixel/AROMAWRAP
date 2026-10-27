import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RefObject } from "react";

export type SmokeSource = {
  position: THREE.Vector3;
  yaw: number;
  tilt: number;
};

type FragranceSmokeProps = {
  pose: RefObject<{ smoke: number }>;
  count: number;
  /** Writes where ribbon `index` starts this frame, in world space. */
  locate: (index: number, source: SmokeSource) => void;
  width?: number;
  height?: number;
  color?: string;
};

function smokeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not draw fragrance smoke.");
  const vertical = context.createLinearGradient(0, 128, 0, 0);
  vertical.addColorStop(0, "rgba(244, 239, 232, 0)");
  vertical.addColorStop(0.18, "rgba(244, 239, 232, 0.45)");
  vertical.addColorStop(0.62, "rgba(244, 239, 232, 0.22)");
  vertical.addColorStop(1, "rgba(244, 239, 232, 0)");
  context.fillStyle = vertical;
  context.fillRect(0, 0, 64, 128);
  const horizontal = context.createLinearGradient(0, 0, 64, 0);
  horizontal.addColorStop(0, "rgba(244, 239, 232, 0)");
  horizontal.addColorStop(0.5, "rgba(244, 239, 232, 1)");
  horizontal.addColorStop(1, "rgba(244, 239, 232, 0)");
  context.globalCompositeOperation = "destination-in";
  context.fillStyle = horizontal;
  context.fillRect(0, 0, 64, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type Ribbon = {
  geometry: THREE.PlaneGeometry;
  base: Float32Array;
};

/**
 * A few translucent ribbons rise from each burning source.
 * Scroll controls how much smoke is present, and the ribbons keep a slow curl while visible.
 * This is a visual impression of fragrance, not a measured plume.
 */
export function FragranceSmoke({
  pose,
  count,
  locate,
  width = 0.075,
  height = 0.82,
  color = "#d6cfd3",
}: FragranceSmokeProps) {
  const ribbons = useRef<Array<THREE.Mesh | null>>([]);
  const source = useMemo<SmokeSource>(() => ({ position: new THREE.Vector3(), yaw: 0, tilt: 0 }), []);

  const texture = useMemo(() => smokeTexture(), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [color, texture],
  );
  const ribbonSet = useMemo<Ribbon[]>(
    () =>
      Array.from({ length: count }, () => {
        const geometry = new THREE.PlaneGeometry(width, height, 1, 14);
        geometry.translate(0, height / 2, 0);
        const base = new Float32Array(geometry.getAttribute("position").array);
        return { geometry, base };
      }),
    [count, height, width],
  );

  useEffect(() => {
    return () => {
      texture.dispose();
      material.dispose();
    };
  }, [material, texture]);

  useEffect(() => {
    return () => ribbonSet.forEach((ribbon) => ribbon.geometry.dispose());
  }, [ribbonSet]);

  useFrame((state) => {
    const amount = Math.min(1, Math.max(0, pose.current.smoke));
    material.opacity = amount * 0.72;
    const time = state.clock.elapsedTime;
    ribbonSet.forEach((ribbon, index) => {
      const mesh = ribbons.current[index];
      if (!mesh) return;
      mesh.visible = amount > 0.02;
      const positions = ribbon.geometry.getAttribute("position");
      const seed = index * 1.37;
      for (let vertex = 0; vertex < positions.count; vertex += 1) {
        const y = ribbon.base[vertex * 3 + 1];
        const x =
          ribbon.base[vertex * 3] + Math.sin(y * 5.2 + time * 0.7 + seed) * 0.09 * y * amount;
        const z =
          ribbon.base[vertex * 3 + 2] +
          Math.cos(y * 3.4 + time * 0.45 + seed * 1.6) * 0.05 * y * amount;
        positions.setXYZ(vertex, x, y, z);
      }
      positions.needsUpdate = true;
      if (amount <= 0.02) return;
      locate(index, source);
      mesh.position.copy(source.position);
      mesh.rotation.set(0, source.yaw + index * 0.25, source.tilt);
      mesh.scale.setScalar(0.55 + amount * 0.45);
    });
  });

  return (
    <group>
      {ribbonSet.map((ribbon, index) => (
        <mesh
          key={index}
          ref={(node) => {
            ribbons.current[index] = node;
          }}
          geometry={ribbon.geometry}
          material={material}
          visible={false}
        />
      ))}
    </group>
  );
}
