var mysql = require('mysql');

// DataBase config
var pool = mysql.createPool({
  host     : "localhost",
  user     : "glassapp",
  password : "Cd1aggIc",
  database : "tournoi_foot"
});


module.exports = pool;