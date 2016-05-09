var express    = require('express');
var nodemailer = require('nodemailer');
var router     = express.Router();
var config = require('./config');
var pool = require('./database');
var passport = require('passport');

var path = require('path');
var babel = require("babel-core");

var recaptcha = require('express-recaptcha');
recaptcha.init('6LdAcR4TAAAAAGcofFEJ4baod06lfqdLOmjSY5ph', '6LdAcR4TAAAAAJ--MH6rZo7MRedRJLwCnl8i985d', { hl: 'fr' });

// Import es6 file
var checkContactForm = eval(babel.transformFileSync(path.join(__dirname, '../frontend/app/contact/check_form.es6'), {
  presets: ['es2015']
}).code);

var checkInscriptionForm = eval(babel.transformFileSync(path.join(__dirname, '../frontend/app/inscription/check_inscription_form.es6'), {
  presets: ['es2015']
}).code);

// Multer config
var multer = require('multer');
var upload = multer({dest: './frontend/images/identite'});

// Passport initialize
router.use(passport.initialize());
router.use(passport.session());

// Uncomment if sendMail is used
// var transporter = nodemailer.createTransport('smtps://smartdog@gmx.fr:Mm2ppSDsf@mail.gmx.com');


router.get('/', function(req, res, next) {
  var success = req.session.success;
  var errors = req.session.errors || {};
  var params = req.session.params || {};
  req.session.reset();
  res.render('home', {
    title: 'Tournoi de foot du CHRU',
    params: params,
    success: success,
    errors: errors,
    user : req.user
  });
});

router.get('/indivInscription',recaptcha.middleware.render , function(req, res, next) {
  var teamList = [];
  var success = req.session.success;
  var errors = req.session.errors || {};
  var params = req.session.params || {};
  req.session.reset();

  // Get Team List before redirect
  var cnx = pool.getConnection(function(err, cnx){
    var sqlQuery = cnx.query("SELECT * FROM teams");
    sqlQuery.on("result", function(row) {
      teamList.push(row.nameTeam);
    });
    sqlQuery.on("end", function() {
      console.log(teamList);
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
    sqlQuery.on("error", function(error) {
    });
  });
});

router.get('/teamInscription', function(req, res, next) {
  res.render('teamInscription', { title: 'Inscription d\'une équipe', id: 'teamInscription' });
});

router.get('/inscriptionList', function(req, res, next) {
  res.render('inscriptionList', { title: 'Liste des inscrits', id: 'inscriptionList' });
});

router.get('/playerList', function(req, res, next) {
  var playerList = [];
  var success = req.session.success;
  var errors = req.session.errors || {};
  var params = req.session.params || {};
  req.session.reset();
  // Get Team List before redirect
  var cnx = pool.getConnection(function(err, cnx){
    var sqlQuery = cnx.query("SELECT * FROM players");
    sqlQuery.on("result", function(row) {
      playerList.push(row);
    });
    sqlQuery.on("end", function() {
      res.render('playerList', {
        title: 'Liste des joueurs',
        id: "playerList",
        params: params,
        success: success,
        errors: errors,
        players : playerList
      });
    });
    sqlQuery.on("error", function(error) {
      errors.error = error;
    });
  });
});

router.get('/teamList', function(req, res, next) {
  res.render('teamList', { title: 'Liste des équipes', id: 'teamList' });
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

/* POST Login verification. */
router.post('/login',
  passport.authenticate('local', {
    successRedirect : '/',
    failureRedirect: '/loginFailure',
    failureFlash: true
  }));

/* POST LogOut page. */
router.get('/logOut', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/signIn', function (req, res, next) {
  res.render('signIn');
});

/* POST Login Failure. */
router.get('/loginFailure', function(req, res, next) {
  res.send('Failed to authenticate');
});

/* POST Login Sucess. */
router.get('/loginSuccess', function(req, res, next) {
  res.send('Successfully authenticated');
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
    to:   config.company.email,
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
  console.log("Files : " + req.file.filename);
  req.body.displayImage = req.file.originalname;
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
  var id;
  var cnx = pool.getConnection(function(err, cnx){
    var selectTeam = { nameTeam : req.body.nameTeam };
    var sqlQuery = cnx.query("SELECT idTeam FROM teams WHERE ?", selectTeam);
    sqlQuery.on("result", function(row) {
      id = row.idTeam;
    });
    sqlQuery.on("end", function() {
      var valeur = { idTeam: id, name: req.body.name, firstname: req.body.firstname, birthday: req.body.birthday, email: req.body.email, displayImage: req.file.filename };
      selectQuery = 'INSERT INTO players SET ?';
      sqlQuery2 = cnx.query(selectQuery, valeur);
      sqlQuery2.on("result", function(row) {

      });
      sqlQuery2.on("end", function() {
        cnx.destroy();
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
  var message = 'Votre inscription a bien été prise en compte.';
  if (req.xhr) {
    return res.json({ message: message });
  }

  // HTML request
  req.session.success = message;
  return res.redirect('/indivInscription');
});

module.exports = router;
