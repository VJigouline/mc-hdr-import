# mc-hdr-import

A Radiance HDR importer for [three.js](https://threejs.org/), written in TypeScript. It reads Radiance HDR (RGBE) images as equirectangular environment maps, which light a scene with image-based lighting and show behind it. It was made for [SceneEditor](https://github.com/VJigouline/SceneEditor), and works in any three.js application.

```ts
import { loadHdr, applyEnvironment } from 'mc-hdr-import';

const result = await loadHdr(await file.arrayBuffer());
applyEnvironment(scene, result.texture);   // lights the scene and shows the image behind it
console.log(result.warnings);       // anything that couldn't be read
```

## What it reads

- Radiance RGBE images, run-length encoded or not, as half-float or float textures in linear colour, mapped as equirectangular environments.
- The header's exposure and gamma.
- The brightest and mean luminance, and the direction of the brightest point, such as the sun, to place a matching light.

XYZE images are read as RGB. Images that are not twice as wide as they are high get a warning, as they are not equirectangular. See [Formats and support](Documentation/Support.md) for the details.

## Install

The package is not on the npm registry. Install it from GitHub:

```sh
npm install github:VJigouline/mc-hdr-import
```

`three` (r160 or later) is a peer dependency. The package builds itself on install.

## Documentation

- [Getting started](Documentation/GettingStarted.md)
- [API](Documentation/API.md)
- [Formats and support](Documentation/Support.md)
- [Using it in SceneEditor](Documentation/SceneEditor.md)

## Development

```sh
npm install
npm test           # unit tests, with Vitest
npm run typecheck
npm run build      # dist/
```

The tests load real Radiance HDR files, kept in [`tests/samples`](tests/samples/README.md) with their licences. It needs Node.js 22 or later.

## Licence

[MIT](LICENSE)
