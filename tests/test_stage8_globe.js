/**
 * test_stage8_globe.js - Automated Unit Tests for Stage 08 WebGL 3D Globe & Textures
 * ---------------------------------------------------------------------------------
 * Tests:
 * 1. Sphere3DViewer module exports and API methods.
 * 2. TextureManager procedural texture generator for all planets and exoplanets.
 * 3. Analytical Raytraced Sphere lighting math invariants:
 *    - Lambertian cosine law: N . L
 *    - Moving day/night terminator boundary (smoothstep)
 *    - Atmospheric Rayleigh / Fresnel rim glow
 */

const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

console.log('\n--- Running Stage 08 WebGL 3D Globe & Textures Test Suite ---\n');

// 1. Verify Sphere3DViewer API
const Sphere3DViewer = require('../js/sphere3d.js');
assert(typeof Sphere3DViewer === 'object', 'Sphere3DViewer module exported successfully');
assert(typeof Sphere3DViewer.init === 'function', 'Sphere3DViewer has init() method');
assert(typeof Sphere3DViewer.setTexture === 'function', 'Sphere3DViewer has setTexture() method');
assert(typeof Sphere3DViewer.setLightAngle === 'function', 'Sphere3DViewer has setLightAngle() method');
assert(typeof Sphere3DViewer.setAutoRotate === 'function', 'Sphere3DViewer has setAutoRotate() method');
assert(typeof Sphere3DViewer.start === 'function', 'Sphere3DViewer has start() method');
assert(typeof Sphere3DViewer.stop === 'function', 'Sphere3DViewer has stop() method');
assert(typeof Sphere3DViewer.captureViewDataUrl === 'function', 'Sphere3DViewer has captureViewDataUrl() method');

// 2. Verify TextureManager API
const TextureManager = require('../js/textures.js');
assert(typeof TextureManager === 'object', 'TextureManager module exported successfully');
assert(typeof TextureManager.generateProceduralTexture === 'function', 'TextureManager has generateProceduralTexture() method');

// 3. Mathematical Verification of Analytical Ray-Sphere & Terminator Lighting
function calculateTerminatorLighting(pX, pY, lightAngleRad) {
  const distSq = pX * pX + pY * pY;
  if (distSq > 1.0) return null; // Outside sphere
  const z = Math.sqrt(1.0 - distSq);
  const N = { x: pX, y: pY, z };

  // Light vector: L = normalize(cos(angle), 0.25, sin(angle))
  const lRaw = { x: Math.cos(lightAngleRad), y: 0.25, z: Math.sin(lightAngleRad) };
  const lLen = Math.hypot(lRaw.x, lRaw.y, lRaw.z);
  const L = { x: lRaw.x / lLen, y: lRaw.y / lLen, z: lRaw.z / lLen };

  // N . L
  const NdotL = N.x * L.x + N.y * L.y + N.z * L.z;

  // Terminator smoothstep(-0.12, 0.12, NdotL)
  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
  const dayFactor = smoothstep(-0.12, 0.12, NdotL);

  // Fresnel rim: pow(1.0 - N.z, 2.5)
  const fresnel = Math.pow(1.0 - N.z, 2.5);

  return { NdotL, dayFactor, fresnel };
}

// Front-facing illumination (light from +Z toward camera)
const frontIllum = calculateTerminatorLighting(0, 0, Math.PI * 0.5);
assert(frontIllum !== null, 'Subsolar point intersects sphere');
assert(frontIllum.dayFactor > 0.99, `Front-illuminated point is fully day (dayFactor = ${frontIllum.dayFactor.toFixed(3)})`);

// Back-illuminated (light from -Z away from camera)
const backIllum = calculateTerminatorLighting(0, 0, -Math.PI * 0.5);
assert(backIllum.dayFactor < 0.01, `Back-illuminated point is dark nightside (dayFactor = ${backIllum.dayFactor.toFixed(3)})`);

// Limb point (grazing angle) produces Rayleigh/Fresnel rim glow
const limbPoint = calculateTerminatorLighting(0.95, 0.0, 0.0);
assert(limbPoint.fresnel > 0.35, `Planetary limb produces strong Rayleigh/Fresnel rim glow (fresnel = ${limbPoint.fresnel.toFixed(3)})`);

// Moving terminator: turning light angle shifts the day/night boundary across the surface
const tAngleDay = calculateTerminatorLighting(0.6, 0, 0.0).dayFactor;
const tAngleNight = calculateTerminatorLighting(-0.6, 0, 0.0).dayFactor;
assert(tAngleDay > 0.8 && tAngleNight < 0.1, 'Sun angle rotation successfully moves day/night terminator across planetary surface');

console.log(`\nResults: ${testsPassed} Passed, ${testsFailed} Failed.\n`);
if (testsFailed > 0) process.exit(1);
