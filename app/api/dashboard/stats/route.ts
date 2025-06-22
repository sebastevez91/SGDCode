import { NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

export async function GET() {
  try {
    const pool = await getConnection()

    const [totalProductos, productosStockBajo, movimientosHoy, entradasHoy, salidasHoy] = await Promise.all([
      pool.request().query("SELECT COUNT(*) as total FROM Producto WHERE Estado = 1"),
      pool.request().query("SELECT COUNT(*) as bajos FROM Producto WHERE CantidadStock <= StockMinimo AND Estado = 1"),
      pool.request().query("SELECT COUNT(*) as total FROM Movimiento WHERE CONVERT(date, Fecha) = CONVERT(date, GETDATE())"),
      pool.request().query("SELECT COUNT(*) as total FROM Movimiento WHERE Tipo = 'entrada' AND CONVERT(date, Fecha) = CONVERT(date, GETDATE())"),
      pool.request().query("SELECT COUNT(*) as total FROM Movimiento WHERE Tipo = 'salida' AND CONVERT(date, Fecha) = CONVERT(date, GETDATE())"),
    ])

    return NextResponse.json({
      totalProductos: totalProductos.recordset[0].total,
      productosStockBajo: productosStockBajo.recordset[0].bajos,
      movimientosHoy: movimientosHoy.recordset[0].total,
      entradasHoy: entradasHoy.recordset[0].total,
      salidasHoy: salidasHoy.recordset[0].total,
    })
  } catch (error) {
    console.error("Error obteniendo datos del dashboard:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
