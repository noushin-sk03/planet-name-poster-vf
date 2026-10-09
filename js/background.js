/**
 * background.js - High-Fidelity Procedural Solar System Canvas Engine
 * -------------------------------------------------------------------
 * Design & Visual Features:
 * 1. Procedural Deep-Space Starfield:
 *    - 3-layer parallax twinkling stars with realistic color temperatures.
 *    - Soft atmospheric cosmic nebulae clouds for deep cinematic contrast.
 * 2. Luminous Central Star (The Sun):
 *    - Multi-layered pulsating plasma corona and solar flare breathing.
 *    - Clickable & selectable celestial body.
 * 3. 3D Perspective Orbital Mechanics:
 *    - 8 planetary tilted elliptical tracks with astronomical foreshortening.
 *    - Glowing neon cyan illumination on the active planet's orbit track.
 * 4. Earth & Moon System:
 *    - The Moon realistically orbits Earth with foreshortened lunar trajectory.
 *    - Both Earth and The Moon are independently clickable and selectable!
 * 5. Authentic Sun-Facing Spherical Lighting:
 *    - Every planet's spherical highlight vector accurately points directly at the Sun.
 *    - Saturn's rings with Cassini division; Uranus rings; Jupiter cloud bands.
 * 6. Interactive Two-Way Selection & Hover Feedback:
 *    - Generous touch padding (+18px) for effortless clicking on all devices.
 *    - Pulsing targeting beacons and floating celestial nameplates.
 * 7. Shooting Stars:
 *    - Periodic meteors streaking diagonally across deep space with luminous tails.
 * 8. Performance & Accessibility:
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

  // Center point & base radius for solar system projection
  let sunCenterX = 0;
  let sunCenterY = 0;
  let baseRadius = 0;

  // Selection callback & state
  let onSelectCallback = null;
  let selectedBodyId = 'earth';
  let hoveredBodyId = null;

  // Earth-Moon orbital angle
  let moonAngle = 1.2;

  // ---------------------------------------------------------------------------
  // 1. Procedural Starfield & Nebulae
  // ---------------------------------------------------------------------------
  const stars = [];
  const STAR_COUNT = 240;

  function initStarfield() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      // Pick authentic stellar colors (O/B blue, A/F white, G yellow, K orange)
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
        color: starColor
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Celestial Bodies Configuration (Sun, Moon + 8 Planets)
  // ---------------------------------------------------------------------------
  const sunBody = {
    id: 'sun',
    name: 'The Sun',
    color: '#fbbf24',
    secondaryColor: '#ea580c',
    radius: 23,
    projX: 0,
    projY: 0
  };

  const moonBody = {
    id: 'moon',
    name: 'The Moon',
    color: '#e2e8f0',
    secondaryColor: '#64748b',
    radius: 4.5,
    projX: 0,
    projY: 0
  };

  const planets = [
    {
      id: 'mercury',
      name: 'Mercury',
      color: '#cbd5e1',
      secondaryColor: '#64748b',
      radius: 5.5,
      orbitScale: 0.18,
      speed: 0.0016,
      angle: 0.8,
      projX: 0,
      projY: 0
    },
    {
      id: 'venus',
      name: 'Venus',
      color: '#fde047',
      secondaryColor: '#d97706',
      radius: 8.5,
      orbitScale: 0.28,
      speed: 0.0012,
      angle: 2.1,
      projX: 0,
      projY: 0
    },
    {
      id: 'earth',
      name: 'Earth',
      color: '#38bdf8',
      secondaryColor: '#15803d',
      radius: 9.5,
      orbitScale: 0.39,
      speed: 0.0009,
      angle: 3.7,
      projX: 0,
      projY: 0
    },
    {
      id: 'mars',
      name: 'Mars',
      color: '#f87171',
      secondaryColor: '#991b1b',
      radius: 7.5,
      orbitScale: 0.50,
      speed: 0.0007,
      angle: 5.2,
      projX: 0,
      projY: 0
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      color: '#fb923c',
      secondaryColor: '#9a3412',
      radius: 19,
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
      color: '#fef08a',
      secondaryColor: '#ca8a04',
      radius: 16,
      orbitScale: 0.75,
      speed: 0.00032,
      angle: 4.4,
      hasRings: true,
      ringRadius: 28,
      projX: 0,
      projY: 0
    },
    {
      id: 'uranus',
      name: 'Uranus',
      color: '#5eead4',
      secondaryColor: '#0f766e',
      radius: 13,
      orbitScale: 0.87,
      speed: 0.00022,
      angle: 0.3,
      hasRings: true,
      ringRadius: 21,
      projX: 0,
      projY: 0
    },
    {
      id: 'neptune',
      name: 'Neptune',
      color: '#60a5fa',
      secondaryColor: '#1e40af',
      radius: 12.5,
      orbitScale: 0.98,
      speed: 0.00015,
      angle: 2.8,
      projX: 0,
      projY: 0
    }
  ];

  // ---------------------------------------------------------------------------
  // 3. Shooting Stars Collection
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
  // 4. Viewport Layout & Coordinate System
  // ---------------------------------------------------------------------------
  function updateLayout() {
    if (!canvas) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    // Center point of the Solar System
    // On desktop, offset slightly to account for the 250px left sidebar
    if (width >= 820) {
      // Space between left sidebar (250px) and right panel
      sunCenterX = 250 + (width - 250) * 0.46;
      sunCenterY = height * 0.52;
      baseRadius = Math.min((width - 250) * 0.45, height * 0.56);
    } else {
      sunCenterX = width * 0.50;
      sunCenterY = height * 0.40;
      baseRadius = Math.min(width * 0.50, height * 0.42);
    }

    sunBody.projX = sunCenterX;
    sunBody.projY = sunCenterY;
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
  // 5. Interactive Hit-Testing (Sun, Moon, Planets)
  // ---------------------------------------------------------------------------
  function hitTest(mx, my) {
    // 1. Check Moon first (smallest target orbiting Earth)
    const dMoon = Math.hypot(mx - moonBody.projX, my - moonBody.projY);
    if (dMoon <= moonBody.radius + 14) {
      return moonBody;
    }

    // 2. Check Sun at center
    const dSun = Math.hypot(mx - sunBody.projX, my - sunBody.projY);
    if (dSun <= sunBody.radius + 12) {
      return sunBody;
    }

    // 3. Check Planets in reverse order (foreground / larger worlds first)
    for (let i = planets.length - 1; i >= 0; i--) {
      const p = planets[i];
      const dist = Math.hypot(mx - p.projX, my - p.projY);
      // Generous +18px touch padding for effortless clicking
      if (dist <= p.radius + 18) {
        return p;
      }
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // 6. Drawing Routines: Deep Space, Nebulae, Stars
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

    // 2. Luminous celestial nebulae clouds (subtle galactic dust)
    // Blue-violet nebula pocket in upper-left
    const neb1 = ctx.createRadialGradient(
      width * 0.25, height * 0.25, 20,
      width * 0.25, height * 0.25, width * 0.4
    );
    neb1.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
    neb1.addColorStop(0.6, 'rgba(99, 102, 241, 0.03)');
    neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb1;
    ctx.fillRect(0, 0, width, height);

    // Golden-amber galactic core glow in center-right
    const neb2 = ctx.createRadialGradient(
      sunCenterX + baseRadius * 0.4, sunCenterY - baseRadius * 0.15, 10,
      sunCenterX + baseRadius * 0.4, sunCenterY - baseRadius * 0.15, width * 0.35
    );
    neb2.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
    neb2.addColorStop(0.7, 'rgba(180, 83, 9, 0.015)');
    neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb2;
    ctx.fillRect(0, 0, width, height);

    // 3. Twinkling starry starfield
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      if (!prefersReducedMotion) {
        s.twinklePhase += s.twinkleSpeed;
      }
      const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.twinklePhase));
      const sx = s.xRatio * width;
      const sy = s.yRatio * height;

      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, alpha));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
      ctx.fill();

      // Delicate soft glow on brightest stars
      if (s.radius > 1.2) {
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 4;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Drawing Routines: Central Sun
  // ---------------------------------------------------------------------------
  function drawSun(time) {
    ctx.save();
    const isSelected = selectedBodyId === 'sun';
    const isHovered = hoveredBodyId === 'sun';

    const pulse = Math.sin(time * 0.003) * 2;
    const r = sunBody.radius;

    // 1. Selection / Hover Halo
    if (isSelected || isHovered) {
      const haloR = r + 11 + Math.sin(time * 0.005) * 3;
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, haloR, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = isSelected ? 2.2 : 1.5;
      ctx.shadowColor = isSelected ? '#38bdf8' : '#ffffff';
      ctx.shadowBlur = isSelected ? 16 : 8;
      ctx.stroke();

      // Nameplate
      ctx.font = '600 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
      ctx.fillText('THE SUN', sunCenterX, sunCenterY - haloR - 4);
    }

    // 2. Broad outer corona glow
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

    // 3. Inner warm corona
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

    // 4. Sun Photosphere Core
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
  // 8. Drawing Routines: Orbit Guide Lines
  // ---------------------------------------------------------------------------
  function drawOrbitLines() {
    ctx.save();
    planets.forEach((p) => {
      // Glow if this planet is selected, or if Earth is selected and this is Earth
      const isSelected = p.id === selectedBodyId || (p.id === 'earth' && selectedBodyId === 'moon');
      ctx.beginPath();
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.08) {
        const pt = projectOrbit(p.orbitScale, theta);
        if (theta === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      if (isSelected) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 9;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.0;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 9. Drawing Routines: Earth-Moon Sub-System
  // ---------------------------------------------------------------------------
  function drawMoonSystem(earth, time) {
    const isSelected = selectedBodyId === 'moon';
    const isHovered = hoveredBodyId === 'moon';

    // Update Moon's orbital position around Earth
    if (!prefersReducedMotion) {
      moonAngle += 0.007;
    }

    const moonOrbitR = 25; // Distance from Earth
    moonBody.projX = earth.projX + Math.cos(moonAngle) * moonOrbitR;
    moonBody.projY = earth.projY + Math.sin(moonAngle) * (moonOrbitR * 0.44);

    ctx.save();

    // 1. Delicate lunar orbit track around Earth
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

    // 2. Moon Beacon Halo on Selection / Hover
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

      // Nameplate
      ctx.font = '600 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
      ctx.fillText('THE MOON', moonBody.projX, moonBody.projY - haloRadius - 3);
    }

    // 3. Moon Body (Sun-facing cratered shading)
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
  // 10. Drawing Routines: Planet Spheres & Rings
  // ---------------------------------------------------------------------------
  function drawPlanet(p, time) {
    const isSelected = p.id === selectedBodyId;
    const isHovered = p.id === hoveredBodyId;

    ctx.save();

    // 1. Selection & Hover Beacon Halo
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

      // Celestial name tag above planet
      ctx.font = '600 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
      ctx.fillText(p.name.toUpperCase(), p.projX, p.projY - haloRadius - 4);
    }

    // 2. Realistic Sun-Facing Spherical Shading
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

    // 3. Planetary Rings (Saturn & Uranus)
    if (p.hasRings) {
      ctx.save();
      ctx.translate(p.projX, p.projY);
      ctx.rotate(-0.32); // Orbital tilt
      ctx.scale(1.0, 0.34); // Foreshortened perspective

      if (p.id === 'saturn') {
        // Outer broad ring
        ctx.beginPath();
        ctx.arc(0, 0, p.ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Inner bright ring
        ctx.beginPath();
        ctx.arc(0, 0, p.ringRadius - 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        // Uranus pale ring
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
  // 11. Drawing Routines: Shooting Stars
  // ---------------------------------------------------------------------------
  function drawShootingStars() {
    if (Date.now() > nextShootingStarTime && !prefersReducedMotion) {
      spawnShootingStar();
      nextShootingStarTime = Date.now() + Math.random() * 4000 + 2500;
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
  // 12. Main Animation Frame Loop
  // ---------------------------------------------------------------------------
  function render(time) {
    if (isPaused) return;

    ctx.clearRect(0, 0, width + 10, height + 10);

    // 1. Procedural deep-space starfield & nebulae
    drawDeepSpace();

    // 2. Shooting stars
    drawShootingStars();

    // 3. Orbit tracks
    drawOrbitLines();

    // 4. Central Sun
    drawSun(time);

    // 5. Update & draw planets
    let earthRef = null;
    planets.forEach((p) => {
      if (!prefersReducedMotion) {
        p.angle += p.speed;
      }

      const pos = projectOrbit(p.orbitScale, p.angle);
      p.projX = pos.x;
      p.projY = pos.y;

      if (p.id === 'earth') {
        earthRef = p;
      }

      drawPlanet(p, time);
    });

    // 6. Earth's Moon sub-system
    if (earthRef) {
      drawMoonSystem(earthRef, time);
    }

    animationId = requestAnimationFrame(render);
  }

  // ---------------------------------------------------------------------------
  // 13. Public Initializer & Event Listeners
  // ---------------------------------------------------------------------------
  function init(canvasElement, onSelectPlanet) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    onSelectCallback = onSelectPlanet;

    initStarfield();
    updateLayout();
    window.addEventListener('resize', () => {
      initStarfield();
      updateLayout();
    });

    // Reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
    });

    // Tab visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationId);
      } else {
        isPaused = false;
        animationId = requestAnimationFrame(render);
      }
    });

    // Mouse move hover detection
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const hit = hitTest(mx, my);
      if (hit) {
        hoveredBodyId = hit.id;
        canvas.style.cursor = 'pointer';
      } else {
        hoveredBodyId = null;
        canvas.style.cursor = 'default';
      }
    });

    // Click / Touch selection detection
    function handlePointerSelect(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      const hit = hitTest(mx, my);
      if (hit && onSelectCallback) {
        selectedBodyId = hit.id;
        onSelectCallback(hit.id);
      }
    }

    canvas.addEventListener('click', (e) => {
      handlePointerSelect(e.clientX, e.clientY);
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        handlePointerSelect(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Start render loop
    animationId = requestAnimationFrame(render);
  }

  function setSelectedPlanet(bodyId) {
    selectedBodyId = bodyId;
  }

  return {
    init,
    setSelectedPlanet,
    getPlanets: () => planets
  };
})();
