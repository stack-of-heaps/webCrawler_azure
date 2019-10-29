const PAST_SEARCH_BY_ID_URL = '/getPastSearchById'

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
export function deleteSearchTablePatial() {
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

    //Need to set unique identifier on button in order to create eventListener
    //onclick would then send URL to the crawl search entry on the page,
    //or, if we get there, would pull up past search result from server.

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

    newAHref.addEventListener('click', function () { handlePastSearchClick(newAHref) });

    return newTR;
}

function handlePastSearchClick(e) {
    console.log(e);
    let searchID = e.id;
    $.post(PAST_SEARCH_BY_ID_URL, { id: searchId }, () => {
        console.log(data);
    })
}