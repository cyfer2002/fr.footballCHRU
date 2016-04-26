var express    = require('express');
var nodemailer = require('nodemailer');
var router     = express.Router();

var path = require('path');
var babel = require("babel-core");

// Import es6 file
var checkContactForm = eval(babel.transformFileSync(path.join(__dirname, '../frontend/app/contact/check_form.es6'), {
  presets: ['es2015']
}).code);

var transporter = nodemailer.createTransport('smtps://smartdog@gmx.fr:Mm2ppSDsf@mail.gmx.com');
var receiver = "smartdogs.educanine@gmail.com";

var title = "Smart'Dogs";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: title });
});

/* GET education page. */
router.get('/education', function(req, res, next) {
  res.render('education', { title: title, id: "education" });
});

/* GET behavior page. */
router.get('/comportement', function(req, res, next) {
  res.render('behavior', { title: title, id: "behavior" });
});

/* GET services page. */
router.get('/prestations', function(req, res, next) {
  res.render('services', { title: title, id: "services" });
});

/* GET qui suis-je page. */
router.get('/qui-suis-je', function(req, res, next) {
  res.render('who-am-i', { title: title, id: "who-am-i" });
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  var success = req.session.success;
  var errors = req.session.errors || {};
  var params = req.session.params || {};
  req.session.reset();
  res.render('contact', { title: title, id: "contact", params: params, success: success, errors: errors });
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

router.post('/contact', function(req, res, next) {
  var errors = checkContactForm(req.body);
  if (Object.keys(errors).length) {
    req.session.params = req.body;
    req.session.errors = errors;
    return res.redirect('/contact');
  }

  // Send email asynchronously. This way the user won't have to wait.

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: title + '<smartdog@gmx.fr>', // sender address
    to: receiver, // list of receivers
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
module.exports = router;
