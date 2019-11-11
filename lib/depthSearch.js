const crawler = require('./crawler');

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
            break;
        }

        let thisParent = parentQueue.pop();
        let newLink = pageQueue.pop();

        let childResult = await crawler.invokeCrawler(newCrawler, newLink);
        visitedPages.push(newLink);

        let childNode = createNode(childResult, thisParent, newLink, depth);
        rootNode.children.push(childNode);

        let childLinks = getLinkURLs(childResult.links);
        let nextLink = getRandomLink(childLinks, visitedPages);
        console.log(nextLink);

        pageQueue.push(nextLink);
        parentQueue.push(nextLink);
    }

    return rootNode;
}

function getLinkURLs(linkArray) {
    let justURLs = linkArray.map(link => {
        return link.url;
    })

    return justURLs;
}

function getRandomLink(linkArray, visitedLinks) {
    if (!linkArray.length > 0) {
        return;
    }

    let randomIndex = Math.floor(Math.random() * linkArray.length);
    let randomLink = linkArray[randomIndex];
    if (visitedLinks.includes(randomLink)) {
        console.log('found redundant link');
        linkArray = linkArray.filter(x => x !== randomLink);
        return getRandomLink(linkArray, visitedLinks);
    }
    else {
        console.log('returning randomlink: ', randomLink);
        console.log('randomIndex: ', randomIndex);
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