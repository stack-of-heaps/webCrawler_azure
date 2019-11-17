const PORT = 3000;

const depthSearch = require('./lib/depthSearch');
const express = require('express');
const path = require('path');


const app = express();
app.use(express.static('public'));
require('events').EventEmitter.defaultMaxListeners = 15;

const CHECKURL = "/checkURL";
const axios = require('axios');
const http = require('http');
const nUrl = require('url');

async function urlGet(url) {
    console.log("URLPOST");

    return new Promise((resolve, reject) => {
        console.log("$$$$ IN PROMISE");
        let reqUrl = nUrl.parse(url);
        let options = { method: 'HEAD', host: reqUrl.host, port: reqUrl.port, path: reqUrl.pathname };
        http.get(options, (res) => {
            const { statusCode } = res;
            console.log(statusCode);
            resolve(res);
    })
})
}

app.listen(app.get('port'));
console.log('Express server listening on port ' + PORT);

async function foo() {
console.log('hi');
let x = await urlGet('http://www.google.com');
console.log('x: ', x.statusCode);
}

foo();
