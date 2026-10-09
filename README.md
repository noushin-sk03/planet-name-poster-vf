# Planet Name Poster 🪐

> Transform your name into a bold typographic celestial poster filled with real planetary textures, NASA scientific facts, moons, exoplanets, and an interactive 3D WebGL globe.

---

## 🌌 Overview

**Planet Name Poster** is an educational, zero-framework web application built using standard modern HTML5, CSS3, and JavaScript (Canvas 2D & WebGL APIs).

* **Texture-in-Text Compositing**: Letters are rasterized into an alpha mask and composited using Canvas 2D Porter-Duff blend modes (`source-in` and `source-atop`).
* **Day & Night Illumination**: Day mode renders bright surface topography with an edge rim light; Night mode darkens the texture and adds a luminous atmospheric halo.
* **Solar System Planets & Moons**: Features all 8 planets, the Moon, Io, Europa, Ganymede, Callisto, Enceladus, Titan, and the Sun with verified data from the **NASA Planetary Fact Sheet** and **Planetary Satellite Fact Sheet**.
* **Confirmed Exoplanets**: 12 famous exoplanets (TRAPPIST-1e/f, Proxima Centauri b, Kepler-186f, WASP-76b, etc.) queried directly from the **NASA Exoplanet Archive (IPAC/Caltech)** with procedural thermal artist's impressions.
* **Life on Another World**: Biophysical calculations computing your weight on that world ($F = m \cdot \frac{g_{\text{world}}}{g_{\text{earth}}}$), your age in planetary orbital years, and rotational day length ratios.
* **Interactive 3D Lit Globe (Stage 08)**: A pure WebGL analytical raytraced sphere with a real-time moving day/night solar terminator line.
* **Multi-Size Export**: Instant PNG downloads formatted for **Portrait (1080×1350)**, **Square (1080×1080)**, and **Phone Story (1080×1920)**.
* **Stateful Sharing**: Shareable URLs that sync the exact configuration with zero backend using HTML5 `history.replaceState`.

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
