(function(d3) {
  "use strict";
  console.log("pls");
})

  // ASSIGNMENT PART 1B
  // Grab the delphi data from the server
//   d3.json("/delphidata", function(err, data) {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     makeDelphiChart(data);
//   });
// })(d3);
//
// makeDelphiChart = function(data) {
//   var margin = {top: 20, right: 10, bottom: 100, left: 70},
//       width = 930 - margin.right - margin.left,
//       height = 500 - margin.top - margin.bottom;
//
//   var innerWidth  = width  - margin.left - margin.right;
//   var innerHeight = height - margin.top  - margin.bottom;
//   var maxRating = d3.max( data.map(function(d){ return d.sum; }) );
//
//   var xScale = d3.scale.ordinal().rangeRoundBands([0, innerWidth], 0);
//   var yScale = d3.scale.linear().range([0, innerHeight]);
//
//   // Define the chart
//   var chart = d3
//     .select(".chart")
//     .append("svg")
//     .attr("width", width + margin.right + margin.left)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" +  margin.left + "," + margin.right + ")");
//
//   // Render the chart
//   xScale.domain(data.map(function (d){ return d.gender; }));
//   yScale.domain([maxRating, 0]);
//
//   chart
//     .selectAll(".bar")
//     .data(data.map(function(d){ return d.sum; }))
//     .enter().append("rect")
//     .attr("class", "bar")
//     .attr("x", function(d, i) { return ((innerWidth / data.length)*i) + 30; })
//     .attr("width", (innerWidth / data.length) - 50)
//     .attr("y", function(d) { return innerHeight - (innerHeight*(d / maxRating)); })
//     .attr("height", function(d) { return innerHeight*d/maxRating;  });
//
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
// };
