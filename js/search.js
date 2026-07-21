// Store all parking data for searching
let allParkingData = [];

// Geolocation button
document.getElementById('locate-btn').addEventListener('click', function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        window.map.setView([lat, lng], 16);
        
        // Add a temporary marker at user location
        L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: '#3b82f6',
          color: '#1e40af',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(window.map).bindPopup('Your location');
      },
      function(error) {
        alert('Unable to get your location: ' + error.message);
      }
    );
  } else {
    alert('Geolocation is not supported by your browser');
  }
});

// Search functionality
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', function() {
  const query = this.value.trim().toLowerCase();
  
  if (query.length < 2) {
    searchResults.classList.remove('active');
    return;
  }
  
  // Filter parking data based on search query
  const results = allParkingData.filter(item => {
    return (
      (item.on_street && item.on_street.toLowerCase().includes(query)) ||
      (item.street_from && item.street_from.toLowerCase().includes(query)) ||
      (item.street_to && item.street_to.toLowerCase().includes(query)) ||
      (item.parking_zone && item.parking_zone.toLowerCase().includes(query))
    );
  });
  
  // Remove duplicates based on street name
  const uniqueResults = [];
  const seen = new Set();
  
  results.forEach(item => {
    const key = `${item.on_street}|${item.street_from}|${item.street_to}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  });
  
  displaySearchResults(uniqueResults.slice(0, 10));
});

function displaySearchResults(results) {
  searchResults.innerHTML = '';
  
  if (results.length === 0) {
    searchResults.classList.remove('active');
    return;
  }
  
  results.forEach(result => {
    const div = document.createElement('div');
    div.className = 'search-result';
    div.textContent = `${result.on_street}, ${result.street_from} - ${result.street_to}`;
    
    div.addEventListener('click', function() {
      // Find the average location of all parking spots on this street
      const streetData = allParkingData.filter(item => 
        item.on_street === result.on_street &&
        item.street_from === result.street_from &&
        item.street_to === result.street_to
      );
      
      if (streetData.length > 0) {
        const avgLat = streetData.reduce((sum, item) => sum + parseFloat(item.latitude), 0) / streetData.length;
        const avgLng = streetData.reduce((sum, item) => sum + parseFloat(item.longitude), 0) / streetData.length;
        
        window.map.setView([avgLat, avgLng], 16);
        searchResults.classList.remove('active');
        searchInput.value = '';
      }
    });
    
    searchResults.appendChild(div);
  });
  
  searchResults.classList.add('active');
}

// Close search results when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('#search-container')) {
    searchResults.classList.remove('active');
  }
});

// Populate parking data from CSV (called from parking.js)
function setParkingData(data) {
  allParkingData = data;
}
