
const crawlPopover = {
    position: 1,
    selector: "#search_url",
    title: "Crawl",
    content: "The website you want to scrape. As long as the URL is valid and the server responds, the search will proceed. If it's invalid, we'll let you know.",
    placement: "bottom"
}

const searchTypePopover = {
    position: 2,
    selector: "#depth_search",
    title: "Search Depth",
    content: "Here you can choose the style of search: <a href='https://en.wikipedia.org/wiki/Breadth-first_search'>Breadth-First</a> or <a href='https://en.wikipedia.org/wiki/Depth-first_search'>Depth-First</a>. Breadth-First will take much more time and resources, so start small (e.g., 2 or 3) and work your way up.",
    placement: "bottom"
}

const searchDepthPopover = {
    position: 3,
    selector: "#search_depth",
    title: "Depth",
    content: "How many distinct search layers do you want? Depth-first search with a depth of 6 means that the crawler will scrape a maximum of 6 distinct URLs.",
    placement: "bottom"
}

const resultsPopover = {
    position: 4,
    selector: "#visualization",
    title: "Results",
    content: "It may take a little while, but when the crawler finishes, the results will be displayed here.",
    placement: "right"
}

const inspectPopover = {
    position: 5,
    selector: "#inspect_results",
    title: "Inspect Results",
    content: "Here you will be able to drill down into the data delivered by the crawler, sorting by depth, type, content, and so on.<br><br><strong><u>Click the header to collapse or expand the results.</u></strong>",
    placement: "right"
}

const pastSearchesPopover = {
    position: 6,
    selector: "#past_searches_div",
    title: "Past Searches",
    content: "We'll save your past searches (as long as they're successful). You can access them here.<br><br><strong><u>Click the header to collapse or expand the results.</u></strong>",
    placement: "right"
}

let allPopovers = [crawlPopover, searchTypePopover, searchDepthPopover, resultsPopover, inspectPopover, pastSearchesPopover];

export default allPopovers;