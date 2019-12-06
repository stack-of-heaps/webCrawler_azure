const Crawler = require("crawler");
const { fork } = require('child_process');
const URL = require('url-parse');
const FileExtensions = require('./FileExtensions');
const { URL_TYPE, COMMERCE_STRINGS, SOCIAL_MEDIA_STRINGS } = require('./URLTypes');
const { FILE_TYPE } = require('./FileTypes');
const urlChecker = require('valid-url');

//const MAX_LINKS = 10;

process.on('message', (msg) => {
    let url = msg.url;
    let maxLinks = msg.maxLinks;
    this.crawl(url, maxLinks);
})

module.exports.spawnCrawler = async () => {
    let crawler = fork('./lib/crawler.js');

    return crawler;
}

module.exports.invokeCrawler = async (crawler, url, maxLinks) => {

    return new Promise((resolve, reject) => {
        crawler.send({ url: url, maxLinks: maxLinks });
        crawler.on('message', result => {
            resolve(result);
        })
    })
}

module.exports.crawl = (url, maxLinks) => {

    const MAX_LINKS = maxLinks;
    let c = new Crawler();
    c.direct({
        uri: url,
        timeout: 3400,
        callback: function (error, res) {
            fullNode = {};
            if (error || res.statusCode !== 200) {

                if (error) {
                    console.log('[CRAWLER] ERROR => ', error);
                }

                if (res.statusCode != 200) {
                    console.log(`${url} produced 400 status`);
                }

                fullNode = returnBadNode(url);
                deliver(fullNode);
            } else {
                try {
                    let $ = res.$;
                    let searchURL = res.options.uri;
                    let parsedSearchURL = new URL(searchURL);
                    let allLinks = getSiteLinks($, parsedSearchURL, MAX_LINKS);
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
                catch (e) {
                    fullNode = returnBadNode(url);
                }

                deliver(fullNode);
            }
        }
    })
}

function returnBadNode(url) {
    return {
        depth: -1,
        title: null,
        description: null,
        favicon: null,
        type: null,
        parent: null,
        self: url,
        status: 400,
        links: null,
        images: null,
        children: null
    }
}

function deliver(data) {
    process.send(data);
}

function getSiteImages($, searchURL) {

    let siteImages = $("img");
    let allImages = [];
    let visitedURLs = [];

    siteImages.each((i, elem) => {

        let imageObject = {};

        let imgURL = $(elem).attr('src');
        if (visitedURLs.includes(imgURL)) {
            return false;
        }
        visitedURLs.push(imgURL);
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

    if (!url
        || url === ''
        || url === '/'
        || url === '#') {
        return URL_TYPE.NONE;
    }

    if (url.includes('javascript:')) {
        return URL_TYPE.SCRIPT;
    }

    if (url.includes('xml')) {
        return URL_TYPE.XML;
    }

    if (url.includes('@')) {
        return URL_TYPE.MAIL;
    }

    if (url.includes('mailto')) {
        return URL_TYPE.MAIL;
    }

    if (COMMERCE_STRINGS.some(entry => url.includes(entry))) {
        return URL_TYPE.COMMERCE;
    }

    if (SOCIAL_MEDIA_STRINGS.some(entry => url.includes(entry))) {
        return URL_TYPE.SOCIAL_MEDIA;
    }

    if (!url.includes('.')) {
        return URL_TYPE.LINK;
    }

    let extension = url.split('.').pop();

    if (extension[extension.length - 1] === '/') {
        extension = extension.substring(0, extension.length - 1);
    }

    let tempType = parseExtension(extension);

    if (tempType === URL_TYPE.UNKNOWN || tempType === URL_TYPE.NONE) {
        return URL_TYPE.LINK;
    }

    else {
        return tempType;
    }
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

    return URL_TYPE.UNKNOWN;
}

function getLinkOrientation(searchURL, url) {

    let linkHost = url.host;
    let searchURLHost = searchURL.host;

    if (linkHost === '') {
        return 'internal';
    }

    if (searchURLHost === linkHost) {
        return 'internal';
    }

    let exploded = linkHost.split('.');
    let indexOfExtension = getExtensionIndex(exploded);
    if (indexOfExtension === -1) {
        return 'external';
    }

    let urlHost = exploded[indexOfExtension - 1] + '.' + exploded[indexOfExtension];

    if (searchURLHost.includes(urlHost)) {
        return 'internal';
    }

    return 'external';
}

function getExtensionIndex(explodedURL) {
    let extensions = FileExtensions.LINK.extensions;

    for (let i = 0; i < extensions.length; i++) {
        let extensionIndex = explodedURL.indexOf(extensions[i]);
        if (extensionIndex !== undefined) {
            return extensionIndex;
        }
    }
    return -1;
}

function getSiteLinks($, searchURL, MAX_LINKS) {

    let siteLinks = $("a");
    let allLinks = [];

    siteLinks.each((i, elem) => {

        if (i >= MAX_LINKS) {
            return false;
        }

        let thisLink = {};

        let url = $(elem).attr('href');
        let text = $(elem).text();

        if (url && url.charAt(0) === '.') {
            url = stripRelativePath(url);
        }

        let urlDetails = new URL(url);

        thisLink.orientation = getLinkOrientation(searchURL, urlDetails);
        thisLink.type = getLinkType(url);
        thisLink.url = createFullURL(urlDetails, searchURL);
        thisLink.text = text;

        allLinks.push(thisLink);
    })
    return allLinks;
}

function createFullURL(childURL, searchURL) {

    if (childURL.host === '') {
        copyURLDetails(childURL, searchURL);
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

    let description = '';
    allMetaTags.forEach(tag => {
        if (tag.name === 'description') {
            description = tag.content;
        }
    })

    return description;
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

module.exports.validLinkType = (link) => {

    if (urlChecker.isWebUri(link.url) === undefined) {
        return false;
    }

    let fileTypes = Object.values(FILE_TYPE);

    if (link.type === URL_TYPE.SCRIPT
        || link.type === URL_TYPE.MAIL
        || link.type === URL_TYPE.XML
        || link.type === URL_TYPE.UNKNOWN
        || link.type === URL_TYPE.NONE
        || link.type === URL_TYPE.SITE_RESOURCE
        || link.type === FILE_TYPE.SITE_RESOURCE
        || fileTypes.includes(link.type)
        || link.orientation === 'external'
        || link.status === 400) {
        return false;
    }
    else {
        return true;
    }
}

module.exports.addBothHTTPProtocolVersions = (link, visitedPages) => {

    let linkFirstFive = link.substring(0, 5);

    if (linkFirstFive.includes("http") && !linkFirstFive.includes("https")) {
        let httpStart = link.indexOf("http");
        let firstSegment = link.substring(0, httpStart + "http".length);
        let secondSegment = link.substring(firstSegment.length);
        let newLink = firstSegment + 's' + secondSegment;
        visitedPages.push(newLink);
        //console.log('adding HTTPS: ', newLink);
    }
    else if (linkFirstFive.includes("https")) {
        let httpStart = link.indexOf("https");
        let firstSegment = link.substring(0, httpStart + "https".length - 1);
        let secondSegment = link.substring(firstSegment.length + 1);
        let newLink = firstSegment + secondSegment;
        visitedPages.push(newLink);
        //console.log('adding HTTP: ', newLink);
    }
    return visitedPages;
}

module.exports.filterLinks = (node, visitedPages) => {

    let newLinkArray = node.links.filter(link => !visitedPages.includes(link.url));
    let filteredLinkArray = newLinkArray.filter(link => this.validLinkType(link));
    node.links = filteredLinkArray;

    return node;
}
