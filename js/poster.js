/**
 * poster.js - Stage 02 Live Poster Preview Canvas Renderer
 * ---------------------------------------------------------
 * Educational Pair-Programming Project: "Planet Name Poster"
 * 
 * Responsibilities:
 * 1. Draws the selected planet's day or night sky using SkiesManager.
 * 2. Applies each planet's custom open-source font to the user's name.
 * 3. Text Fitting & Shrink-to-Fit: Long names automatically scale down to prevent clipping.
 * 4. Illumination Modes:
 *    - Day: Bright, vibrant planetary gradient with crisp rim light.
 *    - Night: Moody nocturnal tint with a soft atmospheric outer glow.
 * 5. Accurate scientific badges: Stamped with "Artist's Impression" or "Photographic".
 */

const PosterRenderer = (() => {
  let canvas = null;
  let ctx = null;

  // Base internal resolution (4:5 portrait poster standard)
  const POSTER_WIDTH = 800;
  const POSTER_HEIGHT = 1000;

  // Planetary letter gradient color palettes
  const TEXT_PALETTES = {
    sun: {
      day: { stops: ['#ffffff', '#fef08a', '#f59e0b', '#d97706'], rim: 'rgba(254, 240, 138, 0.9)', glow: 'rgba(245, 158, 11, 0.8)' },
      night: { stops: ['#fed7aa', '#ea580c', '#9a3412', '#451a03'], rim: 'rgba(251, 146, 60, 0.6)', glow: 'rgba(234, 88, 12, 0.5)' }
    },
    mercury: {
      day: { stops: ['#ffffff', '#e2e8f0', '#94a3b8', '#64748b'], rim: 'rgba(255, 255, 255, 0.85)', glow: 'rgba(203, 213, 225, 0.6)' },
      night: { stops: ['#cbd5e1', '#64748b', '#475569', '#1e293b'], rim: 'rgba(148, 163, 184, 0.5)', glow: 'rgba(100, 116, 139, 0.45)' }
    },
    venus: {
      day: { stops: ['#ffffff', '#fef08a', '#eab308', '#ca8a04'], rim: 'rgba(254, 240, 138, 0.9)', glow: 'rgba(234, 179, 8, 0.7)' },
      night: { stops: ['#fde047', '#d97706', '#92400e', '#451a03'], rim: 'rgba(217, 119, 6, 0.6)', glow: 'rgba(180, 83, 9, 0.5)' }
    },
    earth: {
      day: { stops: ['#ffffff', '#7dd3fc', '#0284c7', '#0369a1'], rim: 'rgba(125, 211, 252, 0.9)', glow: 'rgba(56, 189, 248, 0.75)' },
      night: { stops: ['#bae6fd', '#38bdf8', '#0369a1', '#082f49'], rim: 'rgba(56, 189, 248, 0.6)', glow: 'rgba(14, 165, 233, 0.55)' }
    },
    moon: {
      day: { stops: ['#ffffff', '#f1f5f9', '#cbd5e1', '#94a3b8'], rim: 'rgba(255, 255, 255, 0.9)', glow: 'rgba(226, 232, 240, 0.7)' },
      night: { stops: ['#e2e8f0', '#94a3b8', '#64748b', '#334155'], rim: 'rgba(148, 163, 184, 0.5)', glow: 'rgba(100, 116, 139, 0.4)' }
    },
    mars: {
      day: { stops: ['#ffffff', '#fed7aa', '#f97316', '#c2410c'], rim: 'rgba(254, 215, 170, 0.9)', glow: 'rgba(249, 115, 22, 0.75)' },
      night: { stops: ['#fdba74', '#ea580c', '#9a3412', '#431407'], rim: 'rgba(234, 88, 12, 0.6)', glow: 'rgba(194, 65, 12, 0.5)' }
    },
    jupiter: {
      day: { stops: ['#ffffff', '#fed7aa', '#fb923c', '#c2410c'], rim: 'rgba(254, 215, 170, 0.9)', glow: 'rgba(251, 146, 60, 0.7)' },
      night: { stops: ['#fed7aa', '#ea580c', '#9a3412', '#451a03'], rim: 'rgba(234, 88, 12, 0.6)', glow: 'rgba(154, 52, 18, 0.5)' }
    },
    saturn: {
      day: { stops: ['#ffffff', '#fef08a', '#eab308', '#a16207'], rim: 'rgba(254, 240, 138, 0.9)', glow: 'rgba(202, 138, 4, 0.65)' },
      night: { stops: ['#fef08a', '#ca8a04', '#854d0e', '#422006'], rim: 'rgba(202, 138, 4, 0.6)', glow: 'rgba(161, 98, 7, 0.45)' }
    },
    uranus: {
      day: { stops: ['#ffffff', '#ccfbf1', '#2dd4bf', '#0f766e'], rim: 'rgba(204, 251, 241, 0.9)', glow: 'rgba(45, 212, 191, 0.75)' },
      night: { stops: ['#99f6e4', '#14b8a6', '#0f766e', '#042f2e'], rim: 'rgba(20, 184, 166, 0.6)', glow: 'rgba(13, 148, 136, 0.5)' }
    },
    neptune: {
      day: { stops: ['#ffffff', '#bfdbfe', '#3b82f6', '#1d4ed8'], rim: 'rgba(191, 219, 254, 0.9)', glow: 'rgba(59, 130, 246, 0.75)' },
      night: { stops: ['#93c5fd', '#2563eb', '#1e40af', '#0f172a'], rim: 'rgba(37, 99, 235, 0.6)', glow: 'rgba(30, 64, 175, 0.5)' }
    },
    pluto: {
      day: { stops: ['#ffffff', '#ffedd5', '#fed7aa', '#9a6042'], rim: 'rgba(255, 237, 213, 0.9)', glow: 'rgba(243, 232, 210, 0.65)' },
      night: { stops: ['#fed7aa', '#c2410c', '#7c2d12', '#1e293b'], rim: 'rgba(194, 65, 12, 0.55)', glow: 'rgba(124, 45, 18, 0.4)' }
    }
  };

  let animId = null;
  let currentState = null;
  let isPaused = false;
  let prefersReducedMotion = false;

  /**
   * Initializes the poster canvas with capped high-DPI crispness.
   * @param {HTMLCanvasElement} canvasElement
   */
  function init(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');

    // Cap DPR: 1.5 on mobile (< 768px), 2.0 on desktop.
    // Cuts fill-rate by up to 75% on 3x/4x mobile screens to prevent GPU bottlenecking.
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    canvas.width = Math.floor(POSTER_WIDTH * dpr);
    canvas.height = Math.floor(POSTER_HEIGHT * dpr);
    ctx.scale(dpr, dpr);

    // Reduced motion preference listener
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        stopLoop();
        if (currentState) renderFrame(0);
      } else {
        if (currentState && !isPaused) startLoop();
      }
    });

    // Page Visibility API: Pause everything when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPaused = true;
        stopLoop();
      } else {
        isPaused = false;
        if (currentState && !prefersReducedMotion && (!currentState.view || currentState.view === 'studio')) {
          startLoop();
        }
      }
    });
  }

  /**
   * Starts the poster animation loop for live subtle sky motion.
   */
  function startLoop() {
    stopLoop();
    if (prefersReducedMotion || isPaused) return;

    function loop(time) {
      if (isPaused || prefersReducedMotion) return;
      if (currentState && currentState.view === 'studio') {
        renderFrame(time);
      }
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
  }

  /**
   * Stops the poster animation loop.
   */
  function stopLoop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  /**
   * Calculates maximum font size that fits comfortably within max width.
   */
  function fitText(targetCtx, text, fontName, maxWidth, startSize, minSize = 36) {
    let size = startSize;
    targetCtx.font = `700 ${size}px ${fontName}`;
    while (targetCtx.measureText(text).width > maxWidth && size > minSize) {
      size -= 2;
      targetCtx.font = `700 ${size}px ${fontName}`;
    }
    return size;
  }

  /**
   * Multi-format export resolutions with layout and safeZone values
   */
  const EXPORT_SIZES = {
    // Social
    portrait: {
      width: 1080, height: 1350,
      previewWidth: 800, previewHeight: 1000,
      safeZone: 54, group: 'Social',
      label: 'Portrait (1080 × 1350) • 4:5 Poster',
      aspectRatio: '4 / 5',
      aspectClass: 'aspect-portrait'
    },
    square: {
      width: 1080, height: 1080,
      previewWidth: 900, previewHeight: 900,
      safeZone: 48, group: 'Social',
      label: 'Square (1080 × 1080) • 1:1 Social',
      aspectRatio: '1 / 1',
      aspectClass: 'aspect-square'
    },
    story: {
      width: 1080, height: 1920,
      previewWidth: 720, previewHeight: 1280,
      safeZone: 64, group: 'Social',
      label: 'Phone Story (1080 × 1920) • 9:16 Mobile',
      aspectRatio: '9 / 16',
      aspectClass: 'aspect-story'
    },
    x_post: {
      width: 1600, height: 900,
      previewWidth: 1280, previewHeight: 720,
      safeZone: 56, group: 'Social',
      label: 'X Post (1600 × 900) • 16:9 Banner',
      aspectRatio: '16 / 9',
      aspectClass: 'aspect-landscape'
    },
    link_preview: {
      width: 1200, height: 630,
      previewWidth: 1200, previewHeight: 630,
      safeZone: 46, group: 'Social',
      label: 'Link Preview (1200 × 630) • 1.91:1 Card',
      aspectRatio: '1200 / 630',
      aspectClass: 'aspect-link-preview'
    },
    pinterest: {
      width: 1000, height: 1500,
      previewWidth: 720, previewHeight: 1080,
      safeZone: 56, group: 'Social',
      label: 'Pinterest (1000 × 1500) • 2:3 Pin',
      aspectRatio: '2 / 3',
      aspectClass: 'aspect-pinterest'
    },

    // Wallpapers
    landscape: {
      width: 1920, height: 1080,
      previewWidth: 1280, previewHeight: 720,
      safeZone: 58, group: 'Wallpapers',
      label: 'PC Wallpaper (1920 × 1080) • 16:9 Desktop',
      aspectRatio: '16 / 9',
      aspectClass: 'aspect-landscape'
    },
    desktop_4k: {
      width: 3840, height: 2160,
      previewWidth: 1280, previewHeight: 720,
      safeZone: 110, group: 'Wallpapers',
      label: '4K Desktop (3840 × 2160) • Ultra HD',
      aspectRatio: '16 / 9',
      aspectClass: 'aspect-landscape',
      fallbackFormat: 'landscape'
    },
    ultrawide: {
      width: 2560, height: 1080,
      previewWidth: 1280, previewHeight: 540,
      safeZone: 68, group: 'Wallpapers',
      label: 'Ultrawide (2560 × 1080) • 21:9 Monitor',
      aspectRatio: '2560 / 1080',
      aspectClass: 'aspect-ultrawide'
    },
    tablet: {
      width: 2048, height: 1536,
      previewWidth: 1024, previewHeight: 768,
      safeZone: 70, group: 'Wallpapers',
      label: 'Tablet (2048 × 1536) • 4:3 iPad/Tablet',
      aspectRatio: '4 / 3',
      aspectClass: 'aspect-tablet'
    },
    phone_wallpaper: {
      width: 1170, height: 2532,
      previewWidth: 600, previewHeight: 1300,
      safeZone: 76, group: 'Wallpapers',
      label: 'Phone Wallpaper (1170 × 2532) • Lock Screen',
      aspectRatio: '1170 / 2532',
      aspectClass: 'aspect-phone-wallpaper'
    },

    // Print
    a4: {
      width: 2480, height: 3508,
      previewWidth: 800, previewHeight: 1132,
      safeZone: 120, group: 'Print',
      label: 'A4 Print (2480 × 3508) • 300 DPI Document',
      aspectRatio: '2480 / 3508',
      aspectClass: 'aspect-a4',
      fallbackFormat: 'portrait'
    },

    // Other
    custom: {
      width: 1200, height: 1200,
      previewWidth: 800, previewHeight: 800,
      safeZone: 50, group: 'Other',
      label: 'Custom Size (User Defined Dimensions)',
      aspectRatio: '1 / 1',
      aspectClass: 'aspect-custom',
      isCustom: true
    }
  };

  /**
   * Retrieves active format configuration, dynamically supporting custom dimensions.
   */
  function getFormatConfig(formatKey, state = null) {
    if (formatKey === 'custom' && state) {
      const customW = Math.min(4096, Math.max(320, parseInt(state.customWidth, 10) || 1200));
      const customH = Math.min(4096, Math.max(320, parseInt(state.customHeight, 10) || 1200));
      const maxPreview = 1200;
      const previewScale = Math.min(1, maxPreview / Math.max(customW, customH));
      return {
        width: customW,
        height: customH,
        previewWidth: Math.round(customW * previewScale),
        previewHeight: Math.round(customH * previewScale),
        safeZone: Math.round(Math.min(customW, customH) * 0.05),
        group: 'Other',
        label: `Custom (${customW} × ${customH})`,
        aspectRatio: `${customW} / ${customH}`,
        aspectClass: 'aspect-custom',
        isCustom: true
      };
    }
    return EXPORT_SIZES[formatKey] || EXPORT_SIZES.portrait;
  }

  /**
   * Core parametric poster renderer drawing onto any canvas context and resolution.
   */
  function drawPoster(targetCtx, w, h, state, time = 0, reducedMotion = false) {
    if (!targetCtx || !state) return;

    const formatKey = state.size || 'portrait';
    const cfg = getFormatConfig(formatKey, state);

    const worldId = state.worldId || 'earth';
    const mode = state.mode || 'day';
    const name = (state.name || 'COSMOS').toUpperCase();

    const skyConfig = SkiesManager.getSkyConfig(worldId);
    const activeSky = mode === 'night' ? skyConfig.night : skyConfig.day;
    const fontName = skyConfig.font || '"Cinzel", serif';

    const scaleX = w / POSTER_WIDTH;
    const scaleY = h / POSTER_HEIGHT;
    const scaleFont = Math.min(scaleX, scaleY);
    const safeZone = cfg.safeZone ? (cfg.safeZone * (w / (cfg.width || POSTER_WIDTH))) : (38 * scaleFont);

    targetCtx.clearRect(0, 0, w, h);

    // 1. Draw scientifically grounded Day/Night Sky backdrop with subtle live atmospheric motion
    SkiesManager.drawPlanetSky(targetCtx, worldId, mode, w, h, time, reducedMotion);

    // 2. Poster Inner Matting / Frame (Soft vignette border)
    targetCtx.save();
    const borderVignette = targetCtx.createLinearGradient(0, 0, 0, h);
    borderVignette.addColorStop(0, 'rgba(5, 7, 14, 0.65)');
    borderVignette.addColorStop(0.2, 'rgba(5, 7, 14, 0.1)');
    borderVignette.addColorStop(0.8, 'rgba(5, 7, 14, 0.15)');
    borderVignette.addColorStop(1, 'rgba(5, 7, 14, 0.75)');
    targetCtx.fillStyle = borderVignette;
    targetCtx.fillRect(0, 0, w, h);

    // Poster delicate outer border line positioned within safeZone
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    targetCtx.lineWidth = Math.max(1, Math.round(1 * scaleFont));
    const marginX = Math.max(12, safeZone * 0.55);
    const marginY = Math.max(12, safeZone * 0.55);
    targetCtx.strokeRect(marginX, marginY, w - marginX * 2, h - marginY * 2);
    targetCtx.restore();

    const isLandscape = w > h;

    // 3. Header Section (World Name & Mode)
    targetCtx.save();
    targetCtx.textAlign = 'center';
    targetCtx.fillStyle = '#ffffff';

    // Sub-eyebrow
    targetCtx.font = `600 ${Math.round(11 * scaleFont)}px "Space Grotesk", sans-serif`;
    targetCtx.letterSpacing = '0.22em';
    targetCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    let eyebrowText = isLandscape ? 'SOLAR SYSTEM PC WALLPAPER' : 'SOLAR SYSTEM NAME POSTER';
    if (formatKey === 'desktop_4k') eyebrowText = 'SOLAR SYSTEM 4K DESKTOP WALLPAPER';
    if (formatKey === 'ultrawide') eyebrowText = 'SOLAR SYSTEM ULTRAWIDE WALLPAPER (21:9)';
    if (formatKey === 'phone_wallpaper' || formatKey === 'story') eyebrowText = 'SOLAR SYSTEM PHONE WALLPAPER';
    if (formatKey === 'a4') eyebrowText = 'SOLAR SYSTEM FINE ART PRINT (300 DPI)';
    const eyebrowY = isLandscape ? Math.max(32, safeZone * 0.95) : Math.max(48, safeZone * 1.3);
    targetCtx.fillText(eyebrowText, w / 2, eyebrowY);

    // Main world title in spaced capitals
    targetCtx.font = `700 ${Math.round((isLandscape ? 22 : 24) * scaleFont)}px "Space Grotesk", sans-serif`;
    targetCtx.letterSpacing = '0.24em';
    targetCtx.fillStyle = '#ffffff';
    targetCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    targetCtx.shadowBlur = 10 * scaleFont;
    const worldTitle = `${skyConfig.name.toUpperCase()}  •  ${mode.toUpperCase()} VIEW`;
    const worldTitleY = eyebrowY + (isLandscape ? 28 * scaleFont : 36 * scaleFont);
    targetCtx.fillText(worldTitle, w / 2, worldTitleY);

    // Subtle header divider
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    targetCtx.beginPath();
    const dividerWidth = isLandscape ? 120 * scaleX : 80 * scaleX;
    const dividerTopY = worldTitleY + 16 * scaleFont;
    targetCtx.moveTo(w / 2 - dividerWidth, dividerTopY);
    targetCtx.lineTo(w / 2 + dividerWidth, dividerTopY);
    targetCtx.stroke();
    targetCtx.restore();

    // 4. Center Name Typography (Planet-Specific Font & Texture Shading)
    targetCtx.save();
    const maxTextWidth = w - safeZone * 2.4;
    const startFontSize = Math.round((isLandscape ? 116 : 108) * scaleFont);
    const minFontSize = Math.round(20 * scaleFont);
    const fontSize = fitText(targetCtx, name, fontName, maxTextWidth, startFontSize, minFontSize);

    targetCtx.font = `700 ${fontSize}px ${fontName}`;
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';

    const textY = isLandscape ? h * 0.46 : h * 0.48;

    // Atmospheric Glow under text (especially pronounced at night)
    const palette = (TEXT_PALETTES[worldId] && TEXT_PALETTES[worldId][mode]) || TEXT_PALETTES.earth[mode];

    targetCtx.shadowColor = palette.glow;
    targetCtx.shadowBlur = (mode === 'night' ? 32 : 18) * scaleFont;

    // Multi-stop linear gradient text fill
    const textGrad = targetCtx.createLinearGradient(
      0, textY - fontSize * 0.5,
      0, textY + fontSize * 0.5
    );
    palette.stops.forEach((color, idx) => {
      textGrad.addColorStop(idx / (palette.stops.length - 1), color);
    });

    targetCtx.fillStyle = textGrad;
    targetCtx.fillText(name, w / 2, textY);

    // Delicate rim stroke for Day mode crispness
    targetCtx.shadowBlur = 0;
    targetCtx.lineWidth = (mode === 'day' ? 1.5 : 1.0) * scaleFont;
    targetCtx.strokeStyle = palette.rim;
    targetCtx.strokeText(name, w / 2, textY);
    targetCtx.restore();

    // 5. Scientific Telemetry & Divider (Bottom Card Section)
    targetCtx.save();
    const dividerY = isLandscape ? h * 0.72 : h * 0.68;
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    targetCtx.lineWidth = Math.max(1, Math.round(1 * scaleFont));
    targetCtx.beginPath();
    const bottomDivMargin = isLandscape ? 120 * scaleX : 70 * scaleX;
    targetCtx.moveTo(bottomDivMargin, dividerY);
    targetCtx.lineTo(w - bottomDivMargin, dividerY);
    targetCtx.stroke();

    // Sky Status Badge in Poster
    targetCtx.font = `600 ${Math.round(11 * scaleFont)}px "Space Grotesk", sans-serif`;
    targetCtx.letterSpacing = '0.08em';
    targetCtx.textAlign = 'center';
    targetCtx.fillStyle = activeSky.type === 'photographic' ? '#38bdf8' : '#fbbf24';
    targetCtx.fillText(activeSky.badge.toUpperCase(), w / 2, dividerY + (isLandscape ? 28 : 32) * scaleY);

    // Scientific Notes Text (Word-wrapped to prevent any clipping)
    targetCtx.font = `400 ${Math.round(13 * scaleFont)}px "Inter", sans-serif`;
    targetCtx.letterSpacing = '0.01em';
    targetCtx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    targetCtx.textAlign = 'center';

    const words = activeSky.notes.split(' ');
    let currentLine = '';
    let currentY = dividerY + (isLandscape ? 50 : 58) * scaleY;
    const maxNoteWidth = isLandscape ? w - 200 * scaleX : w - 160 * scaleX;
    const lineHeight = Math.round((isLandscape ? 17 : 19) * scaleFont);

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine ? currentLine + ' ' + words[n] : words[n];
      if (targetCtx.measureText(testLine).width > maxNoteWidth && n > 0) {
        targetCtx.fillText(currentLine, w / 2, currentY);
        currentLine = words[n];
        currentY += lineHeight;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      targetCtx.fillText(currentLine, w / 2, currentY);
    }

    // Bottom Credit Line
    targetCtx.font = `500 ${Math.round(10 * scaleFont)}px "Inter", sans-serif`;
    targetCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    targetCtx.letterSpacing = '0.05em';
    const creditText = `DATA & IMAGERY VERIFIED FROM NASA GODDARD PLANETARY FACT SHEETS • ${w} × ${h}`;
    targetCtx.fillText(creditText, w / 2, h - Math.max(22, safeZone * 0.7));
    targetCtx.restore();
  }

  /**
   * Internal render frame function taking high-res timestamp for live preview.
   * Guarantees preview perfectly matches download aspect ratio and safeZone framing.
   */
  function renderFrame(time = 0) {
    if (!canvas || !ctx || !currentState) return;
    const format = currentState.size || 'portrait';
    const cfg = getFormatConfig(format, currentState);

    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    const targetW = Math.floor(cfg.previewWidth * dpr);
    const targetH = Math.floor(cfg.previewHeight * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    drawPoster(ctx, cfg.previewWidth, cfg.previewHeight, currentState, time, prefersReducedMotion);
  }

  /**
   * Generates a high-resolution export in chosen format (PNG, JPG, WebP) with quality controls.
   * Gracefully catches canvas allocation limits on weaker devices and falls back with a clear message.
   *
   * @param {string} format - Preset key or 'custom'
   * @param {Object} [customState] - Optional state override { fileType: 'png'|'jpg'|'webp', quality: 0.92, ... }
   * @returns {boolean} Success status
   */
  function downloadPoster(format = 'portrait', customState = null) {
    const activeState = customState || currentState;
    if (!activeState) return false;

    const fileType = (activeState.fileType || 'png').toLowerCase();
    const mimeMap = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp'
    };
    const mimeType = mimeMap[fileType] || 'image/png';
    const rawQuality = parseFloat(activeState.quality);
    const quality = !isNaN(rawQuality) ? Math.min(1.0, Math.max(0.1, rawQuality)) : 0.92;

    const cfg = getFormatConfig(format, activeState);
    let targetW = cfg.width;
    let targetH = cfg.height;

    let offCanvas = null;
    let offCtx = null;
    let memoryFallback = false;

    // Device canvas memory limit safety guard
    try {
      offCanvas = document.createElement('canvas');
      offCanvas.width = targetW;
      offCanvas.height = targetH;
      offCtx = offCanvas.getContext('2d');
      if (!offCtx) throw new Error('2D Context failed');
    } catch (err) {
      console.warn('Canvas allocation exceeded device memory, falling back:', err);
      memoryFallback = true;
      if (cfg.fallbackFormat && EXPORT_SIZES[cfg.fallbackFormat]) {
        const fb = EXPORT_SIZES[cfg.fallbackFormat];
        targetW = fb.width;
        targetH = fb.height;
      } else {
        targetW = Math.round(targetW * 0.5);
        targetH = Math.round(targetH * 0.5);
      }
      offCanvas = document.createElement('canvas');
      offCanvas.width = targetW;
      offCanvas.height = targetH;
      offCtx = offCanvas.getContext('2d');
    }

    try {
      drawPoster(offCtx, targetW, targetH, activeState, 0, true);

      const worldName = (activeState.worldId || 'world').replace(/[^a-zA-Z0-9]/g, '');
      const userName = (activeState.name || 'poster').replace(/[^a-zA-Z0-9]/g, '');
      const ext = fileType === 'jpg' ? 'jpg' : (fileType === 'webp' ? 'webp' : 'png');
      const filename = `PlanetPoster_${worldName}_${userName}_${format}_${targetW}x${targetH}.${ext}`;

      if (memoryFallback && typeof window.showToastNotification === 'function') {
        window.showToastNotification(`⚠️ Memory limit on device: exported at crisp safe resolution (${targetW}×${targetH})`);
      }

      exportCanvasBlob(offCanvas, filename, mimeType, quality);
      return true;
    } catch (e) {
      console.error('Poster export failure:', e);
      if (typeof window.showToastNotification === 'function') {
        window.showToastNotification('⚠️ Canvas export encountered an error. Please try a lower resolution or PNG.');
      }
      return false;
    }
  }

  function exportCanvasBlob(offCanvas, filename, mimeType, quality) {
    try {
      offCanvas.toBlob((blob) => {
        if (!blob) {
          fallbackDownload(offCanvas.toDataURL(mimeType, quality), filename);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1200);
      }, mimeType, quality);
    } catch (blobErr) {
      console.warn('Blob export failed, fallback to dataURL:', blobErr);
      fallbackDownload(offCanvas.toDataURL(mimeType, quality), filename);
    }
  }

  function fallbackDownload(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  /**
   * Generates a Data URL for sharing or preview.
   */
  function getExportDataUrl(format = 'portrait', customState = null) {
    const activeState = customState || currentState;
    if (!activeState) return '';

    const cfg = getFormatConfig(format, activeState);
    const offCanvas = document.createElement('canvas');
    offCanvas.width = cfg.width;
    offCanvas.height = cfg.height;
    const offCtx = offCanvas.getContext('2d');

    drawPoster(offCtx, cfg.width, cfg.height, activeState, 0, true);
    return offCanvas.toDataURL('image/png');
  }

  /**
   * Public interface to update state and trigger live poster rendering.
   *
   * @param {Object} state - { worldId, mode: 'day'|'night', name: string, size: string, fileType: string, quality: number, view: 'studio'|'orbit' }
   */
  function render(state) {
    currentState = { ...state };
    if (prefersReducedMotion) {
      stopLoop();
      renderFrame(0);
    } else {
      if (currentState.view === 'studio') {
        startLoop();
      } else {
        stopLoop();
      }
    }
  }

  function pause() {
    isPaused = true;
    stopLoop();
  }

  function resume() {
    isPaused = false;
    if (currentState && !prefersReducedMotion && currentState.view === 'studio') {
      startLoop();
    }
  }

  return {
    init,
    render,
    pause,
    resume,
    getCanvas: () => canvas,
    downloadPoster,
    getExportDataUrl,
    getFormatConfig,
    EXPORT_SIZES
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PosterRenderer;
}
