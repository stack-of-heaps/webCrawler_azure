export async function buildSidePanel(crawlerData) {
    return new Promise((resolve, reject) => {

        $('#inspect_results').load("/sidePanel", function () {
            resolve()
        });
    })
}

export function buildSidePanelTutorial() {
    $('#inspect_results').load("/sidePanelTutorial");
}
export function deleteSidePanel() {
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

    if (crawlerData.links === null) {
        let newTR = document.createElement('tr');
        let urlTD = document.createElement('td');
        urlTD.setAttribute('colspan', '3');
        urlTD.setAttribute('class', 'text-left align-middle');
        urlTD.innerText = 'Sorry, something went wrong fetching this data!';
        newTR.appendChild(urlTD);
        highlightElementTable.appendChild(newTR);
        return;
    }

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
        href.setAttribute('target', '_blank');
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

    crawlerData.forEach((link, index) => {
        let newTR = document.createElement('tr');
        let numTD = document.createElement('td');
        numTD.innerText = index + 1;
        numTD.setAttribute('class', 'text-center align-middle');
        newTR.appendChild(numTD);

        let urlTD = document.createElement('td');
        urlTD.setAttribute('colspan', '2');
        urlTD.setAttribute('class', 'text-left align-middle');

        let href = document.createElement('a');
        href.setAttribute('href', link.url);
        href.innerText = link.url;
        href.setAttribute('class', 'text-light');
        href.setAttribute('target', '_blank');

        urlTD.appendChild(href);
        newTR.appendChild(urlTD);

        let urlTextTD = document.createElement('td');
        urlTextTD.setAttribute('class', 'text-center align-middle');
        urlTextTD.innerText = link.text;

        newTR.appendChild(urlTextTD);

        highlightElementTable.appendChild(newTR);

    });
}

function displayAllImages(imageArray) {

    let highlightElementTable = document.getElementById('highlight-element-tbody');
    let allURLs = [];

    let breadthFlag = false;
    for (let i = 0; i < imageArray.length; i++) {
        if (_.isArray(imageArray[i])) {
            breadthFlag = true;
            break;
        }
    }

    if (breadthFlag) {
        let allURLs = [];
        imageArray.forEach(entry => {
            entry.forEach((image, index) => {

                if (allURLs.includes(image.url)) {
                    return;
                }
                allURLs.push(image.url);

                let newTR = document.createElement('tr');
                let numTD = document.createElement('td');
                numTD.innerText = index + 1;
                numTD.setAttribute('class', 'text-center align-middle');
                newTR.appendChild(numTD);

                let urlTD = document.createElement('td');
                urlTD.setAttribute('colspan', '2');
                urlTD.setAttribute('class', 'align-middle');

                let img = document.createElement('img');
                img.setAttribute('class', 'img-fluid');
                img.setAttribute('alt', image.text);
                img.setAttribute('src', image.url);
                //img.setAttribute('height', 100);

                let href = document.createElement('a');
                href.setAttribute('href', image.url);
                href.setAttribute('target', '_blank');

                href.appendChild(img);
                urlTD.appendChild(href);
                newTR.appendChild(urlTD);

                let urlTextTD = document.createElement('td');
                urlTextTD.setAttribute('class', 'text-center align-middle');
                urlTextTD.innerText = image.text;

                newTR.appendChild(urlTextTD);
                highlightElementTable.appendChild(newTR);
            })
        })
    }
    else {
        let index = 0;
        imageArray.forEach(image => {
            if (allURLs.includes(image.url)) {
                return;
            }
            index++;
            allURLs.push(image.url);

            let newTR = document.createElement('tr');
            let numTD = document.createElement('td');
            numTD.innerText = index;
            numTD.setAttribute('class', 'text-center align-middle');
            newTR.appendChild(numTD);

            let urlTD = document.createElement('td');
            urlTD.setAttribute('colspan', '2');
            urlTD.setAttribute('class', 'align-middle');

            let img = document.createElement('img');
            img.setAttribute('class', 'img-fluid');
            img.setAttribute('alt', image.text);
            img.setAttribute('src', image.url);

            let href = document.createElement('a');
            href.setAttribute('href', image.url);
            href.setAttribute('target', '_blank');

            href.appendChild(img);
            urlTD.appendChild(href);
            newTR.appendChild(urlTD);

            let urlTextTD = document.createElement('td');
            urlTextTD.setAttribute('class', 'text-center align-middle');
            urlTextTD.innerText = image.text;

            newTR.appendChild(urlTextTD);
            highlightElementTable.appendChild(newTR);
        })
    };
}

function clearDepthTable() {
    $('#highlight-element-tbody').empty()
}

function getDepthImages(crawlerArray, depth) {
    clearDepthTable();
    depth -= 1;

    let depthImages = [];
    if (crawlerArray.some(entry => _.isArray(entry))) {
        for (let node of crawlerArray[depth]) {
            if (node.status !== 400) {
                node.images.forEach(image => depthImages.push(image));
            }
        }
    }
    else {
        depthImages = crawlerArray[depth].images;
    }

    displayAllImages(depthImages);
}

function displayLinks(crawlerArray, depth) {
    clearDepthTable();

    if (_.isArray(crawlerArray[depth])) {
        let linksArray = [];
        depth--;
        for (let node of crawlerArray[depth]) {
            if (node.status !== 400) {
                node.links.forEach(link => linksArray.push(link));
            }
        }
        displayAllBreadthLinks(linksArray);
    }

    else {
        let depthNode = crawlerArray[depth];
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
    buildSidePanelDepth(flattenedCrawler);

    document.getElementById('jump-to-depth').addEventListener('change', function (event) { displaySelectionCategories(flattenedCrawler, event) });
    document.getElementById('highlight-element').addEventListener('change', function (event) { displaySelectedElements(flattenedCrawler, event) });
}

function displaySelectionCategories(crawlerData, event) {

    let o = document.getElementById('highlight-element');

    if (o.childElementCount === 1) {

        let newOption = document.createElement('option');
        newOption.innerText = 'Links';

        let newOption2 = document.createElement('option');
        newOption2.innerText = 'Images';

        o.appendChild(newOption);
        o.appendChild(newOption2);
    }
    else {
        let selectedValue = getHighlightSelection();
        let selectedDepth = getDepthSelection();
        if (selectedValue === 'Links') {
            displayLinks(crawlerData, selectedDepth);
        }
        if (selectedValue === 'Images') {
            getDepthImages(crawlerData, selectedDepth);
        }
    }
}

function displaySelectedElements(crawlerData, event) {

    let selectedDepth = getDepthSelection();

    if (event.target.value === 'Links') {
        displayLinks(crawlerData, selectedDepth);
    }

    if (event.target.value === 'Images') {
        let imageArray = getDepthImages(crawlerData, selectedDepth);
        displayAllImages(imageArray);
    }
}

function getDepthSelection() {

    let o = document.getElementById('jump-to-depth');
    return o.options[o.selectedIndex].text;
}

function getHighlightSelection() {
    let o = document.getElementById('highlight-element');
    return o.options[o.selectedIndex].text;
}
