import sql from "mssql";

const config = {
  user: "schoolembensema_SGD",
  password: "Istic2024",
  server: "sql.bsite.net",
  database: "schoolembensema_SGD",
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    instanceName: "MSSQL2016", // necesario para que funcione
  },
}


let pool: sql.ConnectionPool | null = null

export async function getConnection() {
  try {
    if (!pool) {
      pool = new sql.ConnectionPool(config)
      await pool.connect()
    }
    return pool
  } catch (err) {
    console.error("Error de conexión a la base de datos:", err)
    throw err
  }
}

export { sql }
