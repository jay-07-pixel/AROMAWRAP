import { DEVI_FACE_D, DEVI_FACE_H, DEVI_FACE_W } from "@/components/experience/deviTextures";
import { lerp, smoothStep } from "@/components/experience/cartonScene";

/** One source pixel is one pixel of sleeve, so the print keeps its dieline proportions. */
const BOX_SCALE = 1.5 / DEVI_FACE_W;
export const BOX_WIDTH = DEVI_FACE_W * BOX_SCALE;
export const BOX_HEIGHT = DEVI_FACE_H * BOX_SCALE;
export const BOX_DEPTH = DEVI_FACE_D * BOX_SCALE;

/**
 * The dieline has no physical size. A 15 cm wide sleeve is a visual assumption,
 * used only to keep the cups in proportion with the box.
 */
const BOX_WIDTH_CM = 15;
const CM = BOX_WIDTH / BOX_WIDTH_CM;

export const CUP_HEIGHT = 2.1 * CM;
export const CUP_TOP_RADIUS = 1.5 * CM;
export const CUP_BOTTOM_RADIUS = 1.0 * CM;

/** "12 cups inside" is printed on the front panel. */
export const CUP_COLUMNS = 4;
export const CUP_ROWS = 3;
export const CUP_COUNT = CUP_COLUMNS * CUP_ROWS;
/** The outer column of the tray, taken to the shrine. */
export const LIT_CUPS = [3, 7, 11];

export const TRAY_WALL = 0.012;
export const TRAY_TRAVEL = BOX_WIDTH * 0.68;

export type DeviPose = {
  open: number;
  slide: number;
  aside: number;
  shrine: number;
  place: number;
  burn: number;
  smoke: number;
};

export const CLOSED_DEVI_POSE: DeviPose = {
  open: 0,
  slide: 0,
  aside: 0,
  shrine: 0,
  place: 0,
  burn: 0,
  smoke: 0,
};

/** The open box slides left and rests on the same floor line. */
export const ASIDE_X = -1.32;
export const ASIDE_SCALE = 0.5;

export const SHRINE_POSITION = { x: 0.5, y: -BOX_HEIGHT / 2, z: 0.02 };
export const SHRINE_SCALE = 1.2;
/** Brass plate on the shrine plinth, in shrine space. */
export const PLATE = { radius: 0.155, top: 0.146, z: 0.06 };

export type CupPose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};

/**
 * Cup centres inside the tray, in box space. The sleeve stands upright,
 * so the cups lie on their sides with their tops toward the front panel.
 */
export function createTrayLayout(): CupPose[] {
  const columnStep = (BOX_WIDTH - 0.06) / CUP_COLUMNS;
  const rowStep = (BOX_HEIGHT - 0.06) / CUP_ROWS;
  const z = -BOX_DEPTH / 2 + TRAY_WALL + CUP_HEIGHT / 2 + 0.004;
  return Array.from({ length: CUP_COUNT }, (_, index) => {
    const column = index % CUP_COLUMNS;
    const row = Math.floor(index / CUP_COLUMNS);
    return {
      x: (column - (CUP_COLUMNS - 1) / 2) * columnStep,
      y: ((CUP_ROWS - 1) / 2 - row) * rowStep,
      z,
      rx: Math.PI / 2,
      ry: index * 0.9,
      rz: 0,
    };
  });
}

/** Three cups in a small triangle on the plate, upright. */
export function createPlateLayout(): CupPose[] {
  const plateY = SHRINE_POSITION.y + PLATE.top * SHRINE_SCALE;
  const plateZ = SHRINE_POSITION.z + PLATE.z * SHRINE_SCALE;
  const y = plateY + (CUP_HEIGHT * ASIDE_SCALE) / 2;
  const spots = [
    { x: -0.085, z: 0.05 },
    { x: 0, z: -0.075 },
    { x: 0.085, z: 0.05 },
  ];
  return spots.map((spot, index) => ({
    x: SHRINE_POSITION.x + spot.x,
    y,
    z: plateZ + spot.z,
    rx: 0,
    ry: index * 0.9,
    rz: 0,
  }));
}

export function asideTransform(aside: number) {
  const t = smoothStep(aside);
  const scale = lerp(1, ASIDE_SCALE, t);
  return {
    x: lerp(0, ASIDE_X, t),
    y: (-BOX_HEIGHT / 2) * (1 - scale),
    z: 0,
    scale,
  };
}

export function trayOffset(pose: DeviPose) {
  return smoothStep(pose.slide) * TRAY_TRAVEL;
}

/** Share of the place phase spent staggering cup departures. */
const PLACE_STAGGER = 0.4;
/** Share of each cup's flight spent lifting it out of the tray. */
const PULL_SHARE = 0.3;

/**
 * Cups ride in the tray and shrink with the box. A lit cup lifts straight out
 * of the tray toward the viewer, turns upright, and arcs onto the plate.
 */
export function resolveCupPose(
  cup: CupPose,
  plate: CupPose | null,
  pose: DeviPose,
  order: number,
  count: number,
): CupPose & { scale: number } {
  const aside = asideTransform(pose.aside);
  const carried = {
    x: (cup.x + trayOffset(pose)) * aside.scale + aside.x,
    y: cup.y * aside.scale + aside.y,
    z: cup.z * aside.scale + aside.z,
    rx: cup.rx,
    ry: cup.ry,
    rz: cup.rz,
  };
  if (!plate) return { ...carried, scale: aside.scale };

  const share = count === 1 ? 0 : order / (count - 1);
  const t = smoothStep((pose.place - share * PLACE_STAGGER) / (1 - PLACE_STAGGER));
  const pull = smoothStep(t / PULL_SHARE);
  const travel = smoothStep((t - PULL_SHARE) / (1 - PULL_SHARE));
  const raised = { x: carried.x, y: carried.y, z: carried.z + BOX_DEPTH * aside.scale * 1.3 * pull };
  const control = {
    x: (raised.x + plate.x) / 2,
    y: Math.max(raised.y, plate.y) + 0.35,
    z: (raised.z + plate.z) / 2 + 0.15,
  };
  const inv = 1 - travel;
  return {
    x: inv * inv * raised.x + 2 * inv * travel * control.x + travel * travel * plate.x,
    y: inv * inv * raised.y + 2 * inv * travel * control.y + travel * travel * plate.y,
    z: inv * inv * raised.z + 2 * inv * travel * control.z + travel * travel * plate.z,
    rx: lerp(carried.rx, plate.rx, travel),
    ry: lerp(carried.ry, plate.ry, travel),
    rz: lerp(carried.rz, 0, travel),
    scale: aside.scale,
  };
}
