const Crawler = require("crawler");
const { fork } = require('child_process');
const URL = require('url-parse');
const FileExtensions = require('./FileExtensions');
const { URL_TYPE, COMMERCE_STRINGS, SOCIAL_MEDIA_STRINGS } = require('./URLTypes');
const { FILE_TYPE } = require('./FileTypes');

const MAX_LINKS = 4;

process.on('message', (msg) => {
    let url = msg.url;
    this.crawl(url);
})

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

module.exports.crawl = (url) => {

    let c = new Crawler();
    c.direct({
        uri: url,
        callback: function (error, res) {
            if (error) {
                console.log('[CRAWLER] ERROR => ', error);
                let newNode = {
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
                deliver(newNode);
            }
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

                deliver(fullNode);
            }
        }
    })

    /*
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
    /*
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
*/
}

function deliver(data) {
    process.send(data);
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

//Internal or external
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
        console.log('external :', url.toString());

        return 'external';
    }

    let urlHost = exploded[indexOfExtension -1] + '.' + exploded[indexOfExtension];

    console.log(`URLHost ${urlHost} contains ${searchURLHost}?`);
    console.log('searchURLhost: ', searchURLHost);
    if (searchURLHost.includes(urlHost)) {
        console.log('YES');
        return 'internal';
    }

    console.log('NO');

    return 'external';
}

function getExtensionIndex(explodedURL) {
    let extensions = FileExtensions.LINK.extensions;
    console.log('explodedURL: ', explodedURL);

    for (let i = 0; i < extensions.length; i++) {
        console.log(`extensions[${i}]: ${extensions[i]}`);
        let extensionIndex = explodedURL.indexOf(extensions[i]);
        console.log('ExplodedURL: ', explodedURL);
        if (extensionIndex !== undefined) {
            console.log('RETURNING INDEX ', extensionIndex);
            return extensionIndex;
        }
    }
    return -1;
}

function getSiteLinks($, searchURL) {

    let siteLinks = $("a");
    let allLinks = [];
    siteLinks.each((i, elem) => {

        if (i === MAX_LINKS) {
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