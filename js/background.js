/**
 * background.js - Interactive Solar System Canvas Animation
 * -----------------------------------------------------------
 * Responsibilities:
 * 1. Full-Screen Backdrop: Renders the Milky Way solar system image as base,
 *    aligning coordinate systems with the golden Sun in the user's reference image.
 * 2. 3D Perspective Orbital Math: Projects planets along elliptical tilted orbits.
 * 3. Two-Way Interactive Hit-Testing:
 *    Detects clicks and touches on moving planets with generous tap target padding.
 * 4. Selection Feedback: Pulsing target halo around the active planet and glowing orbit path.
 * 5. Celestial Polish: Occasional shooting stars, hover tooltips, and tab-pause logic.
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

  // Center point & scale aligned with the reference image
  let sunCenterX = 0;
  let sunCenterY = 0;
  let baseRadius = 0;

  // Callback when a planet is clicked on the canvas
  let onSelectCallback = null;
  let selectedPlanetId = 'earth';
  let hoveredPlanetId = null;

  // Base Milky Way backdrop image
  const baseImage = new Image();
  let baseImageLoaded = false;
  baseImage.onload = () => {
    baseImageLoaded = true;
    updateLayout();
  };
  baseImage.src = 'assets/solar_system.jpg';

  // 8 Solar System Planets Configuration
  // Orbit ratios are scaled relative to canvas dimensions
  const planets = [
    {
      id: 'mercury',
      name: 'Mercury',
      color: '#a3a3a3',
      secondaryColor: '#737373',
      radius: 6,
      orbitScale: 0.17,
      speed: 0.0016,
      angle: 0.5,
      projX: 0,
      projY: 0
    },
    {
      id: 'venus',
      name: 'Venus',
      color: '#eab308',
      secondaryColor: '#ca8a04',
      radius: 9,
      orbitScale: 0.24,
      speed: 0.0012,
      angle: 1.8,
      projX: 0,
      projY: 0
    },
    {
      id: 'earth',
      name: 'Earth',
      color: '#38bdf8',
      secondaryColor: '#16a34a',
      radius: 11,
      orbitScale: 0.32,
      speed: 0.0009,
      angle: 3.4,
      projX: 0,
      projY: 0
    },
    {
      id: 'mars',
      name: 'Mars',
      color: '#ef4444',
      secondaryColor: '#991b1b',
      radius: 8,
      orbitScale: 0.40,
      speed: 0.0007,
      angle: 5.1,
      projX: 0,
      projY: 0
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      color: '#f97316',
      secondaryColor: '#c2410c',
      radius: 20,
      orbitScale: 0.53,
      speed: 0.00045,
      angle: 2.1,
      hasBands: true,
      projX: 0,
      projY: 0
    },
    {
      id: 'saturn',
      name: 'Saturn',
      color: '#fde047',
      secondaryColor: '#ca8a04',
      radius: 17,
      orbitScale: 0.67,
      speed: 0.00032,
      angle: 4.2,
      hasRings: true,
      ringRadius: 32,
      projX: 0,
      projY: 0
    },
    {
      id: 'uranus',
      name: 'Uranus',
      color: '#2dd4bf',
      secondaryColor: '#0f766e',
      radius: 14,
      orbitScale: 0.81,
      speed: 0.00022,
      angle: 0.9,
      hasRings: true,
      ringRadius: 22,
      projX: 0,
      projY: 0
    },
    {
      id: 'neptune',
      name: 'Neptune',
      color: '#3b82f6',
      secondaryColor: '#1d4ed8',
      radius: 13,
      orbitScale: 0.94,
      speed: 0.00015,
      angle: 2.9,
      projX: 0,
      projY: 0
    }
  ];

  // Shooting Stars Collection
  const shootingStars = [];
  let nextShootingStarTime = Date.now() + 2000;

  function spawnShootingStar() {
    const startX = Math.random() * (width * 0.8) + width * 0.2;
    const startY = Math.random() * (height * 0.4);
    const speed = Math.random() * 8 + 8;
    const angle = Math.PI * 0.75 + (Math.random() * 0.2 - 0.1);
    const length = Math.random() * 100 + 70;

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
   * Resizes canvas to fill viewport with high-DPI crispness and aligns center with Sun.
   */
  function updateLayout() {
    if (!canvas) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    if (baseImageLoaded && baseImage.width > 0) {
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

      // In solar_system.jpg, Sun's center is at 52.0% X, 46.3% Y
      sunCenterX = drawX + drawW * 0.520;
      sunCenterY = drawY + drawH * 0.463;
      baseRadius = Math.max(drawW, drawH) * 0.52;
    } else {
      sunCenterX = width * 0.52;
      sunCenterY = height * 0.50;
      baseRadius = Math.max(width, height) * 0.50;
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
    const b = a * 0.44; // Vertical foreshortening ratio

    // Orbital inclination plane angle (~ -18 degrees to match the Milky Way image)
    const tilt = -0.32; // Radians

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
   * Draws the base astronomical backdrop.
   */
  function drawBackdrop() {
    if (baseImageLoaded) {
      // Draw uploaded Milky Way solar-system image covering canvas
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

      // Dark subtle vignette to ensure UI text readability
      const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.75);
      vignette.addColorStop(0, 'rgba(5, 6, 12, 0.20)');
      vignette.addColorStop(1, 'rgba(4, 5, 10, 0.75)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Fallback cosmic gradient if asset is loading
      const bgGrad = ctx.createRadialGradient(sunCenterX, sunCenterY, 50, sunCenterX, sunCenterY, width * 0.8);
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(0.5, '#07090e');
      bgGrad.addColorStop(1, '#020305');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Sun glow placeholder
      const sunGrad = ctx.createRadialGradient(sunCenterX, sunCenterY, 5, sunCenterX, sunCenterY, 40);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.5, '#f59e0b');
      sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, 40, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Draws elliptical orbit guide paths with subtle luminescent styling.
   */
  function drawOrbitLines() {
    ctx.save();
    planets.forEach((p) => {
      const isSelected = p.id === selectedPlanetId;
      ctx.beginPath();
      // Render smooth ellipse using projectOrbit
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.08) {
        const pt = projectOrbit(p.orbitScale, theta);
        if (theta === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      if (isSelected) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
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
   * Draws a single planet with realistic shading, rings, and selection halos.
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
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 5;
      ctx.fillText(p.name.toUpperCase(), p.projX, p.projY - haloRadius - 4);
    }

    // 2. Planet Body (Sphere with sun-facing lighting gradient)
    const sphereGrad = ctx.createRadialGradient(
      p.projX - p.radius * 0.35, p.projY - p.radius * 0.35, 1,
      p.projX, p.projY, p.radius
    );
    sphereGrad.addColorStop(0, p.color);
    sphereGrad.addColorStop(0.7, p.secondaryColor);
    sphereGrad.addColorStop(1, '#05070a');

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
      ctx.rotate(-0.35); // Ring tilt
      ctx.scale(1.0, 0.3); // Foreshortened perspective
      ctx.beginPath();
      ctx.arc(0, 0, p.ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = p.id === 'saturn' ? 'rgba(254, 240, 138, 0.75)' : 'rgba(153, 246, 228, 0.55)';
      ctx.lineWidth = p.id === 'saturn' ? 6 : 2;
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

    // 1. Draw base backdrop
    drawBackdrop();

    // 2. Draw shooting stars
    drawShootingStars();

    // 3. Draw orbit guide tracks
    drawOrbitLines();

    // 4. Update and draw planets
    planets.forEach((p) => {
      // Advance orbit unless user prefers reduced motion
      if (!prefersReducedMotion) {
        p.angle += p.speed;
      }

      // Compute current screen coordinates
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

    // Pause animation when user switches tabs (saves battery and CPU)
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

    // Click / Tap selection detection
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
   * Sets active selected planet from external sources (e.g. left menu).
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
