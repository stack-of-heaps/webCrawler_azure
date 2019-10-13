var express = require('express')
var app = express()

// Cache middleware setup
// app.get('/products', cacheMiddleware(30), function(req, res){

app.get('/', function(req, res){
  res.render('charts');
});

app.put('/show', function(req, res, next){
  res.render('charts/show');
});
