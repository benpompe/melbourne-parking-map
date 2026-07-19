fetch("data/parking-zones-map-data-simple.csv")
  .then(response => response.text())
  .then(csvText => {

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    
    console.log(parsed.data.length);
    console.log(parsed.data[0]);

    parsed.data.forEach(row => {
    
        const lat = parseFloat(row.latitude);
        const lng = parseFloat(row.longitude);
    
        if (isNaN(lat) || isNaN(lng)) {
            return;
        }
    
        const markerClass =
            getMarkerClass(row.restriction_code);
    
        const icon = L.divIcon({
            className: "parking-marker",
            html: `
                <div class="parking-pill ${markerClass}">
                    ${row.duration}
                </div>
            `,
            iconSize: [48, 24],
            iconAnchor: [24, 12]
        });
    
        L.marker(
            [lat, lng],
            { icon }
        )
        .addTo(window.map)
        .bindPopup(
            `
            <strong>${row.duration}</strong><br>
            ${row.restriction_summary}<br><br>
            <strong>Street:</strong> ${row.on_street}
            `
        );
    
    });

    function getMarkerClass(restriction) {
    
        const code = (restriction || "").toUpperCase();
    
        if (code.includes("1P")) return "marker-1p";
        if (code.includes("2P")) return "marker-2p";
        if (code.includes("3P")) return "marker-3p";
        if (code.includes("4P")) return "marker-4p";
    
        if (code.includes("LZ"))
            return "marker-loading";
    
        if (code.includes("PP"))
            return "marker-permit";
    
        if (code.includes("DP"))
            return "marker-disabled";
    
        return "marker-default";
    }

    
    const markerClass =
        getMarkerClass(row.restriction_code);
    
    const icon = L.divIcon({
        className: "parking-marker",
        html: `
            <div class="parking-pill ${markerClass}">
                ${row.duration}
            </div>
        `,
        iconSize: [48, 24],
        iconAnchor: [24, 12]
    });
    
    L.marker(
        [lat, lng],
        { icon }
    )
    .addTo(map)
    .bindPopup(
        `
        <strong>${row.duration}</strong><br>
        ${row.restriction_summary}<br><br>
        <strong>Street:</strong> ${row.on_street}
        `
    );

  })
  .catch(error => {
    console.error("CSV loading error:", error);
  });
