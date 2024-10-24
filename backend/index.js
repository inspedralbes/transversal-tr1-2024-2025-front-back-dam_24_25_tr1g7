const { json } = require('express');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { spawn } = require("child_process");

const app = express();
const port = 21345;

var mysql = require('mysql2');

app.use(cors());

var usuaris = [];
var productes = [];
var comandes = [];

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get("/getUsuaris", (req, res) => {
  if (req.query.id) {
    const idUsuari = Number(req.query.id);
    for (const usuari of usuaris) {
      if (usuari.user_id == idUsuari) {
        res.json(usuari);
      } else {
        res.send(`No hi ha cap usuari amb id: ${idProducte}`);
      }
    }
  } else {
    res.json(usuaris);
  }
});

app.get("/getProductes", (req, res) => {
  if (req.query.id) {
    const idProducte = Number(req.query.id);
    for (const producte of productes) {
      if (producte.product_id == idProducte) {
        res.json(producte);
      } else {
        res.send(`No hi ha cap producte amb id: ${idProducte}`);
      }
    }
  } else {
    res.json(productes);
  }
});

app.get("/getComandes", (req, res) => {
  let query = 'SELECT * FROM Orders';
  const status = req.query.status;

  if (status === 'not-waiting') {
    query += ` WHERE status != 'waiting'`;
  } else if (status) {
    query += ` WHERE status = ?`;
  }

  con.query(query, status && status !== 'not-waiting' ? [status] : [], (err, results) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Error en la consulta a la base de datos');
    } else {
      res.json(results);
    }
  });
});


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'TR1'
});

// var con = mysql.createConnection({
//   host: 'localhost',
//   user: 'a23alechasan_PR1',
//   password: 'Skogsvardet_2024',
//   database: 'a23alechasan_PR1',
//   port: 3306
// })

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
  getUsers();
  getProductes();
  getComandes();
});

function getUsers() {
  con.query('SELECT * FROM Users', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      usuaris = results;
    }
  });
}

function getProductes() {
  con.query('SELECT * FROM Products', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      productes = results;
    }
  });
}

function getComandes() {
  con.query('SELECT * FROM Orders', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      comandes = results;
    }
  });
}