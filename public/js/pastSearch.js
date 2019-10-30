const PAST_SEARCH_BY_ID_URL = '/pastSearchById'

window.onload = function () {
    let pastSearches = getPastSearches();
    console.log('pastsearches: ', pastSearches);
    if (pastSearches.length > 0) {
        fetchSearchTablePartial();
    }
}
document.getElementById("buildPastSearchButton").addEventListener("click", fetchSearchTablePartial);

export function fetchSearchTablePartial() {
    $('#past_searches_div').load('/pastSearches', buildPastSearchTable);
}

export function grabTutorialSearchTable() {
    $('#past_searches_div').load('/pastSearchesTutorial');
}
export function deleteSearchTablePartial() {
    $('#past_searches_div').empty();
}

function getPastSearches() {
    let cookies = document.cookie;
    let splitCookies = null;

    if (cookies) {
        splitCookies = cookies.split(";").map(x => x.trim()).filter(entry => !entry.includes('visited'));
    }
    return splitCookies;
}

export function setPastSearchCookie(url, id) {

    let newCookie = `${id}=${url}`;
    document.cookie = newCookie;

    if (pastSearchTableIsVisible()) {
        addNewPastSearch(url, id);
    } else {
        fetchSearchTablePartial();
    }
}

function addNewPastSearch(url, id) {

    let newEntry = buildSearchEntry(url, id);
    let pastSearchesTbody = document.getElementById("past-searches-tbody");
    pastSearchesTbody.append(newEntry);

}

function pastSearchTableIsVisible() {

    let pastSearchesTbody = document.getElementById("past-searches-tbody");
    return pastSearchesTbody === null ? false : true;
}

function buildPastSearchTable() {

    let pastSearchesTbody = document.getElementById("past-searches-tbody");
    let pastSearches = getPastSearches();


    pastSearches.forEach(search => {
        
        let values = search.split('=');
        let id = values[0];
        let url = values[1];

        let newTR = buildSearchEntry(url, id);
        pastSearchesTbody.appendChild(newTR);
    });

}

function buildSearchEntry(url, id) {

    let newTR = document.createElement("tr");
    let newTD = document.createElement("td");
    let newAHref = document.createElement("a");
    newAHref.setAttribute('id', id);
    newAHref.setAttribute('href', '#');
    newAHref.setAttribute('role', 'button');
    newAHref.setAttribute('class', 'col btn btn-sm btn-outline-light');
    newAHref.innerText = url;
    newTD.appendChild(newAHref);
    newTR.appendChild(newTD);
    newTR.appendChild(newTD);
    newTR.appendChild(newTD);

    newAHref.addEventListener('click', function () { handlePastSearchClick(id) });

    return newTR;
}

function handlePastSearchClick(id) {
    console.log("id: ", id);
    $.post(PAST_SEARCH_BY_ID_URL, { id: id }, (data) => {
        console.log(data);
        displayPastSearchInfo(data);
    })
}

function displayPastSearchInfo(search) {

    let visDiv = document.getElementById('visualization');
    let statusDiv = document.createElement('div');
    statusDiv.setAttribute('class', 'alert alert-secondary');
    statusDiv.setAttribute('role', 'alert');

    let statusH = document.createElement('h6');
    statusH.innerText = `Found search with the following attributes: id: ${search._id}, date: ${search.date}, depth: ${search.depth}, url: ${search.url}`;

    statusDiv.appendChild(statusH);
    visDiv.appendChild(statusDiv);

}