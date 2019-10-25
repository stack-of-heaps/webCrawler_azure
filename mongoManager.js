const Mongo = require('./mongoModule.js');
const ObjectID = require('mongodb').ObjectID;

module.exports.checkForExistingEntry = (url) => {

}

module.exports.checkEntryFreshness = (date) => {

}

module.exports.getEntry = (url) => {
}

/*
entryObject = {
    date: datetimeobj,
    url: string,
    search_depth: int
}
*/
module.exports.createNewEntry = (entryObject) => {

}

module.exports.updateEntryDate = (entryObject) => {

}

module.exports.updateEntryJSON = (entryObject) => {

}

module.exports.getAllSearches = () => {
    let collection = Mongo.get().collection('test');
    collection.find({}).toArray((err, results) => {
        console.log(results);
    })

}

module.exports.findPastSearch = (id) => {
    let collection = Mongo.get().collection('test');
    let objectID = new ObjectID(id);
    collection.findOne({_id: objectID}, (err, res) => {
        if (err) {
            console.error("Couldn't find object with id: ", id);
            return false;
        }
        else {
            if (res === null) {
                console.log('No object wth that ID.');
                return false;
            }
            else {
                console.log('Search by ObjectID successful.');
                console.log(res);
            }
        }
    });
}