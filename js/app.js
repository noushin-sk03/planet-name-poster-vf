/**
 * app.js - Stage 01 Controller: Landing & Interactive Selection
 * -------------------------------------------------------------
 * Educational Pair-Programming Project: "Planet Name Poster"
 * 
 * Features:
 * 1. Coordinates full Solar System navigation (The Sun, The Moon, and 8 Planets).
 * 2. Two-way synchronized selection:
 *    - Selecting a world in the left drawer highlights it on the canvas and detail panel.
 *    - Clicking any world (Sun, Moon, or planet) on the canvas updates the drawer and detail panel.
 * 3. Responsive drawer toggle for mobile devices.
 * 4. Keyboard accessible menu navigation (Tab, Enter/Space, Arrow Up/Down).
 */

document.addEventListener('DOMContentLoaded', async () => {
  // ---------------------------------------------------------------------------
  // 1. Celestial Worlds Definition (Sun, Moon, and 8 Planets)
  // ---------------------------------------------------------------------------
  const DEFAULT_WORLDS = [
    {
      id: 'sun',
      name: 'The Sun',
      order: 'Central Star',
      color: '#fbbf24',
      desc: 'Luminous G-type main-sequence star at the center of the solar system. Contains 99.86% of the system\'s mass and powers planetary climates.'
    },
    {
      id: 'mercury',
      name: 'Mercury',
      order: '1st planet from Sun',
      color: '#cbd5e1',
      desc: 'Smallest planet and closest to the Sun. Cratered rocky surface with extreme temperature swings from 430 °C by day to -180 °C by night.'
    },
    {
      id: 'venus',
      name: 'Venus',
      order: '2nd planet from Sun',
      color: '#fde047',
      desc: 'Second world from the Sun. Enveloped in a dense, runaway greenhouse atmosphere with crushing pressure, hotter than an oven.'
    },
    {
      id: 'earth',
      name: 'Earth',
      order: '3rd planet from Sun',
      color: '#38bdf8',
      desc: 'Third rock from the Sun. Dense nitrogen-oxygen atmosphere, liquid oceans, and a thriving biosphere.'
    },
    {
      id: 'moon',
      name: 'The Moon',
      order: 'Earth\'s Natural Satellite',
      color: '#e2e8f0',
      desc: 'Earth\'s companion. Airless, heavily cratered world tidally locked in synchronous rotation, swinging between 120 °C and -130 °C.'
    },
    {
      id: 'mars',
      name: 'Mars',
      order: '4th planet from Sun',
      color: '#f87171',
      desc: 'Fourth planet from the Sun. Dusty, iron-rich desert world with ancient dry river valleys, giant volcanoes, and polar ice caps.'
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      order: '5th planet from Sun',
      color: '#fb923c',
      desc: 'Fifth planet and largest world in our solar system. Swirling gas giant with centuries-old storms like the Great Red Spot.'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      order: '6th planet from Sun',
      color: '#fef08a',
      desc: 'Sixth planet from the Sun. Magnificent ring system composed of billions of sparkling water-ice particles and rocky dust.'
    },
    {
      id: 'uranus',
      name: 'Uranus',
      order: '7th planet from Sun',
      color: '#5eead4',
      desc: 'Seventh planet from the Sun. Tilted on its side by 98 degrees, an ice giant with pale cyan methane haze.'
    },
    {
      id: 'neptune',
      name: 'Neptune',
      order: '8th planet from Sun',
      color: '#60a5fa',
      desc: 'Eighth and most distant major planet. Deep azure ice giant swept by supersonic winds exceeding 2,000 km/h.'
    }
  ];

  // Application State
  const state = {
    selectedBodyId: 'earth',
    worlds: DEFAULT_WORLDS
  };

  // ---------------------------------------------------------------------------
  // 2. DOM Elements Cache
  // ---------------------------------------------------------------------------
  const canvasElement = document.getElementById('solar-canvas');
  const drawerToggleBtn = document.getElementById('drawer-toggle');
  const drawerCloseBtn = document.getElementById('drawer-close');
  const planetDrawer = document.getElementById('planet-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const planetMenuList = document.getElementById('planet-menu');

  // Detail panel elements
  const panelPlanetDot = document.getElementById('panel-planet-dot');
  const panelPlanetName = document.getElementById('panel-planet-name');
  const panelPlanetDesc = document.getElementById('panel-planet-desc');

  // ---------------------------------------------------------------------------
  // 3. Optional Enrichment from planets.json
  // ---------------------------------------------------------------------------
  try {
    const res = await fetch('data/planets.json');
    if (res.ok) {
      const data = await res.json();
      state.worlds = state.worlds.map((w) => {
        const match = data.find((item) => item.id === w.id);
        if (match && match.notes) {
          return { ...w, desc: match.notes };
        }
        return w;
      });
    }
  } catch (err) {
    console.info('Using local world definitions:', err);
  }

  // ---------------------------------------------------------------------------
  // 4. Render Navigation Menu
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

      if (world.id === state.selectedBodyId) {
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

      btn.appendChild(swatch);
      btn.appendChild(meta);

      // Click handler
      btn.addEventListener('click', () => {
        selectWorld(world.id, { source: 'drawer' });

        // Auto-close on mobile so the user sees the world on the canvas
        if (window.innerWidth < 820 && planetDrawer.classList.contains('open')) {
          closeDrawer();
        }
      });

      // Keyboard arrow navigation
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
  // 5. Two-Way Selection Synchronization
  // ---------------------------------------------------------------------------
  function selectWorld(bodyId, options = {}) {
    const world = state.worlds.find((w) => w.id === bodyId);
    if (!world) return;

    state.selectedBodyId = bodyId;

    // 1. Notify canvas background engine
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

    // 3. Update Selected World Detail Card
    if (panelPlanetDot) {
      panelPlanetDot.style.backgroundColor = world.color;
      panelPlanetDot.style.color = world.color;
      panelPlanetDot.style.boxShadow = `0 0 18px ${world.color}`;
    }

    if (panelPlanetName) {
      panelPlanetName.textContent = world.name;
    }

    if (panelPlanetDesc) {
      panelPlanetDesc.textContent = world.desc;
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Mobile Drawer Open / Close Controls
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
  // 7. Initialize Canvas Background & Wire Selection Callback
  // ---------------------------------------------------------------------------
  if (canvasElement && typeof SolarBackground !== 'undefined') {
    SolarBackground.init(canvasElement, (clickedBodyId) => {
      selectWorld(clickedBodyId, { source: 'canvas' });
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Initial Render & Default Selection
  // ---------------------------------------------------------------------------
  renderPlanetMenu();
  selectWorld('earth', { source: 'init' });
});
