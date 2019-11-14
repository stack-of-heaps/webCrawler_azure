const { URL_TYPE } = require('./URLTypes');
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

    while (depth < searchDepth) {
        
        depth++;

        if (pageQueue.length < 1) {
            console.warn('RAN OUT OF LINKS ! ENDING EARLY');
            break;
        }

        let parentName = parentQueue.pop();
        let thisLink = pageQueue.pop();
        
        console.log(" /// NOW CRAWLING: ", thisLink);

        let childResult = await crawler.invokeCrawler(newCrawler, thisLink);
        visitedPages.push(thisLink);

        let childNode = createNode(childResult, parentName, thisLink, depth);
        addChildToParentNode(childNode, parentName, rootNode);

        let childLinks = getLinkURLs(childResult.links);
        let nextLink = getRandomLink(childLinks, visitedPages);

        pageQueue.push(nextLink);
        parentQueue.push(thisLink);
    }

    newCrawler.kill();
    return rootNode;
}

function addChildToParentNode(child, parentName, currentNode) {

    console.log(` /// DEPTH: ${child.depth} --- ADD ${child.self} TO ${parentName}`);

    let childParent = child.parent;

    if (currentNode.self === childParent) {
        currentNode.children.push(child);
        return false;
    }

    if (currentNode.children.length === 0) {
        console.log('UNABLE TO FIND PARENT NODE');
        return false;
    }

    for (let node of currentNode.children) {
        //console.log('ITERATING THROUGH NODES: current: ', node.self);
        if (node.self === parentName) {
            node.children.push(child);
            //console.log('FOUND PARENT, RETURNING');
            return false;
        }
    }

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

    if (link.type === URL_TYPE.SCRIPT
        || link.type === URL_TYPE.MAIL
        || link.type === URL_TYPE.XML
        || link.type === URL_TYPE.UNKNOWN
        || link.type === URL_TYPE.NONE
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

function getRandomLink(linkArray, visitedLinks) {

    if (!linkArray || linkArray.length < 1) {
        return;
    }

    let randomIndex = Math.floor(Math.random() * linkArray.length);

    console.log(`/// Rand Link = linkArray[${randomIndex} / ${linkArray.length}] = ${linkArray[randomIndex]}`);

    let randomLink = linkArray[randomIndex];
    if (visitedLinks.includes(randomLink)) {
        linkArray = linkArray.filter(x => x !== randomLink);
        return getRandomLink(linkArray, visitedLinks);
    }
    else {
        return randomLink;
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