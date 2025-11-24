import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }
});

export const addUser = async ({ Nombre, Apellido, Email, Telefono, Pass }) => {
  if (!Nombre || !Apellido || !Email || !Pass) {
    throw new Error("Faltan campos obligatorios");
  }

  const emailLower = Email.toLowerCase();

  const existingUser = await pool.query(
    'SELECT * FROM "User" WHERE LOWER("Email") = $1',
    [emailLower]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("EMAIL_DUPLICADO");
  }

  const hashedPass = bcrypt.hashSync(Pass, 10);

  const query = `
    INSERT INTO "User" ("Nombre", "Apellido", "Email", "Telefono", "Pass")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [Nombre, Apellido, emailLower, Telefono || null, hashedPass];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const obtenerServicios = async () => {
  const { rows } = await pool.query(`SELECT * FROM servicios ORDER BY id ASC`);
  return rows;
};

export const loginUser = async ({ Email, Pass }) => {
  const { rows } = await pool.query(
    'SELECT * FROM "User" WHERE LOWER("Email") = LOWER($1)',
    [Email]
  );

  if (rows.length === 0) {
    throw new Error("Email o contraseña incorrectos");
  }

  const user = rows[0];

  const passMatch = bcrypt.compareSync(Pass, user.Pass);

  console.log("Usuario encontrado:", user);
  console.log("Pass ingresado:", Pass);
  console.log("Pass en BD:", user.Pass);
  console.log("Comparación:", passMatch);

  if (!passMatch) {
    throw new Error("Email o contraseña incorrectos");
  }

  const token = jwt.sign(
    { id: user.id, email: user.Email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  return { token };
};
