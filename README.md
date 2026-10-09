# Planet Name Poster & Solar Studio 🪐

> Transform your name into a bold typographic celestial poster with verified NASA textures, explore the interactive Solar System with full orbit selection, and export high-resolution wallpapers and print designs.
>
> **-Made by NSK with AI**

---

## 🌌 Overview

**Planet Name Poster & Solar Studio** is an educational, zero-framework web application built using standard modern HTML5, CSS3, and JavaScript (Canvas 2D APIs).

* **Interactive Solar System Simulation**: Real-time orbital mechanics simulating celestial bodies orbiting the Sun, an Asteroid Belt, deep space nebulae, and galactic parallax drift traveling through the Milky Way at ~230 km/s.
* **Direct Planet & Orbit Selection**: Click any planet, the Moon, or click directly on any elliptical orbit track in the starry simulation to inspect full NASA telemetry.
* **Always-Visible Telemetry & Studio Actions**: Instant access to verified metrics (Gravity, Day Length, Mean Temp, Distance from Sun, Distance from Earth, Orbital Period, and Planetary Synopsis) with a one-click transition to the creative studio.
* **Typographic Texture Compositing**: Names up to 30 characters rasterized into an alpha mask and composited with high-resolution celestial surface imagery using Canvas 2D Porter-Duff blend modes (`source-in` and `source-atop`).
* **Day & Night Illumination**: Day mode renders authentic daytime surface illumination; Night mode darkens the surface and renders Rayleigh atmospheric backlighting and starry night skies.
* **Multi-Format Export & Wallpapers**: High-resolution downloads categorized under Social (Portrait, Square, Story, X Post, Link Preview, Pinterest), Wallpapers (PC Wallpaper 1920×1080, 4K Desktop 3840×2160, Ultrawide 2560×1080, Tablet 2048×1536, Phone Wallpaper 1170×2532), Print (A4 300 DPI), and Custom Dimensions.
* **Export Formats & Quality**: PNG (lossless), JPG, and WebP with configurable quality levels and automatic canvas fallback protections.
* **Living on Another World Biophysics**: Calculates weight on each world ($F = m \cdot \frac{g_{\text{world}}}{g_{\text{earth}}}$) and age in planetary orbital years based on birthdate.
* **Stateful Sharing & Data Export**: Shareable URLs that sync the exact configuration with zero backend using HTML5 `history.replaceState`, plus single-click JSON export of verified NASA Fact Sheets.

---

## 🚀 How to Run Locally

Because this project is built entirely with plain vanilla web technologies, there are **no build steps, no package installations, and no frameworks required**.

### Option 1: Python HTTP Server (Recommended)
Open a terminal in the project directory and run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 🧪 Running Unit Tests

The project includes 24 automated unit tests for biophysical math, tidal locking, orbital years, and URL security. You can run them via Node.js or inspect them visually in the browser:

```bash
# Terminal test runners
node tests/test_calculator.js
node tests/test_share.js
```
Or open `tests.html` directly in any web browser to view the interactive test suite.

---

## 📁 File Structure

```text
planet-name-poster/
├── index.html              # Semantic, accessible HTML structure
├── preview.png             # Lightweight Open Graph social card preview
├── css/
│   └── style.css           # Mobile-first stylesheet with design tokens & responsive grids
├── data/
│   ├── planets.json        # Verified NASA metrics for Planets, Moons, and the Sun
│   └── exoplanets.json     # NASA Exoplanet Archive compilation (IPAC/Caltech TAP query)
├── js/
│   ├── app.js              # Main application controller & event coordination
│   ├── canvas.js           # Canvas 2D rendering pipeline & multi-size layout config
│   ├── calculator.js       # Pure biophysical & orbital calculation functions
│   ├── textures.js         # Asynchronous font loading & procedural texture fallback
│   ├── share.js            # Pure URL state parsing, serialization, and XSS sanitization
│   └── sphere3d.js         # WebGL analytical raytraced 3D sphere with moving terminator
├── scripts/
│   └── fetch_exoplanets.js # Script to refresh exoplanet data from NASA Exoplanet Archive
├── tests/
│   ├── test_calculator.js  # Unit tests for biophysical math & edge cases (16 tests)
│   └── test_share.js       # Unit tests for URL state & sanitation (8 tests)
├── tests.html              # In-browser visual unit test runner
├── textures/               # Planetary surface imagery
├── CREDITS.md              # Comprehensive licensing and NASA image attribution
├── README.md               # Project documentation and guide
└── .gitignore              # Git exclusion rules
```

---

## 🎨 How the Texture-in-Text Effect Works

```
1. Draw solid text (alpha mask)
      ↓
2. globalCompositeOperation = 'source-in'
   (Clips planet texture to glyph silhouettes)
      ↓
3. globalCompositeOperation = 'source-atop'
   (Draws Day sunlight gradient or Night shadow tint over letters)
      ↓
4. Composite onto Main Canvas
   (Draws outer glow for Night or vector rim stroke for Day)
```

---

## 🌐 3D Lit Globe WebGL Shader Architecture

In `js/sphere3d.js`, instead of subdividing a polygon mesh into tens of thousands of triangles, the 3D globe uses an **analytical ray-sphere intersection fragment shader**:
* **Surface Normal**: $N = (x, y, \sqrt{1 - x^2 - y^2})$
* **Sunlight Vector**: $L = (\cos\theta, 0.25, \sin\theta)$
* **Diffuse Illumination**: $I = \max(0, N \cdot L)$
* **Terminator Line**: $\text{smoothstep}(-0.12, 0.12, N \cdot L)$ creates an authentic atmospheric twilight boundary.
* **Fresnel Atmospheric Glow**: $\text{pow}(1.0 - N_z, 2.5)$ renders subtle Rayleigh edge scattering.

---

## 📜 Credits & Licensing

* **Data**: NASA Planetary Fact Sheet, Planetary Satellite Fact Sheet, and NASA Exoplanet Archive (Public Domain).
* **Textures**: NASA, JPL-Caltech, USGS Astrogeology Science Center, and ASU LRO.
* **Fonts**: *Cinzel* by Natanael Gama (SIL Open Font License 1.1) and *Inter* by Rasmus Andersson (SIL Open Font License 1.1).
* See [`CREDITS.md`](CREDITS.md) for full license text and per-body attribution.
