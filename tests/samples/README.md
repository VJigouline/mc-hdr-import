# Radiance HDR test files

Real Radiance HDR files that the tests load. They are unchanged copies, taken at commit `1d3772857e` of three.js.

| Files | What they cover | Source and licence |
| --- | --- | --- |
| `venice_sunset_1k.hdr` | An outdoor environment with the sun | By Greg Zaal for [Poly Haven](https://polyhaven.com/a/venice_sunset), [CC0](https://creativecommons.org/publicdomain/zero/1.0/), as copied into the three.js repository (`examples/textures/equirectangular`). |
| `spot1Lux.hdr` | A dark environment with one bright spot | The [three.js](https://github.com/mrdoob/three.js) repository (`examples/textures/equirectangular`), under its [MIT licence](https://github.com/mrdoob/three.js/blob/dev/LICENSE); no other licence is stated for them. |

The tests also write small images of their own.

These files keep their own licences. They are test data only, and are not part of the npm package, which includes only `dist`, `Documentation`, `README.md` and `LICENSE`.
