const { URL_TYPE } = require('./URLTypes');
const { FILE_TYPE } = require('./FileTypes');
const crawler = require('./crawler');
const _ = require('lodash');

module.exports.crawl = async (rootURL, searchDepth) => {

    let depth = 1;

    let newCrawler = await crawler.spawnCrawler();
    let rootResult = await crawler.invokeCrawler(newCrawler, rootURL);

    let rootNode = createNode(rootResult, rootURL, rootURL, depth);

    let pagesToVisit = getLinkURLs(rootResult.links);
    let pageQueue = getRandomLinks(pagesToVisit, []);
    let visitedPages = [rootURL];
    let parentQueue = [rootURL];

    while (depth < searchDepth) {

        depth++;

        if (pageQueue.length < 1) {
            console.warn('[DEPTH-SEARCH] => RAN OUT OF LINKS ! ENDING EARLY');
            break;
        }

        let parentName = parentQueue.pop();
        let thisLink = getRandomLink(pageQueue);
        visitedPages.push(thisLink);

        console.log("[DEPTH-SEARCH] =>  NOW CRAWLING: ", thisLink);

        let childResult = await crawler.invokeCrawler(newCrawler, thisLink);
        visitedPages.push(thisLink);

        let childNode = createNode(childResult, parentName, thisLink, depth);

        addChildToParentNode(childNode, parentName, rootNode);

        let childLinks = getLinkURLs(childResult.links);
        let nextLinks = getRandomLinks(childLinks, visitedPages);

        if (nextLinks) {
            pageQueue = nextLinks;
        }
        else {
            pageQueue = _.difference(pageQueue, visitedPages);
        }

        parentQueue.push(thisLink);
    }

    newCrawler.kill();
    return rootNode;
}

function addChildToParentNode(child, parentName, currentNode) {

    console.log(`[DEPTH-SEARCH] =>  [ADD] ${child.self} [TO] ${parentName} @ [DEPTH] ${child.depth} `);

    let childParent = child.parent;

    if (currentNode.self === childParent) {
        currentNode.children.push(child);
        return false;
    }

    if (currentNode.children.length === 0) {
        console.log('[DEPTH-SEARCH] => UNABLE TO FIND PARENT NODE');
        return false;
    }

    for (let node of currentNode.children) {
        //console.log('[DEPTH-SEARCH] => ITERATING THROUGH NODES: current: ', node.self);
        if (node.children && node.self === parentName) {
            node.children.push(child);
            //console.log('[DEPTH-SEARCH] => FOUND PARENT, RETURNING');
            return false;
        }
    }

    let seeking = true;
    while (seeking) {

        for (let node of currentNode.children) {
            if (node.children && node.children.length > 0) {
                seeking = addChildToParentNode(child, parentName, node);
            }
        }
        return false;
    }
    return false;
}

function validLinkType(link) {

    if (link.type === URL_TYPE.SCRIPT
        || link.type === URL_TYPE.MAIL
        || link.type === URL_TYPE.XML
        || link.type === URL_TYPE.UNKNOWN
        || link.type === URL_TYPE.NONE
        || link.type === URL_TYPE.SITE_RESOURCE
        || link.type === FILE_TYPE.SITE_RESOURCE
        || link.status === 400) {
        return false;
    }
    else {
        return true;
    }
}

function getLinkURLs(linkArray) {

    if (!linkArray || linkArray.length === 0) {
        return;
    }

    let justURLs = linkArray.filter(link => validLinkType(link)).map(link => link.url);

    return justURLs;
}

function getRandomLinks(linkArray, visitedLinks) {

    if (!linkArray || linkArray.length < 1) {
        return;
    }

    let returnArray = [];
    let numLinks = linkArray.length;

    for (let i = 0; i < numLinks || i < 5; i++) {
        newLink = getRandomLink(linkArray);

        if (newLink === undefined) {
            break;

        }
        returnArray.push(newLink);
        linkArray = _.difference(linkArray, returnArray);
        _.pull(linkArray, newLink);
    }

    returnArray = _.difference(returnArray, visitedLinks);

    //console.log('ReturnArray: ', returnArray);

    return returnArray;
}

function getRandomLink(linkArray) {
    let randomIndex = Math.floor(Math.random() * linkArray.length);

    let randomLink = linkArray[randomIndex];

    return randomLink;
}

function createNode(crawlerResult, parent, url, depth) {

    //console.log(`***   NEW NODE FOR DEPTH[${depth}]: PARENT: ${parent} SELF: ${url}`);
    let newNode = crawlerResult;
    newNode.depth = depth;
    newNode.parent = parent;
    newNode.self = url;

    return newNode;
}