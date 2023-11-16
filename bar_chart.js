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
    .attr('height', 400); // height

  // define drawing area
  var margin = { left: 210, right: 150, top: 20, bottom: 20 };
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
    .attr('width', (d) => xScale(d[valueName]+1))
    .attr('height', yScale.bandwidth())
    .style('fill', '#2C608A');
  function formatTickValue(value) {
      if (value >= 1e6) {
        return (value / 1e6).toFixed(0) + 'M';
      } else if (value >= 1e3) {
        return (value / 1e3).toFixed(0) + 'K';
      }
      return value;
  }
  var customTicks = xScale.ticks(3).slice(1, 3);
    //add x axis
  var xAxis = d3.axisBottom(xScale).tickValues(customTicks).tickFormat(formatTickValue);
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);
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
}


d3.csv('./1970-2021_DISASTERS_UPDATED_COUNTRIES.csv').then(function (dataset) {
  var totalValues = getTotalValues(dataset);

  console.log('totalValues', totalValues);

  totalValues.sort((a, b) => b['totalDeathsValue'] - a['totalDeathsValue']);
  var top10Items1 = totalValues.slice(0, 10);
  totalValues.sort((a, b) => b['totalDamagesValue'] - a['totalDamagesValue']);
  var top10Items2 = totalValues.slice(0, 10);
  console.log('totalValue2222s', totalValues);


  drawRowBar('#totalDeath', top10Items1, 'totalDeathsValue');
  drawRowBar('#totalDamages', top10Items2, 'totalDamagesValue');


});