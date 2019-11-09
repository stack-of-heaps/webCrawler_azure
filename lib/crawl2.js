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
            let allImages = getSiteImages($, searchURL);

            //console.log('allImages');
            console.log(allImages);

            //console.log('allLinks');
            //console.log(allLinks);

            // TODO: PARENT
            // TODO: CHILDREN
            // TODO: DEPTH
            //      ^   ^   ^ Manager that invokes the crawler should fill this in
            let fullNode = { 
                title: rootTitle,
                description: siteDescription,
                links: allLinks,
                images: allImages,
                parent: null,
                self: searchURL,
                children: [],
                depth: -1,
            }
        }

        done();
    }
});

c.queue('http://www.xkcd.com');
//c.queue('http://www.oregonstate.edu');

function getSiteImages($, searchURL) {

    let siteImages = $("img");
    let allImages = [];

    siteImages.each((i, elem) => {

        let imgURL = $(elem).attr('src');
        let parsedURL = new URL(imgURL);
        let imgText = $(elem).text();
        let imgAlt = $(elem).attr('alt');

        if (parsedURL.host === '') {
            parsedURL.host = searchURL.host;
            parsedURL.protocol = searchURL.protocol;
            parsedURL.slashes = searchURL.slashes;
            imgURL = parsedURL.toString();
        }

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

    if (extension[extension.length - 1] === '/') {
        extension = extension.substring(0, extension.length - 1); 
    }

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

    return URL_TYPE.LINK;
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

        let thisLink = {};
        
        let url = $(elem).attr('href');
        let text = $(elem).text();
        let urlDetails = new URL(url);

        thisLink.orientation = getLinkOrientation(searchURL.host, urlDetails.host);
        thisLink.type = getLinkType(url);
        thisLink.url = createFullURL(urlDetails, searchURL);
        thisLink.text = text;

        allLinks.push(thisLink);
    })
    return allLinks;
}

function createFullURL(childURL, searchURL) {

    if (childURL.host === '') {
        childURL.host = searchURL.host;
    }

    if (childURL.protocol === '') {
        childURL.protocol = searchURL.protocol;
        childURL.slashes = searchURL.slashes;
    }

    return childURL.toString();

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