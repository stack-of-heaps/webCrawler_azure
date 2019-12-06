const mongo = require('mongodb').MongoClient;
const localMongo = 'mongodb://localhost:27017';
const atlasMongo = 'mongodb+srv://rico:suave@webcrawler-pwuoh.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'WebCrawler';
const COLLECTIONS = require('./collections');
let client = null;

module.exports.connect = () => new Promise((resolve, reject) => {
    mongo.connect(atlasMongo, {
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

module.exports.getCollection = (collection) => {
    if (client === null) {
        console.error('No connection to MongoDB exists.');
    }

    switch (collection) {
        case COLLECTIONS.DEPTH_SEARCH:
            return client.collection(COLLECTIONS.DEPTH_SEARCH);
        case COLLECTIONS.BREADTH_SEARCH:
            return client.collection(COLLECTIONS.BREADTH_SEARCH);
    }
}