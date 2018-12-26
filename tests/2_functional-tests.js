/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("Test POST /api/threads/:board with text", function(done) {
        chai
          .request(server)
          .post("/api/threads/sports")
          .send({ text: "book", delete_password: "1" })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            // todo
            done();
          });
      });
    });

    suite("GET", function() {
      test("Test GET /api/threads/:board", function(done) {
        chai
          .request(server)
          .post("/api/threads/sports")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            //todo
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("Test DELETE /api/threads/:board", function(done) {
        // todo
        done();
      });
    });

    suite("PUT", function() {
      test("Test PUT /api/threads/:board", function(done) {
        // todo
        done();
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {
      test("Test POST /api/replies/:board", function(done) {
        // todo
        done();
      });
    });

    suite("GET", function() {
      test("Test GET /api/replies/:board", function(done) {
        // todo
        done();
      });
    });

    suite("PUT", function() {
      test("Test PUT /api/replies/:board", function(done) {
        // todo
        done();
      });
    });

    suite("DELETE", function() {
      test("Test DELETE /api/replies/:board", function(done) {
        // todo
        done();
      });
    });
  });
});
