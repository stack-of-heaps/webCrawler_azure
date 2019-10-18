document.getElementById("buildPanelButton").addEventListener("click", buildSidePanel);

function buildSidePanel() {

    $('#inspect-results').load("/sidePanel");

}
