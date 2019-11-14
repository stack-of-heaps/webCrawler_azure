const { URL_TYPE } = require('./FileEnums');
const crawler = require('./crawler');
const _ = require('lodash');

module.exports.crawl = async (rootURL, searchDepth) => {

    let depth = 1;

    let newCrawler = await crawler.spawnCrawler();
    let rootResult = await crawler.invokeCrawler(newCrawler, rootURL);

    let rootNode = createNode(rootResult, rootURL, rootURL, depth);

    let pagesToVisit = getLinkURLs(rootResult.links);
    let randomLink = getRandomLink(pagesToVisit, []);

    let visitedPages = [rootURL];
    let pageQueue = [randomLink];
    let parentQueue = [rootURL];

    // TODO: PREVENT VISITING LINKS TWICE
    while (depth < searchDepth) {
        depth++;

        if (pageQueue.length < 1) {
            console.warn('RAN OUT OF LINKS ! ENDING EARLY');
            break;
        }

        let parentName = parentQueue.pop();
        let thisLink = pageQueue.pop();

        let childResult = await crawler.invokeCrawler(newCrawler, thisLink);
        visitedPages.push(thisLink);

        let childNode = createNode(childResult, parentName, thisLink, depth);
        //rootNode.children.push(childNode);
        addChildToParentNode(childNode, parentName, rootNode);

        let childLinks = getLinkURLs(childResult.links);
        let nextLink = getRandomLink(childLinks, visitedPages);
        console.log("NEXT LINK: " + nextLink);

        pageQueue.push(nextLink);
        parentQueue.push(thisLink);
    }

    newCrawler.kill();
    return rootNode;
}

function addChildToParentNode(child, parentName, currentNode) {

    console.log('parentName: ' + parentName);
    console.log("PARENT NAME: ", parentName);
    console.log("CHILD NAME: ", child.self);

    let childParent = child.parent;

    if (currentNode.self === childParent) {
        currentNode.children.push(child);
        return false;
    }

    if (currentNode.children.length === 0) {
        console.log('UNABLE TO FIND PARENT NODE');
        return false;
    }

    console.log('LOOKING FOR PARENT');

    for (let node of currentNode.children) {
        console.log('ITERATING THROUGH NODES: current: ', node.self);
        if (node.self === parentName) {
            node.children.push(child);
            console.log('FOUND PARENT, RETURNING');
            return false;
        }
    }

    console.log('ENTERING FIND PARENT');

    let seeking = true;
    while (seeking) {

        for (let node of currentNode.children) {
            if (node.children.length > 0) {
                seeking = addChildToParentNode(child, parentName, node);
            }
        }

        return false;
    }

    return false;
}

function validLinkType(link) {

    switch (link) {
        case (link.type === URL_TYPE.SCRIPT):
        case (link.type === URL_TYPE.MAIL):
        case (link.type === URL_TYPE.XML):
        case (link.type === URL_TYPE.UNKNOWN):
        case (link.type === URL_TYPE.NONE):
        case (link.status === 400):
            console.log('REJECTING INVALID LINK: ', link);
            return false;
        default:
            return true;
    }
}

function getLinkURLs(linkArray) {
    //let justURLs = linkArray.(link => validLinkType(link)); 
    let justURLs = linkArray.map(link => {
        if (validLinkType(link)) {
            return link.url;
        }
    })

    return justURLs;
}

function getRandomLink(linkArray, visitedLinks) {
    if (!linkArray.length > 0) {
        return;
    }

    console.log('incoming link array, length: ', linkArray.length);
    let randomIndex = Math.floor(Math.random() * linkArray.length);
    let randomLink = linkArray[randomIndex];
    if (visitedLinks.includes(randomLink)) {
        console.log('found redundant link');
        linkArray = linkArray.filter(x => x !== randomLink);
        return getRandomLink(linkArray, visitedLinks);
    }
    else {
        return randomLink;
    }
}

function createNode(crawlerResult, parent, url, depth) {

    console.log(`***   NEW NODE FOR DEPTH[${depth}]: PARENT: ${parent} SELF: ${url}`);

    let newNode = crawlerResult;
    newNode.depth = depth;
    newNode.parent = parent;
    newNode.self = url;

    return newNode;
}