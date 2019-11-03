class HierarchyChartLayout {
  constructor() {
    this.iterator = 0;
    this.duration = 750;
    this.buildLayout();
    this.buildTree();
  }

  buildLayout() {
    this.layout = {
      margin: {
        top: 20,
        right: 120,
        left: 120,
        bottom: 20
      }
    };
    this.layout.width = 960 - this.layout.margin.right - this.layout.margin.left;
    this.layout.height = 500 - this.layout.margin.top - this.layout.margin.bottom;
  }

  buildTree() {
    this.tree = d3.layout.tree().size([this.layout.height, this.layout.width]);
    this.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

  }

  setData(chartData) {
    this.root = chartData[0];
    this.root.x0 = this.layout.height / 2;
    this.root.y0 = 0;
  }

  getLayout() {
    return this.layout;
  };
};
