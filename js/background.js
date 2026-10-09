/**
 * background.js - Interactive Solar System Canvas Animation
 * -----------------------------------------------------------
 * Responsibilities:
 * 1. Deep-Space Starry Backdrop: Renders the dark Milky Way astrophotography image.
 * 2. Radiant Center Sun: Golden star with breathing corona and atmospheric flare.
 * 3. 3D Perspective Orbital Math: Projects planets along tilted elliptical orbits.
 * 4. Realistic Sun-Facing Lighting: Shading gradients originate from the center Sun.
 * 5. Two-Way Interactive Hit-Testing: Generous touch padding for effortless clicking.
 * 6. Visual Selection Feedback: Pulsing cyan beacon halo and glowing orbital path.
 * 7. Shooting Stars: Luminous meteors with fading tails streaking across the starfield.
 * 8. Performance: Tab-pause via visibilitychange and prefers-reduced-motion support.
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

  // Center point & scale of the solar system
  let sunCenterX = 0;
  let sunCenterY = 0;
  let baseRadius = 0;

  // Callback when a planet is clicked on the canvas
  let onSelectCallback = null;
  let selectedPlanetId = 'earth';
  let hoveredPlanetId = null;

  // Dark Milky Way astrophotography backdrop
  const baseImage = new Image();
  let baseImageLoaded = false;
  baseImage.onload = () => {
    baseImageLoaded = true;
    updateLayout();
  };
  baseImage.src = 'assets/milkyway.jpg';

  // 8 Solar System Planets Configuration
  // Orbit scales are spaced cleanly from Sun outward
  const planets = [
    {
      id: 'mercury',
      name: 'Mercury',
      color: '#e2e8f0',
      secondaryColor: '#64748b',
      radius: 5.5,
      orbitScale: 0.19,
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
      orbitScale: 0.29,
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
      orbitScale: 0.49,
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
      orbitScale: 0.62,
      speed: 0.00045,
      angle: 1.4,
      projX: 0,
      projY: 0
    },
    {
      id: 'saturn',
      name: 'Saturn',
      color: '#fef08a',
      secondaryColor: '#ca8a04',
      radius: 16,
      orbitScale: 0.74,
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
      orbitScale: 0.86,
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
      orbitScale: 0.97,
      speed: 0.00015,
      angle: 2.8,
      projX: 0,
      projY: 0
    }
  ];

  // Shooting Stars Collection
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

  /**
   * Resizes canvas and positions center Sun relative to viewport.
   */
  function updateLayout() {
    if (!canvas) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    // Center point of the solar system:
    // On desktop, offset slightly to account for the 250px left sidebar
    if (width >= 820) {
      sunCenterX = 250 + (width - 250) * 0.50;
      sunCenterY = height * 0.46;
      baseRadius = Math.min((width - 250) * 0.49, height * 0.60);
    } else {
      sunCenterX = width * 0.50;
      sunCenterY = height * 0.44;
      baseRadius = Math.min(width * 0.53, height * 0.46);
    }
  }

  /**
   * Mathematical Orbit Projection:
   * Maps 2D orbital angle theta into 3D tilted perspective coordinates.
   *
   * @param {number} scaleRatio - Radius ratio relative to canvas max extent
   * @param {number} angle - Current orbital angle in radians
   * @returns {{x: number, y: number}} - Projected screen coordinates
   */
  function projectOrbit(scaleRatio, angle) {
    const a = baseRadius * scaleRatio;
    const b = a * 0.42; // Vertical foreshortening ratio
    const tilt = -0.32; // -18.3 degrees inclination angle

    // Parametric ellipse formula with 2D rotation matrix:
    const ex = a * Math.cos(angle);
    const ey = b * Math.sin(angle);

    const x = sunCenterX + (ex * Math.cos(tilt) - ey * Math.sin(tilt));
    const y = sunCenterY + (ex * Math.sin(tilt) + ey * Math.cos(tilt));

    return { x, y };
  }

  /**
   * Hit-testing: Checks if (mx, my) intersects any planet.
   *
   * @param {number} mx - Mouse / Touch X
   * @param {number} my - Mouse / Touch Y
   * @returns {Object|null} - Clicked planet object or null
   */
  function hitTest(mx, my) {
    // Search in reverse so visually foreground/larger planets are picked first
    for (let i = planets.length - 1; i >= 0; i--) {
      const p = planets[i];
      const dx = mx - p.projX;
      const dy = my - p.projY;
      const dist = Math.hypot(dx, dy);

      // Generous 18px touch target padding for effortless clicking
      if (dist <= p.radius + 18) {
        return p;
      }
    }
    return null;
  }

  /**
   * Draws the dark Milky Way astrophotography backdrop.
   */
  function drawBackdrop() {
    if (baseImageLoaded) {
      const imgAspect = baseImage.width / baseImage.height;
      const screenAspect = width / height;
      let drawW, drawH, drawX, drawY;

      if (screenAspect > imgAspect) {
        drawW = width;
        drawH = width / imgAspect;
        drawX = 0;
        drawY = (height - drawH) / 2;
      } else {
        drawH = height;
        drawW = height * imgAspect;
        drawX = (width - drawW) / 2;
        drawY = 0;
      }

      ctx.drawImage(baseImage, drawX, drawY, drawW, drawH);

      // Deep celestial vignette for high text legibility & cosmic mood
      const vignette = ctx.createRadialGradient(
        sunCenterX, sunCenterY, baseRadius * 0.25,
        sunCenterX, sunCenterY, Math.max(width, height) * 0.85
      );
      vignette.addColorStop(0, 'rgba(5, 7, 14, 0.12)');
      vignette.addColorStop(0.65, 'rgba(4, 6, 12, 0.52)');
      vignette.addColorStop(1, 'rgba(2, 3, 6, 0.88)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Cosmic gradient fallback
      const bgGrad = ctx.createRadialGradient(sunCenterX, sunCenterY, 30, sunCenterX, sunCenterY, width * 0.8);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#05070f');
      bgGrad.addColorStop(1, '#020306');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * Draws the glowing golden Sun in the center with breathing corona.
   */
  function drawSun(time) {
    ctx.save();
    const pulse = Math.sin(time * 0.003) * 2;
    const sunRadius = 24;

    // 1. Broad outer corona glow
    const outerGrad = ctx.createRadialGradient(
      sunCenterX, sunCenterY, sunRadius * 0.5,
      sunCenterX, sunCenterY, sunRadius * 3.4 + pulse
    );
    outerGrad.addColorStop(0, 'rgba(251, 191, 36, 0.42)');
    outerGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.18)');
    outerGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(sunCenterX, sunCenterY, sunRadius * 3.4 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // 2. Inner warm corona
    const innerGrad = ctx.createRadialGradient(
      sunCenterX, sunCenterY, sunRadius * 0.2,
      sunCenterX, sunCenterY, sunRadius * 1.6
    );
    innerGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
    innerGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.5)');
    innerGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(sunCenterX, sunCenterY, sunRadius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // 3. Sun Core (Photosphere)
    const coreGrad = ctx.createRadialGradient(
      sunCenterX - 3, sunCenterY - 3, 0,
      sunCenterX, sunCenterY, sunRadius
    );
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, '#fef08a');
    coreGrad.addColorStop(0.8, '#f59e0b');
    coreGrad.addColorStop(1, '#ea580c');

    ctx.fillStyle = coreGrad;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draws elliptical orbit guide paths with luminescent highlights.
   */
  function drawOrbitLines() {
    ctx.save();
    planets.forEach((p) => {
      const isSelected = p.id === selectedPlanetId;
      ctx.beginPath();
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.08) {
        const pt = projectOrbit(p.orbitScale, theta);
        if (theta === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      if (isSelected) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
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

  /**
   * Draws a single planet with Sun-facing 3D spherical lighting, rings, and halos.
   */
  function drawPlanet(p, time) {
    const isSelected = p.id === selectedPlanetId;
    const isHovered = p.id === hoveredPlanetId;

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
    // Light highlight is offset toward the center Sun
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
      ctx.rotate(-0.32); // Align with orbit plane tilt
      ctx.scale(1.0, 0.34); // Foreshortened perspective
      ctx.beginPath();
      ctx.arc(0, 0, p.ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = p.id === 'saturn' ? 'rgba(254, 240, 138, 0.8)' : 'rgba(153, 246, 228, 0.55)';
      ctx.lineWidth = p.id === 'saturn' ? 5 : 2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draws occasional shooting stars streaking across the sky.
   */
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

  /**
   * Main animation frame loop.
   */
  function render(time) {
    if (isPaused) return;

    ctx.clearRect(0, 0, width + 10, height + 10);

    // 1. Draw base deep-space backdrop
    drawBackdrop();

    // 2. Draw shooting stars
    drawShootingStars();

    // 3. Draw orbit guide tracks
    drawOrbitLines();

    // 4. Draw central Sun
    drawSun(time);

    // 5. Update and draw planets
    planets.forEach((p) => {
      if (!prefersReducedMotion) {
        p.angle += p.speed;
      }

      const pos = projectOrbit(p.orbitScale, p.angle);
      p.projX = pos.x;
      p.projY = pos.y;

      drawPlanet(p, time);
    });

    animationId = requestAnimationFrame(render);
  }

  /**
   * Initializes the Solar Background module.
   *
   * @param {HTMLCanvasElement} canvasElement
   * @param {Function} onSelectPlanet
   */
  function init(canvasElement, onSelectPlanet) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    onSelectCallback = onSelectPlanet;

    updateLayout();
    window.addEventListener('resize', updateLayout);

    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
    });

    // Pause animation when tab is inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationId);
      } else {
        isPaused = false;
        animationId = requestAnimationFrame(render);
      }
    });

    // Mouse hover detection
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const hit = hitTest(mx, my);
      if (hit) {
        hoveredPlanetId = hit.id;
        canvas.style.cursor = 'pointer';
      } else {
        hoveredPlanetId = null;
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
        selectedPlanetId = hit.id;
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

  /**
   * Sets active selected planet from external sources.
   * @param {string} planetId
   */
  function setSelectedPlanet(planetId) {
    selectedPlanetId = planetId;
  }

  return {
    init,
    setSelectedPlanet,
    getPlanets: () => planets
  };
})();
