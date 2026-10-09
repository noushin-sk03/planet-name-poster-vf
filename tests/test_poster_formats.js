/**
 * test_poster_formats.js - Unit Test Suite for Poster Export Formats,
 * Safe Zones, Custom Dimension Clamping, and Device Fallback Configs.
 */

const assert = require('assert');
const PosterRenderer = require('../js/poster.js');

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedCount++;
  }
}

console.log('\n--- Running Poster Format & Safe Zone Test Suite ---\n');

// 1. Format Existence & Dimensions
runTest('All required user-requested export formats exist in EXPORT_SIZES', () => {
  const sizes = PosterRenderer.EXPORT_SIZES;
  assert.ok(sizes, 'EXPORT_SIZES must be defined');

  // Verify social formats
  assert.strictEqual(sizes.x_post.width, 1600);
  assert.strictEqual(sizes.x_post.height, 900);

  assert.strictEqual(sizes.link_preview.width, 1200);
  assert.strictEqual(sizes.link_preview.height, 630);

  assert.strictEqual(sizes.pinterest.width, 1000);
  assert.strictEqual(sizes.pinterest.height, 1500);

  // Verify wallpaper formats
  assert.strictEqual(sizes.phone_wallpaper.width, 1170);
  assert.strictEqual(sizes.phone_wallpaper.height, 2532);

  assert.strictEqual(sizes.desktop_4k.width, 3840);
  assert.strictEqual(sizes.desktop_4k.height, 2160);

  assert.strictEqual(sizes.tablet.width, 2048);
  assert.strictEqual(sizes.tablet.height, 1536);

  assert.strictEqual(sizes.ultrawide.width, 2560);
  assert.strictEqual(sizes.ultrawide.height, 1080);

  // Verify print format
  assert.strictEqual(sizes.a4.width, 2480);
  assert.strictEqual(sizes.a4.height, 3508);

  // Verify custom
  assert.ok(sizes.custom, 'Custom format entry must exist');
});

// 2. Safe-Zone Values & Proportions
runTest('Each format specifies a positive safeZone value to protect typography', () => {
  const sizes = PosterRenderer.EXPORT_SIZES;
  const requiredKeys = [
    'portrait', 'landscape', 'square', 'story',
    'x_post', 'link_preview', 'pinterest',
    'phone_wallpaper', 'desktop_4k', 'tablet', 'ultrawide',
    'a4', 'custom'
  ];

  requiredKeys.forEach((key) => {
    const cfg = sizes[key];
    assert.ok(cfg, `Format ${key} must exist`);
    assert.strictEqual(typeof cfg.safeZone, 'number', `Format ${key} must have numeric safeZone`);
    assert.ok(cfg.safeZone >= 40, `Format ${key} safeZone (${cfg.safeZone}) must be >= 40px`);
    assert.ok(cfg.safeZone <= cfg.width * 0.15, `Format ${key} safeZone must not exceed 15% of width`);
  });
});

// 3. Aspect Ratio and Preview Dimensions
runTest('Each format specifies consistent aspectRatio and preview dimensions', () => {
  const sizes = PosterRenderer.EXPORT_SIZES;
  Object.keys(sizes).forEach((key) => {
    const cfg = sizes[key];
    assert.ok(typeof cfg.aspectRatio === 'string' || typeof cfg.aspectRatio === 'number', 'aspectRatio must be string or number');
    assert.strictEqual(typeof cfg.previewWidth, 'number');
    assert.strictEqual(typeof cfg.previewHeight, 'number');
    assert.ok(cfg.previewWidth <= 1400, 'previewWidth must fit within responsive canvas bounds');
    assert.ok(cfg.previewHeight <= 1400, 'previewHeight must fit within responsive canvas bounds');
  });
});

// 4. Custom Dimension Clamping
runTest('getFormatConfig clamps custom size to min 320px and max 4096px', () => {
  // Test lower bound clamp
  const lowCfg = PosterRenderer.getFormatConfig('custom', { customWidth: 100, customHeight: 250 });
  assert.strictEqual(lowCfg.width, 320, 'Width below 320 must clamp to 320');
  assert.strictEqual(lowCfg.height, 320, 'Height below 320 must clamp to 320');

  // Test upper bound clamp
  const highCfg = PosterRenderer.getFormatConfig('custom', { customWidth: 5000, customHeight: 8888 });
  assert.strictEqual(lowCfg.width <= 4096, true);
  assert.strictEqual(highCfg.width, 4096, 'Width above 4096 must clamp to 4096');
  assert.strictEqual(highCfg.height, 4096, 'Height above 4096 must clamp to 4096');

  // Test valid custom dimensions
  const normalCfg = PosterRenderer.getFormatConfig('custom', { customWidth: 1440, customHeight: 900 });
  assert.strictEqual(normalCfg.width, 1440);
  assert.strictEqual(normalCfg.height, 900);
});

// 5. Weak Device Memory Fallback Targets
runTest('High-memory formats specify fallbackFormat for weak devices', () => {
  const sizes = PosterRenderer.EXPORT_SIZES;
  assert.strictEqual(sizes.desktop_4k.fallbackFormat, 'landscape', '4K must fall back to 1080p landscape');
  assert.ok(sizes.a4.fallbackFormat, 'A4 must have fallback configuration');
});

console.log(`\nResults: ${passedCount} Passed, ${failedCount} Failed.\n`);

if (failedCount > 0) {
  process.exit(1);
}
