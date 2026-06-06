/**
 * Default flare settings used when creating a new project.
 * Each top-level key corresponds to a flare artifact layer.
 */
export const DEFAULT_FLARE_SETTINGS = {
  downscaling: 5 / 2,
  exportType: "png",
  sizeMultiplier: 1,

  dimensions: {
    width: 1920,
    height: 1080,
  },

  positioning: {
    x: 960,
    y: 540,
    pivotX: 960,
    pivotY: 540,
  },

  hotspot: {
    visible: true,
    radius: 500,
    intensity: 5,
    deformationAmount: 1.6,
    deformationFrequency: 0.006,
    deformationSeed: 1,
    deformationOctaves: 5,
    alpha: 100,
    angle: 0,
    hue: 200,
    saturation: 100,
    anamorph: 0,
  },

  streak: {
    visible: true,
    thickness: 64,
    width: 1600,
    intensity: 5,
    count: 1,
    angle: 0,
    shift: 36,
    alpha: 100,
    hue: 200,
    saturation: 100,
  },

  ring: {
    visible: true,
    radius: 200,
    thickness: 40,
    blur: 5,
    cropSize: 0,
    cropHardness: 50,
    alpha: 21,
    hue: 200,
    saturation: 100,
    anamorph: 0,
  },

  miIris: {
    visible: true,
    radius: 81,
    sides: 5,
    roundness: 20,
    angle: 0,
    fillAlpha: 25,
    fringeAlpha: 50,
    fringeSize: 10,
    blur: 4,
    countAway: 5,
    countTowards: 12,
    spread: 30,
    sizeVariance: 40,
    perspective: 100,
    alphaVariance: 50,
    seed: 123,
    hue: 200,
    saturation: 100,
    hueVariance: 30,
    anamorph: 0,
  },

  glow: {
    visible: true,
    radius: 960,
    alpha: 50,
    softening: 70,
    hue: 200,
    saturation: 100,
    anamorph: 0,
  },

  lensOrbs: {
    visible: true,
    radius: 45,
    sides: 6,
    roundness: 100,
    angle: 0,
    fillAlpha: 8,
    fringeAlpha: 11,
    fringeSize: 17,
    blur: 5,
    count: 100,
    threshold: 1200,
    seed: 124,
    sizeVariance: 0,
    alphaVariance: 50,
    hue: 200,
    saturation: 100,
    hueVariance: 360,
    anamorph: 0,
  },
};

/**
 * Creates a deep copy of the default flare settings.
 * @returns {Object} A fresh settings object.
 */
export function createDefaultSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_FLARE_SETTINGS));
}
