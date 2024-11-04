/*<-------------------------------------- Variables ---------------------------------------->*/

const { json } = require('express');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { spawn } = require("child_process");
const http = require('http');
const { Server } = require('socket.io');

const appJSON = express
const app = express();
app.use(express.json({ limit: '200mb' }));
app.use(cors());
const port = 21345;

app.use('/sources/Imatges', express.static(path.join(__dirname, 'sources/Imatges')))

var mysql = require('mysql2');

var usuaris = [];
var productes = [];
var comandes = [];

/*<-------------------------------------- Sockets ---------------------------------------->*/

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // O especifica el origen de tu cliente
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

/*<-------------------------------------- Connexions ---------------------------------------->*/

var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: 'TR1',
  port: 3306,
  connectionLimit: 10 
});

/* var pool = mysql.createPool({
  host: 'localhost',
  user: 'a23alechasan_PR1',
  password: 'Skogsvardet_2024',
  database: 'a23alechasan_PR1',
  port: 3306,
  connectionLimit: 10 
}); */


/*<-------------------------------------- Usuaris ---------------------------------------->*/

app.get("/getUsuaris", (req, res) => {
  if (req.query.user_id) {
    const idUsuari = Number(req.query.user_id);
    for (const usuari of usuaris) {
      if (usuari.user_id == idUsuari) {
        res.json(usuari);
      } else {
        res.send(`No hi ha cap usuari amb id: ${idUsuari}`);
      }
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
  const idUserEliminar = req.query.user_id

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

app.post("/createProducte", (req, res) => {
  const nouProducte = {
    product_name: req.body.product_name,
    description: req.body.description,
    material: req.body.material,
    price: req.body.price,
    stock: req.body.stock,
    string_imatge: req.body.string_imatge
  };

  const image_file = `${nouProducte.product_name}.png`;
  const filePath = `${process.cwd()}/sources/Imatges/${image_file}`;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }


    const query = `INSERT INTO Products (product_name, description, material, price, stock, image_file) VALUES (?, ?, ?, ?, ?, ?)`;
  
    connection.query(query, [nouProducte.product_name, nouProducte.description, nouProducte.material, nouProducte.price, nouProducte.stock, image_file], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en crear el producte");
      } else {
        if (nouProducte.string_imatge != undefined && nouProducte.string_imatge != ""){
          const base64Image = nouProducte.string_imatge.split(';base64,').pop();
          fs.writeFile(filePath, base64Image, { encoding: 'base64' }, function(err) {
          if (err) {
            console.error('Error en afegir la imatge:', err);
            return res.status(500).send("Error en afegir la imatge");
          }
          console.log('Imatge afegida');
          getProductes(connection);
          res.send("Producte afegit!");
          console.log(`Producte: ${nouProducte.product_name} afegit correctament!`);
        });
        } else {
          const imatgeError = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAChElEQVR4Ae3aMW/TQBxAcb70k91AAiGuGlZAtOlQApWaDiSdklZq2RPUTm1xUWL3PgqSpygkXlh88N54nn7S2Trd3y/CP5IQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECPmPIEKECBEiRIgQIeX82+FBO0naB4eTRRkt5P7sNWt1Rw9RQvKThI2SYR4f5OoVW2rfRAYpT6hqHc8WeVHki9mgRdWwiAmyfA9AdrlaW5tlAHxcxQMpK8feRbGxPEkrSREN5ARg/y780V0GMIwFcgXwLg9byvsAN3FA8lfAfr7jYQZ0nqKAfAb21vYVwNruSoEvMUDuE+Ai7IKECZA+RAA5A7JiN6TMgFHzIeUb4DLshoQZ0H1uPGQOvFzVQZYtYNF4yBg4DnWQMAAmjYccArN6yBQ4ajzkAFjUQ+ZAv/GQNpDXQ3Kg03hIAhT1kAJIhLi1/vJl39Ic6Mf3+a2K8PM7BgahtgEwjuKI0lqGjSI8opRdYFb3sk/jODSGEZCVuyFFDzgPzYc8JMBkN2QMpI8RQMIQ2LvdBblNgdM4Lh/aQJaHrf3sAe2nKCDhGqCfb3VEcx1UNQTItlzQ3fYAvoZYIMUHgHRSbiyPU4BPZUSX2JWEbLZcW5v2qByrmMYKxZCq1mA6z4sin08HLapOy8gGPddtttT5HuHobZiwUXr6K85h6KjLWm/PH+MdTy/GR/12knb6g8mPZ38YECJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAh0fUb5q7oCGreEVEAAAAASUVORK5CYII="
          const base64Image = imatgeError.split(';base64,').pop();
          fs.writeFile(filePath, base64Image, { encoding: 'base64' }, function(err) {
          if (err) {
            console.error('Error en afegir la imatge:', err);
            return res.status(500).send("Error en afegir la imatge");
          }
          console.log('Imatge afegida');
          getProductes(connection);
          res.send("Producte afegit!");
          console.log(`Producte: ${nouProducte.product_name} afegit correctament!`);
        });
        }
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
        var producteEliminar = {};
        for (const producte of productes) {
          if (producte.product_id = idProducteEliminar){
            producteEliminar = producte
          }
        }
        var filePath = `${process.cwd()}/sources/Imatges/${producteEliminar.image_file}`;
        fs.unlinkSync(filePath);
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
    product_id: req.body.product_id,
    product_name: req.body.product_name,
    description: req.body.description,
    material: req.body.material,
    price: req.body.price,
    stock: req.body.stock,
    string_imatge: req.body.string_imatge
  };

  const image_file = `${producte.product_name}.png`
  const filePath = `${process.cwd()}/sources/Imatges/${image_file}`;
  
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
        if (producte.string_imatge != undefined && producte.string_imatge != ""){
          const base64Image = producte.string_imatge.split(';base64,').pop();
          fs.writeFile(filePath, base64Image, { encoding: 'base64' }, function(err) {
          if (err) {
            console.error('Error en actualitzar la imatge:', err);
            return res.status(500).send("Error en actualitzar la imatge");
          }
          console.log('Imatge actualitzada');
          getProductes(connection);
          res.send("Producte actualitzat!");
          console.log(`Producte: ${producte.product_name} actualitzat correctament!`);
        });
        } else {
          const imatgeError = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAChElEQVR4Ae3aMW/TQBxAcb70k91AAiGuGlZAtOlQApWaDiSdklZq2RPUTm1xUWL3PgqSpygkXlh88N54nn7S2Trd3y/CP5IQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECPmPIEKECBEiRIgQIeX82+FBO0naB4eTRRkt5P7sNWt1Rw9RQvKThI2SYR4f5OoVW2rfRAYpT6hqHc8WeVHki9mgRdWwiAmyfA9AdrlaW5tlAHxcxQMpK8feRbGxPEkrSREN5ARg/y780V0GMIwFcgXwLg9byvsAN3FA8lfAfr7jYQZ0nqKAfAb21vYVwNruSoEvMUDuE+Ai7IKECZA+RAA5A7JiN6TMgFHzIeUb4DLshoQZ0H1uPGQOvFzVQZYtYNF4yBg4DnWQMAAmjYccArN6yBQ4ajzkAFjUQ+ZAv/GQNpDXQ3Kg03hIAhT1kAJIhLi1/vJl39Ic6Mf3+a2K8PM7BgahtgEwjuKI0lqGjSI8opRdYFb3sk/jODSGEZCVuyFFDzgPzYc8JMBkN2QMpI8RQMIQ2LvdBblNgdM4Lh/aQJaHrf3sAe2nKCDhGqCfb3VEcx1UNQTItlzQ3fYAvoZYIMUHgHRSbiyPU4BPZUSX2JWEbLZcW5v2qByrmMYKxZCq1mA6z4sin08HLapOy8gGPddtttT5HuHobZiwUXr6K85h6KjLWm/PH+MdTy/GR/12knb6g8mPZ38YECJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAh0fUb5q7oCGreEVEAAAAASUVORK5CYII="
          const base64Image = imatgeError.split(';base64,').pop();
          fs.writeFile(filePath, base64Image, { encoding: 'base64' }, function(err) {
          if (err) {
            console.error('Error en actualitzar la imatge:', err);
            return res.status(500).send("Error en actualitzar la imatge");
          }
          console.log('Imatge actualitzada');
          getProductes(connection);
          res.send("Producte actualitzat!");
          console.log(`Producte: ${producte.product_name} actualitzat correctament!`);
        });
        }
      }
      connection.release();
    }); 
  });
});

/*<-------------------------------------- Comandes ---------------------------------------->*/

app.get("/getComandes", (req, res) => {
  if (req.query.order_id) {
    const idComanda = Number(req.query.order_id);
    for (const comanda of comandes) {
      if (comanda.order_id == idComanda) {
        return res.json(comanda);
      }
    }
    return res.status(404).send(`No hi ha cap comanda amb id: ${idComanda}`);
  } else {
    res.json(comandes);
  }
});

app.post("/createComanda", (req, res) => {
  const novaComanda = {
    user_id: req.query.user_id,
    product_id: req.query.product_id,
    total: req.query.total,
    status: 'waiting' // Asumiendo que el estado inicial es 'waiting'
  };
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).send("Error al obtenir connexió");
    }

    const query = `INSERT INTO Orders (user_id, product_id, total, status) VALUES (?, ?, ?, ?)`;
  
    connection.query(query, [novaComanda.user_id, novaComanda.product_id, novaComanda.total, novaComanda.status], (err, results) => {
      connection.release();

      if (err) {
        console.error('Error:', err);
        return res.status(500).send("Error en crear la comanda");
      }

      novaComanda.order_id = results.insertId;
      comandes.push(novaComanda);
      
      // Emitir evento de nueva comanda
      io.emit('nuevaComanda', novaComanda);

      res.send("Comanda afegida!");
      console.log(`Comanda de: ${novaComanda.user_id} afegida correctament!`);
    });
  });
});

app.delete("/deleteComanda", (req, res) => {
  const idComandaEliminar = req.query.order_id

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `DELETE FROM Orders WHERE order_id=?;`;
  
    connection.query(query, [idComandaEliminar], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en eliminar la comanda");
      } else {
        getComandes(connection);
        res.send("Comanda eliminada!");
        console.log(`Comanda amb id: ${idComandaEliminar} eliminada correctament!`)
      }
      connection.release();
    });
  });
});

app.put("/waiting", (req, res) => {
  const order_id = req.query.order_id

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `UPDATE Orders SET status = 'waiting' WHERE order_id = ?`;
  
    connection.query(query, [order_id], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en actualitzar l'ordre");
      } else {
        getComandes(connection);
        res.send("Ordre actualitzada a 'waiting'!");
        console.log(`L'ordre: ${order_id} està 'waiting'!`)
      }
      connection.release();
    }); 
  });
});

app.put("/pending", (req, res) => {
  const order_id = req.query.order_id
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `UPDATE Orders SET status = 'pending' WHERE order_id = ?`;
  
    connection.query(query, [order_id], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en actualitzar l'ordre");
      } else {
        getComandes(connection);
        res.send("Ordre actualitzada a 'pending'!");
        console.log(`L'ordre: ${order_id} està 'pending'!`)
      }
      connection.release();
    }); 
  });
});

app.put("/shipped", (req, res) => {
  const order_id = req.query.order_id
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).send("Error al obtenir connexió");
      return;
    }

    const query = `UPDATE Orders SET status = 'shipped' WHERE order_id = ?`;
  
    connection.query(query, [order_id], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en actualitzar l'ordre");
      } else {
        getComandes(connection);
        res.send("Ordre actualitzada a 'shipped'!");
        console.log(`L'ordre: ${order_id} ha estat enviada`)
      }
      connection.release();
    }); 
  });
});

app.put("/verified", (req, res) => {
  const order_id = req.query.order_id
  
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
        console.log(`L'ordre: ${order_id} ha estat verificada`)
      }
      connection.release();
    }); 
  });
});

app.put("/confirmed", (req, res) => {
  const order_id = req.query.order_id
  
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
        console.log(`L'ordre: ${order_id} ha estat confirmada`)
      }
      connection.release();
    }); 
  });
});

app.put("/canceled", (req, res) => {
  const order_id = req.query.order_id
  
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
        esborrarComanda(connection, order_id)
        getComandes(connection);
        res.send("Ordre actualitzada a 'canceled'!");
        console.log(`L'ordre: ${order_id} ha estat cancelada`)
      }
      connection.release();
    }); 
  });
});

/*<-------------------------------------- Inici App ---------------------------------------->*/

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
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
  const query = `SELECT * FROM Orders`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener comandas:', err);
    } else {
      comandes = results;
      console.log('Comandas actualizadas');
    }
  });
}
function esborrarComanda(connection ,order_id) {
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