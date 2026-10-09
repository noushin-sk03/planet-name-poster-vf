/**
 * share.js - URL State Synchronization & Safe Sharing
 * ----------------------------------------------------
 * Pure functions for parsing, validating, sanitizing, and serializing
 * application state into clean URL query strings.
 *
 * Security Principles:
 * 1. Treat all URL input as untrusted user input.
 * 2. Strict whitelist validation for planets, modes, and export sizes.
 * 3. Never insert text values into DOM via innerHTML (XSS defense).
 * 4. Bound and sanitize numeric and date ranges.
 */

const ShareManager = (() => {
  // Allowed presets
  const VALID_MODES = ['day', 'night'];
  const VALID_SIZES = [
    'portrait', 'landscape', 'square', 'story',
    'x_post', 'link_preview', 'pinterest',
    'desktop_4k', 'ultrawide', 'tablet', 'phone_wallpaper',
    'a4', 'custom'
  ];
  const DEFAULT_DEFAULTS = {
    name: 'COSMOS',
    planetId: 'jupiter',
    mode: 'day',
    size: 'portrait',
    weight: null,
    dob: ''
  };

  /**
   * Sanitizes untrusted text strings to prevent XSS.
   * Strips HTML markup, clamps length, and normalizes spacing.
   *
   * @param {string} raw - Untrusted input from URL
   * @param {number} maxLength - Character ceiling
   * @returns {string} - Clean, safe string
   */
  function sanitizeText(raw, maxLength = 30) {
    if (!raw || typeof raw !== 'string') return '';
    // 1. Remove script/style tags and their inner contents
    let clean = raw.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // 2. Strip any remaining HTML tags
    clean = clean.replace(/<[^>]+>/g, '');
    // 3. Strip control characters
    clean = clean.replace(/[\x00-\x1F\x7F]/g, '');
    // 4. Trim and clamp length
    return clean.trim().slice(0, maxLength);
  }

  /**
   * Parses and validates URL query string parameters against the planets list.
   *
   * @param {string} searchString - e.g. "?name=Sam&planet=mars&mode=night"
   * @param {Array} planetsList - Loaded planets from planets.json
   * @returns {Object} Validated state object
   */
  function parseUrlParams(searchString, planetsList = []) {
    const params = new URLSearchParams(searchString || '');
    const validPlanetIds = new Set(planetsList.map((p) => p.id));

    // 1. Name validation (supports longer names up to 30 chars)
    const rawName = params.get('name');
    const cleanName = sanitizeText(rawName, 30) || DEFAULT_DEFAULTS.name;

    // 2. Planet validation (whitelist against known planet IDs)
    const rawPlanet = (params.get('planet') || '').toLowerCase().trim();
    const planetId = validPlanetIds.has(rawPlanet) 
      ? rawPlanet 
      : (validPlanetIds.size > 0 ? (validPlanetIds.has(DEFAULT_DEFAULTS.planetId) ? DEFAULT_DEFAULTS.planetId : planetsList[0].id) : DEFAULT_DEFAULTS.planetId);

    // 3. Mode validation (strict enum check)
    const rawMode = (params.get('mode') || '').toLowerCase().trim();
    const mode = VALID_MODES.includes(rawMode) ? rawMode : DEFAULT_DEFAULTS.mode;

    // 4. Size validation (strict enum check)
    const rawSize = (params.get('size') || '').toLowerCase().trim();
    const size = VALID_SIZES.includes(rawSize) ? rawSize : DEFAULT_DEFAULTS.size;

    // 5. Weight validation (number clamp: 1kg - 500kg)
    let weight = null;
    const rawWeight = params.get('weight');
    if (rawWeight !== null && rawWeight !== '') {
      const parsedWeight = parseFloat(rawWeight);
      if (!isNaN(parsedWeight) && parsedWeight > 0 && parsedWeight <= 500) {
        weight = Number(parsedWeight.toFixed(1));
      }
    }

    // 6. Birth date validation (ISO date YYYY-MM-DD, not in the future)
    let dob = '';
    const rawDob = params.get('dob');
    if (rawDob) {
      const parsedDate = new Date(rawDob);
      if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
        dob = rawDob.slice(0, 10);
      }
    }

    return {
      name: cleanName,
      planetId,
      mode,
      size,
      weight,
      dob
    };
  }

  /**
   * Serializes current state into a URL query string.
   *
   * @param {Object} state
   * @returns {string} - Clean query string e.g. "?name=Cosmos&planet=mars&mode=night"
   */
  function serializeStateToQueryString(state) {
    const params = new URLSearchParams();

    if (state.name && state.name.trim()) {
      params.set('name', sanitizeText(state.name, 20));
    }
    if (state.planetId) {
      params.set('planet', state.planetId);
    }
    if (state.mode && state.mode !== DEFAULT_DEFAULTS.mode) {
      params.set('mode', state.mode);
    }
    if (state.size && state.size !== DEFAULT_DEFAULTS.size) {
      params.set('size', state.size);
    }
    if (state.weight && state.weight > 0) {
      params.set('weight', state.weight);
    }
    if (state.dob) {
      params.set('dob', state.dob);
    }

    const query = params.toString();
    return query ? `?${query}` : '';
  }

  /**
   * Updates browser address bar using history.replaceState to avoid polluting back history.
   *
   * @param {Object} state
   */
  function updateBrowserUrl(state) {
    if (typeof window === 'undefined' || !window.history || !window.history.replaceState) return;

    const queryString = serializeStateToQueryString(state);
    const newUrl = `${window.location.pathname}${queryString}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
  }

  /**
   * Copies the current shareable link to the system clipboard.
   *
   * @returns {Promise<boolean>}
   */
  async function copyShareableLink() {
    if (typeof window === 'undefined') return false;

    const fullUrl = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        return true;
      }
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = fullUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      return false;
    }
  }

  return {
    sanitizeText,
    parseUrlParams,
    serializeStateToQueryString,
    updateBrowserUrl,
    copyShareableLink,
    VALID_MODES,
    VALID_SIZES
  };
})();

// Export for Node.js unit tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShareManager;
}
