class HierarchyChartData {
  constructor(data, layout) {
    this.treeData = [ data ];
    this.layout = layout;
    this.iterator = 0;
    this.tree = this.buildTree();
    this.diagonal = this.buildDiagonal();
  }

  buildTree() {
    return d3.layout.tree().size([this.layout.height, this.layout.width]);
  }

  buildDiagonal() {
    return d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
  }

  getData() {
    return this.treeData;
  }

  getTreeLinks(nodes) {
    return this.tree.links(nodes);
  }

  getTreeNodes() {
    return this.tree.nodes(this.root).reverse();
  }

  buildTreeRoot() {
    this.root = this.treeData[0];
    this.root.x0 = this.layout.height / 2;
    this.root.y0 = 0;
  }

  handleLink(links, source) {
    this.link = this.layout.svg.selectAll("path.link")
      .data(links, function (d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    this.link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function (d) {
        var o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      });

    // Transition links to their new position.
    this.link.transition()
      .duration(this.layout.duration)
      .attr("d", this.diagonal);

    // Transition exiting nodes to the parent's new position.
    this.link.exit().transition()
      .duration(this.layout.duration)
      .attr("d", function (d) {
        var o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      })
      .remove();
  }
};
