const { URL_TYPE } = require('./URLTypes');
const { FILE_TYPE } = require('./FileTypes');
const crawler = require('./crawler');
const _ = require('lodash');

module.exports.crawl = async (rootURL, searchDepth) => {

    let depth = 1;
    let newCrawler = await crawler.spawnCrawler();
    let rootResult = await crawler.invokeCrawler(newCrawler, rootURL);
    let rootNode = createNode(rootResult, rootURL, rootURL, depth);
    //let pagesToVisit = getLinkURLs(rootResult.links.filter(link => link.orientation != external));
    let visitedPages = [rootURL];
    rootNode = await getAllNodeChildren(rootNode, newCrawler, depth, visitedPages);

    depth++;
    for (let i = 0; i < rootNode.children.length; i++) {
        rootNode.children[i] = await breadthSearch(rootNode.children[i], depth, searchDepth, visitedPages, newCrawler);
    }

    newCrawler.kill();

    return rootNode;
}

async function breadthSearch(node, depth, searchDepth, visitedPages, nodeCrawler) {

    if (depth > searchDepth) {
        if (node.depth === searchDepth) {
            node.links.forEach(link => node.children.push(link));
            //console.log('MODIFIED NODE: ', node);
        }

        return node;
    }

    node = await getAllNodeChildren(node, nodeCrawler, depth, visitedPages);

    while (depth <= searchDepth) {
        depth++;
        for (let i = 0; i < node.children.length; i++) {
            node.children[i] = await breadthSearch(node.children[i], depth, searchDepth, visitedPages, nodeCrawler);
        }
    }
    return node;
}

async function getAllNodeChildren(rootNode, nodeCrawler, depth, visitedPages) {
    let childLinkObjs = rootNode.links.filter(link => validLinkType(link));
    let childLinks = childLinkObjs.map(link => link.url);

    //console.log('======> childlinks: ', childLinks);
    let unvisitedLinks = childLinks.filter(link => !visitedPages.includes(link));

    //console.log('======> unvistedlinks: ', unvisitedLinks);

    if (unvisitedLinks.length === 0) {
        return rootNode;
    }

    for (let i = 0; i < unvisitedLinks.length; i++) {
        let link = unvisitedLinks[i];
        let newNode = await crawler.invokeCrawler(nodeCrawler, link);
        visitedPages.push(link);
        addBothHTTPProtocolVersions(link, visitedPages);
        let childNode = createNode(newNode, rootNode.self, link, depth);
        //console.log('childnode: ', childNode);
        rootNode.children.push(childNode);
    }
    return rootNode;
}

function addBothHTTPProtocolVersions(link, visitedPages) {

    let linkFirstFive = link.substring(0, 5);

    if (linkFirstFive.includes("http") && !linkFirstFive.includes("https")) {
        let httpStart = link.indexOf("http");
        let firstSegment = link.substring(httpStart + "http".length);
        let secondSegment = link.substring(firstSegment.length);
        let newLink = firstSegment + 's' + secondSegment;
        //console.log('adding HTTPS: ', newLink);
        visitedPages.push(newLink);
    }
    else if (linkFirstFive.includes("https")) {
        let httpStart = link.indexOf("https");
        let firstSegment = link.substring(0, httpStart + "https".length - 1);
        let secondSegment = link.substring(firstSegment.length + 1);
        let newLink = firstSegment + secondSegment;
        visitedPages.push(newLink);
        //console.log('adding HTTP: ', newLink);
    }
}

function validLinkType(link) {
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

function createNode(crawlerResult, parent, url, depth) {

    //console.log(`***   NEW NODE FOR DEPTH[${depth}]: PARENT: ${parent} SELF: ${url}`);
    let newNode = crawlerResult;
    newNode.depth = depth;
    newNode.parent = parent;
    newNode.self = url;

    return newNode;
}