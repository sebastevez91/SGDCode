const sql = require("mssql")

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT),
  options: {
    encrypt: false, // Para desarrollo local
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

let pool

const connectDB = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config)
      console.log("Conectado a SQL Server")
    }
    return pool
  } catch (error) {
    console.error("Error conectando a la base de datos:", error)
    throw error
  }
}

const getPool = () => {
  if (!pool) {
    throw new Error("Base de datos no conectada")
  }
  return pool
}

module.exports = { connectDB, getPool, sql }
