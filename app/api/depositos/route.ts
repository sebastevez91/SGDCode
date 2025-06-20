import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"
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
      SELECT IDDeposito, Ubicacion
      FROM Deposito
      WHERE Estado = 1
      ORDER BY Ubicacion
    `)

    return NextResponse.json(result.recordset)
  } catch (error) {
    console.error("Error al obtener depósitos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
