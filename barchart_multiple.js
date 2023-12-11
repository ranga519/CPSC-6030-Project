function allDisaster(disasterCount, type) {
  const resCount = [];
  disasterCount.forEach((count, country) => {
    const obj = {};
    if (!obj?.[country]) {
      obj[country] = {};
    }

    for (const item of count) {
      const dis = item[type];
      if (obj[country]?.[dis]) {
        obj[country][dis]++;
      } else {
        obj[country][dis] = 1;
      }
    }
    resCount.push(obj);
  });

  return resCount;
}

function getTargetType(disasterCount, targetName, type) {
  // console.log('getTargetType....', targetName);
  const resCount = [];
  disasterCount.forEach((count, country) => {
    const obj = {};
    if (!obj?.[country]) {
      obj[country] = {};
    }

    for (const item of count) {
      obj[country][type] = +obj[country][type] || 0;

      if (item[type] && item['Disaster_Type'] === targetName) {
        obj[country][type] += +item[type];
      }
    }
    resCount.push(obj);
  });

  return resCount;
}

function getTargetDisaster(disasterCount, targetName) {
  const _allDisa = allDisaster(disasterCount, 'Disaster_Type');
  const resCount = [];
  for (const country of _allDisa) {
    const countryName = Object.keys(country)[0];
    const countryValue = Object.values(country)[0][targetName];
    const obj = {};
    obj[countryName] = countryValue;
    resCount.push(obj);
  }
  return resCount.map((item) => {
    return {
      [Object.keys(item)[0]]: Object.values(item)[0] || 0,
    };
  });
}

function getTargetDisaterType(disasterCount, targetName, type) {
  // Initialize an object to store the result
  const output = {};

  // Iterate over each country's disaster data
  disasterCount.forEach((count, country) => {
      // Set a default value of 0 for each country
      output[country] = 0;

      // Filter out the disaster data that matches the targetName
      const targetDisasters = count.filter(d => d['Disaster_Type'] === targetName);

      // If we have disasters that match the targetName, sum up the values of 'type'
      if(targetDisasters.length > 0) {
          // Calculate the sum of the 'type' value ('Total Damages' or 'Total Deaths') for the targeted disasters
          const sumOfType = d3.sum(targetDisasters, d => +d[type]);

          // Add this value to the relevant country in the output object
          output[country] = sumOfType;
      }
  });

  // Convert the output object into an array of objects as per the original function's output format
  return Object.keys(output).map(key => ({ [key]: output[key] }));
}


d3.csv("1970-2021_DISASTERS_UPDATED_COUNTRIES.csv").then(function(dataset) {
  //svg dimensions
  var dimensions = {
      width: 260,
      height: 590,
      margin: {
          top: 15,
          bottom: 10,
          left: 100,
          right: 10
      }
  };
  

  // Create three tooltip divs for each chart
  var tooltipDisasters = d3.select("body").append("div")
                          .attr("class", "tooltip")
                          .style("opacity", 0)
                          .style("position", "absolute")
                          .style("padding", "10px")
                          .style("background", "lightgrey")
                          .style("border", "1px solid black")
                          .style("border-radius", "5px")
                          .style("pointer-events", "none")
                          .style("text-align", "left")
                          .style("font-size", "12px")
                          .style("display", "none");

  var tooltipDeaths = d3.select("body").append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0)
                      .style("position", "absolute")
                      .style("padding", "10px")
                      .style("background", "lightgrey")
                      .style("border", "1px solid black")
                      .style("border-radius", "5px")
                      .style("pointer-events", "none")
                      .style("text-align", "left")
                      .style("font-size", "12px")
                      .style("display", "none");

  var tooltipDamages = d3.select("body").append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0)
                      .style("position", "absolute")
                      .style("padding", "10px")
                      .style("background", "lightgrey")
                      .style("border", "1px solid black")
                      .style("border-radius", "5px")
                      .style("pointer-events", "none")
                      .style("text-align", "left")
                      .style("font-size", "12px")
                      .style("display", "none");

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
 

  // Create an array of objects for each country and its count of natural disasters
  var countriesDataDisasters = Object.keys(totalDisastersByCountry).map(function(country) {
      return { country: country, count: totalDisastersByCountry[country] };
  });

  // Sort the array in descending order based on the count
  countriesDataDisasters.sort(function(a, b) {
      return b.count - a.count;
  });

  // Select the top X countries
  // Create a div element for the tooltip
  var sliced = 100
  var topCountriesDisasters = countriesDataDisasters.slice(0,sliced);
  var topXCountries = new Set(topCountriesDisasters.map(d => d.country));



  // Create an array of objects for each country and its count of deaths
  var countriesDataDeaths = Object.keys(totalDeathsByCountry).map(function(country) {
      return { country: country, count: totalDeathsByCountry[country] };
  });

  // Sort the array in descending order based on the count
  countriesDataDeaths.sort(function(a, b) {
      return b.count - a.count;
  });


  // Create an array of objects for each country and its count of damages
  var countriesDataDamages = Object.keys(totalDamagesByCountry).map(function(country) {
      return { country: country, count: totalDamagesByCountry[country] };
  });

  // Sort the array in descending order based on the count
  countriesDataDamages.sort(function(a, b) {
      return b.count - a.count;
  });

  // Filter deaths and damages data to include only top X countries by number of disasters
  var filteredCountriesDataDeaths = countriesDataDeaths.filter(d => topXCountries.has(d.country));
  var filteredCountriesDataDamages = countriesDataDamages.filter(d => topXCountries.has(d.country));

  // Select the top 75 countries
  // var topCountriesDamages = countriesDataDamages.slice(0,sliced);

  // console.log(topCountriesDamages);

  // ...
  // Sort the filtered datasets alphabetically
  var alphabeticalCountriesDisasters = [...topCountriesDisasters].sort((a, b) => a.country.localeCompare(b.country));
  var alphabeticalCountriesDeaths = [...filteredCountriesDataDeaths].sort((a, b) => a.country.localeCompare(b.country));
  var alphabeticalCountriesDamages = [...filteredCountriesDataDamages].sort((a, b) => a.country.localeCompare(b.country));

  console.log(alphabeticalCountriesDamages)

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


  // Function to show tooltips for a given country for ranked view
  function showTooltips(country, event) {
      // Get the positions of the charts
      var chart1Pos = chart1.node().getBoundingClientRect();
      var chart2Pos = chart2.node().getBoundingClientRect();
      var chart3Pos = chart3.node().getBoundingClientRect();

      // Calculate Y-positions of the tooltips for each chart
      var yDisasters = chart1Pos.top + yScaleDisasters(country) + yScaleDisasters.bandwidth() / 2;
      var yDeaths = chart2Pos.top + yScaleDeaths(country) + yScaleDeaths.bandwidth() / 2;
      var yDamages = chart3Pos.top + yScaleDamages(country) + yScaleDamages.bandwidth() / 2;

      // Set a fixed horizontal position for each tooltip
      var xPosition1 = chart1Pos.right - 70 ; // You can adjust this value as needed
      var xPosition2 = chart2Pos.right - 70; 
      var xPosition3 = chart3Pos.right - 70; 

      // Update and show each tooltip with the rank for the hovered country
      tooltipDisasters.html("Disasters Rank: " + countryRanks.disasters[country])
          .style("left", xPosition1 + "px")
          .style("top", yDisasters + "px")
          .style("opacity", 1)
          .style("display", "block");

      tooltipDeaths.html("Deaths Rank: " + countryRanks.deaths[country])
          .style("left", xPosition2 + "px")
          .style("top", yDeaths + "px")
          .style("opacity", 1)
          .style("display", "block");

      tooltipDamages.html("Damages Rank: " + countryRanks.damages[country])
          .style("left", xPosition3 + "px")
          .style("top", yDamages + "px")
          .style("opacity", 1)
          .style("display", "block");
  }
 
  function showTooltipsAlpha(country, event) {
      // Get the positions of the charts
      var chart1Pos = chart1.node().getBoundingClientRect();
      var chart2Pos = chart2.node().getBoundingClientRect();
      var chart3Pos = chart3.node().getBoundingClientRect();

      // Calculate Y-positions of the tooltips for each chart
      var yDisasters = chart1Pos.top + yScaleDisastersAlpha(country) + yScaleDisastersAlpha.bandwidth() / 2 - 20;
      var yDeaths = chart2Pos.top + yScaleDeathsAlpha(country) + yScaleDeathsAlpha.bandwidth() / 2 - 20;
      var yDamages = chart3Pos.top + yScaleDamagesAlpha(country) + yScaleDamagesAlpha.bandwidth() / 2 - 20;

      // Set a fixed horizontal position for each tooltip
      var xPosition1 = chart1Pos.right - 70 ; 
      var xPosition2 = chart2Pos.right - 70; 
      var xPosition3 = chart3Pos.right - 70; 

      // Update and show each tooltip with the rank for the hovered country
      tooltipDisasters.html("Disasters Rank: " + countryRanks.disasters[country])
          .style("left", xPosition1 + "px")
          .style("top", yDisasters + "px")
          .style("opacity", 1)
          .style("display", "block");

      tooltipDeaths.html("Deaths Rank: " + countryRanks.deaths[country])
          .style("left", xPosition2 + "px")
          .style("top", yDeaths + "px")
          .style("opacity", 1)
          .style("display", "block");

      tooltipDamages.html("Damages Rank: " + countryRanks.damages[country])
          .style("left", xPosition3 + "px")
          .style("top", yDamages + "px")
          .style("opacity", 1)
          .style("display", "block");
  }



  // Function to hide all tooltips
  function hideTooltips() {
      tooltipDisasters.style("opacity", 0).style("display", "none");
      tooltipDeaths.style("opacity", 0).style("display", "none");
      tooltipDamages.style("opacity", 0).style("display", "none");
  }

  // Function to draw lines for ranked view
  function drawLines(country) {
      // Calculate Y-positions of bars
      var yDisasters = chart1.node().getBoundingClientRect().top + yScaleDisasters(country) + yScaleDisasters.bandwidth() / 2 + 15;
      var yDeaths = chart2.node().getBoundingClientRect().top + yScaleDeaths(country) + yScaleDeaths.bandwidth() / 2 + 15;
      var yDamages = chart3.node().getBoundingClientRect().top + yScaleDamages(country) + yScaleDamages.bandwidth() / 2 + 15;

      // X-positions (assuming charts are horizontally aligned)
      var x1 = dimensions.width;
      var x2 = dimensions.width * 2;

      // Adjust X-positions 
      var chartWidth = dimensions.width + dimensions.margin.left + dimensions.margin.right;
      var xStartDisasters = dimensions.margin.left + dimensions.width / 2 - 95; 
      var xEndDisasters = xStartDisasters + chartWidth / 2 + 80; 
      var xStartDeaths = xEndDisasters;
      var xEndDeaths = xStartDeaths + chartWidth / 2 + 80; 
  

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

 

  // Function to draw straight lines between bars of the same country in alphabetical order
  function drawLinesAlpha(country) {
      // Calculate Y-positions of bars
      var yDisasters = chart1.node().getBoundingClientRect().top + yScaleDisastersAlpha(country) + yScaleDisastersAlpha.bandwidth() / 2 + 15;
      var yDeaths = chart2.node().getBoundingClientRect().top + yScaleDeathsAlpha(country) + yScaleDeathsAlpha.bandwidth() / 2 + 15;
      var yDamages = chart3.node().getBoundingClientRect().top + yScaleDamagesAlpha(country) + yScaleDamagesAlpha.bandwidth() / 2 + 15;

      // X-positions (assuming charts are horizontally aligned)
      var x1 = dimensions.width;
      var x2 = dimensions.width * 2;

      // Adjust X-positions 
      var chartWidth = dimensions.width + dimensions.margin.left + dimensions.margin.right;
      var xStartDisasters = dimensions.margin.left + dimensions.width / 2 - 95; 
      var xEndDisasters = xStartDisasters + chartWidth / 2 + 80; 
      var xStartDeaths = xEndDisasters + 20;
      var xEndDeaths = xStartDeaths + chartWidth / 2 + 60; 
  

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


  function createBarChart(svgId, data, allCharts, titleText, isAlphabetical) {
      var svg = d3.select("#" + svgId)
          .style("width", dimensions.width)
          .style("height", dimensions.height);

      var barsGroup = svg.append("g")
          .attr("transform", "translate(" + dimensions.margin.left + "," + dimensions.margin.top + ")");
      
      // Add title
      svg.append("text")
          .attr("x", dimensions.margin.left) // Position the title
          .attr("y", 12) // A little below the top edge of the SVG
          .attr("text-anchor", "start")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(titleText); // Title text

      var sortedData = isAlphabetical ? data.sort((a, b) => a.country.localeCompare(b.country)) : data;

      var xScale = d3.scaleLog()
          .domain([1, d3.max(data, function(d) { return d.count; })])
          .range([0, dimensions.width - dimensions.margin.left - dimensions.margin.right]);

      var yScale = d3.scaleBand()
          .domain(sortedData.map(d => d.country))
          .range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom])
          .padding(0.1);


      data.forEach(function(d, index) {
          d.rank = index + 1;
      });

      var currentTooltip;
      if (svgId === "disasters") {
          currentTooltip = tooltipDisasters;
      } else if (svgId === "deaths") {
          currentTooltip = tooltipDeaths;
      } else {
          currentTooltip = tooltipDamages;
      }

      barsGroup.selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", 0)
          .attr("y", function(d) { return yScale(d.country); })
          .attr("width", function(d) { return xScale(d.count); })
          .attr("height", yScale.bandwidth())
          .attr("fill", "purple")
          
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

         
          if (isAlphabetical) {
              showTooltipsAlpha(d.country, event); //tooltip function for alphabetical view
              drawLinesAlpha(d.country); //line drawing function for alphabetical view
          } else {
              showTooltips(d.country, event); //tooltip function for rank view
              drawLines(d.country); //line drawing function for rank view
          }


           // Apply blur effect to all country labels in all charts
          charts.forEach(chart => {
              chart.selectAll(".y-label")
                  .style("opacity", 0.5); // Dimming effect
          });

          // Highlight the hovered country label in all charts
          charts.forEach(chart => {
              chart.selectAll(".y-label")
                  .filter(function(label) { return label.country === d.country; })
                  .style("font-weight", "bold")
                  .style("font-size", "8px")
                  .style("opacity", 1); // Remove dimming for the selected country
              });

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
          hideTooltips();
          removeLines();

              // Reset country labels to original style in all charts
          charts.forEach(chart => {
              chart.selectAll(".y-label")
                  .style("font-weight", "normal")
                  .style("font-size", "6px")
                  .style("opacity", 1);
      });
      }) 
    .on("click", function(event, d) {
        // Filter the scatter plot dots based on the selected country
        window.updateScatterPlot([{
            key: 'Country',
            value: d.country
        }]);

        window.filterBubbleChart(d.country);
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
      .style("font-size", "6px")
      .style("fill", "black")
      .text(function(d) { return d.country; });
}
// Create yScales for each chart

var yScaleDisasters = d3.scaleBand().domain(topCountriesDisasters.map(d => d.country)).range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom]).padding(0.1);
var yScaleDeaths = d3.scaleBand().domain(filteredCountriesDataDeaths.map(d => d.country)).range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom]).padding(0.1);
var yScaleDamages = d3.scaleBand().domain(filteredCountriesDataDamages.map(d => d.country)).range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom]).padding(0.1);


var yScaleDisastersAlpha = d3.scaleBand()
  .domain(alphabeticalCountriesDisasters.map(d => d.country))
  .range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom])
  .padding(0.1);

var yScaleDeathsAlpha = d3.scaleBand()
  .domain(alphabeticalCountriesDeaths.map(d => d.country))
  .range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom])
  .padding(0.1);

  var yScaleDamagesAlpha = d3.scaleBand()
  .domain(alphabeticalCountriesDamages.map(d => d.country))
  .range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom])
  .padding(0.1);

// Function to clear existing charts
function clearCharts() {
  d3.select("#disasters").selectAll("*").remove();
  d3.select("#deaths").selectAll("*").remove();
  d3.select("#damages").selectAll("*").remove();
}
// Function to update charts
function updateCharts(isAlphabetical) {

  clearCharts();
  if (isAlphabetical) {
      createBarChart("disasters", alphabeticalCountriesDisasters, charts, "Number of Disasters", true);
      createBarChart("deaths", alphabeticalCountriesDeaths, charts, "Number of Deaths", true);
      createBarChart("damages", alphabeticalCountriesDamages, charts, "Financial Damages($)", true);
  } else {
      createBarChart("disasters", topCountriesDisasters, charts, "Number of Disasters", false);
      createBarChart("deaths", filteredCountriesDataDeaths, charts, "Number of Deaths", false);
      createBarChart("damages", filteredCountriesDataDamages, charts, "Financial Damages($)", false);
  }
}

// Event listeners for the buttons
d3.select("#rankViewButton").on("click", function() {
  updateCharts(false);
});

d3.select("#alphaViewButton").on("click", function() {
  updateCharts(true);
});


// Call updateCharts initially with the default view (rank-based)
updateCharts(false);

// Make modifications on barchart based on the clicks bubble chart
window.updateBarChart = (hash,isAlphabetical) => {
  function mapRank(rank,isAlphabetical) {
    const temp = rank
      .map((item) => {
        return {
          country: Object.keys(item)[0],
          count: Object.values(item)[0] || 0,
        };
      })
      //it seems the isAlphabetical is always False, need more work here
    if (!isAlphabetical) {
        temp.sort((a, b) => b['count'] - a['count']);
    }
    const res = temp.map((item, inx) => {
      const { count, country } = item;
      return {
        count,
        country
      };
    });
    const disLen = 100 - res.length;
    if (disLen > 0) {
      for (let i = 0, len = disLen; i < len; i++) {
       // res.push({ country: '', count: 0 });
      }
    } else {
      res.length = 100;
    }
    //return res.filter((item) => item.count > 0);
    return res;
  }
  // const urlObj = new URL(hash.newURL);
  // let h = urlObj.hash.replace('#/', '').replace('-', ' ');
  let h = hash;
  if (h === 'Extreme temperature') {
    h = 'Extreme temperature ';
  }
  //   createBarChart('disasters', topCountriesDisasters, charts, yScaleDisasters);
  let disasterRank = getTargetDisaster(disasterCount, h);
  disasterRank = mapRank(disasterRank,isAlphabetical);
  disasterRank = disasterRank.filter(item => item.count > 0);
  var countryListFilter = [];
  for(var i = 0; i < disasterRank.length; i++) {
    countryListFilter.push(disasterRank[i].country);
  }
  var filteredDisasterCount = new Map();
  for (let country of countryListFilter) {
      if (disasterCount.has(country)) {
        filteredDisasterCount.set(country, disasterCount.get(country));
      }
  }
  calculateRanks(disasterRank, 'disasters');

  let deathRank = getTargetDisaterType(filteredDisasterCount, h, 'Total Deaths');
  deathRank = mapRank(deathRank,isAlphabetical);
  calculateRanks(deathRank, 'deaths');

  let damageRank = getTargetDisaterType(filteredDisasterCount, h, `Total Damages ('000 US$)`);
  damageRank = mapRank(damageRank,isAlphabetical);
  calculateRanks(damageRank, 'damages');

  yScaleDisasters = d3
    .scaleBand()
    .domain(disasterRank.map((d) => d.country))
    .range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom])
    .padding(0.1);

  yScaleDeaths = d3
    .scaleBand()
    .domain(deathRank.map((d) => d.country))
    .range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom])
    .padding(0.1);

  yScaleDamages = d3
    .scaleBand()
    .domain(damageRank.map((d) => d.country))
    .range([0, dimensions.height - dimensions.margin.top - dimensions.margin.bottom])
    .padding(0.1);

  const disasterWrap = document.getElementById('disasters');
  const deathsWrap = document.getElementById('deaths');
  const damagesWrap = document.getElementById('damages');

  disasterWrap.removeChild(document.querySelector('#disasters>g'))
  deathsWrap.removeChild(document.querySelector('#deaths>g'))
  damagesWrap.removeChild(document.querySelector('#damages>g'))

  createBarChart('disasters', disasterRank, charts, yScaleDisasters,isAlphabetical);
  createBarChart('deaths', deathRank, charts, yScaleDeaths,isAlphabetical);
  createBarChart('damages', damageRank, charts, yScaleDamages,isAlphabetical);

  window.resetCharts = function() {
  clearCharts(); // Clear existing charts
  // Recreate the charts with the initial data
  createBarChart("disasters", topCountriesDisasters, charts, "Number of Disasters", false);
  createBarChart("deaths", filteredCountriesDataDeaths, charts, "Number of Deaths", false);
  createBarChart("damages", filteredCountriesDataDamages, charts, "Financial Damages($)", false);
  }

  // createBarChart('disasters', topCountriesDisasters, charts, yScaleDisasters);
};

});
