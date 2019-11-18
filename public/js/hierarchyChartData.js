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
    // this.root.x0 = this.layout.height / 2;
    this.root.x0 = 800;
    this.root.y0 = 0;
  }
};
