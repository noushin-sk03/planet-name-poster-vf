const http = require('http');

http.get('http://localhost:8080/index.html?v=16.0', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Hero Subheading present:', data.includes('Generate your name'));
    console.log('Watermark present:', data.includes('-Made by NSK with AI'));
    console.log('GitHub Link present:', data.includes('Click here to see GitHub repository'));
    console.log('Satellite Icon present:', data.includes('satellite-icon-svg'));
    console.log('Panel Minimize Button present:', data.includes('panel-minimize-btn'));
    console.log('Stage 08 Pill present:', data.includes('Stage 08'));
    console.log('WebGL 3D Globe elements present:', data.includes('globe-canvas-wrap') && data.includes('terminator-slider'));
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
