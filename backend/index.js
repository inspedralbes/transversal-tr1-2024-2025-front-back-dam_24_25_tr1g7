const { json } = require('express');

var mysql = require('mysql');

var usuaris = [{}];
var productes = [{}];
var comandes = [{}];
var itemsComandes = [{}]

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'a23alechasan_PR1'
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
  getUsers();
  getProductes();
  getItemsComandes();
  getComandes();
});

function getUsers() {
  con.query('SELECT * FROM users', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      usuaris.push(results);
    }
  });
}

function getProductes() {
  con.query('SELECT * FROM products', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      productes.push(results);
    }
  });
}

function getComandes() {
  con.query('SELECT * FROM orders', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      comandes.push(results);
    }
  });
}

function getItemsComandes() {
  con.query('SELECT * FROM orderitems', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      itemsComandes.push(results);
    }
  });
}