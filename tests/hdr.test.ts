import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { applyEnvironment, HdrImportError, loadHdr } from '../src/index.js';
import { sample } from './files.js';

/** A small uncompressed RGBE image, `width` x 1, with one bright pixel. */
function rgbe(width: number, bright: number): Uint8Array {
  const head = new TextEncoder().encode(`#?RADIANCE\nFORMAT=32-bit_rle_rgbe\nEXPOSURE=1.5\n\n-Y 1 +X ${width}\n`);
  const pixels = new Uint8Array(width * 4);
  for (let x = 0; x < width; x++) pixels.set(x === bright ? [128, 128, 128, 136] : [128, 128, 128, 128], x * 4);
  return new Uint8Array([...head, ...pixels]);
}

describe('HDR', () => {
  it('reads an environment map', async () => {
    const r = await loadHdr(sample('venice_sunset_1k.hdr'));
    expect([r.width, r.height]).toEqual([1024, 512]);
    expect(r.texture.mapping).toBe(THREE.EquirectangularReflectionMapping);
    expect(r.texture.type).toBe(THREE.HalfFloatType);
    expect(r.warnings).toEqual([]);
    // The sun is the brightest point, low over the horizon.
    expect(r.maxLuminance).toBeGreaterThan(r.meanLuminance * 10);
    expect(Math.abs(r.brightest.y)).toBeLessThan(0.5);
  });

  it('reads float pixels, the exposure, and finds the brightest point', async () => {
    const r = await loadHdr({ name: 'tiny.hdr', data: rgbe(4, 2) }, { type: 'float' });
    expect(r.texture.type).toBe(THREE.FloatType);
    expect(r.exposure).toBe(1.5);
    // (128 + 0.5) / 256 * 2^8, against 0.5 elsewhere.
    expect(r.maxLuminance).toBeCloseTo(128.5, 1);
    expect(r.warnings[0]).toContain('4 x 1');
    expect((await loadHdr(sample('spot1Lux.hdr'))).width).toBe(1024);
  });

  it('lights a scene and sets its background', async () => {
    const r = await loadHdr({ name: 'tiny.hdr', data: rgbe(2, 0) });
    const scene = new THREE.Scene();
    applyEnvironment(scene, r.texture, { intensity: 2, rotation: 1 });
    expect(scene.environment).toBe(r.texture);
    expect(scene.background).toBe(r.texture);
    expect(scene.environmentIntensity).toBe(2);
    expect(scene.backgroundRotation.y).toBe(1);
    const lit = new THREE.Scene();
    applyEnvironment(lit, r.texture, { background: false });
    expect(lit.background).toBeNull();
  });

  it('refuses files that are not HDR', async () => {
    await expect(loadHdr('hello')).rejects.toThrow(HdrImportError);
  });
});
