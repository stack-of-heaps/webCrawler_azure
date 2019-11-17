const mongo = require('mongodb').MongoClient;
const localMongo = 'mongodb://localhost:27017';
const atlasMongo = 'mongodb+srv://rico:suave@webcrawler-pwuoh.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'WebCrawler';
const DEFAULT_COLLECTION = 'searches';
let client = null;

module.exports.connect = () => new Promise((resolve, reject) => {
    mongo.connect(localMongo, {
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

module.exports.getCollection = () => {
    if (client === null) {
        console.error('No connection to MongoDB exists.');
    }

    return client.collection(DEFAULT_COLLECTION);
}

module.exports.getAll = () => {
}
