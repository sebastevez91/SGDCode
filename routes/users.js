const express = require("express")
const bcrypt = require("bcryptjs")
const { connectDB, getPool, sql } = require("../config/database")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")

const router = express.Router()

// Solo administradores pueden acceder a estas rutas
router.use(authenticateToken)
router.use(authorizeRoles("administrador"))

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    await connectDB()
    const pool = getPool()

    const result = await pool.request().query(`
      SELECT IDUsuario, NombreUsuario, Rol, Estado, FechaCreacion
      FROM Usuario
      ORDER BY FechaCreacion DESC
    `)

    res.json(result.recordset)
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Crear usuario
router.post("/", async (req, res) => {
  try {
    await connectDB()
    const { nombreUsuario, contraseña, rol } = req.body

    if (!nombreUsuario || !contraseña || !rol) {
      return res.status(400).json({ message: "Todos los campos son requeridos" })
    }

    if (!["administrador", "supervisor", "operario"].includes(rol)) {
      return res.status(400).json({ message: "Rol no válido" })
    }

    if (contraseña.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" })
    }

    const pool = getPool()

    // Verificar que el usuario no exista
    const existingUser = await pool
      .request()
      .input("nombreUsuario", sql.VarChar, nombreUsuario)
      .query("SELECT IDUsuario FROM Usuario WHERE NombreUsuario = @nombreUsuario")

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: "El nombre de usuario ya existe" })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10)

    const result = await pool
      .request()
      .input("nombreUsuario", sql.VarChar, nombreUsuario)
      .input("contraseña", sql.VarChar, hashedPassword)
      .input("rol", sql.VarChar, rol)
      .query(`
        INSERT INTO Usuario (NombreUsuario, Contraseña, Rol)
        OUTPUT INSERTED.IDUsuario
        VALUES (@nombreUsuario, @contraseña, @rol)
      `)

    res.status(201).json({
      message: "Usuario creado exitosamente",
      id: result.recordset[0].IDUsuario,
    })
  } catch (error) {
    console.error("Error creando usuario:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Actualizar usuario
router.put("/:id", async (req, res) => {
  try {
    await connectDB()
    const { nombreUsuario, rol, estado } = req.body

    if (!nombreUsuario || !rol) {
      return res.status(400).json({ message: "Nombre de usuario y rol son requeridos" })
    }

    if (!["administrador", "supervisor", "operario"].includes(rol)) {
      return res.status(400).json({ message: "Rol no válido" })
    }

    const pool = getPool()

    // Verificar que el usuario no exista en otro registro
    const existingUser = await pool
      .request()
      .input("nombreUsuario", sql.VarChar, nombreUsuario)
      .input("id", sql.Int, req.params.id)
      .query("SELECT IDUsuario FROM Usuario WHERE NombreUsuario = @nombreUsuario AND IDUsuario != @id")

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: "El nombre de usuario ya existe" })
    }

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("nombreUsuario", sql.VarChar, nombreUsuario)
      .input("rol", sql.VarChar, rol)
      .input("estado", sql.Bit, estado !== undefined ? estado : true)
      .query(`
        UPDATE Usuario 
        SET NombreUsuario = @nombreUsuario, Rol = @rol, Estado = @estado
        WHERE IDUsuario = @id
      `)

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    res.json({ message: "Usuario actualizado exitosamente" })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Cambiar contraseña
router.patch("/:id/password", async (req, res) => {
  try {
    await connectDB()
    const { nuevaContraseña } = req.body

    if (!nuevaContraseña || nuevaContraseña.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" })
    }

    const hashedPassword = await bcrypt.hash(nuevaContraseña, 10)

    const pool = getPool()
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("contraseña", sql.VarChar, hashedPassword)
      .query("UPDATE Usuario SET Contraseña = @contraseña WHERE IDUsuario = @id")

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    res.json({ message: "Contraseña actualizada exitosamente" })
  } catch (error) {
    console.error("Error actualizando contraseña:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Activar/Desactivar usuario
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    await connectDB()
    const pool = getPool()

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`
        UPDATE Usuario 
        SET Estado = CASE WHEN Estado = 1 THEN 0 ELSE 1 END
        OUTPUT INSERTED.Estado
        WHERE IDUsuario = @id
      `)

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    res.json({
      message: "Estado del usuario actualizado",
      estado: result.recordset[0].Estado,
    })
  } catch (error) {
    console.error("Error cambiando estado del usuario:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

module.exports = router
