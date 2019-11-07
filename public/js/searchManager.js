import * as pastSearchManager from './pastSearch.js';
import * as sidePanelManager from './sidePanel.js';
const CRAWLER = '/crawlerRequest';
const CHECKURL = '/checkURL';
const PASTSEARCHBYURL = '/pastSearchByURL';
const PASTSEARCHBYID = '/pastSearchByID';
const NEWENTRYURL = '/newDBEntry';
const GETPASTSEARCHURL = '/getPastSearch';
const UPDATEPASTSEARCHURL = '/updateCrawlerData';

const URL_RESPONSES = {
    IN_PROGRESS: 0,
    SUCCESS: 1,
    FAILURE: 2,
    innerText: 'Validating URL...'
}

const UPDATE_RESULT = {
    IN_PROGRESS: 0,
    SUCCESS: 1,
    FAILURE: 2,
    innerText: 'Creating database entry...'
}

const PAST_SEARCH_RESPONSES = {
    IN_PROGRESS: 0,
    EXISTS_FRESH: 1,
    EXISTS_STALE: 2,
    EXISTS_SHALLOW: 3,
    NOT_EXIST: 4,
    innerText: 'Searching for search with that URL...'
}

document.getElementById('search-form').addEventListener('submit', crawlerRequest);

export async function crawlerRequest(event) {

    event.preventDefault();
    setURLValidationStatus();

    let searchDTO = createSearchDTO();

    let url = searchDTO.search_url;
    let urlResponse = await $.post(CHECKURL, { url: url });

    if (urlResponse.status >= 200 && urlResponse.status <= 299) {
        setURLValidationStatus(URL_RESPONSES.SUCCESS);
    }
    else {
        setURLValidationStatus(URL_RESPONSES.FAILURE);
        return;
    }

    setPastSearchStatus();

    let pastSearch = await fetchPastSearchByURL(url);
    let pastSearchStatus = getPastSearchInfo(pastSearch, searchDTO);

    setPastSearchStatus(pastSearchStatus);
    actOnPastSearchStatus(pastSearchStatus, pastSearch, searchDTO);

}

function setURLValidationStatus(status = URL_RESPONSES.IN_PROGRESS) {
    const VALIDATING_TEXT = 'validating_url';
    const URL_STATUS_DIV = 'status_div';
    let validatingElement = document.getElementById(VALIDATING_TEXT);

    if (!validatingElement) {
        createStatusElement(URL_STATUS_DIV, VALIDATING_TEXT, URL_RESPONSES);
        return;
    }
    else {
        var statusDiv = document.getElementById(URL_STATUS_DIV);
        var statusH = document.getElementById(VALIDATING_TEXT);
        switch (status) {
            case URL_RESPONSES.IN_PROGRESS: {
                statusDiv.setAttribute('class', 'alert alert-info');
                statusH.innerText = 'Checking URL status...';
                break;
            }
            case URL_RESPONSES.SUCCESS: {
                statusDiv.setAttribute('class', 'alert alert-success');
                statusH.innerText = 'URL OK !';
                break;
            }
            case URL_RESPONSES.FAILURE: {
                statusDiv.setAttribute('class', 'alert alert-danger');
                statusH.innerText = 'URL could not be resolved. Please try another or try again later.';
                break;
            }
            default: {
                statusDiv.setAttribute('class', 'alert alert-danger');
                statusH.innerText = 'URL could not be resolved. Please try another or try again later.';
                break;
            }
        }
    }
}

function setPastSearchStatus(status = PAST_SEARCH_RESPONSES.IN_PROGRESS) {
    const CHECKING_SEARCH = 'checking_search_text';
    const SEARCH_STATUS_DIV = 'search_status_div';
    let validatingElement = document.getElementById(CHECKING_SEARCH);

    if (!validatingElement) {
        createStatusElement(SEARCH_STATUS_DIV, CHECKING_SEARCH, PAST_SEARCH_RESPONSES);
        return;
    }
    else {
        var statusDiv = document.getElementById(SEARCH_STATUS_DIV);
        var statusH = document.getElementById(CHECKING_SEARCH);
        switch (status) {
            case PAST_SEARCH_RESPONSES.IN_PROGRESS: {
                statusDiv.setAttribute('class', 'alert alert-info');
                statusH.innerText = 'Searching database for that URL...';
                break;
            }
            case PAST_SEARCH_RESPONSES.EXISTS_FRESH: {
                statusDiv.setAttribute('class', 'alert alert-primary');
                statusH.innerText = 'Past search found with fresh data.';
                break;
            }
            case PAST_SEARCH_RESPONSES.EXISTS_STALE: {
                statusDiv.setAttribute('class', 'alert alert-primary');
                statusH.innerText = 'Past search found with stale data. The search will be conducted again to ensure that crawler search data is as accurate as possible.';
                break;
            }
            case PAST_SEARCH_RESPONSES.EXISTS_SHALLOW: {
                statusDiv.setAttribute('class', 'alert alert-primary');
                statusH.innerText = 'Past search found, but not to the depth you specified. Will now conduct search to gather more data.';
                break;
            }
            case PAST_SEARCH_RESPONSES.NOT_EXIST: {
                statusDiv.setAttribute('class', 'alert alert-primary');
                statusH.innerText = 'No one has searched for that URL before! Firing up the web crawler...';
                break;
            }
            default: {
                statusDiv.setAttribute('class', 'alert alert-danger');
                statusH.innerText = 'Something went wrong while querying the database for prior searches. Please try again.';
                break;
            }
        }
    }
}

function getPastSearchInfo(dbCheck, searchDTO) {
    if (dbCheck._id === null) {
        return PAST_SEARCH_RESPONSES.NOT_EXIST;
    }
    else {
        let staleData = dataIsStale(dbCheck);
        if (staleData) {
            return PAST_SEARCH_RESPONSES.EXISTS_STALE;
        }
        else if (!staleData && Number(dbCheck.depth) >= Number(searchDTO.search_depth)) {
            return PAST_SEARCH_RESPONSES.EXISTS_FRESH;
        }
        else {
            return PAST_SEARCH_RESPONSES.EXISTS_SHALLOW;
        }
    }
}

async function actOnPastSearchStatus(dbStatus, pastSearch, searchDTO) {

    switch (dbStatus) {
        case PAST_SEARCH_RESPONSES.EXISTS_FRESH: {
            setNewDBEntryStatus(UPDATE_RESULT.SUCCESS);
            const pastSearch = await fetchPastSearchByURL(searchDTO.search_url);
            buildChart(JSON.parse(pastSearch.crawlerData));
            break;
        }
        case PAST_SEARCH_RESPONSES.EXISTS_STALE: {
            searchDTO._id = pastSearch._id;
            const chartData = await updateCrawlerDepth(searchDTO);
            setNewDBEntryStatus(UPDATE_RESULT.SUCCESS);
            buildChart(chartData);
            sidePanelManager.buildSidePanel().then(done => sidePanelManager.populateSidePanel(chartData));

            break;
        }
        case PAST_SEARCH_RESPONSES.EXISTS_SHALLOW: {
            searchDTO._id = pastSearch._id;
            const chartData = await updateCrawlerDepth(searchDTO);
            setNewDBEntryStatus(UPDATE_RESULT.SUCCESS);
            buildChart(chartData);
            sidePanelManager.buildSidePanel().then(done => sidePanelManager.populateSidePanel(chartData));

            break;
        }
        case PAST_SEARCH_RESPONSES.NOT_EXIST: {
            setNewDBEntryStatus();
            const chartData = await submitChartForm(searchDTO);

            if (!chartData.error) {
                searchDTO.crawlerData = JSON.stringify(chartData.data);
                let result = await createDBEntry(searchDTO);

                pastSearchManager.setPastSearchCookie(searchDTO.search_url, result._id);
                setNewDBEntryStatus(UPDATE_RESULT.SUCCESS);
                buildChart(chartData.data);
                sidePanelManager.buildSidePanel().then(done => sidePanelManager.populateSidePanel(chartData.data));
            }
            else {
                setNewDBEntryStatus(UPDATE_RESULT.FAILURE);
            }
            break;
        }
        default:
            break;
    }
}

async function updateCrawlerDepth(searchDTO) {

    const postRequest = await $.post(UPDATEPASTSEARCHURL, {
        _id: searchDTO._id,
        search_url: searchDTO.search_url,
        search_depth: searchDTO.search_depth,
        search_type: searchDTO.search_type,
        crawlerData: searchDTO.crawlerData
    });

    const postResponse = await postRequest;
    return postResponse;

}

async function createDBEntry(searchDTO) {
    let postResponse = await $.post(NEWENTRYURL, {
        search_url: searchDTO.search_url,
        search_depth: searchDTO.search_depth,
        search_type: searchDTO.search_type,
        crawlerData: searchDTO.crawlerData
    });

    return postResponse;
}

function setNewDBEntryStatus(createResult = UPDATE_RESULT.IN_PROGRESS) {
    const DB_CREATE_STATUS = 'newDBEntry_url';
    const DB_UPDATE_DIV = 'db_update_div';
    let dbStatusElement = document.getElementById(DB_CREATE_STATUS);

    if (!dbStatusElement) {
        createStatusElement(DB_UPDATE_DIV, DB_CREATE_STATUS, UPDATE_RESULT);
        return;
    }
    else {
        var statusDiv = document.getElementById(DB_UPDATE_DIV);
        var statusH = document.getElementById(DB_CREATE_STATUS);
        switch (createResult) {
            case UPDATE_RESULT.IN_PROGRESS: {
                statusDiv.setAttribute('class', 'alert alert-success');
                statusH.innerText = 'Creating new database entry...';
                break;
            }
            case UPDATE_RESULT.SUCCESS: {
                statusDiv.setAttribute('class', 'alert alert-success');
                statusH.innerText = 'Successfully added search to the database. Once the crawler is finished, they will be displayed here. You can access the results any time in the future using the "Past Searches" element in the bottom left corner of the screen.';
                break;
            }
            case UPDATE_RESULT.FAILURE: {
                statusDiv.setAttribute('class', 'alert alert-danger');
                statusH.innerText = 'Could not add to the database. Something went wrong. Please try again.';
                break;
            }
            default: {
                statusDiv.setAttribute('class', 'alert alert-danger');
                statusH.innerText = 'Could not add to the database. Something went wrong. Please try again.';
                break;
            }
        }
    }
}

async function fetchPastSearchByURL(url) {
    let result = await $.post(PASTSEARCHBYURL, { url: url });
    return result;
}

function createStatusElement(div_id, text_id, textPackage) {
    let innerText = textPackage.innerText;
    let visDiv = document.getElementById('visualization');
    let statusDiv = document.createElement('div');
    statusDiv.setAttribute('id', div_id);
    statusDiv.setAttribute('class', 'alert alert-warning');
    statusDiv.setAttribute('role', 'alert');
    let statusH = document.createElement('h3');
    statusH.setAttribute('id', text_id);
    statusH.innerText = innerText;
    statusDiv.appendChild(statusH);
    visDiv.appendChild(statusDiv);
}

function createSearchDTO() {
    let $form = $('#search-form');
    let url = $form.find('input[name=search_url]').val();
    let searchType = $form.find('input[type=radio][name=search_type]:checked').val();
    let depth = $form.find('input[name="search_depth"]').val();

    return {
        search_url: url,
        search_type: searchType,
        search_depth: depth
    }
}

function dataIsStale(dbResult) {
    const MAX_HOURS = 172_800_000;
    let dateNow = Date.now();
    let entryDate = Date.parse(dbResult.date);
    let difference = dateNow - entryDate;

    return difference > MAX_HOURS ? true : false;
}