import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import { verifyToken, hasPermission, hashPassword } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = verifyToken(token || "")

    if (!user || !hasPermission(user.role, ["administrador"])) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { nombreUsuario, contraseña, rol } = await request.json()

    const pool = await getConnection()

    if (contraseña) {
      const hashedPassword = hashPassword(contraseña)
      await pool
        .request()
        .input("id", sql.Int, Number.parseInt(params.id))
        .input("nombreUsuario", sql.VarChar, nombreUsuario)
        .input("contraseña", sql.VarChar, hashedPassword)
        .input("rol", sql.VarChar, rol)
        .query(`
          UPDATE Usuario 
          SET NombreUsuario = @nombreUsuario, Contraseña = @contraseña, Rol = @rol
          WHERE IDUsuario = @id
        `)
    } else {
      await pool
        .request()
        .input("id", sql.Int, Number.parseInt(params.id))
        .input("nombreUsuario", sql.VarChar, nombreUsuario)
        .input("rol", sql.VarChar, rol)
        .query(`
          UPDATE Usuario 
          SET NombreUsuario = @nombreUsuario, Rol = @rol
          WHERE IDUsuario = @id
        `)
    }

    return NextResponse.json({ message: "Usuario actualizado exitosamente" })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = verifyToken(token || "")

    if (!user || !hasPermission(user.role, ["administrador"])) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { estado } = await request.json()

    const pool = await getConnection()
    await pool
      .request()
      .input("id", sql.Int, Number.parseInt(params.id))
      .input("estado", sql.Bit, estado)
      .query("UPDATE Usuario SET Estado = @estado WHERE IDUsuario = @id")

    return NextResponse.json({ message: "Estado actualizado exitosamente" })
  } catch (error) {
    console.error("Error al cambiar estado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
