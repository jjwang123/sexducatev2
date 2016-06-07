(function(d3) {
  "use strict";

  var geographyData = d3.json("/geography", function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    makeMap(data);
    makePlannedParenthoodMap();
  });
})(d3);

$.fn.scrollView = function () {
  return this.each(function () {
    $('html, body').animate({
      scrollTop: $(this).offset().top
    }, 500);
  });
}

getGeographySTD = function(geography) {
  d3.json('/geography/' + geography, function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    makeDonutChart(data);
    if(data.length > 0)
      $("#donutChartModal").modal()
  });
}

makeDonutChart = function(data) {
  var width = 1200,
      height = 600,
      radius = Math.min(width, height) / 2;

  var max = d3.max( data.map(function(d){ return parseInt(d.total); }) );
  var sum = d3.sum( data.map(function(d){ return parseInt(d.total); }) );

  var color = d3.scale.category20b();

/*
  var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
*/
  var remove = d3
    .select(".chart2")
    .select("svg")
    .remove()


  var arc = d3.svg.arc()
    .innerRadius(radius - 125)
    .outerRadius(radius - 50);

  var pie = d3.layout.pie()
    .sort(null)
    .startAngle(1.1 * Math.PI)
    .endAngle(3.1 * Math.PI)
    .value(function(d) { return d.total; });

  var chart = d3.select(".chart2")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 4 + "," + (radius)  + ")");

  var g = chart
    .selectAll(".arc")
    .data( pie(data) )
    .enter()
    .append("g")
    .attr("class", "arc");

  g.append("path")
    .attr("d", arc)
    .style("fill", function(d, i) { return donutColor(i); })
    .transition()
      .ease("exp")
      .duration(1200)
      .attrTween("d", tweenPie);

  function tweenPie(b) {
    var i = d3.interpolate({startAngle: 1.1 * Math.PI, endAngle: 1.1 * Math.PI}, b);
    return function(t) { return arc(i(t));};
  }

  var xCoor = -60;
  var yCoor = 20;

  var legendRectSize = 50;
  var legendSpacing = 4;

  var legend = chart.selectAll('.legend')
    .data( data )
    /*(function(d){ console.log(d); return d.crimes_description; }) )*/
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * color.domain().length / 2;
      var horz = 6 * legendRectSize;
      var vert = i * height - offset - 150;
      return 'translate(' + horz + ',' + vert + ')';
    })
    .style('float', 'right');


    legend.append('rect')                                     // NEW
      .attr('width', legendRectSize)                          // NEW
      .attr('height', legendRectSize)                         // NEW
      .style('fill', function(d, i) { return donutColor(i); })                                   // NEW
      .style('stroke', color);                               // NEW

    legend.append('text')                                     // NEW
      .attr('x', legendRectSize + legendSpacing)              // NEW
      .attr('y', legendRectSize - legendSpacing)              // NEW
      .text(function(d) { return d.charge_description; })
      .attr("transform", "translate(" + 10 + "," + -15  + ")");

   g.append("text")
     .attr("transform", function(d) { return "translate(" + xCoor + "," + yCoor + ")"; })
     .style("opacity", "0")
     .style("font-size", "5em")
     .text(function(d) { return (Math.round(d.value/sum * 100) + "% "); });

};

function makeMap(data) {
  // console.log(data);

  var max = d3.max( data.map(function(d){ return parseInt(d.total); }) );

  // console.log(max);

  var map = L.map('mapid', { zoomControl: false }).setView([32.969, -116.9], 9);


  L.tileLayer('https://api.mapbox.com/styles/v1/bangingwang/cioumudx5001lb3khj06aghd6/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYmFuZ2luZ3dhbmciLCJhIjoiY2lvdW1lYW1hMDBzbHR6bTVkZmpjYjM1ZyJ9._LUYXba9i-VARARoqA4Wlg', {
    maxZoom: 18,
  }).addTo(map);

  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.keyboard.disable();

  var svg = d3.select(map.getPanes().overlayPane).append("svg"),
      g = svg.append("g").attr("class", "leaflet-zoom-hide");

d3.json("https://raw.githubusercontent.com/jjwang123/sexducatev2/master/public/data/san-diego.geojson", function(error, collection) {
  if (error) throw error;

  console.log(collection);

  var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform);

  var feature = g.selectAll("path")
    .data(collection.features)
    .enter()
    .append("path")
    .attr("id", function(d){ return d.properties.NAME; } )
    .attr("class", "map_piece")
    .on("click", function(d){ getGeographySTD(d.properties.NAME); } )
    .on("mouseover", function(d){ printInfo(d.properties.NAME, data); } );


  map.on("viewreset", reset);
  reset();

  // Reposition the SVG to cover the features.
  function reset() {
    var bounds = path.bounds(collection),
        topLeft = bounds[0],
        bottomRight = bounds[1];

    svg .attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");

    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    feature.attr("d", path)
    .style("fill", function(d, i){ return mapColor(d.properties.NAME, data, max); } );
  }

  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }
});
};

function makePlannedParenthoodMap(){

  var mymap = L.map('mapid1', { zoomControl: false }).setView([32.835364, -117.193252], 11);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      maxZoom: 18,
      id: 'piamsiri.05o91nlm',
      accessToken: 'pk.eyJ1IjoicGlhbXNpcmkiLCJhIjoiY2lvYzQxcWVjMDRocncxa3FuMDc0a2luZCJ9.Kl8iSrgUHvoCxyN4BCiTuw'
  }).addTo(mymap);

  var content;

  content = '<h3>Mission Bay Parker Center<\/h3>' +
            '<p>4501 Mission Bay Drive #1C&D<br>San Diego, CA 92109<br><a href="https://www.plannedparenthood.org/health-center/california/san-diego/92109/mission-bay-parker-center-2330-90110">Visit Link<\/a><\/p>';
  L.marker([32.803344, -117.216176]).addTo(mymap).bindPopup(content);

  content = '<h3>Pacific Beach Express Mimi Brien Center<\/h3>' +
            '<p>1602 Thomas Avenue<br>San Diego, CA 92109<br><a href="https://www.plannedparenthood.org/health-center/california/san-diego/92109/pacific-beach-express-mimi-brien-center-3094-90110">Visit Link<\/a><\/p>';
  L.marker([32.797127, -117.239778]).addTo(mymap).bindPopup(content);

  content = '<h3>Kearny Mesa Center<\/h3>' +
            '<p>7526 Clairemont Mesa Blvd<br>San Diego, CA 92111<br><a href="https://www.plannedparenthood.org/health-center/california/san-diego/92111/kearny-mesa-center-2332-90110">Visit Link<\/a><\/p>';
  L.marker([32.833476, -117.157083]).addTo(mymap).bindPopup(content);

  content = '<h3>Mira Mesa Center<\/h3>' +
            '<p>10737 Camino Ruiz<br>Medical Mall, #220<br>San Diego, CA 92126<br><a href="https://www.plannedparenthood.org/health-center/california/san-diego/92126/mira-mesa-center-2333-90110">Visit Link<\/a><\/p>';
  L.marker([32.914185, -117.142218]).addTo(mymap).bindPopup(content);

  content = '<h3>First Avenue Family Planning Michelle Wagner Center<\/h3>' +
            '<p>2017 First Avenue<br>Suite 301<br>San Diego, CA 92101<br><a href="https://www.plannedparenthood.org/health-center/california/san-diego/92101/first-avenue-family-planning-michelle-wagner-center-4037-90110">Visit Link<\/a><\/p>';
  L.marker([32.726540, -117.163642]).addTo(mymap).bindPopup(content);

  content = '<h3>First Avenue Specialty Services Michelle Wagner Center<\/h3>' +
            '<p>2017 First Avenue<br>Suite 100<br>San Diego, CA 92101<br><a href="https://www.plannedparenthood.org/health-center/california/san-diego/92101/first-avenue-specialty-services-michelle-wagner-center-4036-90110">Visit Link<\/a><\/p>';
  L.marker([32.726540, -117.163642]).addTo(mymap).bindPopup(content);

  content = '<h3>City Heights Center<\/h3>' +
            '<p>4305 University Avenue, #350<br>San Diego, CA 92105<br><a href="https://www.plannedparenthood.org/health-center/california/san-diego/92105/city-heights-center-3075-90110">Visit Link<\/a><\/p>';
  L.marker([32.749211, -117.101443]).addTo(mymap).bindPopup(content);

  content = '<h3>College Avenue Sarah Weddington Center<\/h3>' +
            '<p>4575 College Ave<br>San Diego, CA 92115<br><a href="https://www.plannedparenthood.org/health-center/california/san-diego/92115/college-avenue-sarah-weddington-center-2324-90110">Visit Link<\/a><\/p>';
  L.marker([32.760319, -117.066571]).addTo(mymap).bindPopup(content);

  content = '<h3>Euclid Avenue Francis Torbert Center<\/h3>' +
            '<p>220 Euclid Ave, Suite 30<br>San Diego, CA 92114<br><a href="https://www.plannedparenthood.org/health-center/california/san-diego/92114/euclid-avenue-francis-torbert-center-2334-90110">Visit Link<\/a><\/p>';
  L.marker([32.706058, -117.086018]).addTo(mymap).bindPopup(content);
};

function printInfo(name, data) {
  for(var i in data) {
    console.log(name  + " " + data[i]);
    if( data[i].geography == name ) {
      $('#initialText').css('display', 'none');
      $('#crimeInfoText').css('display', 'block');
      $('.communityName').text(name);
      $('#numberOfCrimes').text(data[i].total);
    }
  }
}

function mapColor(name, data, max) {
  var color = d3.scale.linear()
  .domain([0, .01, .2])
  .range(["white", "lightblue", "darkblue"]);

  for(var i in data) {
    if( data[i].geography == name ) {
      return color(data[i].total/max);
    }
  }

  return "white";
}

function donutColor(data) {
  var color = d3.scale.linear()
  .domain([0, 4])
  .range(["orange", "brown"]);
  return color(data);
}
