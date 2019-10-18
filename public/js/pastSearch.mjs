document.getElementById("buildPastSearchButton").addEventListener("click", grabSearchTablePartial);

function grabSearchTablePartial() {
    $('#past-searches-div').load('/pastSearches', buildPastSearchTable);
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

export function displayAllCookies() {

    let allCookies = document.cookie;
    alert(allCookies);

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
        grabSearchTablePartial();
    }
}

function addNewPastSearch(url) {

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

function buildSearchEntry(url) {

    //Need to set unique identifier on button in order to create eventListener
    //onclick would then send URL to the crawl search entry on the page,
    //or, if we get there, would pull up past search result from server.
    let newTR = document.createElement("tr");
    let newTD = document.createElement("td");
    newTD.setAttribute('class', 'p-0 m-0')
    let newAHref = document.createElement("a");
    newAHref.setAttribute('href', url);
    newAHref.setAttribute('class', 'text-primary');
    newAHref.setAttribute('role', 'button');
    newAHref.setAttribute('class', 'col btn btn-sm btn-outline-light' );
    newAHref.innerText = url;
    newTD.appendChild(newAHref);
    newTR.appendChild(newTD);
    newTR.appendChild(newTD);
    newTR.appendChild(newTD);

    return newTR;
}

function handlePastSearchClick(e) {

}

export { buildPastSearchTable };