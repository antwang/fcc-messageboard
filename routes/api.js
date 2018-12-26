/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
var ObjectId = require("mongodb").ObjectId;
const CONNECTION_STRING = process.env.DB;
module.exports = function(app) {
  app
    .route("/api/threads/:board")
    .post(function(req, res) {
      var board = req.params.board;
      var { text, delete_password } = req.body;
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          const table = db.collection("thread");
          let reported = false;
          let created_on = new Date();
          let bumped_on = created_on;
          table.insertOne(
            { text, delete_password, board, reported, created_on, bumped_on },
            function(err, data) {
              if (err != null) {
                return res.send("error!");
              }
              res.redirect(`/b/${board}/`);
            }
          );
        }
      );
    })
    .get(function(req, res) {
      var board = req.params.board;
      MongoClient.connect(
        CONNECTION_STRING,
        async function(err, db) {
          const thread = db.collection("thread");
          let reply = db.collection("reply");
          let threads = await thread
            .find({ board }, { reported: 0, delete_passwords: 0 })
            .sort({ bumped_on: -1 })
            .limit(10)
            .toArray();
          threads = await Promise.all(
            threads.map(async (doc, index) => {
              let replyCursor = reply
                .find({ thread_id: doc._id.toHexString() })
                .sort({ created_on: -1 })
                .limit(3);
              let replycount = await replyCursor.count();
              let replies = await replyCursor.toArray();
              return { ...doc, replies, replycount };
            })
          );
          res.json(threads);
        }
      );
    })
    .delete((req, res) => {
      var { delete_password, thread_id } = req.body;
      MongoClient.connect(
        CONNECTION_STRING,
        async function(err, db) {
          const thread = db.collection("thread");
          let doc = await thread.findOne({ _id: ObjectId(thread_id) });
          if (doc.delete_password === delete_password) {
            let delRes = thread.deleteOne({ _id: ObjectId(thread_id) });
            return res.send("success");
          }
          return res.send("incorrect password");
        }
      );
    })
    .put((req, res) => {
      var thread_id = req.body.report_id;
      var board = req.params.board;
      MongoClient.connect(
        CONNECTION_STRING,
        async function(err, db) {
          const thread = db.collection("thread");
          let doc = await thread.findOneAndUpdate(
            { _id: ObjectId(thread_id) },
            { $set: { reported: true } },
            { returnOriginal: false }
          );
          assert.notEqual(doc.value, null);
          assert.equal(true, doc.value.reported);
          res.send("success");
        }
      );
    });

  app
    .route("/api/replies/:board")
    .post((req, res) => {
      var board = req.params.board;
      var { text, delete_password, thread_id } = req.body;
      MongoClient.connect(
        CONNECTION_STRING,
        async (err, db) => {
          const thread = db.collection("thread");
          const reply = db.collection("reply");
          let reported = false;
          let created_on = new Date();
          let bumped_on = created_on;
          let updateResult = await thread.findOneAndUpdate(
            { _id: ObjectId(thread_id) },
            { $set: { bumped_on } }
          );

          let insertRes = await reply.insertOne({
            text,
            delete_password,
            reported,
            thread_id,
            created_on
          });

          res.redirect(`/b/${board}/${thread_id}/`);
        }
      );
    })
    .get((req, res) => {
      let thread_id = req.query.thread_id;
      MongoClient.connect(
        CONNECTION_STRING,
        async function(err, db) {
          const thread = db.collection("thread");
          let reply = db.collection("reply");
          let topic = await thread.findOne(
            { _id: ObjectId(thread_id) },
            { reported: 0, delete_passwords: 0 }
          );
          let replies = await reply
            .find({ thread_id })
            .sort({ created_on: -1 })
            .toArray();
          topic = { ...topic, replies };

          res.json(topic);
        }
      );
    })
    .delete((req, res) => {
      var { delete_password, reply_id, thread_id } = req.body;
      MongoClient.connect(
        CONNECTION_STRING,
        async function(err, db) {
          let reply = db.collection("reply");
          let doc = await reply.findOne({ _id: ObjectId(reply_id), thread_id });
          if (doc.delete_password === delete_password) {
            let updRes = reply.updateOne(
              { _id: ObjectId(reply_id), thread_id },
              { $set: { text: "[deleted]" } }
            );
            return res.send("success");
          }
          return res.send("incorrect password");
        }
      );
    })
    .put((req, res) => {
      var { thread_id, reply_id } = req.body;
      // var board = req.params.board;
      MongoClient.connect(
        CONNECTION_STRING,
        async function(err, db) {
          const reply = db.collection("reply");
          let doc = await reply.findOneAndUpdate(
            { _id: ObjectId(reply_id), thread_id },
            { $set: { reported: true } },
            { returnOriginal: false }
          );
          assert.notEqual(doc.value, null);
          assert.equal(true, doc.value.reported);
          res.send("success");
        }
      );
    });
};
