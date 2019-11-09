var Crawler = require("crawler");
const URL = require('url-parse');
const FileExtensions = require('./FileExtensions.js');
const { FILE_TYPE, URL_TYPE } = require('./FileEnums.js');

var c = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            let $ = res.$;
            let searchURL = new URL(res.options.uri);

            let allLinks = getSiteLinks($, searchURL);
            let rootTitle = getRootTitle($);
            let siteDescription = getSiteDescription($);
            let allImages = getSiteImages($);

            //console.log('allImages');
            //console.log(allImages);

            //console.log('allLinks');
            console.log(allLinks);

        }

        done();
    }
});

// Queue just one URL, with default callback
c.queue('http://www.xkcd.com');
//c.queue('http://www.oregonstate.edu');

function getSiteImages($) {

    let siteImages = $("img");
    let allImages = [];

    siteImages.each((i, elem) => {
        let imgURL = $(elem).attr('src');
        let imgText = $(elem).text();
        let imgAlt = $(elem).attr('alt');

        allImages.push({
            imgURL: imgURL,
            imgText: imgText,
            imgAlt: imgAlt
        })
    })
    return allImages;
}

function getLinkType(url) {

    if (url === '') {
        return URL_TYPE.NONE;
    }

    if (!url.includes('.')) {
        return URL_TYPE.LINK;
    }

    let extension = url.split('.').pop();

    return parseExtension(extension);

}

function parseExtension(extension) {

    if (FileExtensions.LINK.extensions.includes(extension)) {
        return FILE_TYPE.LINK;
    }

    for (let fileType of FileExtensions.ALL_TYPES) {
        if (fileType.extensions.includes(extension)) {
            return fileType.label;
        }
    }

    return FILE_TYPE.LINK;
}

//Internal or external
function getLinkOrientation(searchURLHost, linkHost) {
    if (linkHost === '') {
        return 'internal';
    }

    if (searchURLHost === linkHost) {
        return 'internal';
    }

    else {
        return 'external';
    }
}

function getSiteLinks($, searchURL) {

    let siteLinks = $("a");
    let externalLinks = [];
    let internalLinks = [];
    let allLinks = [];
    siteLinks.each((i, elem) => {

        let newLink = {};
        let url = $(elem).attr('href');
        let text = $(elem).text();
        let urlDetails = new URL(url);

        if (urlDetails.host === '') {
            urlDetails.host = searchURL.host;
        }

        newLink.orientation = getLinkOrientation(searchURL.host, urlDetails.host);
        newLink.type = getLinkType(url)
        newLink.url = url;
        newLink.text = text;

        allLinks.push(newLink);
    })
    return allLinks;
}

function getSiteDescription($) {

    let allMetaTags = [];
    $('meta').each(function () {
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