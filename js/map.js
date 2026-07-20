
console.log("map.js started");

window.map = L.map('map').setView(
  [-37.8136, 144.9631],
  14
);

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap contributors & CARTO',
    maxZoom: 20
  }
).addTo(window.map);

console.log("tile layer added");
