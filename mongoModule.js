const mongo = require('mongodb').MongoClient;
const mongoURL = 'mongodb://localhost:27017';
const dbName = 'WebCrawler';
const defaultCollection = 'searches';
let client = null;

module.exports.connect = () => new Promise((resolve, reject) => {
    mongo.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, connection) => {
        if (err) {
            reject(err);
        }
            resolve(connection);
            client = connection.db(dbName);
    });
});

module.exports.get = () => {
    if (client === null) {
        console.error('No connection to MongoDB exists.');
    }

    return client;
}

