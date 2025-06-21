import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"


export interface User {
  IDUsuario: number
  NombreUsuario: string
  Rol: "administrador" | "supervisor" | "operario"
  Estado: boolean
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.IDUsuario,
      username: user.NombreUsuario,
      role: user.Rol,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}
