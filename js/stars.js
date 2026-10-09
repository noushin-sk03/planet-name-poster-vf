/**
 * stars.js - Milky Way Background & Shooting Stars Animation
 * ------------------------------------------------------------
 * Renders a lightweight, serene starry night sky with:
 * 1. Galactic cosmic dust / Milky Way glow
 * 2. Twinkling celestial stars
 * 3. Dynamic shooting stars with glowing fading tails
 */

(() => {
  const canvas = document.createElement('canvas');
  canvas.id = 'milkyway-canvas';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  });

  // Generate static & twinkling stars
  const stars = [];
  const STAR_COUNT = Math.min(220, Math.floor((width * height) / 6000));

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.8 ? '#fef08a' : (Math.random() > 0.6 ? '#bae6fd' : '#ffffff')
      });
    }
  }

  // Shooting star manager
  const shootingStars = [];

  function spawnShootingStar() {
    // Start from top-right / upper areas and shoot diagonally down-left
    const startX = Math.random() * (width * 0.8) + width * 0.2;
    const startY = Math.random() * (height * 0.4);
    const speed = Math.random() * 7 + 9;
    const angle = Math.PI * 0.75 + (Math.random() * 0.2 - 0.1); // ~135 degrees diagonal
    const length = Math.random() * 90 + 70;

    shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length,
      opacity: 1.0,
      decay: Math.random() * 0.012 + 0.014
    });
  }

  // Schedule random shooting stars
  let nextShootingStarTime = Date.now() + 1500;

  function render(time) {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw twinkling stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.phase += s.twinkleSpeed;
      const alpha = s.baseAlpha * (0.65 + 0.35 * Math.sin(s.phase));

      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Spawn periodic shooting stars
    if (Date.now() > nextShootingStarTime) {
      spawnShootingStar();
      nextShootingStarTime = Date.now() + Math.random() * 3500 + 2000; // Every 2-5.5 seconds
    }

    // 3. Draw and update shooting stars
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
      grad.addColorStop(0.7, 'rgba(147, 197, 253, 0.6)');
      grad.addColorStop(1, '#ffffff');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();

      // Bright meteor head glow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(render);
  }

  initStars();
  requestAnimationFrame(render);
})();
