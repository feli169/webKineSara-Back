import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcryptjs";


export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,      
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT), 
  ssl: {rejectUnauthorized: false, },
});

export const addUser = async (user) => {
  const { Nombre, Apellido, Email, Telefono, Pass } = user;

  if (!Nombre || !Apellido || !Email || !Pass) {
    throw new Error("Faltan campos obligatorios");
  }

  const hashedPass = bcrypt.hashSync(Pass, 10);

  const values = [Nombre, Apellido, Email, Telefono || null, hashedPass];

  const query = `
    INSERT INTO "User" ("Nombre", "Apellido", "Email", "Telefono", "Pass")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};
