/**
 * test_moons.js - Stage 06 Moons & Satellite Subsystems Test Suite
 * -----------------------------------------------------------------
 * Verifies verified NASA figures for Jovian, Saturnian, and Lunar satellites,
 * biophysical gravitational weight, orbital period (parent planet year),
 * and scientific sky configurations.
 */

const assert = require('assert');
const CelestialCalculator = require('../js/calculator.js');
const planetsData = require('../data/planets.json');

let passCount = 0;
let failCount = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    Error: ${err.message}`);
    failCount++;
  }
}

console.log('\n--- Running Stage 06 Moons Test Suite ---\n');

// 1. Dataset Verification
const MOON_IDS = ['moon', 'io', 'europa', 'ganymede', 'callisto', 'enceladus', 'titan'];

MOON_IDS.forEach((id) => {
  it(`Moons Dataset: ${id} exists with verified NASA facts`, () => {
    const moon = planetsData.find((p) => p.id === id);
    assert(moon, `Moon ${id} must exist in planets.json`);
    assert(moon.gravity, `Moon ${id} must have gravity value`);
    assert(moon.lengthOfDay, `Moon ${id} must have lengthOfDay`);
    assert(moon.orbitalPeriodYears > 0, `Moon ${id} must have parent orbital period`);
    assert.strictEqual(moon.isTidallyLocked, true, `Moon ${id} must be flagged as tidally locked`);
  });
});

// 2. Biophysical Weight Calculations on Moons
it('Enceladus Weight: 70 kg person weighs only ~0.8 kg due to micro-gravity (0.11 m/s²)', () => {
  const enceladus = planetsData.find((p) => p.id === 'enceladus');
  const result = CelestialCalculator.calculateWeightOnPlanet(70, enceladus.gravity);
  assert.strictEqual(result.value, 0.8);
});

it('Europa Weight: 70 kg person weighs approx 9.3 kg on the ice shell (1.3 m/s²)', () => {
  const europa = planetsData.find((p) => p.id === 'europa');
  const result = CelestialCalculator.calculateWeightOnPlanet(70, europa.gravity);
  assert.strictEqual(result.value, 9.3);
});

it('Io Weight: 70 kg person weighs approx 12.8 kg on the volcanic plains (1.8 m/s²)', () => {
  const io = planetsData.find((p) => p.id === 'io');
  const result = CelestialCalculator.calculateWeightOnPlanet(70, io.gravity);
  assert.strictEqual(result.value, 12.8);
});

// 3. Moon Planetary Age Invariants (Shared with Parent Orbit)
it('Jovian Moons Age: A 30-year-old on Io/Europa/Ganymede/Callisto has lived ~2.5 Jovian years', () => {
  const refDate = new Date('2030-01-01T00:00:00Z');
  const birthDate = new Date('2000-01-01T00:00:00Z');
  const result = CelestialCalculator.calculateAgeOnPlanet(birthDate, 11.86, refDate);
  assert.strictEqual(Math.round(result.value * 10) / 10, 2.5);
});

it('Saturnian Moons Age: A 30-year-old on Titan/Enceladus has lived ~1.0 Saturnian year', () => {
  const refDate = new Date('2030-01-01T00:00:00Z');
  const birthDate = new Date('2000-01-01T00:00:00Z');
  const result = CelestialCalculator.calculateAgeOnPlanet(birthDate, 29.46, refDate);
  assert.strictEqual(Math.round(result.value * 10) / 10, 1.0);
});

console.log(`\nResults: ${passCount} Passed, ${failCount} Failed.\n`);
assert.strictEqual(failCount, 0, 'All moon tests must pass');
