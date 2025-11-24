import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { addUser, obtenerServicios } from "./querys.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente 🎉");
});

app.get("/servicios", async (req, res) => {
  try {
    const servicios = await obtenerServicios();
    res.json({ servicios });
  } catch (error) {
    console.error("Error obteniendo servicios:", error);
    res.status(500).json({ error: "No se pudieron obtener los servicios" });
  }
});


app.post("/usuarios", async (req, res) => { 
  try {
    const user = req.body;
    const newUser = await addUser(user);
    res.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creando usuario:", error);
    if (error.message === "EMAIL_DUPLICADO") {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }
    res.status(500).json({ error: error.message })
  }
});


import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js"; // tu conexión a Postgres

app.post("/login", async (req, res) => {
  try {
    const { Email, Pass } = req.body;

    if (!Email || !Pass) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Buscar usuario por email (ignora mayúsculas)
    const { rows } = await pool.query(
      'SELECT * FROM "User" WHERE LOWER("Email") = LOWER($1)',
      [Email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const user = rows[0];

    // Comparar contraseña con bcrypt
    const passMatch = bcrypt.compareSync(Pass, user.Pass);
    if (!passMatch) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Enviar token y datos del usuario
    res.json({
      token,
      user: {
        id: user.id,
        Nombre: user.Nombre,
        Apellido: user.Apellido,
        Email: user.Email,
        Telefono: user.Telefono,
      },
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});




app.listen(port, () => {
  console.log(`🟢 SERVER ON en puerto ${port}`);
});