function submitFunction() {
  $.ajax({
    type: 'POST',
    url: "/search",
    data: null,
    success: function(response) {
      buildChart(response);
    },
    error: function() {
      alert("There was an error submitting comment");
    }
  });
}

function buildChart(data) {
  // layout = new HierarchyChartLayout();
  chart_data = new HierarchyChartData(data);

  var root = d3.hierarchy(chart_data.getData());

  var handleEvents = function( selection ) {
    selection.on('mouseover', function() {
      let g = d3.select(this);
      let n = g.select('.the-node');

      if(n.classed('solid')) {
        n.transition().duration(400)
        .style('fill', "rgba(211,0,0,0.8)" )
        .attr('r', 18);
      } else {
        n.transition().duration(400)
        .style('fill', "rgba(211,0,0,0.8)" );
      }

      g.select('.label')
        .transition().duration(700)
        .style('fill', 'white')

    })
    .on('mouseout', function() {
      let g = d3.select(this);
      let n = g.select('.the-node');

      if(n.classed('solid')) {
        n.transition().duration(400)
        .style('fill', "#696969" )
        .attr('r',14);
      }  else {
       n.transition().duration(400)
        .style('fill', "rgba(255,255,255,0.2)" )
      }
      g.select('.label')
        .transition().duration(700)
        .style('fill', "black")
    });
  }

  /* TREE LAYOUT */

  var treeLayout = d3.tree();
  treeLayout.size([400,200]);
  treeLayout(root);

  var tree = d3.select('#tree g.nodes');

  var treeNodes = tree.selectAll('g.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .classed('node', true)
    .call(handleEvents)


  treeNodes.append('circle')
    .classed('the-node solid', true)
    .attr('cx', d=> d.x)
    .attr('cy', d=> d.y)
    .attr('r', d => 14)
    .style("fill", "#696969");


  treeNodes.append('text')
    .attr('class', 'label')
    .attr('dx', d => d.x)
    .attr('dy', d => d.y+4)
    .text(d => d.data.title)

  var treeLinks = d3.select('#tree g.links')
    .selectAll('line.link')
    .data(root.links())
    .enter()
    .append('line')
    .classed('link', true)
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .style("stroke", "#5f5f5f")
}

