// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
// Perform a GET request to the query URL.
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function style(feature) {
  return {
    opacity: 1,
    fillOpacity: 1,
    fillColor: getColor(feature.geometry.coordinates[2]),
    color: "#000",
    radius: getRadius(feature.properties.mag),
    stroke: true,
    weight: 0.6
  };
}

// Set different colors from magnitude
function getColor(depth) {
  let colors = ["#fafa6e",  "#d7f171", "#b5e877", "#95dd7d", "#77d183"];
    if (depth < 10) {
        return colors[0];
    } else if (depth >= 10 && depth < 20) {
      return colors[1];
    } else if (depth >= 20 && depth < 30) {
      return colors[2];
    } else if (depth >= 30 && depth < 40) {
      return colors[3];
    } else if (depth >= 40) {
    return colors[4];
  }
}

// Set radius from magnitude
function getRadius(magnitude) {
  if (magnitude === 0) {
    return .1;
  }
  return magnitude * 3.5;
}

function createFeatures(earthquakeData) {

  // Give each feature a popup that describes the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h2>Depth (km): ${feature.geometry.coordinates[2]} </h2>
<h3>Magnitude: ${feature.properties.mag}</h3><h3>Location: 
${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
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
  let stamen = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>'
  });
  
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Stamen Map": stamen
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      51, -120
    ],
    zoom: 4,
    layers: [stamen, street, earthquakes]
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend.
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Depth (km)</h4>";
    div.innerHTML += '<i style="background: #fafa6e"></i><span>&lt; 10</span><br>';
    div.innerHTML += '<i style="background: #d7f171"></i><span>10 - 20</span><br>';
    div.innerHTML += '<i style="background: #b5e877"></i><span>20 - 30</span><br>';
    div.innerHTML += '<i style="background: #95dd7d"></i><span>30 - 40</span><br>';
    div.innerHTML += '<i style="background: #77d183"></i><span>&gt; 40<span><br>';
      
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);

};
