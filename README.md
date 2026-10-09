# Planet Name Poster & NASA Celestial Studio 🪐

> Transform your name into a bold typographic celestial poster with verified NASA textures, explore 30 celestial worlds with full orbit selection, generate 3D lit globes with interactive day/night terminators, and export high-resolution wallpapers and print designs.
>
> **-Made by NSK with AI**
>
> 🔗 **Repository**: [https://github.com/noushin-sk03/planet-name-poster](https://github.com/noushin-sk03/planet-name-poster)

---

## 🌌 Overview

**Planet Name Poster & NASA Celestial Studio** is an educational, zero-dependency space simulation and poster studio built with standard modern HTML5, CSS3, Canvas 2D, and WebGL APIs.

* **Interactive Solar System Simulation**: Real-time orbital mechanics simulating celestial bodies orbiting the Sun, an Asteroid Belt, deep space nebulae, and galactic parallax drift traveling through the Milky Way at ~230 km/s.
* **Direct Planet & Orbit Selection**: Click any planet, moon, or click directly on any elliptical orbit track in the simulation to inspect full NASA telemetry.
* **30 Celestial Worlds Across 2 Catalogs**:
  * **🪐 Solar System & Moons (18 worlds)**: The Sun, 8 Planets, and 7 major natural satellites (Earth's Moon, Io, Europa, Ganymede, Callisto, Titan, Enceladus).
  * **🌌 NASA Exoplanet Archive (12 worlds)**: Confirmed alien worlds including TRAPPIST-1 e/f, Proxima Centauri b, Kepler-186 f, Kepler-452 b, WASP-76 b, and 55 Cancri e, with honest *"Artist's Impression"* badges.
* **Blinking Asteroid User Guide**: Eye-catching pulsating asteroid icon in the top right corner opening a friendly, step-by-step cosmic guide for all users.
* **Typographic Texture Compositing**: Names up to 30 characters rasterized into an alpha mask and composited with high-resolution celestial surface imagery using Canvas 2D Porter-Duff blend modes (`source-in` and `source-atop`).
* **🌐 WebGL 3D Lit Globe with Name Generator**: Analytical raytraced fragment shader rendering a 3D sphere with an interactive Sun Angle slider (moving day/night terminator boundary), auto-rotation, and personalized NASA name generation on the 3D globe with high-res poster snapshot downloads.
* **Day & Night Illumination**: Day mode renders authentic daytime surface illumination; Night mode darkens the surface and renders Rayleigh atmospheric backlighting and starry night skies.
* **Multi-Format Export & Wallpapers**: High-resolution downloads categorized under Social (Portrait, Square, Story, X Post, Link Preview, Pinterest), Wallpapers (PC Wallpaper 1920×1080, 4K Desktop 3840×2160, Ultrawide 2560×1080, Tablet 2048×1536, Phone Wallpaper 1170×2532), Print (A4 300 DPI), and Custom Dimensions.
* **Living on Another World Biophysics**: Calculates weight on each world ($F = m \cdot \frac{g_{\text{world}}}{g_{\text{earth}}}$) and age in local planetary orbital years based on birthdate.
* **Stateful Sharing & Data Export**: Shareable URLs that sync the exact configuration with zero backend using HTML5 `history.replaceState`, plus single-click JSON export of verified NASA Fact Sheets.

---

## 🚀 How to Run Locally

Because this project is built entirely with plain vanilla web technologies, there are **no build steps, no package installations, and no frameworks required**.

### Option 1: Python HTTP Server (Recommended)
Open a terminal in the project directory and run:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

### Option 2: Direct File Open
You can also directly double-click `index.html` in your file explorer to open it in Chrome, Edge, Safari, or Firefox without any web server.

---

## 🧪 Automated Unit & Integration Tests

The project includes **123 automated unit and integration tests** covering biophysical math, tidal locking, orbital mechanics, poster formatting, XSS URL safety, and WebGL raytracing maths:

```bash
# Run all test suites
node tests/test_calculator.js      # 16 tests: Biophysical formulas & orbital years
node tests/test_poster_formats.js   #  5 tests: Resolution aspect ratios & safe zones
node tests/test_share.js           #  9 tests: URL parameter encoding & XSS sanitization
node tests/test_moons.js           # 12 tests: Natural satellite micro-gravity & parents
node tests/test_exoplanets.js      # 66 tests: 12 NASA exoplanets, badges & archive citations
node tests/test_stage8_globe.js    # 15 tests: WebGL raytraced fragment shader & terminator
node tests/verify_ui.js            # UI integration verification
```

---

## 📁 File Structure

```text
planet-name-poster/
├── index.html              # Semantic HTML5 layout with Solar System, Studio, and 3D Globe
├── preview.png             # Lightweight Open Graph social card preview
├── css/
│   └── style.css           # Mobile-first stylesheet with design tokens, responsive cards, and animations
├── js/
│   ├── app.js              # Main application coordinator, event binding, and drawer sync
│   ├── background.js       # Interactive 60 FPS Solar System & Extrasolar orbital canvas engine
│   ├── calculator.js       # Pure biophysical gravity, weight, age, and diurnal functions
│   ├── poster.js           # 2D NASA typography & poster layout engine with multi-format export
│   ├── skies.js            # Procedural sky models for Solar System, Moons, and 12 Exoplanets
│   ├── sphere3d.js         # WebGL analytical raytraced 3D lit globe with moving terminator
│   ├── textures.js         # Procedural equirectangular surface texture synthesizer
│   └── share.js            # URL state parsing, serialization, and XSS sanitization
├── tests/
│   ├── test_calculator.js  # Biophysics unit tests
│   ├── test_poster_formats.js # Export resolutions and safe-zones
│   ├── test_share.js       # URL sharing and security tests
│   ├── test_moons.js       # Natural satellite tests
│   ├── test_exoplanets.js  # NASA Exoplanet Archive tests
│   ├── test_stage8_globe.js # WebGL 3D shader tests
│   └── verify_ui.js        # UI integration validation
├── README.md               # Project documentation
└── .gitignore              # Git exclusion rules
```

---

## 🌐 WebGL 3D Lit Globe Shader Mathematics

In `js/sphere3d.js`, instead of subdividing a polygon mesh into tens of thousands of triangles, the 3D globe uses an **analytical ray-sphere intersection fragment shader**:
* **Surface Normal**: $N = (x, y, \sqrt{1 - x^2 - y^2})$
* **Sunlight Vector**: $L = (\cos\theta, 0.25, \sin\theta)$
* **Diffuse Illumination**: $I = \max(0, N \cdot L)$
* **Terminator Line**: $\text{smoothstep}(-0.12, 0.12, N \cdot L)$ creates an authentic atmospheric twilight boundary.
* **Fresnel Atmospheric Glow**: $\text{pow}(1.0 - N_z, 2.5)$ renders subtle Rayleigh edge scattering.

---

## 📜 Credits & Licensing

* **Data**: NASA Planetary Fact Sheet, Planetary Satellite Fact Sheet, and NASA Exoplanet Archive (Public Domain).
* **Artistic Disclaimer**: All exoplanet visualizations and models are honest **Artist's Impressions (Procedural Models)** based on transit and radial velocity archive data.
* **Watermark**: `-Made by NSK with AI`.
