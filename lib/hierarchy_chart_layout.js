var d3 = require('d3');

var hierarchyChartLayout = module.exports = function() {
  var layout = {
    width: 400,
    height: 400,
    margin: {
      top: 5,
      right: 5,
      left: 5,
      bottom: 5
    },
    xAxis: {
      label: ''
    },
    yAxis: {
      label: ''
    }
  };

  return layout;
};
