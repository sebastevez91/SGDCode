"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Package, TrendingUp, Users, Home, LogOut, Menu, X } from "lucide-react"

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard", roles: ["administrador", "supervisor", "operario"] },
    { path: "/products", icon: Package, label: "Productos", roles: ["administrador", "supervisor", "operario"] },
    { path: "/movements", icon: TrendingUp, label: "Movimientos", roles: ["administrador", "supervisor", "operario"] },
    { path: "/users", icon: Users, label: "Usuarios", roles: ["administrador"] },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.Rol))

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h2>Gestión Depósito</h2>
          <button className="sidebar-toggle desktop-hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-name">{user?.NombreUsuario}</p>
            <p className="user-role">{user?.Rol}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <button className="sidebar-toggle mobile-only" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1>Sistema de Gestión de Depósito</h1>
        </header>

        <main className="content">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

export default Layout
