import dotenv from "dotenv";
import jwt from "jsonwebtoken";

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
  ssl: { rejectUnauthorized: false },
});

export const addUser = async (user) => {
  const { Nombre, Apellido, Email, Telefono, Pass } = user;

  if (!Nombre || !Apellido || !Email || !Pass) {
    throw new Error("Faltan campos obligatorios");
  }

  // Convertimos el email a minúsculas
  const emailLower = Email.toLowerCase();

  try {
    // Verificar si el email ya existe (ignora mayúsculas)
    const existingUser = await pool.query(
      'SELECT * FROM "User" WHERE LOWER("Email") = $1',
      [emailLower]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("EMAIL_DUPLICADO");
    }

    // Hashear contraseña
    const hashedPass = bcrypt.hashSync(Pass, 10);

    const values = [Nombre, Apellido, emailLower, Telefono || null, hashedPass];

    const query = `
      INSERT INTO "User" ("Nombre", "Apellido", "Email", "Telefono", "Pass")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];

  } catch (error) {
    // Mantener manejo de error de email duplicado
    if (error.message === "EMAIL_DUPLICADO") {
      throw error;
    }

    // Otros errores de base de datos
    throw error;
  }
};

export const obtenerServicios = async () => {
  const consulta = `SELECT * FROM servicios ORDER BY id ASC`;
  const { rows } = await pool.query(consulta);
  return rows;
};

export const loginUser = async ({ Email, Pass }) => {
  // Buscar usuario
  const { rows } = await pool.query(
    'SELECT * FROM "User" WHERE LOWER("Email") = LOWER($1)',
    [Email]
  );

  if (rows.length === 0) {
    throw new Error("Email o contraseña incorrectos");
  }

  const user = rows[0];

  // Comparar contraseña con hash
  const passMatch = bcrypt.compareSync(Pass, user.Pass);

  if (!passMatch) {
    throw new Error("Email o contraseña incorrectos");
  }

  // Crear token
  const token = jwt.sign(
    { id: user.id, email: user.Email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  return {
    token,
    user: {
      id: user.id,
      Nombre: user.Nombre,
      Apellido: user.Apellido,
      Email: user.Email,
      Telefono: user.Telefono,
    }
  };
};