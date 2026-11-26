# Getting started

## Install

```sh
npm install three github:VJigouline/mc-hdr-import
```

## Open a file

`loadHdr` takes the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files. Zip archives among them are opened. It returns a promise of the image.

```ts
import * as THREE from 'three';
import { loadHdr, applyEnvironment } from 'mc-hdr-import';

const input = document.querySelector<HTMLInputElement>('input[type=file]')!;
input.addEventListener('change', async () => {
  const result = await loadHdr(input.files![0]!);
  applyEnvironment(scene, result.texture);   // lights the scene and shows the image behind it
  for (const warning of result.warnings) console.warn(warning);
});
```

## What you get

- **`texture`:** a `THREE.DataTexture` in linear colour, mapped as an equirectangular environment.
- **`maxLuminance`, `meanLuminance` and `brightest`:** how bright the image is, and the direction of its brightest point, such as the sun.
- **`warnings`:** anything that couldn't be read or was left out.

`applyEnvironment(scene, texture, options)` lights the scene with the texture and shows it as the background; its options are `background` (default true), `backgroundBlurriness`, `intensity` and `rotation` (radians about the vertical axis).

The image's centre faces -Z, as three.js maps equirectangular environments; `applyEnvironment` can turn it about the vertical axis.

## Options

- **`main`** (default the first .hdr file): The file to open, if several are given.
- **`type`** (default 'half'): `'half'` or `'float'` pixels.

See the [API](API.md) for every field of the result.
