var express    = require('express');
var nodemailer = require('nodemailer');
var multer = require('multer');
var router     = express.Router();

var config = require('./config');

var path = require('path');
var babel = require("babel-core");

var recaptcha = require('express-recaptcha');
recaptcha.init('6LdAcR4TAAAAAGcofFEJ4baod06lfqdLOmjSY5ph', '6LdAcR4TAAAAAJ--MH6rZo7MRedRJLwCnl8i985d', { hl: 'fr' });

// Import es6 file
var checkContactForm = eval(babel.transformFileSync(path.join(__dirname, '../frontend/app/contact/check_form.es6'), {
  presets: ['es2015']
}).code);

var checkInscriptionForm = eval(babel.transformFileSync(path.join(__dirname, '../frontend/app/contact/check_inscription_form.es6'), {
  presets: ['es2015']
}).code);

var upload = multer({dest: './frontend/images/identite'});


// Uncomment if send Mail is used
// var transporter = nodemailer.createTransport('smtps://smartdog@gmx.fr:Mm2ppSDsf@mail.gmx.com');


router.get('/', function(req, res, next) {
  res.render('home', { title: 'Tournoi de foot du CHRU' });
});

// List of team, replace with dataBase Access
var teamList = [{name : "Les chevaliers"}, {name : "Chat"}];

router.get('/indivInscription',recaptcha.middleware.render , function(req, res, next) {
  var success = req.session.success;
  var errors = req.session.errors || {};
  var params = req.session.params || {};
  req.session.reset();

  res.render('indivInscription', {
    title: 'Inscription Individuelle',
    id: "indivInscription",
    params: params,
    success: success,
    errors: errors,
    teams : teamList,
    captcha: req.recaptcha
  });
});

router.get('/teamInscription', function(req, res, next) {
  res.render('teamInscription', { title: 'Inscription d\'une équipe', id: 'teamInscription' });
});

router.get('/inscriptionList', function(req, res, next) {
  res.render('inscriptionList', { title: 'Liste des inscrits', id: 'inscriptionList' });
});

router.get('/playerList', function(req, res, next) {
  res.render('playerList', { title: 'Liste des joueurs', id: 'playerList' });
});

router.get('/education', function(req, res, next) {
  res.render('education', { title: 'Éducation', id: "education" });
});

router.get('/comportement', function(req, res, next) {
  res.render('behavior', { title: 'Comportement', id: "behavior" });
});

router.get('/prestations', function(req, res, next) {
  res.render('services', { title: 'Prestations', id: "services" });
});

router.get('/qui-suis-je', function(req, res, next) {
  res.render('who-am-i', { title: 'Qui suis-je ?', id: "who-am-i" });
});

router.get('/contact', recaptcha.middleware.render, function(req, res, next) {
  var success = req.session.success;
  var errors = req.session.errors || {};
  var params = req.session.params || {};
  req.session.reset();

  res.render('contact', {
    title: 'Contact',
    id: "contact",
    params: params,
    success: success,
    errors: errors,
    captcha: req.recaptcha
  });
});



/* GET boutique page. */
// router.get('/boutique', function(req, res, next) {
//   res.render('store', {title: title, id: "store"});
// });


var ORIGINS = {
  internet: "via internet",
  friend:   "via un ami",
  other:    "autre"
};

router.post('/contact', recaptcha.middleware.verify, function(req, res, next) {
  // Check form fields
  var errors = checkContactForm(req.body);
  if (Object.keys(errors).length) {
    req.session.params = req.body;
    req.session.errors = errors;
    return res.redirect('/contact');
  }

  // Check recaptcha
  if (req.recaptcha.error) {
    if (req.xhr) {
      return res.json({ error: 'ReCaptcha Invalide.' });
    }
    req.session.params = req.body;
    req.session.errors = { error: 'Veuillez activer Javascript.' };
    return res.redirect('/contact');
  }

  // Send email asynchronously. This way the user won't have to wait.

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: config.replyEmail,
    to:   config.contactEmail,
    subject: req.body.name + " vous a envoyé un message",
    html: ("<a href='mailto:" + req.body.email + "'>" + req.body.name + "</a> (" +
      ORIGINS[req.body.origin] + ") :\n\n" + req.body.message).replace(/\n/g, '<br />')
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if (error){
      return console.log(error);
    }
  });

  // Ajax request
  var message = 'Votre message a bien ete envoyé.';
  if (req.xhr) {
    return res.json({ message: message });
  }

  // HTML request
  req.session.success = message;
  return res.redirect('/contact');
});

router.post('/indivInscription', recaptcha.middleware.verify, upload.single('displayImage'), function(req, res, next) {
  // Check form fields
  var errors = checkInscriptionForm(req.body);
  if (Object.keys(errors).length) {
    req.session.params = req.body;
    req.session.errors = errors;
    return res.redirect('/indivInscription');
  }

  // Check recaptcha
  if (!req.recaptcha.error) {
    if (req.xhr) {
      return res.json({ error: 'ReCaptcha Invalide.' });
    }
    req.session.params = req.body;
    req.session.errors = { error: 'Veuillez activer Javascript.' };
    return res.redirect('/indivInscription');
  }

  // Send to database asynchronously. This way the user won't have to wait.

  // Insert in database
  console.log('files :' + req.file.filename);
  var id;
  var cnx = config.pool.getConnection(function(err, cnx){
    var selectTeam = { nomEquipe : req.body.team};
    var sqlQuery = cnx.query("SELECT idEquipe FROM equipe WHERE ?", selectTeam);
    sqlQuery.on("result", function(row) {
      id = row.idEquipe;
    });
    sqlQuery.on("end", function() {
      var valeur = { name : req.body.name, firstname : req.body.firstname, birthday : req.body.birthday, idTeam : id, displayImage : req.body.displayImage, email : req.body.email};
      selectQuery = 'INSERT INTO players SET ?';
      sqlQuery2 = cnx.query(selectQuery, valeur);
      sqlQuery2.on("result", function(row) {

      });
      sqlQuery2.on("end", function() {
        cnx.destroy();
//        res.render('inscription',
//          { user : req.user, title : title , equipes : listEquipe, joueurs : ''}
//        )
      });
      sqlQuery2.on("error", function(error) {
        console.log(error);
      });
    });
    sqlQuery.on("error", function(error) {
      console.log(error);
    });
  });

  // Ajax request
  var message = 'Votre inscription a bien ete prise en compte.';
  if (req.xhr) {
    return res.json({ message: message });
  }

  // HTML request
  req.session.success = message;
  return res.redirect('/indivInscription');
});
module.exports = router;
