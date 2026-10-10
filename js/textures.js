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
  function generateProceduralTexture(planet, mode = 'day', forceRefresh = false) {
    const cacheKey = `${planet.id}_${mode}`;
    if (!forceRefresh && proceduralCache.has(cacheKey)) {
      return proceduralCache.get(cacheKey);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Helper: seeded "random" based on position so textures are stable (not random each call)
    const rng = (seed) => {
      let s = Math.sin(seed) * 43758.5453;
      return s - Math.floor(s);
    };

    // Use planet color/secondaryColor as palette, with fallback
    const primary   = planet.color        || planet.palette?.primary   || '#888888';
    const secondary = planet.secondaryColor || planet.palette?.secondary || '#444444';
    const accent    = planet.palette?.accent || '#cccccc';

    // ── Base fill ────────────────────────────────────────────────────────────
    const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
    baseGrad.addColorStop(0,   secondary);
    baseGrad.addColorStop(0.5, primary);
    baseGrad.addColorStop(1,   secondary);
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    // ── Per-planet surface features ──────────────────────────────────────────
    switch (planet.id) {

      // ── SUN ──────────────────────────────────────────────────────────────
      case 'sun': {
        const sunGrad = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w*0.6);
        sunGrad.addColorStop(0,   '#fffde7');
        sunGrad.addColorStop(0.3, '#fdd835');
        sunGrad.addColorStop(0.7, '#fb8c00');
        sunGrad.addColorStop(1,   '#bf360c');
        ctx.fillStyle = sunGrad;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(0, 0, w, h);
        // Granulation cells
        for (let i = 0; i < 120; i++) {
          const cx = rng(i*7) * w;
          const cy = rng(i*13) * h;
          const r  = 10 + rng(i*3) * 30;
          ctx.globalAlpha = 0.08 + rng(i*5) * 0.12;
          ctx.fillStyle = rng(i) > 0.5 ? '#fff9c4' : '#e65100';
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
        }
        break;
      }

      // ── MERCURY — brownish grey, heavily cratered, NO polar ice ──────────
      case 'mercury': {
        // Darker brownish base over the gradient
        ctx.fillStyle = '#5d4e37';
        ctx.globalAlpha = 0.35;
        ctx.fillRect(0, 0, w, h);
        // Caloris Basin (huge impact feature)
        ctx.globalAlpha = 0.5;
        const calorisGrad = ctx.createRadialGradient(w*0.28, h*0.42, 5, w*0.28, h*0.42, 110);
        calorisGrad.addColorStop(0, '#8b7355');
        calorisGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = calorisGrad;
        ctx.beginPath(); ctx.arc(w*0.28, h*0.42, 110, 0, Math.PI*2); ctx.fill();
        // Many craters — small and medium
        for (let i = 0; i < 80; i++) {
          const cx = rng(i*11) * w;
          const cy = rng(i*17) * h;
          const r  = 3 + rng(i*7) * 18;
          ctx.fillStyle = '#3e2f1f';
          ctx.globalAlpha = 0.5;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#a08060';
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.4;
          ctx.stroke();
        }
        break;
      }

      // ── VENUS — thick swirling yellow-orange cloud decks ─────────────────
      case 'venus': {
        ctx.fillStyle = '#f6e58d';
        ctx.globalAlpha = 0.25;
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 28) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(w*0.25, y+22, w*0.75, y-22, w, y);
          ctx.lineWidth = 16;
          ctx.strokeStyle = rng(y) > 0.5 ? '#e2a300' : '#c9870a';
          ctx.globalAlpha = 0.18 + rng(y*3) * 0.15;
          ctx.stroke();
        }
        // Bright polar vortex
        const vGrad = ctx.createRadialGradient(w*0.5, 0, 5, w*0.5, 0, 100);
        vGrad.addColorStop(0, '#fff9c4');
        vGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = vGrad; ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.arc(w*0.5, 0, 100, 0, Math.PI*2); ctx.fill();
        break;
      }

      // ── EARTH ─────────────────────────────────────────────────────────────
      case 'earth': {
        if (mode === 'night') {
          ctx.fillStyle = '#050d1a'; ctx.globalAlpha = 1; ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 400; i++) {
            const cx = rng(i*7) * w;
            const cy = 80 + rng(i*13) * (h-160);
            const r  = 0.8 + rng(i*3) * 2.5;
            ctx.fillStyle = rng(i) > 0.3 ? '#fef08a' : '#fbbf24';
            ctx.globalAlpha = 0.35 + rng(i*5) * 0.6;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
          }
        } else {
          // Continents
          ctx.fillStyle = '#2d6a4f'; ctx.globalAlpha = 0.6;
          for (let i = 0; i < 14; i++) {
            ctx.beginPath();
            ctx.ellipse(rng(i*7)*w, 100+rng(i*13)*(h-200), 60+rng(i*3)*55, 35+rng(i*5)*38, rng(i), 0, Math.PI*2);
            ctx.fill();
          }
          // Clouds
          ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.3;
          for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.ellipse(rng(i*11)*w, rng(i*17)*h, 100+rng(i)*60, 14+rng(i*3)*10, rng(i*7)*0.5, 0, Math.PI*2);
            ctx.fill();
          }
        }
        break;
      }

      // ── MARS — rusty red, dark basaltic plains, polar ice caps ───────────
      case 'mars': {
        // Dark volcanic plains (Syrtis Major, Hellas Basin)
        ctx.fillStyle = '#5c1a00'; ctx.globalAlpha = 0.45;
        for (let i = 0; i < 12; i++) {
          ctx.beginPath();
          ctx.ellipse(rng(i*7)*w, 80+rng(i*13)*(h-160), 90+rng(i*3)*80, 40+rng(i*5)*35, rng(i)*0.6, 0, Math.PI*2);
          ctx.fill();
        }
        // Dust storm horizontal striations
        ctx.fillStyle = '#e07040'; ctx.globalAlpha = 0.18;
        for (let y = 40; y < h-40; y += 36) { ctx.fillRect(0, y, w, 7); }
        // White polar ice caps
        ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.ellipse(w*0.5, 20, w*0.22, 28, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w*0.5, h-20, w*0.16, 20, 0, 0, Math.PI*2); ctx.fill();
        break;
      }

      // ── JUPITER — vivid tan/orange/brown bands + Great Red Spot ──────────
      case 'jupiter': {
        const jColors = ['#c8a97a','#8b5e3c','#e8c49a','#6b3a2a','#d4a574','#4a2518'];
        for (let i = 0; i < 28; i++) {
          const y = (h / 28) * i;
          const bh = (h / 28) * (0.7 + Math.sin(i * 1.7) * 0.3);
          ctx.fillStyle = jColors[i % jColors.length];
          ctx.globalAlpha = 0.55 + (i % 3 === 0 ? 0.2 : 0);
          ctx.beginPath(); ctx.moveTo(0, y);
          for (let x = 0; x <= w; x += 80) {
            ctx.lineTo(x, y + Math.sin((x/w)*Math.PI*4+i)*5);
          }
          ctx.lineTo(w, y+bh); ctx.lineTo(0, y+bh); ctx.closePath(); ctx.fill();
        }
        // Great Red Spot
        ctx.globalAlpha = 0.9;
        const grs = ctx.createRadialGradient(w*0.63, h*0.62, 4, w*0.63, h*0.62, 65);
        grs.addColorStop(0, '#c0392b'); grs.addColorStop(0.6, '#922b21'); grs.addColorStop(1, 'transparent');
        ctx.fillStyle = grs;
        ctx.beginPath(); ctx.ellipse(w*0.63, h*0.62, 72, 44, -0.1, 0, Math.PI*2); ctx.fill();
        break;
      }

      // ── SATURN — golden/cream bands, more muted than Jupiter ─────────────
      case 'saturn': {
        const sColors = ['#f5e6c8','#c9a96e','#e8d5a3','#a07840','#d4b982','#8b6530'];
        for (let i = 0; i < 18; i++) {
          const y = (h / 18) * i;
          const bh = (h / 18) * (0.8 + Math.sin(i * 2.1) * 0.2);
          ctx.fillStyle = sColors[i % sColors.length];
          ctx.globalAlpha = 0.45 + (i % 4 === 0 ? 0.2 : 0);
          ctx.fillRect(0, y, w, bh);
        }
        // Subtle oval storms
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#c8a050';
        ctx.beginPath(); ctx.ellipse(w*0.4, h*0.38, 40, 22, 0.2, 0, Math.PI*2); ctx.fill();
        break;
      }

      // ── URANUS — pale blue-green, nearly featureless, faint banding ──────
      case 'uranus': {
        // Nearly uniform teal-blue with subtle gradient
        const uGrad = ctx.createLinearGradient(0, 0, 0, h);
        uGrad.addColorStop(0, '#7fffd4'); uGrad.addColorStop(0.4, '#40e0d0');
        uGrad.addColorStop(0.6, '#20b2aa'); uGrad.addColorStop(1, '#008b8b');
        ctx.fillStyle = uGrad; ctx.globalAlpha = 0.85; ctx.fillRect(0, 0, w, h);
        // Very faint cloud bands (Uranus is mostly featureless)
        ctx.fillStyle = '#b2f5e9'; ctx.globalAlpha = 0.08;
        for (let i = 0; i < 6; i++) { ctx.fillRect(0, (h/6)*i, w, h/12); }
        // Faint polar brightening
        const upGrad = ctx.createRadialGradient(w/2, 0, 0, w/2, 0, h*0.4);
        upGrad.addColorStop(0, 'rgba(255,255,255,0.2)'); upGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = upGrad; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(w/2, 0, h*0.4, 0, Math.PI*2); ctx.fill();
        break;
      }

      // ── NEPTUNE — deep cobalt blue, Great Dark Spot, bright cloud streaks ─
      case 'neptune': {
        const nGrad = ctx.createLinearGradient(0, 0, 0, h);
        nGrad.addColorStop(0, '#1a237e'); nGrad.addColorStop(0.5, '#283593');
        nGrad.addColorStop(1, '#0d47a1');
        ctx.fillStyle = nGrad; ctx.globalAlpha = 1; ctx.fillRect(0, 0, w, h);
        // Great Dark Spot (like Jupiter's GRS but darker)
        ctx.globalAlpha = 0.7;
        const gds = ctx.createRadialGradient(w*0.42, h*0.44, 5, w*0.42, h*0.44, 70);
        gds.addColorStop(0, '#0a0a3a'); gds.addColorStop(0.7, '#1a1a6e'); gds.addColorStop(1, 'transparent');
        ctx.fillStyle = gds;
        ctx.beginPath(); ctx.ellipse(w*0.42, h*0.44, 80, 50, -0.15, 0, Math.PI*2); ctx.fill();
        // Bright white cirrus cloud streaks
        ctx.fillStyle = '#e3f2fd'; ctx.globalAlpha = 0.55;
        for (let i = 0; i < 8; i++) {
          const y = h*(0.2 + i*0.08);
          ctx.beginPath(); ctx.ellipse(w*(0.3+rng(i*7)*0.4), y, 80+rng(i*3)*60, 6, 0.1, 0, Math.PI*2); ctx.fill();
        }
        break;
      }

      // ── PLUTO — pale tan/rust patchwork, heart-shaped nitrogen plains ─────
      case 'pluto': {
        // Tombaugh Regio (the heart)
        ctx.fillStyle = '#f5e6d0'; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.ellipse(w*0.55, h*0.52, 130, 90, 0.3, 0, Math.PI*2); ctx.fill();
        // Dark reddish terrain (Cthulhu Macula)
        ctx.fillStyle = '#5c3317'; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.ellipse(w*0.25, h*0.55, 150, 55, 0.1, 0, Math.PI*2); ctx.fill();
        // Cratered highlands
        for (let i = 0; i < 30; i++) {
          const cx = rng(i*11)*w; const cy = rng(i*17)*h;
          const r  = 4 + rng(i*7)*12;
          ctx.fillStyle = '#8b7355'; ctx.globalAlpha = 0.3;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
        }
        break;
      }

      // ── MOON — grey with dark maria seas, craters, brighter highlands ─────
      case 'moon': {
        // Dark mare basins (Sea of Tranquility, Sea of Crisis, etc.)
        ctx.fillStyle = '#2a2a3a'; ctx.globalAlpha = 0.55;
        const marea = [{x:0.28,y:0.45,rx:130,ry:90},{x:0.55,y:0.38,rx:110,ry:75},
                       {x:0.72,y:0.58,rx:85,ry:60},{x:0.15,y:0.62,rx:70,ry:50}];
        marea.forEach(m => {
          ctx.beginPath(); ctx.ellipse(w*m.x, h*m.y, m.rx, m.ry, rng(m.x)*0.4, 0, Math.PI*2); ctx.fill();
        });
        // Craters
        for (let i = 0; i < 60; i++) {
          const cx = rng(i*11)*w; const cy = rng(i*17)*h;
          const r  = 3 + rng(i*7)*16;
          ctx.fillStyle = '#1a1a2e'; ctx.globalAlpha = 0.45;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#d4d4d4'; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.4; ctx.stroke();
        }
        // Bright ray system (like Tycho)
        ctx.strokeStyle = '#e8e8e8'; ctx.globalAlpha = 0.2; ctx.lineWidth = 1;
        for (let a = 0; a < Math.PI*2; a += Math.PI/8) {
          ctx.beginPath(); ctx.moveTo(w*0.7, h*0.7);
          ctx.lineTo(w*0.7 + Math.cos(a)*200, h*0.7 + Math.sin(a)*200); ctx.stroke();
        }
        break;
      }

      // ── IO — yellow sulphur world, red/black calderas ─────────────────────
      case 'io': {
        // Sulphur dioxide frost patches
        ctx.fillStyle = '#fef08a'; ctx.globalAlpha = 0.4;
        for (let i = 0; i < 18; i++) {
          ctx.beginPath(); ctx.ellipse(rng(i*7)*w, rng(i*13)*h, 30+rng(i*3)*50, 20+rng(i*5)*30, rng(i), 0, Math.PI*2); ctx.fill();
        }
        // Red sulphur volcanic rings (Pele, Loki)
        ctx.fillStyle = '#dc2626'; ctx.globalAlpha = 0.65;
        for (let i = 0; i < 14; i++) {
          const cx = rng(i*11)*w; const cy = rng(i*17)*h;
          const r = 15 + rng(i*7)*28;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
        }
        // Black caldera vents
        ctx.fillStyle = '#111827'; ctx.globalAlpha = 0.9;
        for (let i = 0; i < 40; i++) {
          ctx.beginPath(); ctx.arc(rng(i*3)*w, rng(i*5)*h, 3+rng(i*7)*8, 0, Math.PI*2); ctx.fill();
        }
        break;
      }

      // ── EUROPA — icy white, criss-cross reddish lineae ───────────────────
      case 'europa': {
        // Bright ice base
        ctx.fillStyle = '#e8f4f8'; ctx.globalAlpha = 0.6; ctx.fillRect(0, 0, w, h);
        // Reddish-brown tectonic cracks (lineae)
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 28; i++) {
          ctx.beginPath();
          ctx.moveTo(rng(i*7)*w, rng(i*3)*h);
          ctx.bezierCurveTo(rng(i*11)*w, rng(i*13)*h, rng(i*17)*w, rng(i*19)*h, rng(i*23)*w, rng(i*29)*h);
          ctx.lineWidth = 1.5 + rng(i*5)*3.5;
          ctx.strokeStyle = rng(i) > 0.4 ? '#8b3a0f' : '#c05020';
          ctx.stroke();
        }
        // Chaotic terrain patches
        ctx.fillStyle = '#c8a87a'; ctx.globalAlpha = 0.2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath(); ctx.ellipse(rng(i*7)*w, rng(i*11)*h, 40+rng(i)*50, 30+rng(i*3)*30, rng(i*5), 0, Math.PI*2); ctx.fill();
        }
        break;
      }

      // ── GANYMEDE — dark polygons + bright grooved terrain ────────────────
      case 'ganymede': {
        // Ancient dark cratered terrain (Regio)
        ctx.fillStyle = '#2c3e50'; ctx.globalAlpha = 0.55;
        for (let i = 0; i < 16; i++) {
          ctx.fillRect(rng(i*7)*w*0.9, rng(i*11)*h*0.9, 80+rng(i*3)*50, 60+rng(i*5)*40);
        }
        // Bright grooved terrain (Sulci)
        ctx.strokeStyle = '#bdc3c7'; ctx.globalAlpha = 0.38; ctx.lineWidth = 2.5;
        for (let y = 15; y < h; y += 18) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + rng(y)*14-7); ctx.stroke();
        }
        // Craters
        for (let i = 0; i < 25; i++) {
          const cx = rng(i*13)*w; const cy = rng(i*17)*h;
          ctx.fillStyle = '#1a252f'; ctx.globalAlpha = 0.4;
          ctx.beginPath(); ctx.arc(cx, cy, 4+rng(i*7)*10, 0, Math.PI*2); ctx.fill();
        }
        break;
      }

      // ── CALLISTO — most heavily cratered body in the solar system ────────
      case 'callisto': {
        ctx.fillStyle = '#1c2833'; ctx.globalAlpha = 0.7; ctx.fillRect(0, 0, w, h);
        // Saturated craters everywhere
        for (let i = 0; i < 90; i++) {
          const cx = rng(i*7)*w; const cy = rng(i*11)*h;
          const r  = 3 + rng(i*3)*18;
          ctx.fillStyle = '#17202a'; ctx.globalAlpha = 0.55;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#aab7c4'; ctx.lineWidth = 1; ctx.globalAlpha = 0.35; ctx.stroke();
        }
        // Valhalla multi-ring impact basin
        ctx.globalAlpha = 0.3;
        for (let r = 30; r < 200; r += 30) {
          ctx.strokeStyle = '#d5d8dc'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(w*0.6, h*0.38, r, 0, Math.PI*2); ctx.stroke();
        }
        break;
      }

      // ── TITAN — orange nitrogen-methane haze, dark dunes, polar lakes ─────
      case 'titan': {
        // Dense orange haze overlay
        ctx.fillStyle = '#e67e00'; ctx.globalAlpha = 0.4; ctx.fillRect(0, 0, w, h);
        // Dark equatorial sand seas
        ctx.fillStyle = '#5d3a1a'; ctx.globalAlpha = 0.5;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath(); ctx.ellipse(w*(0.1+i*0.16), h*0.52, 100, 38, 0.05, 0, Math.PI*2); ctx.fill();
        }
        // North polar liquid hydrocarbon lakes (dark)
        ctx.fillStyle = '#0d0d0d'; ctx.globalAlpha = 0.65;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath(); ctx.ellipse(rng(i*7)*w*0.6+w*0.1, rng(i*11)*h*0.28+h*0.05, 35+rng(i*3)*40, 18+rng(i*5)*20, rng(i), 0, Math.PI*2); ctx.fill();
        }
        break;
      }

      // ── ENCELADUS — brilliant white ice, blue south-polar tiger stripes ───
      case 'enceladus': {
        ctx.fillStyle = '#f0f8ff'; ctx.globalAlpha = 0.5; ctx.fillRect(0, 0, w, h);
        // South polar tiger stripe fractures
        ctx.strokeStyle = '#0077b6'; ctx.globalAlpha = 0.75; ctx.lineWidth = 4;
        for (let i = 0; i < 5; i++) {
          const sx = w*(0.32 + i*0.07);
          ctx.beginPath(); ctx.moveTo(sx, h*0.72); ctx.lineTo(sx+25, h*0.96); ctx.stroke();
        }
        // Cryovolcanic plume glow at south pole
        const pGrad = ctx.createRadialGradient(w*0.5, h, 5, w*0.5, h, 120);
        pGrad.addColorStop(0, 'rgba(100,200,255,0.5)'); pGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = pGrad; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(w*0.5, h, 120, 0, Math.PI*2); ctx.fill();
        break;
      }

      // ── GENERIC EXOPLANET — type-based visuals ────────────────────────────
      default: {
        const id = planet.id || '';
        // Hot Jupiters (WASP-76b, 55 Cnc e) — lava/iron rain, deep red-orange
        if (id.includes('wasp') || id.includes('55_cnc') || id.includes('55cnc')) {
          ctx.fillStyle = '#7f1d1d'; ctx.globalAlpha = 0.6; ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 40; i++) {
            const cx = rng(i*7)*w; const cy = rng(i*11)*h;
            ctx.fillStyle = '#f97316'; ctx.globalAlpha = 0.3+rng(i*3)*0.4;
            ctx.beginPath(); ctx.arc(cx, cy, 8+rng(i*5)*25, 0, Math.PI*2); ctx.fill();
          }
        }
        // Ocean/habitable exoplanets (TRAPPIST, Proxima, Kepler)
        else if (id.includes('trappist') || id.includes('proxima') || id.includes('kepler')) {
          ctx.fillStyle = '#1e3a5f'; ctx.globalAlpha = 0.6; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#2e7d32'; ctx.globalAlpha = 0.45;
          for (let i = 0; i < 10; i++) {
            ctx.beginPath(); ctx.ellipse(rng(i*7)*w, 80+rng(i*11)*(h-160), 70+rng(i*3)*60, 35+rng(i*5)*35, rng(i), 0, Math.PI*2); ctx.fill();
          }
          ctx.fillStyle = '#b3e5fc'; ctx.globalAlpha = 0.25;
          for (let i = 0; i < 5; i++) {
            ctx.beginPath(); ctx.ellipse(rng(i*13)*w, rng(i*17)*h, 80+rng(i)*50, 12, rng(i*3)*0.5, 0, Math.PI*2); ctx.fill();
          }
        }
        // Default exotic alien world — swirling gas with planet's unique color
        else {
          for (let i = 0; i < 20; i++) {
            const y = (h/20)*i;
            ctx.fillStyle = i%2===0 ? primary : secondary;
            ctx.globalAlpha = 0.3 + rng(i*7)*0.25;
            ctx.fillRect(0, y, w, h/20 * (0.8+rng(i*3)*0.4));
          }
          // Alien storm oval
          ctx.globalAlpha = 0.6;
          const stormGrad = ctx.createRadialGradient(w*0.55, h*0.5, 5, w*0.55, h*0.5, 60);
          stormGrad.addColorStop(0, accent || '#ffffff');
          stormGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = stormGrad;
          ctx.beginPath(); ctx.ellipse(w*0.55, h*0.5, 70, 42, 0, 0, Math.PI*2); ctx.fill();
        }
        break;
      }
    }

    ctx.globalAlpha = 1.0;
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextureManager;
}
