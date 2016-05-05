//* initialize the map and set its view */
//function to instantiate the Leaflet map
function createMap(){
    //Initialize the map and set its view
    var map = L.map('map', {
        center: [37.32, -78.4444],
        zoom: 9,
        minZoom: 9,
        maxZoom: 18
    });

  //).setView([37.5, -80], 8);

       var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            //minZoom: 7,
            //maxZoom: 18,
        });

        var MapQuestOpen_Aerial = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
	           type: 'sat',
	           ext: 'jpg',
             minZoom: 9,
           	 maxZoom: 18,  //less zoom
          	 attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
	           subdomains: '1234'
        });

        var OpenStreetMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var baseMaps = { "Esri_WorldImagery": Esri_WorldImagery,
                         "OpenStreetMap": OpenStreetMap,
                         "MapQuestOpen_Aerial": MapQuestOpen_Aerial,
        };

    addSites(map, baseMaps);
    var data = getData(map);
};


function addSites(map, baseMaps){
  var beeIcon = L.icon({
      iconUrl: 'lib/leaflet/images/leaf-red.png',
      iconSize:     [30, 50], // size of the icon
      iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
      popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

//L.marker([51.5, -0.09], {icon: greenIcon}).addTo(map);
  var falcons =   L.marker([36.887325, -78.114467],
      {icon: beeIcon}).bindPopup('Falcons'),
      elzay =     L.marker([37.127585, -78.115443],
      {icon: beeIcon}).bindPopup('Elzay'),
      inge_mann = L.marker([37.0560800, -78.1234803],
      {icon: beeIcon}).bindPopup('Inge Mann'),
      sweetB =    L.marker([37.552778, -79.0825444],
      {icon: beeIcon}).bindPopup('Sweet Briar College');

  var sites = L.layerGroup([falcons, elzay, inge_mann, sweetB]).addTo(map);
  var overlaySites = {"sites": sites};

  L.control.layers(baseMaps, overlaySites).addTo(map);
  //L.control.layers(baseLayers).addTo(map);
};

////////////////
//function requesting  GEOJSON data and if success callback functions
function getData(map){
    //load the data

    //var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    //g = svg.append("g").attr("class", "leaflet-zoom-hide");
    // Load data at once
    $.ajax("data/sites.geojson", {
        dataType: "json",
        success: function(data){
          //the attributes array -- yrs for sequence
            var beeType = getBeeTypes ( );
            // separeate sites
            var sweetSite = processData(data, "Sweet Briar College");
            var falconsSite = processData(data, "Falcons");
            var ingeSite = processData(data, "Inge Mann");
            var elzaySite = processData(data, "Elzay ");

            // create proportional popups symbols for retrieving information
            //createPropSymbols(data, map, bees);
            createSiteControls(map, data, beeType);
            //changeCirclesWhenZooming (map, attributes);
            //createLegend(map, attributes);
         }
    });


};


function processData(data, siteName){
    //empty array to hold the stations of a site
    var stations = [];
    var i = 0;
    props =  data.features[0].properties ;
    //console.log(props.Name);
    //push each attribute name into attributes array -- years then name
    for (var dat in data.features) {
       var datProps = data.features[dat].properties;
      //console.log(datProps );
       for (var prop in datProps){
        //only take attributes with values
         if ((prop === "Name") && (datProps[prop] === siteName)) {
            stations.push(data.features[dat]);
         };
       };
    };
    return stations;
};

////////  get the bee types
function getBeeTypes ( ){
    //empty array to hold attributes
    // attributes: Site_Number,	Station,	lat,	lon,	Trt,
    // BumbleBee,	CarpenterBee,	ChimneyBee,	GreenMetallicBee,
    // Honeybee,	Leaf-cutterBee,	Long-hornedBee,	SweatBee,	Name
    var beeTypes = ["BumbleBee",	"CarpenterBee",	"ChimneyBee",
         "GreenMetallicBee", "Honeybee",	"Leaf-cutterBee",
         "Long-hornedBee",	"SweatBee"];

    return beeTypes;
};


////////////////////////////////////////
/////////////////// ----------- Sequence
function createSiteControls(map, data, beeTypes){

    var SiteControl = L.Control.extend({
        options: {
            position: 'topright'
        },
// add to map pane
        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'site-control-container');
            //add skip buttons
            $(container).
                   append('<button class="skip" id="sweet" title="Sweet">Sweet B</button>');
            $(container).
                   append('<button class="skip" id="falcons" title="Falcons">Falcons</button>');
            $(container).
                   append('<button class="skip" id="inge" title="IngeMann">IngeMann</button>');
            $(container).
                   append('<button class="skip" id="elzay" title="Elzay">Elzay</button>');

            //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            return container;
          }
      });

      // add the map_menu control
      map.addControl(new SiteControl());

      //click listener for buttons  $('.class')
      $('.skip').click(function(){
        if ($(this).attr('id') == 'sweet'){
          console.log('sweet');
          var sweetSite = processData(data, "Sweet Briar College");
          //zoom to sweet
          createPropSymbols(sweetSite, map, beeTypes);
                //wrap around to first attribute
        } else if ($(this).attr('id') == 'falcons'){
          var falconsSite = processData(data, "Falcons");
          createPropSymbols(falconsSite, map, beeTypes);
          console.log('falcons');
                //wrap around to first attribute
        } else if ($(this).attr('id') == 'elzay'){
          console.log('elzay');
          var elzaySite = processData(data, "Elzay ");
          createPropSymbols(elzaySite, map, beeTypes);
                //wrap around to first attribute
        } else if ($(this).attr('id') == 'inge'){
          console.log('inge');
          var ingeSite = processData(data, "Inge Mann");
          createPropSymbols(ingeSite, map, beeTypes);
        };

      }); //end of buttons
        //updatePropSymbols(map, attributes[index]);
};


//// Retrieve
//////Add circle markers for point features to the map
function createPropSymbols(data, map, bees){
    //create a GeoJSON layer and add it to the map
    // pointToLayer is an option of L.geoJson
    var featLayer = L.geoJson(data, {
        pointToLayer: function (feature, latlng ) {
            //feature contains data for each station
            return pointToLayer(feature, latlng, bees);
        }
    })
		map.addLayer(featLayer); // add layer to map
};

//function to convert markers to circle markers
function pointToLayer(station, latlng, bees){
    //Determine which attribute to visualize with proportional symbols
    var total_bees = 0; //bees[0];  //does this for all the countries
    //create marker options
    var options = {
        fillColor: "#a50f15",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        stroke: false
    };

  ///////////    var attValue = Number(feature.properties[attribute]);
    if (station.properties['Trt'] !== "SITE") {
      datProps = station.properties;
      // add the number of bees
      for (var prop in datProps) {
        for (var bee in bees) {
          if  (bees[bee] === prop)  {
              total_bees = total_bees + station.properties[prop];
          }
        }
      }
    };

     // calculate radius for the circle
     options.radius = calcPropRadius(total_bees);

    //create the circlemarker and popups with the options and add to layer
     var layer = L.circleMarker(latlng, options, {
          title: station.properties.Site_st,
     });

     createPopup(station.properties, total_bees, layer, options.radius)
     layer.on({
         mouseover: function(){
             this.openPopup();
         },
         mouseout: function(){
             this.closePopup();
         }
     });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};


///////////////   createPopup function
function createPopup(properties, attribute, layer, radius) {
  // format the popup content
  var attValue = Number(attribute);
  attValue = attValue.toFixed(0);
///////
  var popupContent = "<p><b>" + properties.Name + "</b></p>"
  popupContent += "<p>Station: " + properties.Site_st + ", "+attValue + " bees" +  "</p>";

  //bind the popup to the circle marker
  layer.bindPopup(popupContent, {
      offset: new L.Point(0,-radius),
  });
};

//calculate the radius of each proportional symbol
// This is a better option for my circles
function calcPropRadius (attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.75;  //15;
    //area based on attribute value and scale factor
    var area = Math.pow(attValue * scaleFactor,2);
    //console.log('area', area);
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};


function updatePropSymbols(map, attribute){
    // attribute is a year
    // updatePropSymbos making sure that the new symbol has not a null value
  map.eachLayer(function(layer){
       // does the layer has a feature_name and value to this year?
      if (layer.feature && layer.feature.properties[attribute]){
        //update the layer size and popup
        var props = layer.feature.properties;

        var radius = calcPropRadius(props[attribute]);
        // sets new radius size
        layer.setRadius(radius);

        // update popup and legend content
        createPopup(props, attribute, layer, radius);
        updateLegend(map, attribute);
      }
      // if the layer has this feature_name, but the value is null, update popup with null value
      // and circle must have zero radius (no circle)
      else if (layer.feature && layer.feature.properties.CountryName ) //exist, but null value
      {

        var attValue = Number(layer.feature.properties[attribute]);
        if (attValue == 0){
          layer.setRadius(attValue);
        }
      }; //end of if
  }); // end eachLayer
};

////////////////////////////
/////////// Legends
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {

            var container = L.DomUtil.create('div', 'legend-control-container');
            $(container).append('<div id="temporal-legend">')

      			//start attribute legend svg string
      			var svg = '<svg id="attribute-legend" width="180px" height="190px">';

      			//array - circle element for three attr values
      			var circles = {
      				max: 20,
      				mean: 40,
      				min: 60
      			};

      			//loop to add each circle and text to svg string
      			for (var circle in circles){
      				//circle string
      				svg += '<circle class="legend-circle" id="' + circle +
               '" fill="#14a137" fill-opacity="0.4" stroke="#000000" cx="30"/>';
      				svg += '<text id="' + circle + '-text" x="65" y="' +
              circles[circle] + '"></text>';
      			};
      			//close svg string
      			svg += "</svg>";

      			//add attribute legend svg to container
      			$(container).append(svg);
            return container;
        }
    });

    map.addControl(new LegendControl());
    var initialYear = attributes[0];
    updateLegend(map, initialYear);
};
///
//////

function updateLegend(map, attribute){
	//create content for legend
	var year = attribute;
	var content = "Per Agr of GDP in " + year;
	//replace legend content
	$('#temporal-legend').html(content);

	var circleValues = getCircleValues(map, attribute);  //legend values
	for (var key in circleValues){
		//get the radius

    //I had to add 2 to make circles with very small circles to print
		  var radius = calcPropRadius(circleValues[key]) + 2;  //otherwise radius is too small

		$('#'+key).attr({
			cy: 59 - radius,
			r: radius
		});

    //format legend values
		$('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 +
     "% ag per GDP");
	};
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
	//start with min at highest possible and max at lowest possible number
	var min = Infinity,
		max = -Infinity;

	map.eachLayer(function(layer){
		//get the attribute value
		if (layer.feature){
			var attributeValue = Number(layer.feature.properties[attribute]);
      //console.log ('es zero?', attributeValue);
      // make sure taht the circles have not a min of zero due to null values
      if (attributeValue > 0) {
        //console.log('no es zero?', attributeValue);
			   //test for min
			      if (attributeValue < min){
				          min = attributeValue;
			      };

			         //test for max
			      if (attributeValue > max){
				          max = attributeValue;
			      };
      };
		};
	});
	//set mean
	var mean = (max + min) / 2;
  //console.log(min,mean, max);
	//return values as an object
	return {
		max: max,
		mean: mean,
		min: min
	};
};

////////
//Resize proportional symbols according to new attribute values


// finally create the map!
$(document).ready(createMap);



////////
function changeCirclesWhenZooming (map, attributes) {
  var times;
  map.on('zoomend', function(layer) {

      map.eachLayer (function(layer) {
        var currentZoom = map.getZoom();
        if (layer.feature && layer.feature.properties[attribute]){
              //update the layer popups
            var props = layer.feature.properties;
            var attValue = props[attribute];
            var radius = calcPropRadius(attValue);

            if (layer.options) {
              var radious = layer.options.radius;
              console.log('before', radious);
              layer.options.setRadius(layer.options.setRadius * 100);
              console.log('later',  layer.options.radius);
            };
        };
      });
  });
};







/*    *******
<form action="">
  <input type="radio" name="gender" value="male"> Male<br>
  <input type="radio" name="gender" value="female"> Female<br>
  <input type="radio" name="gender" value="other"> Other
</form>

<script>
function myFunction() {
    document.getElementById("demo").style.fontSize = "25px";
}
</script>

<button type="button" onclick="myFunction()">Click Me!</button>


*************
*/
