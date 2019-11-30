const { URL_TYPE } = require('./URLTypes');
const { FILE_TYPE } = require('./FileTypes');
const crawler = require('./crawler');
const _ = require('lodash');


module.exports.crawl = async (rootURL, searchDepth) => {

    let depth = 1;
    let newCrawler = await crawler.spawnCrawler();
    let rootResult = await crawler.invokeCrawler(newCrawler, rootURL);
    let rootNode = createNode(rootResult, rootURL, rootURL, depth);
    let visitedPages = [];
    visitedPages = addBothHTTPProtocolVersions(rootURL, visitedPages);

    rootNode = crawler.filterLinks(rootNode, visitedPages);
    rootNode = await getAllNodeChildren(rootNode, newCrawler, depth, visitedPages);

    for (let i = 0; i < rootNode.children.length; i++) {
        rootNode.children[i] = await breadthSearch(rootNode.children[i], depth + 1, searchDepth, newCrawler, visitedPages);
    }

    newCrawler.kill();

    return rootNode;
}

async function breadthSearch(node, depth, searchDepth, nodeCrawler, visitedPages) {

    if (node.depth === -99 || !node.children) {
        return node;
    }

    if (depth > searchDepth) {
        if (node.depth === searchDepth) {
            node.links.forEach(link => node.children.push(link));
        }
        return node;
    }

    node = await getAllNodeChildren(node, nodeCrawler, depth, visitedPages);

    for (let i = 0; i < node.children.length; i++) {
        visitedPages = addBothHTTPProtocolVersions(node.children[i].self, visitedPages);
    }

    //while (depth <= searchDepth) {
    for (let i = 0; i < node.children.length; i++) {
        console.log(`[BREADTHSEARCH]: url[${node.self}] -- depth[${depth}])`);
        node.children[i] = await breadthSearch(node.children[i], depth + 1, searchDepth, nodeCrawler, visitedPages);
    }
    //}
    return node;
}

async function getAllNodeChildren(rootNode, nodeCrawler, depth, visitedPages) {
    //console.log('NODE LINKS: ', rootNode.links.length);
    if (!rootNode.links) {
        return rootNode;
    }

    //let childLinkObjs = rootNode.links.filter(link => crawler.validLinkType(link));
    //rootNode = crawler.filterLinks(rootNode, visitedPages);
    let childLinks = rootNode.links.map(link => link.url);

    if (childLinks.length === 0) {
        console.log(`[BREADTHSEARCH]: NO VALID CHILDLINKS FOR ${rootNode.self} Depth[${depth}]`);
        return rootNode;
    }

    //console.log('======> visitedLinks: ', visitedPages);
    //console.log('[BREADTHSEARCH]: childlinks: ', childLinks);
    //let unvisitedLinks = childLinks.filter(link => !visitedPages.includes(link));

    console.log('[BREADTHSEARCH]: linksToVisit: ', childLinks);

    for (let i = 0; i < childLinks.length; i++) {
        let link = childLinks[i];
        let newNode = await crawler.invokeCrawler(nodeCrawler, link);
        let childNode = createNode(newNode, rootNode.self, link, depth);
        //console.log('childnode: ', childNode);
        rootNode.children.push(childNode);
    }
    return rootNode;
}

function addBothHTTPProtocolVersions(link, visitedPages) {

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
    
    return visitedPages;
}

function createNode(crawlerResult, parent, url, depth) {

    //console.log(`***   NEW NODE FOR DEPTH[${depth}]: PARENT: ${parent} SELF: ${url}`);
    let newNode = crawlerResult;
    newNode.depth = depth;
    newNode.parent = parent;
    newNode.self = url;

    return newNode;
}
