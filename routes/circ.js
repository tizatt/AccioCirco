var express = require('express');
var router = express.Router();
var db = require('../connection').db;
var db3 = require('../connection').db3;
var url = require("url");
var queryString = require("querystring");
var request = require('request');
var _ = require('lodash');

process.setMaxListeners(100);
/* GET home page. */
router.get('/', function(req, res, next) {

        db.open(function(err, db1) {


            if (err) {
                console.log("connection issues");
            } else {

                console.log("connect");

                var col = db1.collection('tumor');
                var study_col = db1.collection('files');
                
                study_col.distinct('study', {'status':1}, function(err, dist) {
                            
                        res.render('circ', {
                             
                             dist_study: dist.sort(function (a, b) {
                                            return a.toLowerCase().localeCompare(b.toLowerCase());
                             })

                        });
                         db.close();


                });

            }

        });


});



   var getStudyPatients = function(queryObj, ok){
        db.open(function(err, db1) {


        if (err) {
            console.log("connection issues");
        } else {

            console.log("connect");
            
            var col = db1.collection('files');
            var study = "'"+queryObj+"'";
            col.aggregate([

                    {
                        $match: {
                            "study" : queryObj,
                            "status" : 1
                        }
                    },
                    { 
                        $group : { _id : "$studyPatient" } 
                    },          
                    {
                        $project: {
                          "studyPatient" : "$_id.studyPatient"
                        }
                    },
                    {
                        $sort: {
                        "_id" : 1
                        }
                    }
            ]).toArray(function(err, docs) {
                    //console.log(docs);
                    db.close();

                    ok( docs );    
            });
        };
    });
   }


   var getSigVariants = function(queryObj, ok) {
        db.open(function(err, db1) {


        if (err) {
            console.log("connection issues");
        } else {

            console.log("connect");
            
            var col = db1.collection('tumor');
            var studyPatient = "'"+queryObj+"'";
            col.aggregate([

                    {
                        $match: {
                            "studyPatient" : queryObj,
                            "impact" : "significant",
                            "aberration.aberration_filter" : "PASS",
                            $or: [{"drug_rule_matched_flag" : 1},{"geneInfo.level2" : {$exists : true}}],
                            $nor : [{"type":"OverExpressed"},{"type":"UnderExpressed"},{"type":"variant"}]
                        }
                    },          
                    {
                        $project: {
                            "gene" : 1,
                            "chrPos" : 1,
                            "effect" : 1,
                            "drug_rule_matched_flag" : 1,
                            "geneInfo.level2" : 1,
                            "type" : 1,
                            'variants.qual' : 1,
                            "filename" : 1,
                            "filetype" : 1,
                            "cuffdiffLOG2FC" : 1,
                            "cuffDiffPVALUE" : 1,
                            "deseqLOG2FC" : 1,
                            "deseqPVALUE" : 1,
                            "AR1" : 1,
                            "AR2" : 1,
                            "_id": 0
                        }
                    },
                    {
                        $sort: {
                        "chrPos" : 1
                        }
                    }
            ]).toArray(function(err, docs) {
                    //console.log(docs);
                    db.close();

                    ok( docs );    
            });
        };
        });
    };





var getTranslocations = function(queryObj, ok){
 db.open(function(err, db1) {


        if (err) {
            console.log("connection issues");
        } else {

            console.log("connect");
            
            var col = db1.collection('tumor');
            var studyPatient = "'"+queryObj+"'";
            col.aggregate([

                    {
                        $match: {
                            "studyPatient" : queryObj,
                            "aberration.aberration_filter" : "PASS",
                            "type" : "StructuralVariant"
                        }
                    },
                    {
                        $unwind : "$variants"
                    },  
                    {
                        $match: {
                            "variants.filter" : "PASS"
                        }
                    },        
                    {
                        $project: {
                            "variants.SvCoordinate" : 1,
                            "variants.qual" : 1,
                            "gene" : 1,
                            "effect" : 1,
                            "drug_rule_matched_flag" : 1,
                            "geneInfo.level2" : 1,
                            "type" : 1,
                            "filename" : 1,
                            "filetype" : 1,
                            "dbFreq" : 1,
                            "_id": 0
                        }
                    }
            ]).toArray(function(err, docs) {
                    //console.log(docs);
                    db.close();

                    ok( docs );    
            });
        };
    });
}



var getCNA = function(queryObj, ok){

 db3.open(function(err, db1) {
    

        if (err) {
            console.log("connection issues");
        } else {

            console.log("connect");
            
            var col = db1.collection('cna');
            var studyPatient = "'"+queryObj+"'";
            col.aggregate([
                    {
                        $match: {
                            "studyPatient" : queryObj
                        }
                    },
                    {    
                        $project: {
                            "studyPatient" : 1,
                            "log2fc" : 1,
                            "start" : 1,
                            "end" : 1,
                            "chr" : 1,
                            "filename" : 1
                        }

                    }     
            ]).toArray(function(err, docs) {
                    //console.log(docs);
                    db3.close();
                    ok( docs );    
            });
        };
    });
}


router.get('/sigSNVs', function(req, res, next){
    var query = req.query.qy;
    var ok = function(r_js) {
        res.json(r_js);
    }
    getSigVariants(query, ok);

    
});

router.get('/translocations', function(req, res, next){
    var query = req.query.qy;
    var ok = function(r_js) {
        res.json(r_js);
    }
    getTranslocations(query, ok);
});



router.get('/cna', function(req, res, next){
    var query = req.query.qy;
    var ok = function(r_js) {
        res.json(r_js);
    }

    getCNA(query, ok);
});



router.get('/studyPatients', function(req, res, next) {
    var query = req.query.qy;
    var ok = function(r_js) {
        res.json(r_js);
    }
    getStudyPatients(query, ok);
});








module.exports = router;