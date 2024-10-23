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


/*var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: 'a23alechasan_PR1',
  port: 3306,
  connectionLimit: 10 
}); */

var pool = mysql.createPool({
  host: 'localhost',
  user: 'a23alechasan_PR1',
  password: 'Skogsvardet_2024',
  database: 'a23alechasan_PR1',
  port: 3306,
  connectionLimit: 10 
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error getting connection from pool:', err);
    return;
  }
  
  console.log("Connected to the pool!");

  getUsers(connection);
  getProductes(connection);
  getComandes(connection);

  connection.release();
});

app.post("/createUsuari", (req, res) => {
    const nouUser = {
      username: req.query.username,
      password: req.query.password,
      first_name: req.query.first_name,
      last_name: req.query.last_name,
      email: req.query.email
    };

    const query = `INSERT INTO Users (username, password, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)`;
  
    pool.query(query, [nouUser.username, nouUser.password, nouUser.first_name, nouUser.last_name, nouUser.email], (err, results, fields) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en crear l'usuari");
      } else {
        getUsers();
        res.send("Usuari afegit!");
      }
    });
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


/* pool.conn(function (err) {
  if (err) throw err;
  console.log("Connected!");
  getUsers();
  getProductes();
  getComandes();
}); */


function getUsers(connection) {
  connection.query('SELECT * FROM Users', (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      usuaris = results;
    }
  });
}

function getProductes(connection) {
  connection.query('SELECT * FROM Products', (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      productes = results;
    }
  });
}

function getComandes(connection) {
  connection.query('SELECT * FROM Orders', (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      comandes = results;
    }
  });
}
