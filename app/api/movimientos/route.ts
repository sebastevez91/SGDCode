import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = verifyToken(token || "")

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const pool = await getConnection()
    const result = await pool.request().query(`
      SELECT 
        m.IDMovimiento,
        m.Tipo,
        m.Fecha,
        m.Cantidad,
        m.Observacion,
        p.Nombre as ProductoNombre,
        p.Codigo as ProductoCodigo,
        u.NombreUsuario
      FROM Movimiento m
      INNER JOIN Producto p ON m.IDProducto = p.IDProducto
      INNER JOIN Usuario u ON m.IDUsuario = u.IDUsuario
      ORDER BY m.Fecha DESC
    `)

    return NextResponse.json(result.recordset)
  } catch (error) {
    console.error("Error al obtener movimientos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = verifyToken(token || "")

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { tipo, cantidad, idProducto, observacion } = await request.json()

    const pool = await getConnection()

    // Iniciar transacción
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      // Insertar movimiento
      await transaction
        .request()
        .input("tipo", sql.VarChar, tipo)
        .input("cantidad", sql.Int, cantidad)
        .input("idProducto", sql.Int, idProducto)
        .input("idUsuario", sql.Int, user.id)
        .input("observacion", sql.VarChar, observacion)
        .query(`
          INSERT INTO Movimiento (Tipo, Cantidad, IDProducto, IDUsuario, Observacion)
          VALUES (@tipo, @cantidad, @idProducto, @idUsuario, @observacion)
        `)

      // Actualizar stock del producto
      const stockChange = tipo === "entrada" ? cantidad : -cantidad
      await transaction
        .request()
        .input("stockChange", sql.Int, stockChange)
        .input("idProducto", sql.Int, idProducto)
        .query(`
          UPDATE Producto 
          SET CantidadStock = CantidadStock + @stockChange
          WHERE IDProducto = @idProducto
        `)

      await transaction.commit()
      return NextResponse.json({ message: "Movimiento registrado exitosamente" })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error("Error al crear movimiento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
