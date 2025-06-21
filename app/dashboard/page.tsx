"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface DashboardStats {
  totalProductos: number
  productosStockBajo: number
  movimientosHoy: number
  entradasHoy: number
  salidasHoy: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProductos: 0,
    productosStockBajo: 0,
    movimientosHoy: 0,
    entradasHoy: 0,
    salidasHoy: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de estadísticas
    setTimeout(() => {
      setStats({
        totalProductos: 156,
        productosStockBajo: 8,
        movimientosHoy: 23,
        entradasHoy: 15,
        salidasHoy: 8,
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tablero principal</h1>
        <p className="text-muted-foreground">Resumen general del estado del depósito</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProductos}</div>
            <p className="text-xs text-muted-foreground">Productos en inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.productosStockBajo}</div>
            <p className="text-xs text-muted-foreground">Productos con stock mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.entradasHoy}</div>
            <p className="text-xs text-muted-foreground">Movimientos de entrada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salidas Hoy</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.salidasHoy}</div>
            <p className="text-xs text-muted-foreground">Movimientos de salida</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos con Stock Bajo</CardTitle>
            <CardDescription>Productos que requieren reposición</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="font-medium">Papel A4</span>
                <span className="text-sm text-orange-600">15 unidades</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="font-medium">Taladro Bosch</span>
                <span className="text-sm text-orange-600">2 unidades</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="font-medium">Laptop Dell</span>
                <span className="text-sm text-orange-600">4 unidades</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
            <CardDescription>Últimos movimientos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border-l-4 border-green-500 bg-green-50">
                <div>
                  <p className="font-medium">Entrada - Papel A4</p>
                  <p className="text-sm text-muted-foreground">hace 2 horas</p>
                </div>
                <span className="text-green-600 font-medium">+50</span>
              </div>
              <div className="flex justify-between items-center p-2 border-l-4 border-red-500 bg-red-50">
                <div>
                  <p className="font-medium">Salida - Laptop Dell</p>
                  <p className="text-sm text-muted-foreground">hace 4 horas</p>
                </div>
                <span className="text-red-600 font-medium">-2</span>
              </div>
              <div className="flex justify-between items-center p-2 border-l-4 border-green-500 bg-green-50">
                <div>
                  <p className="font-medium">Entrada - Taladro Bosch</p>
                  <p className="text-sm text-muted-foreground">hace 6 horas</p>
                </div>
                <span className="text-green-600 font-medium">+5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
