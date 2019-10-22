// Cache middleware setup
// app.get('/products', cacheMiddleware(30), function(req, res){

app.get('/', function(req, res){
  res.render('index');
});

app.get('/search', function(req, res){
  res.render('search');
});
