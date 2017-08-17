/*
 *  Copyright (c) 2016 by The Translational Genomics Research
 *  Institute. All rights reserved. This License is limited to, and you may
 *  use the Software solely for, your own internal and non-commercial use
 *  for academic and research purposes. Without limiting the foregoing, you
 *  may not use the Software as part of, or in any way in connection with
 *  the production, marketing, sale or support of any commercial product or
 *  service or for any governmental purposes. For commercial or governmental
 *  use, please contact dcraig@tgen.org. By installing this Software you are
 *  agreeing to the terms of the LICENSE file distributed with this
 *  software.
 *           
*/

var express = require('express');
var router = express.Router();
var db = require('../connection')._db2;


router.get('/', function(req, res, next) {
    res.render('tml');
});





router.post('/dups',function(req,res,next){

    var collection = req.body.mc + "_lRp";
    collection = collection.toString();
    if(collection){

        db.open(function(err, db1) {
           db1.collection(collection, function(err, du2) {

            if(!err){

                du2.find({"aalt":{$exists:true},"size":{$gt:1000000000}}).toArray(function(err, data) {
                    res.json(data);
                    db1.close();
                });

            }


            });
        });

}

});




router.post('/ls', function(req, res, next) {

    var path = req.body.ls + ":";
    var collection = req.body.mc + "_lRp";


if(collection){


    db.open(function(err, db1) {



        db1.collection(collection, function(err, du2) {

            if(!err){

            du2.find({
                "path": path
            }, {
                "sort": [
                    ['size', 'desc']
                ]
            }).limit(128).toArray(function(err, data) {
                res.json(data);
                db1.close();
            })


        }




        });





    });

}


});


router.post('/tmdata_update', function(req, res, next) {


    var o = req.body.item;

    db.open(function(err, db1) {
        db1.collection(o, function(err, du2) {

            if(!err){
            du2.find({}, {
                _id: 0
            }).toArray(function(err, data) {
                console.log(data);
                res.json(data);
                db1.close();
            })
            }
            else{
                console.log("issue connecting");
            }
        });
    });



});

module.exports = router;
