const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');

module.exports = class WebScraper {
  constructor(rootUrl) {
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.pagesToVisit = [rootUrl];
    this.url = new URL(rootUrl);
    this.rootUrl = this.url.protocol + "//" + this.url.hostname;
  }

  parsedLinkInfo() {
    console.log('parsed home page: ' + this.rootUrl);
    this.breadthSearch();
    // TODO: here we will return the final parsed data to the chart
    // return pagesVisited;
  }

  pushChildLink(link) {
    this.pagesVisited.push(link);
  }

  popChildLink() {
    this.pagesVisited.pop();
  }

  breadthSearch() {
    console.log("in breadthSearch function");
    // var nextPage = this.popChildLink();
    // if (nextPage in pagesVisited) {
    //   // We've already visited this page, so repeat the crawl
    //   this.breadthSearch();
    // } else {
    //   // New page we haven't visited
    //   visitPage(nextPage, crawl);
    // }
  }

  depthSearch() {
  }

}

//
// function visitPage(url, callback) {
//   // Add page to our set
//   pagesVisited[url] = true;
//   numPagesVisited++;
//
//   // Make the request
//   console.log("Visiting page " + url);
//   request(url, function(error, response, body) {
//      // Check status code (200 is HTTP OK)
//      console.log("Status code: " + response.statusCode);
//      if(response.statusCode !== 200) {
//        callback();
//        return;
//      }
//      // Parse the document body
//      var $ = cheerio.load(body);
//      var isWordFound = searchForWord($, SEARCH_WORD);
//      if(isWordFound) {
//        console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
//      } else {
//        collectInternalLinks($);
//        // In this short program, our callback is just calling crawl()
//        callback();
//      }
//   });
// }
//
// function searchForWord($, word) {
//   var bodyText = $('html > body').text().toLowerCase();
//   return(bodyText.indexOf(word.toLowerCase()) !== -1);
// }
//
// function collectInternalLinks($) {
//     var relativeLinks = $("a[href^='/']");
//     console.log("Found " + relativeLinks.length + " relative links on page");
//     relativeLinks.each(function() {
//         pagesToVisit.push(baseUrl + $(this).attr('href'));
//     });
// }
