const PAST_SEARCH_BY_ID_URL = '/getPastSearchById'

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
    let splitCookie = cookies.split(";").map(x => x.trim());
    let pastSearchString = "past-search";
    let substringLength = pastSearchString.length;
    let pastSearches = splitCookie.filter(x => {
        return x.substring(0, substringLength) === pastSearchString;
    });

    return pastSearches;
}

export function getLastSearch() {
    let pastSearches = getPastSearches();
    let lastSearchIndex = pastSearches.length - 1;
    return pastSearches[lastSearchIndex];
}

export function getNextSearchNumber() {
    let lastSearch = getLastSearch();
    let pastSearchString = lastSearch.split('=')[0];
    let numRegEx = /\d+/g
    let nextSearchNumber = Number(pastSearchString.match(numRegEx)) + 1;
    return nextSearchNumber;
}

document.getElementById("setCookieButton").addEventListener("click", () => { setPastSearchCookie('http://www.google.com') });

export function setPastSearchCookie(url) {

    let pastSearches = getPastSearches();
    let cookieNumber = null;
    if (pastSearches.length > 0) {
        cookieNumber = getNextSearchNumber();
    }
    let thisURL = "http://www.google.com";
    let newCookie = `past-search${cookieNumber}=${thisURL}`;
    document.cookie = newCookie;

    if (pastSearchTableIsVisible()) {
        addNewPastSearch(thisURL);
    } else {
        fetchSearchTablePartial();
    }
}

function addNewPastSearch(url, id) {

    let newEntry = buildSearchEntry(url);
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
    let pastSearchURLs = pastSearches.map(x => {
        return x.split('=')[1];
    })

    pastSearchURLs.forEach(url => {
        let newTR = buildSearchEntry(url);
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

    newAHref.addEventListener('click', handlePastSearchClick(newAHref));

    return newTR;
}

function handlePastSearchClick(e) {
    console.log('in past search click event');
    console.log(e);
    let searchID = e.id;
    $.post(PAST_SEARCH_BY_ID_URL, { id: searchId }, () => {
        console.log(data);
    })
}

function pastSearchNotFound() {
    alert("Sorry, we couldn't find that past search. We will perform it again.");
}