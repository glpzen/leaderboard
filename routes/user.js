const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const userController = new UserController();


router.get('/', function (req, res) {
    userController.index(req, res);
});

module.exports = router;