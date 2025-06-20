"use client"

import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"
import { LogIn, User, Lock } from "lucide-react"

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(credentials.username, credentials.password)

    if (result.success) {
      toast.success("Inicio de sesión exitoso")
    } else {
      toast.error(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogIn size={48} className="login-icon" />
          <h1>Gestión de Depósito</h1>
          <p>Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <User size={20} />
              Usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={20} />
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Usuario por defecto: <strong>admin</strong>
          </p>
          <p>
            Contraseña: <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
