var mysql = require('mysql');

var config = {};

config.company = {
  name:   "Football'CHRU",
  email:  "nvatin@chu-besancon.fr",
  phone: "(+33) 3 81 21 89 55"
};
config.replyEmail   =  config.companyName + " <smartdog@gmx.fr>";

// DataBase config
config.pool = mysql.createPool({
  host     : "localhost",
  user     : "glassapp",
  password : "Cd1aggIc",
  database : "tournoi_foot"
});


module.exports = config;