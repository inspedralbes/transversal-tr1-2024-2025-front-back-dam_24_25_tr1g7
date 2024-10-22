var mysql = require('mysql');

var con = mysql.createConnection({
  host: "daw.inspedralbes.cat",
  user: "a23alechasan_PR1",
  password: "Skogsvardet_2024",
  database: 'a23alechasan_PR1'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});