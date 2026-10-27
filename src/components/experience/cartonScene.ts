import * as THREE from "three";
import { FACE_D, FACE_H, FACE_W } from "@/components/experience/cartonTextures";

/** Same scale as the closed carton, so the panels keep their dieline proportions. */
export const CARTON_SCALE = 1.85 / FACE_H;
export const CARTON_WIDTH = FACE_W * CARTON_SCALE;
export const CARTON_HEIGHT = FACE_H * CARTON_SCALE;
export const CARTON_DEPTH = FACE_D * CARTON_SCALE;

/**
 * The dieline does not include a physical carton height.
 * 23 cm lets the 22 cm sticks sit inside the carton with a little clearance.
 * That height is a visual assumption, not a measured AromaWrap spec.
 */
export const CARTON_HEIGHT_CM = 23;
const CM = CARTON_HEIGHT / CARTON_HEIGHT_CM;

export const STICK_COUNT = 8;
export const STICK_LENGTH_CM = 22;
export const STICK_DIAMETER_CM = 0.3;
export const STICK_LENGTH = STICK_LENGTH_CM * CM;
export const STICK_RADIUS = (STICK_DIAMETER_CM / 2) * CM;

export type CartonPose = {
  open: number;
  flap: number;
  sticks: number;
  aside: number;
  shrine: number;
  place: number;
  burn: number;
  smoke: number;
};

export const CLOSED_POSE: CartonPose = {
  open: 0,
  flap: 0,
  sticks: 0,
  aside: 0,
  shrine: 0,
  place: 0,
  burn: 0,
  smoke: 0,
};

/** The open carton slides left and rests on the same floor line. */
export const ASIDE_X = -0.8;
export const ASIDE_SCALE = 0.82;

/** Small home shrine, to the right of the resting carton. */
export const SHRINE_POSITION = { x: 0.44, y: -CARTON_HEIGHT / 2, z: 0.02 };
export const SHRINE_SCALE = 1.5;

export function extractFace(box: THREE.BufferGeometry, materialIndex: number) {
  const group = box.groups.find((entry) => entry.materialIndex === materialIndex);
  const index = box.index;
  if (!group || !index) throw new Error("Missing carton face");

  const position = box.getAttribute("position");
  const uv = box.getAttribute("uv");
  const normal = box.getAttribute("normal");
  const used: number[] = [];

  for (let i = group.start; i < group.start + group.count; i += 1) {
    used.push(index.getX(i));
  }

  const map = new Map<number, number>();
  const positions: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];

  used.forEach((vertex) => {
    if (map.has(vertex)) return;
    map.set(vertex, map.size);
    positions.push(position.getX(vertex), position.getY(vertex), position.getZ(vertex));
    uvs.push(uv.getX(vertex), uv.getY(vertex));
    normals.push(normal.getX(vertex), normal.getY(vertex), normal.getZ(vertex));
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(used.map((vertex) => map.get(vertex) as number));
  return geometry;
}

type StickPose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};

export type StickLayout = {
  color: string;
  from: StickPose;
  to: StickPose;
};

const STICK_COLORS = ["#3d2914", "#4a3018", "#5a3b22", "#342110", "#624428", "#2c1c0d"];

/** Fixed leans so the bundle stays irregular without a new random layout each visit. */
const STICK_LEANS = [-0.2, 0.07, -0.1, 0.16, 0.02, -0.15, 0.11, -0.05];
const STICK_LIFTS = [0, 0.07, 0.03, 0.1, 0.02, 0.06, 0.04, 0.09];
const STICK_DEPTHS = [0.012, -0.008, 0.018, -0.004, 0.01, -0.014, 0.006, -0.011];

/**
 * Sticks stand upright inside the carton, then slide up through the open top
 * until roughly half their length is out. Bases stay inside the opening.
 */
export function createStickLayout(count: number): StickLayout[] {
  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0.5 : index / (count - 1);
    const lean = STICK_LEANS[index % STICK_LEANS.length];
    const lift = STICK_LIFTS[index % STICK_LIFTS.length];
    const depth = STICK_DEPTHS[index % STICK_DEPTHS.length];
    const x = (t - 0.5) * 0.24 + lean * 0.04;
    const z = depth * 0.8;

    return {
      color: STICK_COLORS[index % STICK_COLORS.length],
      from: { x, y: -0.02 + lift * 0.1, z, rx: 0, ry: 0, rz: 0 },
      to: {
        x,
        y: 0.94 + lift * 0.9,
        z,
        rx: 0.04 + Math.abs(lean) * 0.1,
        ry: lean * 0.2,
        rz: (0.5 - t) * 0.22 + lean * 0.25,
      },
    };
  });
}

export function asideTransform(aside: number) {
  const t = smoothStep(aside);
  const scale = lerp(1, ASIDE_SCALE, t);
  return {
    x: lerp(0, ASIDE_X, t),
    y: (-CARTON_HEIGHT / 2) * (1 - scale),
    z: 0,
    scale,
  };
}

export function createHolderLayout(count: number): StickPose[] {
  const bowl = new THREE.Vector3(
    SHRINE_POSITION.x,
    SHRINE_POSITION.y + 0.21 * SHRINE_SCALE,
    SHRINE_POSITION.z + 0.24 * SHRINE_SCALE,
  );
  const halfLength = (STICK_LENGTH * ASIDE_SCALE) / 2;
  const offset = new THREE.Vector3();
  const rotation = new THREE.Euler();
  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0.5 : index / (count - 1);
    const lean = STICK_LEANS[index % STICK_LEANS.length];
    const depth = STICK_DEPTHS[index % STICK_DEPTHS.length];
    const row = (index % 3) - 1;
    const pose = {
      rx: -0.12 + lean * 0.08,
      ry: lean * 0.15,
      rz: (0.5 - t) * 0.5 + lean * 0.1,
    };
    // Meshes pivot at their centre, so offset the centre from a base point inside the bowl.
    offset.set(0, halfLength, 0).applyEuler(rotation.set(pose.rx, pose.ry, pose.rz));
    return {
      x: bowl.x + (t - 0.5) * 0.07 + offset.x,
      y: bowl.y + (index % 2) * 0.01 + offset.y,
      z: bowl.z + row * 0.025 + depth + offset.z,
      ...pose,
    };
  });
}

/** Share of the place phase that is spent staggering stick departures. */
const PLACE_STAGGER = 0.45;
/** Share of each stick's flight spent sliding out of the carton. */
const PULL_SHARE = 0.32;

/**
 * Carry a stick with the open carton, then fly it along a curve into the holder.
 * Sticks leave one after another and share the carton's aside scale.
 */
export function resolveStickPose(
  layout: StickLayout,
  holder: StickPose,
  pose: CartonPose,
  index: number,
  count: number,
): StickPose & { scale: number } {
  const emerged = smoothStep(pose.sticks);
  const local = {
    x: lerp(layout.from.x, layout.to.x, emerged),
    y: lerp(layout.from.y, layout.to.y, emerged),
    z: lerp(layout.from.z, layout.to.z, emerged),
    rx: lerp(layout.from.rx, layout.to.rx, emerged),
    ry: lerp(layout.from.ry, layout.to.ry, emerged),
    rz: lerp(layout.from.rz, layout.to.rz, emerged),
  };
  const aside = asideTransform(pose.aside);
  const carried = {
    x: local.x * aside.scale + aside.x,
    y: local.y * aside.scale + aside.y,
    z: local.z * aside.scale + aside.z,
    rx: local.rx,
    ry: local.ry,
    rz: local.rz,
  };
  const order = count === 1 ? 0 : index / (count - 1);
  const start = order * PLACE_STAGGER;
  const t = smoothStep((pose.place - start) / (1 - PLACE_STAGGER));
  // Pull straight up until the base clears the carton rim, then arc down into the holder.
  const pull = smoothStep(t / PULL_SHARE);
  const travel = smoothStep((t - PULL_SHARE) / (1 - PULL_SHARE));
  const raised = { x: carried.x, y: carried.y + STICK_LENGTH * aside.scale * 0.5 * pull, z: carried.z };
  const control = {
    x: (raised.x + holder.x) / 2,
    y: Math.max(raised.y, holder.y) + 0.12,
    z: (raised.z + holder.z) / 2 + 0.25,
  };
  const inv = 1 - travel;
  const sway = Math.sin(travel * Math.PI);
  return {
    x: inv * inv * raised.x + 2 * inv * travel * control.x + travel * travel * holder.x,
    y: inv * inv * raised.y + 2 * inv * travel * control.y + travel * travel * holder.y,
    z: inv * inv * raised.z + 2 * inv * travel * control.z + travel * travel * holder.z,
    rx: lerp(carried.rx, holder.rx, travel),
    ry: lerp(carried.ry, holder.ry, travel) + sway * 0.4,
    rz: lerp(carried.rz, holder.rz, travel) - sway * 0.3,
    scale: aside.scale,
  };
}

export function smoothStep(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

export function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}
