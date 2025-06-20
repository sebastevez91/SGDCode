import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import { verifyToken, hasPermission } from "@/lib/auth"

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
        p.IDProducto,
        p.Nombre,
        p.Codigo,
        p.CantidadStock,
        p.StockMinimo,
        p.Descripcion,
        p.Ubicacion,
        p.Estado,
        c.Nombre_Categoria,
        d.Ubicacion as DepositoUbicacion
      FROM Producto p
      LEFT JOIN Categoria c ON p.IDCategoria = c.IDCategoria
      LEFT JOIN Deposito d ON p.IDDeposito = d.IDDeposito
      ORDER BY p.Nombre
    `)

    return NextResponse.json(result.recordset)
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = verifyToken(token || "")

    if (!user || !hasPermission(user.role, ["administrador", "supervisor"])) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { nombre, codigo, descripcion, ubicacion, stockMinimo, idCategoria, idDeposito } = await request.json()

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("nombre", sql.VarChar, nombre)
      .input("codigo", sql.VarChar, codigo)
      .input("descripcion", sql.VarChar, descripcion)
      .input("ubicacion", sql.VarChar, ubicacion)
      .input("stockMinimo", sql.Int, stockMinimo)
      .input("idCategoria", sql.Int, idCategoria)
      .input("idDeposito", sql.Int, idDeposito)
      .query(`
        INSERT INTO Producto (Nombre, Codigo, Descripcion, Ubicacion, StockMinimo, IDCategoria, IDDeposito)
        VALUES (@nombre, @codigo, @descripcion, @ubicacion, @stockMinimo, @idCategoria, @idDeposito);
        SELECT SCOPE_IDENTITY() as IDProducto;
      `)

    return NextResponse.json({
      message: "Producto creado exitosamente",
      id: result.recordset[0].IDProducto,
    })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
