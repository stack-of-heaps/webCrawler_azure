// app.js

app.on('/request', (req, res) => {
    const crawler = fork('crawler.js');
    crawler.send('start'); // this is the message which triggers doWork()
    crawler.on('message', result => {
        res.send(result);
    })
})



// crawler.js


process.on('message', (msg) => {
    const workResult = doWork();
    process.send(workResult);;
});