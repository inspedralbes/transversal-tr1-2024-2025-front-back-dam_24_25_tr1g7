const { json } = require('express');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require("child_process");

const app = express();
app.use(cors());
const port = 21345;

app.use('/sources/Imatges', express.static(path.join(__dirname, 'sources/Imatges')))

var mysql = require('mysql2');

var usuaris = [];
var productes = [];
var comandes = [];

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.post("/createUser", (req, res) => {
	nouUser = {
		username: req.query.username,
		password: req.query.password,
		first_name: req.query.first_name,
    last_name: req.query.last_name,
    email: req.query.email
	};
	
});

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
  if (req.query.id) {
    const idComanda = Number(req.query.id);
    for (const comanda of comandes) {
      if (comanda.order_id == idComanda) {
        res.json(comanda);
      } else {
        res.send(`No hi ha cap producte amb id: ${idComanda}`);
      }
    }
  } else {
    res.json(comandes);
  }
});

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'a23alechasan_PR1'
});

/* var con = mysql.createConnection({
  host: 'localhost',
  user: 'a23alechasan_PR1',
  password: 'Skogsvardet_2024',
  database: 'a23alechasan_PR1',
  port: 3306
}) */

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
