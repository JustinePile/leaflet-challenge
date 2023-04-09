// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";
// Perform a GET request to the query URL.
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function style(feature) {
  return {
    opacity: 1,
    fillOpacity: 1,
    fillColor: getColor(feature.properties.mag),
    color: "#000",
    radius: getRadius(feature.properties.mag),
    stroke: true,
    weight: 0.6
  };
}

// Set different colors from magnitude
function getColor(magnitude) {
  let colors = ["#fafa6e",  "#d7f171", "#b5e877", "#95dd7d", "#77d183"];
  let thresholds = [0, 1, 2, 3, 4, 5];
  for (let i = 0; i < thresholds.length; i++) {
    if (magnitude > 0 && magnitude < 1) {
        return colors[0];
    } else if (magnitude >= 1 && magnitude < 2) {
      return colors[1];
    } else if (magnitude >= 2 && magnitude < 3) {
      return colors[2];
    } else if (magnitude >= 3 && magnitude < 4) {
      return colors[3];
    } else if (magnitude >= 4) {
    return colors[4];
  }
  }
}

// Set radius from magnitude
function getRadius(magnitude) {
  if (magnitude === 0) {
    return 1;
  }
  return magnitude * 4;
}

function createFeatures(earthquakeData) {

  // Give each feature a popup that describes the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h2>Magnitude: ${feature.properties.mag}</h2><h3>Location: ${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

  function pointToLayer(feature, latlng) {
      return L.circleMarker(latlng);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object
  let earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: onEachFeature,
    // Make circles
    pointToLayer: pointToLayer,
    // Circle style
    style: style,
    // Popup for each marker
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, topo, earthquakes]
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

};
