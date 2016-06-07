(function(d3) {
  "use strict";

  var communityData = d3.json("/communities", function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    makePlannedParenthoodMap(null);
  });

})(d3);

function makePlannedParenthoodMap(data){

  var mymap = L.map('mapid1', { zoomControl: false }).setView([32.835364, -117.193252], 11);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      maxZoom: 18,
      id: 'piamsiri.05o91nlm',
      accessToken: 'pk.eyJ1IjoicGlhbXNpcmkiLCJhIjoiY2lvYzQxcWVjMDRocncxa3FuMDc0a2luZCJ9.Kl8iSrgUHvoCxyN4BCiTuw'
  }).addTo(mymap);

  // var svg = d3.select(map.getPanes().overlayPane).append("svg"),
  //     g = svg.append("g").attr("class", "leaflet-zoom-hide");

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
