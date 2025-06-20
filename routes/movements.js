const express = require("express")
const { connectDB, getPool, sql } = require("../config/database")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")

const router = express.Router()

// Obtener todos los movimientos
router.get("/", authenticateToken, async (req, res) => {
  try {
    await connectDB()
    const pool = getPool()

    const { tipo, fechaInicio, fechaFin, idProducto } = req.query

    let query = `
      SELECT 
        m.IDMovimiento, m.Tipo, m.Fecha, m.Cantidad, m.Observacion,
        p.Nombre as ProductoNombre, p.Codigo as ProductoCodigo,
        u.NombreUsuario
      FROM Movimiento m
      INNER JOIN Producto p ON m.IDProducto = p.IDProducto
      INNER JOIN Usuario u ON m.IDUsuario = u.IDUsuario
      WHERE 1=1
    `

    const request = pool.request()

    if (tipo) {
      query += " AND m.Tipo = @tipo"
      request.input("tipo", sql.VarChar, tipo)
    }

    if (fechaInicio) {
      query += " AND m.Fecha >= @fechaInicio"
      request.input("fechaInicio", sql.DateTime, fechaInicio)
    }

    if (fechaFin) {
      query += " AND m.Fecha <= @fechaFin"
      request.input("fechaFin", sql.DateTime, fechaFin)
    }

    if (idProducto) {
      query += " AND m.IDProducto = @idProducto"
      request.input("idProducto", sql.Int, idProducto)
    }

    query += " ORDER BY m.Fecha DESC"

    const result = await request.query(query)
    res.json(result.recordset)
  } catch (error) {
    console.error("Error obteniendo movimientos:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Crear movimiento (entrada o salida)
router.post("/", authenticateToken, async (req, res) => {
  try {
    await connectDB()
    const { tipo, cantidad, idProducto, observacion } = req.body

    if (!tipo || !cantidad || !idProducto) {
      return res.status(400).json({ message: "Tipo, cantidad y producto son requeridos" })
    }

    if (!["entrada", "salida"].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo debe ser "entrada" o "salida"' })
    }

    if (cantidad <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor a 0" })
    }

    const pool = getPool()
    const transaction = pool.transaction()

    try {
      await transaction.begin()

      // Obtener stock actual del producto
      const productResult = await transaction
        .request()
        .input("idProducto", sql.Int, idProducto)
        .query("SELECT CantidadStock, Nombre FROM Producto WHERE IDProducto = @idProducto AND Estado = 1")

      if (productResult.recordset.length === 0) {
        await transaction.rollback()
        return res.status(404).json({ message: "Producto no encontrado o inactivo" })
      }

      const stockActual = productResult.recordset[0].CantidadStock
      const nombreProducto = productResult.recordset[0].Nombre

      // Verificar stock suficiente para salidas
      if (tipo === "salida" && stockActual < cantidad) {
        await transaction.rollback()
        return res.status(400).json({
          message: `Stock insuficiente. Stock actual: ${stockActual}`,
        })
      }

      // Calcular nuevo stock
      const nuevoStock = tipo === "entrada" ? stockActual + cantidad : stockActual - cantidad

      // Crear el movimiento
      await transaction
        .request()
        .input("tipo", sql.VarChar, tipo)
        .input("cantidad", sql.Int, cantidad)
        .input("idProducto", sql.Int, idProducto)
        .input("idUsuario", sql.Int, req.user.IDUsuario)
        .input("observacion", sql.VarChar, observacion)
        .query(`
          INSERT INTO Movimiento (Tipo, Cantidad, IDProducto, IDUsuario, Observacion)
          VALUES (@tipo, @cantidad, @idProducto, @idUsuario, @observacion)
        `)

      // Actualizar stock del producto
      await transaction
        .request()
        .input("nuevoStock", sql.Int, nuevoStock)
        .input("idProducto", sql.Int, idProducto)
        .query("UPDATE Producto SET CantidadStock = @nuevoStock WHERE IDProducto = @idProducto")

      await transaction.commit()

      res.status(201).json({
        message: `Movimiento de ${tipo} registrado exitosamente`,
        producto: nombreProducto,
        stockAnterior: stockActual,
        stockActual: nuevoStock,
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error("Error creando movimiento:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Obtener resumen de movimientos
router.get("/summary", authenticateToken, async (req, res) => {
  try {
    await connectDB()
    const pool = getPool()

    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as TotalMovimientos,
        SUM(CASE WHEN Tipo = 'entrada' THEN Cantidad ELSE 0 END) as TotalEntradas,
        SUM(CASE WHEN Tipo = 'salida' THEN Cantidad ELSE 0 END) as TotalSalidas,
        COUNT(CASE WHEN Tipo = 'entrada' THEN 1 END) as MovimientosEntrada,
        COUNT(CASE WHEN Tipo = 'salida' THEN 1 END) as MovimientosSalida
      FROM Movimiento 
      WHERE MONTH(Fecha) = MONTH(GETDATE()) AND YEAR(Fecha) = YEAR(GETDATE())
    `)

    res.json(result.recordset[0])
  } catch (error) {
    console.error("Error obteniendo resumen:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

module.exports = router
