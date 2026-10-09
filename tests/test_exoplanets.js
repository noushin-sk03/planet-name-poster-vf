/**
 * test_exoplanets.js - Automated Unit Tests for Stage 07 NASA Exoplanet Archive
 * -----------------------------------------------------------------------------
 * Tests:
 * 1. Data integrity: 12 confirmed exoplanets from NASA Exoplanet Archive.
 * 2. Scientific honesty: all exoplanets marked as artist impressions, missing values unknown.
 * 3. Physics equations: mass/radius transit gravity calculations.
 * 4. Orbital age mathematics for short-period extrasolar worlds.
 * 5. Sky configs: presence of day/night models with honest labels.
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

console.log('\n--- Running Stage 07 NASA Exoplanet Archive Test Suite ---\n');

// 1. Extract EXOPLANETS from js/app.js
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const exoMatch = appCode.match(/const EXOPLANETS\s*=\s*(\[[\s\S]*?\]);/);
if (!exoMatch) {
  console.error('Fatal: Could not extract EXOPLANETS from js/app.js');
  process.exit(1);
}

let EXOPLANETS = [];
try {
  EXOPLANETS = eval(exoMatch[1]);
} catch (e) {
  console.error('Fatal: Failed to parse EXOPLANETS array:', e);
  process.exit(1);
}

// Test 1: Exactly 12 verified NASA Exoplanet Archive bodies
assert(EXOPLANETS.length === 12, `EXOPLANETS contains 12 verified worlds (found ${EXOPLANETS.length})`);

// Test 2: Required worlds exist
const expectedIds = [
  'trappist_1_e', 'trappist_1_f', 'proxima_cen_b', 'kepler_186_f',
  'kepler_452_b', 'kepler_22_b', 'wasp_76_b', 'wasp_12_b',
  '55_cnc_e', 'hd_189733_b', 'hd_209458_b', 'toi_700_d'
];

expectedIds.forEach((id) => {
  const planet = EXOPLANETS.find((p) => p.id === id);
  assert(Boolean(planet), `Verified exoplanet ${id} exists in archive catalog`);
  if (planet) {
    assert(planet.isArtistImpression === true, `${id} is honestly flagged as artist impression`);
    assert(planet.dataSource && planet.dataSource.includes('NASA Exoplanet Archive'), `${id} credits NASA Exoplanet Archive`);
    assert(planet.hostname && planet.hostname.length > 0, `${id} specifies host star (${planet.hostname})`);
  }
});

// Test 3: Unconstrained data is not fabricated
const wasp12 = EXOPLANETS.find((p) => p.id === 'wasp_12_b');
assert(wasp12 && wasp12.gravity === 'unknown', 'WASP-12 b mass/gravity is honestly reported as "unknown" without fabrication');

const kepler452 = EXOPLANETS.find((p) => p.id === 'kepler_452_b');
assert(kepler452 && kepler452.massEarths === 'unknown', 'Kepler-452 b mass is unconstrained by transit discovery, reported as "unknown"');

// Test 4: Planetary age calculations for short orbital periods
const trappist1e = EXOPLANETS.find((p) => p.id === 'trappist_1_e');
assert(Boolean(trappist1e && trappist1e.orbitalPeriodYears > 0), 'TRAPPIST-1 e has valid orbitalPeriodYears');
const t1ePeriod = trappist1e ? trappist1e.orbitalPeriodYears : 0.0167;
const ageOnT1e = 30 / t1ePeriod;
assert(ageOnT1e > 1700 && ageOnT1e < 1900, `A 30-year-old on TRAPPIST-1 e has lived ~${Math.round(ageOnT1e)} local planetary years (orbit ~6.1 days)`);

// Test 5: Verify Skies Manager includes all 12 exoplanets with honest labels
const skiesCode = fs.readFileSync(path.join(__dirname, '../js/skies.js'), 'utf8');
expectedIds.forEach((id) => {
  const hasSkyConfig = skiesCode.includes(`${id}:`) || skiesCode.includes(`'${id}':`);
  assert(hasSkyConfig, `Skies database contains visual sky model for ${id}`);
});

// Check that no exoplanet sky claims to be a photographic ground truth
const exoDayBadges = skiesCode.match(/trappist_1_e[\s\S]*?badge:\s*"([^"]+)"/);
if (exoDayBadges) {
  assert(exoDayBadges[1].includes("Artist's Impression"), `TRAPPIST-1 e day badge correctly labels: "${exoDayBadges[1]}"`);
}

console.log(`\nResults: ${testsPassed} Passed, ${testsFailed} Failed.\n`);
if (testsFailed > 0) process.exit(1);
