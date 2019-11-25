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

    /*
    while (depth < searchDepth) {

        if (pagesToVisit.length < 1) {
            console.warn('[DEPTH-SEARCH] => RAN OUT OF LINKS ! ENDING EARLY');
            break;
        }
    }

    */
    newCrawler.kill();
    return rootNode;
}

async function getAllNodeChildren(rootNode, nodeCrawler, depth, visitedPages) {
    let childLinks = rootNode.links.filter(link => link.orientation !== 'external');
    let unvisitedLinks = _.without(childLinks, visitedPages);

    let linksToCrawl = unvisitedLinks.map(link => link.url);
    console.log('linkstocrawl: ', linksToCrawl);

    for (let i = 0; i < linksToCrawl.length; i++) {
        let link = linksToCrawl[i];
        let newNode = await crawler.invokeCrawler(nodeCrawler, link);
        visitedPages.push(link);
        let childNode = createNode(newNode, rootNode.self, link, depth);
        console.log('childnode: ', childNode);
        rootNode.children.push(childNode);
    }

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
        || link.orientation === 'external'
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

/*
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
*/
/*
function getRandomLink(linkArray) {
    let randomIndex = Math.floor(Math.random() * linkArray.length);

    let randomLink = linkArray[randomIndex];

    return randomLink;
}
*/

function createNode(crawlerResult, parent, url, depth) {

    //console.log(`***   NEW NODE FOR DEPTH[${depth}]: PARENT: ${parent} SELF: ${url}`);
    let newNode = crawlerResult;
    newNode.depth = depth;
    newNode.parent = parent;
    newNode.self = url;

    return newNode;
}