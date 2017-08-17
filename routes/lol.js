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
var db = require('../connection').db;
var url = require("url");
var queryString = require("querystring");
var request = require('request');
var _ = require('lodash');


process.setMaxListeners(0);
/* GET home page. */
router.get('/', function(req, res, next) {


    db.open(function(err, db1) {


        if (err) {
            console.log("connection issues");
        } else {

            console.log("connect");
            var col = db1.collection('tumor');
            var pr_col = db1.collection('projectRun');

            pr_col.distinct('study', {'status':1}, function(err, dist) {

                pr_col.distinct('projectRun', {'status':1}, function(err, dist2) {

                    console.log(dist2);
                    res.render('lol', {
                         dist_prs: dist,
                         __dist_prs: dist2
                    });
                     db.close();

                });


/*
                res.render('lol', {
                    dist_prs: dist
                });
                db.close();
                */


            });

        }

    });



});




var RunQueryS = function(queryObj, ok){


var reset = queryObj.toString();
var r = [reset];


console.log("reset is "+ reset);

db.open(function(err, db1) {


        if (err) {
            console.log("connection issues");
        } else {

        

            console.log("connect");
            var pr_col = db1.collection('projectRun');
            var col = db1.collection('tumor');

            console.log("ok");


            col.aggregate([

                    {
                    $match: {
                        "variants.study": {$in:r},
                        "impact": "significant",
                        "snpeff": {
                            $gt: {}
                        }
                    }},


                    
                    {
                    $project: {
                        "gene": 1,
                        "_id": 0
                    }
                    },

                    { $group : { _id : "$gene" } },



                    {$sort: {
                        "_id" : 1
                    }

                    }


            ]).toArray(function(err, docs) {
                    //console.log(docs);
                    db.close();

                    /*
                    var uniq_genes = [];
                    for (item in docs) {
                        uniq_genes.push(docs[item]._id);
                    }
                    */
                    ok( docs );

                    
            });

 

        };


    }); //db open


};



var RunQuery= function(queryObj, ok){



    db.open(function(err, db1) {


        if (err) {
            console.log("connection issues");
        } else {

            console.log("connect");
            var pr_col = db1.collection('projectRun')
            var col = db1.collection('tumor');


                console.log("P");

                col.aggregate([{
                    $match: {
                        "variants.projectRun": {$in: queryObj},
                        "impact": "significant",
                        "snpeff": {
                            $gt: {}
                        }
                    }
                },

                {
                    $project: {
                        "gene": 1,
                        "_id": 0
                    }
                },

                { $group : { _id : "$gene" } },

                {

                $sort: {
                    "_id" : 1
                }

                }


            ]).toArray(function(err, docs) {
                    console.log(docs);
                    db.close();

                    

                    var uniq_genes = [];
                    for (item in docs) {
                        uniq_genes.push(docs[item]._id);
                    }
                    ok( uniq_genes );

                    
                });

 

        };


    }); //db open



};



router.get('/genes', function(req, res, next) {

/*
    var queryObj = "";
    queryObj = req.query.qy;
    //queryObj = queryObj.toString();
*/

    var ok = function(r_js) {
        res.json(r_js);
    }

    RunQueryS(req.query.qy, ok);

});




router.get('/genesPR', function(req, res, next) {


    var query = req.query.qy;
    var queryObj = query.split(",");

    

    var ok = function(r_js) {
        res.json(r_js);
    }

    RunQuery(queryObj, ok);
    


});








var clearSVG = function() {
    var exec = require('child_process').exec;
    exec('rm *.svg', function(error, stdout, stderr) {console.log("remove successful"); });
};




var runSVG = function(acc, ok, aminoString) {

    var execString = './lollipops -labels -U ' + acc + ' ' + aminoString + ' && ls -Art | tail -n 1 | xargs cat';
    console.log(execString);

    var exec = require('child_process').exec;
    exec(execString, function(error, stdout, stderr) {
        console.log("hi");
        var mysvg = {
            "svg": stdout
        };

        if(aminoString==""){
            ok({"m":false,"mysvg":mysvg})
        }
        else{
        ok(mysvg);
        }
        clearSVG();
    });

};










var generatePop = function(docs, ok, queryObj) {

    console.log("in generate");
    console.log(docs);

    var aminoString = "";

    aminoChange = [];
    for (item in docs) {

        if(docs[item].snpeff.AminoAcidChange!="None"){
        aminoChange.push(docs[item].snpeff.AminoAcidChange);
        }

    }

    for (item in aminoChange) {
        aminoString += aminoChange[item] + " ";
    }

    aminoString = aminoString.replace(/\*/g, '');



    console.log("amino string is " + aminoString);

    var url = 'http://www.uniprot.org/uniprot/?'
    var params = queryString.stringify({
        'format': 'tab',
        'query': 'gene_exact:' + queryObj.qy2 + ' AND reviewed:yes AND organism:"Homo sapiens (Human) [9606]"'
    });


    request.get(url + params, {}, function(err, res, body) {

        if(body){
            var acc = body.split("\n")[1].split("\t")[0];
            console.log(body.split("\n")[1].split("\t")[0]);
            runSVG(acc, ok, aminoString);
        }
        else {
            ok({"error":1})
        }

    })




};










var popQuery = function(queryObj, ok){



    db.open(function(err, db1) {


        if (err) {
            console.log("connection issues");
        } else {

            console.log("connect");
            var pr_col = db1.collection('projectRun')
            var col = db1.collection('tumor');

            console.log("getting aminos");
            console.log(queryObj);

            if(queryObj.study_or_pr == "__stud"){

                col.aggregate([{
                        $match: {
                            "variants.study": {$in: queryObj.qy },
                            "gene":  queryObj.qy2,
                            "impact": "significant",
                            "snpeff": {
                                $gt: {}
                            }


                        }
                    },

                    {
                        $project: {
                            "gene": 1,
                            "_id": 0,
                            "snpeff": 1,
                            "variants": 1
                        }
                    }


                ]).toArray(function(err, docs) {
                    db.close();
                    generatePop(docs, ok, queryObj);

                });
                
            } else if (queryObj.study_or_pr == "__pr") {
                
                col.aggregate([{
                        $match: {
                            "variants.projectRun": {$in: queryObj.qy},
                            "gene": queryObj.qy2,
                            "impact": "significant",
                            "snpeff": {
                                $gt: {}
                            }


                        }
                    },

                    {
                        $project: {
                            "gene": 1,
                            "_id": 0,
                            "snpeff": 1,
                            "variants": 1
                        }
                    }


                ]).toArray(function(err, docs) {
                    db.close();
                    generatePop(docs, ok, queryObj);

                });
            }
            else {
                ok({"error":1});
            }
           

        
        };


    }); //db open



};









router.get("/LOLLIPOP", function(req, res, next) {

    var query = req.query;

    var queryObj = {
        qy:query.qy.split(","),
        qy2:query.qy2,
        study_or_pr:query.study_or_pr
    };

    var ok = function(r_js) {
        res.json(r_js);
    }

    console.log(queryObj);

    popQuery(queryObj, ok);


});







module.exports = router;
