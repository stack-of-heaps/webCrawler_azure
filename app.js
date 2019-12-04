const PORT = process.env.PORT || 3000;

const axios = require('axios');
const dayjs = require('dayjs');
const depthSearch = require('./lib/depthSearch');
const breadthSearch = require('./lib/breadthSearch');
const myParser = require("body-parser");
const Mongo = require('./lib/mongo/mongoModule');
const MongoManager = require('./lib/mongo/mongoManager');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.use(myParser.json({ limit: '200mb' }));
app.use(myParser.urlencoded({ limit: '200mb', extended: true }));
require('events').EventEmitter.defaultMaxListeners = 100;

app.set('port', PORT);

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
  let depthMaxLinks = 30;
  let breadthMaxLinks = 6;

  if (type === 'depth_search') {
    try {
      crawlerResult = await depthSearch.crawl(url, depth, depthMaxLinks);
    }
    catch (e) {
      console.log('/search error: ', e);
      crawlerResult = null
    }
  }
  else {
    try {
      crawlerResult = await breadthSearch.crawl(url, depth, breadthMaxLinks);
    }
    catch (e) {
      console.log('/search error: ', e);
      crawlerResult = null;
    }
  }
  res.send(crawlerResult);
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
  let search_type = req.body.search_type;

  try {
    let response = await MongoManager.findPastSearchByURL(url, search_type);
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

  const { search_type, search_url, search_depth } = req.body;

  let mongoID = req.body._id;

  if (mongoID === null) {
    console.error('updateCrawlerData: passed in _id is null');
    res.sendStatus(400);
  }

  let crawlerResult;

  if (search_type === 'depth_search') {
    crawlerResult = await depthSearch.crawl(search_url, search_depth);
  }
  else {
    crawlerResult = await breadthSearch.crawl(search_url, search_depth);
  }

  let mongoDTO = {
    depth: req.body.search_depth,
    crawlerData: JSON.stringify(crawlerResult.data),
    date: dayjs().format(),
    search_type: search_type
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