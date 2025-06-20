"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.Rol !== requiredRole) {
    return (
      <div className="access-denied">
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
