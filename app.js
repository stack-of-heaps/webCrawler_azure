// This is a complete version which still needs a view to display
// const links = require('./data/links.js');
const WebScraper = require('./lib/web_scraper.js');
const Chart = require('./lib/hierarchy_chart.js');
const Mongo = require('./mongoModule');
const axios = require('axios');
var express = require('express');
var path = require('path');
const dayjs = require('dayjs');
const MongoManager = require('./mongoManager');
const PORT = 3000;
var app = express();
app.set('port', PORT);
app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

Mongo.connect()
  .then(() => console.log('Connected to database.'))
  .catch((e) => console.error(e));

app.get('/', (req, res) => {
  response.sendFile(path.join(__dirname + '/public/index.html'));
});

// <-- PARTIALS -->
app.get('/sidePanel', (req, res) => {
  console.log('sidepanel hit');
  res.sendFile(path.join(__dirname + '/partials/sidePanel.html'))
});

app.get('/sidePanelTutorial', (req, res) => {
  res.sendFile(path.join(__dirname + '/partials/sidePanelTutorial.html'))
});

app.get('/pastSearches', (req, res) => {
  console.log('pastsearches hit');
  res.sendFile(path.join(__dirname + '/partials/pastSearches.html'))
});

app.get('/pastSearchesTutorial', (req, res) => {
  res.sendFile(path.join(__dirname + '/partials/pastSearchesTutorial.html'))
});

// <-- END PARTIALS -->

app.post('/search', (req, res) => {
  console.log('searching with the following info: ');
  var webScraper = new WebScraper("http://google.com");
  webScraper.parsedLinkInfo();
});

app.post('/checkURL', async (req, res) => {
  let url = req.body.url;
  try {
    let response = await checkURL(url);
    console.log('/checkURL response: ', response.status);
    let responseObject = {status: response.status};
    res.send(responseObject);
  }
  catch (e) {
    console.error('/checkURL error: ', e);
    let responseObject = {status: 400};
    res.send(responseObject);
  }
});

/* Successful response object looks like:
{ _id,
  search_type,
  depth,
  date }
  No results found object looks like:
  {_id = null }
  */
app.post('/pastSearchByURL', async (req, res) => {
  let url = req.body.url;

  try {
    let response = await MongoManager.checkForExistingEntry(url);
    console.log('pastSearchByURL response: ', response);
    if (response === null) {
      response = { _id: null}
    }
    res.send(response);
  }
  catch (e) {
    console.error('/pastSearchByURL error: ', e);
    res.send({ ErrorMessage: MongoManager.GENERIC_SEARCH_ERROR });
  }
});

app.post('/crawlerRequest', async (req, res) => {

  let searchURL = req.body.search_url;

  //let x = await MongoManager.checkForExistingEntry();
  let x = await submitPOST(req.body);
  console.log(x);
  /*
  MongoManager.checkForExistingEntry(searchURL)
    .then(existingEntry => {
      if (!existingEntry) {
        checkURL(url)
          .then(urlStatus => {
            if (URLIsOkay(urlStatus)) {
              let mongoDTO = createDTO(req.body);
              submitPOST(mongoDTO);
            }
          })
          //URLStatus
          .catch(err => console.error("Error checking URL status: ", err));
      }
      else {  // Entry exists with given URL
        MongoManager.checkIfStale()

      }
    })
    //existingEntry
    .catch(err => console.error("Error checking if URL already present in DB: ", err))
    */
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

function URLIsOkay(response) {
  let statusCode = response.status;
  if (statusCode >= 200 && statusCode <= 299) {
    return true;
  }
  if (statusCode >= 400) {
    return false;
  }
}

async function submitPOST(reqBody) {
  let mongoDTO = createDTO(reqBody);
  let mongoResult = MongoManager.createNewEntry(mongoDTO);

}

function createDTO(reqBody) {

  return {
    url: reqBody.search_url,
    search_type: reqBody.search_type,
    depth: reqBody.search_depth,
    date: dayjs().format()
  }

}