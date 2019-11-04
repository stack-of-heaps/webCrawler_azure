const request = require('request');
const cheerio = require('cheerio');
var PagesVisited = 0;

module.exports.parsedLinkInfo = function (scraper, callback) {
  PagesVisited = 0;
  if (scraper.searchType === "breadth_search") {
    breadthSearch(scraper, function(scraper) {
      callback(scraper);
      return;
    });
  } else if (scraper.searchType === "depth_search") {
    depthSearch();
  }
}

function breadthSearch(scraper, callback) {
  if(PagesVisited === 10) {
    console.log("numPagesVisited REACHED");
    callback(scraper);
    return;
  }

  if(scraper.pagesToVisit.length === 0) {
    callback(scraper);
    return;
  }

  var nextPage = scraper.popChildLink();
  if (scraper.pagesVisited.includes(nextPage)) {
    breadthSearch(scraper, callback);
  } else {
    visitLink(nextPage, breadthSearch, scraper, callback);
  }
}

function visitLink(url, callback, scraper, finishCallback) {
    PagesVisited += 1;
    try {
      scraper.pushVisitedLink(url);
      console.log("Visiting page " + url);
      request(url, function(error, response, body) {
        if(error) {
          // console.error("Error retrieving page: " + error);
          callback(scraper, finishCallback);
        } else if(response === "undefined") {
          callback(scraper, finishCallback);
        } else if(response.statusCode !== 200) {
          callback(scraper, finishCallback);
        }

        try {
          var $ = cheerio.load(body);

          scraper.numPagesVisited += 1;
          if(scraper.numPagesVisited === 1) {
            let titleVal = $("title").text();
            scraper.buildRootLink(url, titleVal);
          }

          var pageLinks = $("a");
          // console.log("Found " + pageLinks.length + " links on page");
          pageLinks.each(function() {
            let linkAttr = $(this).attr('href');
            let titleVal = $(this).text();

            if(typeof linkAttr != 'undefined') {
              if(scraper.externalURL(linkAttr)) {
                // console.log("external(json): " + linkAttr);
                if(scraper.numPagesVisited === 1) {
                  scraper.pushUrlData(linkAttr, titleVal, "external");
                }
              } else {
                // console.log(stripRelativePath(linkAttr));

                let childUrl = scraper.rootUrl + stripRelativePath(linkAttr);
                // console.log("value(json): " + linkAttr);
                if(scraper.numPagesVisited === 1) {
                  scraper.pushUrlData(childUrl, titleVal, "child");
                }
                //scraper.pushChildLink(childUrl);
              }
            }
          });
          callback(scraper, finishCallback);
        } catch(err) {
          console.log("body is: " + body);
          console.log("err is: " + err);
          callback(scraper, finishCallback);
        }
      });
    } catch(err) {
      console.log("body is: " + body);
      console.log("err is: " + err);
      callback(scraper, finishCallback);
    }
}

function stripRelativePath(linkAttr) {
  if(linkAttr.startsWith(".") === true) {
    return linkAttr.substr(1);
  } else {
    return linkAttr;
  }
}

function depthSearch() {
  console.log("in depthSearch function");
}
