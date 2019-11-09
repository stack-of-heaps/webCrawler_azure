// This is a complete version which still needs a view to display
// const links = require('./data/links.js');
const WebScraper = require('./lib/webScraper.js');
const Crawl = require('./lib/crawl.js');
const SampleData = require('./lib/sampleData.js');
const crawl2 = require('./lib/crawl2.js');

const Mongo = require('./mongoModule');
const MongoManager = require('./mongoManager');
const axios = require('axios');
var express = require('express');
var path = require('path');
const dayjs = require('dayjs');
const PORT = 3000;
var app = express();
app.set('port', PORT);
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

app.get('/crawler2', (req, res) => {
  crawl2.crawl('http://www.xkcd.com');

})

app.post('/search', (req, res) => {
  var data = req.body;
  // res.send(SampleData);
  var webScraper = new WebScraper(data);
  Crawl.parsedLinkInfo(webScraper, function (scraper) {
    res.send(scraper.returnJsonData());
  });
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
  let mongoDTO = createDTO(req.body);
  if (mongoDTO === null) {
    res.sendStatus(400);
  }
  let mongoResult = await MongoManager.createNewEntry(mongoDTO);
  res.send(mongoResult);
})

app.post('/updateCrawlerData', async (req, res) => {

  let data = req.body;
  let mongoID = data._id;
  let newDepth = data.search_depth;
  if (mongoID === null) {
    console.error('updateCrawlerData: passed in _id is null');
    res.sendStatus(400);
  }

  var webScraper = new WebScraper(data);
  Crawl.parsedLinkInfo(webScraper, function (scraper) {
    let mongoDTO = {
      depth: newDepth,
      crawlerData: JSON.stringify(scraper.returnJsonData()),
      date: dayjs().format()
    }

    console.log('updating DB entry');
    const result = MongoManager.updateCrawlerData(mongoID, mongoDTO);
    console.log('between updated and inside then');
    result.then(data => {
      console.log('inside then');
      res.send(scraper.returnJsonData())
    }
    )
  });
})

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

function createDTO(reqBody) {

  return {
    url: reqBody.search_url,
    search_type: reqBody.search_type,
    depth: reqBody.search_depth,
    date: dayjs().format(),
    crawlerData: reqBody.crawlerData
  }
}
