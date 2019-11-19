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

export function flattenCrawlerData(crawlerData) {

    let depthArray = [];

    let nodeCopy = Object.assign({}, crawlerData);
    _.omit(nodeCopy, "children");
    depthArray.push(nodeCopy);

    for (let children of crawlerData.children) {
        grabChildren(depthArray, children);
    }

    let orderedByDepth = depthArray.sort(orderByDepth);

    return orderedByDepth;

}

function grabChildren(depthArray, child) {
    let refCopy = Object.assign({}, child);
    let childCopy = _.omit(refCopy, "children");
    depthArray.push(childCopy);

    if (child.children) {
        for (let children of child.children) {
            grabChildren(depthArray, children);
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
    crawlerArray.forEach(entry => createDepthOption(depthSelector, entry.depth));
}

function createDepthOption(depthSelector, depth) {
    let newOption = document.createElement('option');
    newOption.innerText = depth;
    depthSelector.appendChild(newOption);
}

function displayAllLinks(crawlerData) {

    let highlightElementTable = document.getElementById('highlight-element-tbody');

    crawlerData.links.forEach((link, index) => {
        let newTR = document.createElement('tr');
        let numTD = document.createElement('td');
        numTD.innerText = index;
        numTD.setAttribute('class', 'text-center align-middle');
        newTR.appendChild(numTD);

        let urlTD = document.createElement('td');
        urlTD.setAttribute('colspan', '2');
        urlTD.setAttribute('class', 'text-left align-middle');
        let href = document.createElement('a');
        href.setAttribute('href', link.url);
        href.setAttribute('class', 'text-light');
        href.innerText = link.type;
        urlTD.appendChild(href);
        newTR.appendChild(urlTD);

        let urlTextTD = document.createElement('td');
        urlTextTD.setAttribute('class', 'text-center align-middle');

        urlTextTD.innerText = link.text;
        newTR.appendChild(urlTextTD);

        highlightElementTable.appendChild(newTR);

    });
}

function clearDepthTable() {
    $('#highlight-element-tbody').empty()
}

function displayDepthLinks(crawlerArray, event) {
    clearDepthTable();
    let depth = event.target.value;
    let depthNode = crawlerArray[depth - 1];
    displayAllLinks(depthNode);
}

export function populateSidePanel(crawlerData) {
    let parsedCrawler = JSON.parse(crawlerData);
    let flattenedCrawler = flattenCrawlerData(parsedCrawler);
    //displayAllLinks(flattenedCrawler, 1);
    buildSidePanelDepth(flattenedCrawler);

    document.getElementById('jump-to-depth').addEventListener('change', function (event) { displayDepthLinks(flattenedCrawler, event) });
}
