async function submitChartForm(data) {
  console.log(JSON.stringify(data));
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
  updateTree(chartData.root);
  d3.select(self.frameElement).style("height", "600px");

  function updateTree(source) {
    // Compute the new tree layout.
    var nodes = chartData.getTreeNodes();
    var links = chartData.getTreeLinks(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = chartLayout.svgSelectAll(nodes);

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", nodeClick)
      .on("mouseover", nodeHover).on("mouseout", nodeRemoveHover);


    chartLayout.handleNodeEnter(nodeEnter);

    // Transition nodes to their new position.
    chartLayout.handleNodeUpdate(node);

    // Transition exiting nodes to the parent's new position.
    chartLayout.handleNodeExit(node, source);

    // Update the links…
    chartData.handleLink(links, source);

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function buildTooltip(d) {
    //TODO: add the following:
    // - description
    // - favicon
    // - title
    // - type
    // - parent
    // - self

    var toolTipDiv = "";
    toolTipDiv += "<div class='graph-tooltip'>";
    toolTipDiv += "<p class='info-title'>" + d.title  + "</p>";
    toolTipDiv += "<p class='info-description'>" + d.description + "</p>";
    toolTipDiv += "<p class='info-favicon'>" +  d.favicon + "</p>";
    toolTipDiv += "<p class='info-type'>" +  d.type + "</p>";
    toolTipDiv += "<p class='info-self'>" +  d.self + "</p>";
    toolTipDiv += "</div>";
    return toolTipDiv;
  }

  function nodeHover(d) {
    var content = buildTooltip(d);
    var tooltip = d3.select('body').append('div').attr('class', 'customTooltip-wrapper');

    // tooltip.append("svg:title").text(function(d) { return d.description; });

    tooltip.html(content);
    tooltip.transition().duration(200).style("opacity", "1").style("display", "block");

    // d3.select(this).attr('cursor', 'pointer').attr('stroke-width', 50);
    // var y = d3.event.pageY;
    // var x = d3.event.pageX;
    //
    // if (y < 220) {
    //   y += 220 - y;
    //   x += 130;
    // }
    // 
    // tooltip.style('top', (y - 300) + 'px').style('left', (x-470) + 'px');
    //
  }

  function nodeRemoveHover(d) {
    var tooltip = d3.select('.customTooltip-wrapper');
    tooltip.remove();
  }

  function nodeClick(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    updateTree(d);
  }
}

function clearScreen() {
  $(".alert").remove();
  $("svg").remove();
}
