var Crawler = require("crawler");

var c = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            let $ = res.$;

            let allLinks = getPageLinks($);
            let rootTitle = getRootTitle($);
            let siteDescription = getSiteDescription($);

        }
        done();
    }
});

// Queue just one URL, with default callback
c.queue('http://www.arstechnica.com');


function getPageLinks($) {

    var pageLinks = $("a");
    const allLinks = [];
    pageLinks.each((i, elem) => {
        let url = $(elem).attr('href');
        let text = $(elem).text();
        allLinks.push({
            url: url,
            text: text
        })
    })
    return allLinks;
}

function getSiteDescription($) {

    let allMetaTags = [];
            $('meta').each(function() {
                allMetaTags.push($(this).attr())
            })

            let x = '';
            allMetaTags.forEach(tag => {
                if (tag.name === 'description') {
                    x = tag.content;
                }
            })

            return x;

}
function getRootTitle($) {
    return $('title').text();
}

function chooseRandomLink(linkArray) {
    let randomElement = Math.floor(Math.random() * linkArray.length);
    return linkArray[randomElement].url;
}