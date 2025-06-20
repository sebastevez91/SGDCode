"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalMovements: 0,
    totalEntradas: 0,
    totalSalidas: 0,
  })
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [recentMovements, setRecentMovements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, movementsRes, summaryRes] = await Promise.all([
        axios.get("/api/products"),
        axios.get("/api/movements?limit=5"),
        axios.get("/api/movements/summary"),
      ])

      const products = productsRes.data
      const lowStock = products.filter((p) => p.CantidadStock <= p.StockMinimo && p.Estado)

      setStats({
        totalProducts: products.filter((p) => p.Estado).length,
        lowStockProducts: lowStock.length,
        ...summaryRes.data,
      })

      setLowStockProducts(lowStock.slice(0, 5))
      setRecentMovements(movementsRes.data.slice(0, 5))
    } catch (error) {
      console.error("Error cargando dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Resumen general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Productos Activos</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.lowStockProducts}</h3>
            <p>Stock Bajo</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalEntradas || 0}</h3>
            <p>Entradas (Este Mes)</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalSalidas || 0}</h3>
            <p>Salidas (Este Mes)</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Low Stock Products */}
        <div className="dashboard-section">
          <h2>Productos con Stock Bajo</h2>
          {lowStockProducts.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.IDProducto}>
                      <td>{product.Nombre}</td>
                      <td>{product.Codigo}</td>
                      <td className="text-danger">{product.CantidadStock}</td>
                      <td>{product.StockMinimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No hay productos con stock bajo</p>
          )}
        </div>

        {/* Recent Movements */}
        <div className="dashboard-section">
          <h2>Movimientos Recientes</h2>
          {recentMovements.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((movement) => (
                    <tr key={movement.IDMovimiento}>
                      <td>{new Date(movement.Fecha).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${movement.Tipo === "entrada" ? "success" : "danger"}`}>
                          {movement.Tipo}
                        </span>
                      </td>
                      <td>{movement.ProductoNombre}</td>
                      <td>{movement.Cantidad}</td>
                      <td>{movement.NombreUsuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No hay movimientos recientes</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
