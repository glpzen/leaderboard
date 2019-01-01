const UserModel = require('../models/UserModel');
var faker = require('faker');

class UserController {

    index(req, res) {
        let path = require('path');
        res.sendFile(path.resolve('views/index.html'));
    }

    updateCoinsForOnlineUsers() {
        let skipNumber = Math.floor(Math.random() * Math.floor(3000));

        UserModel.find().skip(skipNumber).limit(10).exec(
            function (err, result) {
                if (err) {
                    throw new Error("Online users not found!");
                }

                result.forEach(function (user) {
                    var query = {_id: user._id};
                    let randomCoin = Math.floor(Math.random() * Math.floor(5));
                    UserModel.findOneAndUpdate(query, {$inc: {coin: randomCoin}}, function (err, updatedUser) {
                        if (err) {
                            throw new Error("Online users were not be updated.!");
                        }
                    })
                });
            });
    };

    createUser() {

        var userCount = process.env.USER_COUNT;
        for (let i = 0; i < userCount; i++) {
            var randomName = faker.name.findName();
            var randomAge = faker.random.number({
                'min': 18,
                'max': 100
            });

            let user = new UserModel(
                {
                    name: randomName,
                    age: randomAge,
                    coin: 0,
                    score: 0,
                    last_score: 0
                }
            );

            user.save(function (err) {
                if (err) {
                    throw new Error('An unexpected error has occurred while creating user!');
                }
            });
        }
    };

    getLeaderBoardUsers(currentUserId) {

        return new Promise(function (resolve, reject) {
            UserModel.find().sort({score: 'asc'}).limit(100).exec(async function (err, result) {
                if (err) {
                    throw new Error("Online users not found!!");
                }

                let currentUser = await UserModel.find({_id: currentUserId}).exec();
                let currentUserScore = currentUser[0].score;

                if (100 < currentUserScore) {
                    var preScore = currentUserScore - 2;
                    var postScore = currentUserScore + 3;
                    var users = await UserModel.find({$and: [{score: {$gte: preScore}}, {score: {$lte: postScore}}]}).sort({score: 'asc'}).exec();
                    result = result.concat(users);
                }

                resolve(result);

            });
        })


    }

    updateScoreAndLastScore() {
        UserModel.find().sort({coin: 'desc'}).exec(
            function (err, result) {
                if (err) {
                    throw new Error("Online users not found!");
                }

                var orderNumer = 1;
                result.forEach(function (user) {
                    var query = {_id: user._id};
                    UserModel.findByIdAndUpdate(query, {$set: {score: orderNumer, last_score: user.score}}).exec();
                    orderNumer++;
                });
            });
    }

    async distrubuteCoinToLeaderUsers() {

        var totalCoin = await UserModel.aggregate().group({_id: null, maxCoin: {$sum: '$coin'}}).exec();
        var totalCoin = (totalCoin[0].maxCoin) * 0.02;

        var i = 0;
        var percentage = 0;
        UserModel.find().sort({coin: 'desc'}).limit(100).exec(function (err, result) {
            result.forEach(function (user) {
                i++;
                if (1 === i) {
                    percentage = 0.20;
                }
                else if (2 === i) {
                    percentage = 0.15;
                }
                else if (3 === i) {
                    percentage = 0.10;
                }
                else {
                    percentage = ((i - 1)) / 100;
                }
                totalCoin = totalCoin - (totalCoin * percentage);

                var query = {_id: user._id};
                UserModel.findByIdAndUpdate(query, {$inc: {coin: totalCoin}}).exec();
            });
        });


    }
}

module.exports = UserController;