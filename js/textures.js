/**
 * textures.js - Planetary Texture & Font Asset Manager
 * ----------------------------------------------------
 * Responsibilities:
 * 1. Asynchronous Font Loading: Guarantees the bold serif font is rasterized
 *    in browser memory before the Canvas API attempts to measure or render glyphs.
 * 2. Texture Loading & Caching: Loads real texture image files with Promise-based
 *    lifecycle tracking and memory caching.
 * 3. Procedural Gradient & Pattern Fallback: Synthesizes rich, procedurally generated
 *    planet textures onto an offscreen canvas if texture image files are missing,
 *    preventing blank screens and canvas tainting.
 */

const TextureManager = (() => {
  // In-memory cache for loaded Image elements (keyed by texture path)
  const imageCache = new Map();

  // In-memory cache for synthesized procedural textures (keyed by `${planetId}_${mode}`)
  const proceduralCache = new Map();

  /**
   * Ensures the target serif font is fully loaded and ready in the browser.
   * Why this matters:
   * HTML Canvas `ctx.fillText()` draws synchronously. If a web font isn't finished
   * downloading, Canvas silently falls back to a default system font (like Times New Roman),
   * producing an incorrect visual result without throwing an error.
   *
   * @param {string} fontSpec - e.g. '900 120px "Cinzel"'
   * @returns {Promise<void>}
   */
  async function ensureFontsReady(fontSpec = '900 120px "Cinzel"') {
    if (!('fonts' in document)) {
      // Fallback for older browsers without CSS Font Loading API
      return Promise.resolve();
    }

    try {
      // Explicitly request the browser to load this specific font weight/family
      await document.fonts.load(fontSpec);
      // Wait for all queued font faces to be decoded
      await document.fonts.ready;
    } catch (err) {
      console.warn('Font loading check completed with fallback:', err);
    }
  }

  /**
   * Loads an image from a URL or relative path using an asynchronous Promise.
   *
   * @param {string} src - Path to the image file
   * @returns {Promise<HTMLImageElement>}
   */
  function loadImage(src) {
    // Return cached image if already loaded
    if (imageCache.has(src)) {
      return Promise.resolve(imageCache.get(src));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      // Allow cross-origin access if loaded from external CDNs
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };

      img.onerror = (err) => {
        reject(new Error(`Failed to load texture at ${src}`));
      };

      img.src = src;
    });
  }

  /**
   * Generates a rich procedural planetary texture on an in-memory canvas.
   * Used as the primary fallback when external image assets don't exist yet,
   * ensuring the student sees distinct planetary surfaces immediately.
   *
   * @param {Object} planet - Planet data object from planets.json
   * @param {string} mode - 'day' or 'night'
   * @returns {HTMLCanvasElement} - Offscreen canvas ready to be used as a texture
   */
  // Globe canvas is max 480px wide — 512×256 texture is plenty (no visible quality loss).
  // 1024×512 was 4× extra work with zero visual benefit on a sphere.
  const TEX_W = 512;
  const TEX_H = 256;
  // 3 octaves: fast and still organically detailed. 5 was overkill.
  const BASE_OCT = 3;


  function generateProceduralTexture(planet, mode = 'day', forceRefresh = false) {
    const cacheKey = `${planet.id}_${mode}`;
    if (!forceRefresh && proceduralCache.has(cacheKey)) {
      return proceduralCache.get(cacheKey);
    }

    const canvas = document.createElement('canvas');
    canvas.width = TEX_W;
    canvas.height = TEX_H;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // â”€â”€ Noise helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Seeded hash â€” stable across calls
    const hash = (x, y) => {
      let n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };
    // Bilinear value noise [0..1]
    const vnoise = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const u = x - xi, v = y - yi;
      const su = u*u*(3-2*u), sv = v*v*(3-2*v);
      return hash(xi,yi)*(1-su)*(1-sv) + hash(xi+1,yi)*su*(1-sv)
           + hash(xi,yi+1)*(1-su)*sv   + hash(xi+1,yi+1)*su*sv;
    };
    // Fractional Brownian Motion â€” layered noise for organic look
    const fbm = (x, y, oct=BASE_OCT, gain=0.5, lac=2.1) => {
      let v=0, amp=0.5, freq=1, max=0;
      for (let i=0;i<oct;i++){v+=vnoise(x*freq,y*freq)*amp;max+=amp;amp*=gain;freq*=lac;}
      return v/max;
    };
    // Lerp between two [r,g,b] colours
    const lerpRGB = (a, b, t) => [
      a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t
    ];
    // Fill canvas pixel by pixel using a callback(px,py) â†’ [r,g,b,a]
    const fillPixels = (cb) => {
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let py=0; py<h; py++) {
        for (let px=0; px<w; px++) {
          const [r,g,b,a=255] = cb(px/w, py/h);
          const i = (py*w+px)*4;
          d[i]=r; d[i+1]=g; d[i+2]=b; d[i+3]=a;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const id = planet.id || '';

    switch(id) {

      // â”€â”€ SUN â”€ orange-yellow granulation, dark sunspots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'sun': {
        fillPixels((x,y) => {
          const gran = fbm(x*18, y*18, 6, 0.45);
          const hot  = fbm(x*6+3, y*6+1, 4, 0.5);
          const t    = gran*0.7 + hot*0.3;
          const spot = fbm(x*9+7, y*9+5, 3, 0.6);
          if (spot > 0.72) return [40,20,5,255];   // sunspot
          return lerpRGB([230,110,10],[255,210,60], t).concat(255);
        });
        break;
      }

      // â”€â”€ MERCURY â”€ light grey, heavily cratered â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'mercury': {
        fillPixels((x,y) => {
          const base = fbm(x*8+2, y*8+1, 5, 0.5);
          const v = Math.round(140 + base*60);
          return [v, v-5, v-10, 255];
        });
        // Craters
        ctx.globalAlpha = 1;
        for (let i=0;i<90;i++){
          const cx=(hash(i*7,1)*w)|0, cy=(hash(i*11,2)*h)|0;
          const r=4+hash(i*3,5)*20;
          const dark = `rgba(90,88,85,0.55)`;
          const rim  = `rgba(210,208,200,0.5)`;
          ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
          ctx.fillStyle=dark; ctx.fill();
          ctx.strokeStyle=rim; ctx.lineWidth=1.2; ctx.stroke();
        }
        break;
      }

      // â”€â”€ VENUS â”€ golden/cream swirling cloud bands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'venus': {
        fillPixels((x,y) => {
          const swirl = fbm(x*4+Math.sin(y*Math.PI*3)*0.3, y*5, 5, 0.5);
          const band  = 0.5+0.5*Math.sin(y*Math.PI*10 + swirl*4);
          const c     = lerpRGB([195,145,60],[240,215,140], swirl*0.6+band*0.4);
          return c.concat(255);
        });
        break;
      }

      // â”€â”€ EARTH (day) â”€ blue ocean, green/brown continents, white clouds â”€â”€â”€
      // â”€â”€ EARTH (night) â”€ black with city lights â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'earth': {
        if (mode === 'night') {
          fillPixels((x,y) => {
            const n = fbm(x*12+1, y*12+2, 4, 0.5);
            if (n > 0.54) {
              const bright = (n-0.54)*5;
              return [200+bright*55, 190+bright*40, 100+bright*30, 255];
            }
            return [4,8,18,255];
          });
        } else {
          fillPixels((x,y) => {
            const land = fbm(x*5+0.3, y*5+0.7, 6, 0.52);
            const cloud= fbm(x*7+2.1, y*6+1.3, 4, 0.5);
            if (cloud > 0.60) return [230,235,240,255];   // cloud
            if (land > 0.50)  {
              const topo = fbm(x*10, y*10, 3, 0.5);
              const c = lerpRGB([90,120,55],[160,130,80], topo);
              return c.concat(255);                        // land
            }
            const depth = fbm(x*6+4, y*6+3, 3, 0.5)*0.3;
            return lerpRGB([20,70,160],[40,120,200], land/0.5+depth).concat(255); // ocean
          });
        }
        break;
      }

      // â”€â”€ MOON â”€ grey with dark circular maria, craters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'moon': {
        fillPixels((x,y) => {
          const base = fbm(x*7+1, y*7+2, 5, 0.5);
          const v = Math.round(120 + base*70);
          return [v,v,v,255];
        });
        // Dark maria (seas)
        const maria=[{x:0.28,y:0.43,rx:135,ry:80},{x:0.55,y:0.40,rx:105,ry:70},
                     {x:0.75,y:0.55,rx:80,ry:55},{x:0.14,y:0.60,rx:65,ry:45}];
        maria.forEach(m=>{
          const g=ctx.createRadialGradient(w*m.x,h*m.y,5,w*m.x,h*m.y,m.rx);
          g.addColorStop(0,'rgba(60,60,65,0.75)'); g.addColorStop(1,'transparent');
          ctx.fillStyle=g; ctx.beginPath();
          ctx.ellipse(w*m.x,h*m.y,m.rx,m.ry,0,0,Math.PI*2); ctx.fill();
        });
        for(let i=0;i<70;i++){
          const cx=(hash(i*7,3)*w)|0, cy=(hash(i*11,5)*h)|0, r=3+hash(i*5,1)*18;
          ctx.fillStyle='rgba(55,53,52,0.5)'; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle='rgba(210,208,200,0.45)'; ctx.lineWidth=1; ctx.stroke();
        }
        break;
      }

      // â”€â”€ MARS â”€ red-brown terrain, volcanic plains, polar caps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'mars': {
        fillPixels((x,y) => {
          const base = fbm(x*6+1, y*6+2, 5, 0.52);
          const dark = fbm(x*3+4, y*3+3, 3, 0.5);
          if (dark > 0.58) return lerpRGB([100,35,15],[130,55,25], base).concat(255);
          return lerpRGB([170,75,45],[210,110,70], base).concat(255);
        });
        // Polar ice caps
        ctx.fillStyle='rgba(240,240,250,0.85)';
        ctx.beginPath(); ctx.ellipse(w*.5,12,w*.18,22,0,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w*.5,h-12,w*.13,16,0,0,Math.PI*2); ctx.fill();
        break;
      }

      // â”€â”€ JUPITER â”€ tan/pink/brown horizontal bands + Great Red Spot â”€â”€â”€â”€â”€â”€â”€
      case 'jupiter': {
        const jPalette=[
          [205,175,125],[165,120,80],[220,185,140],[130,85,55],
          [215,170,120],[175,115,65],[195,155,110],[145,90,60]
        ];
        fillPixels((x,y) => {
          const wave = fbm(x*3+1, y*0.5, 3, 0.5)*0.06;
          const band = (y + wave) * 8 % 1;
          const idx  = Math.floor((y+wave)*8) % jPalette.length;
          const turb = fbm(x*6+y*2, y*4, 4, 0.5)*0.15;
          const c    = lerpRGB(jPalette[idx], jPalette[(idx+1)%jPalette.length], turb);
          return c.concat(255);
        });
        // Great Red Spot
        const g=ctx.createRadialGradient(w*.62,h*.62,5,w*.62,h*.62,68);
        g.addColorStop(0,'rgba(180,50,30,0.9)'); g.addColorStop(0.7,'rgba(145,40,22,0.8)'); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(w*.62,h*.62,72,44,-0.1,0,Math.PI*2); ctx.fill();
        break;
      }

      // â”€â”€ SATURN â”€ golden/cream bands, lighter and more uniform than Jupiter
      case 'saturn': {
        const sPalette=[
          [225,200,145],[195,165,105],[235,215,165],[180,150,95],
          [220,195,140],[200,170,110]
        ];
        fillPixels((x,y) => {
          const wave = fbm(x*2+2, y*0.3, 3, 0.5)*0.04;
          const idx  = Math.floor((y+wave)*6) % sPalette.length;
          const turb = fbm(x*4+2, y*3+1, 3, 0.45)*0.12;
          const c    = lerpRGB(sPalette[idx], sPalette[(idx+1)%sPalette.length], turb);
          return c.concat(255);
        });
        break;
      }

      // â”€â”€ URANUS â”€ uniform pale teal-cyan, nearly featureless â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'uranus': {
        fillPixels((x,y) => {
          const n = fbm(x*3, y*2, 3, 0.4)*0.12;
          const pole=Math.abs(y-0.5)*2;
          return lerpRGB([100,210,205],[60,175,190], n+pole*0.15).concat(255);
        });
        break;
      }

      // â”€â”€ NEPTUNE â”€ deep royal blue, horizontal white cloud streaks â”€â”€â”€â”€â”€â”€â”€â”€
      case 'neptune': {
        fillPixels((x,y) => {
          const band = fbm(x*2+1, y*1.5, 3, 0.5)*0.08;
          const c    = lerpRGB([20,60,185],[30,90,210], 0.5+0.5*Math.sin((y+band)*Math.PI*8));
          return c.concat(255);
        });
        // Great Dark Spot
        const gds=ctx.createRadialGradient(w*.42,h*.44,5,w*.42,h*.44,72);
        gds.addColorStop(0,'rgba(5,10,60,0.8)'); gds.addColorStop(1,'transparent');
        ctx.fillStyle=gds; ctx.beginPath(); ctx.ellipse(w*.42,h*.44,80,50,-0.15,0,Math.PI*2); ctx.fill();
        // Cloud streaks
        ctx.fillStyle='rgba(200,225,255,0.55)';
        for(let i=0;i<8;i++){
          const y2=h*(0.18+i*0.085);
          ctx.beginPath(); ctx.ellipse(w*(0.3+hash(i,3)*0.3),y2,70+hash(i*2,5)*60,6,0,0,Math.PI*2); ctx.fill();
        }
        break;
      }

      // â”€â”€ PLUTO â”€ brown-grey mottled, Tombaugh heart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'pluto': {
        fillPixels((x,y) => {
          const base = fbm(x*7+1, y*7+2, 5, 0.5);
          const dark = fbm(x*4+3, y*4+1, 3, 0.5);
          if (dark > 0.60) return lerpRGB([80,55,40],[110,80,60], base).concat(255);
          return lerpRGB([130,110,90],[165,140,115], base).concat(255);
        });
        // Tombaugh Regio (the heart â€” white nitrogen plains)
        const hg=ctx.createRadialGradient(w*.55,h*.52,5,w*.55,h*.52,130);
        hg.addColorStop(0,'rgba(235,228,215,0.95)'); hg.addColorStop(0.7,'rgba(215,205,190,0.7)'); hg.addColorStop(1,'transparent');
        ctx.fillStyle=hg; ctx.beginPath(); ctx.ellipse(w*.55,h*.52,125,88,0.3,0,Math.PI*2); ctx.fill();
        break;
      }

      // â”€â”€ IO â”€ bright yellow sulphur, black caldera spots, red rings â”€â”€â”€â”€â”€â”€â”€â”€
      case 'io': {
        fillPixels((x,y) => {
          const base = fbm(x*6+1, y*6+2, 4, 0.5);
          const spot = fbm(x*9+5, y*9+4, 3, 0.5);
          if (spot > 0.68) return [20,16,10,255];           // caldera black
          if (spot > 0.62) return [160,50,15,255];           // volcanic red
          return lerpRGB([215,185,60],[245,225,120], base).concat(255); // sulphur yellow
        });
        break;
      }

      // â”€â”€ EUROPA â”€ white-blue ice, red-brown crack lineae â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'europa': {
        fillPixels((x,y) => {
          const base = fbm(x*5+1, y*5+1, 4, 0.48);
          return lerpRGB([195,215,230],[230,240,248], base).concat(255);
        });
        // Crack network
        ctx.globalAlpha=1;
        for(let i=0;i<32;i++){
          ctx.beginPath();
          ctx.moveTo(hash(i*7,1)*w, hash(i*3,2)*h);
          ctx.bezierCurveTo(hash(i*11,3)*w,hash(i*5,4)*h, hash(i*13,5)*w,hash(i*7,6)*h, hash(i*17,7)*w,hash(i*9,8)*h);
          ctx.lineWidth=1.5+hash(i*5,9)*3;
          ctx.strokeStyle=`rgba(${130+hash(i,10)*40|0},${60+hash(i,11)*20|0},${20+hash(i,12)*15|0},0.65)`;
          ctx.stroke();
        }
        break;
      }

      // â”€â”€ GANYMEDE â”€ grey, dark patches, lighter grooved terrain â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'ganymede': {
        fillPixels((x,y) => {
          const base = fbm(x*6+2, y*6+1, 5, 0.5);
          const dark = fbm(x*3+5, y*3+4, 3, 0.5);
          if (dark > 0.57) { const v=60+base*35|0; return [v,v,v,255]; }
          const v=105+base*50|0; return [v,v,v+5,255];
        });
        // Grooved terrain bands
        ctx.strokeStyle='rgba(175,175,180,0.35)'; ctx.lineWidth=2;
        for(let y=15;y<h;y+=20){
          ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y+hash(y,3)*12-6); ctx.stroke();
        }
        break;
      }

      // â”€â”€ CALLISTO â”€ very dark, saturated craters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'callisto': {
        fillPixels((x,y) => {
          const base = fbm(x*8+3, y*8+2, 5, 0.5);
          const v=40+base*45|0; return [v,v-2,v-4,255];
        });
        for(let i=0;i<100;i++){
          const cx=hash(i*7,1)*w, cy=hash(i*11,2)*h, r=3+hash(i*3,5)*18;
          ctx.fillStyle='rgba(22,20,18,0.6)'; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle='rgba(130,125,120,0.38)'; ctx.lineWidth=1; ctx.stroke();
        }
        break;
      }

      // â”€â”€ ENCELADUS â”€ brilliant white ice, blue tiger stripes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'enceladus': {
        fillPixels((x,y) => {
          const n = fbm(x*8, y*8, 4, 0.45)*0.12;
          const v = 220+n*35|0;
          return [v,v,v+15,255];
        });
        // Tiger stripes at south pole
        ctx.strokeStyle='rgba(0,120,195,0.8)'; ctx.lineWidth=4;
        for(let i=0;i<5;i++){
          const sx=w*(0.30+i*0.08);
          ctx.beginPath(); ctx.moveTo(sx,h*0.70); ctx.quadraticCurveTo(sx+15,h*0.83,sx+28,h*0.97); ctx.stroke();
        }
        // Plume glow
        const pg=ctx.createRadialGradient(w*.5,h,5,w*.5,h,130);
        pg.addColorStop(0,'rgba(80,180,255,0.45)'); pg.addColorStop(1,'transparent');
        ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(w*.5,h,130,0,Math.PI*2); ctx.fill();
        break;
      }

      // â”€â”€ TITAN â”€ uniform amber/orange photochemical haze â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'titan': {
        fillPixels((x,y) => {
          const haze = fbm(x*4+1, y*3+2, 4, 0.5);
          const band = 0.5+0.3*Math.sin(y*Math.PI*6);
          return lerpRGB([185,105,15],[220,155,40], haze*0.6+band*0.4).concat(255);
        });
        break;
      }

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ EXOPLANETS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

      // TRAPPIST-1 e â”€ purple-brown land, dark teal seas, pink clouds â”€â”€â”€â”€â”€â”€â”€â”€
      case 'trappist_1_e': {
        fillPixels((x,y) => {
          const land  = fbm(x*5+0.5, y*5+0.8, 6, 0.52);
          const cloud = fbm(x*7+2.0, y*6+1.5, 4, 0.5);
          if (cloud > 0.62) return [210,175,185,255];           // pink-tinged cloud
          if (land  > 0.50) return lerpRGB([95,55,70],[140,90,100], fbm(x*10,y*10,3,.5)).concat(255); // purple-brown land
          return lerpRGB([20,65,75],[35,90,100], land/0.5).concat(255); // dark teal sea
        });
        break;
      }

      // TRAPPIST-1 f â”€ colder, icier sibling of 1e â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'trappist_1_f': {
        fillPixels((x,y) => {
          const land  = fbm(x*5+1.2, y*5+0.3, 6, 0.52);
          const cloud = fbm(x*6+3.1, y*6+2.2, 4, 0.5);
          const pole  = Math.abs(y-0.5)*2;
          if (pole > 0.75 || cloud > 0.64) return [215,220,230,255]; // ice/cloud
          if (land > 0.52) return lerpRGB([80,50,65],[115,75,85], fbm(x*9,y*9,3,.5)).concat(255);
          return lerpRGB([15,55,70],[28,75,90], land/0.52).concat(255);
        });
        break;
      }

      // Proxima Cen b â”€ tidally locked: bright hot side, dark icy cold side â”€
      case 'proxima_cen_b': {
        fillPixels((x,y) => {
          // Tidally locked: centre x=0.5 is the substellar point
          const dist = Math.abs(x - 0.5)*2;  // 0=hot, 1=cold
          const land = fbm(x*5+0.7, y*5+1.1, 5, 0.5);
          if (dist < 0.25) {
            // Hot bright day side
            return lerpRGB([220,190,130],[255,230,180], land).concat(255);
          } else if (dist > 0.75) {
            // Frozen night side
            return lerpRGB([30,35,55],[55,65,90], land).concat(255);
          }
          // Terminator â€” transition zone
          const t = (dist-0.25)/0.5;
          const hot=[180,155,100], cold=[40,50,70];
          return lerpRGB(hot,cold,t).concat(255);
        });
        break;
      }

      // Kepler-186 f â”€ maroon/orange land, indigo seas, big ice caps â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'kepler_186_f': {
        fillPixels((x,y) => {
          const land  = fbm(x*5+0.4, y*5+0.9, 6, 0.52);
          const pole  = Math.abs(y-0.5)*2;
          const cloud = fbm(x*6+1.5, y*6+2.8, 4, 0.5);
          if (pole > 0.70) return [215,218,228,255];                    // big ice caps
          if (cloud > 0.62) return [200,195,210,255];                   // cloud
          if (land > 0.48) return lerpRGB([140,65,30],[175,100,55], fbm(x*10,y*10,3,.5)).concat(255); // maroon/orange land
          return lerpRGB([35,30,105],[55,45,140], land/0.48).concat(255); // indigo sea
        });
        break;
      }

      // Kepler-452 b â”€ old drying super-Earth: golden/olive land, turquoise seas
      case 'kepler_452_b': {
        fillPixels((x,y) => {
          const land  = fbm(x*4+1.1, y*4+0.5, 6, 0.52);
          const cloud = fbm(x*5+3.0, y*5+1.4, 4, 0.5);
          if (cloud > 0.63) return [225,220,185,255];                   // cloud/haze
          if (land > 0.45) return lerpRGB([155,135,60],[185,160,90], fbm(x*9,y*9,3,.5)).concat(255); // golden/olive land+desert
          return lerpRGB([35,125,130],[55,155,155], land/0.45).concat(255); // turquoise sea
        });
        break;
      }

      // Kepler-22 b â”€ global ocean world: teal-green sea, tiny islands â”€â”€â”€â”€â”€â”€
      case 'kepler_22_b': {
        fillPixels((x,y) => {
          const ocean = fbm(x*5+2.2, y*5+0.6, 6, 0.52);
          const cloud = fbm(x*8+0.5, y*7+3.1, 4, 0.5);
          if (cloud > 0.64) return [235,240,245,255];                   // swirling cloud
          if (ocean > 0.68) return lerpRGB([65,115,80],[90,145,105], fbm(x*12,y*12,3,.5)).concat(255); // tiny island
          return lerpRGB([18,95,100],[30,130,130], ocean/0.68).concat(255); // teal-green ocean
        });
        break;
      }

      // WASP-76 b â”€ tidally locked ultra-hot Jupiter, iron rain on night side
      case 'wasp_76_b': {
        fillPixels((x,y) => {
          const dist = Math.abs(x-0.5)*2;
          const n    = fbm(x*5+1, y*5+1, 4, 0.5)*0.2;
          const band = 0.5+0.3*Math.sin(y*Math.PI*10+n*5);
          if (dist < 0.3) {
            return lerpRGB([230,155,30],[255,210,80], band*0.6+n).concat(255); // blazing day side
          } else if (dist > 0.7) {
            return lerpRGB([25,10,5],[60,25,10], band*0.4+n).concat(255);      // dark iron-rain night
          }
          const t=(dist-0.3)/0.4;
          return lerpRGB([200,100,20],[35,15,8],t).concat(255);
        });
        break;
      }

      // WASP-12 b â”€ very hot, bloated, deep red-orange gas giant â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'wasp_12_b': {
        fillPixels((x,y) => {
          const n    = fbm(x*4+2, y*4+1, 4, 0.5);
          const band = 0.5+0.4*Math.sin(y*Math.PI*8+n*3);
          return lerpRGB([120,30,5],[195,80,20], n*0.5+band*0.5).concat(255);
        });
        break;
      }

      // 55 Cnc e â”€ lava world: dark surface with glowing orange fissures â”€â”€â”€â”€â”€
      case '55_cnc_e': {
        fillPixels((x,y) => {
          const lava = fbm(x*10+0.5, y*10+0.5, 5, 0.55);
          const fiss = fbm(x*15+2, y*15+3, 4, 0.6);
          if (fiss > 0.62) return lerpRGB([210,110,10],[255,160,20], (fiss-0.62)/0.38).concat(255); // glowing fissure
          return lerpRGB([20,8,4],[50,20,10], lava).concat(255); // dark crust
        });
        break;
      }

      // HD 189733 b â”€ deep cobalt-blue banded gas giant, azure clouds â”€â”€â”€â”€â”€â”€â”€â”€
      case 'hd_189733_b': {
        fillPixels((x,y) => {
          const n    = fbm(x*4+1, y*3, 4, 0.5);
          const band = 0.5+0.45*Math.sin(y*Math.PI*12+n*3);
          return lerpRGB([15,45,170],[25,80,220], n*0.4+band*0.6).concat(255);
        });
        // Bright cloud streaks
        ctx.fillStyle='rgba(170,200,255,0.5)';
        for(let i=0;i<10;i++){
          ctx.beginPath(); ctx.ellipse(w*(hash(i*7,3)*.6+.2),h*(hash(i*5,4)*.8+.1),55+hash(i,5)*50,7,0,0,Math.PI*2); ctx.fill();
        }
        break;
      }

      // HD 209458 b â”€ blue-purple "Osiris", evaporating atmosphere â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case 'hd_209458_b': {
        fillPixels((x,y) => {
          const n    = fbm(x*4+3, y*3+2, 4, 0.5);
          const band = 0.5+0.35*Math.sin(y*Math.PI*9+n*2);
          // Purple-blue blend
          const c    = lerpRGB([60,20,130],[90,50,190], n*0.5+band*0.5);
          return c.concat(255);
        });
        break;
      }

      // TOI-700 d â”€ cloud-wrapped, hazy blue ocean, tan land showing through â”€
      case 'toi_700_d': {
        fillPixels((x,y) => {
          const land  = fbm(x*4+0.8, y*4+1.2, 5, 0.52);
          const cloud = fbm(x*6+1.8, y*5+3.0, 4, 0.5);
          if (cloud > 0.58) return [185,195,210,255];                    // thick cloud haze
          if (land > 0.52) return lerpRGB([150,120,75],[180,150,100], fbm(x*8,y*8,3,.5)).concat(255); // tan land
          return lerpRGB([35,80,130],[50,110,165], land/0.52).concat(255); // muted blue ocean
        });
        break;
      }

      // â”€â”€ Default / unknown world â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      default: {
        const primary   = planet.color || '#3a7bd5';
        const secondary = planet.secondaryColor || '#1a3a6a';
        const parseHex = h => { const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16); return [r,g,b]; };
        const p1 = parseHex(primary.length===7?primary:'#3a7bd5');
        const p2 = parseHex(secondary.length===7?secondary:'#1a3a6a');
        fillPixels((x,y) => {
          const n = fbm(x*5+1, y*5+1, 5, 0.5);
          const band = 0.5+0.4*Math.sin(y*Math.PI*8+n*3);
          return lerpRGB(p2, p1, n*0.5+band*0.5).concat(255);
        });
        break;
      }
    }

    ctx.globalAlpha = 1.0;
    proceduralCache.set(cacheKey, canvas);
    return canvas;
  }

  /**
   * Retrieves a texture for the given planet and mode.
   * Tries to load the external image file first; if missing or on error,
   * falls back immediately to the rich procedural planet canvas.
   *
   * @param {Object} planet - Planet data object
   * @param {string} mode - 'day' or 'night'
   * @returns {Promise<CanvasImageSource>}
   */
  async function getPlanetTexture(planet, mode = 'day') {
    if (!planet) {
      throw new Error('No planet provided to TextureManager');
    }

    // Try to load external image file if path is specified
    if (planet.texture) {
      try {
        const img = await loadImage(planet.texture);
        return img;
      } catch (err) {
        // Image missing or failed to load: fall back smoothly to procedural texture
        // (as requested for Stage 1 placeholder gradients)
      }
    }

    // Fall back to generated procedural gradient/pattern canvas
    return generateProceduralTexture(planet, mode);
  }

  return {
    ensureFontsReady,
    loadImage,
    generateProceduralTexture,
    getPlanetTexture
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextureManager;
}
