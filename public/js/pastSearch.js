
getPastSearches = () => {
    let cookies = document.cookie;
    let splitCookie = cookies.split(";").map(x => x.trim());
    let pastSearchString = "past-search";
    let substringLength = pastSearchString.length;
    let pastSearches = splitCookie.filter(x => {
        return x.substring(0, substringLength) === pastSearchString;
    });

    return pastSearches;
}

getLastSearch = () => {
    let pastSearches = getPastSearches();
    let lastSearchIndex = pastSearches.length - 1;
    return pastSearches[lastSearchIndex];
}

getNextSearchNumber = () => {
    let lastSearch = getLastSearch();
    let pastSearchString = lastSearch.split('=')[0];
    let numRegEx = /\d+/g
    let nextSearchNumber = Number(pastSearchString.match(numRegEx)[0]) + 1;
    return nextSearchNumber;
}

displayAllCookies = () => {

    let allCookies = document.cookie;
    alert(allCookies);

}

setPastSearchCookie = url => {

    let pastSearches = getPastSearches();
    let cookieNumber = null;
    if (pastSearches.length > 0) {
        cookieNumber = getNextSearchNumber();
    }
    let thisURL = "http://www.google.com";
    let newCookie = `past-search${cookieNumber}=${thisURL}`;
    document.cookie = newCookie;

}

buildPastSearchTable = () => {

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

buildSearchEntry = url => {

    let newTR = document.createElement("tr");
    let newTD = document.createElement("td");
    let newAHref = document.createElement("a");
    newAHref.setAttribute('href', url);
    newAHref.setAttribute('class', 'text-primary');
    newAHref.innerText = url;
    newTD.appendChild(newAHref);
    newTR.appendChild(newTD);

    return newTR;
}

