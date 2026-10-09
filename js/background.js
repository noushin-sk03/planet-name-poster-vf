/**
 * background.js - High-Fidelity Procedural Solar System Canvas Engine
 * -------------------------------------------------------------------
 * Design & Visual Features:
 * 1. Procedural Deep-Space Starfield with Galactic Parallax Drift:
 *    - Stars drift continuously to simulate the Solar System's ~230 km/s voyage through the Milky Way.
 *    - 3-layer parallax twinkling stars with realistic stellar color temperatures.
 *    - Soft atmospheric cosmic nebulae clouds for deep cinematic contrast.
 * 2. Luminous Central Star (The Sun):
 *    - Multi-layered pulsating plasma corona and solar flare breathing.
 *    - Clickable & selectable celestial body.
 * 3. 3D Perspective Orbital Mechanics:
 *    - 8 planetary tilted elliptical tracks with astronomical foreshortening.
 *    - Glowing neon cyan illumination on the active planet's orbit track.
 *    - Full Orbit-Line Hit-Testing: Clicking or hovering anywhere along an orbit line selects the planet!
 * 4. Animated Asteroid Belt & Stray Asteroids:
 *    - 220 orbiting asteroids between Mars and Jupiter with authentic rock palettes.
 *    - Stray tumbling asteroids (Ceres and Vesta) drifting along the belt.
 * 5. Earth & Moon System:
 *    - The Moon realistically orbits Earth with foreshortened lunar trajectory.
 *    - Both Earth and The Moon are independently clickable and selectable!
 * 6. Pluto Special Dwarf Planet:
 *    - Orbiting at the outer edge with special dashed orbit line.
 * 7. System Overview Mode ("None" / Overview):
 *    - Allows the user to deselect individual planets and enjoy the pure, serene celestial simulation.
 * 8. Authentic Sun-Facing Spherical Lighting:
 *    - Every planet's spherical highlight vector accurately points directly at the Sun.
 *    - Saturn's rings with Cassini division; Uranus rings; Jupiter cloud bands.
 * 9. Shooting Stars:
 *    - Periodic meteors streaking diagonally across deep space with luminous tails.
 * 10. Performance & Accessibility:
 *    - DPR-capped crisp rendering, tab-pause via Page Visibility API, and reduced-motion support.
 */

const SolarBackground = (() => {
  let canvas = null;
  let ctx = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationId = null;
  let isPaused = false;
  let prefersReducedMotion = false;

  // Center point & base radius for solar system projection with smooth camera interpolation
  let sunCenterX = 0;
  let sunCenterY = 0;
  let baseRadius = 0;
  let currentSunCenterX = 0;
  let currentSunCenterY = 0;
  let currentBaseRadius = 0;
  let targetSunCenterX = 0;
  let targetSunCenterY = 0;
  let targetBaseRadius = 0;
  let isPreviewOpen = true;

  // Selection callback & state
  // Can be 'overview' or a body id ('sun', 'earth', 'mars', etc.)
  let onSelectCallback = null;
  let selectedBodyId = 'earth';
  let hoveredBodyId = null;
  let hoveredHit = null;
  let pointerX = 0;
  let pointerY = 0;

  // Earth-Moon orbital angle
  let moonAngle = 1.2;

  // Galactic drift coordinates (simulates solar system moving through Milky Way at ~230 km/s)
  let galacticDriftX = 0;
  let galacticDriftY = 0;

  // ---------------------------------------------------------------------------
  // 1. Procedural Starfield & Nebulae
  // ---------------------------------------------------------------------------
  const stars = [];
  const STAR_COUNT = 240;

  function initStarfield() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      const roll = Math.random();
      let starColor = '#ffffff';
      if (roll > 0.85) starColor = '#93c5fd'; // Ice blue
      else if (roll > 0.70) starColor = '#fef08a'; // Pale yellow
      else if (roll > 0.58) starColor = '#fed7aa'; // Amber

      stars.push({
        xRatio: Math.random(),
        yRatio: Math.random(),
        radius: Math.random() * 1.4 + 0.35,
        baseAlpha: Math.random() * 0.7 + 0.25,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColor,
        parallaxSpeed: Math.random() * 0.4 + 0.8
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Animated Asteroid Belt (Between Mars at 0.50 and Jupiter at 0.63)
  // ---------------------------------------------------------------------------
  const asteroidBelt = [];
  const ASTEROID_COUNT = 220;

  function initAsteroidBelt() {
    asteroidBelt.length = 0;
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      asteroidBelt.push({
        orbitScale: 0.535 + Math.random() * 0.055, // belt band 0.535 - 0.590
        angle: Math.random() * Math.PI * 2,
        speed: 0.00055 + (Math.random() - 0.5) * 0.00012,
        radius: Math.random() * 1.5 + 0.45,
        alpha: Math.random() * 0.55 + 0.35,
        color: Math.random() > 0.6 ? '#cbd5e1' : (Math.random() > 0.3 ? '#94a3b8' : '#78716c')
      });
    }
  }

  // Stray tumbling major asteroids (Ceres and Vesta)
  const majorAsteroids = [
    {
      name: 'Ceres',
      orbitScale: 0.555,
      angle: 0.4,
      speed: 0.00054,
      radius: 3.2,
      color: '#cbd5e1'
    },
    {
      name: 'Vesta',
      orbitScale: 0.575,
      angle: 3.2,
      speed: 0.00052,
      radius: 2.8,
      color: '#94a3b8'
    }
  ];

  // ---------------------------------------------------------------------------
  // 3. Celestial Bodies Configuration (Sun, Moon, 8 Planets, Pluto)
  // ---------------------------------------------------------------------------
  const sunBody = {
    id: 'sun',
    name: 'The Sun',
    color: '#fbbf24',
    secondaryColor: '#ea580c',
    radius: 36,
    projX: 0,
    projY: 0
  };

  const moonBody = {
    id: 'moon',
    name: 'The Moon',
    parent: 'earth',
    color: '#e2e8f0',
    secondaryColor: '#64748b',
    radius: 6,
    projX: 0,
    projY: 0
  };

  const jovianMoons = [
    {
      id: 'io',
      name: 'Io',
      parent: 'jupiter',
      order: "Jupiter's Moon I",
      color: '#facc15',
      secondaryColor: '#b45309',
      radius: 4.2,
      orbitR: 38,
      speed: 0.016,
      angle: 0.8,
      distSun: '5.20 AU (778.6M km)',
      orbitPeriod: '42.5 hrs (1.77 d)',
      projX: 0,
      projY: 0
    },
    {
      id: 'europa',
      name: 'Europa',
      parent: 'jupiter',
      order: "Jupiter's Moon II",
      color: '#93c5fd',
      secondaryColor: '#1e3a8a',
      radius: 3.8,
      orbitR: 50,
      speed: 0.011,
      angle: 2.1,
      distSun: '5.20 AU (778.6M km)',
      orbitPeriod: '85.2 hrs (3.55 d)',
      projX: 0,
      projY: 0
    },
    {
      id: 'ganymede',
      name: 'Ganymede',
      parent: 'jupiter',
      order: "Jupiter's Moon III",
      color: '#cbd5e1',
      secondaryColor: '#475569',
      radius: 5.2,
      orbitR: 64,
      speed: 0.0075,
      angle: 3.6,
      distSun: '5.20 AU (778.6M km)',
      orbitPeriod: '171.7 hrs (7.15 d)',
      projX: 0,
      projY: 0
    },
    {
      id: 'callisto',
      name: 'Callisto',
      parent: 'jupiter',
      order: "Jupiter's Moon IV",
      color: '#94a3b8',
      secondaryColor: '#334155',
      radius: 4.6,
      orbitR: 78,
      speed: 0.0048,
      angle: 5.0,
      distSun: '5.20 AU (778.6M km)',
      orbitPeriod: '400.5 hrs (16.69 d)',
      projX: 0,
      projY: 0
    }
  ];

  const saturnMoons = [
    {
      id: 'enceladus',
      name: 'Enceladus',
      parent: 'saturn',
      order: "Saturn's Moon II",
      color: '#e0f2fe',
      secondaryColor: '#0284c7',
      radius: 3.2,
      orbitR: 44,
      speed: 0.014,
      angle: 1.2,
      distSun: '9.54 AU (1.43B km)',
      orbitPeriod: '32.9 hrs (1.37 d)',
      projX: 0,
      projY: 0
    },
    {
      id: 'titan',
      name: 'Titan',
      parent: 'saturn',
      order: "Saturn's Moon VI",
      color: '#fbbf24',
      secondaryColor: '#92400e',
      radius: 5.2,
      orbitR: 60,
      speed: 0.0065,
      angle: 3.8,
      distSun: '9.54 AU (1.43B km)',
      orbitPeriod: '382.7 hrs (15.95 d)',
      projX: 0,
      projY: 0
    }
  ];

  const planets = [
    {
      id: 'mercury',
      name: 'Mercury',
      order: '1st from Sun',
      distSun: '0.39 AU (57.9M km)',
      orbitPeriod: '88.0 days',
      color: '#cbd5e1',
      secondaryColor: '#64748b',
      radius: 7,
      orbitScale: 0.18,
      speed: 0.0016,
      angle: 0.8,
      projX: 0,
      projY: 0
    },
    {
      id: 'venus',
      name: 'Venus',
      order: '2nd from Sun',
      distSun: '0.72 AU (108.2M km)',
      orbitPeriod: '224.7 days',
      color: '#fde047',
      secondaryColor: '#d97706',
      radius: 11,
      orbitScale: 0.28,
      speed: 0.0012,
      angle: 2.1,
      projX: 0,
      projY: 0
    },
    {
      id: 'earth',
      name: 'Earth',
      order: '3rd from Sun',
      distSun: '1.00 AU (149.6M km)',
      orbitPeriod: '365.25 days',
      color: '#38bdf8',
      secondaryColor: '#15803d',
      radius: 13,
      orbitScale: 0.39,
      speed: 0.0009,
      angle: 3.7,
      projX: 0,
      projY: 0
    },
    {
      id: 'mars',
      name: 'Mars',
      order: '4th from Sun',
      distSun: '1.52 AU (227.9M km)',
      orbitPeriod: '687.0 days',
      color: '#f87171',
      secondaryColor: '#991b1b',
      radius: 10,
      orbitScale: 0.50,
      speed: 0.0007,
      angle: 5.2,
      projX: 0,
      projY: 0
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      order: '5th from Sun',
      distSun: '5.20 AU (778.6M km)',
      orbitPeriod: '11.86 yrs',
      color: '#fb923c',
      secondaryColor: '#9a3412',
      radius: 26,
      orbitScale: 0.63,
      speed: 0.00045,
      angle: 1.4,
      hasBands: true,
      projX: 0,
      projY: 0
    },
    {
      id: 'saturn',
      name: 'Saturn',
      order: '6th from Sun',
      distSun: '9.54 AU (1.43B km)',
      orbitPeriod: '29.45 yrs',
      color: '#fef08a',
      secondaryColor: '#ca8a04',
      radius: 22,
      orbitScale: 0.75,
      speed: 0.00032,
      angle: 4.4,
      hasRings: true,
      ringRadius: 38,
      projX: 0,
      projY: 0
    },
    {
      id: 'uranus',
      name: 'Uranus',
      order: '7th from Sun',
      distSun: '19.19 AU (2.87B km)',
      orbitPeriod: '84.02 yrs',
      color: '#5eead4',
      secondaryColor: '#0f766e',
      radius: 17,
      orbitScale: 0.87,
      speed: 0.00022,
      angle: 0.3,
      hasRings: true,
      ringRadius: 27,
      projX: 0,
      projY: 0
    },
    {
      id: 'neptune',
      name: 'Neptune',
      order: '8th from Sun',
      distSun: '30.07 AU (4.50B km)',
      orbitPeriod: '164.79 yrs',
      color: '#60a5fa',
      secondaryColor: '#1e40af',
      radius: 16,
      orbitScale: 0.98,
      speed: 0.00015,
      angle: 2.8,
      projX: 0,
      projY: 0
    },
    {
      id: 'pluto',
      name: 'Pluto ✨',
      order: 'Kuiper Belt World',
      distSun: '39.48 AU (5.91B km)',
      orbitPeriod: '247.94 yrs',
      color: '#f3e8d2',
      secondaryColor: '#9a6042',
      radius: 7,
      orbitScale: 1.09,
      speed: 0.00010,
      angle: 1.1,
      isDwarf: true,
      projX: 0,
      projY: 0
    }
  ];

  // ---------------------------------------------------------------------------
  // 4. Shooting Stars Collection
  // ---------------------------------------------------------------------------
  const shootingStars = [];
  let nextShootingStarTime = Date.now() + 1500;

  function spawnShootingStar() {
    const startX = Math.random() * (width * 0.8) + width * 0.2;
    const startY = Math.random() * (height * 0.4);
    const speed = Math.random() * 8 + 8;
    const angle = Math.PI * 0.75 + (Math.random() * 0.2 - 0.1);
    const length = Math.random() * 110 + 80;

    shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length,
      opacity: 1.0,
      decay: Math.random() * 0.015 + 0.012
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Viewport Layout & Coordinate System (100% Unobstructed Full Solar View)
  // ---------------------------------------------------------------------------
  let isPanelMinimized = false;

  function updateLayout() {
    if (!canvas) return;

    // Explicit DPR cap: 1.5 on mobile (< 768px), 2.0 on desktop.
    // Prevents fill-rate bottlenecks and preserves 60 FPS on high-density mobile screens.
    dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    if (width >= 820) {
      // Desktop: Reserve left navigation sidebar (240px) and right telemetry panel (~340px)
      const leftNavW = 240;
      const rightReservedW = isPanelMinimized ? 90 : 340;
      const viewAreaW = Math.max(340, width - leftNavW - rightReservedW);

      // Center the Sun horizontally in the clear, unobstructed space between sidebar and telemetry card
      targetSunCenterX = leftNavW + viewAreaW * 0.50;
      targetSunCenterY = height * 0.50;

      // Pluto outermost orbit scale is 1.09, tilted at -0.32 rad (-18.3 deg).
      // Maximum horizontal span from Sun center: ~1.045 * baseRadius
      // Maximum vertical span from Sun center: ~0.565 * baseRadius
      // Safe margins ensure zero orbits ever touch sidebar (left) or card (right)
      const maxBaseRadiusX = (viewAreaW * 0.50 - 24) / 1.05;
      const viewAreaH = Math.max(240, height - 160);
      const maxBaseRadiusY = (viewAreaH * 0.50 - 20) / 0.57;

      targetBaseRadius = Math.max(140, Math.min(maxBaseRadiusX, maxBaseRadiusY));
    } else {
      // Mobile / Tablet: Sidebar is a drawer, telemetry card is pinned at bottom
      const bottomReservedH = isPanelMinimized ? 60 : 250;
      const availableH = Math.max(220, height - bottomReservedH - 70);

      targetSunCenterX = width * 0.50;
      targetSunCenterY = 70 + availableH * 0.48;

      const maxBaseRadiusX = (width * 0.50 - 16) / 1.05;
      const maxBaseRadiusY = (availableH * 0.50 - 15) / 0.57;

      targetBaseRadius = Math.max(120, Math.min(maxBaseRadiusX, maxBaseRadiusY));
    }

    if (currentBaseRadius === 0) {
      currentBaseRadius = targetBaseRadius;
      currentSunCenterX = targetSunCenterX;
      currentSunCenterY = targetSunCenterY;
      sunCenterX = currentSunCenterX;
      sunCenterY = currentSunCenterY;
      baseRadius = currentBaseRadius;
      sunBody.projX = sunCenterX;
      sunBody.projY = sunCenterY;
    }
  }

  /**
   * Project 2D orbit scale and angle onto 3D tilted perspective plane.
   */
  function projectOrbit(scaleRatio, angle) {
    const a = baseRadius * scaleRatio;
    const b = a * 0.43; // Foreshortened perspective
    const tilt = -0.32; // -18.3 degrees inclination angle

    const ex = a * Math.cos(angle);
    const ey = b * Math.sin(angle);

    const x = sunCenterX + (ex * Math.cos(tilt) - ey * Math.sin(tilt));
    const y = sunCenterY + (ex * Math.sin(tilt) + ey * Math.cos(tilt));

    return { x, y };
  }

  // ---------------------------------------------------------------------------
  // 6. Interactive Hit-Testing: Planet Bodies & Full Orbit Line Detection!
  // ---------------------------------------------------------------------------
  function hitTest(mx, my) {
    // 1. Direct hit on Moon
    const dMoon = Math.hypot(mx - moonBody.projX, my - moonBody.projY);
    if (dMoon <= moonBody.radius + 18) {
      return {
        ...moonBody,
        hitType: 'body',
        order: "Earth's Moon",
        distSun: '1.00 AU (149.6M km)',
        orbitPeriod: '27.3 days',
        hitX: moonBody.projX,
        hitY: moonBody.projY
      };
    // 1b. Direct hit on Jupiter's Galilean Moons (Io, Europa, Ganymede, Callisto)
    for (let i = 0; i < jovianMoons.length; i++) {
      const m = jovianMoons[i];
      const d = Math.hypot(mx - m.projX, my - m.projY);
      if (d <= m.radius + 15) {
        return {
          ...m,
          hitType: 'body',
          hitX: m.projX,
          hitY: m.projY
        };
      }
    }

    // 1c. Direct hit on Saturn's Moons (Titan, Enceladus)
    for (let i = 0; i < saturnMoons.length; i++) {
      const m = saturnMoons[i];
      const d = Math.hypot(mx - m.projX, my - m.projY);
      if (d <= m.radius + 15) {
        return {
          ...m,
          hitType: 'body',
          hitX: m.projX,
          hitY: m.projY
        };
      }
    }

    // 2. Direct hit on Sun
    const dSun = Math.hypot(mx - sunBody.projX, my - sunBody.projY);
    if (dSun <= sunBody.radius + 20) {
      return {
        ...sunBody,
        hitType: 'body',
        order: 'Central Star',
        distSun: '0 AU (0 km)',
        orbitPeriod: '230M yrs',
        hitX: sunBody.projX,
        hitY: sunBody.projY
      };
    }

    // 3. Direct hit on Planet bodies
    for (let i = planets.length - 1; i >= 0; i--) {
      const p = planets[i];
      const dist = Math.hypot(mx - p.projX, my - p.projY);
      if (dist <= p.radius + 22) {
        return {
          ...p,
          hitType: 'body',
          hitX: p.projX,
          hitY: p.projY
        };
      }
    }

    // 4. CLICKING / TOUCHING ON AN ORBIT LINE: Detects which elliptical orbit was touched!
    // Un-rotate click coordinates relative to central Sun
    const dx = mx - sunCenterX;
    const dy = my - sunCenterY;
    const tilt = -0.32;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const rx = dx * cosT + dy * sinT;
    const ry = -dx * sinT + dy * cosT;

    // Angle on the ellipse in unrotated space
    const theta = Math.atan2(ry / 0.43, rx);
    let closestPlanet = null;
    let minDistPx = Infinity;
    let closestPointOnOrbit = null;

    // Measure true screen pixel distance to each planetary orbit track
    planets.forEach((p) => {
      const a = baseRadius * p.orbitScale;
      const b = a * 0.43;
      const ex0 = a * Math.cos(theta);
      const ey0 = b * Math.sin(theta);
      const distPx = Math.hypot(rx - ex0, ry - ey0);
      if (distPx < minDistPx) {
        minDistPx = distPx;
        closestPlanet = p;
        // Project closest point on the orbit back into screen coordinates
        const sx = sunCenterX + (ex0 * Math.cos(tilt) - ey0 * Math.sin(tilt));
        const sy = sunCenterY + (ex0 * Math.sin(tilt) + ey0 * Math.cos(tilt));
        closestPointOnOrbit = { x: sx, y: sy };
      }
    });

    // If within 30px of an orbit line, detect orbit touch/hover!
    if (closestPlanet && minDistPx <= 30) {
      return {
        ...closestPlanet,
        hitType: 'orbit',
        minDistPx,
        orbitPointX: closestPointOnOrbit ? closestPointOnOrbit.x : mx,
        orbitPointY: closestPointOnOrbit ? closestPointOnOrbit.y : my,
        hitX: mx,
        hitY: my
      };
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // 7. Drawing Routines: Deep Space, Nebulae, Stars & Galactic Parallax Drift
  // ---------------------------------------------------------------------------
  function drawDeepSpace() {
    // 1. Base deep cosmic backdrop gradient
    const deepGrad = ctx.createRadialGradient(
      sunCenterX, sunCenterY, baseRadius * 0.2,
      sunCenterX, sunCenterY, Math.max(width, height) * 0.85
    );
    deepGrad.addColorStop(0, '#0c1022');
    deepGrad.addColorStop(0.45, '#060812');
    deepGrad.addColorStop(1, '#020306');
    ctx.fillStyle = deepGrad;
    ctx.fillRect(0, 0, width, height);

    // Galactic Drift: Simulates the entire Solar System hurtling through the Milky Way at ~230 km/s
    if (!prefersReducedMotion) {
      galacticDriftX += 0.08;
      galacticDriftY -= 0.035;
    }

    // 2. Cosmic nebulae clouds
    const neb1 = ctx.createRadialGradient(
      width * 0.25, height * 0.25, 20,
      width * 0.25, height * 0.25, width * 0.4
    );
    neb1.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
    neb1.addColorStop(0.6, 'rgba(99, 102, 241, 0.03)');
    neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb1;
    ctx.fillRect(0, 0, width, height);

    const neb2 = ctx.createRadialGradient(
      sunCenterX + baseRadius * 0.4, sunCenterY - baseRadius * 0.15, 10,
      sunCenterX + baseRadius * 0.4, sunCenterY - baseRadius * 0.15, width * 0.35
    );
    neb2.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
    neb2.addColorStop(0.7, 'rgba(180, 83, 9, 0.015)');
    neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb2;
    ctx.fillRect(0, 0, width, height);

    // 3. Twinkling starry starfield with galactic parallax drift
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      if (!prefersReducedMotion) {
        s.twinklePhase += s.twinkleSpeed;
      }
      const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.twinklePhase));

      // Wrap-around parallax drift
      const rawX = s.xRatio * width + galacticDriftX * s.parallaxSpeed;
      const rawY = s.yRatio * height + galacticDriftY * s.parallaxSpeed;
      const sx = ((rawX % width) + width) % width;
      const sy = ((rawY % height) + height) % height;

      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, alpha));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
      ctx.fill();

      if (s.radius > 1.2) {
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 4;
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Subtle Galactic Voyage Vector (indicates Solar System's ~230 km/s motion)
    if (selectedBodyId === 'overview') {
      ctx.save();
      ctx.font = '500 11px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.textAlign = 'center';
      ctx.fillText('⟡ Galactic Motion: Solar System voyaging at ~230 km/s toward Solar Apex', sunCenterX, height - 18);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // 8. Drawing Routines: Central Sun
  // ---------------------------------------------------------------------------
  function drawSun(time) {
    ctx.save();
    const isSelected = selectedBodyId === 'sun';
    const isHovered = hoveredBodyId === 'sun';

    const pulse = Math.sin(time * 0.003) * 2;
    const r = sunBody.radius;

    // Selection / Hover Halo
    if (isSelected || isHovered) {
      const haloR = r + 11 + Math.sin(time * 0.005) * 3;
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, haloR, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = isSelected ? 2.2 : 1.5;
      ctx.shadowColor = isSelected ? '#38bdf8' : '#ffffff';
      ctx.shadowBlur = isSelected ? 16 : 8;
      ctx.stroke();

      ctx.font = '600 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
      ctx.fillText('THE SUN', sunCenterX, sunCenterY - haloR - 4);
    }

    // Outer corona glow
    const outerGrad = ctx.createRadialGradient(
      sunCenterX, sunCenterY, r * 0.5,
      sunCenterX, sunCenterY, r * 3.4 + pulse
    );
    outerGrad.addColorStop(0, 'rgba(251, 191, 36, 0.42)');
    outerGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.18)');
    outerGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(sunCenterX, sunCenterY, r * 3.4 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Inner warm corona
    const innerGrad = ctx.createRadialGradient(
      sunCenterX, sunCenterY, r * 0.2,
      sunCenterX, sunCenterY, r * 1.6
    );
    innerGrad.addColorStop(0, 'rgba(254, 240, 138, 0.88)');
    innerGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.5)');
    innerGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(sunCenterX, sunCenterY, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Photosphere Core
    const coreGrad = ctx.createRadialGradient(
      sunCenterX - 3, sunCenterY - 3, 0,
      sunCenterX, sunCenterY, r
    );
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#fef08a');
    coreGrad.addColorStop(0.75, '#f59e0b');
    coreGrad.addColorStop(1, '#ea580c');

    ctx.fillStyle = coreGrad;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(sunCenterX, sunCenterY, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 9. Drawing Routines: Orbit Guide Lines
  // ---------------------------------------------------------------------------
  function drawOrbitLines() {
    ctx.save();
    planets.forEach((p) => {
      const isSelected = selectedBodyId !== 'overview' && (p.id === selectedBodyId || (p.id === 'earth' && selectedBodyId === 'moon'));
      const isHovered = hoveredBodyId === p.id;

      ctx.beginPath();
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.08) {
        const pt = projectOrbit(p.orbitScale, theta);
        if (theta === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      if (isSelected || isHovered) {
        ctx.setLineDash([]);
        ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.7)' : 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = isSelected ? 1.8 : 1.3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = isSelected ? 10 : 6;
      } else if (p.isDwarf) {
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = 'rgba(254, 215, 170, 0.16)';
        ctx.lineWidth = 1.0;
        ctx.shadowBlur = 0;
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.0;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 10. Drawing Routines: Asteroid Belt & Stray Asteroids
  // ---------------------------------------------------------------------------
  function drawAsteroids() {
    ctx.save();

    // 1. Shimmering Asteroid Belt particles
    asteroidBelt.forEach((ast) => {
      if (!prefersReducedMotion) {
        ast.angle += ast.speed;
      }
      const pt = projectOrbit(ast.orbitScale, ast.angle);

      ctx.fillStyle = ast.color;
      ctx.globalAlpha = ast.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, ast.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Major tumbling asteroids (Ceres & Vesta)
    majorAsteroids.forEach((mast) => {
      if (!prefersReducedMotion) {
        mast.angle += mast.speed;
      }
      const pt = projectOrbit(mast.orbitScale, mast.angle);

      ctx.globalAlpha = 0.85;
      ctx.fillStyle = mast.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, mast.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 11. Drawing Routines: Earth-Moon Sub-System
  // ---------------------------------------------------------------------------
  function drawMoonSystem(earth, time) {
    const isSelected = selectedBodyId === 'moon';
    const isHovered = hoveredBodyId === 'moon';

    if (!prefersReducedMotion) {
      moonAngle += 0.007;
    }

    const moonOrbitR = 30;
    moonBody.projX = earth.projX + Math.cos(moonAngle) * moonOrbitR;
    moonBody.projY = earth.projY + Math.sin(moonAngle) * (moonOrbitR * 0.44);

    ctx.save();

    // Lunar orbit track around Earth
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 2; t += 0.15) {
      const mx = earth.projX + Math.cos(t) * moonOrbitR;
      const my = earth.projY + Math.sin(t) * (moonOrbitR * 0.44);
      if (t === 0) ctx.moveTo(mx, my);
      else ctx.lineTo(mx, my);
    }
    ctx.closePath();
    ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Selection / Hover Halo
    if (isSelected || isHovered) {
      const pulse = Math.sin(time * 0.005) * 2;
      const haloRadius = moonBody.radius + (isSelected ? 8 : 6) + pulse;

      ctx.beginPath();
      ctx.arc(moonBody.projX, moonBody.projY, haloRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = isSelected ? 2 : 1.5;
      ctx.shadowColor = isSelected ? '#38bdf8' : '#ffffff';
      ctx.shadowBlur = isSelected ? 14 : 6;
      ctx.stroke();

      ctx.font = '600 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
      ctx.fillText('THE MOON', moonBody.projX, moonBody.projY - haloRadius - 3);
    }

    // Moon Body
    const toSunX = sunCenterX - moonBody.projX;
    const toSunY = sunCenterY - moonBody.projY;
    const sunDist = Math.hypot(toSunX, toSunY) || 1;
    const hx = moonBody.projX + (toSunX / sunDist) * (moonBody.radius * 0.35);
    const hy = moonBody.projY + (toSunY / sunDist) * (moonBody.radius * 0.35);

    const moonGrad = ctx.createRadialGradient(
      hx, hy, 0.5,
      moonBody.projX, moonBody.projY, moonBody.radius
    );
    moonGrad.addColorStop(0, '#f1f5f9');
    moonGrad.addColorStop(0.5, '#cbd5e1');
    moonGrad.addColorStop(0.85, '#64748b');
    moonGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = moonGrad;
    ctx.shadowBlur = isSelected ? 8 : 3;
    ctx.shadowColor = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(moonBody.projX, moonBody.projY, moonBody.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 11.2 Drawing Routines: Jupiter Galilean Satellites (Io, Europa, Ganymede, Callisto)
  // ---------------------------------------------------------------------------
  function drawJovianSystem(jupiter, time) {
    jovianMoons.forEach((m) => {
      if (!prefersReducedMotion) {
        m.angle += m.speed;
      }
      m.projX = jupiter.projX + Math.cos(m.angle) * m.orbitR;
      m.projY = jupiter.projY + Math.sin(m.angle) * (m.orbitR * 0.44);

      const isSelected = selectedBodyId === m.id;
      const isHovered = hoveredBodyId === m.id;

      ctx.save();
      // Orbit track
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.2) {
        const ox = jupiter.projX + Math.cos(t) * m.orbitR;
        const oy = jupiter.projY + Math.sin(t) * (m.orbitR * 0.44);
        if (t === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      }
      ctx.closePath();
      ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.6)' : (isHovered ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)');
      ctx.lineWidth = isSelected ? 1.4 : 0.7;
      ctx.stroke();

      // Halo on select/hover
      if (isSelected || isHovered) {
        const pulse = Math.sin(time * 0.006) * 1.8;
        const haloR = m.radius + 6 + pulse;
        ctx.beginPath();
        ctx.arc(m.projX, m.projY, haloR, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = isSelected ? '#38bdf8' : '#ffffff';
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.font = '600 10px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 4;
        ctx.fillText(m.name.toUpperCase(), m.projX, m.projY - haloR - 2);
      }

      // Moon Sphere
      const toSunX = sunCenterX - m.projX;
      const toSunY = sunCenterY - m.projY;
      const sDist = Math.hypot(toSunX, toSunY) || 1;
      const hx = m.projX + (toSunX / sDist) * (m.radius * 0.4);
      const hy = m.projY + (toSunY / sDist) * (m.radius * 0.4);

      const grad = ctx.createRadialGradient(hx, hy, 0.5, m.projX, m.projY, m.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, m.color);
      grad.addColorStop(1, m.secondaryColor);

      ctx.fillStyle = grad;
      ctx.shadowBlur = isSelected ? 8 : 2;
      ctx.shadowColor = m.color;
      ctx.beginPath();
      ctx.arc(m.projX, m.projY, m.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // ---------------------------------------------------------------------------
  // 11.3 Drawing Routines: Saturnian Satellites (Titan, Enceladus)
  // ---------------------------------------------------------------------------
  function drawSaturnSystem(saturn, time) {
    saturnMoons.forEach((m) => {
      if (!prefersReducedMotion) {
        m.angle += m.speed;
      }
      m.projX = saturn.projX + Math.cos(m.angle) * m.orbitR;
      m.projY = saturn.projY + Math.sin(m.angle) * (m.orbitR * 0.44);

      const isSelected = selectedBodyId === m.id;
      const isHovered = hoveredBodyId === m.id;

      ctx.save();
      // Orbit track
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.2) {
        const ox = saturn.projX + Math.cos(t) * m.orbitR;
        const oy = saturn.projY + Math.sin(t) * (m.orbitR * 0.44);
        if (t === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      }
      ctx.closePath();
      ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.6)' : (isHovered ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)');
      ctx.lineWidth = isSelected ? 1.4 : 0.7;
      ctx.stroke();

      // Halo on select/hover
      if (isSelected || isHovered) {
        const pulse = Math.sin(time * 0.006) * 1.8;
        const haloR = m.radius + 6 + pulse;
        ctx.beginPath();
        ctx.arc(m.projX, m.projY, haloR, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = isSelected ? '#38bdf8' : '#ffffff';
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.font = '600 10px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 4;
        ctx.fillText(m.name.toUpperCase(), m.projX, m.projY - haloR - 2);
      }

      // Moon Sphere
      const toSunX = sunCenterX - m.projX;
      const toSunY = sunCenterY - m.projY;
      const sDist = Math.hypot(toSunX, toSunY) || 1;
      const hx = m.projX + (toSunX / sDist) * (m.radius * 0.4);
      const hy = m.projY + (toSunY / sDist) * (m.radius * 0.4);

      const grad = ctx.createRadialGradient(hx, hy, 0.5, m.projX, m.projY, m.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, m.color);
      grad.addColorStop(1, m.secondaryColor);

      ctx.fillStyle = grad;
      ctx.shadowBlur = isSelected ? 8 : 2;
      ctx.shadowColor = m.color;
      ctx.beginPath();
      ctx.arc(m.projX, m.projY, m.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // ---------------------------------------------------------------------------
  // 12. Drawing Routines: Planet Spheres & Rings
  // ---------------------------------------------------------------------------
  function drawPlanet(p, time) {
    const isSelected = selectedBodyId !== 'overview' && p.id === selectedBodyId;
    const isHovered = hoveredBodyId === p.id;

    ctx.save();

    // Selection & Hover Halo
    if (isSelected || isHovered) {
      const pulse = Math.sin(time * 0.005) * 3;
      const haloRadius = p.radius + (isSelected ? 10 : 7) + pulse;

      ctx.beginPath();
      ctx.arc(p.projX, p.projY, haloRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = isSelected ? 2.2 : 1.5;
      ctx.shadowColor = isSelected ? '#38bdf8' : '#ffffff';
      ctx.shadowBlur = isSelected ? 16 : 8;
      ctx.stroke();

      ctx.font = '600 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
      ctx.fillText(p.name.toUpperCase(), p.projX, p.projY - haloRadius - 4);
    }

    // Realistic Sun-Facing Spherical Shading
    const toSunX = sunCenterX - p.projX;
    const toSunY = sunCenterY - p.projY;
    const sunDist = Math.hypot(toSunX, toSunY) || 1;
    const nx = toSunX / sunDist;
    const ny = toSunY / sunDist;

    const highlightX = p.projX + nx * (p.radius * 0.35);
    const highlightY = p.projY + ny * (p.radius * 0.35);

    const sphereGrad = ctx.createRadialGradient(
      highlightX, highlightY, 1,
      p.projX, p.projY, p.radius
    );
    sphereGrad.addColorStop(0, p.color);
    sphereGrad.addColorStop(0.65, p.secondaryColor);
    sphereGrad.addColorStop(1, '#020408');

    ctx.fillStyle = sphereGrad;
    ctx.shadowBlur = isSelected ? 12 : 4;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.projX, p.projY, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Internal Planet Features: Axial Rotation, Drift & Cloud Bands
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.projX, p.projY, p.radius, 0, Math.PI * 2);
    ctx.clip();

    if (p.id === 'jupiter') {
      // Alternating differential cloud bands drifting across Jupiter
      const t = prefersReducedMotion ? 0 : time * 0.0006;
      const numBands = 5;
      for (let b = -numBands; b <= numBands; b++) {
        const by = p.projY + (b / numBands) * p.radius * 0.88;
        ctx.fillStyle = (b % 2 === 0) ? 'rgba(154, 52, 18, 0.45)' : 'rgba(254, 215, 170, 0.35)';
        ctx.fillRect(p.projX - p.radius, by - 1.5, p.radius * 2, 3);
      }
      // Great Red Spot storm vortex drifting horizontally
      const grsAngle = prefersReducedMotion ? 0.3 : (time * 0.00035) % (Math.PI * 2);
      const grsX = p.projX + Math.sin(grsAngle) * (p.radius * 0.62);
      const grsY = p.projY + p.radius * 0.35;
      ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
      ctx.beginPath();
      ctx.ellipse(grsX, grsY, 3.2, 2.0, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.id === 'earth') {
      // Swirling white cloud decks drifting eastward over oceans & continents
      const t = prefersReducedMotion ? 0 : time * 0.0008;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const cX = p.projX + Math.sin(t) * (p.radius * 0.45);
      ctx.arc(cX, p.projY - p.radius * 0.2, p.radius * 0.45, 0.3, Math.PI * 0.9);
      ctx.stroke();

      ctx.beginPath();
      const cX2 = p.projX + Math.sin(t + 2.5) * (p.radius * 0.45);
      ctx.arc(cX2, p.projY + p.radius * 0.25, p.radius * 0.5, 0.1, Math.PI * 0.8);
      ctx.stroke();
    } else if (p.id === 'venus') {
      // Dense sulfuric acid cloud bands drifting across atmosphere
      ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
      for (let i = -2; i <= 2; i++) {
        const vy = p.projY + (i / 3) * p.radius * 0.7;
        ctx.fillRect(p.projX - p.radius, vy - 1, p.radius * 2, 2.2);
      }
    } else if (p.id === 'mars') {
      // Bright polar ice cap
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(p.projX, p.projY - p.radius * 0.75, p.radius * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Dark albedo marking (Syrtis Major) rotating across the disk
      const t = prefersReducedMotion ? 0 : time * 0.0005;
      const smX = p.projX + Math.sin(t) * (p.radius * 0.4);
      ctx.fillStyle = 'rgba(67, 20, 7, 0.45)';
      ctx.beginPath();
      ctx.ellipse(smX, p.projY + 1, p.radius * 0.35, p.radius * 0.22, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.id === 'saturn') {
      // Subtle cloud bands on Saturn
      const numBands = 4;
      for (let b = -numBands; b <= numBands; b++) {
        const by = p.projY + (b / numBands) * p.radius * 0.8;
        ctx.fillStyle = (b % 2 === 0) ? 'rgba(202, 138, 4, 0.25)' : 'rgba(254, 240, 138, 0.18)';
        ctx.fillRect(p.projX - p.radius, by - 1, p.radius * 2, 2);
      }
    } else if (p.id === 'neptune') {
      // Supersonic methane cloud streak (Scooter cloud) and Great Dark Spot
      const t = prefersReducedMotion ? 0 : time * 0.0012;
      const sX = p.projX + Math.sin(t) * (p.radius * 0.6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(sX, p.projY + p.radius * 0.2, 2.8, 1.2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Great Dark Spot
      const gdsX = p.projX + Math.sin(t + 2.8) * (p.radius * 0.5);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.beginPath();
      ctx.ellipse(gdsX, p.projY - p.radius * 0.2, 3.2, 1.8, 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.id === 'uranus') {
      // Faint high-altitude haze band
      ctx.fillStyle = 'rgba(204, 251, 241, 0.25)';
      ctx.fillRect(p.projX - p.radius, p.projY - 2, p.radius * 2, 4);
    } else if (p.id === 'pluto') {
      // Tombaugh Regio bright nitrogen ice heart
      const t = prefersReducedMotion ? 0 : time * 0.0003;
      const hX = p.projX + Math.sin(t) * (p.radius * 0.35);
      ctx.fillStyle = 'rgba(255, 247, 237, 0.65)';
      ctx.beginPath();
      ctx.ellipse(hX, p.projY + 1, p.radius * 0.38, p.radius * 0.3, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Planetary Rings
    if (p.hasRings) {
      ctx.save();
      ctx.translate(p.projX, p.projY);
      ctx.rotate(-0.32);
      ctx.scale(1.0, 0.34);

      if (p.id === 'saturn') {
        ctx.beginPath();
        ctx.arc(0, 0, p.ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, p.ringRadius - 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(153, 246, 228, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 13. Drawing Routines: Shooting Stars
  // ---------------------------------------------------------------------------
  function drawShootingStars() {
    if (Date.now() > nextShootingStarTime && !prefersReducedMotion) {
      spawnShootingStar();
      // Keep shooting stars occasional (7 to 16 seconds apart)
      nextShootingStarTime = Date.now() + Math.random() * 9000 + 7000;
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.opacity -= ss.decay;

      if (ss.opacity <= 0 || ss.x < -100 || ss.y > height + 100) {
        shootingStars.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = ss.opacity;
      const tailX = ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * ss.length;
      const tailY = ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * ss.length;

      const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.7, 'rgba(186, 230, 253, 0.6)');
      grad.addColorStop(1, '#ffffff');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // 13.5 Interactive Orbit & Celestial Body HUD Badge (Touching & Hovering)
  // ---------------------------------------------------------------------------
  function drawOrbitHUD(time) {
    if (!hoveredHit) return;

    ctx.save();

    if (hoveredHit.hitType === 'orbit') {
      const p = hoveredHit;
      const ox = p.orbitPointX || p.hitX;
      const oy = p.orbitPointY || p.hitY;

      // 1. Glowing reticle dot on the orbit path right where user is touching/hovering
      const pulse = Math.sin(time * 0.008) * 1.8;
      ctx.beginPath();
      ctx.arc(ox, oy, 4.5 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ox, oy, 10 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 2. Information badge placement with smart viewport clamping
      const boxW = 250;
      const boxH = 58;
      let bx = ox + 18;
      let by = oy - boxH - 14;

      const leftNavBound = width >= 820 ? 250 : 12;
      if (bx + boxW > width - 20) {
        bx = ox - boxW - 18;
      }
      if (bx < leftNavBound) {
        bx = leftNavBound + 8;
      }

      if (by < 60) {
        by = oy + 22;
      }
      if (by + boxH > height - 25) {
        by = height - boxH - 25;
      }

      // Pointer leader line connecting badge to orbit reticle
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(bx + (bx < ox ? boxW : 0), by + boxH * 0.5);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rounded HUD glassmorphic card background
      ctx.fillStyle = 'rgba(8, 12, 26, 0.94)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      const r = 8;
      ctx.moveTo(bx + r, by);
      ctx.lineTo(bx + boxW - r, by);
      ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + r);
      ctx.lineTo(bx + boxW, by + boxH - r);
      ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - r, by + boxH);
      ctx.lineTo(bx + r, by + boxH);
      ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - r);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Swatch dot
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(bx + 14, by + 16, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color || '#38bdf8';
      ctx.fill();

      // Planet Orbit Header
      ctx.font = '700 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${p.name} Orbit`, bx + 24, by + 16);

      // Order badge
      if (p.order) {
        ctx.font = '600 10px sans-serif';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.95)';
        ctx.textAlign = 'right';
        ctx.fillText(p.order, bx + boxW - 12, by + 16);
      }

      // Telemetry detail row
      ctx.textAlign = 'left';
      ctx.font = '500 10.5px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Dist: ${p.distSun || '—'}  •  Period: ${p.orbitPeriod || '—'}`, bx + 12, by + 34);

      // Action hint
      ctx.font = '500 9px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('✓ Orbit Touched • Full NASA facts on right card', bx + 12, by + 47);
    } else if (hoveredHit.hitType === 'body') {
      const p = hoveredHit;
      const px = p.hitX;
      const py = p.hitY;

      // Pulse ring around planet body
      const pulse = Math.sin(time * 0.007) * 2;
      ctx.beginPath();
      ctx.arc(px, py, (p.radius || 12) + 6 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Body badge
      const boxW = 210;
      const boxH = 44;
      let bx = px + (p.radius || 12) + 12;
      let by = py - boxH * 0.5;

      if (bx + boxW > width - 15) {
        bx = px - (p.radius || 12) - boxW - 12;
      }
      if (by < 50) by = 50;
      if (by + boxH > height - 20) by = height - boxH - 20;

      ctx.fillStyle = 'rgba(8, 12, 26, 0.92)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      const r = 6;
      ctx.moveTo(bx + r, by);
      ctx.lineTo(bx + boxW - r, by);
      ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + r);
      ctx.lineTo(bx + boxW, by + boxH - r);
      ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - r, by + boxH);
      ctx.lineTo(bx + r, by + boxH);
      ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - r);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = '700 11.5px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(p.name, bx + 10, by + 14);

      if (p.order) {
        ctx.font = '500 9.5px sans-serif';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.textAlign = 'right';
        ctx.fillText(p.order, bx + boxW - 10, by + 14);
      }

      ctx.textAlign = 'left';
      ctx.font = '500 9.5px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Dist: ${p.distSun || '1.00 AU'} • Period: ${p.orbitPeriod || '—'}`, bx + 10, by + 30);
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 14. Main Animation Frame Loop & Real-Time Performance Monitor
  // ---------------------------------------------------------------------------
  let frameCount = 0;
  let lastFpsUpdateTime = performance.now();
  let measuredFps = '60.0';
  let avgFrameTime = '16.6';
  let onFpsUpdateCallback = null;

  function render(time) {
    if (isPaused) return;

    // Track rolling 60 FPS performance metrics
    frameCount++;
    const now = performance.now();
    if (now - lastFpsUpdateTime >= 1000) {
      measuredFps = ((frameCount * 1000) / (now - lastFpsUpdateTime)).toFixed(1);
      avgFrameTime = ((now - lastFpsUpdateTime) / frameCount).toFixed(1);
      frameCount = 0;
      lastFpsUpdateTime = now;
      if (onFpsUpdateCallback) {
        onFpsUpdateCallback({ fps: measuredFps, frameTimeMs: avgFrameTime, dpr });
      }
    }

    // Smooth camera shrink & repositioning animation
    if (!prefersReducedMotion) {
      currentSunCenterX += (targetSunCenterX - currentSunCenterX) * 0.08;
      currentSunCenterY += (targetSunCenterY - currentSunCenterY) * 0.08;
      currentBaseRadius += (targetBaseRadius - currentBaseRadius) * 0.08;
    } else {
      currentSunCenterX = targetSunCenterX;
      currentSunCenterY = targetSunCenterY;
      currentBaseRadius = targetBaseRadius;
    }

    sunCenterX = currentSunCenterX;
    sunCenterY = currentSunCenterY;
    baseRadius = currentBaseRadius;
    sunBody.projX = sunCenterX;
    sunBody.projY = sunCenterY;

    ctx.clearRect(0, 0, width + 10, height + 10);

    // 1. Procedural deep-space starfield with galactic parallax drift
    drawDeepSpace();

    // 2. Shooting stars
    drawShootingStars();

    // 3. Orbit tracks (with orbit-hover glow)
    drawOrbitLines();

    // 4. Asteroid Belt simulation
    drawAsteroids();

    // 5. Central Sun
    drawSun(time);

    // 6. Planets
    let earthRef = null;
    let jupiterRef = null;
    let saturnRef = null;
    planets.forEach((p) => {
      if (!prefersReducedMotion) {
        p.angle += p.speed;
      }

      const pos = projectOrbit(p.orbitScale, p.angle);
      p.projX = pos.x;
      p.projY = pos.y;

      if (p.id === 'earth') earthRef = p;
      if (p.id === 'jupiter') jupiterRef = p;
      if (p.id === 'saturn') saturnRef = p;

      drawPlanet(p, time);
    });

    // 7. Celestial Satellite Sub-Systems (Stage 06: Moons of the Solar System)
    if (earthRef) {
      drawMoonSystem(earthRef, time);
    }
    if (jupiterRef) {
      drawJovianSystem(jupiterRef, time);
    }
    if (saturnRef) {
      drawSaturnSystem(saturnRef, time);
    }

    // 8. Interactive Orbit & Celestial Body Telemetry HUD (Touching & Hovering)
    drawOrbitHUD(time);

    // Stop continuous loop if reduced motion is preferred to save 100% of GPU
    if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(render);
    }
  }

  // ---------------------------------------------------------------------------
  // 15. Public Initializer & Event Listeners
  // ---------------------------------------------------------------------------
  function init(canvasElement, onSelectPlanet) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    onSelectCallback = onSelectPlanet;

    initStarfield();
    initAsteroidBelt();
    updateLayout();
    window.addEventListener('resize', () => {
      initStarfield();
      initAsteroidBelt();
      updateLayout();
      if (prefersReducedMotion) {
        render(0);
      }
    });

    // Reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        cancelAnimationFrame(animationId);
        render(0);
      } else {
        if (!isPaused) {
          animationId = requestAnimationFrame(render);
        }
      }
    });

    // Tab visibility change (Page Visibility API)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationId);
      } else {
        isPaused = false;
        lastFpsUpdateTime = performance.now();
        frameCount = 0;
        if (!prefersReducedMotion) {
          animationId = requestAnimationFrame(render);
        } else {
          render(0);
        }
      }
    });

    // Helper to evaluate hover & touching across mouse, pen, and touch
    function updatePointerHover(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      const hit = hitTest(mx, my);
      if (hit) {
        hoveredHit = hit;
        hoveredBodyId = hit.id;
        pointerX = mx;
        pointerY = my;
        canvas.classList.add('pointer-active');
        canvas.style.cursor = 'pointer';
      } else {
        hoveredHit = null;
        hoveredBodyId = null;
        canvas.classList.remove('pointer-active');
        canvas.style.cursor = 'default';
      }
      return hit;
    }

    // Click / Touch selection detection (works on planets, moon, sun, AND orbit lines)
    function handlePointerSelect(clientX, clientY) {
      const hit = updatePointerHover(clientX, clientY);
      if (hit && onSelectCallback) {
        selectedBodyId = hit.id;
        onSelectCallback(hit.id);
        if (prefersReducedMotion) {
          render(0);
        }
      }
    }

    // Mouse move hover detection (detects planet bodies AND orbit lines)
    canvas.addEventListener('mousemove', (e) => {
      updatePointerHover(e.clientX, e.clientY);
    });

    // Unified pointer events for desktop and tablets
    canvas.addEventListener('pointermove', (e) => {
      updatePointerHover(e.clientX, e.clientY);
    });

    canvas.addEventListener('pointerdown', (e) => {
      handlePointerSelect(e.clientX, e.clientY);
    });

    canvas.addEventListener('click', (e) => {
      handlePointerSelect(e.clientX, e.clientY);
    });

    // Touch events for mobile screens: touching/dragging across orbits displays telemetry
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerSelect(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerHover(touch.clientX, touch.clientY);
        handlePointerSelect(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    canvas.addEventListener('mouseleave', () => {
      hoveredHit = null;
      hoveredBodyId = null;
    });

    // Start render loop
    if (prefersReducedMotion) {
      render(0);
    } else {
      animationId = requestAnimationFrame(render);
    }
  }

  function setSelectedPlanet(bodyId) {
    selectedBodyId = bodyId;
    if (prefersReducedMotion) {
      render(0);
    }
  }

  function setPreviewOpen(isOpen) {
    isPreviewOpen = Boolean(isOpen);
    updateLayout();
  }

  function togglePanelMinimize(minimized) {
    isPanelMinimized = Boolean(minimized);
    updateLayout();
  }

  return {
    init,
    setSelectedPlanet,
    setPreviewOpen,
    togglePanelMinimize,
    getPlanets: () => planets,
    getPerformanceMetrics: () => ({ fps: measuredFps, frameTimeMs: avgFrameTime, dpr }),
    onPerformanceUpdate: (cb) => { onFpsUpdateCallback = cb; },
    handlePointerAt: (clientX, clientY) => { handlePointerSelect(clientX, clientY); },
    handleHoverAt: (clientX, clientY) => { updatePointerHover(clientX, clientY); }
  };
})();
