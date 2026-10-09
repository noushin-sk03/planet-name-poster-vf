/**
 * canvas.js - HTML5 Canvas 2D Drawing Engine (Stage 04: Multi-Size Export)
 * ------------------------------------------------------------------------
 * Responsibilities:
 * 1. Multi-Size Layout Configuration (`POSTER_CONFIG`):
 *    Supports Portrait (1080x1350), Square (1080x1080), and Phone Story (1080x1920).
 *    Each preset maintains distinct vertical coordinates, margins, and bounds.
 * 2. Adaptive Text Fitting:
 *    Scales user names dynamically to fit bounding boxes across any canvas aspect ratio.
 * 3. Texture-in-Text Compositing:
 *    Retains the robust offscreen alpha-masking ('source-in') and Day/Night lighting ('source-atop').
 * 4. High-Resolution PNG Export:
 *    Matches the canvas resolution and current export size bit-for-bit.
 */

const CanvasRenderer = (() => {

  /**
   * CENTRAL POSTER LAYOUT CONFIGURATION
   * Contains layout presets for Portrait, Square, and Phone Story formats.
   */
  const POSTER_CONFIG = {
    sizes: {
      portrait: {
        id: 'portrait',
        label: 'Portrait (4:5)',
        width: 1080,
        height: 1350,
        aspectRatio: '1080 / 1350',
        outerMargin: 54,
        innerFrameMargin: 64,
        planetHeaderY: 200,
        categoryTagY: 160,
        nameCenterY: 470,
        baseFontSize: 136,
        minFontSize: 42,
        maxTextWidth: 860,
        dividerY: 690,
        dividerWidth: 760,
        factsY: 790,
        factsValueOffsetY: 40,
        colLeftX: 330,
        colRightX: 750,
        phaseTagY: 960,
        creditY: 1230,
        creditMaxWidth: 880
      },
      square: {
        id: 'square',
        label: 'Square (1:1)',
        width: 1080,
        height: 1080,
        aspectRatio: '1080 / 1080',
        outerMargin: 46,
        innerFrameMargin: 56,
        planetHeaderY: 160,
        categoryTagY: 120,
        nameCenterY: 385,
        baseFontSize: 120,
        minFontSize: 38,
        maxTextWidth: 840,
        dividerY: 550,
        dividerWidth: 740,
        factsY: 645,
        factsValueOffsetY: 36,
        colLeftX: 330,
        colRightX: 750,
        phaseTagY: 795,
        creditY: 980,
        creditMaxWidth: 840
      },
      story: {
        id: 'story',
        label: 'Phone Story (9:16)',
        width: 1080,
        height: 1920,
        aspectRatio: '1080 / 1920',
        outerMargin: 64,
        innerFrameMargin: 76,
        planetHeaderY: 320,
        categoryTagY: 260,
        nameCenterY: 720,
        baseFontSize: 144,
        minFontSize: 44,
        maxTextWidth: 860,
        dividerY: 1020,
        dividerWidth: 780,
        factsY: 1160,
        factsValueOffsetY: 42,
        colLeftX: 330,
        colRightX: 750,
        phaseTagY: 1360,
        creditY: 1740,
        creditMaxWidth: 880
      }
    },

    // Style & Aesthetic Tokens (Shared Across All Sizes)
    theme: {
      frameBorderWidth: 1.5,
      frameBorderColor: 'rgba(255, 255, 255, 0.12)',
      innerFrameBorderWidth: 0.75,
      innerFrameColor: 'rgba(255, 255, 255, 0.05)',
      
      fontFamilySerif: '"Cinzel", "Times New Roman", Georgia, serif',
      fontFamilySans: '"Inter", sans-serif',
      
      dayRimStrokeWidth: 1.5,
      dayRimStrokeColor: 'rgba(255, 255, 255, 0.38)',
      daySunlightTop: 'rgba(255, 255, 255, 0.45)',
      daySunlightMid: 'rgba(255, 255, 255, 0.10)',
      
      nightShadowColor: 'rgba(4, 7, 16, 0.65)',
      nightGlowBlur1: 46,
      nightGlowBlur2: 20,
      
      dividerThickness: 1.5,
      dividerColor: 'rgba(255, 255, 255, 0.20)',
      diamondSize: 5
    }
  };

  let mainCanvas = null;
  let mainCtx = null;

  /**
   * Initializes the canvas renderer with the DOM canvas element.
   * @param {HTMLCanvasElement} canvas
   */
  function init(canvas) {
    mainCanvas = canvas;
    mainCtx = canvas.getContext('2d', { alpha: false });
  }

  /**
   * Returns layout configuration for the active size preset.
   * @param {string} sizeKey - 'portrait', 'square', or 'story'
   * @returns {Object}
   */
  function getLayout(sizeKey = 'portrait') {
    return POSTER_CONFIG.sizes[sizeKey] || POSTER_CONFIG.sizes.portrait;
  }

  /**
   * Adaptive typography: shrinks font size proportionally if the name exceeds max allowed width.
   */
  function fitFontSize(ctx, text, maxWidth, initialSize, minSize, fontFamily, fontWeight) {
    let size = initialSize;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    let measuredWidth = ctx.measureText(text).width;

    if (measuredWidth > maxWidth && measuredWidth > 0) {
      const scale = maxWidth / measuredWidth;
      size = Math.max(minSize, Math.floor(initialSize * scale));
    }
    return size;
  }

  /**
   * Draws space background and frame borders for the active size layout.
   */
  function drawBackgroundAndFrame(ctx, planet, layout) {
    const w = layout.width;
    const h = layout.height;
    const t = POSTER_CONFIG.theme;

    // 1. Deep cosmic void gradient
    const bgGrad = ctx.createRadialGradient(w / 2, h * 0.42, 80, w / 2, h / 2, w * 0.85);
    bgGrad.addColorStop(0, '#0e111a');
    bgGrad.addColorStop(0.55, '#06070a');
    bgGrad.addColorStop(1, '#020305');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle planet-tinted atmospheric nebula haze in background
    ctx.save();
    ctx.globalAlpha = 0.09;
    const hazeGrad = ctx.createRadialGradient(w / 2, layout.nameCenterY, 60, w / 2, layout.nameCenterY, w * 0.6);
    hazeGrad.addColorStop(0, (planet.palette && planet.palette.primary) || '#ffffff');
    hazeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // 3. Outer boundary border
    ctx.strokeStyle = t.frameBorderColor;
    ctx.lineWidth = t.frameBorderWidth;
    ctx.strokeRect(layout.outerMargin, layout.outerMargin, w - layout.outerMargin * 2, h - layout.outerMargin * 2);

    // 4. Subtle inner hairline frame
    ctx.strokeStyle = t.innerFrameColor;
    ctx.lineWidth = t.innerFrameBorderWidth;
    ctx.strokeRect(layout.innerFrameMargin, layout.innerFrameMargin, w - layout.innerFrameMargin * 2, h - layout.innerFrameMargin * 2);
  }

  /**
   * Draws top planet header and archive tag.
   */
  function drawPlanetHeader(ctx, planet, layout) {
    const w = layout.width;
    const t = POSTER_CONFIG.theme;

    // Archive category tag
    ctx.save();
    ctx.font = `600 11px ${t.fontFamilySans}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
    ctx.fillText('SOLAR SYSTEM ARCHIVE', w / 2, layout.categoryTagY);
    ctx.restore();

    // Planet name in spaced capitals
    ctx.save();
    ctx.font = `700 20px ${t.fontFamilySans}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '12px';
    ctx.fillText(planet.name.toUpperCase(), w / 2, layout.planetHeaderY);
    ctx.restore();
  }

  /**
   * Draws user's textured name with Porter-Duff compositing and mode shaders.
   */
  function drawTexturedName(ctx, name, texture, planet, mode, layout) {
    const w = layout.width;
    const h = layout.height;
    const t = POSTER_CONFIG.theme;
    const textX = w / 2;
    const textY = layout.nameCenterY;

    const displayText = (name || 'COSMOS').trim().toUpperCase();

    // 1. Calculate adaptive font size
    const fontSize = fitFontSize(
      ctx,
      displayText,
      layout.maxTextWidth,
      layout.baseFontSize,
      layout.minFontSize,
      t.fontFamilySerif,
      '900'
    );
    const fontString = `900 ${fontSize}px ${t.fontFamilySerif}`;

    // 2. Offscreen mask buffer
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const offCtx = offscreen.getContext('2d');

    // 3. Step A: Draw solid text silhouette (the mask)
    offCtx.font = fontString;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillStyle = '#ffffff';
    offCtx.fillText(displayText, textX, textY);

    // 4. Step B: Clip texture into letters using 'source-in'
    offCtx.globalCompositeOperation = 'source-in';

    const metrics = offCtx.measureText(displayText);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.25;
    const drawX = textX - textWidth / 2 - 30;
    const drawY = textY - textHeight / 2 - 15;
    const drawW = textWidth + 60;
    const drawH = textHeight + 30;

    offCtx.drawImage(texture, drawX, drawY, drawW, drawH);

    // 5. Step C: Apply mode lighting inside letters using 'source-atop'
    offCtx.globalCompositeOperation = 'source-atop';

    if (mode === 'day') {
      const sunGrad = offCtx.createLinearGradient(0, drawY, 0, drawY + drawH);
      sunGrad.addColorStop(0.0, t.daySunlightTop);
      sunGrad.addColorStop(0.45, t.daySunlightMid);
      sunGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.0)');
      sunGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.22)');
      offCtx.fillStyle = sunGrad;
      offCtx.fillRect(drawX, drawY, drawW, drawH);
    } else {
      offCtx.fillStyle = t.nightShadowColor;
      offCtx.fillRect(drawX, drawY, drawW, drawH);

      const nightShadow = offCtx.createLinearGradient(0, drawY, 0, drawY + drawH);
      nightShadow.addColorStop(0.0, 'rgba(15, 23, 42, 0.15)');
      nightShadow.addColorStop(1.0, 'rgba(2, 6, 18, 0.70)');
      offCtx.fillStyle = nightShadow;
      offCtx.fillRect(drawX, drawY, drawW, drawH);
    }

    // 6. Step D: Composite onto main canvas with aura / rim lighting
    const glowColor = (planet.palette && planet.palette.glow) || 'rgba(255, 255, 255, 0.4)';

    if (mode === 'night') {
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = t.nightGlowBlur1;
      ctx.drawImage(offscreen, 0, 0);

      ctx.shadowBlur = t.nightGlowBlur2;
      ctx.drawImage(offscreen, 0, 0);
      ctx.restore();

      ctx.drawImage(offscreen, 0, 0);
    } else {
      ctx.save();
      ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
      ctx.shadowBlur = 14;
      ctx.drawImage(offscreen, 0, 0);
      ctx.restore();

      ctx.drawImage(offscreen, 0, 0);

      // Delicate vector outline for crisp rim light
      ctx.save();
      ctx.font = fontString;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = t.dayRimStrokeColor;
      ctx.lineWidth = t.dayRimStrokeWidth;
      ctx.strokeText(displayText, textX, textY);
      ctx.restore();
    }
  }

  /**
   * Draws thin center divider line with diamond ornament.
   */
  function drawDivider(ctx, layout) {
    const w = layout.width;
    const t = POSTER_CONFIG.theme;
    const startX = (w - layout.dividerWidth) / 2;
    const endX = startX + layout.dividerWidth;

    ctx.save();
    const lineGrad = ctx.createLinearGradient(startX, 0, endX, 0);
    lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    lineGrad.addColorStop(0.2, t.dividerColor);
    lineGrad.addColorStop(0.8, t.dividerColor);
    lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = t.dividerThickness;
    ctx.beginPath();
    ctx.moveTo(startX, layout.dividerY);
    ctx.lineTo(endX, layout.dividerY);
    ctx.stroke();

    // Diamond ornament
    const d = t.diamondSize;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(w / 2, layout.dividerY - d);
    ctx.lineTo(w / 2 + d, layout.dividerY);
    ctx.lineTo(w / 2, layout.dividerY + d);
    ctx.lineTo(w / 2 - d, layout.dividerY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws mode-dependent real planetary facts.
   */
  function drawFacts(ctx, planet, mode, layout) {
    const w = layout.width;
    const t = POSTER_CONFIG.theme;

    let factLeft = {};
    let factRight = {};

    if (mode === 'day') {
      factLeft = { label: 'DAY-SIDE TEMPERATURE', value: planet.dayTemp || 'N/A' };
      factRight = { label: 'LENGTH OF DAY', value: planet.lengthOfDay || 'N/A' };
    } else {
      factLeft = { label: 'NIGHT-SIDE TEMPERATURE', value: planet.nightTemp || 'N/A' };
      factRight = { label: 'SURFACE GRAVITY', value: planet.gravity || 'N/A' };
    }

    function drawFactColumn(centerX, label, value) {
      ctx.save();
      ctx.font = `600 13px ${t.fontFamilySans}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
      ctx.fillText(label, centerX, layout.factsY);
      ctx.restore();

      ctx.save();
      const valFontSize = fitFontSize(ctx, value, 380, 28, 18, t.fontFamilySerif, '700');
      ctx.font = `700 ${valFontSize}px ${t.fontFamilySerif}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(value, centerX, layout.factsY + layout.factsValueOffsetY);
      ctx.restore();
    }

    drawFactColumn(layout.colLeftX, factLeft.label, factLeft.value);
    drawFactColumn(layout.colRightX, factRight.label, factRight.value);

    // Context status tag
    ctx.save();
    ctx.font = `600 12px ${t.fontFamilySans}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = mode === 'day' ? '#fbbf24' : '#818cf8';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
    const tagText = mode === 'day' 
      ? 'DIRECT SOLAR ILLUMINATION • DAY PHASE' 
      : 'NOCTURNAL SHADOW PROFILE • NIGHT PHASE';
    ctx.fillText(tagText, w / 2, layout.phaseTagY);
    ctx.restore();
  }

  /**
   * Draws dynamic credit line at the bottom.
   */
  function drawCreditLine(ctx, planet, layout) {
    const w = layout.width;
    const t = POSTER_CONFIG.theme;
    const textureSource = planet.textureSource || 'NASA Planetary Archives';
    const dataSource = planet.dataSource || 'NASA Planetary Fact Sheet';

    ctx.save();
    ctx.font = `400 12px ${t.fontFamilySans}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';

    const fullCredit = `TEXTURE: ${textureSource}   •   DATA: ${dataSource}`;
    const measuredWidth = ctx.measureText(fullCredit).width;

    if (measuredWidth <= layout.creditMaxWidth) {
      ctx.fillText(fullCredit, w / 2, layout.creditY);
    } else {
      ctx.fillText(`TEXTURE SOURCE: ${textureSource}`, w / 2, layout.creditY - 11);
      ctx.fillText(`DATA SOURCE: ${dataSource}`, w / 2, layout.creditY + 11);
    }
    ctx.restore();
  }

  /**
   * Main render orchestrator. Adapts canvas size and layout dynamically.
   *
   * @param {Object} state - { name, planet, mode, size, texture }
   */
  function render(state) {
    if (!mainCtx || !state.planet || !state.texture) return;

    const layout = getLayout(state.size);

    // Sync canvas internal resolution with selected size preset
    if (mainCanvas.width !== layout.width || mainCanvas.height !== layout.height) {
      mainCanvas.width = layout.width;
      mainCanvas.height = layout.height;
    }

    // Clear previous frame
    mainCtx.clearRect(0, 0, layout.width, layout.height);

    // 1. Space backdrop and poster frame
    drawBackgroundAndFrame(mainCtx, state.planet, layout);

    // 2. Planet header
    drawPlanetHeader(mainCtx, state.planet, layout);

    // 3. User name centerpiece with texture fill
    drawTexturedName(mainCtx, state.name, state.texture, state.planet, state.mode, layout);

    // 4. Center divider
    drawDivider(mainCtx, layout);

    // 5. Mode-dependent real facts
    drawFacts(mainCtx, state.planet, state.mode, layout);

    // 6. Credit line
    drawCreditLine(mainCtx, state.planet, layout);
  }

  /**
   * Exports the canvas as a downloadable PNG poster.
   */
  function exportPNG(filename = 'planet-name-poster.png') {
    if (!mainCanvas) return;

    mainCanvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas export failed to produce blob');
        return;
      }
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  return {
    init,
    render,
    exportPNG,
    getLayout,
    POSTER_CONFIG
  };
})();

// Export for Node.js test environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasRenderer;
}
