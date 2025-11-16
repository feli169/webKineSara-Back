import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

// Validación opcional (ayuda a evitar errores en Render)
const required = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT"];
required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️ ADVERTENCIA: Falta la variable ${key} en el .env`);
  }
});

// CONFIGURACIÓN DEL POOL
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,         // Supabase host (IPv4 si usas pooler)
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT), // Asegura que sea entero
  ssl: {
    rejectUnauthorized: false,        // Supabase lo requiere
  },
});
