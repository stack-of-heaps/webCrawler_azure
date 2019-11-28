const Mongo = require('./mongoModule.js');
const ObjectID = require('mongodb').ObjectID;
const dayjs = require('dayjs');
const COLLECTIONS = require('./collections');

module.exports.GENERIC_SEARCH_ERROR = 'Sorry, there was an error checking the database. Try your search again.';

module.exports.findPastSearchByURL = async (url, search_type) => {

    let collectionName = getCollectionName(search_type);
    return new Promise((resolve, reject) => {
        const collection = Mongo.getCollection(collectionName);
        collection.findOne({ url: url }, (err, res) => {
            if (err) {
                console.error("findPastSearchByURL: ", err);
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
}

module.exports.findPastSearchById = async (id) => {

    let collections = COLLECTIONS.ALL_COLLECTIONS;

    while (collections.length) {
        let collectionToSearch = collections.pop();
        let result = await searchCollectionById(id, collectionToSearch);
        if (result) {
            return result;
        }
    }

    return null;
}

async function searchCollectionById(id, collectionName) {

    return new Promise((resolve, reject) => {
        let collection = Mongo.getCollection(collectionName);
        let objectID = createMongoID(id);
        collection.findOne(objectID, (err, res) => {
            if (err) {
                console.error("FindPastSearchById: ", err);
                reject(err);
            }
            else {
                if (res === null) {
                    resolve(false);
                }
                else {
                    resolve(res);
                }
            }
        });
    })

}
//Checks if existing entry search data is older than 48 hours.
//Returns true if so; false if not.
module.exports.entryStale = (entry) => {

    const MAX_HOURS = 48;
    let dateNow = dayjs.format();
    let entryDate = dayjs(entry.date);
    let difference = dateNow(entryDate, 'hours');

    return difference > MAX_HOURS ? true : false;
}

module.exports.createNewEntry = async (mongoDTO) => {

    let collectionName = getCollectionName(mongoDTO.search_type);

    return new Promise((resolve, reject) => {

        const collection = Mongo.getCollection(collectionName);
        collection.insertOne(mongoDTO, (err, res) => {
            if (err) {
                console.error("createNewEntry: ", err);
                reject({
                    _id: null,
                    error: err
                })
            }
            else {
                console.log("Added new entry in DB: ", res.insertedId);

                resolve({
                    _id: res.insertedId,
                    error: null
                })
            }
        })
    })
}

module.exports.updateCrawlerData = async (id, mongoDTO) => {

    let objectID = createMongoID(id);
    let collectionName = getCollectionName(mongoDTO.search_type);
    const collection = Mongo.getCollection(collectionName);

    try {
        collection.updateOne({ '_id': objectID }, { $set: { 'crawlerData': mongoDTO.crawlerData, 'date': mongoDTO.date, 'depth': mongoDTO.depth } });
    }
    catch (e) {
        console.error('updateCrawler data: ', e);
    }
    return;
}

module.exports.getAllSearches = async () => {

    return new Promise((resolve, reject) => {

        let collection = Mongo.getCollection();
        collection.find({}).toArray((err, results) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(results);
            }
        })
    })
}

function createMongoID(id) {
    try {
        let objectID = new ObjectID(id);
        return objectID;
    }

    catch (e) {
        console.error('Error creating MongoID from ', id);
        return;
    }
}

function getCollectionName(search_type) {
    return search_type === 'depth_search' ? COLLECTIONS.DEPTH_SEARCH : COLLECTIONS.BREADTH_SEARCH;
}