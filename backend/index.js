/*<-------------------------------------- Variables ---------------------------------------->*/

const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

const app = express();
app.use(cors());
const port = 21345;

app.use('/sources/Imatges', express.static(path.join(__dirname, 'sources/Imatges')))

app.use('/sources/Imatges', express.static(path.join(__dirname, 'sources/Imatges')));

var usuaris = [];
var productes = [];
var comandes = [];

/*<-------------------------------------- Connexions ---------------------------------------->*/

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'grup7bd',
  port: 3306,
  connectionLimit: 10 
});

/*<-------------------------------------- Usuaris ---------------------------------------->*/

app.get("/getUsuaris", (req, res) => {
  if (req.query.user_id) {
    const idUsuari = Number(req.query.user_id);
    const usuari = usuaris.find(u => u.user_id === idUsuari);
    if (usuari) {
      res.json(usuari);
    } else {
      res.send(`No hi ha cap usuari amb id: ${idUsuari}`);
    }
  } else {
    res.json(usuaris);
  }
});

app.post("/createUsuari", (req, res) => {
  const nouUser = {
    username: req.query.username,
    password: req.query.password,
    first_name: req.query.first_name,
    last_name: req.query.last_name,
    email: req.query.email
  };
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `INSERT INTO Users (username, password, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)`;
  
    connection.query(query, [nouUser.username, nouUser.password, nouUser.first_name, nouUser.last_name, nouUser.email], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en crear l'usuari");
      } else {
        getUsers(connection);
        res.send("Usuari afegit!");
        console.log(`Usuari: ${nouUser.username} afegit correctament!`)
      }
      connection.release();
    });
  });
});

app.delete("/deleteUsuari", (req, res) => {
  const idUserEliminar = req.query.user_id;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `DELETE FROM Users WHERE user_id=?;`;
  
    connection.query(query, [idUserEliminar], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en eliminar l'usuari");
      } else {
        getUsers(connection);
        res.send("Usuari eliminat!");
        console.log(`Usuari amb id: ${idUserEliminar} eliminat correctament!`)
      }
      connection.release();
    });
  });
});

app.put("/updateUsuari", (req, res) => {
  const user = {
    user_id: req.query.user_id,
    username: req.query.username,
    password: req.query.password,
    first_name: req.query.first_name,
    last_name: req.query.last_name,
    email: req.query.email
  };
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `UPDATE Users SET username = ?, password = ?, first_name = ?, last_name = ?, email = ?  WHERE user_id = ?`;
  
    connection.query(query, [user.username, user.password, user.first_name, user.last_name, user.email, user.user_id], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en actualitzar l'usuari");
      } else {
        getUsers(connection);
        res.send("Usuari actualitzat!");
        console.log(`Usuari: ${user.username} actualitzat correctament!`)
      }
      connection.release();
    }); 
  });
});

/*<-------------------------------------- Productes ---------------------------------------->*/

app.get("/getProductes", (req, res) => {
  if (req.query.product_id) {
    const idProducte = Number(req.query.product_id);
    const producte = productes.find(p => p.product_id === idProducte);
    if (producte) {
      res.json(producte);
    } else {
      res.send(`No hi ha cap producte amb id: ${idProducte}`);
    }
  } else {
    res.json(productes);
  }
});

app.post("/createProducte", (req, res) => {
  const nouProducte = {
    product_name: req.query.product_name,
    description: req.query.description,
    material: req.query.material,
    price: req.query.price,
    stock: req.query.stock,
  };

  const image_file = `${nouProducte.product_name}.png`
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `INSERT INTO Products (product_name, description, material, price, stock, image_file) VALUES  (?, ?, ?, ?, ?, ?)`;
  
    connection.query(query, [nouProducte.product_name, nouProducte.description, nouProducte.material, nouProducte.price, nouProducte.stock, image_file], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en crear el producte");
      } else {
        getProductes(connection);
        res.send("Producte afegit!");
        console.log(`Producte: ${nouProducte.product_name} afegit correctament!`)
      }
      connection.release();
    });
  });
});

app.delete("/deleteProducte", (req, res) => {
  const idProducteEliminar = req.query.product_id

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `DELETE FROM Products WHERE product_id=?;`;
  
    connection.query(query, [idProducteEliminar], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en eliminar el producte");
      } else {
        getProductes(connection);
        res.send("Producte eliminat!");
        console.log(`Producte amb id: ${idProducteEliminar} eliminat correctament!`)
      }
      connection.release();
    });
  });
});

app.put("/updateProducte", (req, res) => {
  const producte = {
    product_id: req.query.product_id,
    product_name: req.query.product_name,
    description: req.query.description,
    material: req.query.material,
    price: req.query.price,
    stock: req.query.stock,
  };

  const image_file = `${producte.product_name}.png`
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `UPDATE Products SET product_name = ?, description = ?, material = ?, price = ?, stock = ?, image_file = ? WHERE product_id = ?`;
  
    connection.query(query, [producte.product_name, producte.description, producte.material, producte.price, producte.stock, image_file, producte.product_id], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en actualitzar el producte");
      } else {
        getProductes(connection);
        res.send("Producte actualitzat!");
        console.log(`Producte: ${producte.product_name} actualitzat correctament!`)
      }
      connection.release();
    }); 
  });
});

/*<-------------------------------------- Comandes ---------------------------------------->*/

app.get("/getComandes", (req, res) => {
  let query = 'SELECT * FROM Orders';
  const status = req.query.status;

  if (status) {
    query += ` WHERE status = ?`;
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    connection.query(query, [status], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send('Error en la consulta a la base de datos');
      } else {
        res.json(results);
      }
      connection.release();
    });
  });
});

app.put("/verified", (req, res) => {
  const order_id = req.query.order_id;
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `UPDATE Orders SET status = 'verified' WHERE order_id = ?`;
  
    connection.query(query, [order_id], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en actualitzar l'ordre");
      } else {
        getComandes(connection);
        res.send("Ordre actualitzada a 'verified'!");
        console.log(`L'ordre: ${order_id} ha estat verificada`);
      }
      connection.release();
    }); 
  });
});

app.put("/confirmed", (req, res) => {
  const order_id = req.query.order_id;
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `UPDATE Orders SET status = 'confirmed' WHERE order_id = ?`;
  
    connection.query(query, [order_id], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en actualitzar l'ordre");
      } else {
        getComandes(connection);
        res.send("Ordre actualitzada a 'confirmed'!");
        console.log(`L'ordre: ${order_id} ha estat confirmada`);
      }
      connection.release();
    }); 
  });
});

app.put("/canceled", (req, res) => {
  const order_id = req.query.order_id;
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `UPDATE Orders SET status = 'canceled' WHERE order_id = ?`;
  
    connection.query(query, [order_id], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en actualitzar l'ordre");
      } else {
        esborrarComanda(connection, order_id);
        getComandes(connection);
        res.send("Ordre actualitzada a 'canceled'!");
        console.log(`L'ordre: ${order_id} ha estat cancelada`);
      }
      connection.release();
    }); 
  });
});


/*<-------------------------------------- Inici App ---------------------------------------->*/

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

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

function esborrarComanda(connection, order_id) {
  const query = `DELETE FROM Orders WHERE order_id=?;`;
  
  connection.query(query, [order_id], (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      getUsers(connection);
      console.log(`Ordre amb id: ${order_id} eliminada correctament!`)
    }
    connection.release();
  });
}