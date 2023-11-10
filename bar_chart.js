/**
 * 
 * @returns 
 */
 function getTotalValues(rawData) {
  var _totalValues = [];

  for (let i = 0, len = rawData.length; i < len; i++) {
    var item = rawData[i];
    let isBreak = false;

    // identify if there are same Country
    for (let j = 0, jlen = _totalValues.length; j < jlen; j++) {
      var jtem = _totalValues[j];
      // if same 
      if (item.Country === jtem.country) {
        _totalValues[j].totalDeathsValue += +item['Total Deaths'];
        _totalValues[j].totalAffectedValue += +item['Total_Affected'];
        _totalValues[j].totalDamagesValue += +item[`Total Damages ('000 US$)`];
        isBreak = true;
        break;
      }
    }

    // if no same Country（new Country）
    if (!isBreak) {
      _totalValues.push({
        country: item.Country,
        totalDeathsValue: +item['Total Deaths'],
        totalAffectedValue: +item['Total_Affected'],
        totalDamagesValue: +item[`Total Damages ('000 US$)`],
      });
    }
  }

  return _totalValues;
}

/**
 * draw virtual barchart 
 * @param {*} targetId target id
 * @param {*} totalValues all data
 * @param {*} valueName target data
 */
function drawColBar(targetId, totalValues, valueName) {
  var _totalValues = totalValues.sort((a, b) => b[valueName] - a[valueName]);

  var colBarConfig = {
    width: 31800,
    height: 400,
    margin: { top: 20, right: 30, bottom: 40, left: 100 },
  };
  var chartWidth = colBarConfig.width - colBarConfig.margin.left - colBarConfig.margin.right;
  var chartHeight = colBarConfig.height - colBarConfig.margin.top - colBarConfig.margin.bottom;

  var svg = d3
    .select(targetId)
    .attr('width', colBarConfig.width)
    .attr('height', colBarConfig.height);
  var chart = svg
    .append('g')
    .attr('transform', `translate(${colBarConfig.margin.left}, ${colBarConfig.margin.top})`);

  var xScale = d3
    .scaleBand()
    .domain(_totalValues.map((d) => d.country))
    .range([0, chartWidth])
    .padding(0.4);

  var yScale = d3
    .scaleLinear()
    .domain([0, d3.max(_totalValues, (d) => Math.max(d[valueName]))])
    .range([chartHeight, 0]);

  var xAxis = d3.axisBottom(xScale);

  var yAxis = d3.axisLeft(yScale);

  chart.append('g').attr('transform', `translate(0, ${chartHeight})`).call(xAxis);

  chart.append('g').call(yAxis);

  var bars = chart
    .selectAll('.bar')
    .data(_totalValues)
    .enter()
    .append('g')
    .attr('class', 'bar')
    .attr('transform', function (d) {
      return `translate(${xScale(d.country) - 90},0)`;
    });

  bars
    .append('rect')
    .attr('x', xScale.bandwidth())
    .attr('y', (d) => yScale(d[valueName]))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => chartHeight - yScale(d[valueName]))
    .style('fill', 'skyblue');
}

/**
 * draw horizontal barchart
 * @param {*} targetId 
 * @param {*} totalValues 
 * @param {*} valueName 
 */
function drawRowBar(targetId, totalValues, valueName) {
  var _totalValues = totalValues.sort((a, b) => b[valueName] - a[valueName]);

  // create SVG
  var svg = d3
    .select(targetId)
    .attr('width', 500) // width
    .attr('height', 4999); // height

  // define drawing area
  var margin = { left: 250, right: 150, top: 20, bottom: 20 };
  var width = +svg.attr('width') - margin.left - margin.right;
  var height = +svg.attr('height') - margin.top - margin.bottom;

  // scale
  var xScale = d3
    .scaleLinear()
    .domain([0, d3.max(_totalValues, (d) => d[valueName])])
    .range([0, width]);

  var yScale = d3
    .scaleBand()
    .domain(_totalValues.map((d) => d.country))
    .range([0, height])
    .padding(0.1);

  // draw the barchart
  var g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  g.selectAll('rect')
    .data(_totalValues)
    .enter()
    .append('rect')
    .attr('x', 0) // left
    .attr('y', (d) => yScale(d.country))
    .attr('width', (d) => xScale(d[valueName]))
    .attr('height', yScale.bandwidth())
    .style('fill', '#2C608A');

  // add countries name
  g.selectAll('text.country-label')
    .data(_totalValues)
    .enter()
    .append('text')
    .attr('class', 'country-label')
    .attr('x', -10) // adjust left 
    .attr('y', (d) => yScale(d.country) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .text((d) => d.country)
    .style('text-anchor', 'end')
    .style('fill', '#778E9E');

  // add value
  g.selectAll('text.value-label')
    .data(_totalValues)
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('x', (d) => xScale(d[valueName]) + 5) // adjust right side
    .attr('y', (d) => yScale(d.country) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .text((d) => d[valueName]);
}


d3.csv('./1970-2021_DISASTERS_UPDATED_COUNTRIES.csv').then(function (dataset) {
  var totalValues = getTotalValues(dataset);

  // totalValues.forEach((item) => {
  // item.totalDeathsValue += 10000;
  // console.log(item.totalAffectedValue);
  // });
  // console.log('totalValues', totalValues);

  drawRowBar('#totalDeath', totalValues, 'totalDeathsValue');

  drawRowBar('#totalAffected', totalValues, 'totalAffectedValue');

  drawRowBar('#totalDamages', totalValues, 'totalDamagesValue');


});
