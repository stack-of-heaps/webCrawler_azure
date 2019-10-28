const Mongo = require('./mongoModule.js');
const ObjectID = require('mongodb').ObjectID;
const dayjs = require('dayjs');

/*ASYNC CHECKFOREXISTINGENTRY(URL): When user submits a search request, check to see if we already
have that URL in the DB.
Returns false if not found
Returns search if found
TODO: Along with  FINDPASTSEARCH below, construct DTO to handle return of search object.
*/
module.exports.checkForExistingEntry = async url => {

    return new Promise((resolve, reject) => {
        const collection = Mongo.getCollection();
        collection.findOne({ url: url }, (err, res) => {
            if (err) {
                console.log("err: ", err);
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
module.exports.findPastSearch = async (id) => {

    return new Promise((resolve, reject) => {

        let collection = Mongo.getCollection();
        let objectID = new ObjectID(id);
        collection.findOne(objectID, (err, res) => {
            if (err) {
                console.error("Couldn't find object with id: ", id);
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

    const collection = Mongo.getCollection();
    collection.insertOne(mongoDTO, (err, res) => {
        if (err) {
            console.error("MONGO: ", err);
            return err;
        }
        else {
            let newEntryID = res.insertedId;
            console.log("Added new entry in DB: ", newEntryID);
            return newEntryID;
        }
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

