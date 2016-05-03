var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var _ = require('lodash');

var routes = require('./config/routes');
var config = require('./config/config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    // Auth Check Logic
    var selectQuery = 'SELECT * FROM USER WHERE username = ?';
    var user;
    var cnx = config.pool.getConnection(function(err, cnx){
      var sqlQuery = cnx.query(selectQuery, username);
      sqlQuery.on("result", function(row) {
        user = row;
      });
      sqlQuery.on("end", function() {
        cnx.destroy();
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false);
        }
        else return done(null, user);
      });
      sqlQuery.on("error", function(error) {
        return done(error);
      });
    });
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Sessions
app.use(session({
  cookieName: 'session',
  secret: 'skadkshdjhaskjdhueopqoeqpeqmncjxuch',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// Redirect jquery, bootstrap, font-awesome
app.use('/bundles', express.static(__dirname + '/bundles'));
app.use('/images', express.static(__dirname + '/frontend/images'));
app.use('/identite', express.static(__dirname + '/frontend/images/identite'));
app.use('/fonts', express.static(__dirname + '/frontend/fonts'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


if (app.get('env') === 'production') {
  var assetManifestPath = path.join(__dirname, 'public', 'assets', 'webpack-asset-manifest.json');
  if (fs.existsSync(assetManifestPath)) {
    app.locals.assetManifest = JSON.parse(fs.readFileSync(assetManifestPath));
  }
}
app.locals.environment = app.get('env');
app.locals.companyName = config.companyName;

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
