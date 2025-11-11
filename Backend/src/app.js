import express from "express";
import dotenv from "dotenv";
const app = express();
import jwt from "jsonwebtoken";
import cors from "cors";
const port = 3000;
import {
    pool,
} from "./querys.js";

app.listen(port, console.log("SERVER ON"));
app.use(cors());
app.use(express.json());
dotenv.config();

app.get("/", (req, res) => {
  res.send("Hello World");
});


pool.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('No se pudo conectar a la base de datos:', err);
  } else {
    console.log('Base de datos conectada correctamente');
  }
});

