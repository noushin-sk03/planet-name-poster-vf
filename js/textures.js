/**
 * textures.js - Planetary Texture & Font Asset Manager
 * ----------------------------------------------------
 * Responsibilities:
 * 1. Asynchronous Font Loading: Guarantees the bold serif font is rasterized
 *    in browser memory before the Canvas API attempts to measure or render glyphs.
 * 2. Texture Loading & Caching: Loads real texture image files with Promise-based
 *    lifecycle tracking and memory caching.
 * 3. Procedural Gradient & Pattern Fallback: Synthesizes rich, procedurally generated
 *    planet textures onto an offscreen canvas if texture image files are missing,
 *    preventing blank screens and canvas tainting.
 */

const TextureManager = (() => {
  // In-memory cache for loaded Image elements (keyed by texture path)
  const imageCache = new Map();

  // In-memory cache for synthesized procedural textures (keyed by `${planetId}_${mode}`)
  const proceduralCache = new Map();

  /**
   * Ensures the target serif font is fully loaded and ready in the browser.
   * Why this matters:
   * HTML Canvas `ctx.fillText()` draws synchronously. If a web font isn't finished
   * downloading, Canvas silently falls back to a default system font (like Times New Roman),
   * producing an incorrect visual result without throwing an error.
   *
   * @param {string} fontSpec - e.g. '900 120px "Cinzel"'
   * @returns {Promise<void>}
   */
  async function ensureFontsReady(fontSpec = '900 120px "Cinzel"') {
    if (!('fonts' in document)) {
      // Fallback for older browsers without CSS Font Loading API
      return Promise.resolve();
    }

    try {
      // Explicitly request the browser to load this specific font weight/family
      await document.fonts.load(fontSpec);
      // Wait for all queued font faces to be decoded
      await document.fonts.ready;
    } catch (err) {
      console.warn('Font loading check completed with fallback:', err);
    }
  }

  /**
   * Loads an image from a URL or relative path using an asynchronous Promise.
   *
   * @param {string} src - Path to the image file
   * @returns {Promise<HTMLImageElement>}
   */
  function loadImage(src) {
    // Return cached image if already loaded
    if (imageCache.has(src)) {
      return Promise.resolve(imageCache.get(src));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      // Allow cross-origin access if loaded from external CDNs
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };

      img.onerror = (err) => {
        reject(new Error(`Failed to load texture at ${src}`));
      };

      img.src = src;
    });
  }

  /**
   * Generates a rich procedural planetary texture on an in-memory canvas.
   * Used as the primary fallback when external image assets don't exist yet,
   * ensuring the student sees distinct planetary surfaces immediately.
   *
   * @param {Object} planet - Planet data object from planets.json
   * @param {string} mode - 'day' or 'night'
   * @returns {HTMLCanvasElement} - Offscreen canvas ready to be used as a texture
   */
  function generateProceduralTexture(planet, mode = 'day') {
    const cacheKey = `${planet.id}_${mode}`;
    if (proceduralCache.has(cacheKey)) {
      return proceduralCache.get(cacheKey);
    }

    // Create an offscreen canvas for the texture map (1024x512 equirectangular aspect)
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const p = planet.palette || {
      primary: '#888888',
      secondary: '#444444',
      accent: '#cccccc'
    };

    // 1. Base Gradient: create the planetary color foundation
    const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
    baseGrad.addColorStop(0, p.secondary);
    baseGrad.addColorStop(0.5, p.primary);
    baseGrad.addColorStop(1, p.secondary);
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Planet-specific geological & atmospheric features
    switch (planet.id) {
      case 'jupiter':
      case 'saturn': {
        // Atmospheric zonal bands (belts and zones)
        const bandCount = planet.id === 'jupiter' ? 24 : 16;
        for (let i = 0; i < bandCount; i++) {
          const y = (h / bandCount) * i;
          const bandHeight = (h / bandCount) * (0.6 + Math.sin(i * 1.5) * 0.4);
          const alpha = 0.15 + (i % 3 === 0 ? 0.25 : 0.08);

          ctx.fillStyle = i % 2 === 0 ? p.accent : p.secondary;
          ctx.globalAlpha = alpha;

          // Add slight turbulence wave to gas bands
          ctx.beginPath();
          ctx.moveTo(0, y);
          for (let x = 0; x <= w; x += 64) {
            const wave = Math.sin((x / w) * Math.PI * 6 + i) * 6;
            ctx.lineTo(x, y + wave);
          }
          ctx.lineTo(w, y + bandHeight);
          ctx.lineTo(0, y + bandHeight);
          ctx.closePath();
          ctx.fill();
        }

        // Jupiter's iconic Great Red Spot
        if (planet.id === 'jupiter') {
          ctx.globalAlpha = 0.85;
          const spotGrad = ctx.createRadialGradient(w * 0.65, h * 0.65, 5, w * 0.65, h * 0.65, 60);
          spotGrad.addColorStop(0, '#c53030');
          spotGrad.addColorStop(0.7, '#9b2c2c');
          spotGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.ellipse(w * 0.65, h * 0.65, 75, 45, -0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'earth': {
        if (mode === 'night') {
          // Earth at Night: deep abyss with glowing city light networks
          ctx.fillStyle = '#060a14';
          ctx.globalAlpha = 1;
          ctx.fillRect(0, 0, w, h);

          // Luminous city clusters
          for (let i = 0; i < 350; i++) {
            const cx = Math.random() * w;
            const cy = 100 + Math.random() * (h - 200);
            const radius = 1 + Math.random() * 3;
            ctx.fillStyle = Math.random() > 0.3 ? '#fef08a' : '#f59e0b';
            ctx.globalAlpha = 0.4 + Math.random() * 0.6;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Earth Day: oceanic continents and soft cloud swirls
          // Continental landmass shapes
          ctx.fillStyle = '#2f855a';
          ctx.globalAlpha = 0.55;
          for (let i = 0; i < 12; i++) {
            const cx = (w / 12) * i + (Math.random() * 60 - 30);
            const cy = 140 + Math.random() * (h - 280);
            ctx.beginPath();
            ctx.ellipse(cx, cy, 70 + Math.random() * 50, 40 + Math.random() * 40, Math.random(), 0, Math.PI * 2);
            ctx.fill();
          }

          // Atmospheric white cloud bands
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.35;
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.ellipse(w * (0.15 + i * 0.16), h * (0.3 + (i % 3) * 0.2), 120, 20, 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'mars': {
        // Mars: iron-oxide rust with dark basaltic volcanic plains (Syrtis Major)
        ctx.fillStyle = '#4a1508';
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 15; i++) {
          const cx = Math.random() * w;
          const cy = 100 + Math.random() * (h - 200);
          ctx.beginPath();
          ctx.ellipse(cx, cy, 80 + Math.random() * 70, 35 + Math.random() * 30, Math.random() * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Dust storm striations
        ctx.fillStyle = '#dd6b20';
        ctx.globalAlpha = 0.25;
        for (let y = 50; y < h - 50; y += 40) {
          ctx.fillRect(0, y, w, 8);
        }
        break;
      }

      case 'moon':
      case 'mercury': {
        // Lunar/Mercurian impact craters and basaltic maria
        ctx.fillStyle = '#2d3748';
        ctx.globalAlpha = 0.45;
        // Large Maria basins
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.ellipse(w * (0.2 + i * 0.1), h * (0.3 + (i % 2) * 0.3), 60 + i * 5, 45, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // Impact craters with highlighted rims
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 50; i++) {
          const cx = Math.random() * w;
          const cy = Math.random() * h;
          const r = 4 + Math.random() * 14;
          // Crater bowl
          ctx.fillStyle = '#1a202c';
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          // Crater bright rim
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        break;
      }

      case 'sun': {
        // Solar flare convection cells and fiery granulation
        const sunGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 2);
        sunGrad.addColorStop(0, '#fffbeb');
        sunGrad.addColorStop(0.4, '#f59e0b');
        sunGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = sunGrad;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(0, 0, w, h);

        // Solar turbulence filaments
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 80; i++) {
          ctx.globalAlpha = 0.15 + Math.random() * 0.25;
          const cx = Math.random() * w;
          const cy = Math.random() * h;
          ctx.beginPath();
          ctx.arc(cx, cy, 2 + Math.random() * 8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'venus': {
        // Venus: thick swirling sulfuric acid cloud decks
        ctx.fillStyle = '#f6ad55';
        ctx.globalAlpha = 0.3;
        for (let y = 0; y < h; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(w * 0.3, y + 25, w * 0.7, y - 25, w, y);
          ctx.lineWidth = 18;
          ctx.strokeStyle = p.accent;
          ctx.stroke();
        }
        break;
      }

      case 'io': {
        // Io: Volcanic sulfur world with active calderas and sulfur dioxide frost
        ctx.fillStyle = '#b91c1c'; // Volcanic red halos
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 20; i++) {
          const cx = Math.random() * w;
          const cy = Math.random() * h;
          const r = 12 + Math.random() * 25;
          // Outer sulfur halo
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        // Black caldera vents (Loki / Pele)
        ctx.fillStyle = '#1c1917';
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < 35; i++) {
          const cx = Math.random() * w;
          const cy = Math.random() * h;
          ctx.beginPath();
          ctx.arc(cx, cy, 3 + Math.random() * 8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'europa': {
        // Europa: Smooth water-ice shell with criss-crossing reddish tectonic lineae
        ctx.fillStyle = '#9a3412';
        ctx.globalAlpha = 0.45;
        for (let i = 0; i < 24; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * w, 0);
          ctx.bezierCurveTo(w * Math.random(), h * 0.4, w * Math.random(), h * 0.6, Math.random() * w, h);
          ctx.lineWidth = 1.5 + Math.random() * 4;
          ctx.strokeStyle = '#9a3412';
          ctx.stroke();
        }
        break;
      }

      case 'ganymede': {
        // Ganymede: Ancient dark cratered polygons interspersed with light grooved terrain
        ctx.fillStyle = '#1e293b';
        ctx.globalAlpha = 0.55;
        for (let i = 0; i < 16; i++) {
          const cx = (w / 8) * (i % 8) + (Math.random() * 40);
          const cy = (h / 2) * Math.floor(i / 8) + (Math.random() * 80);
          ctx.fillRect(cx, cy, 90, 70);
        }
        // Light grooved terrain bands
        ctx.strokeStyle = '#cbd5e1';
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 2;
        for (let y = 20; y < h; y += 22) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y + (Math.random() * 10 - 5));
          ctx.stroke();
        }
        break;
      }

      case 'callisto': {
        // Callisto: Heavily cratered ancient ice-rock surface
        ctx.fillStyle = '#0f172a';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(0, 0, w, h);
        // Saturated craters
        for (let i = 0; i < 70; i++) {
          const cx = Math.random() * w;
          const cy = Math.random() * h;
          const r = 3 + Math.random() * 16;
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          // Bright icy ejecta rims
          ctx.strokeStyle = '#e2e8f0';
          ctx.globalAlpha = 0.4;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        break;
      }

      case 'enceladus': {
        // Enceladus: Hyper-reflective pristine ice with south-polar tiger stripes
        ctx.fillStyle = '#f0f9ff';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, w, h);
        // South polar blue tiger stripes
        ctx.strokeStyle = '#0284c7';
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          const startX = w * (0.35 + i * 0.08);
          ctx.moveTo(startX, h * 0.75);
          ctx.lineTo(startX + 30, h * 0.95);
          ctx.stroke();
        }
        break;
      }

      case 'titan': {
        // Titan: Photochemical nitrogen-methane haze with dark equatorial sand seas
        ctx.fillStyle = '#78350f';
        ctx.globalAlpha = 0.35;
        // Equatorial organic dune fields (Shangri-La / Belet)
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(w * (0.16 * i + 0.1), h * 0.52, 110, 40, 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        // Northern liquid hydrocarbon lakes (Kraken / Ligeia Mare)
        ctx.fillStyle = '#0f172a';
        ctx.globalAlpha = 0.55;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(w * (0.3 + i * 0.2), h * 0.22, 50, 25, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'uranus':
      case 'neptune': {
        // Icy methane gas giants: deep blue haze with bright storm cirrus
        ctx.fillStyle = '#e2e8f0';
        ctx.globalAlpha = 0.25;
        // High altitude storm streaks
        for (let i = 0; i < 10; i++) {
          const y = h * (0.2 + i * 0.07);
          ctx.fillRect(w * 0.1, y, w * 0.8, 3 + Math.random() * 4);
        }
        break;
      }
    }

    // Reset alpha
    ctx.globalAlpha = 1.0;

    // Save to procedural cache
    proceduralCache.set(cacheKey, canvas);
    return canvas;
  }

  /**
   * Retrieves a texture for the given planet and mode.
   * Tries to load the external image file first; if missing or on error,
   * falls back immediately to the rich procedural planet canvas.
   *
   * @param {Object} planet - Planet data object
   * @param {string} mode - 'day' or 'night'
   * @returns {Promise<CanvasImageSource>}
   */
  async function getPlanetTexture(planet, mode = 'day') {
    if (!planet) {
      throw new Error('No planet provided to TextureManager');
    }

    // Try to load external image file if path is specified
    if (planet.texture) {
      try {
        const img = await loadImage(planet.texture);
        return img;
      } catch (err) {
        // Image missing or failed to load: fall back smoothly to procedural texture
        // (as requested for Stage 1 placeholder gradients)
      }
    }

    // Fall back to generated procedural gradient/pattern canvas
    return generateProceduralTexture(planet, mode);
  }

  return {
    ensureFontsReady,
    loadImage,
    generateProceduralTexture,
    getPlanetTexture
  };
})();
