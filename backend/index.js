const { json } = require('express');
const express = require('express')
const fs = require('fs')
const cors = require('cors');
const path = require('path');
const { spawn } = require("child_process");

const app = express();
const port = 3000;

var mysql = require('mysql');

var usuaris = [];
var productes = [];
var comandes = [];
var itemsComandes = [];

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

app.get("/getItemsComanda", (req, res) => {
  var itemsComandesEnviar = [];
  if (req.query.id) {
    const idComanda = Number(req.query.id);
    for (const item of itemsComandes) {
      if (item.order_id == idComanda) {
       itemsComandesEnviar.push(item);
      }
      res.json(itemsComandesEnviar);
    }
  } else {
    res.json(productes);
  }
});

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
      usuaris = results;
    }
  });
}

function getProductes() {
  con.query('SELECT * FROM products', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      productes = results;
    }
  });
}

function getComandes() {
  con.query('SELECT * FROM orders', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      comandes = results;
    }
  });
}

function getItemsComandes() {
  con.query('SELECT * FROM orderitems', (err, results, fields) => {
    if (err) {
      console.error('Error:', err);
    } else {
      itemsComandes = results;
    }
  });
}