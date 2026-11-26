// Reads Radiance HDR (RGBE) images with three.js's HDRLoader into textures for image-based
// lighting: equirectangular environment maps that light a scene and show as its background.

import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { ImportFiles, type ImportInput } from './common.js';
import { makeTexture, measure } from './environment.js';

export { ImportFiles } from './common.js';
export type { ImportInput, ImportFile, ImportData } from './common.js';
export { applyEnvironment, type EnvironmentOptions } from './environment.js';

export interface HdrOptions {
  /** The .hdr file to open, if several are given. By default, the first. */
  main?: string;
  /** Pixel type of the texture: half floats (the default) use half the memory of floats. */
  type?: 'half' | 'float';
}

export interface HdrLoadResult {
  /** The image, as an equirectangular environment texture in linear colour. */
  texture: THREE.DataTexture;
  width: number;
  height: number;
  /** The file's exposure and gamma, if it states them. */
  exposure: number;
  gamma: number;
  /** The file's header text. */
  header: string;
  /** The brightest and mean luminance, and the direction of the brightest point, such as the sun. */
  maxLuminance: number;
  meanLuminance: number;
  brightest: THREE.Vector3;
  warnings: string[];
}

export class HdrImportError extends Error {
  override name = 'HdrImportError';
}

/** Reads a Radiance .hdr image. Use `applyEnvironment` to light a scene with it. */
export async function loadHdr(input: ImportInput, options: HdrOptions = {}): Promise<HdrLoadResult> {
  const files = await ImportFiles.from(input, 'environment.hdr');
  const main = files.main(['hdr', 'pic', 'rgbe'], options.main) ?? files.files[0];
  if (!main) throw new HdrImportError('There is no .hdr file to open');
  const head = new TextDecoder('latin1').decode(main.bytes.subarray(0, 16));
  if (!/^#\?(RADIANCE|RGBE)/.test(head)) throw new HdrImportError(`${main.name} is not a Radiance HDR file: it does not start with #?RADIANCE`);
  const loader = new HDRLoader().setDataType(options.type === 'float' ? THREE.FloatType : THREE.HalfFloatType);
  let d: ReturnType<HDRLoader['parse']>;
  const error = console.error;
  try {
    // HDRLoader reports errors on the console before throwing; they are thrown here instead.
    console.error = () => {};
    d = loader.parse(main.bytes.buffer.slice(main.bytes.byteOffset, main.bytes.byteOffset + main.bytes.byteLength) as ArrayBuffer);
  } catch (e) {
    throw new HdrImportError(`${main.name} could not be read: ${(e as Error).message}`);
  } finally {
    console.error = error;
  }
  const data = d as unknown as { width: number; height: number; data: Float32Array | Uint16Array; header: string; gamma: number; exposure: number; type: THREE.TextureDataType };
  const warnings: string[] = [];
  if (Math.abs(data.width / data.height - 2) > 0.01) warnings.push(`The image is ${data.width} x ${data.height}; an environment map is twice as wide as it is high`);
  const name = main.name.replace(/\\/g, '/').split('/').pop()!.replace(/\.[^.]+$/, '');
  const pixels = { width: data.width, height: data.height, data: data.data, type: data.type, flipY: true };
  const texture = makeTexture(name, pixels);
  const m = measure(pixels);
  return { texture, width: data.width, height: data.height, exposure: data.exposure, gamma: data.gamma, header: data.header, maxLuminance: m.maxLuminance, meanLuminance: m.meanLuminance, brightest: m.brightest, warnings };
}
