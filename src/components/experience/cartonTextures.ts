import * as THREE from "three";

const BASE = "/experience/textures/lavender";

/**
 * Closed-carton proportions, in source pixels.
 * Front and back are the wide faces. The narrow sides set the depth.
 * One pixel of artwork is one pixel of carton, so nothing is stretched.
 */
export const FACE_W = 269;
export const FACE_H = 962;
export const FACE_D = 88;

const SOURCES = {
  front: `${BASE}/front.png`,
  back: `${BASE}/back.png`,
  warning: `${BASE}/warning-side.png`,
  social: `${BASE}/social-side.png`,
  topFlap: `${BASE}/front-top-flap.png`,
  bottomFlap: `${BASE}/back-bottom-flap.png`,
} as const;

export type CartonTextures = {
  front: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
  warning: THREE.CanvasTexture;
  social: THREE.CanvasTexture;
  top: THREE.CanvasTexture;
  bottom: THREE.CanvasTexture;
  dispose: () => void;
};

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

export function canvasOf(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true, alpha: true });
  if (context) context.imageSmoothingEnabled = false;
  if (!context) throw new Error("Could not prepare carton artwork.");
  return { canvas, context };
}

export function panelColor(image: HTMLImageElement) {
  const { canvas, context } = canvasOf(1, 1);
  context.drawImage(image, 2, Math.min(2, image.height - 1), 1, 1, 0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  canvas.width = 0;
  return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
}

/** Unprinted white outside the cardboard, starting from the edges. Printed white ink stays. */
function clearOuterPaper(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = image;
  const seen = new Uint8Array(width * height);
  const stack: number[] = [];

  const isPaper = (index: number) => {
    const offset = index * 4;
    return data[offset] > 246 && data[offset + 1] > 246 && data[offset + 2] > 246;
  };

  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (seen[index] || !isPaper(index)) return;
    seen[index] = 1;
    stack.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length > 0) {
    const index = stack.pop() as number;
    data[index * 4 + 3] = 0;
    const x = index % width;
    const y = Math.floor(index / width);
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  context.putImageData(image, 0, 0);
}

export function textureFrom(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // The print is drawn smaller than its source on most screens; mipmaps keep small text from breaking up.
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function fitWideFace(image: HTMLImageElement) {
  const { canvas, context } = canvasOf(FACE_W, FACE_H);
  const sx = Math.max(0, (image.width - FACE_W) / 2);
  const sy = Math.max(0, (image.height - FACE_H) / 2);
  context.drawImage(image, sx, sy, FACE_W, FACE_H, 0, 0, FACE_W, FACE_H);
  return textureFrom(canvas);
}

/**
 * Side crops stop where the dust flap begins, so they are shorter than the
 * front. The missing top is unprinted purple. Pad with that purple instead
 * of stretching the icons and warning text.
 */
function fitSideFace(image: HTMLImageElement) {
  if (image.height > FACE_H || image.width < FACE_D) {
    throw new Error("Side artwork does not fit the carton depth.");
  }
  const { canvas, context } = canvasOf(FACE_D, FACE_H);
  context.fillStyle = panelColor(image);
  context.fillRect(0, 0, FACE_D, FACE_H);
  const top = FACE_H - image.height;
  const sx = Math.max(0, (image.width - FACE_D) / 2);
  context.drawImage(image, sx, 0, FACE_D, image.height, 0, top, FACE_D, image.height);
  return textureFrom(canvas);
}

/**
 * The top flap is longer than the carton depth. The extra rounded end is the
 * tuck, which sits inside a closed carton. The exterior uses the hinge side
 * of the flap, at its original pixel size.
 */
function fitTopFlap(image: HTMLImageElement) {
  if (image.height < FACE_D || image.width < FACE_W) {
    throw new Error("Top flap artwork is smaller than the carton opening.");
  }
  const { canvas, context } = canvasOf(FACE_W, FACE_D);
  const sy = image.height - FACE_D;
  const sx = Math.max(0, (image.width - FACE_W) / 2);
  context.drawImage(image, sx, sy, FACE_W, FACE_D, 0, 0, FACE_W, FACE_D);
  clearOuterPaper(canvas);
  return textureFrom(canvas);
}

/**
 * The bottom flap hangs from the back. Its hinge is the top of that image,
 * and the box's bottom face puts that canvas edge against the back.
 */
function fitBottomFlap(image: HTMLImageElement) {
  if (image.height < FACE_D || image.width < FACE_W) {
    throw new Error("Bottom flap artwork is smaller than the carton opening.");
  }
  const { canvas, context } = canvasOf(FACE_W, FACE_D);
  const sx = Math.max(0, (image.width - FACE_W) / 2);
  context.drawImage(image, sx, 0, FACE_W, FACE_D, 0, 0, FACE_W, FACE_D);
  clearOuterPaper(canvas);
  return textureFrom(canvas);
}

export async function prepareCartonTextures(): Promise<CartonTextures> {
  const [front, back, warning, social, topFlap, bottomFlap] = await Promise.all([
    loadImage(SOURCES.front),
    loadImage(SOURCES.back),
    loadImage(SOURCES.warning),
    loadImage(SOURCES.social),
    loadImage(SOURCES.topFlap),
    loadImage(SOURCES.bottomFlap),
  ]);

  const textures = {
    front: fitWideFace(front),
    back: fitWideFace(back),
    warning: fitSideFace(warning),
    social: fitSideFace(social),
    top: fitTopFlap(topFlap),
    bottom: fitBottomFlap(bottomFlap),
  };

  return {
    ...textures,
    dispose: () => {
      Object.values(textures).forEach((texture) => texture.dispose());
    },
  };
}
