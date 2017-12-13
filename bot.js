var restify = require('restify');
var builder = require('botbuilder');
var database = require("./db.js");
var mongoose = require("mongoose");
var ObjectID = require("mongodb").ObjectID;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var inMemoryStorage = new builder.MemoryBotStorage();

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Hi! I am Bot. I can write your word in database!");
        session.beginDialog('rootMenu');
    },
    function (session, results) {
        session.endConversation("See you later:)");
    }
]).set('storage', inMemoryStorage); // Register in memory storage

// Add root menu dialog
bot.dialog('rootMenu', [
    function (session) {
        builder.Prompts.choice(session, "Choose point:", 'Create new person|Created persons');
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog('CreatePerson');
                break;
            case 1:
                session.beginDialog('CreatedPersons');
                break;
            default:
                session.endDialog();
                break;
        }
    },
    function (session) {
        // Reload menu
        session.replaceDialog('rootMenu');
    }
]).reloadAction('showMenu', null, { matches: /^(menu|back)/i });

bot.dialog('CreatePerson', [
    function (session, args) {
        builder.Prompts.text(session, "Enter your name");
    },
    function(session, results) {
            session.userData.name = results.response;
            builder.Prompts.text(session, "Hello," + results.response +"! Enter your country");
    },
    function(session, results) {
        session.userData.country = results.response;
        builder.Prompts.number(session, session.userData.name + ", how old are you?");
    },
    function (session, results) {
        session.userData.age = results.response;
        database.addValuesToDatabase(session.userData.name,session.userData.country,session.userData.age);
        session.endDialog("Create new Person. Name: " + session.userData.name + 
        ". Country: " + session.userData.country + "Age :" + results.response + ".");
    }
]);

// Roll some dice
bot.dialog('CreatedPersons', [
    function (session, args) {    
        var objNum;   
        var findArgue = Argue.find({address2ID: ""}, function(err, docs){
            if(err) return console.log(err);
        });
        setTimeout(function() {
            // Возвращаем массивчик с номером спора, именем и id суммы.
            findArgue.exec(function(err,res) {
                console.log(res[1]);
                objNum = new Array(res.length);
                for(var e = 0; e<objNum.length; e++) {
                    objNum[e] = new Array(3);
                }
    
                for(var i = 0; i<res.length; i++) {
                    objNum[i][0] = res[i].num;
                    objNum[i][1] = res[i].name;
                    objNum[i][2] = res[i].sumID;
                    Sum.find({id_: ObjectID(res[i].num)}, function(err, docs){
                        if(err) return console.log(err);
                    }).sort({_id: -1}).limit(1);
                    
                    if(i<res.length-1)
                        argueString+=("Номер: "+res[i].num+". Название: "+res[i].name+"|");
                    else 
                        argueString+=("Номер: "+res[i].num+". Название: "+res[i].name);
                        console.log(argueString.toString());
                }
            });
            setTimeout(function() {builder.Prompts.choice(session, "Выберете cпор:", argueString); },500);      
        },100); 
    },
    function (session, results) {
        switch (results.response.index) {
            default:
                session.userData.index = results.response.index;
                session.beginDialog('AddAddress2');
                break;
        }
    }
]);

bot.dialog('AddAddress2', [
    function (session, args) { 
        builder.Prompts.text(session, "Введите ваш адрес сети Ethereum"); 
        
    },
    function(session, results) {
        session.userData.addr2 = results.response;
        justDB.addAddress2(session.userData.index+1,results.response);
        builder.Prompts.number(session, "Введите ваше число от 1 до 10. Если оно будет ближе к сгенерированному случайному числу, то вы победите!"); 
    },
    function(session, results) {
        session.userData.val2 = results.response;
        // var ggg1 = Argue.find({num: session.userData.index+1}, function(err, docs){
        //     if(err) return console.log(err);
        // }).sort({_id: -1}).limit(1);

        // setTimeout(function() {ggg1.exec(function(err,res){
        //     var heh = res[0]._id;
        //     var ddd = Address2.find({refArgue: heh},function(err,docs){}).sort({_id: -1}).limit(1);
        //     setTimeout(function(){
        //             ddd.exec(function(err,res1){
        //                 console.log("ДОБАВЛЕННАЯ REF ССЫЛКА"+res1);
        //                 Argue.update({_id: ObjectID(res1[0].refArgue)},{address2ID: res1[0]._id, val2: session.userData.val2}, {upsert: true}, function(err){
        //                     if(err) return console.log(err);
        //             });
        //         },200); 
        //     },200);            
        //     });
        // },500);
        setTimeout(function(){   var ggg2 = Argue.find({num: session.userData.index+1}, function(err, docs){
            if(err) return console.log(err);
        }).sort({_id: -1}).limit(1);
         // Передаём в трюфель

         setTimeout(function(){ggg2.exec(function(err,res){
            console.log("Ты то хоть работаешь "+res[0].address2ID);
            var valToExport = [];
            var ad1 = Address1.find({_id: ObjectID(res[0].address1ID)},function (err,docs){
                if(err) return console.log(err);
            });
            var ad2 = Address2.find({_id: ObjectID(res[0].address2ID)},function (err,docs){
                if(err) return console.log(err);
            });
            var s1 = Sum.find({_id: ObjectID(res[0].sumID)},function (err,docs){
                if(err) return console.log(err);
            });
            setTimeout(function(){
                ad1.exec(function(err,res) {
                    valToExport[0] = res[0].address1;
                });
                ad2.exec(function(err,res) {
                    valToExport[1] = res[0].address2;
                });
                s1.exec(function(err,res) {
                    valToExport[2] = res[0].sum;
                });

            },300);
            valToExport[3] = res[0].val1;
            valToExport[4] = res[0].val2;
            function pls() {
            setTimeout(function(){
                console.log("Передали значения:"+valToExport);
            },1000); 
        }
        // pls();
        module.exports.pls = pls;
        },700);
         });
        
        setTimeout(function(){
            var ggg = Argue.find({}, function(err, docs){
                if(err) return console.log(err);
            }).sort({_id: -1});
            setTimeout(function (){ggg.exec(function(err,res){console.log(res)})},100);
            session.endDialog("Вы участвуете в споре!");
        },100);},500);
     
    }
]);

// Magic 8-Ball
bot.dialog('magicBallDialog', [
    function (session, args) {
        builder.Prompts.text(session, "What is your question?");
    },
    function (session, results) {
        // Use the SDK's built-in ability to pick a response at random.
        session.endDialog(magicAnswers);
    }
]);

var magicAnswers = [
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes, definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    "Reply hazy try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful"
];
// module.exports.valToExport = valToExport;
