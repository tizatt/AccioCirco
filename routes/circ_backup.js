var express = require('express');
var router = express.Router();
var db = require('../connection')._db2;


router.get('/', function(req, res, next) {
    res.render('circ');
});


module.exports = router;