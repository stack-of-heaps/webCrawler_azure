export async function buildSidePanel(crawlerData) {
    return new Promise((resolve, reject) => {

        $('#inspect_results').load("/sidePanel", function() {
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

function buildSidePanelDepth(crawlerData) {
    let depthSelector = document.getElementById('jump-to-depth');
    let newOption = document.createElement('option');
    newOption.innerText = '1';
    depthSelector.appendChild(newOption);
}

function buildSidePanelElements(crawlerData) {

    let highlightElementTable = document.getElementById('highlight-element-tbody');

    let linkElements = crawlerData.children;

    linkElements.forEach((link, index) => {
        let newTR = document.createElement('tr');
        let numTD = document.createElement('td');
        numTD.innerText = index;
        numTD.setAttribute('class', 'text-center align-middle');
        newTR.appendChild(numTD);

        let urlTD = document.createElement('td');
        urlTD.setAttribute('colspan', '2');
        urlTD.setAttribute('class', 'text-left align-middle');
        let href = document.createElement('a');
        href.setAttribute('href', link.url.href);
        href.setAttribute('class', 'text-light');
        href.innerText = link.url.href;
        urlTD.appendChild(href);
        newTR.appendChild(urlTD);

        let urlTextTD = document.createElement('td');
        urlTextTD.setAttribute('class', 'text-center align-middle');

        urlTextTD.innerText = link.title;
        newTR.appendChild(urlTextTD);

        highlightElementTable.appendChild(newTR);

    });
}

export function populateSidePanel(crawlerData) {
    buildSidePanelElements(crawlerData);
    buildSidePanelDepth(crawlerData);
}
