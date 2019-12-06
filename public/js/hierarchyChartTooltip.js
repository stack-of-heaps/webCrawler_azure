class HierarchyChartTooltip {
  static buildTooltip(d) {
    var toolTipDiv = "";
    toolTipDiv += "<div class='container graph-tooltip'>";
    if(d.self != undefined) {
      if(d.favicon != null) {
        toolTipDiv += HierarchyChartTooltip.buildTooltipImageRow("Favicon", d.favicon);
      }
      if(d.title != null) {
        toolTipDiv += HierarchyChartTooltip.buildTooltipRow("Title", d.title);
      }
      if(d.description != null) {
        toolTipDiv += HierarchyChartTooltip.buildTooltipRow("Description", d.description);
      }
      toolTipDiv += HierarchyChartTooltip.buildTooltipLinkRow("Self", d.self);
    } else {
      if(d.orientation != null) {
        toolTipDiv += HierarchyChartTooltip.buildTooltipRow("Orientation", d.orientation);
      }
      if(d.text != null) {
        toolTipDiv += HierarchyChartTooltip.buildTooltipRow("Text", d.text);
      }
      if(d.type != null) {
        toolTipDiv += HierarchyChartTooltip.buildTooltipRow("Type", d.type);
      }
      if(d.url != null) {
        toolTipDiv += HierarchyChartTooltip.buildTooltipLinkRow("URL", d.url);
      }
    }
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
            "<img class='info-self' src='" + linkInfo + "' alt='favicon-icon' onerror='this.style.display=\"none\"' />",
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

  static fixLongString(str, length) {
    if(typeof str === "undefined" || str === null) {
      return str;
    }
    else if (length == null) {
      length = 50;
    }
    var ending = '...';
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }
  }
};
