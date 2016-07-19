
var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').BSON,
    assert = require('assert');

/*

Establish connection to DB.

*/

module.exports = {
    db: new Db('markers', new Server('aziz.tgen.org', 27075),{safe:true}),
    _db2: new Db('ngstools', new Server('pbc-dcraig-db1.tgen.org', 27022),{safe:true}),
    db3: new Db('tumor', new Server('aziz.tgen.org', 27022),{safe:true})
};
