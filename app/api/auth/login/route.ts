import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Usuario WHERE NombreUsuario = @username AND Estado = 1")

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 })
    }

    const user = result.recordset[0]

    if (!comparePassword(password, user.Contraseña)) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }

    const token = generateToken(user)

    return NextResponse.json({
      token,
      user: {
        id: user.IDUsuario,
        username: user.NombreUsuario,
        role: user.Rol,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
