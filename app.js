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
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: false })) // for parsing application/x-www-form-urlencoded

Mongo.connect()
  .then(() => console.log('Connected to database.'))
  .catch((e) => console.error(e));

app.get('/', (req, res) => {
  response.sendFile(path.join(__dirname + '/public/index.html'));
});

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

app.post('/search', (req, res) => {
  console.log('searching with the following info: ');
  var webScraper = new WebScraper("http://google.com");
  webScraper.parsedLinkInfo();

  // res.sendFile(path.join(__dirname + '/public/searchResults.html'))
});

app.get('/mongotest', (req, res) => {

  const collection = Mongo.get().collection('test');
  collection.insertMany([
    { a: 1 }, { a: 2 }, { a: 3 }
  ], (err, result) => {
    console.log('Success');
    console.log(result);
  });
})

app.get('/mongotest2', (req, res) => {
  let id = "5db27801dd4a63161088106d";
  MongoManager.findPastSearch(id);
})

app.post('/mongopost', (req, res) => {

  let url = req.body.search_url;
  let reqbody = req.body;

  axios.head(url)
    .then(response => {
      let statusCode = response.status;
      if (statusCode >= 200 && statusCode <= 299) {
        let dbResponse = submitPOST(reqbody);

        //TODO:
        //dbResponse is the ID of the new search entry. Use to set pastSearches cookie.
        res.send('Trigger some sort of "Success" message or loading spinner; OK code received from website.');
      }
      if (statusCode >= 400) {
        res.send('Trigger some sort of error handling here. Bad HTTP response.');
      }
    })
    .catch(e => {
      console.log(e);
    })
})

app.listen(app.get('port'));
console.log('Express server listening on port ' + PORT);


function urlCheck(url) {

}

function submitPOST(reqBody) {

  let reqObject = {
    url: reqBody.search_url,
    search_type: reqBody.search_type,
    depth: reqBody.search_depth,
    date: dayjs().format()
  }

  const collection = Mongo.get().collection('test');
  collection.insertOne(reqObject, (err, res) => {
    if (err) {
      console.error("MONGO: ", err);
    }
    else {
      let newEntryID = res.ops.insertedId;
      return newEntryID;
    }
  })
}
