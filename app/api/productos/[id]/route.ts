import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import { verifyToken, hasPermission } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = verifyToken(token || "")

    if (!user || !hasPermission(user.role, ["administrador", "supervisor"])) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { nombre, codigo, descripcion, ubicacion, stockMinimo, idCategoria, idDeposito } = await request.json()

    const pool = await getConnection()
    await pool
      .request()
      .input("id", sql.Int, Number.parseInt(params.id))
      .input("nombre", sql.VarChar, nombre)
      .input("codigo", sql.VarChar, codigo)
      .input("descripcion", sql.VarChar, descripcion)
      .input("ubicacion", sql.VarChar, ubicacion)
      .input("stockMinimo", sql.Int, stockMinimo)
      .input("idCategoria", sql.Int, idCategoria)
      .input("idDeposito", sql.Int, idDeposito)
      .query(`
        UPDATE Producto 
        SET Nombre = @nombre, Codigo = @codigo, Descripcion = @descripcion, 
            Ubicacion = @ubicacion, StockMinimo = @stockMinimo, 
            IDCategoria = @idCategoria, IDDeposito = @idDeposito
        WHERE IDProducto = @id
      `)

    return NextResponse.json({ message: "Producto actualizado exitosamente" })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = verifyToken(token || "")

    if (!user || !hasPermission(user.role, ["administrador", "supervisor"])) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { estado } = await request.json()

    const pool = await getConnection()
    await pool
      .request()
      .input("id", sql.Int, Number.parseInt(params.id))
      .input("estado", sql.Bit, estado)
      .query("UPDATE Producto SET Estado = @estado WHERE IDProducto = @id")

    return NextResponse.json({ message: "Estado actualizado exitosamente" })
  } catch (error) {
    console.error("Error al cambiar estado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
