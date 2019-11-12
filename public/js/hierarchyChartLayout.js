class HierarchyChartLayout {
  constructor() {
    this.iterator = 0;
    this.duration = 750;
    this.buildLayout();
    this.buildSvg();
  }

  buildLayout() {
    this.margin = {
        top: 30,
        bottom: 20,
        right: 120,
        left: 300
    };
    this.width = 960 - this.margin.right - this.margin.left;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  buildSvg() {
    this.svg = d3.select("#visualization").append("svg")
                 .attr("width", this.width + this.margin.right + this.margin.left)
                 .attr("height", this.height + this.margin.top + this.margin.bottom)
                 .append("g")
                 .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  }

  svgSelectAll(nodes) {
    return this.svg.selectAll("g.node").data(nodes, function (d) { return d.id || (d.id = ++this.iterator); });
  }

  handleNodeEnter(nodeEnter) {
    nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
      .attr("x", function (d) { return d.children || d._children ? -13 : 13; })
      .attr("dy", ".35em")
      .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
      .text(function (d) { return d.title; })
      .style("fill-opacity", 1e-6);
  }

  handleNodeUpdate(node) {
    var nodeUpdate = node.transition()
      .duration(this.duration)
      .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
      .attr("r", 10)
      .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
      .style("fill-opacity", 1);
  }

  handleNodeExit(node, source) {
    var nodeExit = node.exit().transition()
      .duration(this.duration)
      .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

    nodeExit.select("circle")
      .attr("r", 1e-6);

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);
  }
};
