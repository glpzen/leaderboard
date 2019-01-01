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

// Should be run one time for insert user to the db.
userController.createUser();


cron.schedule('* * * * *', () => {
    console.log('updateCoinsForOnlineUsers - running a task every second');
    userController.updateCoinsForOnlineUsers();
});

cron.schedule('0 0 1-31 * *', () => {
    console.log('updateScoreAndLastScore - At 00:00 on every day-of-month from 1 through 31.');
    userController.updateScoreAndLastScore();
});

cron.schedule('0 0 * * 7', () => {
    console.log('distrubuteCoinToLeaderUsers - At 00:00 on Sunday.');
    userController.distrubuteCoinToLeaderUsers();
});


cron.schedule('* * * * * *', () => {
    console.log('getLeaderBoardUsers - At every second from 1 through 59.');
    var currentUserId = '5c2bae15255f89673bf9fd6a';
    userController.getLeaderBoardUsers(currentUserId).then(function (users) {
        io.emit('leader-board', {users: users});
    }, function (err) {
        console.log(err);
    });
});


