import allPopovers from './Popovers.js';
import * as pastSearchManager from './pastSearch.js';
import * as sidePanelManager from './sidePanel.js';

document.getElementById('no_tutorial').addEventListener('click', function () { setVisitedCookie() });
document.getElementById('yes_tutorial').addEventListener('click', function () { startTutorial() });
document.onload = checkIfFirstVisit();

function checkIfFirstVisit() {
    let cookie = document.cookie;
    
    if (!cookie.includes('visited')) {
        $('#tutorial_modal').modal('show');
    }
}

function setVisitedCookie() {
    let cookieString = "visited=true";
    document.cookie = cookieString;
}

function showAndHidePopovers() {

    let allSelectors = allPopovers.map(popover => popover.selector);
    pastSearchManager.grabTutorialSearchTable();
    sidePanelManager.buildSidePanelTutorial();

    for (let i = 0; i < allSelectors.length; i++) {
        setTimeout(() => {
            $(allSelectors[i]).popover('toggle');

        }, (i * 8500))

        setTimeout(() => {
            $(allSelectors[i]).popover('toggle');

        }, 8500 + (i * 8500))
    }

    //Remove example past searches and side panel
    setTimeout(() => {
        pastSearchManager.deleteSearchTablePartial();
        sidePanelManager.deleteSidePanel();

    }, (allSelectors.length * 8500))

}

function generatePopover(popover) {

    let { selector, title, content, placement } = popover;

    $(selector).popover({
        html: true,
        title: title,
        content: content,
        placement: placement,
        trigger: 'manual'
    })
}

function compare(p1, p2) {
    if (p1.position < p2.position) return -1;
    if (p1.position == p2.position) return 0;
    if (p1.position > p2.position) return 1;
}

export default function startTutorial() {
    allPopovers.sort(compare).forEach(popover => generatePopover(popover));
    showAndHidePopovers();
    setVisitedCookie();
}