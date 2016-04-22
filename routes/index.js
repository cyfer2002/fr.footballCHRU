var express = require('express');
var nodemailer = require('nodemailer')
var router = express.Router();

var transporter = nodemailer.createTransport('smtps://smartdog@gmx.fr:Mm2ppSDsf@mail.gmx.com');
var receiver = "smartdogs.educanine@gmail.com"
var subject = "SmartDog-contact"

var title = "Smart'Dogs"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('accueil', { title: title, id : "accueil" });
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', {title: title, id : "contact"});
});

/* GET prestations page. */
router.get('/prestation', function(req, res, next) {
  res.render('prestation', {title: title, id : "prestation"});
});

/* GET qui suis-je page. */
router.get('/qui', function(req, res, next) {
  res.render('qui', {title: title, id : "qui"});
});

/* GET education page. */
router.get('/education', function(req, res, next) {
  res.render('education', {title: title, id : "education"});
});

/* GET comportement page. */
router.get('/comportement', function(req, res, next) {
  res.render('comportement', {title: title, id : "comportement"});
});

/* GET boutique page. */
router.get('/boutique', function(req, res, next) {
  res.render('boutique', {title: title, id : "boutique"});
});


router.post('/sendMail', function(req, res, next) {

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: subject + '<smartdog@gmx.fr>', // sender address
    to: receiver, // list of receivers
    subject: subject, // Subject line
    text: req.body.text // plaintext body
  };

// send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
    res.json(info.response);
  });
});
module.exports = router;
