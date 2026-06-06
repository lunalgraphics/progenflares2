import seedrandom from "seedrandom";
import { Half } from "../flareArtifacts";
import drawArtifact from "../utils/drawArtifact";

/**
 * Core rendering engine for lens flare compositing.
 * Orchestrates artifact re-rendering and final canvas composition.
 *
 * @param {HTMLCanvasElement} baseCanvas - The main output canvas.
 * @param {Object} flareArtifacts - Map of artifact instances (hotspot, streak, etc.).
 * @param {Object} flareSettings - Current flare configuration state.
 * @param {Object} flags - Which artifacts to re-render before compositing.
 * @param {boolean} [flags.hotspot=false]
 * @param {boolean} [flags.streak=false]
 * @param {boolean} [flags.ring=false]
 * @param {boolean} [flags.miIris=false]
 * @param {boolean} [flags.glow=false]
 * @param {boolean} [flags.lensOrbs=false]
 */
export function renderFlare(baseCanvas, flareArtifacts, flareSettings, flags = {}) {
  const {
    hotspot: renderHotspot = false,
    streak: renderStreak = false,
    ring: renderRing = false,
    miIris: renderMI = false,
    glow: renderGlow = false,
    lensOrbs: renderLensOrbs = false,
  } = flags;

  const ds = flareSettings.downscaling;

  // --- Re-render individual artifacts when their settings changed ---

  if (renderHotspot) {
    const a = flareArtifacts.hotspot;
    const s = flareSettings.hotspot;
    a.radius = Math.floor(s.radius / ds);
    a.options.intensity = s.intensity;
    a.options.deformationAmount = s.deformationAmount;
    a.options.deformationFrequency = s.deformationFrequency;
    a.options.deformationSeed = s.deformationSeed;
    a.options.deformationOctaves = s.deformationOctaves;
    a.options.hue = s.hue;
    a.options.saturation = s.saturation;
    a.options.angle = s.angle;
    a.render();
  }

  if (renderStreak) {
    const a = flareArtifacts.streak;
    const s = flareSettings.streak;
    a.radius = Math.floor((s.thickness * 2) / ds);
    a.options.intensity = s.intensity;
    a.options.hue = s.hue;
    a.options.saturation = s.saturation;
    a.render();
    flareArtifacts.streakLeftHalf = new Half(a.canvas, s.width * 2, s.thickness * 2, true, false);
    flareArtifacts.streakRightHalf = new Half(a.canvas, s.width * 2, s.thickness * 2, false, true);
  }

  if (renderRing) {
    const a = flareArtifacts.ring;
    const s = flareSettings.ring;
    a.radius = Math.floor(s.radius / ds);
    a.options.thickness = s.thickness / ds;
    a.options.blur = s.blur / ds;
    a.options.cropSize = s.cropSize / ds;
    a.options.cropHardness = s.cropHardness;
    a.options.hue = s.hue;
    a.options.saturation = s.saturation;
    a.render();
  }

  if (renderMI) {
    const a = flareArtifacts.miIris;
    const s = flareSettings.miIris;
    a.radius = Math.floor(s.radius / ds);
    a.options.sides = s.sides;
    a.options.roundness = s.roundness;
    a.options.fillAlpha = s.fillAlpha;
    a.options.fringeAlpha = s.fringeAlpha;
    a.options.fringeSize = s.fringeSize / ds;
    a.options.blur = s.blur / ds;
    a.options.angle = s.angle;
    a.options.hue = s.hue;
    a.options.saturation = s.saturation;
    a.render();
  }

  if (renderGlow) {
    const a = flareArtifacts.glow;
    const s = flareSettings.glow;
    a.radius = Math.floor(s.radius / ds);
    a.options.intensity = -s.softening;
    a.options.hue = s.hue;
    a.options.saturation = s.saturation;
    a.render();
  }

  if (renderLensOrbs) {
    const a = flareArtifacts.lensOrbs;
    const s = flareSettings.lensOrbs;
    a.radius = Math.floor(s.radius / ds);
    a.options.sides = s.sides;
    a.options.roundness = s.roundness;
    a.options.fillAlpha = s.fillAlpha;
    a.options.fringeAlpha = s.fringeAlpha;
    a.options.fringeSize = s.fringeSize / ds;
    a.options.blur = s.blur / ds;
    a.options.angle = s.angle;
    a.options.hue = s.hue;
    a.options.saturation = s.saturation;
    a.render();
  }

  // --- Composite all visible artifacts onto the main canvas ---

  const ctx = baseCanvas.getContext("2d");
  ctx.restore();
  ctx.save();
  ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

  const pos = flareSettings.positioning;
  const sm = flareSettings.sizeMultiplier;

  // Hotspot
  if (flareSettings.hotspot.visible) {
    const s = flareSettings.hotspot;
    drawArtifact(ctx, flareArtifacts.hotspot, pos.x, pos.y,
      s.radius * 2, s.radius * 2 * (1 - s.anamorph / 100),
      0, s.alpha, 0, sm);
  }

  // Streak(s)
  if (flareSettings.streak.visible) {
    const s = flareSettings.streak;
    let streakAngle = s.angle;
    for (let i = 0; i < s.count; i++) {
      let streakOffset = (pos.pivotX - pos.x) * s.shift / 100;
      if (s.count > 1) {
        streakOffset = s.shift * (i % 2 === 0 ? -1 : 1) / 100 * s.width;
      }
      drawArtifact(ctx, flareArtifacts.streakRightHalf, pos.x, pos.y,
        s.width + streakOffset, s.thickness, streakAngle, s.alpha, 0, sm);
      drawArtifact(ctx, flareArtifacts.streakLeftHalf, pos.x, pos.y,
        s.width - streakOffset, s.thickness, streakAngle, s.alpha, 0, sm);
      streakAngle += 180 / s.count;
    }
  }

  // Ring
  if (flareSettings.ring.visible) {
    const s = flareSettings.ring;
    drawArtifact(ctx, flareArtifacts.ring, pos.x, pos.y,
      s.radius * 2, s.radius * 2 * (1 - s.anamorph / 100),
      0, s.alpha, 0, sm);
  }

  // Multi-Iris
  if (flareSettings.miIris.visible) {
    const s = flareSettings.miIris;
    const miRng = seedrandom(s.seed);

    // Towards focus point
    for (let i = 1; i < s.countTowards; i++) {
      const irisPos = {
        x: pos.x + i * (pos.pivotX - pos.x) * s.spread / 100,
        y: pos.y + i * (pos.pivotY - pos.y) * s.spread / 100,
      };
      let irisScale = 1 + (miRng() - 0.5) * 2 * s.sizeVariance / 100;
      irisScale -= (1 - i / s.countTowards) * s.perspective / 100;
      drawArtifact(ctx, flareArtifacts.miIris, irisPos.x, irisPos.y,
        s.radius * 2 * irisScale,
        s.radius * 2 * irisScale * (1 - s.anamorph / 100),
        0, 100 - s.alphaVariance * miRng(),
        s.hueVariance * (miRng() * 2 - 1), sm);
    }

    // Away from focus point
    for (let i = 1; i < s.countAway; i++) {
      const irisPos = {
        x: pos.x - i * (pos.pivotX - pos.x) * s.spread / 100,
        y: pos.y - i * (pos.pivotY - pos.y) * s.spread / 100,
      };
      let irisScale = 1 + (miRng() - 0.5) * 2 * s.sizeVariance / 100;
      irisScale -= (1 - i / s.countTowards) * s.perspective / 100;
      drawArtifact(ctx, flareArtifacts.miIris, irisPos.x, irisPos.y,
        s.radius * 2 * irisScale,
        s.radius * 2 * irisScale * (1 - s.anamorph / 100),
        0, 100 - s.alphaVariance * miRng(),
        s.hueVariance * (miRng() * 2 - 1), sm);
    }
  }

  // Glow
  if (flareSettings.glow.visible) {
    const s = flareSettings.glow;
    drawArtifact(ctx, flareArtifacts.glow, pos.x, pos.y,
      s.radius * 2, s.radius * 2 * (1 - s.anamorph / 100),
      0, s.alpha, 0, sm);
  }

  // Lens Orbs
  if (flareSettings.lensOrbs.visible) {
    const s = flareSettings.lensOrbs;
    const lensOrbsRng = seedrandom(s.seed);

    for (let i = 1; i < s.count; i++) {
      const orbPos = {
        x: lensOrbsRng() * flareSettings.dimensions.width,
        y: lensOrbsRng() * flareSettings.dimensions.height,
      };
      const distanceFromLight = Math.sqrt(
        Math.pow(pos.x - orbPos.x, 2) + Math.pow(pos.y - orbPos.y, 2)
      );
      let orbAlpha = Math.max(0, (1 - distanceFromLight / s.threshold) * 100);
      orbAlpha = Math.max(0, orbAlpha - s.alphaVariance * lensOrbsRng());
      const orbScale = 1 + (lensOrbsRng() - 0.5) * 2 * s.sizeVariance / 100;
      drawArtifact(ctx, flareArtifacts.lensOrbs, orbPos.x, orbPos.y,
        s.radius * 2 * orbScale,
        s.radius * 2 * orbScale * (1 - s.anamorph / 100),
        0, orbAlpha, s.hueVariance * (lensOrbsRng() * 2 - 1), sm);
    }
  }
}
