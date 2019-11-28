const { URL_TYPE } = require('./URLTypes');
const { FILE_TYPE } = require('./FileTypes');
const crawler = require('./crawler');
const _ = require('lodash');

let visitedPages = [];

module.exports.crawl = async (rootURL, searchDepth) => {

    let depth = 1;
    let newCrawler = await crawler.spawnCrawler();
    let rootResult = await crawler.invokeCrawler(newCrawler, rootURL);
    let rootNode = createNode(rootResult, rootURL, rootURL, depth);
    //let pagesToVisit = getLinkURLs(rootResult.links.filter(link => link.orientation != external));
    addBothHTTPProtocolVersions(rootURL);

    depth++;
    rootNode = await getAllNodeChildren(rootNode, newCrawler, depth);

    for (let i = 0; i < rootNode.children.length; i++) {
        rootNode.children[i] = await breadthSearch(rootNode.children[i], depth, searchDepth, newCrawler);
    }

    newCrawler.kill();

    return rootNode;
}

async function breadthSearch(node, depth, searchDepth, nodeCrawler) {

    if (depth > searchDepth) {
        if (node.depth === searchDepth) {
            node.links.forEach(link => node.children.push(link));
            //console.log('MODIFIED NODE: ', node);
        }
        return node;
    }

    node = await getAllNodeChildren(node, nodeCrawler, depth);

    while (depth <= searchDepth) {
        depth++;
        for (let i = 0; i < node.children.length; i++) {
            node.children[i] = await breadthSearch(node.children[i], depth, searchDepth, nodeCrawler);
        }
    }
    return node;
}

async function getAllNodeChildren(rootNode, nodeCrawler, depth) {
    let childLinkObjs = rootNode.links.filter(link => crawler.validLinkType(link));
    let childLinks = childLinkObjs.map(link => link.url);

    console.log('======> visitedLinks: ', visitedPages);
    console.log('======> childlinks: ', childLinks);
    let unvisitedLinks = childLinks.filter(link => !visitedPages.includes(link));

    console.log('======> unvistedlinks: ', unvisitedLinks);

    if (unvisitedLinks.length === 0) {
        return rootNode;
    }

    for (let i = 0; i < unvisitedLinks.length; i++) {
        let link = unvisitedLinks[i];
        let newNode = await crawler.invokeCrawler(nodeCrawler, link);
        addBothHTTPProtocolVersions(link);
        let childNode = createNode(newNode, rootNode.self, link, depth);
        //console.log('childnode: ', childNode);
        rootNode.children.push(childNode);
    }
    return rootNode;
}

function addBothHTTPProtocolVersions(link) {

    visitedPages.push(link);

    let linkFirstFive = link.substring(0, 5);

    if (linkFirstFive.includes("http") && !linkFirstFive.includes("https")) {
        let httpStart = link.indexOf("http");
        let firstSegment = link.substring(0, "http".length);
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
}

function createNode(crawlerResult, parent, url, depth) {

    //console.log(`***   NEW NODE FOR DEPTH[${depth}]: PARENT: ${parent} SELF: ${url}`);
    let newNode = crawlerResult;
    newNode.depth = depth;
    newNode.parent = parent;
    newNode.self = url;

    return newNode;
}
