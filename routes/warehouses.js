const express = require("express")
const { connectDB, getPool, sql } = require("../config/database")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")

const router = express.Router()

// Obtener todos los depósitos
router.get("/", authenticateToken, async (req, res) => {
  try {
    await connectDB()
    const pool = getPool()

    const result = await pool.request().query(`
      SELECT IDDeposito, Ubicacion, Estado
      FROM Deposito
      ORDER BY Ubicacion
    `)

    res.json(result.recordset)
  } catch (error) {
    console.error("Error obteniendo depósitos:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Crear depósito
router.post("/", authenticateToken, authorizeRoles("administrador", "supervisor"), async (req, res) => {
  try {
    await connectDB()
    const { ubicacion } = req.body

    if (!ubicacion) {
      return res.status(400).json({ message: "La ubicación del depósito es requerida" })
    }

    const pool = getPool()

    const result = await pool
      .request()
      .input("ubicacion", sql.VarChar, ubicacion)
      .query(`
        INSERT INTO Deposito (Ubicacion)
        OUTPUT INSERTED.IDDeposito
        VALUES (@ubicacion)
      `)

    res.status(201).json({
      message: "Depósito creado exitosamente",
      id: result.recordset[0].IDDeposito,
    })
  } catch (error) {
    console.error("Error creando depósito:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

module.exports = router
