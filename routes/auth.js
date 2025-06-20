const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { connectDB, getPool, sql } = require("../config/database")

const router = express.Router()

// Login
router.post("/login", async (req, res) => {
  try {
    await connectDB()
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Usuario y contraseña son requeridos" })
    }

    const pool = getPool()
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Usuario WHERE NombreUsuario = @username AND Estado = 1")

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    const user = result.recordset[0]
    const isValidPassword = await bcrypt.compare(password, user.Contraseña)

    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    const token = jwt.sign(
      { userId: user.IDUsuario, username: user.NombreUsuario, role: user.Rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    )

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.IDUsuario,
        username: user.NombreUsuario,
        role: user.Rol,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Verificar token
router.get("/verify", async (req, res) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token requerido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await connectDB()

    const pool = getPool()
    const result = await pool
      .request()
      .input("userId", sql.Int, decoded.userId)
      .query("SELECT IDUsuario, NombreUsuario, Rol FROM Usuario WHERE IDUsuario = @userId AND Estado = 1")

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Usuario no válido" })
    }

    res.json({
      valid: true,
      user: result.recordset[0],
    })
  } catch (error) {
    res.status(401).json({ message: "Token inválido" })
  }
})

module.exports = router
