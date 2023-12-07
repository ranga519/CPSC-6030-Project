// Function to initialize the bubble chart
function initializeBubbleChart(data) {
    // Count occurrences of each disaster type
    var disasterFrequency = {};
    data.forEach(function (d) {
        if (disasterFrequency[d['Disaster_Type']]) {
            disasterFrequency[d['Disaster_Type']]++;
        } else {
            disasterFrequency[d['Disaster_Type']] = 1;
        }
    });

    var disasterData = Object.keys(disasterFrequency).map(function (key) {
        return { name: key, count: disasterFrequency[key] };
    });

    // SVG dimensions
    var dimensions = {
        width: 400,
        height: 250
    };

    // Create SVG container
    var svg2 = d3.select("#bubble-chart")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .attr("class", "bubble-chart")
        .style("transform", "translate(50px, 0)");

    // Append title to the SVG container
    svg2.append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.height - 2) 
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Types of Disasters");

    // Adjusted radius scale using a logarithmic scale
    var minCount = d3.min(disasterData, d => d.count);
    var maxCount = d3.max(disasterData, d => d.count);
    var radiusScale = d3.scaleSqrt()
        .domain([minCount, maxCount])
        .range([5, 100]);

    // Pack layout setup
    var pack = d3.pack()
        .size([dimensions.width, dimensions.height])
        .padding(5);

    // Root node for pack layout
    var root = d3.hierarchy({ children: disasterData })
        .sum(function (d) { return radiusScale(d.count); });

    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(disasterData.map(function (d) { return d.name; }));

    // Store the initial colors
    var initialColors = {};
    disasterData.forEach(function (d) {
        initialColors[d.name] = colorScale(Math.log(d.count));
    });

    // Build the bubbles
    var node = svg2.selectAll(".node")
        .data(pack(root).leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    // Draw the bubbles
    node.append("circle")
        .attr("id", function (d) { return d.data.name; })
        .attr("r", function (d) { return d.r; })
        .style("fill", function (d) { return initialColors[d.data.name]; })
        .on("mouseover", function (event, d) {
            // Show tooltip on mouseover
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.data.name + "<br/>Count: " + d.data.count)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            // Hide tooltip on mouseout
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add labels to the bubbles
    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text(function (d) { return d.data.name; })
        .style("font-size", "7px");

    // Add interaction for labels
    node.on("mouseover", function (event, d) {
        d3.select(this).select("text")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .attr("dy", "0.3em");
    });

    node.on("mouseout", function (d) {
        d3.select(this).select("text")
            .style("font-size", "8px")
            .attr("dy", "0.3em");
    });

    // Add interaction for bubbles
    node.on("click", function (event, d) {
        // Reset all bubbles to their original size and color
        svg2.selectAll("circle")
            .attr("r", function (d) { return d.r; })
            .style("fill", function (d) { return initialColors[d.data.name]; })
            .style("stroke", "none");

        // Enhance the clicked bubble
        var clickedBubble = d3.select(this).select("circle");
        // Adjust the size and add a thick border
        clickedBubble
            .transition()
            .duration(500)
            .attr("r", function (d) { return d.r * 1.5; })
            .style("stroke", "black")
            .style("stroke-width", 3)
            .style("opacity", 3.5);

        // Decrease opacity of other bubbles
        svg2.selectAll("circle")
            .filter(function (other) { return other !== d; })
            .transition()
            .duration(500)
            .style("opacity", 0.5);

        // Filter the scatter plot dots based on the selected country
        window.updateScatterPlot([{
            key: 'Disaster_Type',
            value: d.data.name
        }]);

        const t = d3.select(this).select('text');
        const text = t.text().trim();
        window.location.hash = `/${text.replace(' ', '-')}`
        window.updateBarChart(text);
    });

    // Tooltip element
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Define a function to reset the bubble chart
    window.resetBubbleChart = function () {
         svg2.select("text").remove();
 
        // Remove all existing nodes
        svg2.selectAll(".node").remove();


        // Rebuild the bubble chart using the original data
        initializeBubbleChart(data);
        
    };

    // Add an event listener to the document to reset styles when clicked elsewhere
    d3.select(document).on("click", function () {
        // Reset styles for all bubbles in the bubble chart
        svg2.selectAll("circle")
            .attr("r", function (d) { return d.r; })
            .style("fill", function (d) { return initialColors[d.data.name]; })
            .style("stroke", "none")
            .style("opacity", 1);

        // Remove the event listener to avoid unwanted resets
        d3.select(document).on("click", null);
    });

    window.filterBubbleChart = function (filters) {
        // Reset styles for all bubbles in the bubble chart
        window.resetBubbleChart();
        // Check if filters contain the 'Country' key
        console.log(filters)
        var selectedCountry = filters;
        console.log(selectedCountry);

        // Filter data based on the selected country
        var filteredData = data.filter(function (data) {
            return data['Country'] === selectedCountry;
        });

        // Replace NaN values with zeros
        filteredData.forEach(function (d) {
            if (isNaN(d['count'])) {
                d['count'] = 0;
            }
        });

        // Count occurrences of each disaster type in the filtered data
        var filteredDisasterFrequency = {};
        filteredData.forEach(function (d) {
            if (filteredDisasterFrequency[d['Disaster_Type']]) {
                filteredDisasterFrequency[d['Disaster_Type']]++;
            } else {
                filteredDisasterFrequency[d['Disaster_Type']] = 1;
            }
        });
        console.log(filteredDisasterFrequency)

        var filteredDisasterData = Object.keys(filteredDisasterFrequency).map(function (key) {
            return { name: key, count: filteredDisasterFrequency[key] };
        });

        // Adjusted radius scale using a logarithmic scale
        var filteredminCount = d3.min(filteredDisasterData, d => d.count);
        var filteredmaxCount = d3.max(filteredDisasterData, d => d.count);
        var filteredradiusScale = d3.scaleSqrt()
                                    .domain([filteredminCount, filteredmaxCount])
                                    .range([5, 100]);

        // Update the root node with the filtered data
        root = d3.hierarchy({ children: filteredDisasterData })
            .sum(function (d) { return filteredradiusScale(d.count); });
        
        svg2.select("text").remove();
            // Change the title of the bubble chart
        svg2.append("text")
            .text("Types of Disasters in " + selectedCountry);

        // Update the bubbles with the new data
        svg2.selectAll(".node")
            .data(pack(root).leaves())
            .select("circle")
            .transition()
            .duration(500)
            .attr("r", function (d) { return d.r; })
            .style("fill", function (d) { return initialColors[d.data.name]; });

        // Update the labels with the new data
        svg2.selectAll(".node")
            .data(pack(root).leaves())
            .select("text")
            .text(function (d) { return d.data.name; });
            

        
    };
}

// Load data and initialize the bubble chart
d3.csv("1970-2021_DISASTERS_UPDATED_COUNTRIES.csv").then(function (dataset) {
    initializeBubbleChart(dataset);
});