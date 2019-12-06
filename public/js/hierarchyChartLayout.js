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
    // // size of the diagram
    this.width = 960;
    this.height = 3200;
  }

  buildSvg() {
    this.translateX = 250;
    this.translateY = 20;
    this.scaleSvg = 1;
    if(Number($("#search_depth").val()) > 5) {
      this.translateX = -150;
      this.translateY = 300;
      this.scaleSvg = .9;
    } else if ($('input[name=search_type]:checked').val() === "breadth_search" && Number($("#search_depth").val()) > 2){
      this.scaleSvg = .9;
    }

    this.svg = d3.select("#visualization").append("svg")
                 .attr("width", "100%")
                 .attr("height", this.height)
                 .append("g")
                 .attr("transform", "translate(" + this.translateX + "," + this.translateY + ") scale("+ this.scaleSvg +")");
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
      .text(function (d) { return HierarchyChartTooltip.fixLongString(d.title, 25); })
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
    tooltip.remove();
  }
};
