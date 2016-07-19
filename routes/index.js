var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res) {
res.render('index');
});


router.get('/:var(liang|IVY|keats|su2c|ngddata|carpten|trent|MMRF|kjensen|AshionDrop)',function(req,res,next){
res.render('tml');
});


module.exports = router;
