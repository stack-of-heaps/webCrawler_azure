const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');

module.exports = class WebScraper {
  constructor(requestInfo) {
    this.searchType = requestInfo.search_type;
    this.searchDepth = requestInfo.search_depth;
    this.numPagesVisited = 0;
    this.url = new URL(requestInfo.search_url);
    this.rootUrl = this.url.protocol + "//" + this.url.hostname;
    this.pagesVisited = [];
    this.pagesToVisit = [this.rootUrl];
    this.idVal = 1;
  }

  popChildLink() {
    return this.pagesToVisit.pop();
  }

  pushChildLink(link) {
    this.pagesToVisit.push(link);
  }

  pushExternalLink(link) {
    this.childVisited.push(link);
  }

  pushVisitedLink(url) {
    this.pagesVisited.push(url);
  }

  returnJsonData() {
    return this.jsonData;
  }

  pushUrlData(linkAttr, titleVal, type) {
    if(type === "child") {
      this.jsonData.children.push(this.buildChildLink(linkAttr, titleVal));
    } else if(type === "external") {
      this.jsonData.children.push(this.buildExternalLink(linkAttr, titleVal));
    }
    this.idVal += 1;
  }

  searchChildren(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
      if (myArray[i].name === nameKey) {
        return myArray[i];
      }
    }
  }

  buildRootLink(linkAttr, titleVal) {
    this.jsonData = {
      id: this.idVal,
      status: 200,
      title: titleVal,
      url: this.buildURLInfo(linkAttr),
      children: []
    }
    this.idVal += 1;
  }

  buildExternalLink(linkAttr, titleVal) {
    return {
      id: this.idVal,
      status: 200,
      title: titleVal,
      url: this.buildURLInfo(linkAttr),
      children: []
    };
  }

  buildChildLink(linkAttr, titleVal) {
    var urlObj = new URL(linkAttr);
    return {
      id: this.idVal,
      status: 200,
      title: titleVal,
      url: this.buildURLInfo(linkAttr),
      children: []
    };
  }

  buildURLInfo(linkAttr) {
    var urlInfo = {
      href: linkAttr
    }
    if(this.nonURLLink(linkAttr) != true) {
      var urlObj = new URL(linkAttr);
      urlInfo.protocol = urlObj.protocol,
      urlInfo.origin = urlObj.origin,
      urlInfo.port = this.determinePort(linkAttr),
      urlInfo.host = urlObj.host,
      urlInfo.favicon = "favicon.ico"
    }
    return urlInfo;
  }

  determinePort(linkAttr) {
    if(linkAttr.includes("https://") === true) {
      return 443;
    } else {
      return 80;
    }
  }

  externalURL(linkAttr) {
    return (
      linkAttr.includes("https://") === true ||
      linkAttr.includes("http://") === true  ||
      this.nonURLLink(linkAttr) ||
      linkAttr === "/" ||
      linkAttr.startsWith("#") === true
    )
  }

  nonURLLink(linkAttr) {
    return (
      linkAttr.includes(".pdf") === true  ||
      linkAttr.includes("mailto:") === true
    )
  }
}
