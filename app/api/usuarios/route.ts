import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import { verifyToken, hasPermission, hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = verifyToken(token || "")

    if (!user || !hasPermission(user.role, ["administrador"])) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const pool = await getConnection()
    const result = await pool.request().query(`
      SELECT IDUsuario, NombreUsuario, Rol, Estado, FechaCreacion
      FROM Usuario
      ORDER BY NombreUsuario
    `)

    return NextResponse.json(result.recordset)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const user = verifyToken(token || "")

    if (!user || !hasPermission(user.role, ["administrador"])) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { nombreUsuario, contraseña, rol } = await request.json()

    const pool = await getConnection()
    const hashedPassword = hashPassword(contraseña)

    const result = await pool
      .request()
      .input("nombreUsuario", sql.VarChar, nombreUsuario)
      .input("contraseña", sql.VarChar, hashedPassword)
      .input("rol", sql.VarChar, rol)
      .query(`
        INSERT INTO Usuario (NombreUsuario, Contraseña, Rol)
        VALUES (@nombreUsuario, @contraseña, @rol);
        SELECT SCOPE_IDENTITY() as IDUsuario;
      `)

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      id: result.recordset[0].IDUsuario,
    })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
