import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { addUser, obtenerServicios, loginUser } from "./querys.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente 🎉");
});

app.get("/servicios", async (req, res) => {
  try {
    const servicios = await obtenerServicios();
    res.json({ servicios });
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener los servicios" });
  }
});

app.post("/usuarios", async (req, res) => {
  try {
    const newUser = await addUser(req.body);
    res.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    if (error.message === "EMAIL_DUPLICADO") {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  console.log("🔥 BODY REAL:", req.body);

  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error en login:", error);
    res.status(400).json({ error: error.message });
  }
});


app.get("/debug-users", async (req, res) => {
  const { rows } = await pool.query('SELECT "Email" FROM "User"');
  res.json(rows);
});
