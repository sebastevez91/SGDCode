import sql from "mssql"

const config = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "your_password",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "GestionDeposito",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

let pool: sql.ConnectionPool | null = null

export async function getConnection() {
  if (!pool) {
    pool = new sql.ConnectionPool(config)
    await pool.connect()
  }
  return pool
}

export { sql }
