/**
 * benchmark_motion.js
 * Benchmarks the computational load per frame for:
 * 1. 240 stars parallax drift & twinkle calculation
 * 2. 220 asteroid belt orbit mechanics
 * 3. 11 planetary orbit projections + internal cloud drift math
 * 4. SkiesManager parametric calculation (star scintillation, clouds, corona, horizon)
 */
const { performance } = require('perf_hooks');

const STAR_COUNT = 240;
const ASTEROID_COUNT = 220;
const PLANET_COUNT = 11;

// Setup mock entities
const stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
  stars.push({
    xRatio: Math.random(),
    yRatio: Math.random(),
    radius: Math.random() * 1.4 + 0.35,
    baseAlpha: Math.random() * 0.7 + 0.25,
    twinkleSpeed: Math.random() * 0.025 + 0.008,
    twinklePhase: Math.random() * Math.PI * 2,
    parallaxSpeed: Math.random() * 0.4 + 0.8
  });
}

const asteroidBelt = [];
for (let i = 0; i < ASTEROID_COUNT; i++) {
  asteroidBelt.push({
    orbitScale: 0.535 + Math.random() * 0.055,
    angle: Math.random() * Math.PI * 2,
    speed: 0.00055 + (Math.random() - 0.5) * 0.00012,
    radius: Math.random() * 1.5 + 0.45,
    alpha: Math.random() * 0.55 + 0.35
  });
}

const planets = [];
for (let i = 0; i < PLANET_COUNT; i++) {
  planets.push({
    orbitScale: 0.18 + i * 0.09,
    angle: Math.random() * Math.PI * 2,
    speed: 0.001 / (i + 1),
    radius: 8 + (i % 3) * 4
  });
}

function projectOrbit(scaleRatio, angle, baseRadius = 350) {
  const a = baseRadius * scaleRatio;
  const b = a * 0.43;
  const tilt = -0.32;
  const ex = a * Math.cos(angle);
  const ey = b * Math.sin(angle);
  const x = 500 + (ex * Math.cos(tilt) - ey * Math.sin(tilt));
  const y = 400 + (ex * Math.sin(tilt) + ey * Math.cos(tilt));
  return { x, y };
}

// Run 300 simulation frames (equivalent to 5 full seconds at 60 FPS)
const FRAMES = 300;
let driftX = 0;
let driftY = 0;
let totalTime = 0;

const start = performance.now();

for (let f = 0; f < FRAMES; f++) {
  const frameStart = performance.now();
  const time = f * 16.666;

  // Starfield math
  driftX += 0.08;
  driftY -= 0.035;
  for (let i = 0; i < STAR_COUNT; i++) {
    const s = stars[i];
    s.twinklePhase += s.twinkleSpeed;
    const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.twinklePhase));
    const rawX = s.xRatio * 1000 + driftX * s.parallaxSpeed;
    const rawY = s.yRatio * 800 + driftY * s.parallaxSpeed;
    const sx = ((rawX % 1000) + 1000) % 1000;
    const sy = ((rawY % 800) + 800) % 800;
  }

  // Asteroid Belt math
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    const ast = asteroidBelt[i];
    ast.angle += ast.speed;
    const pt = projectOrbit(ast.orbitScale, ast.angle);
  }

  // Planets + Internal cloud rotation math
  for (let i = 0; i < PLANET_COUNT; i++) {
    const p = planets[i];
    p.angle += p.speed;
    const pos = projectOrbit(p.orbitScale, p.angle);
    // Internal cloud band drift math
    const t = time * 0.0006;
    for (let b = -5; b <= 5; b++) {
      const by = pos.y + (b / 5) * p.radius * 0.88;
      const drift = (t * ((b % 2 === 0) ? 1 : -1)) % 1;
    }
  }

  // Sky scintillation & cloud drift math
  for (let i = 0; i < 180; i++) {
    const twinkle = 0.72 + 0.28 * Math.sin(time * 0.0022 + i * 1.6);
  }

  const frameDuration = performance.now() - frameStart;
  totalTime += frameDuration;
}

const totalElapsed = performance.now() - start;
const avgFrameTimeMs = totalTime / FRAMES;
const effectiveFps = 1000 / (avgFrameTimeMs || 0.001);

console.log(`Frames Benchmark Completed: ${FRAMES} frames simulated`);
console.log(`Average CPU computation per frame: ${avgFrameTimeMs.toFixed(3)} ms`);
console.log(`Target frame budget at 60 FPS: 16.667 ms`);
console.log(`CPU overhead consumed: ${((avgFrameTimeMs / 16.667) * 100).toFixed(2)}% of budget`);
console.log(`Max potential throughput: ${Math.min(9999, Math.round(effectiveFps))} theoretical FPS`);
