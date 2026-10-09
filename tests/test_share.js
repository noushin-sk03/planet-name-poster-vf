/**
 * test_share.js - Automated Test Suite for ShareManager
 * -----------------------------------------------------
 * Verifies URL parsing, serialization, and input sanitization.
 */

const assert = require('assert');
const ShareManager = require('../js/share.js');

const mockPlanets = [
  { id: 'mercury', name: 'Mercury' },
  { id: 'mars', name: 'Mars' },
  { id: 'jupiter', name: 'Jupiter' }
];

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

console.log('\n--- Running ShareManager Test Suite ---\n');

it('Parses valid URL parameters completely', () => {
  const query = '?name=Aria&planet=mars&mode=night&size=square&weight=65&dob=2000-05-15';
  const state = ShareManager.parseUrlParams(query, mockPlanets);
  assert.strictEqual(state.name, 'Aria');
  assert.strictEqual(state.planetId, 'mars');
  assert.strictEqual(state.mode, 'night');
  assert.strictEqual(state.size, 'square');
  assert.strictEqual(state.weight, 65);
  assert.strictEqual(state.dob, '2000-05-15');
});

it('Falls back to safe defaults when query is empty', () => {
  const state = ShareManager.parseUrlParams('', mockPlanets);
  assert.strictEqual(state.name, 'COSMOS');
  assert.strictEqual(state.planetId, 'jupiter');
  assert.strictEqual(state.mode, 'day');
  assert.strictEqual(state.size, 'portrait');
  assert.strictEqual(state.weight, null);
});

it('Rejects unknown planet and falls back safely', () => {
  const query = '?planet=krypton';
  const state = ShareManager.parseUrlParams(query, mockPlanets);
  assert.strictEqual(state.planetId, 'jupiter');
});

it('Sanitizes XSS payloads from name parameter', () => {
  const dirty = '?name=<script>alert(1)</script>John';
  const state = ShareManager.parseUrlParams(dirty, mockPlanets);
  assert.strictEqual(state.name, 'John');
  assert.strictEqual(state.name.includes('<script>'), false);
});

it('Clamps name length to 20 characters', () => {
  const longName = '?name=Supercalifragilisticexpialidocious';
  const state = ShareManager.parseUrlParams(longName, mockPlanets);
  assert.strictEqual(state.name.length, 20);
});

it('Rejects invalid export size and falls back to portrait', () => {
  const query = '?size=billboard';
  const state = ShareManager.parseUrlParams(query, mockPlanets);
  assert.strictEqual(state.size, 'portrait');
});

it('Rejects future birth date', () => {
  const query = '?dob=2099-01-01';
  const state = ShareManager.parseUrlParams(query, mockPlanets);
  assert.strictEqual(state.dob, '');
});

it('Serializes state to clean query string', () => {
  const state = {
    name: 'Elena',
    planetId: 'mars',
    mode: 'night',
    size: 'square',
    weight: 55,
    dob: '1998-11-20'
  };
  const qs = ShareManager.serializeStateToQueryString(state);
  assert.strictEqual(qs.includes('name=Elena'), true);
  assert.strictEqual(qs.includes('planet=mars'), true);
  assert.strictEqual(qs.includes('mode=night'), true);
  assert.strictEqual(qs.includes('size=square'), true);
  assert.strictEqual(qs.includes('weight=55'), true);
});

console.log(`\nResults: ${passCount} Passed, ${failCount} Failed.`);
if (failCount > 0) process.exit(1);
