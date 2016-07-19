var db = require('./connection').db;


module.exports = function(user_in, s1, s2, s3, s4, u_db) {


        var user_selection = user_in;
        var GLOBAL_INTERSECTION = {};
        var __insert = s1 + s2 + s3 + s4;



        return {

            /* 
            Getter function, get the values that the 
            intersection algorithm has found.
            */

            vals: function() {
                return GLOBAL_INTERSECTION;
            },

            /*
              Find intersection of up to four samples by pulling their distinct values (either
              gene, biomarker, effect, or aberration type) from the DB. A temp document is then
              created (removed first, to clear it if it already exists or from last use), 
              which then contains the output of an aggregate pipeline that finds the intersection.

            */

            aggregateF: function(callback) {


                    console.log(s1);
                    console.log(s2);
                    console.log(s3);
                    console.log(s4);
                    console.log(u_db);

                    db.open(function(err, db) {

                        if (err) {

                            console.log("db issues, cancelling operation");
                            db.close();
                            callback();
                        } else {

                            db.createCollection("temp_ngstools", function(err, result) {

                                db.collection('temp_ngstools', function(err, temp) {

                                    db.collection(u_db, function(err, coll_udb) {

                                        console.log("in collection");

                                        if (err) {
                                            console.log("error")
                                        };
                                        if (!err) {

                                            /*******************************************************************
                                                                          DISTINCT IN A                            */
                                            coll_udb.distinct(user_selection, {
                                                "projectRun": s1
                                            }, function(err, docs1) {

                                                if (!err && docs1 && docs1.length > 0) {
                                                    GLOBAL_INTERSECTION.a = docs1.length;
                                                    GLOBAL_INTERSECTION.origA = docs1;
                                                    console.log(docs1.length);
                                                }
                                                


                                                /*******************************************************************
                                                                           DISTINCT IN B                            */
                                                coll_udb.distinct(user_selection, {
                                                    "projectRun": s2
                                                }, function(err, docs2) {

                                                    if (!err && docs2 && docs2.length > 0) {
                                                        GLOBAL_INTERSECTION.b = docs2.length;
                                                        GLOBAL_INTERSECTION.origB = docs2;
                                                        console.log(docs2.length);
                                                    }
                                                    

                                                    /*******************************************************************
                                                                            DISTINCT IN C                            */
                                                    coll_udb.distinct(user_selection, {
                                                        "projectRun": s3
                                                    }, function(err, docs3) {

                                                        if (!err && docs3 && docs3.length > 0) {
                                                            GLOBAL_INTERSECTION.c = docs3.length;
                                                            GLOBAL_INTERSECTION.origC = docs3;
                                                             console.log(docs3.length);
                                                        }

                                                       


                                                        coll_udb.distinct(user_selection, {
                                                            "projectRun": s4
                                                        }, function(err, docs4) {

                                                            if (!err && docs4 && docs4.length > 0) {
                                                                GLOBAL_INTERSECTION.d = docs4.length;
                                                                GLOBAL_INTERSECTION.origD = docs4;
                                                                console.log(docs4.length);
                                                            }



                                                            //clear and recreate temp document

                                                            temp.remove({
                                                                _id: __insert
                                                            }, function(err, numRemoved) {

                                                                temp.insert({
                                                                    _id: __insert,
                                                                    set1: docs1,
                                                                    set2: docs2,
                                                                    set3: docs3,
                                                                    set4: docs4,
                                                                    global_intersection: GLOBAL_INTERSECTION
                                                                }, function(err, result) {

                                                                    //aggregate pipeline finds intersection

                                                                    temp.aggregate([{
                                                                            "$match": {
                                                                                "_id": __insert
                                                                            }
                                                                        }, {
                                                                            "$project": {
                                                                                "iab": {
                                                                                    "$setIntersection": [
                                                                                        "$set1",
                                                                                        "$set2"
                                                                                    ]
                                                                                },
                                                                                "iac": {
                                                                                    "$setIntersection": [
                                                                                        "$set1",
                                                                                        "$set3"
                                                                                    ]
                                                                                },
                                                                                "iad": {
                                                                                    "$setIntersection": [
                                                                                        "$set1",
                                                                                        "$set4"
                                                                                    ]
                                                                                },
                                                                                "ibc": {
                                                                                    "$setIntersection": [
                                                                                        "$set2",
                                                                                        "$set3"
                                                                                    ]
                                                                                },
                                                                                "ibd": {
                                                                                    "$setIntersection": [
                                                                                        "$set2",
                                                                                        "$set4"
                                                                                    ]
                                                                                },
                                                                                "icd": {
                                                                                    "$setIntersection": [
                                                                                        "$set3",
                                                                                        "$set4"
                                                                                    ]
                                                                                },

                                                                                "iabc": {
                                                                                    "$setIntersection": [
                                                                                        "$set1",
                                                                                        "$set2",
                                                                                        "$set3"
                                                                                    ]
                                                                                },
                                                                                "iabd": {
                                                                                    "$setIntersection": [
                                                                                        "$set1",
                                                                                        "$set2",
                                                                                        "$set4"
                                                                                    ]
                                                                                },
                                                                                "iacd": {
                                                                                    "$setIntersection": [
                                                                                        "$set1",
                                                                                        "$set3",
                                                                                        "$set4"
                                                                                    ]
                                                                                },
                                                                                "ibcd": {
                                                                                    "$setIntersection": [
                                                                                        "$set2",
                                                                                        "$set3",
                                                                                        "$set4"
                                                                                    ]
                                                                                },


                                                                                "iabcd": {
                                                                                    "$setIntersection": [
                                                                                        "$set1",
                                                                                        "$set2",
                                                                                        "$set3",
                                                                                        "$set4"
                                                                                    ]
                                                                                }


                                                                            }
                                                                        }

                                                                    ], function(err, result) {

                                                                        if (result && !err) {


                                                                            /*
                                                                                Below GLOBAL_INTERSECTION is prepared for consumption.
                                                                                The DB is then closed, and a callback is called, which is located in 
                                                                                index.js

                                                                            */

                                                                            GLOBAL_INTERSECTION.iab = result[0].iab;
                                                                            GLOBAL_INTERSECTION.iac = result[0].iac;
                                                                            GLOBAL_INTERSECTION.iad = result[0].iad;
                                                                            GLOBAL_INTERSECTION.ibc = result[0].ibc;
                                                                            GLOBAL_INTERSECTION.ibd = result[0].ibd;
                                                                            GLOBAL_INTERSECTION.icd = result[0].icd;


                                                                            GLOBAL_INTERSECTION.iabc = result[0].iabc;
                                                                            GLOBAL_INTERSECTION.iabd = result[0].iabd;
                                                                            GLOBAL_INTERSECTION.iacd = result[0].iacd;
                                                                            GLOBAL_INTERSECTION.ibcd = result[0].ibcd;


                                                                            GLOBAL_INTERSECTION.iabcd = result[0].iabcd




                                                                            GLOBAL_INTERSECTION.ab = result[0].iab.length;
                                                                            GLOBAL_INTERSECTION.ac = result[0].iac.length;
                                                                            GLOBAL_INTERSECTION.ad = result[0].iad.length;
                                                                            GLOBAL_INTERSECTION.bc = result[0].ibc.length;
                                                                            GLOBAL_INTERSECTION.bd = result[0].ibd.length;
                                                                            GLOBAL_INTERSECTION.cd = result[0].icd.length;


                                                                            GLOBAL_INTERSECTION.abc = result[0].iabc.length;
                                                                            GLOBAL_INTERSECTION.abd = result[0].iabd.length;
                                                                            GLOBAL_INTERSECTION.acd = result[0].iacd.length;
                                                                            GLOBAL_INTERSECTION.bcd = result[0].ibcd.length;


                                                                            GLOBAL_INTERSECTION.abcd = result[0].iabcd.length;


                                                                        } //endif

                                                                        db.close();
                                                                        callback();

                                                                    }); //end aggregate

                                                                }); //end temp insert
                                                            }); //end temp remove
                                                        }); //end distinct 4
                                                    }); //end distinct 3
                                                }); //end distinct 2
                                            }); //end distinct 1

                                        } //endif


                                    }); //end col u_db
                                }); //end col temp
                            }); //end createCollection



                        } // end else



                    }); //end db open

                } //end aggregateF
        }; //return
    } // modules export