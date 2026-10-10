/**
 * sphere3d.js - Interactive 3D Planetary Sphere with Moving Day/Night Terminator
 * ------------------------------------------------------------------------------
 * Educational Concept: Analytical Raytraced Sphere via GLSL Fragment Shader
 *
 * Why an Analytical Shader instead of a Polygon Mesh:
 * 1. Mathematically Perfect: A polygon mesh (e.g. UV sphere) shows polygonal faceted edges
 *    unless subdivided into tens of thousands of triangles. An analytical ray-sphere
 *    intersection computed per-pixel in GLSL gives perfectly smooth curvature.
 * 2. Zero External Libraries: Requires no heavy 600KB libraries like Three.js;
 *    runs on standard native WebGL 1.0/2.0 in ~150 lines of code.
 * 3. Exact Lighting Maths:
 *    - Surface Normal: N = (x, y, sqrt(1 - x^2 - y^2))
 *    - Sun Light Direction: L = (cos(angle), 0.2, sin(angle))
 *    - Lambertian Cosine Law: Diffuse intensity I = dot(N, L)
 *    - Atmospheric Terminator: smoothstep(-0.08, 0.08, I)
 *    - Atmospheric Fresnel Rim: pow(1.0 - N.z, 3.0)
 */

const Sphere3DViewer = (() => {
  let canvas = null;
  let gl = null;
  let program = null;
  let textureHandle = null;
  let animationId = null;

  // Shader Uniform Locations
  let uLightAngleLoc = null;
  let uRotationLoc = null;
  let uAtmosphereColorLoc = null;
  let uTextureLoc = null;

  // Interaction State
  let lightAngle = 0.8; // Radians
  let rotation = 0.0;
  let isAutoRotating = true;
  let currentPlanet = null;

  // Vertex Shader: full-screen quad (-1 to +1)
  const VS_SOURCE = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  // Fragment Shader: analytical sphere ray intersection, UV mapping & terminator lighting
  const FS_SOURCE = `
    precision mediump float;
    varying vec2 vUv;

    uniform sampler2D uTexture;
    uniform float uLightAngle;
    uniform float uRotation;
    uniform vec3 uAtmosphereColor;

    const float PI = 3.14159265359;

    void main() {
      // 1. Remap UV coordinates to normalized centered disk (-1.0 to +1.0)
      vec2 p = (vUv - 0.5) * 2.0;
      float distSq = dot(p, p);

      // Outside the sphere radius
      if (distSq > 1.0) {
        // Transparent space void
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
      }

      // 2. Analytical Sphere Normal Vector
      // Since z^2 + x^2 + y^2 = 1 => z = sqrt(1 - x^2 - y^2)
      float z = sqrt(1.0 - distSq);
      vec3 N = vec3(p.x, p.y, z);

      // 3. Equirectangular UV Coordinate Mapping
      // Latitude: arcsin(N.y)
      // Longitude: atan(N.x, N.z)
      float u = (atan(N.x, N.z) / (2.0 * PI)) + 0.5 + uRotation;
      float v = 0.5 - (asin(N.y) / PI);
      vec3 surfaceTex = texture2D(uTexture, vec2(fract(u), v)).rgb;

      // 4. Directional Sunlight Vector
      vec3 L = normalize(vec3(cos(uLightAngle), 0.25, sin(uLightAngle)));

      // 5. Lighting Mathematics: Lambertian Cosine Law (N . L)
      float NdotL = dot(N, L);

      // Soft twilight terminator line between day and night
      float dayFactor = smoothstep(-0.12, 0.12, NdotL);

      // 6. Day Side vs. Night Side Grading
      vec3 dayColor = surfaceTex * (0.25 + 0.9 * max(0.0, NdotL));
      vec3 nightColor = surfaceTex * 0.08; // Deep nocturnal shadow

      vec3 finalColor = mix(nightColor, dayColor, dayFactor);

      // 7. Atmospheric Rayleigh / Fresnel Rim Glow
      float fresnel = pow(1.0 - N.z, 2.5);
      vec3 rimGlow = uAtmosphereColor * fresnel * max(0.0, NdotL * 0.5 + 0.5);
      finalColor += rimGlow;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  /**
   * Compiles GLSL shader source.
   */
  function compileShader(glContext, type, source) {
    const shader = glContext.createShader(type);
    glContext.shaderSource(shader, source);
    glContext.compileShader(shader);
    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
      console.warn('WebGL shader compile error:', glContext.getShaderInfoLog(shader));
      glContext.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * Initializes WebGL context and shader program.
   * @param {HTMLCanvasElement} targetCanvas
   * @returns {boolean} - True if WebGL is supported
   */
  function init(targetCanvas) {
    canvas = targetCanvas;
    if (!canvas) return false;

    try {
      gl = canvas.getContext('webgl', { alpha: true, preserveDrawingBuffer: true }) ||
           canvas.getContext('experimental-webgl', { alpha: true, preserveDrawingBuffer: true });
    } catch (e) {
      gl = null;
    }

    if (!gl) {
      console.warn('WebGL not supported by this browser/device; keeping 2D canvas active.');
      return false;
    }

    // Compile shaders and link program
    const vs = compileShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return false;

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('WebGL program link error:', gl.getProgramInfoLog(program));
      return false;
    }

    // Set up full-screen quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const quadVertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const aPosLoc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    // Get Uniform Locations
    uLightAngleLoc = gl.getUniformLocation(program, 'uLightAngle');
    uRotationLoc = gl.getUniformLocation(program, 'uRotation');
    uAtmosphereColorLoc = gl.getUniformLocation(program, 'uAtmosphereColor');
    uTextureLoc = gl.getUniformLocation(program, 'uTexture');

    // Create 2D WebGL texture handle
    textureHandle = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureHandle);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return true;
  }

  /**
   * Uploads an image or offscreen canvas as the WebGL sphere texture.
   * @param {CanvasImageSource} source
   * @param {Object} planet
   */
  function setTexture(source, planet) {
    if (!gl || !textureHandle || !source) return;
    currentPlanet = planet;

    gl.bindTexture(gl.TEXTURE_2D, textureHandle);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  /**
   * Sets the solar lighting angle from the UI slider.
   * @param {number} angleDegrees - 0 to 360
   */
  function setLightAngle(angleDegrees) {
    lightAngle = (angleDegrees * Math.PI) / 180.0;
  }

  /**
   * Toggles automatic slow rotation of the globe.
   * @param {boolean} active
   */
  function setAutoRotate(active) {
    isAutoRotating = active;
  }

  /**
   * Main render loop.
   */
  function render() {
    if (!gl || !program) return;

    if (isAutoRotating) {
      rotation += 0.0015;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Pass Uniforms
    gl.uniform1f(uLightAngleLoc, lightAngle);
    gl.uniform1f(uRotationLoc, rotation);

    // Extract atmosphere glow color: airless rocky worlds (Moon, Mercury, Callisto, Pluto) get very subtle or no glow
    let atmos = [0.0, 0.0, 0.0];
    const airless = ['moon', 'mercury', 'callisto', 'ganymede', 'pluto'];
    const pId = (currentPlanet && currentPlanet.id) ? currentPlanet.id.toLowerCase() : '';

    if (!airless.includes(pId)) {
      const hexColor = (currentPlanet && (currentPlanet.color || (currentPlanet.palette && currentPlanet.palette.primary))) || '#38bdf8';
      const cleanHex = hexColor.replace('#', '');
      if (cleanHex.length === 6) {
        atmos = [
          parseInt(cleanHex.slice(0, 2), 16) / 255.0,
          parseInt(cleanHex.slice(2, 4), 16) / 255.0,
          parseInt(cleanHex.slice(4, 6), 16) / 255.0
        ];
      } else {
        atmos = [0.2, 0.4, 0.7];
      }
    }
    gl.uniform3f(uAtmosphereColorLoc, atmos[0], atmos[1], atmos[2]);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureHandle);
    gl.uniform1i(uTextureLoc, 0);

    // Draw full-screen quad (renders analytical sphere)
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationId = requestAnimationFrame(render);
  }

  /**
   * Starts animation loop.
   */
  function start() {
    if (!animationId) {
      animationId = requestAnimationFrame(render);
    }
  }

  /**
   * Stops animation loop to conserve battery when panel is hidden.
   */
  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  /**
   * Captures the current lit sphere as an image URL for export.
   * @returns {string} - Data URL
   */
  function captureViewDataUrl() {
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }

  return {
    init,
    setTexture,
    setLightAngle,
    setAutoRotate,
    start,
    stop,
    captureViewDataUrl,
    isSupported: () => gl !== null
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sphere3DViewer;
}
