var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var personSchema = new Schema(
    {   
        name: {
            type: String,
            default: "No name"
        },
        country: {
            type: String,
            default: "lost"
        }, 
        age: {
            type: Number,
            default: 0
        },
        sex: {
            type: String,
            default: 'unicorn'
        }
    },
    {versionKey: false}
);

module.exports = mongoose.model('Persons', personSchema);  
