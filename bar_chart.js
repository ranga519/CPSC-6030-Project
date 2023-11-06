d3.csv('./1970-2021_DISASTERS_UPDATED_COUNTRIES.csv').then(function (dataset) {
  var totalValues = getTotalValues(dataset);
  var name = 'totalDeathsValue';

  totalValues.forEach((item) => {
    // item.totalDeathsValue += 10000;
    // console.log(item.totalAffectedValue);
  });
  console.log('totalValues', totalValues);

  drawColBar('#totalDeath', totalValues, name);

  drawRowBar('#totalAffected', totalValues, 'totalAffectedValue');

  drawRowBar('#totalDamages', totalValues, 'totalDamagesValue');
});
