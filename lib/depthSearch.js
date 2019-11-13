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
            console.log('RAN OUT OF LINKS ! ENDING EARLY');
            break;
        }

        let thisParent = parentQueue.pop();
        let thisLink = pageQueue.pop();

        let childResult = await crawler.invokeCrawler(newCrawler, thisLink);
        visitedPages.push(thisLink);

        let childNode = createNode(childResult, thisParent, thisLink, depth);
        rootNode.children.push(childNode);
        //addChildToParentNode(childNode, thisParent, rootNode);

        let childLinks = getLinkURLs(childResult.links);
        let nextLink = getRandomLink(childLinks, visitedPages);
        console.log(nextLink);

        pageQueue.push(nextLink);
        parentQueue.push(nextLink);
    }

    newCrawler.kill();
    return rootNode;
}

function addChildToParentNode(child, parentName, root) {

    let currentNode = root.self;
    let childParent = child.parent;

    if (currentNode.self === childParent) {
        currentNode.children.push(child);
        return;
    }

    if (currentNode.children.length === 0) {
        return;
    }

    console.log('LOOKING FOR PARENT');

    for (let node of currentNode.children) {
        if (node.self === parentName) {
            node.children.push(child);
            console.log('FOUND PARENT, RETURNING');
            return;
        }
    }

    console.log('ENTERING FIND PARENT');
    for (let node of currentNode.children) {
        if (node.children.length > 0) {
            addChildToParentNode(child, parentName, node);
        }
    }

    return;
}

function validLinkType(link) {

    switch(link) {
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
        console.log('REDUCED link array: ', linkArray.length);
        return getRandomLink(linkArray, visitedLinks);
    }
    else {
        console.log('returning linkArray')
        console.log('linkArray: ', linkArray);
        console.log(`linkArray[${randomIndex}]: ${linkArray[randomIndex]}`);
        console.log('array length: ', linkArray.length);
        return randomLink;
    }
}

function createNode(crawlerResult, parent, url, depth) {

    let newNode = crawlerResult;
    newNode.depth = depth;
    newNode.parent = parent;
    newNode.self = url;

    return newNode;
}