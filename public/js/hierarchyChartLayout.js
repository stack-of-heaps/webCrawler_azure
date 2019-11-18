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
    // this.width = 960 - this.margin.right - this.margin.left;
    // this.height = 500 - this.margin.top - this.margin.bottom;
    this.width = 960;
    this.height = 1000;
  }

  buildSvg() {
    this.svg = d3.select("#visualization").append("svg")
                 .attr("width", "100%")
                 .attr("height", "100%")
                 .append("g")
                 .attr("transform", "translate(" + 100 + "," + this.margin.top + ")");
                 //.attr("width", this.width + this.margin.right + this.margin.left)
                 //.attr("height", this.height + this.margin.top + this.margin.bottom)
  }

  svgSelectAll(nodes) {
    return this.svg.selectAll("g.node").data(nodes, function (d) { return d.id || (d.id = ++this.iterator); });
  }

  handleNodeEnter(nodeEnter) {
    nodeEnter.append("circle")
      .attr("r", function (d) { return d._children || d.children ? 10 : 5; })
      .style("fill", function (d) { return d._children || d.children ? "#FF0000" : "#efefef"; })
      .on("mouseover", this.nodeHover).on("mouseout", this.nodeRemoveHover);

    nodeEnter.append("text")
      .attr("x", function (d) { return d.children || d._children ? -14 : 14; })
      .attr("y", 3)
      .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
      .text(function (d) { return d.title; })
      .style("fill-opacity", 1);
  }

  handleNodeUpdate(node) {
    var nodeUpdate = node.transition()
      .duration(this.duration)
      .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
      .attr("r", function (d) { return d._children || d.children ? 10 : 5; })
      .style("fill", function (d) { return d._children || d.children ? "#FF0000" : "#efefef"; });

    nodeUpdate.select("text")
      .style("fill-opacity", 1);
  }

  handleNodeExit(node, source) {
    var nodeExit = node.exit().transition()
      .duration(this.duration)
      .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

    nodeExit.select("circle")
      .attr("r", function (d) { return d._children || d.children ? 10 : 5; })
      .style("fill", function (d) { return d._children || d.children ? "#FF0000" : "#efefef"; });

    nodeExit.select("text")
      .style("fill-opacity", 1);
  }

  nodeHover(d) {
    var content = HierarchyChartTooltip.buildTooltip(d);
    var tooltip = d3.select('body').append('div').attr('class', 'customTooltip-wrapper');
    tooltip.html(content)
           .style("display", "block")
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY + 10) + "px");
  }

  nodeRemoveHover(d) {
    var tooltip = d3.select('.customTooltip-wrapper');
    // tooltip.remove();
  }
};
