var Crawler = require("crawler");
const { fork } = require('child_process');
const URL = require('url-parse');
const FileExtensions = require('./FileExtensions.js');
const { FILE_TYPE, URL_TYPE } = require('./FileEnums.js');
const SOCIAL_MEDIA_STRINGS = ['twitter', 'facebook', 'tumblr', 'instagram', 'instagr', 'fb.me', 'on.fb.me'];

process.on('message', (msg) => {
    let url = msg.url;
    this.crawl(url);
})

module.exports.crawl = (url) => {
    var fullNode = {};
    let c = new Crawler({
        maxConnections: 10,
        // This will be called for each crawled page
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
            }

            /*
            TODO: STATUS HANDLING
            if (res.status !== 200) {
                fullNode = {
                    depth: -1,
                    title: null,
                    description: null,
                    favicon: null,
                    type: null,
                    parent: null,
                    self: url,
                    status: res.status,
                    links: null, 
                    images: null,
                    children: null 
                }
            }
            */
            else {

                let $ = res.$;
                let searchURL = res.options.uri;
                let parsedSearchURL = new URL(searchURL);
                let allLinks = getSiteLinks($, parsedSearchURL);
                let rootTitle = getRootTitle($);
                let siteDescription = getSiteDescription($);
                let allImages = getSiteImages($, parsedSearchURL);
                let linkType = getLinkType(searchURL);
                let favicon = getFavicon(parsedSearchURL);

                fullNode = {
                    depth: -1,
                    title: rootTitle,
                    description: siteDescription,
                    favicon: favicon,
                    type: linkType,
                    parent: null,
                    self: searchURL,
                    links: allLinks,
                    images: allImages,
                    children: []
                }
            }

            done(deliver(fullNode));
        }
    });

    c.queue(url);
}

function deliver(data) {
    process.send(data);
}

module.exports.spawnCrawler = async () => {
    let crawler = fork('./lib/crawler.js');

    return crawler;
}

module.exports.invokeCrawler = async (crawler, url) => {

    return new Promise((resolve, reject) => {

        crawler.send({ url: url });
        crawler.on('message', result => {
            resolve(result);
        })
    })
}

function getSiteImages($, searchURL) {

    let siteImages = $("img");
    let allImages = [];

    siteImages.each((i, elem) => {

        let imageObject = {};

        let imgURL = $(elem).attr('src');
        let parsedURL = new URL(imgURL);
        let imgAlt = $(elem).attr('alt');
        let isLogo = false;


        if (parsedURL.host === '') {
            imgURL = copyURLDetails(parsedURL, searchURL);
        }

        imgURL = parsedURL.toString();

        if (imgAlt && imgAlt.includes('logo')) {
            isLogo = true;
        }

        imageObject.url = imgURL;
        imageObject.text = imgAlt;
        imageObject.isLogo = isLogo;

        allImages.push(imageObject)
    })
    return allImages;
}

function getLinkType(url) {

    if (!url || url === '') {
        return URL_TYPE.NONE;
    }

    if (!url.includes('.')) {
        return URL_TYPE.LINK;
    }

    let parsedURL = new URL(url);

    if (SOCIAL_MEDIA_STRINGS.some(entry => url.includes(entry))) {
        return URL_TYPE.SOCIAL_MEDIA;
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

        if (url && url.charAt(0) === '.') {
            url = stripRelativePath(url);
        }

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

function getFavicon(url) {

    if (url.host === '') {
        return null;
    }

    let favicon = createRootURL(url);

    if (favicon[favicon.length - 1] === '/') {
        favicon = favicon + 'favicon.ico';
    }

    else {
        favicon = favicon + '/favicon.ico';
    }

    return favicon;
}

function copyURLDetails(childURL, parentURL) {
    childURL.host = parentURL.host;
    childURL.slashes = parentURL.slashes;

    childURL.protocol = parentURL.protocol;

    return childURL;
}

function createRootURL(url) {

    let newURL = url.protocol;
    newURL += url.slashes ? '//' : null;
    newURL += url.host;
    return newURL;
}

function stripRelativePath(url) {
    return url.substring(1);
}