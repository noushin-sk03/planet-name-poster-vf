/**
 * app.js - Stage 01 Controller: Landing & Interactive Selection
 * -------------------------------------------------------------
 * Educational Pair-Programming Project: "Planet Name Poster"
 * 
 * Stage 1 Goals:
 * 1. Initialize the animated interactive solar system canvas (background.js).
 * 2. Populate the left planet navigation menu with the 8 solar system worlds.
 * 3. Handle seamless two-way synchronized selection:
 *    - Clicking/touching a planet in the left drawer highlights it on the canvas
 *      and updates the detail panel.
 *    - Clicking/touching a moving planet on the canvas updates the active drawer item
 *      and the detail panel.
 * 4. Responsive mobile drawer navigation (toggle button, backdrop dismiss, Esc key).
 * 5. Keyboard accessibility (Tab navigation, Enter/Space selection, Arrow Up/Down).
 */

document.addEventListener('DOMContentLoaded', async () => {
  // ---------------------------------------------------------------------------
  // 1. Planetary Data Definition
  // ---------------------------------------------------------------------------
  // Default data for the 8 solar system planets.
  // Each entry includes visual color, order, and educational summary.
  const DEFAULT_PLANETS = [
    {
      id: 'mercury',
      name: 'Mercury',
      order: '1st planet from Sun',
      color: '#a3a3a3',
      desc: 'Smallest planet and closest to the Sun. Cratered rocky surface with extreme temperature swings from day to night.'
    },
    {
      id: 'venus',
      name: 'Venus',
      order: '2nd planet from Sun',
      color: '#eab308',
      desc: 'Second world from the Sun. Enveloped in a dense, runaway greenhouse atmosphere hotter than an oven.'
    },
    {
      id: 'earth',
      name: 'Earth',
      order: '3rd planet from Sun',
      color: '#38bdf8',
      desc: 'Third rock from the Sun. Dense nitrogen-oxygen atmosphere, liquid oceans, and a thriving biosphere.'
    },
    {
      id: 'mars',
      name: 'Mars',
      order: '4th planet from Sun',
      color: '#ef4444',
      desc: 'Fourth planet from the Sun. Dusty, iron-rich desert world with ancient dry river valleys and polar ice caps.'
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      order: '5th planet from Sun',
      color: '#f97316',
      desc: 'Fifth planet and the largest world in our solar system. Swirling gas giant with centuries-old storms like the Great Red Spot.'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      order: '6th planet from Sun',
      color: '#fde047',
      desc: 'Sixth planet from the Sun. Magnificent ring system composed of billions of water-ice particles and dust.'
    },
    {
      id: 'uranus',
      name: 'Uranus',
      order: '7th planet from Sun',
      color: '#2dd4bf',
      desc: 'Seventh planet from the Sun. Tilted on its side by 98 degrees, an ice giant with pale cyan methane haze.'
    },
    {
      id: 'neptune',
      name: 'Neptune',
      order: '8th planet from Sun',
      color: '#3b82f6',
      desc: 'Eighth and most distant planet. Deep azure ice giant swept by supersonic supersonic winds exceeding 2,000 km/h.'
    }
  ];

  // Application State
  const state = {
    selectedPlanetId: 'earth',
    planets: DEFAULT_PLANETS
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

  // Detail / Placeholder panel elements
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
      // Merge extra details (notes, facts) if available
      state.planets = state.planets.map((p) => {
        const match = data.find((item) => item.id === p.id);
        if (match && match.notes) {
          return { ...p, desc: match.notes };
        }
        return p;
      });
    }
  } catch (err) {
    // If running from local file:// or network offline, gracefully proceed with DEFAULT_PLANETS
    console.info('Using local planet defaults:', err);
  }

  // ---------------------------------------------------------------------------
  // 4. Render Left Planet Menu
  // ---------------------------------------------------------------------------
  function renderPlanetMenu() {
    planetMenuList.innerHTML = '';

    state.planets.forEach((planet, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'planet-btn';
      btn.setAttribute('role', 'menuitem');
      btn.setAttribute('data-planet-id', planet.id);
      btn.setAttribute('aria-label', `Select ${planet.name}, ${planet.order}`);

      if (planet.id === state.selectedPlanetId) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'true');
      }

      // Planet color swatch dot
      const swatch = document.createElement('span');
      swatch.className = 'planet-swatch';
      swatch.style.backgroundColor = planet.color;
      swatch.style.color = planet.color;
      swatch.setAttribute('aria-hidden', 'true');

      // Planet label & subtitle
      const meta = document.createElement('div');
      meta.className = 'planet-meta';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'planet-btn-name';
      nameSpan.textContent = planet.name;

      const subSpan = document.createElement('span');
      subSpan.className = 'planet-btn-sub';
      subSpan.textContent = planet.order;

      meta.appendChild(nameSpan);
      meta.appendChild(subSpan);

      btn.appendChild(swatch);
      btn.appendChild(meta);

      // Menu button click handler
      btn.addEventListener('click', () => {
        selectPlanet(planet.id, { source: 'drawer' });

        // If on small screen / mobile drawer is open, auto-close so the user can see the canvas
        if (window.innerWidth < 820 && planetDrawer.classList.contains('open')) {
          closeDrawer();
        }
      });

      // Keyboard navigation within the menu (Arrow Up / Down)
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
  /**
   * Selects a planet, updates visual states across menu, canvas, and info panel.
   *
   * @param {string} planetId - Unique identifier (e.g. 'earth', 'mars')
   * @param {Object} options - { source: 'drawer' | 'canvas' }
   */
  function selectPlanet(planetId, options = {}) {
    const planet = state.planets.find((p) => p.id === planetId);
    if (!planet) return;

    state.selectedPlanetId = planetId;

    // 1. Notify SolarBackground canvas engine
    if (typeof SolarBackground !== 'undefined' && SolarBackground.setSelectedPlanet) {
      SolarBackground.setSelectedPlanet(planetId);
    }

    // 2. Synchronize Drawer Menu Buttons
    const buttons = planetMenuList.querySelectorAll('.planet-btn');
    buttons.forEach((btn) => {
      const isTarget = btn.getAttribute('data-planet-id') === planetId;
      btn.classList.toggle('active', isTarget);
      if (isTarget) {
        btn.setAttribute('aria-current', 'true');
        // If selection was triggered from canvas click, scroll menu button into view
        if (options.source === 'canvas') {
          btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    // 3. Update Selected World Detail Card
    if (panelPlanetDot) {
      panelPlanetDot.style.backgroundColor = planet.color;
      panelPlanetDot.style.color = planet.color;
      panelPlanetDot.style.boxShadow = `0 0 16px ${planet.color}`;
    }

    if (panelPlanetName) {
      panelPlanetName.textContent = planet.name;
    }

    if (panelPlanetDesc) {
      panelPlanetDesc.textContent = planet.desc;
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Mobile Drawer Open / Close Handlers
  // ---------------------------------------------------------------------------
  function openDrawer() {
    planetDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    drawerToggleBtn.setAttribute('aria-expanded', 'true');

    // Focus active or first button for screen readers and keyboard users
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

  // Bind drawer controls
  if (drawerToggleBtn) drawerToggleBtn.addEventListener('click', toggleDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  // Close drawer when pressing Escape key
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
    // When a planet is clicked directly on the canvas, this callback is fired
    SolarBackground.init(canvasElement, (clickedPlanetId) => {
      selectPlanet(clickedPlanetId, { source: 'canvas' });
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Initial Render & Default Selection
  // ---------------------------------------------------------------------------
  renderPlanetMenu();
  selectPlanet('earth', { source: 'init' });
});
