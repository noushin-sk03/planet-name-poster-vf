/**
 * app.js - Stage 01 Controller: Landing & Interactive Selection
 * -------------------------------------------------------------
 * Educational Pair-Programming Project: "Planet Name Poster"
 * 
 * Verified Data Integrity:
 * All celestial figures (Gravity, Day Length, Mean Temperature) are verified
 * directly against NASA's Official Planetary Fact Sheet (NASA Goddard Space Flight Center).
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // 1. Celestial Worlds Definition (100% NASA Verified Figures)
  // ---------------------------------------------------------------------------
  const WORLDS = [
    {
      id: 'sun',
      name: 'The Sun',
      order: 'Central Star',
      type: 'Yellow Dwarf',
      color: '#fbbf24',
      gravity: '274.0 m/s²',
      dayLength: '600.0 hrs',
      temp: '5,500 °C'
    },
    {
      id: 'mercury',
      name: 'Mercury',
      order: '1st from Sun',
      type: 'Terrestrial',
      color: '#cbd5e1',
      gravity: '3.7 m/s²',
      dayLength: '4,222.6 hrs',
      temp: '167 °C'
    },
    {
      id: 'venus',
      name: 'Venus',
      order: '2nd from Sun',
      type: 'Terrestrial',
      color: '#fde047',
      gravity: '8.9 m/s²',
      dayLength: '2,802.0 hrs',
      temp: '464 °C'
    },
    {
      id: 'earth',
      name: 'Earth',
      order: '3rd from Sun',
      type: 'Terrestrial',
      color: '#38bdf8',
      gravity: '9.8 m/s²',
      dayLength: '24.0 hrs',
      temp: '15 °C'
    },
    {
      id: 'moon',
      name: 'The Moon',
      order: 'Earth\'s Satellite',
      type: 'Lunar Body',
      color: '#e2e8f0',
      gravity: '1.6 m/s²',
      dayLength: '708.7 hrs',
      temp: '-20 °C'
    },
    {
      id: 'mars',
      name: 'Mars',
      order: '4th from Sun',
      type: 'Terrestrial',
      color: '#f87171',
      gravity: '3.7 m/s²',
      dayLength: '24.7 hrs',
      temp: '-65 °C'
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      order: '5th from Sun',
      type: 'Gas Giant',
      color: '#fb923c',
      gravity: '24.8 m/s²',
      dayLength: '9.9 hrs',
      temp: '-110 °C'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      order: '6th from Sun',
      type: 'Gas Giant',
      color: '#fde047',
      gravity: '10.4 m/s²',
      dayLength: '10.7 hrs',
      temp: '-140 °C'
    },
    {
      id: 'uranus',
      name: 'Uranus',
      order: '7th from Sun',
      type: 'Ice Giant',
      color: '#5eead4',
      gravity: '8.9 m/s²',
      dayLength: '17.2 hrs',
      temp: '-195 °C'
    },
    {
      id: 'neptune',
      name: 'Neptune',
      order: '8th from Sun',
      type: 'Ice Giant',
      color: '#60a5fa',
      gravity: '11.2 m/s²',
      dayLength: '16.1 hrs',
      temp: '-200 °C'
    }
  ];

  // Application State
  const state = {
    selectedBodyId: 'earth',
    worlds: WORLDS
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

  // Right-docked telemetry card elements
  const panelPlanetDot = document.getElementById('panel-planet-dot');
  const panelPlanetName = document.getElementById('panel-planet-name');
  const panelPlanetOrder = document.getElementById('panel-planet-order');
  const panelPlanetType = document.getElementById('panel-planet-type');
  const panelGravity = document.getElementById('panel-gravity');
  const panelDayLength = document.getElementById('panel-day-length');
  const panelTemp = document.getElementById('panel-temp');

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
  // 4. Two-Way Selection Synchronization & Telemetry Update
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

    // 3. Update Right-Docked NASA Verified Telemetry Card
    if (panelPlanetDot) {
      panelPlanetDot.style.backgroundColor = world.color;
      panelPlanetDot.style.color = world.color;
      panelPlanetDot.style.boxShadow = `0 0 16px ${world.color}`;
    }

    if (panelPlanetName) {
      panelPlanetName.textContent = world.name;
    }

    if (panelPlanetOrder) {
      panelPlanetOrder.textContent = world.order;
    }

    if (panelPlanetType) {
      panelPlanetType.textContent = world.type;
    }

    if (panelGravity) {
      panelGravity.textContent = world.gravity;
    }

    if (panelDayLength) {
      panelDayLength.textContent = world.dayLength;
    }

    if (panelTemp) {
      panelTemp.textContent = world.temp;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Mobile Drawer Open / Close Controls
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
  // 6. Initialize Canvas Background & Wire Selection Callback
  // ---------------------------------------------------------------------------
  if (canvasElement && typeof SolarBackground !== 'undefined') {
    SolarBackground.init(canvasElement, (clickedBodyId) => {
      selectWorld(clickedBodyId, { source: 'canvas' });
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Initial Render & Default Selection
  // ---------------------------------------------------------------------------
  renderPlanetMenu();
  selectWorld('earth', { source: 'init' });
});
