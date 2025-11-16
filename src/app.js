import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { pool } from "./querys.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente 🎉");
});

// 🔥 Verificar conexión a la base de datos ANTES de iniciar el servidor
const iniciarServidor = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Base de datos conectada correctamente");

    app.listen(port, () => {
      console.log(`SERVER ON en puerto ${port}`);
    });
  } catch (err) {
    console.error("❌ No se pudo conectar a la base de datos:", err.message);
    process.exit(1); // Evita que Render quede corriendo sin conexión
  }
};

iniciarServidor();
