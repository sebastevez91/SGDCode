const express = require("express")
const { connectDB, getPool, sql } = require("../config/database")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")

const router = express.Router()

// Obtener todas las categorías
router.get("/", authenticateToken, async (req, res) => {
  try {
    await connectDB()
    const pool = getPool()

    const result = await pool.request().query(`
      SELECT IDCategoria, Nombre_Categoria, Estado
      FROM Categoria
      ORDER BY Nombre_Categoria
    `)

    res.json(result.recordset)
  } catch (error) {
    console.error("Error obteniendo categorías:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Crear categoría
router.post("/", authenticateToken, authorizeRoles("administrador", "supervisor"), async (req, res) => {
  try {
    await connectDB()
    const { nombre } = req.body

    if (!nombre) {
      return res.status(400).json({ message: "El nombre de la categoría es requerido" })
    }

    const pool = getPool()

    const result = await pool
      .request()
      .input("nombre", sql.VarChar, nombre)
      .query(`
        INSERT INTO Categoria (Nombre_Categoria)
        OUTPUT INSERTED.IDCategoria
        VALUES (@nombre)
      `)

    res.status(201).json({
      message: "Categoría creada exitosamente",
      id: result.recordset[0].IDCategoria,
    })
  } catch (error) {
    console.error("Error creando categoría:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

module.exports = router
