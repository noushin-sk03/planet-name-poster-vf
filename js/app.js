/**
 * app.js - Main Application Controller (All Stages Integrated: Core to 3D Sphere)
 * -------------------------------------------------------------------------------
 * Coordinates data loading (Planets, Moons, Exoplanets), canvas rendering,
 * URL state synchronization, multi-size exports, biophysical calculations,
 * and the WebGL interactive 3D lit sphere with moving terminator.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Application State
  const state = {
    name: 'COSMOS',
    planetId: 'jupiter',
    planet: null,
    mode: 'day',
    size: 'portrait',
    weight: null,
    dob: '',
    texture: null,
    planets: [],
    activeTab: '2d'
  };

  // Core DOM Elements
  const nameInput = document.getElementById('name-input');
  const charCount = document.getElementById('char-count');
  const planetSelect = document.getElementById('planet-select');
  const planetHint = document.getElementById('planet-hint');
  const dayBtn = document.getElementById('mode-day-btn');
  const nightBtn = document.getElementById('mode-night-btn');
  const modeHint = document.getElementById('mode-hint');
  const sizeSelect = document.getElementById('size-select');
  const downloadBtn = document.getElementById('download-btn');
  const surpriseBtn = document.getElementById('surprise-btn');
  const copyLinkBtn = document.getElementById('copy-link-btn');
  const copyStatus = document.getElementById('copy-status');
  const copyToast = document.getElementById('copy-toast');
  const canvasElement = document.getElementById('poster-canvas');
  const resolutionBadge = document.getElementById('resolution-badge');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingStatus = document.getElementById('loading-status');

  // Stage 03 DOM Elements (Life on Another World)
  const lifePlanetName = document.getElementById('life-planet-name');
  const weightInput = document.getElementById('weight-input');
  const dobInput = document.getElementById('dob-input');
  const calcWeightVal = document.getElementById('calc-weight-val');
  const calcWeightSub = document.getElementById('calc-weight-sub');
  const calcAgeVal = document.getElementById('calc-age-val');
  const calcAgeSub = document.getElementById('calc-age-sub');
  const calcDayVal = document.getElementById('calc-day-val');
  const calcDaySub = document.getElementById('calc-day-sub');

  // Stage 08 DOM Elements (3D Lit Globe)
  const tab2dBtn = document.getElementById('tab-2d-btn');
  const tab3dBtn = document.getElementById('tab-3d-btn');
  const canvasContainer = document.getElementById('canvas-container');
  const sphereContainer = document.getElementById('sphere-container');
  const sphereCanvas = document.getElementById('sphere-canvas');
  const terminatorSlider = document.getElementById('terminator-slider');
  const terminatorAngleVal = document.getElementById('terminator-angle-val');
  const autorotateBtn = document.getElementById('autorotate-btn');
  const captureSphereBtn = document.getElementById('capture-sphere-btn');

  let isAutoRotating = true;

  /**
   * Shows or hides the loading spinner overlay with accessible status text.
   * @param {boolean} show
   * @param {string} message
   */
  function setLoading(show, message = 'Synthesizing celestial textures...') {
    if (show) {
      loadingStatus.textContent = message;
      loadingOverlay.classList.add('visible');
    } else {
      loadingOverlay.classList.remove('visible');
    }
  }

  /**
   * Updates resolution badge and canvas container aspect ratio.
   * @param {string} sizeKey
   */
  function syncCanvasDimensions(sizeKey) {
    const layout = CanvasRenderer.getLayout(sizeKey);
    if (resolutionBadge) {
      resolutionBadge.innerHTML = `${layout.width} &times; ${layout.height} px`;
    }
    if (canvasElement) {
      canvasElement.style.aspectRatio = layout.aspectRatio;
    }
  }

  /**
   * Loads both solar system bodies (planets & moons) and NASA Exoplanet datasets.
   * @returns {Promise<Array>}
   */
  async function loadAllCelestialData() {
    let solarBodies = [];
    let exoplanets = [];

    // 1. Fetch Planets and Moons
    try {
      const resPlanets = await fetch('data/planets.json');
      if (resPlanets.ok) {
        solarBodies = await resPlanets.json();
      }
    } catch (e) {
      console.warn('Could not load data/planets.json, using fallback:', e);
    }

    // 2. Fetch Confirmed Exoplanets (Stage 07)
    try {
      const resExo = await fetch('data/exoplanets.json');
      if (resExo.ok) {
        const exoData = await resExo.json();
        exoplanets = exoData.planets || [];
      }
    } catch (e) {
      console.warn('Could not load data/exoplanets.json:', e);
    }

    // Combine datasets
    const combined = [...solarBodies, ...exoplanets];
    return combined.length > 0 ? combined : [
      {
        id: 'jupiter',
        name: 'Jupiter',
        type: 'planet',
        dayTemp: '-110 °C',
        nightTemp: '-110 °C',
        lengthOfDay: '9.9 hours',
        gravity: '24.8 m/s²',
        orbitalPeriodYears: 11.86,
        textureSource: 'NASA / JPL-Caltech',
        dataSource: 'NASA Fact Sheet',
        palette: { primary: '#c28d54', secondary: '#7a482b', accent: '#e3b584', glow: 'rgba(227, 181, 132, 0.5)' }
      }
    ];
  }

  /**
   * Populates the HTML <select> dropdown with organized <optgroup> categories.
   * @param {Array} bodies
   */
  function populatePlanetSelect(bodies) {
    planetSelect.innerHTML = '';

    const groups = {
      planets: document.createElement('optgroup'),
      moons: document.createElement('optgroup'),
      exoplanets: document.createElement('optgroup'),
      stars: document.createElement('optgroup')
    };

    groups.planets.label = 'Solar System Planets';
    groups.moons.label = 'Moons & Natural Satellites';
    groups.exoplanets.label = 'Confirmed Exoplanets (NASA Archive)';
    groups.stars.label = 'Stars';

    bodies.forEach((body) => {
      const option = document.createElement('option');
      option.value = body.id;
      option.textContent = body.parent ? `${body.name} (${body.parent})` : body.name;
      if (body.id === state.planetId) {
        option.selected = true;
      }

      if (body.type === 'moon') {
        groups.moons.appendChild(option);
      } else if (body.type === 'exoplanet') {
        groups.exoplanets.appendChild(option);
      } else if (body.type === 'star') {
        groups.stars.appendChild(option);
      } else {
        groups.planets.appendChild(option);
      }
    });

    if (groups.planets.children.length) planetSelect.appendChild(groups.planets);
    if (groups.moons.children.length) planetSelect.appendChild(groups.moons);
    if (groups.stars.children.length) planetSelect.appendChild(groups.stars);
    if (groups.exoplanets.children.length) planetSelect.appendChild(groups.exoplanets);
  }

  /**
   * Updates the "Life on Another World" biophysical calculations.
   */
  function updateLifeCalculations() {
    if (!state.planet) return;

    if (lifePlanetName) {
      lifePlanetName.textContent = state.planet.name;
    }

    // Weight Calculation
    const rawWeight = weightInput ? parseFloat(weightInput.value) : null;
    state.weight = !isNaN(rawWeight) && rawWeight > 0 ? rawWeight : null;
    
    // Check if gravity is known
    const gravVal = CelestialCalculator.parseGravity(state.planet.gravity);
    const weightResult = CelestialCalculator.calculateWeightOnPlanet(state.weight, state.planet.gravity);
    
    if (calcWeightVal) {
      calcWeightVal.textContent = state.planet.gravity === 'unknown' ? 'Unknown' : weightResult.formatted;
    }
    if (calcWeightSub) {
      calcWeightSub.textContent = state.planet.gravity === 'unknown' 
        ? 'Mass or radius unmeasured' 
        : weightResult.message;
    }

    // Age Calculation
    const rawDob = dobInput ? dobInput.value : '';
    state.dob = rawDob;
    const ageResult = CelestialCalculator.calculateAgeOnPlanet(
      rawDob,
      state.planet.orbitalPeriodYears
    );
    if (calcAgeVal) {
      calcAgeVal.textContent = state.planet.orbitalPeriodYears ? ageResult.formatted : 'N/A';
    }
    if (calcAgeSub) {
      calcAgeSub.textContent = state.planet.orbitalPeriodYears 
        ? ageResult.message 
        : (state.planet.type === 'star' ? 'Stars do not orbit host stars' : 'Orbital period unknown');
      calcAgeSub.style.color = ageResult.error ? '#f87171' : 'var(--color-text-secondary)';
    }

    // Diurnal Day Ratio
    const dayResult = CelestialCalculator.calculateDiurnalRatio(state.planet.lengthOfDay);
    if (calcDayVal) {
      calcDayVal.textContent = state.planet.lengthOfDay === 'unknown' ? 'Unknown' : dayResult.formatted;
    }
    if (calcDaySub) {
      let tidallyLockedNote = state.planet.isTidallyLocked 
        ? `Tidally locked to ${state.planet.parent || 'host'}` 
        : dayResult.message;
      calcDaySub.textContent = tidallyLockedNote;
    }
  }

  /**
   * Updates state texture, syncs URL query string, and repaints canvas and 3D globe.
   */
  async function updateAndRender() {
    setLoading(true, `Loading texture for ${state.planet.name}...`);
    try {
      // 1. Sync canvas aspect ratio & layout
      syncCanvasDimensions(state.size);

      // 2. Fetch texture (image file or procedural fallback)
      state.texture = await TextureManager.getPlanetTexture(state.planet, state.mode);

      // 3. Render 2D Canvas poster
      CanvasRenderer.render(state);

      // 4. Update WebGL 3D Sphere if supported
      if (Sphere3DViewer.isSupported()) {
        Sphere3DViewer.setTexture(state.texture, state.planet);
      }

      // 5. Update address bar with clean shareable URL (replaceState)
      ShareManager.updateBrowserUrl(state);

      // 6. Update accessible screen-reader description for the canvas
      const canvasAccessibleDesc = document.getElementById('canvas-accessible-desc');
      if (canvasAccessibleDesc) {
        const layout = CanvasRenderer.getLayout(state.size);
        canvasAccessibleDesc.textContent = `Poster artwork displaying "${state.name || 'COSMOS'}" textured with ${state.planet.name} in ${state.mode} illumination mode at ${layout.label} size.`;
      }
    } catch (err) {
      console.error('Render error:', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Sets the active illumination mode (Day or Night).
   * @param {string} mode - 'day' or 'night'
   */
  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;

    if (mode === 'day') {
      dayBtn.classList.add('active');
      dayBtn.setAttribute('aria-checked', 'true');
      nightBtn.classList.remove('active');
      nightBtn.setAttribute('aria-checked', 'false');
      modeHint.textContent = 'Day reveals bright surface features with a subtle rim light.';
    } else {
      nightBtn.classList.add('active');
      nightBtn.setAttribute('aria-checked', 'true');
      dayBtn.classList.remove('active');
      dayBtn.setAttribute('aria-checked', 'false');
      modeHint.textContent = 'Night darkens the planet and casts a luminous atmospheric glow.';
    }

    updateAndRender();
  }

  /**
   * "Surprise Me" button: picks a random planet/moon/exoplanet and mode without repeating combo.
   */
  function surpriseMe() {
    let nextPlanet, nextMode;
    do {
      nextPlanet = state.planets[Math.floor(Math.random() * state.planets.length)];
      nextMode = Math.random() > 0.5 ? 'day' : 'night';
    } while (
      state.planets.length > 1 &&
      nextPlanet.id === state.planetId &&
      nextMode === state.mode
    );

    // Apply selections
    state.planetId = nextPlanet.id;
    state.planet = nextPlanet;
    planetSelect.value = nextPlanet.id;
    planetHint.textContent = `Gravity: ${nextPlanet.gravity} | Length of day: ${nextPlanet.lengthOfDay}`;

    // Apply mode
    if (state.mode !== nextMode) {
      state.mode = nextMode;
      if (nextMode === 'day') {
        dayBtn.classList.add('active');
        dayBtn.setAttribute('aria-checked', 'true');
        nightBtn.classList.remove('active');
        nightBtn.setAttribute('aria-checked', 'false');
      } else {
        nightBtn.classList.add('active');
        nightBtn.setAttribute('aria-checked', 'true');
        dayBtn.classList.remove('active');
        dayBtn.setAttribute('aria-checked', 'false');
      }
    }

    updateLifeCalculations();
    updateAndRender();
  }

  /**
   * "Copy Link" button: copies current share URL and announces to screen readers.
   */
  async function handleCopyLink() {
    const success = await ShareManager.copyShareableLink();
    if (success) {
      if (copyStatus) copyStatus.textContent = 'Shareable poster link copied to clipboard!';
      if (copyToast) {
        copyToast.classList.add('show');
        setTimeout(() => copyToast.classList.remove('show'), 2500);
      }
    }
  }

  /**
   * Switches view between 2D Poster Card and 3D Lit Globe.
   * @param {string} tab - '2d' or '3d'
   */
  function switchViewTab(tab) {
    state.activeTab = tab;
    if (tab === '3d') {
      tab3dBtn.classList.add('active');
      tab3dBtn.setAttribute('aria-selected', 'true');
      tab2dBtn.classList.remove('active');
      tab2dBtn.setAttribute('aria-selected', 'false');

      canvasContainer.style.display = 'none';
      sphereContainer.style.display = 'flex';
      Sphere3DViewer.start();
    } else {
      tab2dBtn.classList.add('active');
      tab2dBtn.setAttribute('aria-selected', 'true');
      tab3dBtn.classList.remove('active');
      tab3dBtn.setAttribute('aria-selected', 'false');

      sphereContainer.style.display = 'none';
      canvasContainer.style.display = 'block';
      Sphere3DViewer.stop();
    }
  }

  /**
   * Binds user interaction events to state updates.
   */
  function bindEvents() {
    // 1. Name input with live debounced update
    let debounceTimer = null;
    nameInput.addEventListener('input', (e) => {
      const val = ShareManager.sanitizeText(e.target.value, 20);
      state.name = val;
      charCount.textContent = `${val.length} / 20`;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        CanvasRenderer.render(state);
        ShareManager.updateBrowserUrl(state);
      }, 60);
    });

    // 2. Planet selector change
    planetSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const found = state.planets.find((p) => p.id === selectedId);
      if (found) {
        state.planetId = found.id;
        state.planet = found;
        planetHint.textContent = `Gravity: ${found.gravity} | Length of day: ${found.lengthOfDay}`;
        updateLifeCalculations();
        updateAndRender();
      }
    });

    // 3. Mode Toggle buttons
    dayBtn.addEventListener('click', () => setMode('day'));
    nightBtn.addEventListener('click', () => setMode('night'));

    // 4. Export Size selector change
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        state.size = e.target.value;
        syncCanvasDimensions(state.size);
        CanvasRenderer.render(state);
        ShareManager.updateBrowserUrl(state);
      });
    }

    // 5. Actions: Download, Surprise Me, Copy Link
    downloadBtn.addEventListener('click', () => {
      const cleanName = (state.name.trim() || 'COSMOS').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const filename = `poster-${state.planet.id}-${state.mode}-${state.size}-${cleanName}.png`;
      CanvasRenderer.exportPNG(filename);
    });

    if (surpriseBtn) surpriseBtn.addEventListener('click', surpriseMe);
    if (copyLinkBtn) copyLinkBtn.addEventListener('click', handleCopyLink);

    // 6. Stage 08 3D Viewer tabs & controls
    if (tab2dBtn) tab2dBtn.addEventListener('click', () => switchViewTab('2d'));
    if (tab3dBtn) tab3dBtn.addEventListener('click', () => switchViewTab('3d'));

    if (terminatorSlider) {
      terminatorSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (terminatorAngleVal) terminatorAngleVal.textContent = `${val}°`;
        Sphere3DViewer.setLightAngle(val);
      });
    }

    if (autorotateBtn) {
      autorotateBtn.addEventListener('click', () => {
        isAutoRotating = !isAutoRotating;
        Sphere3DViewer.setAutoRotate(isAutoRotating);
        autorotateBtn.textContent = isAutoRotating ? 'Pause Rotation' : 'Resume Rotation';
      });
    }

    if (captureSphereBtn) {
      captureSphereBtn.addEventListener('click', () => {
        const dataUrl = Sphere3DViewer.captureViewDataUrl();
        if (dataUrl) {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `globe-3d-${state.planet.id}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    }

    // 7. Life on Another World inputs
    if (weightInput) {
      weightInput.addEventListener('input', () => {
        updateLifeCalculations();
        ShareManager.updateBrowserUrl(state);
      });
    }
    if (dobInput) {
      dobInput.addEventListener('input', () => {
        updateLifeCalculations();
        ShareManager.updateBrowserUrl(state);
      });
      dobInput.addEventListener('change', () => {
        updateLifeCalculations();
        ShareManager.updateBrowserUrl(state);
      });
    }
  }

  /**
   * Application Bootstrap
   */
  async function initApp() {
    setLoading(true, 'Initializing typography & planetary datasets...');

    // 1. Initialize 2D Canvas renderer
    CanvasRenderer.init(canvasElement);

    // 2. Initialize WebGL 3D Sphere viewer
    if (sphereCanvas) {
      Sphere3DViewer.init(sphereCanvas);
    }

    // 3. Load and verify serif fonts
    await TextureManager.ensureFontsReady('900 130px "Cinzel"');

    // 4. Load celestial dataset (Planets, Moons, Exoplanets)
    state.planets = await loadAllCelestialData();

    // 5. Parse incoming URL parameters and restore state
    const urlState = ShareManager.parseUrlParams(window.location.search, state.planets);
    state.name = urlState.name;
    state.planetId = urlState.planetId;
    state.mode = urlState.mode;
    state.size = urlState.size;
    state.weight = urlState.weight;
    state.dob = urlState.dob;

    // 6. Synchronize DOM controls with restored state
    populatePlanetSelect(state.planets);
    planetSelect.value = state.planetId;
    nameInput.value = state.name;
    charCount.textContent = `${state.name.length} / 20`;

    if (sizeSelect) sizeSelect.value = state.size;
    if (weightInput && state.weight) weightInput.value = state.weight;
    if (dobInput && state.dob) dobInput.value = state.dob;

    // Mode buttons state
    if (state.mode === 'night') {
      nightBtn.classList.add('active');
      nightBtn.setAttribute('aria-checked', 'true');
      dayBtn.classList.remove('active');
      dayBtn.setAttribute('aria-checked', 'false');
      modeHint.textContent = 'Night darkens the planet and casts a luminous atmospheric glow.';
    } else {
      dayBtn.classList.add('active');
      dayBtn.setAttribute('aria-checked', 'true');
      nightBtn.classList.remove('active');
      nightBtn.setAttribute('aria-checked', 'false');
      modeHint.textContent = 'Day reveals bright surface features with a subtle rim light.';
    }

    // Set active planet object
    state.planet = state.planets.find((p) => p.id === state.planetId) || state.planets[0];
    planetHint.textContent = `Gravity: ${state.planet.gravity} | Length of day: ${state.planet.lengthOfDay}`;

    // 7. Bind events
    bindEvents();

    // 8. Calculate biophysics & perform initial render
    updateLifeCalculations();
    await updateAndRender();
  }

  // Launch application
  await initApp();
});
