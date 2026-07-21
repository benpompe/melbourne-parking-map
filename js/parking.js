
fetch("data/parking-zones-map-data-simple.csv")
  .then(response => response.text())
  .then(csvText => {

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    console.log("Rows:", parsed.data.length);

    const groups = {};

    parsed.data.forEach(row => {

      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      // Skip loading zones completely
      const restrictionCode = (row.restriction_code || "").toUpperCase();
      if (restrictionCode === "LZ30" || restrictionCode === "LZ") {
        return;
      }

      const zone = row.parking_zone || "unknown";
      const restriction = row.restriction_code || "unknown";

      const key = zone + "|" + restriction;

      if (!groups[key]) {
        groups[key] = {
          points: [],
          duration: row.duration,
          restriction_code: row.restriction_code,
          restriction_summary: row.restriction_summary,
          marker_colour: row.marker_colour,
          on_street: row.on_street,
          street_from: row.street_from,
          street_to: row.street_to,
          parking_zone: row.parking_zone
        };
      }

      groups[key].points.push([lat, lng]);

    });

    console.log("Marker groups:", Object.keys(groups).length);

    Object.values(groups).forEach(group => {

      const avgLat =
        group.points.reduce((sum, p) => sum + p[0], 0) /
        group.points.length;

      const avgLng =
        group.points.reduce((sum, p) => sum + p[1], 0) /
        group.points.length;

      const markerClass =
        getMarkerClass(group.restriction_code);

      const icon = L.divIcon({
        className: "parking-marker",
        html: `
          <div class="parking-pill ${markerClass}">
            ${group.duration}
          </div>
        `,
        iconSize: [54, 26],
        iconAnchor: [27, 13]
      });

      L.marker(
        [avgLat, avgLng],
        { icon }
      )
      .addTo(window.map)
      .bindPopup(
        `
        <strong>${group.duration}</strong><br>
        ${group.restriction_summary}<br><br>
        <strong>Street:</strong> ${group.on_street}<br>
        <strong>From:</strong> ${group.street_from}<br>
        <strong>To:</strong> ${group.street_to}
        `
      );

    });

  })
  .catch(error => {
    console.error("CSV loading error:", error);
  });

function getMarkerClass(restriction) {

  const code = (restriction || "").toUpperCase().trim();

  // Check for special parking types (exact match)
  if (code === "PP") {
    return "marker-permit";
  }

  if (code === "DP") {
    return "marker-disabled";
  }

  // Check for duration-based parking (extract the number: 1P, 2P, 3P, 4P)
  // This handles both "2P" and "MP2P" formats
  if (code.includes("1P")) {
    return "marker-1p";
  }

  if (code.includes("2P")) {
    return "marker-2p";
  }

  if (code.includes("3P")) {
    return "marker-3p";
  }

  if (code.includes("4P")) {
    return "marker-4p";
  }

  return "marker-default";
}
