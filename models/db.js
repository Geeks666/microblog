// var settings = require('../settings');
var mongo = require("mongodb"),
  Server = mongo.Server,
  mongoServer = new mongo.Server('localhost', 27017,{});
  module.exports = new mongo.Db('microblog',mongoServer);

// db.open(function(err,ss){
// 	ss.collection('sessions',function(err,collection){
// 		console.log(collection)
// 		collection.insert({username:'bilibo'},function(err,docs){
// 			console.log(docs)
// 		})
// 	})
// })

// var MongoClient = require('mongodb').MongoClient
//   , assert = require('assert');
// var connect = MongoClient.connect;
// // Connection URL
// var url = 'mongodb://localhost:27017/microblog';
// Use connect method to connect to the Server
// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   console.log("Connected correctly to server");
//   db.collection("user",function(err,sss){
//   	console.log(sss)
//   })
//   db.close();
// });




