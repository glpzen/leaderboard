const mongoose = require('mongoose');
var faker = require('faker');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name: {type: String, required: true, max: 100},
    age: {type: Number, required: true},
    coin: {type: Number, required: true},
    score: {type: Number, required: true},
    last_score: {type: Number, required: true},
}, {collection: 'users'});


class UserModel {

}

UserSchema.loadClass(UserModel);


// Export the model
module.exports = mongoose.model('UserModel', UserSchema);