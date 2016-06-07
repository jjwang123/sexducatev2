(function(d3) {
  "use strict";

  d3.json("/timeofcrimes", function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    makeDelphiChart(data);
  });

  d3.json('/timeofcrimes', function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    makeTimeChart(data);
  });
})(d3);


getColor = function(d, max) {
  var color = d3.scale.linear()
  .domain([0.1, .5])
  .range(["white", "orange", "darkred"]);

  return color(d/max);
};

$.fn.scrollView = function () {
  return this.each(function () {
    $('html, body').animate({
      scrollTop: $(this).offset().top
    }, 500);
  });
}

getCountyData = function(agency) {
  d3.json('/agencies/' + agency, function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    makeDonutChart(data);
  });
}

// getTimeData = function() {
//   d3.json('/timeofcrimes', function(err, data) {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     console.log(data);
//     makeTimeChart(data);
//   });
// }

makeDelphiChart = function(data) {
  var w = window.innerWidth;

  var outerWidth = 1000,
      outerHeight = 700;

  var margin = {top: 0, right: 0, bottom: 100, left:150},
      width = outerWidth - margin.right - margin.left,
      height = outerHeight - margin.top - margin.bottom;

  var innerWidth  = width; //  - margin.left - margin.right;
  var innerHeight = height - margin.top  - margin.bottom;
  var maxRating = d3.max(data, function(d, i){ return parseInt(data[i].count); });

  var padding = .5;
  /*
  var svg = d3.select(".chart3")
    .attr("width", outerWidth)
    .attr("height", outerHeight);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var xAxisG = g.append("g")
    .attr("transform", "translate(0", + height + ")");
  var yAxisG = g.append("g");
  */

  var xScale = d3.scale.ordinal().rangeBands([0, width], padding);
  var yScale = d3.scale.linear().range([height, 0]);
 
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

  var yAxis = d3.svg.axis().scale(yScale).orient("left");



  xScale.domain( data.map(function (d){ return d.hour; }) );
  yScale.domain([0, maxRating]);


  // Define the chart
  
  var chart = d3
    .select(".chart")
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .append("g")
    .attr("transform", "translate(" +  margin.left + "," + margin.right + ")");


  // Render the chart

  var countNum = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");

/*
  var chart = g.selectAll(".bar").data(data);

  chart.enter().append("rect")
    .attr("class", "bar")
    .attr("id", function(d, i) { return data[i].count; })
    .attr("width", xScale.rangeBand());

  chart
    .attr("x", function(d, i) { return ((innerWidth / data.length)*i) + 10; })
    .attr("y", height)
    .attr("height", 0);
*/



  chart
    .selectAll(".bar")
    .data(data.map(function(d, i){ return data[i].count; }) )
    .enter().append("rect")
    .attr("id", function (d, i){ return data[i].count; })
    .attr("x", function(d, i) { return xScale(data[i].hour); } )
    .attr("width", xScale.rangeBand())
    .attr("y", height)
    .attr("height", 0)
    .on('mouseover', function(d, i) { 
      return countNum.style("visibility", "visible").text("Crimes: " + data[i].count);
    })
    .on('mouseout', function() {
      return countNum.style("visibility", "hidden");
    })
    .on("mousemove", function(){return countNum.style("top",
    (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
    })
    .style("fill", function(d) { return getColor(d, maxRating); })
    .transition()
    .attr("height", function(d, i) {
        return height - yScale(data[i].count);
    })
    .attr("y", function(d, i) {
         return yScale(data[i].count);
    })
    .delay(function(d, i) {
      return i * 20;
    })
    .duration(1500)
    .ease("bounce");
    // .ease("elastic");

    // var tip = d3.tip()
    //   .attr('class','d3-tip')
    //   .offset([-10,0])
    //   .html(function(d) {
    //       return d.total;
    //   });

    var bars = d3.selectAll(".bar");
    bars
      .on("mouseover", function(d,i) {
          d3.select(this).transition()
            .attr("height", function(d,i) {
              return height-yScale(data[i].count)-10;
            })
            .attr("y", function(d,i) {
              return yScale(data[i].count)-10;
            })
            .duration(200)
            .ease("bounce");


      })
      .on("mouseout", function(d,i) {
          d3.select(this).transition()
            .attr("height", function(d,i) {
              return height-yScale(data[i].count);
            })
            .attr("y", function(d,i) {
              return yScale(data[i].count);
            })
            .duration(200)
            .ease("bounce");
      });
      // .on
    

    console.log("finished coloring");




    /*
    chart.transition()
    .attr("height", function(d) {
        return innerHeight*d/maxRating;
    })
    .attr("y", function(d) {
         return innerHeight - (innerHeight*(d / maxRating));
    })
    .delay(function(d, i) {
      return i * 20;
    })
    .duration(1000)
    .ease("elastic");
    */


  // TODO: Append X axis
  chart
    .append("g")
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .call(xAxis)

    chart.append("text")      // text label for the x axis
        .attr("x", width/2 )
        .attr("y",  height+70 )
        .style("text-anchor", "middle")
        .text("Time of day (hours)");

      chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -120)
        .attr("x",-height/2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Crimes Committed");
  // TODO: Append Y axis
  chart
    .append("g")
    .call(yAxis);



};

// makeDelphiChart2 = function(data) {
//   var margin = {top: 20, right: 10, bottom: 100, left: 70},
//       width = 500 - margin.right - margin.left,
//       height = 700 - margin.top - margin.bottom;
//
//   var innerWidth  = width  - margin.left - margin.right;
//   var innerHeight = height - margin.top  - margin.bottom;
//   var maxRating = d3.max( data.map(function(d){ return parseInt(d.total); }) );
//
//   var xScale = d3.scale.ordinal().rangeRoundBands([0, innerWidth], 0);
//   var yScale = d3.scale.linear().range([0, innerHeight]);
//
//   // Define the chart
//   var remove = d3
//     .select(".chart2")
//     .select("svg")
//     .remove()
//
//   var chart = d3
//     .select(".chart2")
//     .append("svg")
//     .attr("width", width + margin.right + margin.left)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" +  margin.left + "," + margin.right + ")");
//
//   // Render the chart
//   xScale.domain( data.map(function (d){ return d.charge_description; }) );
//   yScale.domain([maxRating, 0]);
//
//   chart
//     .selectAll(".bar")
//     .data(data.map(function(d){ return d.total; }) )
//     .enter().append("rect")
//     .attr("class", "bar")
//     .attr("id", function (d, i){ return data[i].charge_description; })
//     .attr("x", function(d, i) { return ((innerWidth / data.length)*i) + 30; })
//     .attr("width", (innerWidth / data.length) - 50)
//     .attr("y", function(d) { return innerHeight - (innerHeight*(d / maxRating)); })
//     .attr("height", function(d) { return innerHeight*d/maxRating;  })
//     .style("fill", function(d) { return getColor(d, maxRating); });
//   // Orient the x and y axis
//   var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
//   var yAxis = d3.svg.axis().scale(yScale).orient("left");
//
//   // TODO: Append X axis
//   chart
//     .append("g")
//     .attr("transform", "translate(" + 0 + "," + innerHeight + ")")
//     .call(xAxis)
//     .selectAll("text")
//     .attr("transform", "rotate(" + -45 + ")")
//     .style("text-anchor", "end");
//
//   // TODO: Append Y axis
//   chart
//     .append("g")
//     .call(yAxis);
//
// };


makeTimeChart = function(data) {
  var outerWidth = 900,
      outerHeight = 500;

  var margin = {top: 20, right: 0, bottom: 100, left:75},
      width = outerWidth - margin.right - margin.left,
      height = outerHeight - margin.top - margin.bottom;

  var barPadding = 0.2;

  var maxCrime = d3.max( data.map(function(d, i){ console.log(data[i].count); return parseInt(data[i].count); }) );

// Parse the date / time
//var parseDate = d3.time.format("%d-%b-%y").parse;
var svg = d3.select(".chart3")
    .attr("width", outerWidth)
    .attr("height", outerHeight);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var xAxisG = g.append("g")
    .attr("transform", "translate(0", + height + ")");
var yAxisG = g.append("g");

var xScale = d3.scale.ordinal().rangeRoundBands([0, width]);
var yScale = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(xScale)
    .orient("bottom").ticks(30);

var yAxis = d3.svg.axis().scale(yScale)
    .orient("left").ticks(10);

xScale.domain( data.map ( function(d) { return d.hour; }));
yScale.domain( [0, maxCrime] );

yAxisG.call(xAxis);
yAxisG.call(yAxis);

var bars = g.selectAll("rect").data(data);
// var bars2 = d3.selectAll(".bar");
//     bars2
//       .on("mouseover", function(d,i) {
//           d3.select(this).transition()
//             .attr("height", function(d) {
//               return height-yScale(d.count)+100;
//             })
//             .attr("y", function(d) {
//               return yScale(d.count)+100;
//             })
//             .duration(200)
//             .ease("bounce");


//       })
//       .on("mouseout", function(d,i) {
//           d3.select(this).transition()
//             .attr("height", function(d) {
//               return height-yScale(d.count);
//             })
//             .attr("y", function(d) {
//               return yScale(d.count);
//             })
//             .duration(200)
//             .ease("bounce");
//       });

bars.enter().append("rect")
  attr("width", xScale.rangeBand());

bars
  .attr("x", function(d) { return xScale(d.hour); })
  .attr("y", function(d) { return yScale(d.count); })
  .attr("height", function(d) { return height - yScale(d.count); });















/*
// Define the line
var valueline = d3.svg.line()
    .x(function(d, i) { return x(data[i].hour); })
    .y(function(d, i) { return y(parseInt(data[i].count)); });

// Adds the svg canvas
var svg = d3.select(".chart3")
    .data(data)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    // Scale the range of the data
    x.domain([0, 24]);
    y.domain([0, d3.max(data, function(d, i) { return parseInt(data[i].count); })]);



    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
*/

};


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
    .style("fill", function(d, i) { return color(i); })
    .transition()
      .ease("exp")
      .duration(1000)
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
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    })
    .style('float', 'right');


    legend.append('rect')                                     // NEW
      .attr('width', legendRectSize)                          // NEW
      .attr('height', legendRectSize)                         // NEW
      .style('fill', function(d, i) { return color(i); })                                   // NEW
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
