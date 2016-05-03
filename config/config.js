var mysql = require('mysql');

var config = {};

config.companyName  = "Football'CHRU";
config.contactEmail = "nvatin@chu-besancon.fr";
config.replyEmail   =  config.companyName + " <smartdog@gmx.fr>";

// DataBase config
config.pool = mysql.createPool({
  host     : "localhost",
  user     : "glassapp",
  password : "Cd1aggIc",
  database : "tournoi_foot"
});


module.exports = config;