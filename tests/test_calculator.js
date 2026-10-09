/**
 * test_calculator.js - Automated Test Suite for CelestialCalculator
 * -----------------------------------------------------------------
 * Verifies formulas against known celestial benchmarks, edge cases,
 * empty inputs, invalid inputs, and future dates.
 */

const assert = require('assert');
const CelestialCalculator = require('../js/calculator.js');

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

console.log('\n--- Running CelestialCalculator Test Suite ---\n');

// 1. Earth Baseline Invariant Tests (Earth should return identical or near-identical values)
it('Earth Weight Invariant: 70 kg on Earth produces 70.0 kg (ratio ~ 1.0)', () => {
  const result = CelestialCalculator.calculateWeightOnPlanet(70, 9.8);
  assert.strictEqual(Math.round(result.value), 70);
  assert.strictEqual(result.ratio, 1.0);
});

it('Earth Age Invariant: Person born exactly 20 Earth years ago is 20.0 Earth years old on Earth', () => {
  const refDate = new Date('2025-01-01T00:00:00Z');
  const birthDate = new Date('2005-01-01T00:00:00Z');
  const result = CelestialCalculator.calculateAgeOnPlanet(birthDate, 1.0, refDate);
  assert.strictEqual(Math.round(result.value), 20);
});

it('Earth Day Invariant: 1 Earth day equals 1.0 Earth days', () => {
  const result = CelestialCalculator.calculateDiurnalRatio(24.0);
  assert.strictEqual(result.planetDaysPerEarthDay, 1.0);
  assert.strictEqual(result.earthDaysPerPlanetDay, 1.0);
});

// 2. Multi-World Gravity Tests
it('Mars Weight: 70 kg on Mars (g = 3.7) weighs approx 26.4 kg', () => {
  const result = CelestialCalculator.calculateWeightOnPlanet(70, '3.7 m/s²');
  // 70 * (3.7 / 9.80665) = 26.410
  assert.strictEqual(result.value, 26.4);
});

it('Jupiter Weight: 70 kg on Jupiter (g = 24.8) weighs approx 177.0 kg', () => {
  const result = CelestialCalculator.calculateWeightOnPlanet(70, '24.8 m/s²');
  // 70 * (24.8 / 9.80665) = 177.02
  assert.strictEqual(result.value, 177.0);
});

// 3. Multi-World Orbital Age Tests
it('Mars Age: 30 Earth years on Mars (orbital period 1.881) is approx 16.0 Mars years', () => {
  const refDate = new Date('2030-01-01T00:00:00Z');
  const birthDate = new Date('2000-01-01T00:00:00Z'); // ~30 years
  const result = CelestialCalculator.calculateAgeOnPlanet(birthDate, 1.881, refDate);
  // 30 / 1.881 = 15.95 ~ 16.0
  assert.strictEqual(Math.round(result.value), 16);
});

it('Moon Orbital Year: Jovian Moon (Io/Europa) shares Jupiter orbital year (11.86 Earth years)', () => {
  const refDate = new Date('2030-01-01T00:00:00Z');
  const birthDate = new Date('2000-01-01T00:00:00Z');
  const result = CelestialCalculator.calculateAgeOnPlanet(birthDate, 11.86, refDate);
  assert.strictEqual(Number(result.value.toFixed(1)), 2.5);
});

it('Exoplanet Year Length in Days: TRAPPIST-1 e (6.1 days orbit) calculates correctly', () => {
  const periodYears = 6.1 / 365.2425; // ~0.0167 years
  const refDate = new Date('2025-01-01');
  const birthDate = new Date('2024-01-01'); // 1 year lived
  const result = CelestialCalculator.calculateAgeOnPlanet(birthDate, periodYears, refDate);
  assert.strictEqual(Math.round(result.value), 60); // ~60 TRAPPIST-1e years
});

it('Exoplanet Gravity Calculation: TRAPPIST-1 e (M=0.69, R=0.92) produces ~8.0 m/s²', () => {
  const m = 0.69;
  const r = 0.92;
  const g = (m / (r * r)) * 9.80665;
  assert.strictEqual(Number(g.toFixed(1)), 8.0);
});

it('Sun Edge Case: The Sun does not orbit a host star (orbitalPeriod = 0)', () => {
  const refDate = new Date('2025-01-01');
  const birthDate = new Date('2000-01-01');
  const result = CelestialCalculator.calculateAgeOnPlanet(birthDate, 0, refDate);
  assert.strictEqual(result.value, null);
  assert.strictEqual(result.formatted, 'N/A');
});

// 4. Input Robustness & Error Handling
it('Empty / Null weight input returns graceful null value without throwing', () => {
  const r1 = CelestialCalculator.calculateWeightOnPlanet(null, 3.7);
  const r2 = CelestialCalculator.calculateWeightOnPlanet('', 3.7);
  const r3 = CelestialCalculator.calculateWeightOnPlanet(-10, 3.7);
  assert.strictEqual(r1.value, null);
  assert.strictEqual(r2.value, null);
  assert.strictEqual(r3.value, null);
});

it('Empty birth date returns null without throwing', () => {
  const r = CelestialCalculator.calculateAgeOnPlanet('', 1.881);
  assert.strictEqual(r.value, null);
  assert.strictEqual(r.formatted, '—');
});

it('Invalid birth date string returns descriptive error', () => {
  const r = CelestialCalculator.calculateAgeOnPlanet('not-a-date', 1.881);
  assert.strictEqual(r.value, null);
  assert.strictEqual(r.error, 'Invalid birth date format');
});

it('Future birth date is caught and rejected gracefully', () => {
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 year in the future
  const r = CelestialCalculator.calculateAgeOnPlanet(futureDate, 1.881);
  assert.strictEqual(r.value, null);
  assert.strictEqual(r.error, 'Future date');
});

// 5. Diurnal Period Comparison Tests
it('Jupiter Diurnal Ratio: 9.9 hour day means ~2.42 Jupiter days in one 24-hr Earth day', () => {
  const r = CelestialCalculator.calculateDiurnalRatio('9.9 hours');
  assert.strictEqual(r.planetDaysPerEarthDay, 2.424);
});

it('Venus Diurnal Ratio: 2802.0 hour day means ~0.009 Venus days in one Earth day', () => {
  const r = CelestialCalculator.calculateDiurnalRatio('2,802.0 hours (116.75 Earth days)');
  assert.strictEqual(r.planetDaysPerEarthDay, 0.009);
  assert.strictEqual(r.earthDaysPerPlanetDay, 116.75);
});

console.log(`\nResults: ${passCount} Passed, ${failCount} Failed.`);
if (failCount > 0) {
  process.exit(1);
}
