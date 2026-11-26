// Shared by the HDR and EXR packages: turns decoded high-dynamic-range pixels into a three.js
// texture, and sets it as a scene's environment lighting and background.

import * as THREE from 'three';

export interface HdrTextureData {
  width: number;
  height: number;
  data: Float32Array | Uint16Array;
  format?: THREE.PixelFormat;
  type: THREE.TextureDataType;
  flipY: boolean;
}

export interface EnvironmentOptions {
  /** Shows the image as the scene's background too. Default true. */
  background?: boolean;
  /** Blurs the background, 0 to 1. Default 0. */
  backgroundBlurriness?: number;
  /** Scales the environment lighting and background. Default 1. */
  intensity?: number;
  /** Turns the environment about the vertical axis, in radians. Default 0. */
  rotation?: number;
}

/** A texture of the pixels, mapped as an equirectangular (latitude-longitude) environment. */
export function makeTexture(name: string, d: HdrTextureData): THREE.DataTexture {
  const texture = new THREE.DataTexture(d.data, d.width, d.height, d.format ?? THREE.RGBAFormat, d.type);
  texture.name = name;
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.flipY = d.flipY;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;
  return texture;
}

/** Lights the scene with the texture, and shows it as the background unless told not to. */
export function applyEnvironment(scene: THREE.Scene, texture: THREE.Texture, options: EnvironmentOptions = {}): void {
  scene.environment = texture;
  scene.environmentIntensity = options.intensity ?? 1;
  scene.environmentRotation.set(0, options.rotation ?? 0, 0);
  if (options.background !== false) {
    scene.background = texture;
    scene.backgroundIntensity = options.intensity ?? 1;
    scene.backgroundBlurriness = options.backgroundBlurriness ?? 0;
    scene.backgroundRotation.set(0, options.rotation ?? 0, 0);
  }
}

/** Reads a half float. */
function half(h: number): number {
  const s = h & 0x8000 ? -1 : 1;
  const e = (h >> 10) & 0x1f;
  const f = h & 0x3ff;
  if (e === 0) return s * 2 ** -14 * (f / 1024);
  if (e === 31) return f ? NaN : s * Infinity;
  return s * 2 ** (e - 15) * (1 + f / 1024);
}

/** The brightest and mean luminance of the pixels, and the direction of the brightest, such as the sun. */
export function measure(d: HdrTextureData): { maxLuminance: number; meanLuminance: number; brightest: THREE.Vector3 } {
  const channels = d.format === THREE.RedFormat ? 1 : d.format === THREE.RGFormat ? 2 : 4;
  const read = d.data instanceof Uint16Array ? (i: number) => half(d.data[i]!) : (i: number) => d.data[i]!;
  let max = 0;
  let sum = 0;
  let at = 0;
  const n = d.width * d.height;
  for (let p = 0; p < n; p++) {
    const i = p * channels;
    const l = channels >= 3 ? 0.2126 * read(i) + 0.7152 * read(i + 1) + 0.0722 * read(i + 2) : read(i);
    if (!Number.isFinite(l)) continue;
    sum += l;
    if (l > max) {
      max = l;
      at = p;
    }
  }
  // Rows run from the top of the sky down when the image is flipped for display, and from the bottom otherwise.
  const row = Math.floor(at / d.width);
  const v = (d.flipY ? row : d.height - 1 - row) / d.height;
  const u = (at % d.width) / d.width;
  const phi = (u - 0.5) * 2 * Math.PI;
  const theta = (0.5 - v) * Math.PI;
  const brightest = new THREE.Vector3(Math.cos(theta) * Math.sin(phi), Math.sin(theta), -Math.cos(theta) * Math.cos(phi));
  return { maxLuminance: max, meanLuminance: n ? sum / n : 0, brightest };
}
