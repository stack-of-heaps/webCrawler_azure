const WebScraper = require('./lib/webScraper.js');
const PORT = 3000;

const Mongo = require('./lib/mongo/mongoModule');
const MongoManager = require('./lib/mongo/mongoManager');
const axios = require('axios');
var express = require('express');
var path = require('path');
const dayjs = require('dayjs');
var app = express();
app.set('port', PORT);
const { fork } = require('child_process');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

Mongo.connect()
  .then(() => console.log('Connected to database.'))
  .catch((e) => console.error(e));

app.get('/', (req, res) => {
  response.sendFile(path.join(__dirname + '/public/index.html'));
});

// <-- PARTIALS -->
app.get('/sidePanel', (req, res) => {
  res.sendFile(path.join(__dirname + '/partials/sidePanel.html'))
});

app.get('/sidePanelTutorial', (req, res) => {
  res.sendFile(path.join(__dirname + '/partials/sidePanelTutorial.html'))
});

app.get('/pastSearches', (req, res) => {
  res.sendFile(path.join(__dirname + '/partials/pastSearches.html'))
});

app.get('/pastSearchesTutorial', (req, res) => {
  res.sendFile(path.join(__dirname + '/partials/pastSearchesTutorial.html'))
});

// <-- END PARTIALS -->

app.post('/search', async (req, res) => {

  let url = req.body.search_url;
  let depth = req.body.search_depth;
  let type = req.body.search_type;
  let crawlerResult = null;

  if (type === 'depth_search') {
    crawlerResult = await depthSearch(url, depth);
  }
  else {
    crawlerResult = await invokeCrawler(url);
  }

  res.send(crawlerResult);

});

app.get('/scraper', (req, res) => {
  // data = { search_url: '',
  //          search_type: 'breadth_search',
  //          search_depth: '' }
  var webScraper = new WebScraper(data);
  Crawl.parsedLinkInfo(webScraper, function (scraper) {
    res.send(scraper.returnJsonData());
  });
});

app.post('/checkURL', async (req, res) => {
  let url = req.body.url;
  try {
    let response = await checkURL(url);
    console.log('/checkURL response: ', response.status);
    let responseObject = { status: response.status };
    res.send(responseObject);
  }
  catch (e) {
    console.error('/checkURL error: ', e);
    let responseObject = { status: 400 };
    res.send(responseObject);
  }
});

app.post('/pastSearchByURL', async (req, res) => {
  let url = req.body.url;

  try {
    let response = await MongoManager.findPastSearchByURL(url);
    if (response === null) {
      response = { _id: null }
    }
    res.send(response);
  }
  catch (e) {
    console.error('/pastSearchByURL error: ', e);
    res.send({ ErrorMessage: MongoManager.GENERIC_SEARCH_ERROR });
  }
});

app.post('/pastSearchByID', async (req, res) => {
  let id = req.body.id;

  try {
    let response = await MongoManager.findPastSearchById(id);
    console.log('pastSearchByID response: ', response);
    if (response === null) {
      response = { _id: null }
    }
    res.send(response);
  }
  catch (e) {
    console.error('/pastSearchByID error: ', e);
    res.send({ ErrorMessage: MongoManager.GENERIC_SEARCH_ERROR });
  }
});

app.post('/newDBEntry', async (req, res) => {
  let mongoDTO = createMongoDTO(req.body);
  if (mongoDTO === null) {
    res.sendStatus(400);
  }
  let mongoResult = await MongoManager.createNewEntry(mongoDTO);
  res.send(mongoResult);
})

app.post('/updateCrawlerData', async (req, res) => {

  let mongoID = req.body._id;

  if (mongoID === null) {
    console.error('updateCrawlerData: passed in _id is null');
    res.sendStatus(400);
  }

  let crawlerResult = await invokeCrawler(req.body.search_url);
  let mongoDTO = {
    depth: req.body.search_depth,
    crawlerData: JSON.stringify(crawlerResult),
    date: dayjs().format()
  }

  const result = MongoManager.updateCrawlerData(mongoID, mongoDTO);
  result.then(data => {
    res.send(crawlerResult)
  })
});

app.get('/getPastSearch', async (req, res) => {
  let id = req.query.id;
  let search = await MongoManager.findPastSearchById(id);
  res.send(search);
})

app.listen(app.get('port'));
console.log('Express server listening on port ' + PORT);

async function invokeCrawler(url) {
  let crawler = fork('./lib/crawler.js');

  return new Promise((resolve, reject) => {

    crawler.send({ url: url });
    crawler.on('message', result => {
      resolve(result);
    })
  })
}

async function checkURL(url) {
  return new Promise((resolve, reject) => {
    axios.head(url)
      .then(response => {
        resolve(response)
      })
      .catch(err => reject(err))
  })
}

function createMongoDTO(reqBody) {

  return {
    url: reqBody.search_url,
    search_type: reqBody.search_type,
    depth: reqBody.search_depth,
    date: dayjs().format(),
    crawlerData: reqBody.crawlerData
  }
}

app.get('/crawlertest', async (req, res) => {

  depthSearch('http://www.google.com', 3);

})

async function depthSearch(rootURL, searchDepth) {

  let depth = 1;

  let rootResult = await invokeCrawler('http://www.google.com');
  console.log("ROOTRESULT LINKS: ", rootResult);

  //updateRootNode(rootNode, rootResult);
  let rootNode = createNode(rootResult, rootURL, rootURL, depth);

  let pagesToVisit = getLinkURLs(rootResult.links);
  let randomLink = getRandomLink(pagesToVisit, []);

  let visitedPages = [rootURL];
  let pageQueue = [randomLink];
  let parentQueue = [rootURL];

  //TODO: PREVENT VISITING LINKS TWICE
  while (depth < searchDepth) {
    depth++;
    console.log('NEW DEPTH: ', depth);
    
    if (pageQueue.length < 1) {
      break;
    }

    let thisParent = parentQueue.pop();
    let newLink = pageQueue.pop();

    let childResult = await invokeCrawler(newLink);
    visitedPages.push(newLink);

    let childNode = createNode(childResult, thisParent, newLink, depth);
    rootNode.children.push(childNode);

    let childLinks = getLinkURLs(childResult.links);
    let nextLink = getRandomLink(childLinks, visitedPages);
    console.log(nextLink);

    pageQueue.push(nextLink);
    parentQueue.push(nextLink);
  }

  return rootNode;
}

function getLinkURLs(linkArray) {
  let justURLs = linkArray.map(url => {
    return url.url;
  })

  return justURLs;
}

function getRandomLink(linkArray, visitedLinks) {
  let randomIndex = Math.floor(Math.random() * linkArray.length - 1);
  let randomLink = linkArray[randomIndex];
  console.log(randomLink);
  if (visitedLinks.includes(randomLink)) {
    console.log('found redundant link');
    linkArray = linkArray.filter(x => x !== randomLink);
    return getRandomLink(linkArray, visitedLinks);
  }
  else {
    return randomLink;
  }
}

function createNode(crawlerResult, parent, url, depth) {

  let newNode = crawlerResult;
  newNode.depth = depth;
  newNode.parent = parent;
  newNode.self = url;

  return newNode;

}