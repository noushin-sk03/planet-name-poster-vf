/**
 * skies.js - Planetary Skies Configuration & Data-Driven Rendering Engine
 * ------------------------------------------------------------------------
 * Educational Pair-Programming Project: "Planet Name Poster"
 * 
 * Scientific Foundation:
 * Each sky configuration is constructed based on real planetary physics,
 * atmospheric composition, and imagery returned by NASA & international missions
 * (Apollo, Viking, Curiosity, Perseverance, Venera, Cassini, Voyager 2, New Horizons).
 * 
 * Single Data-Driven Renderer:
 * `drawPlanetSky(ctx, skyData, mode, width, height)` renders any celestial world's
 * day or night sky using a unified parametric drawing pipeline.
 */

const SkiesManager = (() => {
  // ---------------------------------------------------------------------------
  // 1. Planetary Skies Data Configuration
  // ---------------------------------------------------------------------------
  const SKIES = {
    // -------------------------------------------------------------------------
    // THE SUN
    // -------------------------------------------------------------------------
    sun: {
      name: 'The Sun',
      font: '"Cinzel", Georgia, serif',
      fontLetterSpacing: '0.08em',
      day: {
        type: 'artist-impression',
        badge: "Artist's Impression (Photosphere Plasma)",
        gradient: [
          { stop: 0, color: '#fef08a' },
          { stop: 0.35, color: '#f59e0b' },
          { stop: 0.75, color: '#b45309' },
          { stop: 1, color: '#451a03' }
        ],
        sun: { show: true, x: 0.5, y: 0.35, radius: 95, coreColor: '#ffffff', glowColor: 'rgba(254, 240, 138, 0.7)' },
        stars: { show: false },
        haze: { color: 'rgba(245, 158, 11, 0.45)', intensity: 0.7 },
        horizon: { show: true, type: 'plasma', color: '#7c2d12', heightRatio: 0.28 },
        notes: 'Solar photosphere with bubbling magnetic granulation cells and prominence flares.'
      },
      night: {
        type: 'artist-impression',
        badge: "Artist's Impression (Solar Corona Streams)",
        gradient: [
          { stop: 0, color: '#172554' },
          { stop: 0.45, color: '#0f172a' },
          { stop: 1, color: '#020617' }
        ],
        sun: { show: true, x: 0.5, y: 0.4, radius: 45, coreColor: '#020617', glowColor: 'rgba(147, 197, 253, 0.75)', isEclipse: true },
        stars: { show: true, count: 180, alpha: 0.8 },
        haze: { color: 'rgba(56, 189, 248, 0.25)', intensity: 0.4 },
        horizon: { show: true, type: 'corona', color: '#090d16', heightRatio: 0.2 },
        notes: 'Solar eclipse view showing high-temperature coronal magnetic streamers against deep space.'
      }
    },

    // -------------------------------------------------------------------------
    // MERCURY
    // -------------------------------------------------------------------------
    mercury: {
      name: 'Mercury',
      font: '"Space Grotesk", sans-serif',
      fontLetterSpacing: '0.04em',
      day: {
        type: 'photographic-basis',
        badge: "Airless Sky (NASA MESSENGER Data)",
        gradient: [
          { stop: 0, color: '#000000' },
          { stop: 0.65, color: '#050508' },
          { stop: 1, color: '#090b10' }
        ],
        sun: { show: true, x: 0.5, y: 0.28, radius: 65, coreColor: '#ffffff', glowColor: 'rgba(255, 255, 255, 0.9)' },
        stars: { show: true, count: 130, alpha: 0.55 },
        haze: { color: 'rgba(255, 255, 255, 0.05)', intensity: 0.1 },
        horizon: { show: true, type: 'craters', color: '#475569', secondaryColor: '#1e293b', heightRatio: 0.28 },
        notes: 'Airless exosphere produces a pitch-black sky with an enormous blinding Sun (3x larger than from Earth).'
      },
      night: {
        type: 'photographic-basis',
        badge: "Airless Night (NASA MESSENGER Data)",
        gradient: [
          { stop: 0, color: '#000000' },
          { stop: 1, color: '#030305' }
        ],
        sun: { show: false },
        stars: { show: true, count: 260, alpha: 0.95, milkyWay: true },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'craters', color: '#1e293b', secondaryColor: '#090d16', heightRatio: 0.28 },
        notes: 'Unfiltered deep-space starfield across rugged cratered terrain dropping to -180 °C.'
      }
    },

    // -------------------------------------------------------------------------
    // VENUS
    // -------------------------------------------------------------------------
    venus: {
      name: 'Venus',
      font: '"Playfair Display", Georgia, serif',
      fontLetterSpacing: '0.05em',
      day: {
        type: 'photographic-basis',
        badge: "Overcast Atmosphere (Soviet Venera / Magellan)",
        gradient: [
          { stop: 0, color: '#b45309' },
          { stop: 0.4, color: '#d97706' },
          { stop: 0.8, color: '#f59e0b' },
          { stop: 1, color: '#78350f' }
        ],
        sun: { show: true, x: 0.5, y: 0.35, radius: 90, coreColor: 'rgba(254, 243, 199, 0.45)', glowColor: 'rgba(245, 158, 11, 0.35)', isDiffused: true },
        stars: { show: false },
        haze: { color: 'rgba(217, 119, 6, 0.65)', intensity: 0.85 },
        horizon: { show: true, type: 'volcanic', color: '#573312', secondaryColor: '#301b0b', heightRatio: 0.3 },
        notes: '92-bar carbon dioxide and sulfuric acid clouds scatter sunlight into an ominous orange-amber gloom.'
      },
      night: {
        type: 'artist-impression',
        badge: "Artist's Impression (Infrared Night Airglow)",
        gradient: [
          { stop: 0, color: '#170c04' },
          { stop: 0.6, color: '#271202' },
          { stop: 1, color: '#451a03' }
        ],
        sun: { show: false },
        stars: { show: false },
        haze: { color: 'rgba(180, 83, 9, 0.35)', intensity: 0.5 },
        horizon: { show: true, type: 'volcanic', color: '#1f0d02', secondaryColor: '#120701', heightRatio: 0.3 },
        notes: 'Dense clouds blot out all stars; the superheated 464 °C basalt rocks faintly glow in thermal infrared.'
      }
    },

    // -------------------------------------------------------------------------
    // EARTH
    // -------------------------------------------------------------------------
    earth: {
      name: 'Earth',
      font: '"Cinzel", Georgia, serif',
      fontLetterSpacing: '0.06em',
      day: {
        type: 'photographic',
        badge: "Rayleigh Atmosphere (NASA Ground Observation)",
        gradient: [
          { stop: 0, color: '#0284c7' },
          { stop: 0.5, color: '#38bdf8' },
          { stop: 0.85, color: '#bae6fd' },
          { stop: 1, color: '#e0f2fe' }
        ],
        sun: { show: true, x: 0.5, y: 0.28, radius: 24, coreColor: '#ffffff', glowColor: 'rgba(254, 240, 138, 0.8)' },
        stars: { show: false },
        haze: { color: 'rgba(224, 242, 254, 0.45)', intensity: 0.35 },
        horizon: { show: true, type: 'ocean', color: '#0369a1', secondaryColor: '#075985', heightRatio: 0.26 },
        notes: 'Nitrogen-oxygen Rayleigh scattering produces the familiar bright blue sky and golden sun.'
      },
      night: {
        type: 'photographic',
        badge: "Starry Night & Moon (NASA Visible Earth)",
        gradient: [
          { stop: 0, color: '#020617' },
          { stop: 0.55, color: '#090d16' },
          { stop: 1, color: '#0f172a' }
        ],
        sun: { show: false },
        stars: { show: true, count: 240, alpha: 0.9, milkyWay: true },
        companion: { show: true, name: 'Moon', x: 0.76, y: 0.25, radius: 16, color: '#f1f5f9', glowColor: 'rgba(241, 245, 249, 0.4)' },
        haze: { color: 'rgba(15, 23, 42, 0.3)', intensity: 0.2 },
        horizon: { show: true, type: 'ocean', color: '#031024', secondaryColor: '#020814', heightRatio: 0.26 },
        notes: 'Clear nocturnal atmosphere revealing constellations, the galactic band, and the luminous lunar companion.'
      }
    },

    // -------------------------------------------------------------------------
    // THE MOON
    // -------------------------------------------------------------------------
    moon: {
      name: 'The Moon',
      font: '"Cormorant Garamond", Georgia, serif',
      fontLetterSpacing: '0.07em',
      day: {
        type: 'photographic',
        badge: "Airless Lunar Surface (Apollo Photography)",
        gradient: [
          { stop: 0, color: '#000000' },
          { stop: 0.7, color: '#020204' },
          { stop: 1, color: '#06070a' }
        ],
        sun: { show: true, x: 0.32, y: 0.28, radius: 24, coreColor: '#ffffff', glowColor: 'rgba(255, 255, 255, 0.95)' },
        companion: { show: true, name: 'Earth', x: 0.72, y: 0.3, radius: 26, color: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.65)', isEarthrise: true },
        stars: { show: true, count: 90, alpha: 0.4 },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'regolith', color: '#64748b', secondaryColor: '#334155', heightRatio: 0.3 },
        notes: 'Pitch-black sky from an airless world; brilliant Earth hangs overhead in perpetual Earthrise.'
      },
      night: {
        type: 'photographic',
        badge: "Earthshine Night (Apollo / LRO Data)",
        gradient: [
          { stop: 0, color: '#000000' },
          { stop: 1, color: '#020306' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Earth', x: 0.5, y: 0.25, radius: 32, color: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.8)', isEarthrise: true },
        stars: { show: true, count: 280, alpha: 0.95, milkyWay: true },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'regolith', color: '#1e293b', secondaryColor: '#0f172a', heightRatio: 0.3 },
        notes: 'Nightside illuminated by brilliant blue Earthshine (40x brighter than full Moon seen from Earth).'
      }
    },

    // -------------------------------------------------------------------------
    // MARS
    // -------------------------------------------------------------------------
    mars: {
      name: 'Mars',
      font: '"Syne", sans-serif',
      fontLetterSpacing: '0.05em',
      day: {
        type: 'photographic',
        badge: "Airborne Iron Dust (NASA Curiosity / Perseverance)",
        gradient: [
          { stop: 0, color: '#b45309' },
          { stop: 0.45, color: '#d97706' },
          { stop: 0.8, color: '#f59e0b' },
          { stop: 1, color: '#fed7aa' }
        ],
        sun: { show: true, x: 0.5, y: 0.3, radius: 16, coreColor: '#ffffff', glowColor: 'rgba(147, 197, 253, 0.6)', hasBlueHalo: true },
        stars: { show: false },
        haze: { color: 'rgba(217, 119, 6, 0.45)', intensity: 0.55 },
        horizon: { show: true, type: 'dunes', color: '#c2410c', secondaryColor: '#7c2d12', heightRatio: 0.28 },
        notes: 'Butterscotch sky tinted by suspended ferric oxide dust; blue scattering halo hugs the smaller Sun.'
      },
      night: {
        type: 'photographic',
        badge: "Thin Atmosphere Night (NASA Rover Imagery)",
        gradient: [
          { stop: 0, color: '#030308' },
          { stop: 0.55, color: '#0a0a14' },
          { stop: 1, color: '#120e1c' }
        ],
        sun: { show: false },
        stars: { show: true, count: 250, alpha: 0.9, milkyWay: true },
        companion: { show: true, name: 'Phobos', x: 0.7, y: 0.28, radius: 4, color: '#cbd5e1' },
        haze: { color: 'rgba(18, 14, 28, 0.25)', intensity: 0.2 },
        horizon: { show: true, type: 'dunes', color: '#431407', secondaryColor: '#1c0702', heightRatio: 0.28 },
        notes: 'Ultra-clear thin air allows sharp starfields and swift Martian moon Phobos crossing overhead.'
      }
    },

    // -------------------------------------------------------------------------
    // JUPITER
    // -------------------------------------------------------------------------
    jupiter: {
      name: 'Jupiter',
      font: '"Cinzel", Georgia, serif',
      fontLetterSpacing: '0.06em',
      day: {
        type: 'artist-impression',
        badge: "Artist's Impression (Ammonia Cloud Deck - Juno)",
        gradient: [
          { stop: 0, color: '#78350f' },
          { stop: 0.35, color: '#9a3412' },
          { stop: 0.7, color: '#c2410c' },
          { stop: 1, color: '#fb923c' }
        ],
        sun: { show: true, x: 0.5, y: 0.25, radius: 8, coreColor: '#ffffff', glowColor: 'rgba(254, 240, 138, 0.6)' },
        stars: { show: false },
        haze: { color: 'rgba(194, 65, 12, 0.5)', intensity: 0.65 },
        horizon: { show: true, type: 'gas-bands', color: '#9a3412', secondaryColor: '#451a03', heightRatio: 0.38 },
        notes: 'View from the 1-bar ammonia cloud deck looking across immense swirling jet streams under a distant pinpoint Sun.'
      },
      night: {
        type: 'artist-impression',
        badge: "Artist's Impression (Jovian Lightning & Aurora)",
        gradient: [
          { stop: 0, color: '#0a0a16' },
          { stop: 0.5, color: '#17122a' },
          { stop: 1, color: '#261738' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Io', x: 0.72, y: 0.28, radius: 8, color: '#eab308' },
        stars: { show: true, count: 180, alpha: 0.75 },
        haze: { color: 'rgba(147, 51, 234, 0.2)', intensity: 0.4 },
        horizon: { show: true, type: 'gas-bands', color: '#1a102b', secondaryColor: '#0a0614', heightRatio: 0.38, hasLightning: true },
        notes: 'Massive atmospheric lightning bolts flash deep within water clouds beneath polar ultraviolet auroras.'
      }
    },

    // -------------------------------------------------------------------------
    // SATURN
    // -------------------------------------------------------------------------
    saturn: {
      name: 'Saturn',
      font: '"Playfair Display", Georgia, serif',
      fontLetterSpacing: '0.05em',
      day: {
        type: 'artist-impression',
        badge: "Artist's Impression (Cassini Ring-Sky Horizon)",
        gradient: [
          { stop: 0, color: '#713f12' },
          { stop: 0.4, color: '#854d0e' },
          { stop: 0.75, color: '#ca8a04' },
          { stop: 1, color: '#fde047' }
        ],
        sun: { show: true, x: 0.5, y: 0.26, radius: 6, coreColor: '#ffffff', glowColor: 'rgba(254, 240, 138, 0.5)' },
        rings: { show: true, color: 'rgba(254, 240, 138, 0.7)', innerColor: 'rgba(250, 204, 21, 0.45)' },
        stars: { show: false },
        haze: { color: 'rgba(202, 138, 4, 0.45)', intensity: 0.6 },
        horizon: { show: true, type: 'gas-bands', color: '#854d0e', secondaryColor: '#3a2007', heightRatio: 0.34 },
        notes: 'Colossal icy rings arch overhead as a glittering celestial bridge spanning from horizon to horizon.'
      },
      night: {
        type: 'artist-impression',
        badge: "Artist's Impression (Ringshine Nocturne - Cassini)",
        gradient: [
          { stop: 0, color: '#090812' },
          { stop: 0.5, color: '#151322' },
          { stop: 1, color: '#252033' }
        ],
        sun: { show: false },
        rings: { show: true, color: 'rgba(254, 240, 138, 0.65)', innerColor: 'rgba(217, 119, 6, 0.35)', isGlowing: true },
        stars: { show: true, count: 210, alpha: 0.8 },
        haze: { color: 'rgba(161, 98, 7, 0.15)', intensity: 0.3 },
        horizon: { show: true, type: 'gas-bands', color: '#1c172b', secondaryColor: '#0a0812', heightRatio: 0.34 },
        notes: 'Nightside cloud tops are illuminated by radiant ringshine reflecting off billions of ice particles.'
      }
    },

    // -------------------------------------------------------------------------
    // URANUS
    // -------------------------------------------------------------------------
    uranus: {
      name: 'Uranus',
      font: '"Outfit", sans-serif',
      fontLetterSpacing: '0.04em',
      day: {
        type: 'artist-impression',
        badge: "Artist's Impression (Methane Haze - Voyager 2)",
        gradient: [
          { stop: 0, color: '#042f2e' },
          { stop: 0.4, color: '#0f766e' },
          { stop: 0.8, color: '#14b8a6' },
          { stop: 1, color: '#5eead4' }
        ],
        sun: { show: true, x: 0.5, y: 0.28, radius: 4, coreColor: '#ffffff', glowColor: 'rgba(204, 251, 241, 0.6)' },
        stars: { show: false },
        haze: { color: 'rgba(20, 184, 166, 0.4)', intensity: 0.5 },
        horizon: { show: true, type: 'methane-ice', color: '#0d9488', secondaryColor: '#115e59', heightRatio: 0.3 },
        notes: 'Atmospheric methane strongly absorbs red light, scattering a serene pale cyan haze under a dim pinpoint Sun.'
      },
      night: {
        type: 'artist-impression',
        badge: "Artist's Impression (Tilted Ring Arc Nocturne)",
        gradient: [
          { stop: 0, color: '#021817' },
          { stop: 0.6, color: '#062624' },
          { stop: 1, color: '#083344' }
        ],
        sun: { show: false },
        rings: { show: true, isVertical: true, color: 'rgba(94, 234, 212, 0.45)' },
        stars: { show: true, count: 230, alpha: 0.85 },
        haze: { color: 'rgba(15, 118, 110, 0.2)', intensity: 0.25 },
        horizon: { show: true, type: 'methane-ice', color: '#042f2e', secondaryColor: '#021817', heightRatio: 0.3 },
        notes: 'Extreme 98° axial tilt creates 42-year dark polar nights, with narrow dark rings slicing the starfield.'
      }
    },

    // -------------------------------------------------------------------------
    // NEPTUNE
    // -------------------------------------------------------------------------
    neptune: {
      name: 'Neptune',
      font: '"Space Grotesk", sans-serif',
      fontLetterSpacing: '0.04em',
      day: {
        type: 'artist-impression',
        badge: "Artist's Impression (Deep Azure & Cirrus - Voyager 2)",
        gradient: [
          { stop: 0, color: '#02143b' },
          { stop: 0.4, color: '#1e3a8a' },
          { stop: 0.75, color: '#2563eb' },
          { stop: 1, color: '#60a5fa' }
        ],
        sun: { show: true, x: 0.5, y: 0.26, radius: 3, coreColor: '#ffffff', glowColor: 'rgba(191, 219, 254, 0.7)' },
        clouds: { show: true, type: 'cirrus', color: 'rgba(255, 255, 255, 0.55)' },
        stars: { show: false },
        haze: { color: 'rgba(37, 99, 235, 0.35)', intensity: 0.45 },
        horizon: { show: true, type: 'supersonic-clouds', color: '#1d4ed8', secondaryColor: '#1e3a8a', heightRatio: 0.32 },
        notes: 'Electric azure sky whipped by supersonic 2,000 km/h winds, carrying bright white methane-ice cirrus streaks.'
      },
      night: {
        type: 'artist-impression',
        badge: "Artist's Impression (Triton Transit Nocturne)",
        gradient: [
          { stop: 0, color: '#020617' },
          { stop: 0.6, color: '#051129' },
          { stop: 1, color: '#0a1d47' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Triton', x: 0.68, y: 0.3, radius: 10, color: '#fbcfe8', glowColor: 'rgba(244, 114, 182, 0.4)' },
        stars: { show: true, count: 240, alpha: 0.9 },
        haze: { color: 'rgba(30, 58, 138, 0.2)', intensity: 0.25 },
        horizon: { show: true, type: 'supersonic-clouds', color: '#0c1b42', secondaryColor: '#050c1f', heightRatio: 0.32 },
        notes: 'Deep cobalt night sky illuminated by retrograde cryovolcanic moon Triton and delicate high-altitude auroral curtains.'
      }
    },

    // -------------------------------------------------------------------------
    // PLUTO
    // -------------------------------------------------------------------------
    pluto: {
      name: 'Pluto',
      font: '"Cormorant Garamond", Georgia, serif',
      fontLetterSpacing: '0.06em',
      day: {
        type: 'artist-impression',
        badge: "Artist's Impression (Blue Haze Rings - New Horizons)",
        gradient: [
          { stop: 0, color: '#020308' },
          { stop: 0.55, color: '#09152e' },
          { stop: 0.85, color: '#172554' },
          { stop: 1, color: '#38bdf8' }
        ],
        sun: { show: true, x: 0.5, y: 0.28, radius: 3, coreColor: '#ffffff', glowColor: 'rgba(186, 230, 253, 0.8)' },
        stars: { show: true, count: 160, alpha: 0.65 },
        haze: { color: 'rgba(56, 189, 248, 0.4)', intensity: 0.5 },
        horizon: { show: true, type: 'nitrogen-ice', color: '#fed7aa', secondaryColor: '#7c2d12', heightRatio: 0.28 },
        notes: 'Photographed by New Horizons: layered blue atmospheric haze rings hug rugged water-ice mountains and nitrogen plains.'
      },
      night: {
        type: 'artist-impression',
        badge: "Artist's Impression (Charonshine Nocturne)",
        gradient: [
          { stop: 0, color: '#000000' },
          { stop: 0.8, color: '#020307' },
          { stop: 1, color: '#050811' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Charon', x: 0.5, y: 0.24, radius: 20, color: '#94a3b8', glowColor: 'rgba(148, 163, 184, 0.35)' },
        stars: { show: true, count: 280, alpha: 0.95, milkyWay: true },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'nitrogen-ice', color: '#1e293b', secondaryColor: '#090d16', heightRatio: 0.28 },
        notes: 'Tidally locked Charon hangs fixed in the sky, casting faint silver Charonshine across frozen nitrogen plains.'
      }
    },

    // -------------------------------------------------------------------------
    // IO (Jupiter's Volcanic Moon I)
    // -------------------------------------------------------------------------
    io: {
      name: 'Io',
      font: '"Cinzel", Georgia, serif',
      fontLetterSpacing: '0.06em',
      day: {
        type: 'photographic-basis',
        badge: 'Volcanic Calderas (NASA Galileo & Juno Data)',
        gradient: [
          { stop: 0, color: '#1c1917' },
          { stop: 0.5, color: '#292524' },
          { stop: 1, color: '#451a03' }
        ],
        sun: { show: true, x: 0.25, y: 0.22, radius: 24, coreColor: '#ffffff', glowColor: 'rgba(253, 224, 71, 0.6)' },
        companion: { show: true, name: 'Jupiter', x: 0.72, y: 0.32, radius: 56, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.45)' },
        stars: { show: true, count: 180, alpha: 0.7 },
        haze: { color: 'rgba(234, 179, 8, 0.15)', intensity: 0.3 },
        horizon: { show: true, type: 'volcanic', color: '#b45309', secondaryColor: '#451a03', heightRatio: 0.3 },
        notes: 'Airless sulfur sky dominated by giant banded Jupiter, with sulfur dioxide frost and active volcanic calderas.'
      },
      night: {
        type: 'photographic-basis',
        badge: 'Jovianshine Twilight (NASA Galileo Data)',
        gradient: [
          { stop: 0, color: '#09080d' },
          { stop: 1, color: '#170c06' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Jupiter', x: 0.72, y: 0.32, radius: 56, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.55)' },
        stars: { show: true, count: 240, alpha: 0.9, milkyWay: true },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'volcanic', color: '#451a03', secondaryColor: '#1c1917', heightRatio: 0.3 },
        notes: 'Giant Jupiter bathes the dark volcanic sulfur plains in brilliant golden Jovianshine.'
      }
    },

    // -------------------------------------------------------------------------
    // EUROPA (Jupiter's Ocean Ice Moon II)
    // -------------------------------------------------------------------------
    europa: {
      name: 'Europa',
      font: '"Playfair Display", Georgia, serif',
      fontLetterSpacing: '0.05em',
      day: {
        type: 'photographic-basis',
        badge: 'Ice Shell Lithosphere (NASA Galileo / Clipper)',
        gradient: [
          { stop: 0, color: '#020617' },
          { stop: 0.6, color: '#08142c' },
          { stop: 1, color: '#0c2340' }
        ],
        sun: { show: true, x: 0.28, y: 0.24, radius: 22, coreColor: '#ffffff', glowColor: 'rgba(186, 230, 253, 0.65)' },
        companion: { show: true, name: 'Jupiter', x: 0.70, y: 0.30, radius: 52, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.4)' },
        stars: { show: true, count: 200, alpha: 0.8 },
        haze: { color: 'rgba(56, 189, 248, 0.1)', intensity: 0.2 },
        horizon: { show: true, type: 'ocean', color: '#38bdf8', secondaryColor: '#0369a1', heightRatio: 0.26 },
        notes: 'Deep airless sky over cracked water-ice plains and reddish lineae, with giant Jupiter hanging permanently in the sky.'
      },
      night: {
        type: 'photographic-basis',
        badge: 'Jovianshine Ice Plains (NASA Galileo Data)',
        gradient: [
          { stop: 0, color: '#020306' },
          { stop: 1, color: '#030814' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Jupiter', x: 0.70, y: 0.30, radius: 52, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.5)' },
        stars: { show: true, count: 260, alpha: 0.95, milkyWay: true },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'ocean', color: '#075985', secondaryColor: '#020617', heightRatio: 0.26 },
        notes: 'Starlight and brilliant Jovianshine glinting off fractured chaos ice blocks.'
      }
    },

    // -------------------------------------------------------------------------
    // GANYMEDE (Jupiter's Magnetic Giant Moon III)
    // -------------------------------------------------------------------------
    ganymede: {
      name: 'Ganymede',
      font: '"Space Grotesk", sans-serif',
      fontLetterSpacing: '0.04em',
      day: {
        type: 'photographic-basis',
        badge: 'Magnetic Grooved Terrain (NASA Juno Data)',
        gradient: [
          { stop: 0, color: '#020617' },
          { stop: 0.7, color: '#0a0f1d' },
          { stop: 1, color: '#131b2e' }
        ],
        sun: { show: true, x: 0.26, y: 0.22, radius: 22, coreColor: '#ffffff', glowColor: 'rgba(203, 213, 225, 0.5)' },
        companion: { show: true, name: 'Jupiter', x: 0.74, y: 0.34, radius: 46, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.35)' },
        stars: { show: true, count: 210, alpha: 0.8 },
        haze: { color: 'rgba(148, 163, 184, 0.08)', intensity: 0.15 },
        horizon: { show: true, type: 'regolith', color: '#64748b', secondaryColor: '#334155', heightRatio: 0.28 },
        notes: 'Ancient grooved tectonic ice ridges and dark silicate fields under starlight and giant Jupiter.'
      },
      night: {
        type: 'photographic-basis',
        badge: 'Magnetic Aurora Nocturne (NASA Juno Data)',
        gradient: [
          { stop: 0, color: '#010204' },
          { stop: 1, color: '#060a14' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Jupiter', x: 0.74, y: 0.34, radius: 46, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.45)' },
        stars: { show: true, count: 270, alpha: 0.95, milkyWay: true },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'regolith', color: '#1e293b', secondaryColor: '#0f172a', heightRatio: 0.28 },
        notes: 'Faint auroral curtains from Ganymede intrinsic magnetic dynamo shimmering in the tenuous oxygen exosphere.'
      }
    },

    // -------------------------------------------------------------------------
    // CALLISTO (Jupiter's Cratered Ice Moon IV)
    // -------------------------------------------------------------------------
    callisto: {
      name: 'Callisto',
      font: '"Cinzel", Georgia, serif',
      fontLetterSpacing: '0.06em',
      day: {
        type: 'photographic-basis',
        badge: 'Valhalla Impact Basin (NASA Galileo Data)',
        gradient: [
          { stop: 0, color: '#000000' },
          { stop: 0.7, color: '#05070c' },
          { stop: 1, color: '#0b0f19' }
        ],
        sun: { show: true, x: 0.3, y: 0.22, radius: 22, coreColor: '#ffffff', glowColor: 'rgba(255, 255, 255, 0.5)' },
        companion: { show: true, name: 'Jupiter', x: 0.75, y: 0.36, radius: 38, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.3)' },
        stars: { show: true, count: 240, alpha: 0.85 },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'craters', color: '#475569', secondaryColor: '#1e293b', heightRatio: 0.28 },
        notes: 'Most heavily cratered surface in the solar system, with multi-ring Valhalla basin under deep-space starfield.'
      },
      night: {
        type: 'photographic-basis',
        badge: 'Airless Starlight (NASA Galileo Data)',
        gradient: [
          { stop: 0, color: '#000000' },
          { stop: 1, color: '#020306' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Jupiter', x: 0.75, y: 0.36, radius: 38, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.4)' },
        stars: { show: true, count: 290, alpha: 0.95, milkyWay: true },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'craters', color: '#1e293b', secondaryColor: '#090d16', heightRatio: 0.28 },
        notes: 'Pristine, ancient 4-billion-year-old cratered ice-rock landscape under cold starlight.'
      }
    },

    // -------------------------------------------------------------------------
    // ENCELADUS (Saturn's Cryovolcanic Ocean Moon)
    // -------------------------------------------------------------------------
    enceladus: {
      name: 'Enceladus',
      font: '"Outfit", sans-serif',
      fontLetterSpacing: '0.04em',
      day: {
        type: 'photographic-basis',
        badge: 'Cryovolcanic Geysers (NASA Cassini Data)',
        gradient: [
          { stop: 0, color: '#020617' },
          { stop: 0.5, color: '#071830' },
          { stop: 1, color: '#0e2b4f' }
        ],
        sun: { show: true, x: 0.25, y: 0.24, radius: 18, coreColor: '#ffffff', glowColor: 'rgba(224, 242, 254, 0.7)' },
        companion: { show: true, name: 'Saturn', x: 0.72, y: 0.32, radius: 46, color: '#fef08a', glowColor: 'rgba(254, 240, 138, 0.45)' },
        stars: { show: true, count: 220, alpha: 0.8 },
        haze: { color: 'rgba(56, 189, 248, 0.12)', intensity: 0.25 },
        horizon: { show: true, type: 'methane-ice', color: '#e0f2fe', secondaryColor: '#0284c7', heightRatio: 0.26 },
        notes: 'Giant ringed Saturn dominates the sky over 99% albedo water-ice crust, with active geysers venting into space.'
      },
      night: {
        type: 'photographic-basis',
        badge: 'Saturnshine Nocturne (NASA Cassini Data)',
        gradient: [
          { stop: 0, color: '#010204' },
          { stop: 1, color: '#030814' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Saturn', x: 0.72, y: 0.32, radius: 46, color: '#fef08a', glowColor: 'rgba(254, 240, 138, 0.55)' },
        stars: { show: true, count: 270, alpha: 0.95, milkyWay: true },
        haze: { color: 'transparent', intensity: 0 },
        horizon: { show: true, type: 'methane-ice', color: '#0369a1', secondaryColor: '#020617', heightRatio: 0.26 },
        notes: 'Ethereal pale-yellow Saturnshine illuminating the south polar tiger-stripe fissures.'
      }
    },

    // -------------------------------------------------------------------------
    // TITAN (Saturn's Methane Haze Moon VI)
    // -------------------------------------------------------------------------
    titan: {
      name: 'Titan',
      font: '"Syne", sans-serif',
      fontLetterSpacing: '0.04em',
      day: {
        type: 'photographic-basis',
        badge: 'Methane Atmosphere (NASA Cassini & Huygens)',
        gradient: [
          { stop: 0, color: '#f59e0b' },
          { stop: 0.4, color: '#d97706' },
          { stop: 0.8, color: '#92400e' },
          { stop: 1, color: '#451a03' }
        ],
        sun: { show: true, x: 0.5, y: 0.3, radius: 38, isDiffused: true, coreColor: '#fef08a', glowColor: 'rgba(245, 158, 11, 0.65)' },
        stars: { show: false },
        haze: { color: 'rgba(217, 119, 6, 0.45)', intensity: 0.8 },
        horizon: { show: true, type: 'dunes', color: '#78350f', secondaryColor: '#451a03', heightRatio: 0.28 },
        notes: 'Dense nitrogen-methane photochemical smog scatters golden sunlight over liquid hydrocarbon seas (Kraken Mare).'
      },
      night: {
        type: 'photographic-basis',
        badge: 'Dense Nitrogen Night (NASA Cassini Data)',
        gradient: [
          { stop: 0, color: '#271004' },
          { stop: 0.6, color: '#1a0b03' },
          { stop: 1, color: '#0a0401' }
        ],
        sun: { show: false },
        companion: { show: true, name: 'Saturn', x: 0.7, y: 0.32, radius: 40, color: '#ca8a04', glowColor: 'rgba(202, 138, 4, 0.25)' },
        stars: { show: true, count: 60, alpha: 0.3 },
        haze: { color: 'rgba(120, 53, 15, 0.25)', intensity: 0.5 },
        horizon: { show: true, type: 'dunes', color: '#451a03', secondaryColor: '#1c0702', heightRatio: 0.28 },
        notes: 'Deep amber twilight where Saturn dimly glows through the dense organic nitrogen veil.'
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Data-Driven Sky Drawing Engine
  // ---------------------------------------------------------------------------
  /**
   * Renders a celestial world's day or night sky onto any 2D canvas context.
   * Supports real-time subtle atmospheric motion: star twinkling, drifting clouds,
   * solar corona wavering, and occasional meteors.
   *
   * @param {CanvasRenderingContext2D} ctx - Target 2D rendering context
   * @param {string} worldId - World identifier ('mercury', 'earth', etc.)
   * @param {string} mode - 'day' or 'night'
   * @param {number} width - Canvas pixel width
   * @param {number} height - Canvas pixel height
   * @param {number} [time=0] - High-resolution timestamp for subtle animation
   * @param {boolean} [prefersReducedMotion=false] - Whether reduced motion is requested
   */
  function drawPlanetSky(ctx, worldId, mode, width, height, time = 0, prefersReducedMotion = false) {
    const worldConfig = SKIES[worldId] || SKIES.earth;
    const sky = mode === 'night' ? worldConfig.night : worldConfig.day;

    ctx.save();

    // 1. Base Sky Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    sky.gradient.forEach((g) => {
      bgGrad.addColorStop(g.stop, g.color);
    });
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Stars Layer (if enabled)
    if (sky.stars && sky.stars.show) {
      ctx.save();
      const count = sky.stars.count || 150;
      const baseAlpha = sky.stars.alpha || 0.8;

      // Seed-based pseudo-random generator for consistent star placement
      let seed = 42;
      function random() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      }

      // Optional subtle Milky Way galactic dust band
      if (sky.stars.milkyWay) {
        const mwGrad = ctx.createLinearGradient(width * 0.2, 0, width * 0.8, height * 0.7);
        mwGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        mwGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.08)');
        mwGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = mwGrad;
        ctx.fillRect(0, 0, width, height * 0.75);
      }

      for (let i = 0; i < count; i++) {
        const sx = random() * width;
        const sy = random() * (height * 0.75); // Keep stars above horizon
        const sr = random() * 1.3 + 0.4;
        const sa = random() * baseAlpha;

        // Subtle stellar scintillation (twinkling)
        const twinkle = (time > 0 && !prefersReducedMotion)
          ? 0.72 + 0.28 * Math.sin(time * 0.0022 + i * 1.6)
          : 1;

        ctx.fillStyle = random() > 0.8 ? '#fed7aa' : (random() > 0.6 ? '#bae6fd' : '#ffffff');
        ctx.globalAlpha = Math.max(0.08, Math.min(1, sa * twinkle));
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2b. Occasional subtle meteor streak in night skies or airless worlds
    if ((mode === 'night' || !sky.haze || sky.haze.intensity < 0.2) && time > 0 && !prefersReducedMotion) {
      const meteorPeriod = 22000; // Occasional streak every 22 seconds
      const meteorProgress = (time % meteorPeriod) / meteorPeriod;
      if (meteorProgress > 0.88 && meteorProgress < 0.93) {
        const tProgress = (meteorProgress - 0.88) / 0.05;
        const mStartX = width * 0.22;
        const mStartY = height * 0.08;
        const mEndX = width * 0.75;
        const mEndY = height * 0.30;
        const curX = mStartX + (mEndX - mStartX) * tProgress;
        const curY = mStartY + (mEndY - mStartY) * tProgress;
        const tailX = curX - (mEndX - mStartX) * 0.16;
        const tailY = curY - (mEndY - mStartY) * 0.16;
        const mAlpha = Math.sin(tProgress * Math.PI) * 0.8;

        ctx.save();
        ctx.globalAlpha = mAlpha;
        const mGrad = ctx.createLinearGradient(tailX, tailY, curX, curY);
        mGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        mGrad.addColorStop(1, '#ffffff');
        ctx.strokeStyle = mGrad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(curX, curY);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Saturnian Rings Arch (if world has sky rings)
    if (sky.rings && sky.rings.show) {
      ctx.save();
      const rx = width * 0.5;
      const ry = height * 0.95;
      const rw = width * 0.75;
      const rh = height * 0.65;
      const ringGleam = (!prefersReducedMotion && time > 0) ? Math.sin(time * 0.001) * 0.08 : 0;

      ctx.beginPath();
      ctx.ellipse(rx, ry, rw, rh, -0.22, Math.PI, Math.PI * 2);
      ctx.strokeStyle = sky.rings.color || 'rgba(254, 240, 138, 0.65)';
      ctx.lineWidth = 14;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(rx, ry, rw - 16, rh - 12, -0.22, Math.PI, Math.PI * 2);
      ctx.strokeStyle = sky.rings.innerColor || 'rgba(250, 204, 21, 0.4)';
      ctx.lineWidth = 6 + ringGleam;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Celestial Companions (Earthrise on Moon, Charon on Pluto, Phobos on Mars, etc.)
    if (sky.companion && sky.companion.show) {
      const comp = sky.companion;
      const bob = (!prefersReducedMotion && time > 0) ? Math.sin(time * 0.0012) * 2.5 : 0;
      const cx = width * comp.x;
      const cy = height * comp.y + bob;

      ctx.save();
      if (comp.glowColor) {
        const glow = ctx.createRadialGradient(cx, cy, comp.radius * 0.5, cx, cy, comp.radius * 2.2);
        glow.addColorStop(0, comp.glowColor);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, comp.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Planet disc
      ctx.fillStyle = comp.color;
      ctx.beginPath();
      ctx.arc(cx, cy, comp.radius, 0, Math.PI * 2);
      ctx.fill();

      // Earth atmospheric swirl hint if Earthrise
      if (comp.isEarthrise) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(cx - comp.radius * 0.3, cy - comp.radius * 0.2, comp.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5. Sun / Primary Star
    if (sky.sun && sky.sun.show) {
      const s = sky.sun;
      const sx = width * s.x;
      const sy = height * s.y;

      ctx.save();
      if (s.isEclipse) {
        // Solar Eclipse Corona (Night Sun mode) with gentle streamer waver
        const coronaWaver = (!prefersReducedMotion && time > 0) ? Math.sin(time * 0.003) * 6 : 0;
        const coronaR = s.radius * 3.5 + coronaWaver;
        const coronaGrad = ctx.createRadialGradient(sx, sy, s.radius * 0.9, sx, sy, coronaR);
        coronaGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        coronaGrad.addColorStop(0.3, 'rgba(147, 197, 253, 0.6)');
        coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, coronaR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = s.coreColor;
        ctx.beginPath();
        ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard or Diffused Sun with subtle atmospheric breathing
        const sunBreath = (!prefersReducedMotion && time > 0) ? Math.sin(time * 0.002) * (s.radius * 0.06) : 0;
        const glowR = (s.isDiffused ? s.radius * 2.5 : s.radius * 3.2) + sunBreath;
        const sunGlow = ctx.createRadialGradient(sx, sy, s.radius * 0.2, sx, sy, glowR);
        sunGlow.addColorStop(0, s.glowColor);
        if (s.hasBlueHalo) {
          // Martian sunset/sunrise forward scattering blue halo
          sunGlow.addColorStop(0.45, 'rgba(147, 197, 253, 0.45)');
        }
        sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Core disc
        ctx.fillStyle = s.coreColor;
        ctx.beginPath();
        ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. High-Altitude Clouds (Methane cirrus on Neptune & Uranus, or Soft Earth Day Clouds)
    if (sky.clouds && sky.clouds.show) {
      // Neptune/Uranus supersonic methane wind streaks
      const windDrift = (!prefersReducedMotion && time > 0) ? (time * 0.018) % (width * 0.4) : 0;
      ctx.save();
      ctx.strokeStyle = sky.clouds.color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-width * 0.2 + windDrift, height * 0.38);
      ctx.bezierCurveTo(width * 0.25 + windDrift, height * 0.35, width * 0.65 + windDrift, height * 0.41, width * 1.1 + windDrift, height * 0.37);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-width * 0.1 + windDrift * 1.25, height * 0.44);
      ctx.bezierCurveTo(width * 0.35 + windDrift * 1.25, height * 0.42, width * 0.7 + windDrift * 1.25, height * 0.47, width * 1.05 + windDrift * 1.25, height * 0.43);
      ctx.stroke();
      ctx.restore();
    } else if (worldId === 'earth' && mode === 'day') {
      // Earth Day soft cumulus drifting cloud puffs across Rayleigh sky
      ctx.save();
      const c1X = (!prefersReducedMotion && time > 0) ? (time * 0.012) % (width + 240) - 120 : width * 0.35;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(c1X, height * 0.28, 48, 0, Math.PI * 2);
      ctx.arc(c1X + 42, height * 0.25, 62, 0, Math.PI * 2);
      ctx.arc(c1X + 85, height * 0.28, 44, 0, Math.PI * 2);
      ctx.fill();

      const c2X = (!prefersReducedMotion && time > 0) ? ((time * 0.007 + 280) % (width + 260)) - 130 : width * 0.72;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.beginPath();
      ctx.arc(c2X, height * 0.38, 36, 0, Math.PI * 2);
      ctx.arc(c2X + 32, height * 0.36, 46, 0, Math.PI * 2);
      ctx.arc(c2X + 65, height * 0.39, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (worldId === 'earth' && mode === 'night') {
      // Earth Night high-latitude Aurora Borealis shimmering curtain
      ctx.save();
      const aShift = (!prefersReducedMotion && time > 0) ? Math.sin(time * 0.0016) * 16 : 0;
      const aGrad = ctx.createLinearGradient(0, height * 0.06, 0, height * 0.34);
      aGrad.addColorStop(0, 'rgba(52, 211, 153, 0)');
      aGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.12)');
      aGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.07)');
      aGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.12 + aShift);
      ctx.bezierCurveTo(width * 0.3, height * 0.08 - aShift, width * 0.7, height * 0.22 + aShift, width, height * 0.15 - aShift);
      ctx.lineTo(width, height * 0.36);
      ctx.lineTo(0, height * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (worldId === 'venus') {
      // Venusian sulfuric acid cloud deck drifting slowly
      ctx.save();
      const vShift = (!prefersReducedMotion && time > 0) ? (time * 0.012) % (width * 0.4) : 0;
      ctx.fillStyle = mode === 'day' ? 'rgba(254, 240, 138, 0.12)' : 'rgba(217, 119, 6, 0.14)';
      ctx.beginPath();
      ctx.ellipse(width * 0.45 + vShift * 0.5, height * 0.36, width * 0.55, height * 0.16, 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Atmospheric Horizon & Surface / Cloud Layer
    if (sky.horizon && sky.horizon.show) {
      const hHeight = height * sky.horizon.heightRatio;
      const hy = height - hHeight;

      ctx.save();
      const horizGrad = ctx.createLinearGradient(0, hy, 0, height);
      horizGrad.addColorStop(0, sky.horizon.color);
      horizGrad.addColorStop(1, sky.horizon.secondaryColor || '#000000');

      ctx.fillStyle = horizGrad;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, hy + 10);

      // Subtle terrain undulation
      ctx.bezierCurveTo(
        width * 0.25, hy - 8,
        width * 0.65, hy + 14,
        width, hy + 4
      );
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Lightning flash in Jovian night clouds (occasional electrical discharge)
      if (sky.horizon.hasLightning) {
        const isFlashing = (!prefersReducedMotion && time > 0) && (Math.sin(time * 0.0006) > 0.982);
        if (isFlashing) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 16;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          const lx = width * 0.32;
          ctx.moveTo(lx, hy + 18);
          ctx.lineTo(lx + 8, hy + 38);
          ctx.lineTo(lx - 5, hy + 48);
          ctx.lineTo(lx + 10, hy + 66);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // 8. Atmospheric Haze Overlay
    if (sky.haze && sky.haze.intensity > 0) {
      ctx.save();
      const hazeGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
      hazeGrad.addColorStop(0, 'rgba(0,0,0,0)');
      hazeGrad.addColorStop(1, sky.haze.color);
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, height * 0.4, width, height * 0.6);
      ctx.restore();
    }

    ctx.restore();
  }

  return {
    SKIES,
    drawPlanetSky,
    getSkyConfig: (worldId) => SKIES[worldId] || SKIES.earth
  };
})();
