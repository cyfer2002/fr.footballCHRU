var express    = require('express');
var router     = express.Router();
var config = require('./config');

var path = require('path');
var babel = require("babel-core");

// Import es6 file

var checkPopupForm = eval(babel.transformFileSync(path.join(__dirname, '../frontend/app/popup/check_form.es6'), {
  presets: ['es2015']
}).code);

/* POST /teams/ */
router.post('/', function(req, res, next) {
  // Check form fields
  var errors = checkPopupForm(req.body);
  if (Object.keys(errors).length) {
    req.session.params = req.body;
    req.session.errors = errors;
    return res.redirect('/indivInscription#myPopup');
  }

  // Insert in database
  var message = 'Votre équipe a bien été ajouté.';
  var selectQuery = 'INSERT INTO teams (nameTeam) VALUES (\''+req.body.nameTeam+'\')';
  var cnx = config.pool.getConnection(function(err, cnx){
    var sqlQuery = cnx.query(selectQuery);
    sqlQuery.on("result", function(row) {
    });
    sqlQuery.on("end", function() {
      cnx.destroy();
      // Ajax request
      if (req.xhr) {
        return res.json({ message: message });
      }
      // HTML request
      req.session.success = message;
      return res.redirect('/indivInscription#myPopup');
    });
    sqlQuery.on("error", function(error) {
      message = error.message;
    });
  });
});
module.exports = router;