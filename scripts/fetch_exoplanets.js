/**
 * fetch_exoplanets.js - One-off script to download confirmed exoplanets
 * from the NASA Exoplanet Archive TAP API into static data/exoplanets.json.
 *
 * Why this script is needed:
 * The NASA Exoplanet Archive does not serve `Access-Control-Allow-Origin: *` headers,
 * making direct browser-side `fetch()` impossible due to CORS restrictions.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 12 Famous confirmed exoplanets across diverse temperature and size classes
const famousExoplanets = [
  'Proxima Cen b',
  'TRAPPIST-1 e',
  'TRAPPIST-1 f',
  'Kepler-186 f',
  'Kepler-452 b',
  'Kepler-22 b',
  'WASP-12 b',
  'WASP-76 b',
  '55 Cnc e',
  'HD 209458 b',
  'HD 189733 b',
  'TOI-700 d'
];

// Aesthetic temperature palette mapping for procedural artist's impressions
function getExoplanetPalette(eqTempK) {
  if (eqTempK === null || eqTempK === undefined) {
    return { primary: '#64748b', secondary: '#1e293b', accent: '#94a3b8', glow: 'rgba(100, 116, 139, 0.5)' };
  }
  if (eqTempK > 1800) {
    // Ultra-hot Jupiter (vaporized iron / silicates): fiery ember & molten white
    return { primary: '#dc2626', secondary: '#7f1d1d', accent: '#fef08a', glow: 'rgba(239, 68, 68, 0.65)' };
  } else if (eqTempK > 1000) {
    // Hot Jupiter (silicate glass clouds / sodium absorption): cobalt or orange
    return { primary: '#2563eb', secondary: '#1e1b4b', accent: '#93c5fd', glow: 'rgba(37, 99, 235, 0.6)' };
  } else if (eqTempK > 500) {
    // Warm Sub-Neptune / Super-Earth: bronze ochre & terracotta
    return { primary: '#ea580c', secondary: '#431407', accent: '#fed7aa', glow: 'rgba(234, 88, 12, 0.55)' };
  } else if (eqTempK > 220) {
    // Temperate Habitable Zone candidate: oceanic azure, terrestrial green & cloud white
    return { primary: '#0284c7', secondary: '#064e3b', accent: '#bae6fd', glow: 'rgba(2, 132, 199, 0.55)' };
  } else {
    // Frigid Ice Giant: deep methane blue & cyan frost
    return { primary: '#06b6d4', secondary: '#082f49', accent: '#cffafe', glow: 'rgba(6, 182, 212, 0.55)' };
  }
}

// TAP API query construction
const quotedNames = famousExoplanets.map(n => `'${n}'`).join(',');
const tapQuery = `select pl_name, hostname, pl_orbper, pl_rade, pl_bmasse, pl_eqt, sy_dist from ps where default_flag = 1 and pl_name in (${quotedNames})`;
const tapUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(tapQuery)}&format=json`;

console.log('Querying NASA Exoplanet Archive TAP API...');

https.get(tapUrl, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const records = JSON.parse(body);
      console.log(`Received ${records.length} records from NASA Exoplanet Archive.`);

      const exoplanets = records.map(r => {
        // Calculate surface gravity: g = G*M/R^2 = g_earth * (M_earth / R_earth^2)
        let gravStr = 'unknown';
        if (r.pl_bmasse && r.pl_rade && r.pl_rade > 0) {
          const gRatio = r.pl_bmasse / (r.pl_rade * r.pl_rade);
          const gVal = (gRatio * 9.80665).toFixed(1);
          gravStr = `${gVal} m/s²`;
        }

        // Distance in light-years (sy_dist in parsecs: 1 pc = 3.26156 ly)
        let distLy = 'unknown';
        if (r.sy_dist) {
          distLy = `${(r.sy_dist * 3.26156).toFixed(1)} ly`;
        }

        const eqTemp = r.pl_eqt ? Math.round(r.pl_eqt) : null;
        const eqTempCelsius = eqTemp ? `${eqTemp - 273} °C (Eq)` : 'unknown';

        return {
          id: r.pl_name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          name: r.pl_name,
          type: 'exoplanet',
          isArtistImpression: true,
          hostname: r.hostname || 'unknown',
          orbitalPeriodDays: r.pl_orbper ? Number(r.pl_orbper.toFixed(2)) : 'unknown',
          orbitalPeriodYears: r.pl_orbper ? Number((r.pl_orbper / 365.2425).toFixed(4)) : null,
          radiusEarths: r.pl_rade ? Number(r.pl_rade.toFixed(2)) : 'unknown',
          massEarths: r.pl_bmasse ? Number(r.pl_bmasse.toFixed(2)) : 'unknown',
          eqTempK: eqTemp || 'unknown',
          dayTemp: eqTempCelsius,
          nightTemp: 'unknown',
          lengthOfDay: r.pl_orbper ? `${Number(r.pl_orbper.toFixed(2))} days (assumed synchronous)` : 'unknown',
          gravity: gravStr,
          distance: distLy,
          dataSource: 'NASA Exoplanet Archive (IPAC/Caltech)',
          textureSource: "Artist's Impression (Procedural Model)",
          palette: getExoplanetPalette(eqTemp)
        };
      });

      const output = {
        metadata: {
          retrievedAt: new Date().toISOString(),
          source: 'NASA Exoplanet Archive (IPAC/Caltech)',
          query: tapQuery,
          notes: 'Pre-fetched to bypass browser CORS restrictions without requiring a backend server.'
        },
        planets: exoplanets
      };

      const outPath = path.join(__dirname, '..', 'data', 'exoplanets.json');
      fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
      console.log(`Saved static exoplanet dataset to ${outPath}`);
    } catch (err) {
      console.error('Failed to parse NASA response:', err.message);
    }
  });
}).on('error', err => {
  console.error('Network request failed:', err.message);
});
