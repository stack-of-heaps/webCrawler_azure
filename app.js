// This is a complete version which still needs a view to display
var express = require('express');
var path = require('path');
var app = express();
app.engine('pug', require('pug').__express)

app.set('port', 3000);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', function(req, res){
  res.render('home');
});

//app.use('/', index)
//app.use('/charts', charts)

app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));
