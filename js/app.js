/**
 * app.js - Stage 02 Controller: Skies, Day/Night & Live Name Preview
 * ------------------------------------------------------------------
 * Educational Pair-Programming Project: "Planet Name Poster"
 * 
 * Stage 2 Capabilities:
 * 1. Coordinates the full 11-world solar system navigation.
 * 2. Live Poster Studio:
 *    - Real-time text input with character counter and shrink-to-fit typography.
 *    - Instant Day / Night toggle switch with distinct scientific skies.
 *    - Renders live 4:5 preview canvas using SkiesManager and PosterRenderer.
 *    - Clear labeling of non-photographic skies as "Artist's Impression".
 *    - Dynamic font mapping per world (Cinzel, Syne, Playfair Display, Space Grotesk, Cormorant Garamond, Outfit).
 * 3. View Switcher: Seamlessly toggle between full-screen Orbit Map and Poster Studio.
 * 4. Pinned right-hand telemetry card with 100% verified NASA fact sheet figures.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // ---------------------------------------------------------------------------
  // 1. Celestial Worlds Definition (100% NASA Verified Figures)
  // ---------------------------------------------------------------------------
  const WORLDS = [
    {
      id: 'overview',
      name: 'System Overview',
      order: 'All Worlds in Motion',
      type: 'Full Simulation',
      color: '#38bdf8',
      gravity: '~230 km/s',
      dayLength: '~230M yrs',
      temp: '4.6B yrs',
      distSun: '0 - 40+ AU',
      distEarth: 'Dynamic',
      orbitPeriod: '~230M yrs'
    },
    {
      id: 'sun',
      name: 'The Sun',
      order: 'Central Star',
      type: 'Yellow Dwarf',
      color: '#fbbf24',
      gravity: '274.0 m/s²',
      dayLength: '600.0 hrs',
      temp: '5,500 °C',
      distSun: '0 AU (0 km)',
      distEarth: '1.00 AU',
      orbitPeriod: '230M yrs'
    },
    {
      id: 'mercury',
      name: 'Mercury',
      order: '1st from Sun',
      type: 'Terrestrial',
      color: '#cbd5e1',
      gravity: '3.7 m/s²',
      dayLength: '4,222.6 hrs',
      temp: '167 °C',
      distSun: '0.39 AU',
      distEarth: '0.61 AU avg',
      orbitPeriod: '88.0 days'
    },
    {
      id: 'venus',
      name: 'Venus',
      order: '2nd from Sun',
      type: 'Terrestrial',
      color: '#fde047',
      gravity: '8.9 m/s²',
      dayLength: '2,802.0 hrs',
      temp: '464 °C',
      distSun: '0.72 AU',
      distEarth: '0.28 AU min',
      orbitPeriod: '224.7 days'
    },
    {
      id: 'earth',
      name: 'Earth',
      order: '3rd from Sun',
      type: 'Terrestrial',
      color: '#38bdf8',
      gravity: '9.8 m/s²',
      dayLength: '24.0 hrs',
      temp: '15 °C',
      distSun: '1.00 AU',
      distEarth: '0 km (Home)',
      orbitPeriod: '365.25 days'
    },
    {
      id: 'moon',
      name: 'The Moon',
      order: 'Earth\'s Satellite',
      type: 'Lunar Body',
      color: '#e2e8f0',
      gravity: '1.6 m/s²',
      dayLength: '708.7 hrs',
      temp: '-20 °C',
      distSun: '1.00 AU',
      distEarth: '384,400 km',
      orbitPeriod: '27.3 days'
    },
    {
      id: 'mars',
      name: 'Mars',
      order: '4th from Sun',
      type: 'Terrestrial',
      color: '#f87171',
      gravity: '3.7 m/s²',
      dayLength: '24.7 hrs',
      temp: '-65 °C',
      distSun: '1.52 AU',
      distEarth: '0.52 AU min',
      orbitPeriod: '687.0 days'
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      order: '5th from Sun',
      type: 'Gas Giant',
      color: '#fb923c',
      gravity: '24.8 m/s²',
      dayLength: '9.9 hrs',
      temp: '-110 °C',
      distSun: '5.20 AU',
      distEarth: '4.20 AU avg',
      orbitPeriod: '11.86 yrs'
    },
    {
      id: 'io',
      name: 'Io',
      parent: 'jupiter',
      order: "Jupiter's Moon I",
      type: 'Volcanic Satellite',
      color: '#facc15',
      gravity: '1.8 m/s²',
      dayLength: '42.5 hrs',
      temp: '-130 °C',
      distSun: '5.20 AU',
      distEarth: '4.20 AU avg',
      orbitPeriod: '11.86 yrs'
    },
    {
      id: 'europa',
      name: 'Europa',
      parent: 'jupiter',
      order: "Jupiter's Moon II",
      type: 'Ocean Ice World',
      color: '#93c5fd',
      gravity: '1.3 m/s²',
      dayLength: '85.2 hrs',
      temp: '-160 °C',
      distSun: '5.20 AU',
      distEarth: '4.20 AU avg',
      orbitPeriod: '11.86 yrs'
    },
    {
      id: 'ganymede',
      name: 'Ganymede',
      parent: 'jupiter',
      order: "Jupiter's Moon III",
      type: 'Largest Solar Moon',
      color: '#cbd5e1',
      gravity: '1.4 m/s²',
      dayLength: '171.7 hrs',
      temp: '-163 °C',
      distSun: '5.20 AU',
      distEarth: '4.20 AU avg',
      orbitPeriod: '11.86 yrs'
    },
    {
      id: 'callisto',
      name: 'Callisto',
      parent: 'jupiter',
      order: "Jupiter's Moon IV",
      type: 'Cratered Ice World',
      color: '#94a3b8',
      gravity: '1.2 m/s²',
      dayLength: '400.5 hrs',
      temp: '-139 °C',
      distSun: '5.20 AU',
      distEarth: '4.20 AU avg',
      orbitPeriod: '11.86 yrs'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      order: '6th from Sun',
      type: 'Gas Giant',
      color: '#fde047',
      gravity: '10.4 m/s²',
      dayLength: '10.7 hrs',
      temp: '-140 °C',
      distSun: '9.54 AU',
      distEarth: '8.54 AU avg',
      orbitPeriod: '29.45 yrs'
    },
    {
      id: 'enceladus',
      name: 'Enceladus',
      parent: 'saturn',
      order: "Saturn's Moon II",
      type: 'Cryovolcanic World',
      color: '#e0f2fe',
      gravity: '0.11 m/s²',
      dayLength: '32.9 hrs',
      temp: '-198 °C',
      distSun: '9.54 AU',
      distEarth: '8.54 AU avg',
      orbitPeriod: '29.45 yrs'
    },
    {
      id: 'titan',
      name: 'Titan',
      parent: 'saturn',
      order: "Saturn's Moon VI",
      type: 'Haze & Methane Seas',
      color: '#fbbf24',
      gravity: '1.4 m/s²',
      dayLength: '382.7 hrs',
      temp: '-179 °C',
      distSun: '9.54 AU',
      distEarth: '8.54 AU avg',
      orbitPeriod: '29.45 yrs'
    },
    {
      id: 'uranus',
      name: 'Uranus',
      order: '7th from Sun',
      type: 'Ice Giant',
      color: '#5eead4',
      gravity: '8.9 m/s²',
      dayLength: '17.2 hrs',
      temp: '-195 °C',
      distSun: '19.19 AU',
      distEarth: '18.21 AU avg',
      orbitPeriod: '84.02 yrs'
    },
    {
      id: 'neptune',
      name: 'Neptune',
      order: '8th from Sun',
      type: 'Ice Giant',
      color: '#60a5fa',
      gravity: '11.2 m/s²',
      dayLength: '16.1 hrs',
      temp: '-200 °C',
      distSun: '30.07 AU',
      distEarth: '29.07 AU avg',
      orbitPeriod: '164.79 yrs'
    },
    {
      id: 'pluto',
      name: 'Pluto ✨',
      order: 'Kuiper Belt World',
      type: 'Special Dwarf Planet ✨',
      color: '#f3e8d2',
      gravity: '0.6 m/s²',
      dayLength: '153.3 hrs',
      temp: '-225 °C',
      distSun: '39.48 AU',
      distEarth: '38.48 AU avg',
      orbitPeriod: '247.94 yrs'
    }
  ];

  // ---------------------------------------------------------------------------
  // 1.1 Planetary Synopses Database (100% NASA Ground & Orbital Observation)
  // ---------------------------------------------------------------------------
  const WORLD_SYNOPSES = {
    overview: 'Full solar simulation. Watch all worlds orbit the Sun as our entire system travels through the Milky Way galaxy.',
    sun: 'Central yellow dwarf star containing 99.86% of the solar system\'s total mass. Surface temperature ~5,500 °C.',
    mercury: 'Smallest planet and closest to the Sun. Swift cratered world with extreme temperature swings from -180 °C to 430 °C.',
    venus: 'Earth\'s twin in size with a runaway greenhouse atmosphere, crushing pressure, and sulfuric acid clouds (~464 °C).',
    earth: 'Our home oasis. Only world known to harbor life, with liquid oceans, active tectonics, and a protective magnetosphere.',
    moon: 'Earth\'s faithful natural satellite. Stabilizes Earth\'s axial tilt and tides; destination of NASA Apollo and Artemis missions.',
    mars: 'The Red Planet. Home to Olympus Mons, Valles Marineris, polar ice caps, and ancient river valley networks.',
    jupiter: 'King of the planets. Giant gas world with Great Red Spot, massive magnetic shield, and 95 known moons.',
    io: 'Tidally locked to Jupiter (1 rotation = 42.5 hrs). Most volcanically active body in solar system with 400+ active silicate/sulfur calderas.',
    europa: 'Tidally locked to Jupiter. Smooth water-ice lithosphere with reddish tectonic lineae harboring a global subsurface saltwater ocean.',
    ganymede: 'Tidally locked to Jupiter. Largest moon in solar system (larger than Mercury); only moon with an intrinsic magnetic dynamo.',
    callisto: 'Tidally locked to Jupiter. Ancient, heavily cratered surface featuring enormous multi-ring impact basins like Valhalla.',
    saturn: 'Jewel of the solar system. Famous for its dazzling icy ring system, low density, and dynamic moons Titan and Enceladus.',
    enceladus: 'Tidally locked to Saturn. Dazzling 99% albedo water-ice shell with south polar tiger-stripe geysers erupting vapor into space.',
    titan: 'Tidally locked to Saturn. Dense nitrogen-methane atmosphere hides surface in amber haze; hosts liquid methane/ethane seas (Kraken Mare).',
    uranus: 'Tilted ice giant rotating on its side at 98 degrees. Possesses 13 faint rings, cyan methane haze, and 28 moons.',
    neptune: 'Distant sapphire ice giant swept by supersonic winds up to 2,100 km/h and featuring dynamic dark storm systems.',
    pluto: 'Beloved Kuiper Belt dwarf planet with a nitrogen heart glacier (Tombaugh Regio), blue skies, and five orbiting moons.'
  };

  // Application State (Stage 04 & 05: Multi-Format Export, File Types & Custom Dimensions)
  const state = {
    worldId: 'earth',
    mode: 'day',
    name: 'COSMOS',
    size: 'portrait',
    fileType: 'png',
    quality: 0.92,
    customWidth: 1200,
    customHeight: 1200,
    weight: null,
    dob: '',
    view: 'studio', // 'studio' | 'orbit'
    worlds: WORLDS
  };

  // ---------------------------------------------------------------------------
  // 2. DOM Elements Cache
  // ---------------------------------------------------------------------------
  const solarCanvas = document.getElementById('solar-canvas');
  const posterCanvas = document.getElementById('poster-canvas');
  const posterStageSection = document.getElementById('poster-stage-section');
  const scrollToStudioBtn = document.getElementById('scroll-to-studio-btn');
  const scrollToSolarBtn = document.getElementById('scroll-to-solar-btn');
  const studioSectionTitle = document.getElementById('studio-section-title');
  const posterCanvasWrap = document.getElementById('poster-canvas-wrap');
  const downloadBtnLabel = document.getElementById('download-btn-label');

  const nameInput = document.getElementById('name-input');
  const charCount = document.getElementById('char-count');
  const modeDayBtn = document.getElementById('mode-day-btn');
  const modeNightBtn = document.getElementById('mode-night-btn');
  const skyStatusPill = document.getElementById('sky-status-pill');
  const skyFontIndicator = document.getElementById('sky-font-indicator');
  const perfPill = document.getElementById('perf-pill');

  // Stage 04 & 05 Export & Actions Elements
  const exportSizeSelect = document.getElementById('export-size-select');
  const downloadPosterBtn = document.getElementById('download-poster-btn');
  const surpriseBtn = document.getElementById('surprise-btn');
  const copyLinkBtn = document.getElementById('copy-link-btn');
  const toastNotification = document.getElementById('toast-notification');

  // Extended Multi-Format Export & Custom Controls
  const customSizeRow = document.getElementById('custom-size-row');
  const customWidthInput = document.getElementById('custom-width-input');
  const customHeightInput = document.getElementById('custom-height-input');
  const exportTypeSelect = document.getElementById('export-type-select');
  const exportQualitySelect = document.getElementById('export-quality-select');
  const qualityFieldGroup = document.getElementById('quality-field-group');

  // Navigation drawer elements
  const drawerToggleBtn = document.getElementById('drawer-toggle');
  const drawerCloseBtn = document.getElementById('drawer-close');
  const planetDrawer = document.getElementById('planet-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const planetMenuList = document.getElementById('planet-menu');

  // Dedicated Up/Down Astronaut Scroller Elements
  const astronautScrollerWrap = document.getElementById('astronaut-scroller-wrap');
  const astroUpBtn = document.getElementById('astro-up-btn');
  const astroDownBtn = document.getElementById('astro-down-btn');
  const astroTrackRail = document.getElementById('astro-track-rail');
  const astronautGuideThumb = document.getElementById('astronaut-guide-thumb');

  // Right telemetry card elements & Floating Solar Panel
  const selectionPanel = document.getElementById('selection-panel');
  const panelPlanetDot = document.getElementById('panel-planet-dot');
  const panelPlanetName = document.getElementById('panel-planet-name');
  const panelPlanetOrder = document.getElementById('panel-planet-order');
  const panelPlanetType = document.getElementById('panel-planet-type');
  const panelFact1Label = document.getElementById('panel-fact-1-label');
  const panelGravity = document.getElementById('panel-gravity');
  const panelFact2Label = document.getElementById('panel-fact-2-label');
  const panelDayLength = document.getElementById('panel-day-length');
  const panelFact3Label = document.getElementById('panel-fact-3-label');
  const panelTemp = document.getElementById('panel-temp');
  const panelDistSun = document.getElementById('panel-dist-sun');
  const panelDistEarth = document.getElementById('panel-dist-earth');
  const panelOrbit = document.getElementById('panel-orbit');
  const panelCreditSource = document.getElementById('panel-credit-source');

  // Floating Card Specific Telemetry & Synopsis Elements
  const solarGravityVal = document.getElementById('solar-gravity-val');
  const solarDayVal = document.getElementById('solar-day-val');
  const solarTempVal = document.getElementById('solar-temp-val');
  const solarDistSunVal = document.getElementById('solar-dist-sun-val');
  const solarDistEarthVal = document.getElementById('solar-dist-earth-val');
  const solarOrbitVal = document.getElementById('solar-orbit-val');
  const solarSynopsisVal = document.getElementById('solar-synopsis-val');
  const solarOpenStudioBtn = document.getElementById('solar-open-studio-btn');

  // Stage 04 Biophysics Elements
  const userWeightInput = document.getElementById('user-weight-input');
  const userDobInput = document.getElementById('user-dob-input');
  const calcWeightVal = document.getElementById('calc-weight-val');
  const calcAgeVal = document.getElementById('calc-age-val');
  const exportDataBtn = document.getElementById('export-data-btn');

  // ---------------------------------------------------------------------------
  // 3. Render Navigation Menu
  // ---------------------------------------------------------------------------
  function renderPlanetMenu() {
    planetMenuList.innerHTML = '';

    state.worlds.forEach((world) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'planet-btn';
      btn.setAttribute('role', 'menuitem');
      btn.setAttribute('data-body-id', world.id);
      btn.setAttribute('aria-label', `Select ${world.name}, ${world.order}`);

      if (world.id === state.worldId) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'true');
      }

      // Visual color swatch
      const swatch = document.createElement('span');
      swatch.className = 'planet-swatch';
      swatch.style.backgroundColor = world.color;
      swatch.style.color = world.color;
      swatch.setAttribute('aria-hidden', 'true');

      // Title & Subtitle metadata
      const meta = document.createElement('div');
      meta.className = 'planet-meta';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'planet-btn-name';
      nameSpan.textContent = world.name;

      const subSpan = document.createElement('span');
      subSpan.className = 'planet-btn-sub';
      subSpan.textContent = world.order;

      meta.appendChild(nameSpan);
      meta.appendChild(subSpan);

      // If world is a Moon, render as a satellite branching with elbow arrow from parent planet
      if (world.parent || world.id === 'moon') {
        btn.classList.add('satellite-btn');
        const connector = document.createElement('span');
        connector.className = 'satellite-branch-connector';
        connector.setAttribute('aria-hidden', 'true');
        connector.innerHTML = `
          <svg class="satellite-arrow-svg" viewBox="0 0 16 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M 4 0 L 4 10 L 13 10 M 9 6 L 13 10 L 9 14" />
          </svg>
        `;
        btn.appendChild(connector);
      }

      btn.appendChild(swatch);
      btn.appendChild(meta);

      btn.addEventListener('click', () => {
        selectWorld(world.id, { source: 'drawer' });

        if (window.innerWidth < 820 && planetDrawer.classList.contains('open')) {
          closeDrawer();
        }
      });

      btn.addEventListener('keydown', (e) => {
        const buttons = Array.from(planetMenuList.querySelectorAll('.planet-btn'));
        const currentIndex = buttons.indexOf(btn);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % buttons.length;
          buttons[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          buttons[prevIndex].focus();
        }
      });

      planetMenuList.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------------------
  // 3.1 Synchronize Astronaut Scroller Thumb Position Along Milky Way Rail
  // ---------------------------------------------------------------------------
  function updateAstronautScroller(bodyId) {
    if (!astronautGuideThumb || !astroTrackRail) return;
    const totalWorlds = state.worlds.length;
    const idx = state.worlds.findIndex((w) => w.id === bodyId);
    if (idx < 0) return;

    const railHeight = astroTrackRail.clientHeight || 200;
    const thumbHeight = astronautGuideThumb.clientHeight || 36;
    const availableTravel = Math.max(0, railHeight - thumbHeight);
    const fraction = totalWorlds > 1 ? idx / (totalWorlds - 1) : 0;
    const topPx = Math.round(fraction * availableTravel);

    astronautGuideThumb.style.top = `${topPx}px`;
    astronautGuideThumb.setAttribute('aria-valuenow', idx);
    astronautGuideThumb.setAttribute('aria-valuetext', state.worlds[idx].name);
  }

  // ---------------------------------------------------------------------------
  // 4. Two-Way Selection & Live Studio Synchronization
  // ---------------------------------------------------------------------------
  function selectWorld(bodyId, options = {}) {
    const world = state.worlds.find((w) => w.id === bodyId);
    if (!world) return;

    state.worldId = bodyId;

    // 1. Notify solar background canvas
    if (typeof SolarBackground !== 'undefined' && SolarBackground.setSelectedPlanet) {
      SolarBackground.setSelectedPlanet(bodyId);
    }

    // 2. Synchronize Drawer Menu Buttons
    const buttons = planetMenuList.querySelectorAll('.planet-btn');
    buttons.forEach((btn) => {
      const isTarget = btn.getAttribute('data-body-id') === bodyId;
      btn.classList.toggle('active', isTarget);
      if (isTarget) {
        btn.setAttribute('aria-current', 'true');
        if (options.source === 'canvas') {
          btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    // 3. Overview vs Studio View Switch
    if (bodyId === 'overview') {
      state.view = 'orbit';
      // Smoothly scroll back up to the full solar simulation
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update telemetry for Overview
      if (panelPlanetDot) {
        panelPlanetDot.style.backgroundColor = '#38bdf8';
        panelPlanetDot.style.color = '#38bdf8';
        panelPlanetDot.style.boxShadow = '0 0 16px #38bdf8';
      }
      if (panelPlanetName) panelPlanetName.textContent = 'Solar System';
      if (panelPlanetOrder) panelPlanetOrder.textContent = 'Orion-Cygnus Arm';
      if (panelPlanetType) panelPlanetType.textContent = 'Milky Way Galaxy';

      if (panelFact1Label) panelFact1Label.textContent = 'Galactic Speed';
      if (panelGravity) panelGravity.textContent = '~230 km/s';
      if (solarGravityVal) solarGravityVal.textContent = '~230 km/s';

      if (panelFact2Label) panelFact2Label.textContent = 'Galactic Year';
      if (panelDayLength) panelDayLength.textContent = '~230M yrs';
      if (solarDayVal) solarDayVal.textContent = '~230M yrs';

      if (panelFact3Label) panelFact3Label.textContent = 'System Age';
      if (panelTemp) panelTemp.textContent = '4.6B yrs';
      if (solarTempVal) solarTempVal.textContent = '4.6B yrs';

      if (panelDistSun) panelDistSun.textContent = '0 - 40+ AU';
      if (solarDistSunVal) solarDistSunVal.textContent = '0 - 40+ AU';

      if (panelDistEarth) panelDistEarth.textContent = 'Dynamic';
      if (solarDistEarthVal) solarDistEarthVal.textContent = 'Dynamic';

      if (panelOrbit) panelOrbit.textContent = '~230M yrs';
      if (solarOrbitVal) solarOrbitVal.textContent = '~230M yrs';

      if (solarSynopsisVal) {
        solarSynopsisVal.textContent = WORLD_SYNOPSES.overview;
      }

      if (panelCreditSource) panelCreditSource.textContent = 'NASA Solar System Exploration';

      updateAstronautScroller('overview');
      return;
    }

    // World selected: keep user in current stage context for simple, seamless navigation
    state.view = 'studio';

    // Auto-scroll to studio only if explicitly requested or if already browsing the studio
    if (options.source === 'open-studio' || (options.source === 'drawer' && window.scrollY > window.innerHeight * 0.35)) {
      const posterStage = document.getElementById('poster-stage-section');
      if (posterStage) {
        posterStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (studioSectionTitle) {
      studioSectionTitle.textContent = `${world.name} Live Studio`;
    }

    if (typeof SolarBackground !== 'undefined') {
      SolarBackground.setPreviewOpen(true);
    }

    // 4. Update Right Telemetry Card with verified NASA figures
    if (panelPlanetDot) {
      panelPlanetDot.style.backgroundColor = world.color;
      panelPlanetDot.style.color = world.color;
      panelPlanetDot.style.boxShadow = `0 0 16px ${world.color}`;
    }
    if (panelPlanetName) panelPlanetName.textContent = world.name;
    if (panelPlanetOrder) panelPlanetOrder.textContent = world.order;
    if (panelPlanetType) panelPlanetType.textContent = world.type;

    if (panelFact1Label) panelFact1Label.textContent = 'Gravity';
    if (panelGravity) panelGravity.textContent = world.gravity;
    if (solarGravityVal) solarGravityVal.textContent = world.gravity;

    if (panelFact2Label) panelFact2Label.textContent = 'Day Length';
    if (panelDayLength) panelDayLength.textContent = world.dayLength;
    if (solarDayVal) solarDayVal.textContent = world.dayLength;

    if (panelFact3Label) panelFact3Label.textContent = 'Mean Temp';
    if (panelTemp) panelTemp.textContent = world.temp;
    if (solarTempVal) solarTempVal.textContent = world.temp;

    if (panelDistSun) panelDistSun.textContent = world.distSun || '—';
    if (solarDistSunVal) solarDistSunVal.textContent = world.distSun || '—';

    if (panelDistEarth) panelDistEarth.textContent = world.distEarth || '—';
    if (solarDistEarthVal) solarDistEarthVal.textContent = world.distEarth || '—';

    if (panelOrbit) panelOrbit.textContent = world.orbitPeriod || '—';
    if (solarOrbitVal) solarOrbitVal.textContent = world.orbitPeriod || '—';

    if (solarSynopsisVal) {
      solarSynopsisVal.textContent = WORLD_SYNOPSES[world.id] || '';
    }

    if (panelCreditSource) panelCreditSource.textContent = 'NASA Planetary Fact Sheet';

    updateAstronautScroller(world.id);

    // 5. Update Studio Badges, Biophysics & Trigger Poster Repaint
    updateStudioBadges();
    updateBiophysics();
    syncUrlState();
    PosterRenderer.render(state);
  }

  /**
   * Updates Sky status pill and font indicator based on selected world & mode.
   */
  function updateStudioBadges() {
    const skyConfig = SkiesManager.getSkyConfig(state.worldId);
    const activeSky = state.mode === 'night' ? skyConfig.night : skyConfig.day;

    if (skyStatusPill) {
      skyStatusPill.textContent = activeSky.badge;
      if (activeSky.type === 'photographic') {
        skyStatusPill.style.color = 'var(--color-accent-blue)';
        skyStatusPill.style.borderColor = 'rgba(56, 189, 248, 0.35)';
        skyStatusPill.style.background = 'rgba(56, 189, 248, 0.12)';
      } else {
        skyStatusPill.style.color = 'var(--color-accent-gold)';
        skyStatusPill.style.borderColor = 'rgba(251, 191, 36, 0.35)';
        skyStatusPill.style.background = 'rgba(251, 191, 36, 0.12)';
      }
    }

    if (skyFontIndicator) {
      const cleanFontName = (skyConfig.font || 'Cinzel').replace(/["',]/g, '').split(' ')[0];
      skyFontIndicator.textContent = `Font: ${cleanFontName}`;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Toast Notifications & URL State Sync
  // ---------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message, duration = 2600) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, duration);
  }

  function syncUrlState() {
    if (typeof ShareManager !== 'undefined' && ShareManager.serializeStateToQueryString) {
      const qs = ShareManager.serializeStateToQueryString({
        name: state.name,
        planetId: state.worldId,
        mode: state.mode,
        size: state.size,
        weight: state.weight,
        dob: state.dob
      });
      window.history.replaceState({}, '', window.location.pathname + qs);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Biophysics Living Calculator (NASA Orbital & Gravity Formulas)
  // ---------------------------------------------------------------------------
  function updateBiophysics() {
    const world = state.worlds.find((w) => w.id === state.worldId);
    if (!world || state.worldId === 'overview') {
      if (calcWeightVal) calcWeightVal.textContent = '—';
      if (calcAgeVal) calcAgeVal.textContent = '—';
      return;
    }

    // Weight Calculation
    if (typeof CelestialCalculator !== 'undefined' && CelestialCalculator.calculateWeightOnPlanet) {
      const wRes = CelestialCalculator.calculateWeightOnPlanet(state.weight, world.gravity);
      if (calcWeightVal) {
        calcWeightVal.textContent = wRes.formatted;
        calcWeightVal.title = wRes.message || '';
      }
    }

    // Planetary Age Calculation based on Orbital Period
    if (typeof CelestialCalculator !== 'undefined' && CelestialCalculator.calculateAgeOnPlanet) {
      const orbitalPeriods = {
        sun: 0,
        mercury: 0.241,
        venus: 0.615,
        earth: 1.0,
        moon: 1.0,
        mars: 1.881,
        jupiter: 11.86,
        saturn: 29.46,
        uranus: 84.01,
        neptune: 164.8,
        pluto: 248.0
      };
      const period = orbitalPeriods[state.worldId] !== undefined ? orbitalPeriods[state.worldId] : 1.0;
      const ageRes = CelestialCalculator.calculateAgeOnPlanet(state.dob, period);
      if (calcAgeVal) {
        calcAgeVal.textContent = ageRes.value !== null ? `${ageRes.value.toFixed(1)} yrs` : '—';
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 7. User Input Events (Name, Day/Night, Export Size, Surprise, Share, Biophysics)
  // ---------------------------------------------------------------------------
  function bindStudioEvents() {
    // 1. Name input with live debounced repaint (expanded to 30 characters for longer names)
    let inputDebounce = null;
    nameInput.addEventListener('input', (e) => {
      const cleanText = e.target.value.replace(/[^\w\s-]/gi, '').slice(0, 30);
      state.name = cleanText;
      charCount.textContent = `${cleanText.length} / 30`;

      clearTimeout(inputDebounce);
      inputDebounce = setTimeout(() => {
        syncUrlState();
        PosterRenderer.render(state);
      }, 40);
    });

    // 2. Day / Night mode toggle
    modeDayBtn.addEventListener('click', () => {
      if (state.mode === 'day') return;
      state.mode = 'day';
      modeDayBtn.classList.add('active');
      modeDayBtn.setAttribute('aria-pressed', 'true');
      nightBtnActive(false);

      updateStudioBadges();
      syncUrlState();
      PosterRenderer.render(state);
    });

    modeNightBtn.addEventListener('click', () => {
      if (state.mode === 'night') return;
      state.mode = 'night';
      modeNightBtn.classList.add('active');
      modeNightBtn.setAttribute('aria-pressed', 'true');
      dayBtnActive(false);

      updateStudioBadges();
      syncUrlState();
      PosterRenderer.render(state);
    });

    function dayBtnActive(active) {
      modeDayBtn.classList.toggle('active', active);
      modeDayBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    function nightBtnActive(active) {
      modeNightBtn.classList.toggle('active', active);
      modeNightBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    // 3. Two-Stage Vertical Navigation Buttons
    if (scrollToStudioBtn) {
      scrollToStudioBtn.addEventListener('click', () => {
        const posterStage = document.getElementById('poster-stage-section');
        if (posterStage) {
          posterStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    if (solarOpenStudioBtn) {
      solarOpenStudioBtn.addEventListener('click', () => {
        const posterStage = document.getElementById('poster-stage-section');
        if (posterStage) {
          posterStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    if (scrollToSolarBtn) {
      scrollToSolarBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }


    // Scroll listener: Smoothly hide floating telemetry panel when scrolled down into poster studio
    window.addEventListener('scroll', () => {
      const scrollThreshold = window.innerHeight * 0.35;
      if (selectionPanel) {
        if (window.scrollY > scrollThreshold) {
          selectionPanel.classList.add('hidden-in-studio');
        } else {
          selectionPanel.classList.remove('hidden-in-studio');
        }
      }
    // 3.0 Telemetry Panel Minimize / Expand Action
    const panelMinimizeBtn = document.getElementById('panel-minimize-btn');
    const panelMinimizeIcon = document.getElementById('panel-minimize-icon');
    let isPanelMinimized = false;

    if (panelMinimizeBtn && selectionPanel) {
      panelMinimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isPanelMinimized = !isPanelMinimized;
        selectionPanel.classList.toggle('minimized', isPanelMinimized);
        if (panelMinimizeIcon) {
          panelMinimizeIcon.textContent = isPanelMinimized ? '+' : '─';
        }
        panelMinimizeBtn.setAttribute('aria-expanded', !isPanelMinimized);
        panelMinimizeBtn.setAttribute('title', isPanelMinimized ? 'Expand telemetry card' : 'Minimize telemetry card');
        if (window.SolarBackground && typeof SolarBackground.togglePanelMinimize === 'function') {
          SolarBackground.togglePanelMinimize(isPanelMinimized);
        }
      });
    }

    // 3.1 Dedicated Astronaut Scroller Controls (Rail Drag, Buttons & Keyboard)
    if (astroUpBtn) {
      astroUpBtn.addEventListener('click', () => {
        const currentIdx = state.worlds.findIndex((w) => w.id === state.worldId);
        if (currentIdx > 0) {
          selectWorld(state.worlds[currentIdx - 1].id, { source: 'scroller' });
        }
      });
    }

    if (astroDownBtn) {
      astroDownBtn.addEventListener('click', () => {
        const currentIdx = state.worlds.findIndex((w) => w.id === state.worldId);
        if (currentIdx < state.worlds.length - 1) {
          selectWorld(state.worlds[currentIdx + 1].id, { source: 'scroller' });
        }
      });
    }

    if (astroTrackRail) {
      let isDraggingRail = false;

      function handleRailPosition(clientY) {
        const rect = astroTrackRail.getBoundingClientRect();
        if (rect.height <= 0) return;
        const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        const targetIdx = Math.round(relY * (state.worlds.length - 1));
        if (state.worlds[targetIdx] && state.worlds[targetIdx].id !== state.worldId) {
          selectWorld(state.worlds[targetIdx].id, { source: 'scroller' });
        }
      }

      astroTrackRail.addEventListener('pointerdown', (e) => {
        isDraggingRail = true;
        try { astroTrackRail.setPointerCapture(e.pointerId); } catch (_) {}
        handleRailPosition(e.clientY);
      });

      astroTrackRail.addEventListener('pointermove', (e) => {
        if (!isDraggingRail) return;
        handleRailPosition(e.clientY);
      });

      astroTrackRail.addEventListener('pointerup', (e) => {
        if (isDraggingRail) {
          isDraggingRail = false;
          try { astroTrackRail.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      });

      astroTrackRail.addEventListener('pointercancel', () => {
        isDraggingRail = false;
      });
    }

    if (astronautGuideThumb) {
      astronautGuideThumb.addEventListener('keydown', (e) => {
        const currentIdx = state.worlds.findIndex((w) => w.id === state.worldId);
        if (e.key === 'ArrowUp' && currentIdx > 0) {
          e.preventDefault();
          selectWorld(state.worlds[currentIdx - 1].id, { source: 'scroller' });
        } else if (e.key === 'ArrowDown' && currentIdx < state.worlds.length - 1) {
          e.preventDefault();
          selectWorld(state.worlds[currentIdx + 1].id, { source: 'scroller' });
        }
      });
    }

    // 4. Extended Format Selector & Adaptive Aspect Ratios
    function updateDownloadButtonLabel() {
      if (!downloadBtnLabel) return;
      const typeLabel = (state.fileType || 'png').toUpperCase();
      const formatNames = {
        portrait: 'Portrait Poster (1080 × 1350)',
        landscape: 'PC Wallpaper (1920 × 1080)',
        square: 'Square Post (1080 × 1080)',
        story: 'Phone Story (1080 × 1920)',
        x_post: 'X Post (1600 × 900)',
        link_preview: 'Link Preview (1200 × 630)',
        pinterest: 'Pinterest Pin (1000 × 1500)',
        phone_wallpaper: 'Phone Wallpaper (1170 × 2532)',
        desktop_4k: '4K Desktop (3840 × 2160)',
        tablet: 'Tablet Wallpaper (2048 × 1536)',
        ultrawide: 'Ultrawide Monitor (2560 × 1080)',
        a4: 'A4 Print (2480 × 3508)',
        custom: `Custom Size (${state.customWidth} × ${state.customHeight})`
      };
      const label = formatNames[state.size] || `${state.size.toUpperCase()} Format`;
      downloadBtnLabel.textContent = `Download ${typeLabel} • ${label}`;
    }

    if (exportSizeSelect) {
      exportSizeSelect.addEventListener('change', (e) => {
        state.size = e.target.value;
        if (customSizeRow) {
          customSizeRow.style.display = state.size === 'custom' ? 'grid' : 'none';
        }
        if (posterCanvasWrap) {
          posterCanvasWrap.className = `poster-canvas-wrap aspect-${state.size}`;
          if (state.size === 'custom') {
            posterCanvasWrap.style.setProperty('--custom-aspect', `${state.customWidth} / ${state.customHeight}`);
          }
        }
        updateDownloadButtonLabel();
        syncUrlState();
        PosterRenderer.render(state);
      });
    }

    // Custom Width & Height Inputs (Clamped 320 to 4096 px)
    if (customWidthInput) {
      customWidthInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 1200;
        val = Math.max(320, Math.min(4096, val));
        state.customWidth = val;
        customWidthInput.value = val;
        if (state.size === 'custom' && posterCanvasWrap) {
          posterCanvasWrap.style.setProperty('--custom-aspect', `${state.customWidth} / ${state.customHeight}`);
          updateDownloadButtonLabel();
          PosterRenderer.render(state);
        }
      });
    }

    if (customHeightInput) {
      customHeightInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 1200;
        val = Math.max(320, Math.min(4096, val));
        state.customHeight = val;
        customHeightInput.value = val;
        if (state.size === 'custom' && posterCanvasWrap) {
          posterCanvasWrap.style.setProperty('--custom-aspect', `${state.customWidth} / ${state.customHeight}`);
          updateDownloadButtonLabel();
          PosterRenderer.render(state);
        }
      });
    }

    // File Type & Quality Selectors
    if (exportTypeSelect) {
      exportTypeSelect.addEventListener('change', (e) => {
        state.fileType = e.target.value;
        if (qualityFieldGroup) {
          qualityFieldGroup.style.opacity = state.fileType === 'png' ? '0.5' : '1.0';
        }
        updateDownloadButtonLabel();
        PosterRenderer.render(state);
      });
    }

    if (exportQualitySelect) {
      exportQualitySelect.addEventListener('change', (e) => {
        state.quality = parseFloat(e.target.value) || 0.92;
      });
    }

    // 5. Stage 04 & 05 Download High-Resolution Export
    if (downloadPosterBtn) {
      downloadPosterBtn.addEventListener('click', () => {
        if (typeof PosterRenderer !== 'undefined' && PosterRenderer.downloadPoster) {
          const world = state.worlds.find((w) => w.id === state.worldId) || { name: 'Earth' };
          const ext = (state.fileType || 'png').toUpperCase();
          showToast(`📥 Exporting ${world.name} (${ext} • ${state.size})...`);
          PosterRenderer.downloadPoster(state.size, state);
        }
      });
    }

    // 6. Stage 04 Surprise Me Button (Random world & mode)
    if (surpriseBtn) {
      surpriseBtn.addEventListener('click', () => {
        const candidateWorlds = state.worlds.filter((w) => w.id !== 'overview' && w.id !== state.worldId);
        const randomWorld = candidateWorlds[Math.floor(Math.random() * candidateWorlds.length)];
        const randomMode = Math.random() > 0.5 ? 'night' : 'day';

        state.mode = randomMode;
        dayBtnActive(randomMode === 'day');
        nightBtnActive(randomMode === 'night');

        selectWorld(randomWorld.id);
        showToast(`🎲 Surprise: ${randomWorld.name} in ${randomMode.toUpperCase()} mode!`);
      });
    }

    // 7. Stage 04 Copy Shareable Link
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', async () => {
        syncUrlState();
        const shareUrl = window.location.href;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
          } else {
            const tempInput = document.createElement('input');
            tempInput.value = shareUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
          }
          showToast('🔗 Shareable link copied to clipboard!');
        } catch (err) {
          console.warn('Clipboard write fallback:', err);
          showToast('🔗 Link updated in browser address bar!');
        }
      });
    }

    // 8. Stage 04 Biophysics Inputs
    if (userWeightInput) {
      userWeightInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.weight = !isNaN(val) && val > 0 ? val : null;
        updateBiophysics();
        syncUrlState();
      });
    }

    if (userDobInput) {
      userDobInput.addEventListener('change', (e) => {
        state.dob = e.target.value || '';
        updateBiophysics();
        syncUrlState();
      });
    }

    // 9. Stage 04 Export NASA Data (JSON)
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => {
        const world = state.worlds.find((w) => w.id === state.worldId);
        if (!world || state.worldId === 'overview') {
          showToast('⚠️ Select a celestial world first');
          return;
        }
        const dataPayload = {
          world: world.name,
          id: world.id,
          classification: world.type,
          solarOrder: world.order,
          surfaceGravity: world.gravity,
          solarDayLength: world.dayLength,
          meanTemperature: world.temp,
          distanceFromSun: world.distSun || null,
          distanceFromEarth: world.distEarth || null,
          orbitalPeriod: world.orbitPeriod || null,
          userCalculations: {
            earthWeightKg: state.weight,
            weightOnWorld: calcWeightVal ? calcWeightVal.textContent : null,
            birthDate: state.dob,
            ageInWorldYears: calcAgeVal ? calcAgeVal.textContent : null
          },
          source: 'NASA Planetary Fact Sheet / Goddard Space Flight Center',
          verified: true,
          exportTimestamp: new Date().toISOString()
        };

        const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataPayload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonStr);
        downloadAnchor.setAttribute('download', `NASA_FactSheet_${world.id}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        showToast(`📄 Exported NASA ${world.name} Fact Sheet (JSON)`);
      });
    }

    // 10. Astronaut Scroll Listener: Dynamic Milky Way depth gradient
    if (planetMenuList && planetDrawer) {
      planetMenuList.addEventListener('scroll', () => {
        const maxScroll = planetMenuList.scrollHeight - planetMenuList.clientHeight;
        const progress = maxScroll > 0 ? (planetMenuList.scrollTop / maxScroll) : 0;
        planetDrawer.style.setProperty('--milkyway-depth', progress.toFixed(3));
      }, { passive: true });
    }
  }

  // ---------------------------------------------------------------------------
  // 8. Mobile Drawer Controls
  // ---------------------------------------------------------------------------
  function openDrawer() {
    planetDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    drawerToggleBtn.setAttribute('aria-expanded', 'true');

    const activeBtn = planetMenuList.querySelector('.planet-btn.active') || planetMenuList.querySelector('.planet-btn');
    if (activeBtn) activeBtn.focus();
  }

  function closeDrawer() {
    planetDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    drawerToggleBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleDrawer() {
    if (planetDrawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  if (drawerToggleBtn) drawerToggleBtn.addEventListener('click', toggleDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && planetDrawer.classList.contains('open')) {
      closeDrawer();
      if (drawerToggleBtn) drawerToggleBtn.focus();
    }
  });

  // ---------------------------------------------------------------------------
  // 9. Initial Bootstrap
  // ---------------------------------------------------------------------------
  // Initialize Solar System canvas
  if (solarCanvas && typeof SolarBackground !== 'undefined') {
    SolarBackground.init(solarCanvas, (clickedBodyId) => {
      selectWorld(clickedBodyId, { source: 'canvas' });
    });

    if (perfPill && SolarBackground.onPerformanceUpdate) {
      SolarBackground.onPerformanceUpdate((metrics) => {
        perfPill.textContent = `${metrics.fps} FPS • DPR ${metrics.dpr}`;
      });
    }

    // Forward any touches/pointer events on the stage section background to SolarBackground
    const solarStageSection = document.getElementById('solar-stage-section');
    if (solarStageSection) {
      solarStageSection.addEventListener('pointerdown', (e) => {
        if (e.target === solarStageSection && SolarBackground.handlePointerAt) {
          SolarBackground.handlePointerAt(e.clientX, e.clientY);
        }
      });
      solarStageSection.addEventListener('pointermove', (e) => {
        if (e.target === solarStageSection && SolarBackground.handleHoverAt) {
          SolarBackground.handleHoverAt(e.clientX, e.clientY);
        }
      });
    }
  }

  // Initialize Poster Canvas
  if (posterCanvas && typeof PosterRenderer !== 'undefined') {
    PosterRenderer.init(posterCanvas);
  }

  // Render navigation menu & bind controls
  renderPlanetMenu();
  bindStudioEvents();

  // Parse initial URL query state (Stage 04 URL synchronization)
  if (typeof ShareManager !== 'undefined' && ShareManager.parseUrlParams) {
    const urlState = ShareManager.parseUrlParams(window.location.search, state.worlds);
    if (urlState) {
      if (urlState.name) state.name = urlState.name;
      if (urlState.planetId) state.worldId = urlState.planetId;
      if (urlState.mode) state.mode = urlState.mode;
      if (urlState.size) state.size = urlState.size;
      if (urlState.weight) state.weight = urlState.weight;
      if (urlState.dob) state.dob = urlState.dob;

      if (nameInput) nameInput.value = state.name;
      if (charCount) charCount.textContent = `${state.name.length} / 30`;
      if (exportSizeSelect) {
        exportSizeSelect.value = state.size;
        if (posterCanvasWrap) {
          posterCanvasWrap.className = `poster-canvas-wrap aspect-${state.size}`;
        }
        if (downloadBtnLabel) {
          if (state.size === 'landscape') {
            downloadBtnLabel.textContent = 'Download PC Wallpaper (1920 × 1080)';
          } else if (state.size === 'square') {
            downloadBtnLabel.textContent = 'Download Square Post (1080 × 1080)';
          } else if (state.size === 'story') {
            downloadBtnLabel.textContent = 'Download Phone Story (1080 × 1920)';
          } else {
            downloadBtnLabel.textContent = 'Download PNG Poster (1080 × 1350)';
          }
        }
      }
      if (userWeightInput && state.weight) userWeightInput.value = state.weight;
      if (userDobInput && state.dob) userDobInput.value = state.dob;

      modeDayBtn.classList.toggle('active', state.mode === 'day');
      modeDayBtn.setAttribute('aria-pressed', state.mode === 'day' ? 'true' : 'false');
      modeNightBtn.classList.toggle('active', state.mode === 'night');
      modeNightBtn.setAttribute('aria-pressed', state.mode === 'night' ? 'true' : 'false');
    }
  }

  // Expose toast notification for canvas export fallback handling
  window.showToastNotification = showToast;

  // Window resize: Keep astronaut guide thumb aligned with active planet
  window.addEventListener('resize', () => {
    updateAstronautScroller(state.worldId);
  }, { passive: true });

  // Wait for Google Fonts to be ready so canvas typography paints crisply
  try {
    await document.fonts.ready;
  } catch (err) {
    console.info('Proceeding with system serif/sans fonts:', err);
  }

  // Start with restored or default world
  selectWorld(state.worldId || 'earth', { source: 'init' });
  updateAstronautScroller(state.worldId || 'earth');
});
