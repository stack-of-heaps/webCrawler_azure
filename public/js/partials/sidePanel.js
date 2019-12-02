export async function buildSidePanel(crawlerData) {
    return new Promise((resolve, reject) => {

        $('#inspect_results').load("/sidePanel", function () {
            resolve()
        });
    })
}

function buildSidePanelTutorial() {
    $('#inspect_results').load("/sidePanelTutorial");
}
function deleteSidePanel() {
    $('#inspect_results').empty()
}

export function flattenDepthCrawlerData(crawlerData) {

    let depthArray = [];

    let nodeCopy = Object.assign({}, crawlerData);
    _.omit(nodeCopy, "children");
    depthArray.push(nodeCopy);

    if (crawlerData && crawlerData.children) {
        for (let children of crawlerData.children) {
            grabDepthChildren(depthArray, children);
        }
    }

    let orderedByDepth = depthArray.sort(orderByDepth);

    return orderedByDepth;
}

export function flattenBreadthCrawlerData(crawlerData) {

    let depthArray = [];

    let nodeCopy = Object.assign({}, crawlerData);
    _.omit(nodeCopy, "children");

    if (crawlerData && crawlerData.children) {
        for (let children of crawlerData.children) {
            grabBreadthChildren(depthArray, children);
        }
    }

    return depthArray;
}

function grabDepthChildren(depthArray, child) {

    let objectType = getObjectType(child);

    if (objectType === 'node') {
        let refCopy = Object.assign({}, child);
        let childCopy = _.omit(refCopy, "children");
        depthArray.push(childCopy);

        if (child.children) {
            for (let children of child.children) {
                grabDepthChildren(depthArray, children);
            }
        }
    }

    return;
}

function grabBreadthChildren(depthArray, child) {
    let refCopy = Object.assign({}, child);
    let childCopy = _.omit(refCopy, "children");

    let nodeDepth = childCopy.depth - 1;
    if (_.isArray(depthArray[nodeDepth])) {
        //console.log(`depth: ${nodeDepth}, adding to existing array within depthArray `);
        depthArray[nodeDepth].push(childCopy);
    }

    else if (_.isObject(depthArray[nodeDepth])) {
        //console.log(`depth: ${nodeDepth}, creating array within depthArray `);
        let newArray = new Array();
        newArray.push(depthArray[nodeDepth]);
        newArray.push(childCopy);
        depthArray[nodeDepth] = newArray;
    }
    else {
        //console.log(`depth: ${nodeDepth}, just adding node `);
        depthArray.push(childCopy);
    }

    if (child.children) {
        for (let children of child.children) {
            grabBreadthChildren(depthArray, children);
        }
    }
}

function orderByDepth(a, b) {
    if (a.depth < b.depth) {
        return -1;
    }

    if (a.depth > b.depth) {
        return 1;
    }

    return 0;
}

function buildSidePanelDepth(crawlerArray) {
    let depthSelector = document.getElementById('jump-to-depth');

    if (crawlerArray.some(entry => _.isArray(entry))) {
        for (let i = 0; i < crawlerArray.length; i++) {
            createDepthOption(depthSelector, i + 1);
        }
    } else {
        crawlerArray.forEach(entry => createDepthOption(depthSelector, entry.depth));
    }
}

function createDepthOption(depthSelector, depth) {
    let newOption = document.createElement('option');
    newOption.innerText = depth;
    depthSelector.appendChild(newOption);
}

function displayAllDepthLinks(crawlerData) {

    let highlightElementTable = document.getElementById('highlight-element-tbody');

    crawlerData.links.forEach((link, index) => {
        let newTR = document.createElement('tr');
        let numTD = document.createElement('td');
        numTD.innerText = index + 1;
        numTD.setAttribute('class', 'text-center align-middle');
        newTR.appendChild(numTD);

        let urlTD = document.createElement('td');
        urlTD.setAttribute('colspan', '2');
        urlTD.setAttribute('class', 'text-left align-middle');
        let href = document.createElement('a');

        // Links have URLs; nodes have Titles
        if (link.url) {
            href.setAttribute('href', link.url);
            href.innerText = link.url;
        }
        if (link.title) {
            href.setAttribute('href', link.self);
            href.innerText = link.self;
        }

        href.setAttribute('class', 'text-light');
        urlTD.appendChild(href);
        newTR.appendChild(urlTD);

        let urlTextTD = document.createElement('td');
        urlTextTD.setAttribute('class', 'text-center align-middle');

        if (link.title) {
            urlTextTD.innerText = link.description;
        }
        else {
            urlTextTD.innerText = link.text;
        }
        newTR.appendChild(urlTextTD);

        highlightElementTable.appendChild(newTR);

    });
}

function displayAllBreadthLinks(crawlerData) {

    let highlightElementTable = document.getElementById('highlight-element-tbody');

    crawlerData.forEach((node, index) => {
        let newTR = document.createElement('tr');
        let numTD = document.createElement('td');
        numTD.innerText = index + 1;
        numTD.setAttribute('class', 'text-center align-middle');
        newTR.appendChild(numTD);

        let urlTD = document.createElement('td');
        urlTD.setAttribute('colspan', '2');
        urlTD.setAttribute('class', 'text-left align-middle');

        let href = document.createElement('a');
        href.setAttribute('href', node.self);
        href.innerText = node.self;
        href.setAttribute('class', 'text-light');

        urlTD.appendChild(href);
        newTR.appendChild(urlTD);

        let urlTextTD = document.createElement('td');
        urlTextTD.setAttribute('class', 'text-center align-middle');
        urlTextTD.innerText = node.title;

        newTR.appendChild(urlTextTD);

        highlightElementTable.appendChild(newTR);

    });
}

function clearDepthTable() {
    $('#highlight-element-tbody').empty()
}

function displayDepthFavicons(crawlerArray, event) {
    clearDepthTable();
    let depth = event.target.value;
    depth -= 1;

    let depthNode = null;
    if (_.isArray(crawlerArray[depth])) {
        crawlerArray[depth].forEach(entry => depthNode.push(entry.favicon));
    }
    else {
        depthNode = crawlerArray[depth - 1];
    }

    displayAllLinks(depthNode);
}

function displayDepthImages(crawlerArray, event) {
    clearDepthTable();
    let depth = event.target.value;
    depth -= 1;

    let depthNode = null;
    if (_.isArray(crawlerArray[depth])) {
        crawlerArray[depth].forEach(entry => depthNode.push(entry.images));
    }
    else {
        depthNode = crawlerArray[depth - 1];
    }

    displayAllLinks(depthNode);
}

function displayDepthLinks(crawlerArray, event) {
    clearDepthTable();
    let depth = event.target.value;

    if (_.isArray(crawlerArray[depth])) {
        let linksArray = [];
        crawlerArray[depth].forEach(entry => linksArray.push(entry));
        displayAllBreadthLinks(linksArray);
    }

    else {
        let depthNode = crawlerArray[depth - 1];
        displayAllDepthLinks(depthNode);
    }
}

function getObjectType(obj) {
    if (obj.orientation) {
        return 'link';
    }
    else {
        return 'node';
    }
}

export function populateSidePanel(crawlerData, searchType) {
    let parsedCrawler = null;

    if (typeof (crawlerData) === 'string') {
        parsedCrawler = JSON.parse(crawlerData);
    }
    else {
        parsedCrawler = crawlerData;
    }

    let flattenedCrawler = null;
    if (searchType === 'depth_search') {
        flattenedCrawler = flattenDepthCrawlerData(parsedCrawler);
    }
    else {
        flattenedCrawler = flattenBreadthCrawlerData(parsedCrawler);
    }
    //displayAllLinks(flattenedCrawler, 1);
    buildSidePanelDepth(flattenedCrawler);
    console.log('flattenedCrawler: ', flattenedCrawler);

    document.getElementById('jump-to-depth').addEventListener('change', function (event) { displayDepthLinks(flattenedCrawler, event) });
}
