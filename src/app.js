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

console.log("Body recibido:", req.body);

  try {
    const { Email, Pass } = req.body;

    const user = await loginUser(Email, Pass);

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ SOLO se envía el token
    res.json({ token });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


app.listen(port, () => {
  console.log(`🟢 SERVER ON en puerto ${port}`);
});
