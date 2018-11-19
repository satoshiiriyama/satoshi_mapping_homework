// JSON URL
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";
var faultUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// Colors
function colorCategory(magnitude) {
  if (magnitude >= 5) {
    return '#F06B6B'
  } else if (magnitude >= 4) {
    return '#F0A76B'
  } else if (magnitude >= 3) {
    return '#F3BA4D'
  } else if (magnitude >= 2) {
    return '#F3DB4D'
  } else if (magnitude >= 1) {
    return '#E1F34D'
  } else {
    return '#B7F34D'
  }
}

// Getting data
d3.json(earthquakeUrl, function(data) {
  makingMarkers(data.features);
});

// making markers (https://leafletjs.com/examples/geojson/)
function makingMarkers(data) {       
  var earthquakeMarkers = L.geoJson(data, {
      onEachFeature: function (feature, layer){
      layer.bindPopup(`<h3> ${feature.properties.place}<br>Magnitude ${feature.properties.mag}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
      },

      //creating a circlemarker
      pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
      {radius: feature.properties.mag*20000, 
      fillColor: colorCategory(feature.properties.mag), 
      fillOpacity: 1,
      stroke: true,
      color: "black",
      weight: .5
      })
      }
  });
   //call the plotMap function
  plotMap(earthquakeMarkers)
}


function plotMap(earthquakeLayer) {

   // Create a base tile layer (satellite)
   var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });


  // Create a base tile layer (grayscale)
  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
  });

  // Create a base tile layer (outdoor)
  var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });

  //base layer with three tile maps
  var baseMaps = {
    "Satellite Map": satellite,
    "Grayscale": grayscale,
    "Outdoor": outdoor,
  };


  // create faultline layer, make a json call to retrieve fault line data
  var faultLineLayer = new L.LayerGroup();
    
  d3.json(faultUrl, function(data) {
      L.geoJson(data, {
      color: "orange",
      weight: 2
      }).addTo(faultLineLayer);
  });


  // overlay layer with the fault line and cirle markers layer
  var overlayMaps = {
    "Earthquakes": earthquakeLayer,
    "Fault Lines": faultLineLayer
  };


  // Define a map object with layers (grayscale, earthquakes, fault)
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4.5,
    layers: [satellite, earthquakeLayer, faultLineLayer]
  });


  // Layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Adding Legend (https://leafletjs.com/examples/choropleth/)
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + colorCategory(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
  };
  legend.addTo(myMap);
}
