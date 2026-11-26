# Formats and support

mc-hdr-import reads Radiance HDR with three.js's HDRLoader.

## What is read

- Radiance RGBE images, run-length encoded or not, as half-float or float textures in linear colour, mapped as equirectangular environments.
- The header's exposure and gamma.
- The brightest and mean luminance, and the direction of the brightest point, such as the sun, to place a matching light.

## Orientation and units

The image's centre faces -Z, as three.js maps equirectangular environments; `applyEnvironment` can turn it about the vertical axis.

## Limits

XYZE images are read as RGB. Images that are not twice as wide as they are high get a warning, as they are not equirectangular.
