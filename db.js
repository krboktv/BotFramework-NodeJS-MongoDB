var mongoose = require("mongoose");
var ObjectID = require("mongodb").ObjectID;
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

// Функция, которая принимает сумму, адрес1 и условие
function addValuesToDatabase(name,country,age) {
    // Create new human
    Person.create({name: name, country: country, age: age}, function(err, doc){
        if(err) return console.log(err);
        console.log("Person are created:", doc);
    });
}

function addAddress2(numOfArgue, address2) {
    // Находим спор с таким номером
    var thisArgue;
    var findArgue = Argue.find({num: numOfArgue}, function(err, docs){
        if(err) return console.log(err);
    });
    
    // Получаем данные спора
    setTimeout(function() {
        findArgue.exec(function(err,res) {
            thisArgue = res[0]._id;

            // Добавляем адрес второго человека, желающего участвовать в споре
            var Address2Argue = Address2.create({refArgue: thisArgue, address2: address2}, function(err, doc){
                if(err) return console.log(err);
                console.log("Добавлен второй адрес:", doc);
            });

            // Получаем id 2-го адреса
            var lastA;
            var lastAddress = Address2.find({}, function(err, docs){
                if(err) return console.log(err);
            }).sort({_id: -1}).limit(1);

            // Добавляем в спор id адреса 2
            setTimeout(function() {
                lastAddress.exec(function(err,res) {
                    Argue.update({_id: ObjectID(thisArgue)},{address2ID: res[0]._id}, {upsert: true}, function(err){
                        if(err) return console.log(err);
                    });
                });

                // Посмотрим наш спор
                setTimeout(function() {
                    var findArgue = Argue.find({}, function(err, docs){
                        if(err) return console.log(err);
                        console.log("Споры: "+docs);
                    });
                }, 500);
            },1000);
        });
    },500);
}

function showPreArgue() {
    var args;
    // Находим споры без вторых адресов
    var findArgue = Argue.find({address2ID: ""}, function(err, docs){
        if(err) return console.log(err);
    });
    setTimeout(function() {
        // Возвращаем массивчик с номером спора, именем и id суммы.
        findArgue.exec(function(err,res) {
            args = new Array(res.length);
            for(var e = 0; e<args.length; e++) {
                args[e] = new Array(3);
            }

            for(var i = 0; i<res.length; i++) {
                args[i][0] = res[i].num;
                args[i][1] = res[i].name;
                args[i][2] = res[i].sumID;
            }
            return args;
        });        
    },500);
    setTimeout(function(){/*onsole.log(args[21][2]);*/return args;}, 1000);
    
}

// setTimeout(function(){console.log("Пятый нах "+showPreArgue())},3000);



function showArgue() {
    // Находим споры текущие
    var findArgue = Argue.find({address2ID: {$ne: ""}}, function(err, docs){
        if(err) return console.log(err);
        console.log(docs);
    });
}

function endArgue(numEnd) {
    // Завершённые споры 
    Argue.update({num: numEnd},{active: false}, {upsert: true}, function(err){
        if(err) return console.log(err);
    });
}

// module.exports.addAddress1 = addAddress1;
// module.exports.addAddress2 = addAddress2;
// module.exports.addSum = addSum;
// module.exports.addArgue = addArgue;
module.exports.addValuesToArgue = addValuesToArgue;
module.exports.addAddress2 = addAddress2;
module.exports.showPreArgue = showPreArgue;
module.exports.showArgue = showArgue;
module.exports.endArgue = endArgue;
