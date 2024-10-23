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
app.use(express.json()); // Necessari per a processar JSON en el cos de les sol·licituds

var usuaris = [];
var productes = [];
var comandes = [];

app.listen(port, () => {
  console.log(`Aplicació escoltant al port ${port}`)
});

// Funcions per obtenir dades
app.get("/getUsuaris", (req, res) => {
  if (req.query.id) {
    const idUsuari = Number(req.query.id);
    const usuari = usuaris.find(usuari => usuari.user_id === idUsuari);
    if (usuari) {
      res.json(usuari);
    } else {
      res.send(`No hi ha cap usuari amb id: ${idUsuari}`);
    }
  } else {
    res.json(usuaris);
  }
});

app.get("/getProductes", (req, res) => {
  if (req.query.id) {
    const idProducte = Number(req.query.id);
    const producte = productes.find(producte => producte.product_id === idProducte);
    if (producte) {
      res.json(producte);
    } else {
      res.send(`No hi ha cap producte amb id: ${idProducte}`);
    }
  } else {
    res.json(productes);
  }
});

app.get("/getComandes", (req, res) => {
  if (req.query.id) {
    const idComanda = Number(req.query.id);
    const comanda = comandes.find(comanda => comanda.order_id === idComanda);
    if (comanda) {
      res.json(comanda);
    } else {
      res.send(`No hi ha cap producte amb id: ${idComanda}`);
    }
  } else {
    res.json(comandes);
  }
});

app.put('/actualitzarProducte/:id', (req, res) => {
  const idProducte = Number(req.params.id);
  const { product_name, description } = req.body; // Aquí extraiem els camps que s'envien

  const query = 'UPDATE Products SET product_name = ?, description = ? WHERE product_id = ?';
  const values = [product_name, description, idProducte];

  con.query(query, values, (err, result) => {
    if (err) {
      console.error('Error actualitzant el producte:', err);
      res.status(500).send('Error al actualitzar el producte');
    } else if (result.affectedRows === 0) {
      res.status(404).send('No s’ha trobat el producte amb aquest ID');
    } else {
      res.json({ message: 'Producte actualitzat amb èxit!' });
    }
  });
});


app.delete('/eliminarProducte/:id', (req, res) => {
  const idProducte = Number(req.params.id);

  const query = 'DELETE FROM Products WHERE product_id = ?';
  con.query(query, [idProducte], (err, result) => {
    if (err) {
      console.error('Error eliminant el producte:', err);
      res.status(500).send('Error al eliminar el producte');
    } else if (result.affectedRows === 0) {
      res.status(404).send('No s’ha trobat el producte amb aquest ID');
    } else {
      res.json({ message: 'Producte eliminat amb èxit!' });
    }
  });
});


// Connexió a la base de dades MySQL
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'grup7bd'
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connectat a MySQL!");
  getUsers();
  getProductes();
  getComandes();
});

// Funcions per obtenir dades de la base de dades
function getUsers() {
  con.query('SELECT * FROM Users', (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      usuaris = results;
    }
  });
}

function getProductes() {
  con.query('SELECT * FROM Products', (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      productes = results;
    }
  });
}

function getComandes() {
  con.query('SELECT * FROM Orders', (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      comandes = results;
    }
  });
}
