const axios = require('axios');

const checkURL = url => {

    let response = axios.head(url); 
    return response.data();

}

module.exports.urlStatus = async url => {
    await checkURL(url);
}
