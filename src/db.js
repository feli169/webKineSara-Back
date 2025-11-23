    import dotenv from "dotenv";
    dotenv.config();

    import pkg from "pg";
    import bcrypt from "bcryptjs";

    const { Pool } = pkg;

    // Crear pool usando variables de entorno
    export const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: {
            rejectUnauthorized: false, // NECESARIO en Supabase
        }
    });

    // Test de conexión (opcional pero útil)
    pool.connect()
        .then(() => console.log("🟢 Conectado a PostgreSQL Supabase via Pool"))
        .catch(err => console.error("🔴 Error de conexión:", err));
