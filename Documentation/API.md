# API

## `loadHdr(input, options?)`

Reads `.hdr` (Radiance RGBE) and returns a promise of a `HdrLoadResult`.

`input` is the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files. Zip archives among them are opened.

It throws a `HdrImportError` for input that isn't Radiance HDR.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `main` | the first .hdr file | The file to open, if several are given. |
| `type` | 'half' | `'half'` or `'float'` pixels. |

### `HdrLoadResult`

| Field | Type | Meaning |
| --- | --- | --- |
| `texture` | `THREE.DataTexture` | The environment texture. |
| `width` | `number` | Width in pixels. |
| `height` | `number` | Height in pixels. |
| `exposure` | `number` | The header's exposure. |
| `gamma` | `number` | The header's gamma. |
| `maxLuminance` | `number` | The brightest pixel's luminance. |
| `meanLuminance` | `number` | The mean luminance. |
| `brightest` | `THREE.Vector3` | Direction of the brightest pixel. |
| `warnings` | `string[]` | Problems that didn't stop the import. |

## `applyEnvironment(scene, texture, options?)`

Sets the texture as the scene's `environment`, which lights physically based materials, and, unless `background` is false, as its `background`. Options: `background`, `backgroundBlurriness`, `intensity`, `rotation`.

See the package's `index.d.ts` for every exported type and helper.
