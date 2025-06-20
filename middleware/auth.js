const jwt = require("jsonwebtoken")
const { getPool, sql } = require("../config/database")

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token de acceso requerido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verificar que el usuario existe y está activo
    const pool = getPool()
    const result = await pool
      .request()
      .input("userId", sql.Int, decoded.userId)
      .query("SELECT IDUsuario, NombreUsuario, Rol, Estado FROM Usuario WHERE IDUsuario = @userId AND Estado = 1")

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Usuario no válido" })
    }

    req.user = result.recordset[0]
    next()
  } catch (error) {
    console.error("Error en autenticación:", error)
    return res.status(403).json({ message: "Token no válido" })
  }
}

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" })
    }

    if (!roles.includes(req.user.Rol)) {
      return res.status(403).json({ message: "No tienes permisos para acceder a este recurso" })
    }

    next()
  }
}

module.exports = { authenticateToken, authorizeRoles }
