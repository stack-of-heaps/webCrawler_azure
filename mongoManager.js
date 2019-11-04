const Mongo = require('./mongoModule.js');
const ObjectID = require('mongodb').ObjectID;
const dayjs = require('dayjs');

module.exports.GENERIC_SEARCH_ERROR = 'Sorry, there was an error checking the database. Try your search again.';

/*ASYNC findPastSearchByURL(URL): When user submits a search request, check to see if we already
have that URL in the DB.
Returns false if not found
Returns search if found
TODO: Along with  FINDPASTSEARCH below, construct DTO to handle return of search object.
*/
module.exports.findPastSearchByURL = async url => {

    return new Promise((resolve, reject) => {
        const collection = Mongo.getCollection();
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

/*
FINDPASTSEARCH(URL): Find past search by ID
Returns false if none found; returns search otherwise
TODO: Return object populated with search details {
    url,
    date,
    depth,
    json
}
*/
module.exports.findPastSearchById = async (id) => {

    return new Promise((resolve, reject) => {

        let collection = Mongo.getCollection();
        let objectID = new ObjectID(id);
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

    return new Promise((resolve, reject) => {

        const collection = Mongo.getCollection();
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

module.exports.updateEntryJSON = async (id, crawlerData) => {
    let objectID = new ObjectID(id);
    console.log('updateentryjson: crawlerData', cralwerData);

    return new Promise((resolve, reject) => {

        const collection = Mongo.getCollection()
        collection.updateOne(objectID, crawlerData, (err, res) => {
            if (err) {
                console.error('UpdateEntryJSON: ', err);
                reject(err);
            }
            else {
                console.log('Added JSON data to entry with id: ', id);
                resolve(res);
            }
        })
    })
}

module.exports.updateEntryDate = async (id) => {
    let currentDate = dayjs().format();
}

module.exports.updateEntryJSON = (id) => {

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