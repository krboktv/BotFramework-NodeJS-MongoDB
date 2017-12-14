var restify = require('restify');
var builder = require('botbuilder');
var database = require("./db.js");
var mongoose = require("mongoose");

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
        session.send("Hi! I am Bot. I can write your words in database!");
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
        builder.Prompts.choice(session, "Choose your sex:", 'Male|Female');
    },
    function(session, results) {
        session.userData.sex = results.response.entity;
        builder.Prompts.text(session, "Enter your name");
    },
    function(session, results) {
            session.userData.name = results.response;
            builder.Prompts.text(session, "Hello, " + results.response +"! Enter your country");
    },
    function(session, results) {
        session.userData.country = results.response;
        builder.Prompts.number(session, session.userData.name + ", how old are you?");
    },
    function (session, results) {
        session.userData.age = results.response;
        database.addValuesToDatabase(session.userData.name,session.userData.country,session.userData.age, session.userData.sex);
        session.endDialog("Create new Person. Name: " + session.userData.name + 
        ". Country: " + session.userData.country + ". Age :" + results.response + ".");
    }
]);

var humans = {};

bot.dialog('CreatedPersons', [
    function (session) {
        var t = database.findValuesInDatabase()
        .then(function(res) {
            for(var key in res)  {
                    if(humans[res[key].name]) {
                        humans[res[key].name+"("+key+")"] = res[key]
                    }
                    else {
                        humans[res[key].name] = res[key];
                    }
            }
            console.log(humans);
            builder.Prompts.choice(session, "Look information about person:", humans);
        });
    },
    function (session, results) {
        var sex;
        if(humans[results.response.entity].sex == "Male") 
            sex = "He";
        else if(humans[results.response.entity].sex == "Female")
            sex = "She";
        else 
            sex = "It";

        session.endDialog(
            "This is " + humans[results.response.entity].name +
            ". " + sex + " is " + humans[results.response.entity].age + 
            " and live in " + humans[results.response.entity].country+"."
        );
    }
]);