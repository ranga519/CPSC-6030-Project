d3.csv("1970-2021_DISASTERS_UPDATED_COUNTRIES.csv").then(function(dataset) {
    var dimensions = {
        width: 250,
        height: 630,
        margin: {
            top: 10,
            bottom: 10,
            left: 100,
            right: 10
        }
    };
    // Create a div element for the tooltip
    var sliced = 150
    var tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0)
                    .style("position", "absolute")
                    .style("padding", "10px")
                    .style("background", "lightgrey")
                    .style("border", "1px solid black")
                    .style("border-radius", "5px")
                    .style("pointer-events", "none")
                    .style("text-align", "left")
                    .style("display", "none"); // Initially hidden

    // Additional setup for drawing lines
    var lineGroup = d3.select("body").append("svg")
                    .attr("width", "100%")
                    .attr("height", "700px")
                    .style("position", "absolute")
                    .style("top", "0")
                    .style("left", "0")
                    .style("pointer-events", "none"); // Ignore pointer events on this SVG





    var totalDisastersByCountry = {};
    var totalDeathsByCountry = {};
    var totalDamagesByCountry = {};
    
    //find count of each natural disasters
    var disasterCount = d3.group(dataset, d => d.Country);

    disasterCount.forEach((count, country) => {
                totalDisastersByCountry[country] = count.length;
                totalDeathsByCountry[country] = d3.sum(count, d => +d["Total Deaths"])
                totalDamagesByCountry[country] = d3.sum(count, d => +d[`Total Damages ('000 US$)`])
    });
    console.log(totalDisastersByCountry);
    console.log(totalDeathsByCountry);
    console.log(totalDamagesByCountry);

    // Create an array of objects for each country and its count of natural disasters
    var countriesDataDisasters = Object.keys(totalDisastersByCountry).map(function(country) {
        return { country: country, count: totalDisastersByCountry[country] };
    });

    // Sort the array in descending order based on the count
    countriesDataDisasters.sort(function(a, b) {
        return b.count - a.count;
    });

    // Select the top 75 countries
    var topCountriesDisasters = countriesDataDisasters.slice(0,sliced);
    var topXCountries = new Set(topCountriesDisasters.map(d => d.country));

    // Now, 'topCountries' contains the top 75 countries sorted by the count of natural disasters
    console.log(topCountriesDisasters);

 

    // Create an array of objects for each country and its count of deaths
    var countriesDataDeaths = Object.keys(totalDeathsByCountry).map(function(country) {
        return { country: country, count: totalDeathsByCountry[country] };
    });

    // Sort the array in descending order based on the count
    countriesDataDeaths.sort(function(a, b) {
        return b.count - a.count;
    });

    // Select the top 75 countries
    // var topCountriesDeaths = countriesDataDeaths.slice(0,sliced);

    // console.log(topCountriesDeaths);

    // Create an array of objects for each country and its count of damages
    var countriesDataDamages = Object.keys(totalDamagesByCountry).map(function(country) {
        return { country: country, count: totalDamagesByCountry[country] };
    });

    // Sort the array in descending order based on the count
    countriesDataDamages.sort(function(a, b) {
        return b.count - a.count;
    });

    // Filter deaths and damages data to include only top 100 countries
    var filteredCountriesDataDeaths = countriesDataDeaths.filter(d => topXCountries.has(d.country));
    var filteredCountriesDataDamages = countriesDataDamages.filter(d => topXCountries.has(d.country));

    // Select the top 75 countries
    // var topCountriesDamages = countriesDataDamages.slice(0,sliced);

    // console.log(topCountriesDamages);

    // ...

// Global variable to store ranks of countries
var countryRanks = {};

// Function to calculate ranks for a specific dataset and update the global ranks variable
function calculateRanks(data, type) {
    countryRanks[type] = {};
    data.forEach(function(d, index) {
        countryRanks[type][d.country] = index + 1;
    });
}

// Create an array of SVG IDs for the charts
var chartIds = ["disasters", "deaths", "damages"];

// Create an array to store chart elements
var charts = [];

// Create bar charts for natural disasters, deaths, and damages
var chart1 = d3.select("#disasters");
var chart2 = d3.select("#deaths");
var chart3 = d3.select("#damages");

charts.push(chart1, chart2, chart3);

// Inside your d3.csv promise block:
// Calculate ranks for all three datasets
calculateRanks(topCountriesDisasters, 'disasters');
calculateRanks(filteredCountriesDataDeaths, 'deaths');
calculateRanks(filteredCountriesDataDamages, 'damages');

// ...

// Global variable to store the currently hovered country
var hoveredCountry = null;

// Function to show the tooltip
function showTooltip(event, country) {
    var tooltipHtml = country + "<br>Disasters Rank: " + countryRanks.disasters[country] +
        "<br>Deaths Rank: " + countryRanks.deaths[country] +
        "<br>Damages Rank: " + countryRanks.damages[country];

    tooltip.html(tooltipHtml)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px")
        .style("opacity", 1)
        .style("display", "block"); // Make the tooltip visible
}

// Hide tooltip function
function hideTooltip() {
    tooltip.style("opacity", 0)
        .style("display", "none"); // Hide the tooltip
}

// Function to draw lines
function drawLines(country) {
    // Calculate Y-positions of bars
    var yDisasters = chart1.node().getBoundingClientRect().top + yScaleDisasters(country) + yScaleDisasters.bandwidth() / 2 + 10;
    var yDeaths = chart2.node().getBoundingClientRect().top + yScaleDeaths(country) + yScaleDeaths.bandwidth() / 2 + 10;
    var yDamages = chart3.node().getBoundingClientRect().top + yScaleDamages(country) + yScaleDamages.bandwidth() / 2 + 10;

    // X-positions (assuming charts are horizontally aligned)
    var x1 = dimensions.width;
    var x2 = dimensions.width * 2;

     // Adjust X-positions to make the lines shorter and more to the left
     var chartWidth = dimensions.width + dimensions.margin.left + dimensions.margin.right;
     var xStartDisasters = dimensions.margin.left + dimensions.width / 2 - 95; // Adjust this value as needed
     var xEndDisasters = xStartDisasters + chartWidth / 2 + 60; // Adjust this value as needed
     var xStartDeaths = xEndDisasters;
     var xEndDeaths = xStartDeaths + chartWidth / 2 + 80; // Adjust this value as needed
 

    // Draw lines between charts
    lineGroup.append("line")
        .attr("x1", xStartDisasters).attr("y1", yDisasters)
        .attr("x2", xStartDeaths).attr("y2", yDeaths)
        .attr("stroke", "black").attr("stroke-width", 2);

    lineGroup.append("line")
        .attr("x1", xStartDeaths).attr("y1", yDeaths)
        .attr("x2", xEndDeaths).attr("y2", yDamages)
        .attr("stroke", "black").attr("stroke-width", 2);
}

// Function to remove lines
function removeLines() {
    lineGroup.selectAll("line").remove();
}

function createBarChart(svgId, data, allCharts, yScale) {
    var svg = d3.select("#" + svgId)
        .style("width", dimensions.width)
        .style("height", dimensions.height);

    var barsGroup = svg.append("g")
        .attr("transform", "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");

    var xScale = d3.scaleLog()
        .domain([1, d3.max(data, function(d) { return d.count; })])
        .range([0, dimensions.width - dimensions.margin.left - dimensions.margin.right]);

    // var yScale = d3.scaleBand()
    //     .domain(data.map(function(d) { return d.country; }))
    //     .range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom])
    //     .padding(0.1);

    data.forEach(function(d, index) {
        d.rank = index + 1;
    });

    barsGroup.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d) { return yScale(d.country); })
        .attr("width", function(d) { return xScale(d.count); })
        .attr("height", yScale.bandwidth())
        .attr("fill", "steelblue")
        
        .on("mouseenter", function(event, d) {
            // Set the currently hovered country
            hoveredCountry = d.country;

            // Highlight the bars of the same country in all charts
            allCharts.forEach(function(chart) {
                chart.selectAll("rect")
                    .filter(function(item) {
                        return item.country === hoveredCountry;
                    })
                    .attr("stroke", "black")
                    .attr("stroke-width", 1.5);
            });

            showTooltip(event, hoveredCountry)
            drawLines(hoveredCountry);
        })
        .on("mouseleave", function(d) {
            // Clear the currently hovered country
            hoveredCountry = null;

            // Remove the border from bars in all charts
            allCharts.forEach(function(chart) {
                chart.selectAll("rect")
                    .attr("stroke", "none");
            });

                        // Hide tooltip on mouseout
            hideTooltip();
            removeLines();
        }) // This closing parenthesis and semicolon should be here
        .on("click", function(event, d) {
            // Filter the scatter plot dots based on the selected country
            window.updateScatterPlot([{
                key: 'Country',
                value: d.country
            }]);
        });



    // Add Y-axis labels
    barsGroup.selectAll(".y-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "y-label")
        .attr("x", -5)
        .attr("y", function(d) { return yScale(d.country) + yScale.bandwidth() / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .style("font-size", "7px")
        .text(function(d) { return d.country; });
}
// Create yScales for each chart
var yScaleDisasters = d3.scaleBand().domain(topCountriesDisasters.map(d => d.country)).range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom]).padding(0.1);
var yScaleDeaths = d3.scaleBand().domain(filteredCountriesDataDeaths.map(d => d.country)).range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom]).padding(0.1);
var yScaleDamages = d3.scaleBand().domain(filteredCountriesDataDamages.map(d => d.country)).range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom]).padding(0.1);

// Create bar charts for natural disasters, deaths, and damages
createBarChart("disasters", topCountriesDisasters, charts, yScaleDisasters);
    createBarChart("deaths", filteredCountriesDataDeaths, charts, yScaleDeaths);
    createBarChart("damages", filteredCountriesDataDamages, charts, yScaleDamages);

// ...





        
});
