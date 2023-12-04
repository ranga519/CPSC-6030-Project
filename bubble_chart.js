
d3.csv("1970-2021_DISASTERS_UPDATED_COUNTRIES.csv").then(function(dataset) {
    // Count occurrences of each disaster type
    var disasterFrequency = {};
    dataset.forEach(function(d) {
        if (disasterFrequency[d['Disaster_Type']]) {
            disasterFrequency[d['Disaster_Type']]++;
        } else {
            disasterFrequency[d['Disaster_Type']] = 1;
        }
    });

    var disasterData = Object.keys(disasterFrequency).map(function(key) {
        return { name: key, count: disasterFrequency[key] };
    });

    // SVG dimensions
    var dimensions = {
        width: 400,
        height: 230
    };

    // Create SVG container
    var svg2 = d3.select("#bubble-chart")
             .attr("width", dimensions.width)
             .attr("height", dimensions.height)
             .attr("class", "bubble-chart")
             .style("transform", "translate(10px, 0)");

    // Adjusted radius scale using a logarithmic scale
    var minCount = d3.min(disasterData, d => d.count);
    var maxCount = d3.max(disasterData, d => d.count);
    var radiusScale = d3.scaleSqrt()  // You can also try d3.scaleLog()
                        .domain([minCount, maxCount])
                        .range([5, 100]);  // Adjust the range based on desired bubble sizes

    // Pack layout setup
    var pack = d3.pack()
                 .size([dimensions.width, dimensions.height])
                 .padding(5);

    // Root node for pack layout
    var root = d3.hierarchy({children: disasterData})
                 .sum(function(d) { return radiusScale(d.count); }); // Size of each bubble

    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                 .domain(disasterData.map(function(d) { return d.name; }));

    // Build the bubbles
    var node = svg2.selectAll(".node")
                   .data(pack(root).leaves())
                   .enter().append("g")
                   .attr("class", "node")
                   .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    // Draw the bubbles
    node.append("circle")
        .attr("id", function(d) { return d.data.name; })
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return colorScale(Math.log(d.data.count)); });

    // Add labels to the bubbles
    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text(function(d) { return d.data.name})
        .style("font-size", "7px"); // Adjust text to fit in bubble

     // Add interaction for labels
     node.on("mouseover", function(event, d) {
        d3.select(this).select("text")
          .style("font-size", "16px") // Enlarge font size on mouseover
          .style("font-weight", "bold")
          .attr("dy", "0.3em");
    });

    node.on("mouseout", function(d) {
        d3.select(this).select("text")
          .style("font-size", "8px") // Reset font size on mouseout
          .attr("dy", "0.3em");
    });

// // Add interaction for bubbles
// node.on("click", function(event, d) {
//     // Filter data based on the selected natural disaster type
//     var filteredData = dataset.filter(function(data) {
//         return data['Disaster_Type'] === d.data.name;
//     });

//     // Update the scatter plot with the filtered data
//     updateScatterPlot(filteredData);
// });
// Add interaction for bubbles
node.on("click", function(event, d) {
    // Reset all bubbles to their original size and color
       svg2.selectAll("circle")
       .attr("r", function(d) { return d.r; })
       .style("fill", function(d) { return colorScale(Math.log(d.data.count)); });
    // Enhance the clicked bubble
        var clickedBubble = d3.select(this).select("circle");
    // Adjust the size or color as needed
    clickedBubble
        .transition()
        .duration(500)
        .attr("r", function(d) { return d.r * 1.5; })  // Increase the radius by 50%

    
    // Filter the scatter plot dots based on the selected country
    window.updateScatterPlot([{
        key: 'Disaster_Type',
        value: d.data.name

    }]);
});


});