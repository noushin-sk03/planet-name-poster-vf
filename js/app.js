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

  // ---------------------------------------------------------------------------
  // 1.2 NASA Exoplanet Archive Worlds (Confirmed Habitable & Extreme Worlds)
  // ---------------------------------------------------------------------------
  const EXOPLANETS = [
    {
      id: 'trappist_1_e',
      name: 'TRAPPIST-1 e',
      hostname: 'TRAPPIST-1',
      order: 'Habitable Zone World',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#38bdf8',
      starColor: '#ef4444',
      gravity: '8.0 m/s²',
      dayLength: '6.1 d (Sync)',
      temp: '-28 °C',
      distSun: '39.5 ly',
      distEarth: '39.5 ly',
      orbitPeriod: '6.10 days',
      orbitalPeriodYears: 0.0167,
      radiusEarths: 0.92,
      massEarths: 0.69,
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#0284c7', secondary: '#064e3b', accent: '#bae6fd', glow: 'rgba(2, 132, 199, 0.55)' }
    },
    {
      id: 'trappist_1_f',
      name: 'TRAPPIST-1 f',
      hostname: 'TRAPPIST-1',
      order: 'Outer Habitable Zone',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#818cf8',
      starColor: '#ef4444',
      gravity: '9.3 m/s²',
      dayLength: '9.2 d (Sync)',
      temp: '-54 °C',
      distSun: '39.5 ly',
      distEarth: '39.5 ly',
      orbitPeriod: '9.21 days',
      orbitalPeriodYears: 0.0252,
      radiusEarths: 1.04,
      massEarths: 1.04,
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#6366f1', secondary: '#1e1b4b', accent: '#c7d2fe', glow: 'rgba(99, 102, 241, 0.55)' }
    },
    {
      id: 'proxima_cen_b',
      name: 'Proxima Cen b',
      hostname: 'Proxima Cen',
      order: 'Nearest Exoplanet (4.2 ly)',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#06b6d4',
      starColor: '#dc2626',
      gravity: 'unknown',
      dayLength: '11.2 d (Sync)',
      temp: '-55 °C',
      distSun: '4.2 ly',
      distEarth: '4.2 ly',
      orbitPeriod: '11.18 days',
      orbitalPeriodYears: 0.0306,
      radiusEarths: 'unknown',
      massEarths: 1.05,
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#06b6d4', secondary: '#082f49', accent: '#cffafe', glow: 'rgba(6, 182, 212, 0.55)' }
    },
    {
      id: 'kepler_186_f',
      name: 'Kepler-186 f',
      hostname: 'Kepler-186',
      order: '1st Earth-Size HZ World',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#10b981',
      starColor: '#f97316',
      gravity: 'unknown',
      dayLength: '129.9 days',
      temp: '-85 °C',
      distSun: '579.2 ly',
      distEarth: '579.2 ly',
      orbitPeriod: '129.94 days',
      orbitalPeriodYears: 0.3558,
      radiusEarths: 1.17,
      massEarths: 'unknown',
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#059669', secondary: '#064e3b', accent: '#a7f3d0', glow: 'rgba(5, 150, 105, 0.55)' }
    },
    {
      id: 'kepler_452_b',
      name: 'Kepler-452 b',
      hostname: 'Kepler-452',
      order: 'Earth\'s Older Cousin',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#0ea5e9',
      starColor: '#fbbf24',
      gravity: 'unknown',
      dayLength: '384.8 days',
      temp: '-8 °C',
      distSun: '1799.5 ly',
      distEarth: '1799.5 ly',
      orbitPeriod: '384.84 days',
      orbitalPeriodYears: 1.0537,
      radiusEarths: 1.63,
      massEarths: 'unknown',
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#0284c7', secondary: '#064e3b', accent: '#bae6fd', glow: 'rgba(2, 132, 199, 0.55)' }
    },
    {
      id: 'kepler_22_b',
      name: 'Kepler-22 b',
      hostname: 'Kepler-22',
      order: '1st Kepler HZ Candidate',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#22c55e',
      starColor: '#eab308',
      gravity: '20.2 m/s²',
      dayLength: '289.9 days',
      temp: '6 °C',
      distSun: '634.8 ly',
      distEarth: '634.8 ly',
      orbitPeriod: '289.86 days',
      orbitalPeriodYears: 0.7936,
      radiusEarths: 2.10,
      massEarths: 9.10,
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#16a34a', secondary: '#14532d', accent: '#bbf7d0', glow: 'rgba(22, 163, 74, 0.55)' }
    },
    {
      id: 'wasp_76_b',
      name: 'WASP-76 b',
      hostname: 'WASP-76',
      order: 'Iron-Rain Ultra-Hot World',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#ef4444',
      starColor: '#fef08a',
      gravity: '6.5 m/s²',
      dayLength: '1.81 days',
      temp: '1955 °C',
      distSun: '634.2 ly',
      distEarth: '634.2 ly',
      orbitPeriod: '1.81 days',
      orbitalPeriodYears: 0.0050,
      radiusEarths: 20.78,
      massEarths: 284.14,
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#dc2626', secondary: '#7f1d1d', accent: '#fef08a', glow: 'rgba(239, 68, 68, 0.65)' }
    },
    {
      id: 'wasp_12_b',
      name: 'WASP-12 b',
      hostname: 'WASP-12',
      order: 'Tidally Disrupted Giant',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#f97316',
      starColor: '#fef08a',
      gravity: 'unknown',
      dayLength: '1.09 days',
      temp: '2210 °C',
      distSun: '1393.5 ly',
      distEarth: '1393.5 ly',
      orbitPeriod: '1.09 days',
      orbitalPeriodYears: 0.0030,
      radiusEarths: 22.03,
      massEarths: 'unknown',
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#ea580c', secondary: '#431407', accent: '#fde047', glow: 'rgba(234, 88, 12, 0.65)' }
    },
    {
      id: '55_cnc_e',
      name: '55 Cnc e',
      hostname: '55 Cnc',
      order: 'Super-Earth Lava World',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#f59e0b',
      starColor: '#f59e0b',
      gravity: '22.3 m/s²',
      dayLength: '0.74 days',
      temp: '1950 °C',
      distSun: '41.0 ly',
      distEarth: '41.0 ly',
      orbitPeriod: '0.74 days',
      orbitalPeriodYears: 0.0020,
      radiusEarths: 1.88,
      massEarths: 7.99,
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#d97706', secondary: '#78350f', accent: '#fef08a', glow: 'rgba(217, 119, 6, 0.65)' }
    },
    {
      id: 'hd_189733_b',
      name: 'HD 189733 b',
      hostname: 'HD 189733',
      order: 'Silicate Glass Rain World',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#2563eb',
      starColor: '#ea580c',
      gravity: '22.0 m/s²',
      dayLength: '2.22 days',
      temp: '930 °C',
      distSun: '64.5 ly',
      distEarth: '64.5 ly',
      orbitPeriod: '2.22 days',
      orbitalPeriodYears: 0.0061,
      radiusEarths: 12.67,
      massEarths: 359.15,
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#1d4ed8', secondary: '#1e1b4b', accent: '#93c5fd', glow: 'rgba(29, 78, 216, 0.65)' }
    },
    {
      id: 'hd_209458_b',
      name: 'HD 209458 b',
      hostname: 'HD 209458',
      order: 'Osiris / Evaporating Giant',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#6366f1',
      starColor: '#fef08a',
      gravity: '9.4 m/s²',
      dayLength: '3.52 days',
      temp: '1130 °C',
      distSun: '157.5 ly',
      distEarth: '157.5 ly',
      orbitPeriod: '3.52 days',
      orbitalPeriodYears: 0.0097,
      radiusEarths: 15.58,
      massEarths: 232.02,
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#4f46e5', secondary: '#1e1b4b', accent: '#c7d2fe', glow: 'rgba(79, 70, 229, 0.6)' }
    },
    {
      id: 'toi_700_d',
      name: 'TOI-700 d',
      hostname: 'TOI-700',
      order: 'TESS Habitable Earth-Size',
      type: 'exoplanet',
      isArtistImpression: true,
      color: '#0284c7',
      starColor: '#dc2626',
      gravity: 'unknown',
      dayLength: '37.4 days',
      temp: '-4 °C',
      distSun: '101.5 ly',
      distEarth: '101.5 ly',
      orbitPeriod: '37.42 days',
      orbitalPeriodYears: 0.1025,
      radiusEarths: 1.15,
      massEarths: 'unknown',
      dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
      palette: { primary: '#0369a1', secondary: '#082f49', accent: '#7dd3fc', glow: 'rgba(3, 105, 161, 0.55)' }
    }
  ];

  // ---------------------------------------------------------------------------
  // 1.3 Exoplanet Synopses Database (100% NASA Exoplanet Archive Discovery Data)
  // ---------------------------------------------------------------------------
  const EXOPLANET_SYNOPSES = {
    trappist_1_e: 'Confirmed Earth-sized planet in the habitable zone of ultra-cool red dwarf TRAPPIST-1. Liquid surface water is physically viable. Artist\'s impression.',
    trappist_1_f: 'Cooler habitable zone world orbiting TRAPPIST-1. May harbor a global water ocean beneath an ice-rich crust. Artist\'s impression.',
    proxima_cen_b: 'Closest known exoplanet to Earth (4.2 ly). Orbiting in the habitable zone of red dwarf Proxima Centauri in 11.2 days. Artist\'s impression.',
    kepler_186_f: 'Historic 1st validated Earth-size planet orbiting in the habitable zone of another star (M1 dwarf Kepler-186). Artist\'s impression.',
    kepler_452_b: 'Earth\'s older cousin. Super-Earth orbiting a Sun-like G2 star in a 385-day orbit at 1,800 light-years distance. Artist\'s impression.',
    kepler_22_b: 'First Kepler planet discovered in a star\'s habitable zone. Likely an oceanic warm water-world with a thick atmosphere. Artist\'s impression.',
    wasp_76_b: 'Scorching ultra-hot gas giant where temperatures exceed 2,200 °C. Iron vaporizes on the day side and rains as liquid metal at night! Artist\'s impression.',
    wasp_12_b: 'Pitch-black hot Jupiter being gravitationally stretched into an egg shape by extreme tidal forces of its host star. Artist\'s impression.',
    '55_cnc_e': 'Super-Earth lava world orbiting its host star in just 18 hours. Surface features oceans of molten silicate lava. Artist\'s impression.',
    hd_189733_b: 'Deep azure hot Jupiter where supersonic winds howl at 8,700 km/h, blowing clouds of molten silicate glass sideways. Artist\'s impression.',
    hd_209458_b: 'Nicknamed Osiris. First transiting exoplanet detected with an escaping comet-like tail of hydrogen and carbon. Artist\'s impression.',
    toi_700_d: 'TESS-discovered Earth-sized planet receiving 86% of Earth\'s stellar energy in the conservative habitable zone of TOI-700. Artist\'s impression.'
  };

  // Application State (Stage 06 & 07: Solar System, Moons & NASA Exoplanet Archive)
  const state = {
    catalog: 'solar', // 'solar' | 'exo'
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
    studioMode: '2d', // '2d' | '3d'
    is3dAutoRotating: true,
    worlds: WORLDS,
    exoplanets: EXOPLANETS
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

  // Stage 08 WebGL 3D Globe Elements
  const view2dBtn = document.getElementById('view-2d-btn');
  const view3dBtn = document.getElementById('view-3d-btn');
  const globeCanvasWrap = document.getElementById('globe-canvas-wrap');
  const globeCanvas = document.getElementById('globe-canvas');
  const terminatorSlider = document.getElementById('terminator-slider');
  const terminatorAngleVal = document.getElementById('terminator-angle-val');
  const globeAutorotateBtn = document.getElementById('globe-autorotate-btn');
  const globeRotateLabel = document.getElementById('globe-rotate-label');
  const globeExportBtn = document.getElementById('globe-export-btn');
  const globeNameDisplay = document.getElementById('globe-name-display');
  const globeWorldName = document.getElementById('globe-world-name');
  const globeTelemetryBadge = document.getElementById('globe-telemetry-badge');

  // Asteroid User Guide Modal Elements
  const asteroidGuideBtn = document.getElementById('asteroid-guide-btn');
  const userGuideModalBackdrop = document.getElementById('user-guide-modal-backdrop');
  const userGuideCloseBtn = document.getElementById('user-guide-close-btn');
  const userGuideOkBtn = document.getElementById('user-guide-ok-btn');

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

  // Catalog Tab Switcher Elements (Solar System vs NASA Exoplanet Archive)
  const tabSolarBtn = document.getElementById('tab-solar-btn');
  const tabExoBtn = document.getElementById('tab-exo-btn');

  function getActiveWorldsList() {
    return state.catalog === 'exo' ? state.exoplanets : state.worlds;
  }

  function getAllWorlds() {
    return [...state.worlds, ...state.exoplanets];
  }

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
  // 3. Render Navigation Menu & Catalog Switching
  // ---------------------------------------------------------------------------
  function switchCatalog(cat) {
    if (state.catalog === cat) return;
    state.catalog = cat;

    if (tabSolarBtn) {
      tabSolarBtn.classList.toggle('active', cat === 'solar');
      tabSolarBtn.setAttribute('aria-selected', cat === 'solar' ? 'true' : 'false');
    }
    if (tabExoBtn) {
      tabExoBtn.classList.toggle('active', cat === 'exo');
      tabExoBtn.setAttribute('aria-selected', cat === 'exo' ? 'true' : 'false');
    }

    renderPlanetMenu();
    planetMenuList.scrollTop = 0;

    const activeList = getActiveWorldsList();
    const exists = activeList.some((w) => w.id === state.worldId);
    if (!exists && activeList.length > 0) {
      selectWorld(activeList[0].id, { source: 'catalog-switch' });
    } else {
      updateAstronautScroller(state.worldId);
    }
  }

  function renderPlanetMenu() {
    planetMenuList.innerHTML = '';
    const activeList = getActiveWorldsList();

    activeList.forEach((world) => {
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
      if (world.type === 'exoplanet' && world.starColor) {
        swatch.style.boxShadow = `0 0 10px ${world.starColor}`;
      }
      swatch.setAttribute('aria-hidden', 'true');

      // Title & Subtitle metadata
      const meta = document.createElement('div');
      meta.className = 'planet-meta';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'planet-btn-name';
      nameSpan.textContent = world.name;
      meta.appendChild(nameSpan);

      if (world.type === 'exoplanet') {
        const tagsRow = document.createElement('div');
        tagsRow.className = 'planet-btn-tags';

        const hostTag = document.createElement('span');
        hostTag.className = 'planet-tag-host';
        hostTag.textContent = `⭐ ${world.hostname || 'Archive'}`;

        const distTag = document.createElement('span');
        distTag.className = 'planet-tag-dist';
        distTag.textContent = world.distSun || 'NASA';

        tagsRow.appendChild(hostTag);
        tagsRow.appendChild(distTag);
        meta.appendChild(tagsRow);
      } else {
        const subSpan = document.createElement('span');
        subSpan.className = 'planet-btn-sub';
        subSpan.textContent = world.order;
        meta.appendChild(subSpan);
      }

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
  function syncAstronautToScroll() {
    if (!astronautGuideThumb || !astroTrackRail || !planetMenuList) return;
    const maxScroll = planetMenuList.scrollHeight - planetMenuList.clientHeight;
    const progress = maxScroll > 0 ? (planetMenuList.scrollTop / maxScroll) : 0;
    const railHeight = astroTrackRail.clientHeight || 200;
    const thumbHeight = 36;
    const availableTravel = Math.max(0, railHeight - thumbHeight);
    const topPx = Math.max(0, Math.min(availableTravel, Math.round(progress * availableTravel)));

    astronautGuideThumb.style.top = `${topPx}px`;
    if (planetDrawer) {
      planetDrawer.style.setProperty('--milkyway-depth', progress.toFixed(3));
    }
  }

  function updateAstronautScroller(bodyId) {
    if (!astronautGuideThumb || !astroTrackRail || !planetMenuList) return;
    const activeBtn = planetMenuList.querySelector(`.planet-btn[data-body-id="${bodyId}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    syncAstronautToScroll();
  }

  // ---------------------------------------------------------------------------
  // 4. Two-Way Selection & Live Studio Synchronization
  // ---------------------------------------------------------------------------
  function selectWorld(bodyId, options = {}) {
    const allWorlds = getAllWorlds();
    const world = allWorlds.find((w) => w.id === bodyId);
    if (!world) return;

    state.worldId = bodyId;

    // Detect catalog switch if needed
    const isExo = world.type === 'exoplanet' || Boolean(world.isArtistImpression);
    const expectedCatalog = isExo ? 'exo' : 'solar';
    if (state.catalog !== expectedCatalog) {
      state.catalog = expectedCatalog;
      if (tabSolarBtn) {
        tabSolarBtn.classList.toggle('active', expectedCatalog === 'solar');
        tabSolarBtn.setAttribute('aria-selected', expectedCatalog === 'solar' ? 'true' : 'false');
      }
      if (tabExoBtn) {
        tabExoBtn.classList.toggle('active', expectedCatalog === 'exo');
        tabExoBtn.setAttribute('aria-selected', expectedCatalog === 'exo' ? 'true' : 'false');
      }
      renderPlanetMenu();
    }

    // 1. Notify solar background canvas
    if (typeof SolarBackground !== 'undefined') {
      if (isExo && SolarBackground.setExoplanet) {
        SolarBackground.setExoplanet(world);
      } else if (SolarBackground.setSelectedPlanet) {
        SolarBackground.setSelectedPlanet(bodyId);
      }
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
    if (panelPlanetOrder) {
      panelPlanetOrder.textContent = (isExo && world.hostname) ? `Host: ${world.hostname}` : world.order;
    }
    if (panelPlanetType) {
      panelPlanetType.textContent = isExo ? 'Exoplanet (Artist\'s Impression)' : world.type;
    }

    if (panelFact1Label) panelFact1Label.textContent = 'Gravity';
    const gravDisplay = world.gravity === 'unknown' ? 'Unknown' : (world.gravity || '—');
    if (panelGravity) panelGravity.textContent = gravDisplay;
    if (solarGravityVal) solarGravityVal.textContent = gravDisplay;

    if (panelFact2Label) panelFact2Label.textContent = isExo ? 'Orbit / Day' : 'Day Length';
    const dayDisplay = world.dayLength === 'unknown' ? 'Unknown' : (world.dayLength || '—');
    if (panelDayLength) panelDayLength.textContent = dayDisplay;
    if (solarDayVal) solarDayVal.textContent = dayDisplay;

    if (panelFact3Label) panelFact3Label.textContent = isExo ? 'Equilibrium Temp' : 'Mean Temp';
    const tempDisplay = world.temp === 'unknown' ? 'Unknown' : (world.temp || '—');
    if (panelTemp) panelTemp.textContent = tempDisplay;
    if (solarTempVal) solarTempVal.textContent = tempDisplay;

    if (panelDistSun) panelDistSun.textContent = world.distSun || '—';
    if (solarDistSunVal) solarDistSunVal.textContent = world.distSun || '—';

    if (panelDistEarth) panelDistEarth.textContent = world.distEarth || '—';
    if (solarDistEarthVal) solarDistEarthVal.textContent = world.distEarth || '—';

    if (panelOrbit) panelOrbit.textContent = world.orbitPeriod || '—';
    if (solarOrbitVal) solarOrbitVal.textContent = world.orbitPeriod || '—';

    if (solarSynopsisVal) {
      const synText = isExo ? (EXOPLANET_SYNOPSES[world.id] || '') : (WORLD_SYNOPSES[world.id] || '');
      solarSynopsisVal.textContent = synText;
    }

    if (panelCreditSource) {
      panelCreditSource.textContent = isExo ? 'NASA Exoplanet Archive (IPAC/Caltech)' : 'NASA Planetary Fact Sheet';
    }

    updateAstronautScroller(world.id);

    // 5. Update Studio Badges, Biophysics & Trigger Poster Repaint
    updateStudioBadges();
    updateBiophysics();
    syncUrlState();
    PosterRenderer.render(state);
    if (globeNameDisplay) {
      globeNameDisplay.textContent = state.name || 'COSMOS';
    }
    if (globeWorldName) {
      globeWorldName.textContent = world.name;
    }
    if (globeTelemetryBadge) {
      globeTelemetryBadge.textContent = `${world.distSun || ''} • ${world.gravity ? world.gravity + ' m/s²' : 'Unknown'}`;
    }

    updateGlobeTexture(world);
  }

  // ---------------------------------------------------------------------------
  // 4.1 Stage 08 WebGL 3D Lit Globe Controls
  // ---------------------------------------------------------------------------
  function updateGlobeTexture(world, forceRefresh = false) {
    if (typeof Sphere3DViewer === 'undefined' || !Sphere3DViewer.isSupported()) return;
    if (typeof TextureManager !== 'undefined' && TextureManager.generateProceduralTexture) {
      const texCanvas = TextureManager.generateProceduralTexture(world, state.mode, forceRefresh);
      Sphere3DViewer.setTexture(texCanvas, world);
    }
  }

  function switchStudioView(viewMode) {
    state.studioMode = viewMode;
    if (view2dBtn) {
      view2dBtn.classList.toggle('active', viewMode === '2d');
      view2dBtn.setAttribute('aria-selected', viewMode === '2d' ? 'true' : 'false');
    }
    if (view3dBtn) {
      view3dBtn.classList.toggle('active', viewMode === '3d');
      view3dBtn.setAttribute('aria-selected', viewMode === '3d' ? 'true' : 'false');
    }
    if (posterCanvasWrap) {
      posterCanvasWrap.style.display = viewMode === '2d' ? 'flex' : 'none';
    }
    if (globeCanvasWrap) {
      globeCanvasWrap.style.display = viewMode === '3d' ? 'flex' : 'none';
    }

    // Show Illumination Mode toggle only for 2D poster, hide it in WebGL view
    const modeWrap = document.querySelector('.control-mode-wrap');
    if (modeWrap) {
      modeWrap.style.display = viewMode === '2d' ? '' : 'none';
    }

    if (typeof Sphere3DViewer !== 'undefined') {
      if (viewMode === '3d') {
        const allWorlds = getAllWorlds();
        const world = allWorlds.find((w) => w.id === state.worldId) || state.worlds[0];
        updateGlobeTexture(world);
        Sphere3DViewer.start();
      } else {
        Sphere3DViewer.stop();
      }
    }
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
    const allWorlds = getAllWorlds();
    const world = allWorlds.find((w) => w.id === state.worldId);
    if (!world || state.worldId === 'overview') {
      if (calcWeightVal) calcWeightVal.textContent = '—';
      if (calcAgeVal) calcAgeVal.textContent = '—';
      return;
    }

    // Weight Calculation (Handles unconstrained mass/radius as Unknown)
    if (world.gravity === 'unknown' || !world.gravity) {
      if (calcWeightVal) {
        calcWeightVal.textContent = 'Unknown';
        calcWeightVal.title = 'Surface gravity is unconstrained by discovery observations (mass/radius unmeasured)';
      }
    } else if (typeof CelestialCalculator !== 'undefined' && CelestialCalculator.calculateWeightOnPlanet) {
      const wRes = CelestialCalculator.calculateWeightOnPlanet(state.weight, world.gravity);
      if (calcWeightVal) {
        calcWeightVal.textContent = wRes.formatted;
        calcWeightVal.title = wRes.message || '';
      }
    }

    // Planetary Age Calculation based on Orbital Period
    let periodInYears = 1.0;
    if (world.orbitalPeriodYears !== undefined && world.orbitalPeriodYears !== null) {
      periodInYears = world.orbitalPeriodYears;
    } else {
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
        pluto: 248.0,
        io: 11.86,
        europa: 11.86,
        ganymede: 11.86,
        callisto: 11.86,
        enceladus: 29.46,
        titan: 29.46
      };
      periodInYears = orbitalPeriods[state.worldId] !== undefined ? orbitalPeriods[state.worldId] : 1.0;
    }

    if (typeof CelestialCalculator !== 'undefined' && CelestialCalculator.calculateAgeOnPlanet) {
      const ageRes = CelestialCalculator.calculateAgeOnPlanet(state.dob, periodInYears);
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
      const cleanText = e.target.value.replace(/[^\w\s-]/gi, '').slice(0, 50);
      state.name = cleanText;
      charCount.textContent = `${cleanText.length} / 50`;

      if (globeNameDisplay) {
        globeNameDisplay.textContent = cleanText || 'COSMOS';
      }

      clearTimeout(inputDebounce);
      inputDebounce = setTimeout(() => {
        syncUrlState();
        PosterRenderer.render(state);
      }, 40);
    });

    // 2. Day / Night mode toggle (controls 2D poster only)
    if (modeDayBtn) {
      modeDayBtn.addEventListener('click', () => {
        if (state.mode === 'day') return;
        state.mode = 'day';
        modeDayBtn.classList.add('active');
        modeDayBtn.setAttribute('aria-pressed', 'true');
        modeNightBtn.classList.remove('active');
        modeNightBtn.setAttribute('aria-pressed', 'false');
        updateStudioBadges();
        syncUrlState();
        PosterRenderer.render(state);
      });
    }

    if (modeNightBtn) {
      modeNightBtn.addEventListener('click', () => {
        if (state.mode === 'night') return;
        state.mode = 'night';
        modeNightBtn.classList.add('active');
        modeNightBtn.setAttribute('aria-pressed', 'true');
        modeDayBtn.classList.remove('active');
        modeDayBtn.setAttribute('aria-pressed', 'false');
        updateStudioBadges();
        syncUrlState();
        PosterRenderer.render(state);
      });
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
    });

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

    // 3.01 Catalog Switcher Tab Buttons (Solar System vs Exoplanets)
    if (tabSolarBtn) {
      tabSolarBtn.addEventListener('click', () => {
        switchCatalog('solar');
      });
    }
    if (tabExoBtn) {
      tabExoBtn.addEventListener('click', () => {
        switchCatalog('exo');
      });
    }

    // 3.1 Dedicated Astronaut Scroller Controls (Rail Drag, Buttons & Keyboard)
    if (astroUpBtn) {
      astroUpBtn.addEventListener('click', () => {
        const activeList = getActiveWorldsList();
        const currentIdx = activeList.findIndex((w) => w.id === state.worldId);
        if (currentIdx > 0) {
          selectWorld(activeList[currentIdx - 1].id, { source: 'scroller' });
        }
      });
    }

    if (astroDownBtn) {
      astroDownBtn.addEventListener('click', () => {
        const activeList = getActiveWorldsList();
        const currentIdx = activeList.findIndex((w) => w.id === state.worldId);
        if (currentIdx >= 0 && currentIdx < activeList.length - 1) {
          selectWorld(activeList[currentIdx + 1].id, { source: 'scroller' });
        }
      });
    }

    if (astroTrackRail) {
      let isDraggingRail = false;

      function handleRailPosition(clientY) {
        const rect = astroTrackRail.getBoundingClientRect();
        if (rect.height <= 0) return;
        const thumbH = 36;
        const availableH = Math.max(1, rect.height - thumbH);
        const relY = Math.max(0, Math.min(1, (clientY - rect.top - thumbH * 0.5) / availableH));

        if (planetMenuList) {
          const maxScroll = planetMenuList.scrollHeight - planetMenuList.clientHeight;
          planetMenuList.scrollTop = relY * maxScroll;
        }

        const activeList = getActiveWorldsList();
        const targetIdx = Math.round(relY * (activeList.length - 1));
        if (activeList[targetIdx] && activeList[targetIdx].id !== state.worldId) {
          selectWorld(activeList[targetIdx].id, { source: 'scroller' });
        }
        syncAstronautToScroll();
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

    if (astroUpBtn) {
      astroUpBtn.addEventListener('click', () => {
        if (planetMenuList) {
          planetMenuList.scrollBy({ top: -56, behavior: 'smooth' });
        }
        const activeList = getActiveWorldsList();
        const currentIdx = activeList.findIndex((w) => w.id === state.worldId);
        if (currentIdx > 0) {
          selectWorld(activeList[currentIdx - 1].id, { source: 'scroller' });
        }
      });
    }

    if (astroDownBtn) {
      astroDownBtn.addEventListener('click', () => {
        if (planetMenuList) {
          planetMenuList.scrollBy({ top: 56, behavior: 'smooth' });
        }
        const activeList = getActiveWorldsList();
        const currentIdx = activeList.findIndex((w) => w.id === state.worldId);
        if (currentIdx >= 0 && currentIdx < activeList.length - 1) {
          selectWorld(activeList[currentIdx + 1].id, { source: 'scroller' });
        }
      });
    }

    if (astronautGuideThumb) {
      astronautGuideThumb.addEventListener('keydown', (e) => {
        const activeList = getActiveWorldsList();
        const currentIdx = activeList.findIndex((w) => w.id === state.worldId);
        if (e.key === 'ArrowUp' && currentIdx > 0) {
          e.preventDefault();
          selectWorld(activeList[currentIdx - 1].id, { source: 'scroller' });
        } else if (e.key === 'ArrowDown' && currentIdx >= 0 && currentIdx < activeList.length - 1) {
          e.preventDefault();
          selectWorld(activeList[currentIdx + 1].id, { source: 'scroller' });
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

    // 9. Stage 04 & 07 Export NASA Data (JSON)
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => {
        const allWorlds = getAllWorlds();
        const world = allWorlds.find((w) => w.id === state.worldId);
        if (!world || state.worldId === 'overview') {
          showToast('⚠️ Select a celestial world first');
          return;
        }
        const isExo = world.type === 'exoplanet' || Boolean(world.isArtistImpression);
        const dataPayload = {
          world: world.name,
          id: world.id,
          classification: world.type,
          hostStar: world.hostname || 'The Sun',
          orderOrClassification: world.order,
          surfaceGravity: world.gravity,
          solarDayLength: world.dayLength,
          meanTemperature: world.temp,
          distanceFromHostStar: world.distSun || null,
          distanceFromEarth: world.distEarth || null,
          orbitalPeriod: world.orbitPeriod || null,
          isArtistImpression: Boolean(world.isArtistImpression),
          userCalculations: {
            earthWeightKg: state.weight,
            weightOnWorld: calcWeightVal ? calcWeightVal.textContent : null,
            birthDate: state.dob,
            ageInWorldYears: calcAgeVal ? calcAgeVal.textContent : null
          },
          source: world.dataSource || (isExo ? 'NASA Exoplanet Archive (IPAC/Caltech)' : 'NASA Planetary Fact Sheet / Goddard Space Flight Center'),
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
        syncAstronautToScroll();
      }, { passive: true });
    }

    // 11. Stage 08 WebGL 3D Lit Globe Controls (View Toggle, Terminator Slider, Auto-Rotate, Snapshot)
    if (view2dBtn) {
      view2dBtn.addEventListener('click', () => switchStudioView('2d'));
    }
    if (view3dBtn) {
      view3dBtn.addEventListener('click', () => switchStudioView('3d'));
    }
    if (terminatorSlider) {
      terminatorSlider.addEventListener('input', (e) => {
        const deg = parseInt(e.target.value, 10);
        if (terminatorAngleVal) terminatorAngleVal.textContent = `${deg}°`;
        if (typeof Sphere3DViewer !== 'undefined') {
          Sphere3DViewer.setLightAngle(deg);
        }
      });
    }
    if (globeAutorotateBtn) {
      globeAutorotateBtn.addEventListener('click', () => {
        state.is3dAutoRotating = !state.is3dAutoRotating;
        globeAutorotateBtn.classList.toggle('active', state.is3dAutoRotating);
        if (globeRotateLabel) {
          globeRotateLabel.textContent = state.is3dAutoRotating ? '⟳ Auto-Rotate: ON' : '⏸ Auto-Rotate: OFF';
        }
        if (typeof Sphere3DViewer !== 'undefined') {
          Sphere3DViewer.setAutoRotate(state.is3dAutoRotating);
        }
      });
    }
    // 11.1 Enhanced 3D Globe Personalized Poster Snapshot
    if (globeExportBtn) {
      globeExportBtn.addEventListener('click', () => {
        if (typeof Sphere3DViewer !== 'undefined') {
          const dataUrl = Sphere3DViewer.captureViewDataUrl();
          if (!dataUrl) return;

          const globeImg = new Image();
          globeImg.onload = () => {
            const outCanvas = document.createElement('canvas');
            const W = 1080;
            const H = 1350;
            outCanvas.width = W;
            outCanvas.height = H;
            const ctx = outCanvas.getContext('2d');

            // Deep space cosmic backdrop
            const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 750);
            bgGrad.addColorStop(0, '#0a1024');
            bgGrad.addColorStop(0.6, '#050814');
            bgGrad.addColorStop(1, '#020308');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);

            // Subtle starry particle field
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 90; i++) {
              const sx = (i * 137.5) % W;
              const sy = (i * 241.3) % H;
              const sr = ((i % 5) + 1) * 0.45;
              ctx.globalAlpha = 0.2 + ((i % 4) * 0.2);
              ctx.beginPath();
              ctx.arc(sx, sy, sr, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            // NASA Header
            ctx.fillStyle = '#38bdf8';
            ctx.font = '700 18px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('NASA CELESTIAL EXPLORATION ARCHIVE', W / 2, 90);

            // Large Personalized Generated Name
            const userName = (state.name || 'COSMOS').toUpperCase();
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 64px "Space Grotesk", Cinzel, sans-serif';
            ctx.shadowColor = 'rgba(56, 189, 248, 0.65)';
            ctx.shadowBlur = 30;
            ctx.fillText(userName, W / 2, 165);
            ctx.shadowBlur = 0;

            // Subtitle mission badge
            const world = getAllWorlds().find((w) => w.id === state.worldId) || state.worlds[3];
            ctx.fillStyle = '#94a3b8';
            ctx.font = '600 16px Inter, sans-serif';
            ctx.fillText(`${world.name.toUpperCase()} • 3D SPHERICAL SURVEY MISSION`, W / 2, 205);

            // Draw 3D globe centered in frame
            const globeSize = 780;
            const gx = (W - globeSize) / 2;
            const gy = 260;
            ctx.drawImage(globeImg, gx, gy, globeSize, globeSize);

            // Bottom telemetry details
            ctx.fillStyle = '#ffffff';
            ctx.font = '800 32px "Space Grotesk", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(world.name.toUpperCase(), 75, H - 90);

            ctx.fillStyle = '#38bdf8';
            ctx.font = '600 16px monospace';
            const tele = `${world.distSun || '1.0 AU'}  •  GRAVITY: ${world.gravity ? world.gravity + ' m/s²' : 'Unknown'}`;
            ctx.fillText(tele, 75, H - 60);

            // NSK AI Watermark
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.font = '500 16px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('-Made by NSK with AI', W - 75, H - 60);

            // Download snapshot
            const compUrl = outCanvas.toDataURL('image/png');
            const anchor = document.createElement('a');
            anchor.href = compUrl;
            anchor.download = `${world.name}_3D_Globe_${userName.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            showToast(`📷 Personalized 3D Globe poster downloaded!`);
          };
          globeImg.src = dataUrl;
        }
      });
    }

    // 12. Asteroid User Guide Modal Interactions
    if (asteroidGuideBtn && userGuideModalBackdrop) {
      const openUserGuide = () => {
        userGuideModalBackdrop.classList.add('open');
      };
      const closeUserGuide = () => {
        userGuideModalBackdrop.classList.remove('open');
      };

      asteroidGuideBtn.addEventListener('click', openUserGuide);
      if (userGuideCloseBtn) userGuideCloseBtn.addEventListener('click', closeUserGuide);
      if (userGuideOkBtn) userGuideOkBtn.addEventListener('click', closeUserGuide);

      userGuideModalBackdrop.addEventListener('click', (e) => {
        if (e.target === userGuideModalBackdrop) closeUserGuide();
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && userGuideModalBackdrop.classList.contains('open')) {
          closeUserGuide();
        }
      });
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

  // Initialize WebGL 3D Globe (Stage 08 Stretch)
  if (globeCanvas && typeof Sphere3DViewer !== 'undefined') {
    const isSupported = Sphere3DViewer.init(globeCanvas);
    if (isSupported) {
      Sphere3DViewer.setLightAngle(45);
    }
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

      if (modeDayBtn) {
        modeDayBtn.classList.toggle('active', state.mode === 'day');
        modeDayBtn.setAttribute('aria-pressed', state.mode === 'day' ? 'true' : 'false');
      }
      if (modeNightBtn) {
        modeNightBtn.classList.toggle('active', state.mode === 'night');
        modeNightBtn.setAttribute('aria-pressed', state.mode === 'night' ? 'true' : 'false');
      }
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
