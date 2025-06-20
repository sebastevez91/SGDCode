const express = require("express")
const { connectDB, getPool, sql } = require("../config/database")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")

const router = express.Router()

// Obtener todos los productos
router.get("/", authenticateToken, async (req, res) => {
  try {
    await connectDB()
    const pool = getPool()

    const result = await pool.request().query(`
      SELECT 
        p.IDProducto, p.Nombre, p.Codigo, p.CantidadStock, p.StockMinimo,
        p.Descripcion, p.Ubicacion, p.Estado, p.FechaCreacion,
        c.Nombre_Categoria, d.Ubicacion as DepositoUbicacion
      FROM Producto p
      LEFT JOIN Categoria c ON p.IDCategoria = c.IDCategoria
      LEFT JOIN Deposito d ON p.IDDeposito = d.IDDeposito
      ORDER BY p.Nombre
    `)

    res.json(result.recordset)
  } catch (error) {
    console.error("Error obteniendo productos:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Obtener producto por ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    await connectDB()
    const pool = getPool()

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT 
          p.*, c.Nombre_Categoria, d.Ubicacion as DepositoUbicacion
        FROM Producto p
        LEFT JOIN Categoria c ON p.IDCategoria = c.IDCategoria
        LEFT JOIN Deposito d ON p.IDDeposito = d.IDDeposito
        WHERE p.IDProducto = @id
      `)

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    res.json(result.recordset[0])
  } catch (error) {
    console.error("Error obteniendo producto:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Crear producto
router.post("/", authenticateToken, authorizeRoles("administrador", "supervisor"), async (req, res) => {
  try {
    await connectDB()
    const { nombre, codigo, stockMinimo, descripcion, ubicacion, idDeposito, idCategoria } = req.body

    if (!nombre || !codigo) {
      return res.status(400).json({ message: "Nombre y código son requeridos" })
    }

    const pool = getPool()

    // Verificar que el código no exista
    const existingProduct = await pool
      .request()
      .input("codigo", sql.VarChar, codigo)
      .query("SELECT IDProducto FROM Producto WHERE Codigo = @codigo")

    if (existingProduct.recordset.length > 0) {
      return res.status(400).json({ message: "El código del producto ya existe" })
    }

    const result = await pool
      .request()
      .input("nombre", sql.VarChar, nombre)
      .input("codigo", sql.VarChar, codigo)
      .input("stockMinimo", sql.Int, stockMinimo || 0)
      .input("descripcion", sql.VarChar, descripcion)
      .input("ubicacion", sql.VarChar, ubicacion)
      .input("idDeposito", sql.Int, idDeposito)
      .input("idCategoria", sql.Int, idCategoria)
      .query(`
        INSERT INTO Producto (Nombre, Codigo, StockMinimo, Descripcion, Ubicacion, IDDeposito, IDCategoria)
        OUTPUT INSERTED.IDProducto
        VALUES (@nombre, @codigo, @stockMinimo, @descripcion, @ubicacion, @idDeposito, @idCategoria)
      `)

    res.status(201).json({
      message: "Producto creado exitosamente",
      id: result.recordset[0].IDProducto,
    })
  } catch (error) {
    console.error("Error creando producto:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Actualizar producto
router.put("/:id", authenticateToken, authorizeRoles("administrador", "supervisor"), async (req, res) => {
  try {
    await connectDB()
    const { nombre, codigo, stockMinimo, descripcion, ubicacion, idDeposito, idCategoria, estado } = req.body

    const pool = getPool()

    // Verificar que el código no exista en otro producto
    const existingProduct = await pool
      .request()
      .input("codigo", sql.VarChar, codigo)
      .input("id", sql.Int, req.params.id)
      .query("SELECT IDProducto FROM Producto WHERE Codigo = @codigo AND IDProducto != @id")

    if (existingProduct.recordset.length > 0) {
      return res.status(400).json({ message: "El código del producto ya existe" })
    }

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("nombre", sql.VarChar, nombre)
      .input("codigo", sql.VarChar, codigo)
      .input("stockMinimo", sql.Int, stockMinimo)
      .input("descripcion", sql.VarChar, descripcion)
      .input("ubicacion", sql.VarChar, ubicacion)
      .input("idDeposito", sql.Int, idDeposito)
      .input("idCategoria", sql.Int, idCategoria)
      .input("estado", sql.Bit, estado)
      .query(`
        UPDATE Producto 
        SET Nombre = @nombre, Codigo = @codigo, StockMinimo = @stockMinimo,
            Descripcion = @descripcion, Ubicacion = @ubicacion, 
            IDDeposito = @idDeposito, IDCategoria = @idCategoria, Estado = @estado
        WHERE IDProducto = @id
      `)

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    res.json({ message: "Producto actualizado exitosamente" })
  } catch (error) {
    console.error("Error actualizando producto:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Activar/Desactivar producto
router.patch(
  "/:id/toggle-status",
  authenticateToken,
  authorizeRoles("administrador", "supervisor"),
  async (req, res) => {
    try {
      await connectDB()
      const pool = getPool()

      const result = await pool
        .request()
        .input("id", sql.Int, req.params.id)
        .query(`
        UPDATE Producto 
        SET Estado = CASE WHEN Estado = 1 THEN 0 ELSE 1 END
        OUTPUT INSERTED.Estado
        WHERE IDProducto = @id
      `)

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Producto no encontrado" })
      }

      res.json({
        message: "Estado del producto actualizado",
        estado: result.recordset[0].Estado,
      })
    } catch (error) {
      console.error("Error cambiando estado del producto:", error)
      res.status(500).json({ message: "Error interno del servidor" })
    }
  },
)

module.exports = router
