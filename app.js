// This is a complete version which still needs a view to display
var express = require('express');
var path = require('path');
var app = express();
const PORT = 3000;
app.use(express.static('public'));

app.get('/', (req, res) => {
  response.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/sidePanel', (req, res) => {
  console.log('sidepanel hit');
  res.sendFile(path.join(__dirname + '/partials/sidePanel.html'))
});

app.get('/pastSearches', (req, res) => {
  console.log('pastsearches hit');
  res.sendFile(path.join(__dirname + '/partials/pastSearches.html'))
});

app.set('port', PORT);

app.listen(app.get('port'));
console.log('Express server listening on port ' + PORT);
//app.use('/', index)
//app.use('/charts', charts)