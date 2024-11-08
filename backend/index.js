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
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
const port = 21345;

app.use('/sources/Imatges', express.static(path.join(__dirname, 'sources/Imatges')))
app.use('/informes', express.static(path.join(__dirname, 'Estadistiques', 'informes')));

var mysql = require('mysql2');
const { error } = require('console');

var usuaris = [];
var productes = [];
var comandes = [];

/*<-------------------------------------- Sockets ---------------------------------------->*/

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
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
  database: 'a23alechasan_PR1',
  port: 3306,
  connectionLimit: 10
});

/*var pool = mysql.createPool({
  host: 'localhost',
  user: 'a23alechasan_PR1',
  password: 'Skogsvardet_2024',
  database: 'a23alechasan_PR1',
  port: 3306,
  connectionLimit: 10
}); */

/*<-------------------------------------- Estadistiques ---------------------------------------->*/
app.get('/listarInformes', (req, res) => {
  const pythonScript = './Estadistiques/analizar_ventas.py';

  const pythonProcess = spawn('python3', [pythonScript]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    const informesPath = path.join(__dirname, 'Estadistiques', 'informes');

    console.log('Path de informes:', informesPath);

    fs.readdir(informesPath, (err, files) => {
      if (err) {
        console.error('Error al leer el directorio de informes:', err);
        return res.status(500).json({ error: 'Error al leer los informes' });
      }
      fs.readdir(informesPath, (err, files) => {
        if (err) {
          console.error('Error al leer el directorio de informes:', err);
          return res.status(500).json({ error: 'Error al leer los informes' });
        }

        const informes = {
          fechas: {},
          semanales: [],
          mensuales: []
        };

        files.forEach((file) => {
          const filePath = path.join(informesPath, file);
          try {
            if (fs.statSync(filePath).isDirectory()) {
              if (file === 'semanales' || file === 'mensuales') {
                const imagenes = fs.readdirSync(filePath)
                  .filter(img => img.endsWith('.png') || img.endsWith('.jpg') || img.endsWith('.jpeg'));
                informes[file] = imagenes;
              } else {
                const imagenes = fs.readdirSync(filePath)
                  .filter(img => img.endsWith('.png') || img.endsWith('.jpg') || img.endsWith('.jpeg'));
                informes.fechas[file] = imagenes;
              }
            }
          } catch (error) {
            console.error(`Error procesando el directorio ${filePath}:`, error);
          }
        });
        files.forEach((file) => {
          const filePath = path.join(informesPath, file);
          try {
            if (fs.statSync(filePath).isDirectory()) {
              if (file === 'semanales' || file === 'mensuales') {
                const imagenes = fs.readdirSync(filePath)
                  .filter(img => img.endsWith('.png') || img.endsWith('.jpg') || img.endsWith('.jpeg'));
                informes[file] = imagenes;
              } else {
                const imagenes = fs.readdirSync(filePath)
                  .filter(img => img.endsWith('.png') || img.endsWith('.jpg') || img.endsWith('.jpeg'));
                informes.fechas[file] = imagenes;
              }
            }
          } catch (error) {
            console.error(`Error procesando el directorio ${filePath}:`, error);
          }
        });

        res.json(informes);
      });
    });

  });

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
    string_imatge: req.body.string_imatge,
    owner_id: req.body.owner_id
  };

  console.log(nouProducte.string_imatge)

  const image_file = `${nouProducte.product_name}.png`;
  const filePath = `${process.cwd()}/sources/Imatges/${image_file}`;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).send("Error al obtenir connexió");
    }

    const query = `INSERT INTO Products (product_name, description, material, price, stock, image_file, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    connection.query(query, [nouProducte.product_name, nouProducte.description, nouProducte.material, nouProducte.price, nouProducte.stock, image_file, nouProducte.owner_id], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en crear el producte");
      } else {
        if (nouProducte.string_imatge != undefined && nouProducte.string_imatge != "") {
          if (nouProducte.string_imatge != undefined && nouProducte.string_imatge != "") {
            const base64Image = nouProducte.string_imatge.split(';base64,').pop();
            fs.writeFile(filePath, base64Image, { encoding: 'base64' }, function (err) {
              if (err) {
                console.error('Error en afegir la imatge:', err);
                return res.status(500).send("Error en afegir la imatge");
              }
              console.log('Imatge afegida');

              nouProducte.product_id = results.insertId;
              nouProducte.image_file = image_file;

              io.emit('nuevoProducto', nouProducte);

              getProductes(connection);
              res.send("Producte afegit!");
              console.log(`Producte: ${nouProducte.product_name} afegit correctament!`);
            });
          } else {
            const imatgeError = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAChElEQVR4Ae3aMW/TQBxAcb70k91AAiGuGlZAtOlQApWaDiSdklZq2RPUTm1xUWL3PgqSpygkXlh88N54nn7S2Trd3y/CP5IQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECPmPIEKECBEiRIgQIeX82+FBO0naB4eTRRkt5P7sNWt1Rw9RQvKThI2SYR4f5OoVW2rfRAYpT6hqHc8WeVHki9mgRdWwiAmyfA9AdrlaW5tlAHxcxQMpK8feRbGxPEkrSREN5ARg/y780V0GMIwFcgXwLg9byvsAN3FA8lfAfr7jYQZ0nqKAfAb21vYVwNruSoEvMUDuE+Ai7IKECZA+RAA5A7JiN6TMgFHzIeUb4DLshoQZ0H1uPGQOvFzVQZYtYNF4yBg4DnWQMAAmjYccArN6yBQ4ajzkAFjUQ+ZAv/GQNpDXQ3Kg03hIAhT1kAJIhLi1/vJl39Ic6Mf3+a2K8PM7BgahtgEwjuKI0lqGjSI8opRdYFb3sk/jODSGEZCVuyFFDzgPzYc8JMBkN2QMpI8RQMIQ2LvdBblNgdM4Lh/aQJaHrf3sAe2nKCDhGqCfb3VEcx1UNQTItlzQ3fYAvoZYIMUHgHRSbiyPU4BPZUSX2JWEbLZcW5v2qByrmMYKxZCq1mA6z4sin08HLapOy8gGPddtttT5HuHobZiwUXr6K85h6KjLWm/PH+MdTy/GR/12knb6g8mPZ38YECJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAh0fUb5q7oCGreEVEAAAAASUVORK5CYII="
            const base64Image = imatgeError.split(';base64,').pop();
            fs.writeFile(filePath, base64Image, { encoding: 'base64' }, function (err) {
              if (err) {
                console.error('Error en afegir la imatge:', err);
                return res.status(500).send("Error en afegir la imatge");
              }
              console.log('Imatge afegida');
              getProductes(connection);
              res.send("Producte afegit!");
              io.emit('nuevoProducto', nouProducte);
              console.log(`Producte: ${nouProducte.product_name} afegit correctament!`);
            });
          }
        }
        connection.release();
      }
    });
  });
});

app.delete("/deleteProducte", (req, res) => {
  const idProducteEliminar = req.query.product_id
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).send("Error al obtenir connexió");
    }
    const query = `DELETE FROM Products WHERE product_id=?;`;
    connection.query(query, [idProducteEliminar], (err, results) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Error en eliminar el producte");
      } else {
        var producteEliminar = {};
        for (const producte of productes) {
          if (producte.product_id = idProducteEliminar) {
            producteEliminar = producte
          }
        }
        try {
          var filePath = `${process.cwd()}/sources/Imatges/${producteEliminar.image_file}`;
          if (filePath) {
            fs.unlinkSync(filePath);
          }
          getProductes(connection);
          res.send("Producte eliminat!");
          console.log(`Producte amb id: ${idProducteEliminar} eliminat correctament!`)
        } catch (error) {
          console.log("Error en eliminar la imatge:", error);
        }
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
    string_imatge: req.query.string_imatge
  };

  if (producte.stock != 0) {
    const image_file = `${producte.product_name}.png`
    const filePath = `${process.cwd()}/sources/Imatges/${image_file}`;

    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection from pool:', err);
        return res.status(500).json({ error: "Error al obtenir connexió" });
      }

      const query = `UPDATE Products SET product_name = ?, description = ?, material = ?, price = ?, stock = ?, image_file = ? WHERE product_id = ?`;
      connection.query(query, [producte.product_name, producte.description, producte.material, producte.price, producte.stock, image_file, producte.product_id], (err, results) => {
        if (err) {
          console.error('Error:', err);
          connection.release();
          return res.status(500).json({ error: "Error en actualitzar el producte" });
        }

        const updateImage = () => {
          if (producte.string_imatge != undefined && producte.string_imatge != "") {
            const base64Image = producte.string_imatge.split(';base64,').pop();
            fs.writeFile(filePath, base64Image, { encoding: 'base64' }, function (err) {
              if (err) {
                console.error('Error en actualitzar la imatge:', err);
                return res.status(500).json({ error: "Error en actualitzar la imatge" });
              }
              console.log('Imatge actualitzada');
              finishUpdate();
            });
          } else {
            const imatgeError = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAChElEQVR4Ae3aMW/TQBxAcb70k91AAiGuGlZAtOlQApWaDiSdklZq2RPUTm1xUWL3PgqSpygkXlh88N54nn7S2Trd3y/CP5IQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECPmPIEKECBEiRIgQIeX82+FBO0naB4eTRRkt5P7sNWt1Rw9RQvKThI2SYR4f5OoVW2rfRAYpT6hqHc8WeVHki9mgRdWwiAmyfA9AdrlaW5tlAHxcxQMpK8feRbGxPEkrSREN5ARg/y780V0GMIwFcgXwLg9byvsAN3FA8lfAfr7jYQZ0nqKAfAb21vYVwNruSoEvMUDuE+Ai7IKECZA+RAA5A7JiN6TMgFHzIeUb4DLshoQZ0H1uPGQOvFzVQZYtYNF4yBg4DnWQMAAmjYccArN6yBQ4ajzkAFjUQ+ZAv/GQNpDXQ3Kg03hIAhT1kAJIhLi1/vJl39Ic6Mf3+a2K8PM7BgahtgEwjuKI0lqGjSI8opRdYFb3sk/jODSGEZCVuyFFDzgPzYc8JMBkN2QMpI8RQMIQ2LvdBblNgdM4Lh/aQJaHrf3sAe2nKCDhGqCfb3VEcx1UNQTItlzQ3fYAvoZYIMUHgHRSbiyPU4BPZUSX2JWEbLZcW5v2qByrmMYKxZCq1mA6z4sin08HLapOy8gGPddtttT5HuHobZiwUXr6K85h6KjLWm/PH+MdTy/GR/12knb6g8mPZ38YECJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAh0fUb5q7oCGreEVEAAAAASUVORK5CYII="
            const base64Image = imatgeError.split(';base64,').pop();
            fs.writeFile(filePath, base64Image, { encoding: 'base64' }, function (err) {
              if (err) {
                console.error('Error en actualitzar la imatge:', err);
                return res.status(500).json({ error: "Error en actualitzar la imatge" });
              }
              console.log('Imatge actualitzada');
              finishUpdate();
            });
          }
        };

        const finishUpdate = () => {
          getProductes(connection);
          connection.release();

          const updatedProduct = {
            product_id: producte.product_id,
            product_name: producte.product_name,
            description: producte.description,
            material: producte.material,
            price: producte.price,
            stock: producte.stock,
            image_file: image_file
          };

          io.emit('productoActualizado', updatedProduct);

          res.json({
            message: "Producte actualitzat!",
            product: updatedProduct
          });

          console.log(`Producte: ${producte.product_name} actualitzat correctament!`);
        };

        updateImage();
      });
    });
  } else {
    esborrarProducte(req, res, producte.product_id);
  }
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
  try {
    const novaComanda = {
      user_id: req.query.user_id,
      product_id: req.query.product_id,
      total: req.query.total,
      status: 'waiting'
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

        var comandaAEscriure = {};

        for (const comanda of comandes) {
          if (comanda.product_id == novaComanda.product_id && comanda.user_id == novaComanda.user_id) {
            comandaAEscriure = comanda;
          }
        }

        io.emit('nuevaComanda', novaComanda);

        const d = new Date();
        const avui = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();

        const filePath = `${process.cwd()}/Historial/order_${comandaAEscriure.order_id}_${avui}.txt`;

        const dades = JSON.stringify(comandaAEscriure, null, 2) + '\n';

        fs.appendFile(filePath, dades, function (err) {
          if (err) {
            console.error("Error en afegir a l'historial:", err);
            return res.status(500).send("Error en afegir a l'historial");
          }
          console.log("Comanda Afegida a l'historial.");
          getProductes(connection);
          res.send(`Comanda ${comandaAEscriure.order_id} afegida!`);
          console.log(`Comanda de: ${novaComanda.user_id} afegida correctament!`);
        });
      });
    });
  } catch (error) {
    console.log("Error: ", error);
  }
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

const cambioEstado = (order_id, status) => {
  console.log(`Emitiendo cambio de estado: order_id=${order_id}, status=${status}`);
  io.emit('cambioEstado', { order_id, status });


  const comanda = comandes.find(c => c.order_id === Number(order_id));
  if (comanda) {
    comanda.status = status;
    console.log(`L'ordre: ${order_id} està '${status}'!`);

    if (status === 'canceled') {
      io.emit('eliminarComanda', order_id);
      comandes = comandes.filter(c => c.order_id !== Number(order_id));
    }
  }
};

const ChangeStatus = (status) => {
  return (req, res) => {
    const order_id = req.query.order_id;
    console.log(`Updating order ${order_id} to status: ${status}`);

    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection from pool:', err);
        return res.status(500).json({ error: "Error al obtener conexión" });
      }

      const query = `UPDATE Orders SET status = ? WHERE order_id = ?`;
      connection.query(query, [status, order_id], (err, results) => {
        if (err) {
          console.error('Error:', err);
          connection.release();
          return res.status(500).json({ error: `Error en actualizar la orden a '${status}'` });
        }

        // If the status is 'canceled' or 'confirmed', remove the order
        if (status === 'canceled' || status === 'confirmed') {
          esborrarComanda(connection, order_id); // Function to delete the order from the database
          actualitzarHistorial(order_id, status); // Update history if necessary
        }

        // Emit the change via socket
        io.emit('cambioEstado', { order_id, status });

        console.log(`L'ordre: ${order_id} està '${status}'!`);
        res.json({ message: `Orden actualizada a '${status}'!` });
        connection.release();
      });
    });
  };
};

app.put("/waiting", ChangeStatus('waiting'));
app.put("/pending", ChangeStatus('pending'));
app.put("/shipped", ChangeStatus('shipped'));
app.put("/verified", ChangeStatus('verified'));

app.put("/confirmed", (req, res) => {
  const order_id = req.query.order_id;
  console.log(`Confirming order: ${order_id}`);

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).json({ error: "Error al obtener conexión" });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Error al iniciar la transacción" });
      }

      const queryGetOrder = `SELECT product_id FROM Orders WHERE order_id = ?`;
      connection.query(queryGetOrder, [order_id], (err, orderResults) => {
        if (err || orderResults.length === 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: "Error al obtener la información de la comanda" });
          });
        }

        const { product_id } = orderResults[0];

        const queryUpdateOrder = `UPDATE Orders SET status = 'confirmed' WHERE order_id = ?`;
        connection.query(queryUpdateOrder, [order_id], (err, updateResults) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Error al actualizar el estado de la comanda" });
            });
          }

          const queryUpdateStock = `UPDATE Products SET stock = stock - 1 WHERE product_id = ?`;
          connection.query(queryUpdateStock, [product_id], (err, stockResults) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: "Error al actualizar el stock del producto" });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: "Error al finalizar la transacción" });
                });
              }

              const queryGetStock = `SELECT stock FROM Products WHERE product_id = ?`;
              connection.query(queryGetStock, [product_id], (err, stockResults) => {
                if (err) {
                  console.error('Error al obtener el stock actualizado:', err);
                  connection.release();
                  return res.status(500).json({ error: "Error al obtener el stock actualizado" });
                }

                const newStock = stockResults[0].stock;

                updateLocalOrderStatus(order_id, 'confirmed');
                updateLocalProductStock(product_id, newStock);

                io.emit('cambioEstado', { order_id, status: 'confirmed' });
                io.emit('stockActualizado', { product_id, stock: newStock });

                res.json({ message: "Comanda confirmada y stock actualizado", newStock });
                console.log(`Comanda ${order_id} confirmada y stock actualizado para el producto ${product_id}`);
                connection.release();
              });
            });
          });
        });
      });
    });
  });
});

function updateLocalOrderStatus(order_id, status) {
  const order = comandes.find(o => o.order_id === parseInt(order_id));
  if (order) {
    order.status = status;
    console.log(`Estado de la comanda ${order_id} actualizado localmente a ${status}`);
  } else {
    console.log(`Comanda ${order_id} no encontrada en la lista local`);
  }
}

function updateLocalProductStock(product_id, newStock) {
  const product = productes.find(p => p.product_id === parseInt(product_id));
  if (product) {
    product.stock = newStock;
    console.log(`Stock del producto ${product_id} actualizado localmente a ${newStock}`);
  } else {
    console.log(`Producto ${product_id} no encontrado en la lista local`);
  }
}

app.put("/canceled", (req, res) => {
  const order_id = req.query.order_id;
  console.log(`Canceling order: ${order_id}`);

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).json({ error: "Error al obtener conexión" });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: "Error al iniciar la transacción" });
      }

      const queryGetOrder = `SELECT product_id FROM Orders WHERE order_id = ?`;
      connection.query(queryGetOrder, [order_id], (err, orderResults) => {
        if (err || orderResults.length === 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: "Error al obtener la información de la comanda" });
          });
        }

        const { product_id } = orderResults[0];

        const queryUpdateOrder = `UPDATE Orders SET status = 'canceled' WHERE order_id = ?`;
        connection.query(queryUpdateOrder, [order_id], (err, updateResults) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Error al actualizar el estado de la comanda" });
            });
          }

          const queryUpdateStock = `UPDATE Products SET stock = stock + 1 WHERE product_id = ?`;
          connection.query(queryUpdateStock, [product_id], (err, stockResults) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: "Error al actualizar el stock del producto" });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: "Error al finalizar la transacción" });
                });
              }

              const queryGetStock = `SELECT stock FROM Products WHERE product_id = ?`;
              connection.query(queryGetStock, [product_id], (err, stockResults) => {
                if (err) {
                  console.error('Error al obtener el stock actualizado:', err);
                  connection.release();
                  return res.status(500).json({ error: "Error al obtener el stock actualizado" });
                }

                const newStock = stockResults[0].stock;

                updateLocalOrderStatus(order_id, 'canceled');
                updateLocalProductStock(product_id, newStock);

                io.emit('cambioEstado', { order_id, status: 'canceled' });
                io.emit('stockActualizado', { product_id, stock: newStock });

                res.json({ message: "Comanda cancelada y stock actualizado", newStock });
                console.log(`Comanda ${order_id} cancelada y stock actualizado para el producto ${product_id}`);
                connection.release();
              });
            });
          });
        });
      });
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
  const query = "SELECT * FROM Products";
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error getting products:', err);
    } else {
      productes = results;
      console.log('Products updated in memory');
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

function esborrarComanda(connection, order_id) {
  const query = `DELETE FROM Orders WHERE order_id=?;`;
  connection.query(query, [order_id], (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      getComandes(connection);
      console.log(`Ordre amb id: ${order_id} eliminada correctament!`)
    }
    connection.release();
  });
}

function esborrarProducte(connection, product_id) {
  const query = `DELETE FROM Products WHERE product_id=?;`;
  connection.query(query, [product_id], (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      try {
        var filePath = `${process.cwd()}/sources/Imatges/${producteEliminar.image_file}`;
        if (filePath) {
          fs.unlinkSync(filePath);
        }
        getProductes(connection);
        res.send("Producte eliminat!");
        console.log(`Producte amb id: ${idProducteEliminar} eliminat correctament!`)
      } catch (error) {
        console.log("Error en eliminar la imatge:", error);
      }
    }
    connection.release();
  });
}

function actualitzarHistorial(order_id, status) {
  const filePath = `${process.cwd()}/Historial/`;

  fs.readdir(filePath, (err, files) => {
    if (err) {
      console.error('Error llegint el directori:', err);
      return;
    }

    const orderFiles = files.filter(file => file.startsWith(`order_${order_id}`));

    orderFiles.forEach(file => {
      const fullPath = path.join(filePath, file);

      const formattedStatus = `\n<<< ${status} >>>`;

      fs.appendFile(fullPath, formattedStatus, (err) => {
        if (err) {
          console.error(`Error en afegir status a ${file}:`, err);
        } else {
          console.log(`Status '${status}' afegit a l'arxiu ${file}`);
        }
      });
    });
  });
}