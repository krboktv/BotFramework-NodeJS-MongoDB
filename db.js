var mongoose = require("mongoose");
var Person = require('./personSchema.js');

mongoose.Promise = global.Promise;

var uri = 'mongodb://localhost:27017/db';
var options = {
    useMongoClient: true,
    autoIndex: true, 
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
  };
var db = mongoose.connect(uri, options).then(console.log('Server works correctly'));

function addValuesToDatabase(name,country,age, sex) {
    // Create new human
    Person.create({name: name, country: country, age: age, sex: sex}, function(err, doc){
        if(err) return console.log(err);
        console.log("Person are created:", doc);
    });
}

function findValuesInDatabase() {
    // Find human
    return new Promise(function(resolve, reject) {
        Person.find({}, function(err, doc){
            if(err) return console.log(err);
        })
            .then(function(res) {
                    resolve(res); 
                });
        
    });
}

module.exports.addValuesToDatabase = addValuesToDatabase;
module.exports.findValuesInDatabase = findValuesInDatabase;