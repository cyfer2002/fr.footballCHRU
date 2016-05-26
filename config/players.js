var express    = require('express');
var router     = express.Router();
var pool = require('./database');

var path = require('path');
var babel = require("babel-core");

// Import es6 file

var checkBoxForm = eval(babel.transformFileSync(path.join(__dirname, '../frontend/app/checkbox/check_form.es6'), {
  presets: ['es2015']
}).code);

/*
GET players list
 */
router.get('/', function(req, res, next) {
  var listPlayers = [];
  var j = 0;
  var selectQuery = 'SELECT * FROM players';
  var cnx = pool.getConnection(function(err, cnx){
    var sqlQuery = cnx.query(selectQuery);
    sqlQuery.on("result", function(row) {
      listPlayers[j] = row;
      j++;
    });
    sqlQuery.on("end", function() {
      cnx.destroy();
      res.json(listPlayers);
    });
    sqlQuery.on("error", function(error) {
      console.log(error);
    });
  });
});

/*
  PUT Players /players/:idPlayers
 */
router.put('/:idPlayers', function(req, res, next) {
  var errors = checkBoxForm(req.body);
  if (Object.keys(errors).length) {
    req.session.params = req.body;
    req.flash("danger", errors)
    return res.send({errors : errors});
  }
  var errors = {};
  var message;
  var selectQuery = 'UPDATE PLAYERS set ? WHERE idPlayers = '+req.params.idPlayers;
  console.log(req.body);
  var cnx = pool.getConnection(function(err, cnx){
    var sqlQuery = cnx.query(selectQuery, req.body);
    sqlQuery.on("result", function(row) {
      message = "Player Updated";
    });
    sqlQuery.on("end", function() {
      cnx.destroy();
      res.send({
        message: message,
        error: errors
      });
    });
    sqlQuery.on("error", function(error) {
      errors = error.message;
      console.log(error);
    });
  });
});

module.exports = router;