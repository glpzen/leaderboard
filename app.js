const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
let mongoDB = process.env.MONGODB_URL;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const userRoutes = require('./routes/user');

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', userRoutes);

const port = 3001;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));