var d3 = require('d3');

module.exports = class HierarchyChartLayout {
  getLayout() {
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
  };
};
