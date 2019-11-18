class HierarchyChartTooltip {
  static buildTooltip(d) {
    var toolTipDiv = "";
    toolTipDiv += "<div class='container graph-tooltip'>";
    toolTipDiv += HierarchyChartTooltip.buildTooltipImageRow("Favicon", d.favicon);
    toolTipDiv += HierarchyChartTooltip.buildTooltipRow("Title", d.title);
    toolTipDiv += HierarchyChartTooltip.buildTooltipRow("Description", d.description);
    toolTipDiv += HierarchyChartTooltip.buildTooltipLinkRow("Self", d.self);
    toolTipDiv += "</div>";
    return toolTipDiv;
  }

  static buildTooltipLinkRow(linkTitle, linkInfo) {
    return ['<div class="row">',
            "<div class='col-3'>",
            "<span class='header-self'>" + linkTitle + "</p>",
            "</div>",
            "<div class='col-9'>",
            "<a class='info-self'  target='_blank' href='" + linkInfo + "'>" + linkInfo + "</a>",
            '</div>',
            '</div>'
           ].join('\n');
  }

  static buildTooltipImageRow(linkTitle, linkInfo) {
    return ['<div class="row">',
            "<div class='col-3'>",
            "<span class='header-self'>" + linkTitle + "</p>",
            "</div>",
            "<div class='col-9'>",
            "<img class='info-self' src='" + linkInfo + "' alt='favicon-icon' />",
            '</div>',
            '</div>'
           ].join('\n');
  }

  static buildTooltipRow(linkTitle, linkInfo) {
    return ['<div class="row">',
            "<div class='col-3'>",
            "<span class='header-self'>" + linkTitle + "</p>",
            "</div>",
            "<div class='col-9'>",
            "<span class='info-self'>" + linkInfo  + "</p>",
            '</div>',
            '</div>'
           ].join('\n');
  }
};
