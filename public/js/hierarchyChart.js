async function submitChartForm(data) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: "/search",
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function (response) {
        resolve({
          data: response,
          error: null
        });
      },
      error: function () {
        alert("There was an error crawling the page");
        reject({
          data: null,
          error: 'Error encountered in submitChartForm POST'
        })
      }
    });
  })
}

function buildChart(response) {
  clearScreen();

  var chartLayout = new HierarchyChartLayout();
  var chartData = new HierarchyChartData(response, chartLayout);

  chartData.buildTreeRoot();
  update(chartData.root);
  d3.select(self.frameElement).style("height", "900px");

  function update(source) {
    // Compute the new tree layout.
    var nodes = chartData.getTreeNodes();
    var links = chartData.getTreeLinks(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) { d.y = d.depth * 180; });

    var node = chartLayout.svgSelectAll(nodes);

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

    chartLayout.handleNodeEnter(nodeEnter);

    // Transition nodes to their new position.
    chartLayout.handleNodeUpdate(node);

    // Transition exiting nodes to the parent's new position.
    chartLayout.handleNodeExit(node, source);

    // Update the links…
    var link = chartLayout.svg.selectAll("path.link")
      .data(links, function (d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function (d) {
        var o = { x: source.x0, y: source.y0 };
        return chartData.diagonal({ source: o, target: o });
      });

    // Transition links to their new position.
    link.transition()
      .duration(chartLayout.duration)
      .attr("d", chartData.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(chartLayout.duration)
      .attr("d", function (d) {
        var o = { x: source.x, y: source.y };
        return chartData.diagonal({ source: o, target: o });
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }
}

function clearScreen() {
  $("svg").remove();
  let searchStatus = document.getElementById('search_status');
  searchStatus.hidden = true;
}
