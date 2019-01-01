const express = require('express');
const dotenv = require('dotenv').config();
const cron = require('node-cron');

// mongo initialize
const mongoose = require('mongoose');
let mongoDB = process.env.MONGODB_URL;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const app = express();
const http = require('http').Server(app);


var UserController = require('./controllers/UserController');
var userController = new UserController();


var io = require('socket.io')(http);

http.listen(3002, function () {
    console.log('listening on *:3002');
});

// create users as batch.
// cron.schedule('0,5,10,15,20,25,30,35,40,45,50,55 * * * * *', () => {
//     console.log('running a task every minute - for creating user');
//     userController.createUser();
// });

cron.schedule('* * * * *', () => {
    console.log('updateCoinsForOnlineUsers - running a task every second');
    userController.updateCoinsForOnlineUsers();
});

cron.schedule('* * * * *', () => {
    console.log('updateScoreAndLastScore - running a task every day (m)');
    userController.updateScoreAndLastScore();
});

cron.schedule('5,10,15,20,25,30,35,40,50,55 * * * *', () => {
    console.log('distrubuteCoinToLeaderUsers - running a task every week (m)');
    userController.distrubuteCoinToLeaderUsers();
});


cron.schedule('* * * * *', () => {
    console.log('getLeaderBoardUsers - running a task every 15 seconds');
    var currentUserId = '5c2bae15255f89673bf9fd6a';
    userController.getLeaderBoardUsers(currentUserId).then(function (users) {
        io.emit('leader-board', {users: users});
    }, function (err) {
        console.log(err);
    });
});


