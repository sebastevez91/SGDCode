const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/products")
const movementRoutes = require("./routes/movements")
const userRoutes = require("./routes/users")
const categoryRoutes = require("./routes/categories")
const warehouseRoutes = require("./routes/warehouses")

const app = express()

// Middleware de seguridad
app.use(helmet())
app.use(cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo
})
app.use(limiter)

// Middleware para parsing JSON
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/movements", movementRoutes)
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/warehouses", warehouseRoutes)

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente", timestamp: new Date() })
})

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`)
})
