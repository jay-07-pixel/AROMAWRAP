import * as THREE from "three";
import { canvasOf, loadImage, panelColor, textureFrom } from "@/components/experience/cartonTextures";

const BASE = "/experience/textures/devi";

/**
 * Sleeve proportions, in source pixels from the Devi dieline.
 * Front and back are the wide faces. The printed bands set the depth.
 */
export const DEVI_FACE_W = 460;
export const DEVI_FACE_H = 381;
export const DEVI_FACE_D = 75;

const SOURCES = {
  front: `${BASE}/front.png`,
  back: `${BASE}/back.png`,
  top: `${BASE}/top-band.png`,
  bottom: `${BASE}/bottom-band.png`,
} as const;

export type DeviTextures = {
  front: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
  top: THREE.CanvasTexture;
  bottom: THREE.CanvasTexture;
  granules: THREE.CanvasTexture;
  /** Unprinted board colour, sampled from the sleeve's own print. */
  board: string;
  dispose: () => void;
};

function fitPanel(image: HTMLImageElement, width: number, height: number) {
  if (image.width !== width || image.height !== height) {
    throw new Error(`Devi panel is ${image.width}x${image.height}, expected ${width}x${height}.`);
  }
  const { canvas, context } = canvasOf(width, height);
  context.drawImage(image, 0, 0);
  return textureFrom(canvas);
}

/** Small seeded generator, so the resin top looks the same on every visit. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Top of a sambrani cup: packed resin and herb granules, as in the product photo. */
function granuleTexture() {
  const size = 128;
  const { canvas, context } = canvasOf(size, size);
  context.imageSmoothingEnabled = true;
  const random = seeded(17);
  const colors = ["#2a1a10", "#3b2416", "#5a3a22", "#7a4a24", "#a0612c", "#c07a3a"];
  context.fillStyle = "#3a2618";
  context.fillRect(0, 0, size, size);
  for (let index = 0; index < 420; index += 1) {
    context.fillStyle = colors[Math.floor(random() * colors.length)];
    context.beginPath();
    context.ellipse(
      random() * size,
      random() * size,
      1.5 + random() * 3.5,
      1.2 + random() * 2.5,
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  return textureFrom(canvas);
}

export async function prepareDeviTextures(): Promise<DeviTextures> {
  const [front, back, top, bottom] = await Promise.all([
    loadImage(SOURCES.front),
    loadImage(SOURCES.back),
    loadImage(SOURCES.top),
    loadImage(SOURCES.bottom),
  ]);

  const textures = {
    front: fitPanel(front, DEVI_FACE_W, DEVI_FACE_H),
    back: fitPanel(back, DEVI_FACE_W, DEVI_FACE_H),
    top: fitPanel(top, DEVI_FACE_W, DEVI_FACE_D),
    bottom: fitPanel(bottom, DEVI_FACE_W, DEVI_FACE_D),
    granules: granuleTexture(),
  };

  return {
    ...textures,
    board: panelColor(front),
    dispose: () => {
      Object.values(textures).forEach((texture) => texture.dispose());
    },
  };
}
