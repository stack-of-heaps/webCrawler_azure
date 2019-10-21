document.getElementById("buildPanelButton").addEventListener("click", buildSidePanel);

export default function buildSidePanel() {
    $('#inspect_results').load("/sidePanel");
}

export function buildSidePanelTutorial() {
    $('#inspect_results').load("/sidePanelTutorial");
}
export function deleteSidePanel() {
    $('#inspect_results').empty()
}