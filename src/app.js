import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { addUser } from "./querys.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente 🎉");
});

app.post("/usuarios", async (req, res) => { 
  try {
    const user = req.body;
    const newUser = await addUser(user);
    res.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).json({ error: error.message })
    console.log(error);
  }
});


app.listen(port, () => {
  console.log(`🟢 SERVER ON en puerto ${port}`);
});