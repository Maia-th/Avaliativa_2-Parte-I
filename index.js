const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;

var client = new Client(conString);

client.connect(function (err) {
  if (err) {
    return console.error("Não foi possível conectar ao banco.", err);
  }
  client.query("SELECT NOW()", function (err, result) {
    if (err) {
      return console.error("Erro ao executar a query.", err);
    }
    console.log(result.rows[0]);
  });
});

app.get("/", (req, res) => {
  res.send("Ok");
});

app.get("/Lista", (req, res) => {
  try {
    client.query("SELECT * FROM Lista", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err);
      }
      res.send(result.rows);
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/Lista/:id", (req, res) => {
  try {
    client.query(
      "SELECT * FROM Lista WHERE id = $1",
      [req.params.id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de SELECT", err);
        }
        res.send(result.rows);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.delete("/Lista/:id", (req, res) => {
  try {
    const id = req.params.id;
    client.query(
      "DELETE FROM Lista WHERE id = $1",
      [id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de DELETE", err);
        } else {
          if (result.rowCount == 0) {
            res.status(400).json({ info: "Registro não encontrado." });
          } else {
            res.status(200).json({ info: `Registro excluído. Código: ${id}` });
          }
        }
        console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/Lista", (req, res) => {
  try {
    const { nome, numero} = req.body;
    client.query(
      "INSERT INTO Lista (nome, numero) VALUES ($1, $2) RETURNING *",
      [nome, numero],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT", err);
        }
        const { id } = result.rows[0];
        res.setHeader("id", `${id}`);
        res.status(201).json({ info: `Registro criado com o código ${id}` });
        console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.put("/Lista/:id", (req, res) => {
  try {
    const id = req.params.id;
    const { nome, numero } = req.body;
    client.query(
      "UPDATE Lista SET nome = $1, numero = $2 WHERE id = $3",
      [nome, numero, id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de UPDATE", err);
        } else {
          res.setHeader("id", `${id}`);
          res.status(202).json({ info: `Registro atualizado. Código: ${id}` });
          console.log(result);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT || 8081);