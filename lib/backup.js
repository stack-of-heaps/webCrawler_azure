
const { URL_TYPE } = require('./URLTypes');
const crawler = require('./crawler');
const _ = require('lodash');
const CHECKURL = "/checkURL";
const axios = require('axios');
const http = require('http');
const nUrl = require('url');

module.exports.crawl = async (rootURL, searchDepth) => {

    let depth = 1;

    let newCrawler = await crawler.spawnCrawler();
    let rootResult = await crawler.invokeCrawler(newCrawler, rootURL);
    
    if (rootResult.type === null) {
        rootResult = await crawler.invokeCrawyler(newCrawler, 'http://www.penny-arcade.com');
    }

    let rootNode = createNode(rootResult, rootURL, rootURL, depth);

    let pagesToVisit = getLinkURLs(rootResult.links);
    let randomLink = await getRandomLink(pagesToVisit, []);

    let visitedPages = [rootURL];
    let pageQueue = [randomLink];
    let parentQueue = [rootURL];

    while (depth < searchDepth) {

        depth++;

        if (pageQueue.length < 1) {
            console.warn('[DEPTH-CRAWLER] RAN OUT OF LINKS ! ENDING EARLY');
            break;
        }

        let parentName = parentQueue.pop();
        let thisLink = pageQueue.pop();

        console.log("[DEPTH-CRAWLER] NOW CRAWLING: ", thisLink);

        let childResult = await crawler.invokeCrawler(newCrawler, thisLink);
        visitedPages.push(thisLink);

        if (childResult.type === null) {
            childResult = await crawler.invokeCrawler(newCrawler, 'http://www.penny-arcade.com');
        }

        let childNode = createNode(childResult, parentName, thisLink, depth);

        addChildToParentNode(childNode, parentName, rootNode);

        let childLinks = getLinkURLs(childResult.links);
        let nextLink = await getRandomLink(childLinks, visitedPages);

        if (nextLink === null) {
            nextLink = thisLink;
        }

        pageQueue.push(nextLink);
        parentQueue.push(thisLink);
    }

    newCrawler.kill();
    return rootNode;
}

function addChildToParentNode(child, parentName, currentNode) {

    console.log(`[DEPTH-CRAWLER] DEPTH: ${child.depth} --- ADD ${child.self} TO ${parentName}`);

    let childParent = child.parent;

    if (currentNode.self === childParent) {
        currentNode.children.push(child);
        return false;
    }

    if (currentNode.children.length === 0) {
        console.log('***UNABLE TO FIND PARENT NODE');
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

async function getRandomLink(linkArray, visitedLinks) {

    if (!linkArray || linkArray.length < 1) {
        console.log('*NO LINKARRAY ENDING RETURNING NOTHING*')
        return;
    }

    let unvisitedLinks = _.difference(linkArray, visitedLinks);

    if (unvisitedLinks.length === 0) {
        return linkArray[0];
    }

    let randomIndex = getRandomIndex(unvisitedLinks.length);
    let randomLink = await testAndReturnRandomLink(unvisitedLinks, randomIndex);

    if (randomLink === null) {
        console.log('RANDOM LINK was null, calling GETFIRSTVALIDLINK');
        return getFirstValidLink(linkArray);
    }
    else {
        console.log('///RETURNING randomLink:, randomLink');
        return randomLink;
    }
}

async function getFirstValidLink(linkArray) {
    console.log('IN GET FIRST VALID LINK');
    for (let i = 0; i < linkArray.length; i++) {
        let link = linkArray[i];
        let response = await checkURLStatus(link);

        if (response === true) {
            return link;
        }
    }
    return null;
}

function statusIsOkay(statusCode) {
    return statusCode >= 200 || statusCode <= 299;
}

async function urlGet(url) {
    return new Promise((resolve, reject) => {
        let reqUrl = nUrl.parse(url);
        let options = { method: 'HEAD', host: reqUrl.host, port: reqUrl.port, path: reqUrl.pathname };

        try {

            http.get(options, (res) => {
                const { statusCode } = res;
                if (statusCode >= 200 || statusCode <= 299) {
                    resolve(statusIsOkay(statusCode));
                }
            })
        }
        catch (e) {
            reject(false);
        }
    })
}

async function testAndReturnRandomLink(unvisitedLinks, randomIndex) {
    let randomLink = unvisitedLinks[randomIndex];
    console.log('RANDOMLINK: ', randomLink);
    let urlResponse = await urlGet(randomLink);
    console.log("URLRESPONSE: ", urlResponse);

    if (urlResponse === true) {
        console.log("TESTED LINK AND RETURNING: ", randomLink);
        return randomLink;
    }
    else {
        console.log("TESTED LINK WAS INVALID");
        unvisitedLinks = _.pull(unvisitedLinks, randomLink);
        let newRandomIndex = getRandomIndex(unvisitedLinks.length, randomIndex);
        return testAndReturnRandomLink(unvisitedLinks, newRandomIndex);
    }
}

function getRandomIndex(numLinks, invalidIndex = null) {

    let randomIndex = 0;
    do {
        randomIndex = Math.floor(Math.random() * numLinks);
    } while (randomIndex === invalidIndex);

    return randomIndex;
}

function createNode(crawlerResult, parent, url, depth) {

    //console.log(`***   NEW NODE FOR DEPTH[${depth}]: PARENT: ${parent} SELF: ${url}`);
    let newNode = crawlerResult;
    newNode.depth = depth;
    newNode.parent = parent;
    newNode.self = url;

    return newNode;
}