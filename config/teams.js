var express    = require('express');
var router     = express.Router();
var pool = require('./database');

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
  req.session.reset();
  if (Object.keys(errors).length) {
    req.session.params = req.body;
    req.session.errors = errors;
    return res.redirect('/indivInscription');
  }

  // Insert in database
  var message;
  errors = null;
  var selectQuery = 'INSERT INTO teams (nameTeam) VALUES (\''+req.body.nameTeam+'\')';
  var cnx = pool.getConnection(function(err, cnx){
    var sqlQuery = cnx.query(selectQuery);
    sqlQuery.on("result", function(row) {
      message = 'Votre équipe a bien été ajouté.';
      req.flash("info", "Votre équipe a bien été ajouté.");
    });
    sqlQuery.on("end", function() {
      cnx.destroy();
      // Ajax request
      if (req.xhr) {
        return res.json({
          message: message,
          error: errors
        });
      }
      // HTML request
      req.session.errors = { error: errors };
      req.session.success = message;      
      
      return res.redirect('/indivInscription');
    });
    sqlQuery.on("error", function(error) {
      errors = error.message;
      req.flash("error", error.message);
    });
  });
});
module.exports = router;