// Load data from the CSV file
d3.csv("1970-2021_DISASTERS_UPDATED_COUNTRIES.csv").then(function(dataset) {
    // Define dimensions for the chart area
    var dimensions = {
        width: 600,
        height: 400,
        margin: {
            top: 10,
            bottom: 50,
            right: 50,
            left: 70
        }
    };

    // Extract relevant data from the dataset and convert it to numeric values
    var data = dataset.map(function(d) {
        return {
            Year: +d.Year,
            Month: +d.Start_Month,
            Total_Affected: +d.Total_Affected,
            Country: d.Country,
            Disaster_Type: d.Disaster_Type
        };
    });

    // Define a color scale for different countries
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create an SVG element to contain the scatter plot
    var svg = d3.select("#scatterplot")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    // Create x-scale mapping both 'Year' and 'Month' to the horizontal space
    var xScale = d3.scaleTime()
        .domain([d3.min(data, function(d) { return new Date(d.Year, d.Month - 1, 1); }), d3.max(data, function(d) { return new Date(d.Year, d.Month - 1, 1); })])
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right]);

    // Create y-scale mapping the 'Total_Affected' values to the vertical space using a logarithmic scale
    var yScale = d3.scaleLog()
        .domain([1, d3.max(data, function(d) { return d.Total_Affected; })])
        .nice()
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]);

    // Create y-axis with appropriate tick values using a logarithmic scale and custom tick format
    var yAxis = d3.axisLeft(yScale).ticks(5, "~s").tickFormat(d3.format(".2s"));

    // Create a tooltip div
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create circles for each data point, assigning colors based on 'Country'
    var dots = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(new Date(d.Year, d.Month - 1, 1)); }) // X-coordinate based on both 'Year' and 'Month'
        .attr("cy", function(d) { return yScale(Math.max(1, d.Total_Affected)); }) // Y-coordinate based on 'Total_Affected', ensuring a minimum value of 1
        .attr("r", 3) // Radius of the circles
        .attr("fill", function(d) { return colorScale(d.Country); }) // Assign color based on 'Country'
        .on("mouseover", function(d) {
            // Show tooltip on mouseover
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(
                "Country: " + d.Country + "<br>" +
                "Disaster Type: " + d.Disaster_Type + "<br>" +
                "Total Affected: " + d.Total_Affected
            )
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            // Hide tooltip on mouseout
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add x-axis with appropriate tick values
    svg.append("g")
        .attr("transform", "translate(0," + (dimensions.height - dimensions.margin.bottom) + ")")
        .call(d3.axisBottom(xScale)
            .ticks(d3.timeYear.every(5)) // Show ticks every 5 years
            .tickFormat(d3.timeFormat("%Y")) // Format ticks as years
        );

    // Add y-axis with appropriate tick values using a logarithmic scale
    svg.append("g")
        .attr("transform", "translate(" + dimensions.margin.left + ",0)")
        .call(yAxis);

    // Add x-axis label
    svg.append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.height - 10)
        .text("Year")
        .style("text-anchor", "middle");

    // Add y-axis label with rotation
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0 - dimensions.height / 2)
        .style("text-anchor", "middle")
        .text("Population Affected");
});