class HierarchyChartData {
  constructor(data, layout) {
    this.treeData = [ data ];
    this.layout = layout;
    this.iterator = 0;
    this.tree = this.buildTree();
    this.diagonal = this.buildDiagonal();
  }

  buildTree() {
    return d3.layout
      .tree()
      .size([this.layout.height, this.layout.width])
      .children(function(d) {
          return !d.children || d.children.length === 0 ? null : d3.shuffle(d.children);
      });
      // .children(this.determineChildren);

  }

  determineChildren(d) {
    if(typeof d.links != "undefined" && typeof d.children != "undefined") {
    // if((d.links || d.links.length != 0) && (d.children || d.children.length != 0)) {
      d.children = d.children.concat(d.links.slice(0, 3));
      return d.children;
    }else if(typeof d.children != "undefined") {
      return d.children;
    } else if(typeof d.links != "undefined") {
      return d.links;
    } else {
      return null;
    }
    // return !d.links || d.links.length === 0 ? null : d.links;
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
    this.tree.nodes(this.root).forEach((d,i) => {
      d.id = i+1;
    });
  }
};
