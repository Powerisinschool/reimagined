//const mysql = require('mysql');


var con = pool.connect();

/*var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "lsdata"
});*/

module.exports.con = con;

// sql = "CREATE TABLE users (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, firstname VARCHAR(255), lastname VARCHAR(255), username VARCHAR(255), email VARCHAR(255), password VARCHAR(255)) DEFAULT CHARSET=utf8"

/*con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  sql = "SELECT * FROM users"
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(`Query: '${sql}' ran successfully`);
    console.log(result);
  });
});*/