// Load data from the CSV file
d3.csv("1970-2021_DISASTERS_UPDATED_COUNTRIES.csv").then(function(dataset) {
    // Define dimensions for the chart area
    var dimensions = {
        width: 800,
        height: 400,
        margin: {
            top: 10,
            bottom: 50,
            right: 50,
            left: 100
        }
    };

    // Extract relevant data from the dataset and convert it to numeric values
    var data = dataset.map(function(d) {
        return {
            Year: +d.Year,
            Total_Affected: +d.Total_Affected,
            Country: d.Country
        };
    });

    // Define a color scale for different countries
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create an SVG element to contain the scatter plot
    var svg = d3.select("#scatterplot")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    // Create x-scale mapping the 'Year' values to the horizontal space
    var xScale = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return d.Year; }), d3.max(data, function(d) { return d.Year; })])
        .nice()
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right]);

    // Create y-scale mapping the 'Total_Affected' values to the vertical space using a logarithmic scale
    var yScale = d3.scaleLog()
        .domain([1, d3.max(data, function(d) { return d.Total_Affected; })])
        .nice()
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]);

    // Create y-axis with appropriate tick values using a logarithmic scale and custom tick format
    var yAxis = d3.axisLeft(yScale).ticks(5, "~s").tickFormat(d3.format(".2s"));

    // Create circles for each data point, assigning colors based on 'Country'
    var dots = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d.Year); }) // X-coordinate based on 'Year'
        .attr("cy", function(d) { return yScale(Math.max(1, d.Total_Affected)); }) // Y-coordinate based on 'Total_Affected', ensuring a minimum value of 1
        .attr("r", 3) // Radius of the circles
        .attr("fill", function(d) { return colorScale(d.Country); }); // Assign color based on 'Country'

    // Add x-axis with appropriate tick values
    svg.append("g")
        .attr("transform", "translate(0," + (dimensions.height - dimensions.margin.bottom) + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))); // Use 'd3.format("d")' to format as integers

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