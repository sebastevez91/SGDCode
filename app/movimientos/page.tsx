"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Movement {
  IDMovimiento: number
  Tipo: "entrada" | "salida"
  Fecha: string
  Cantidad: number
  Observacion: string
  ProductoNombre: string
  ProductoCodigo: string
  NombreUsuario: string
}

export default function MovimientosPage() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMovimientos: 0,
    entradasHoy: 0,
    salidasHoy: 0,
    movimientosHoy: 0,
  })

  const fetchMovements = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/movimientos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMovements(data)

        // Calcular estadísticas
        const today = new Date().toDateString()
        const movimientosHoy = data.filter((m: Movement) => new Date(m.Fecha).toDateString() === today)

        setStats({
          totalMovimientos: data.length,
          entradasHoy: movimientosHoy.filter((m: Movement) => m.Tipo === "entrada").length,
          salidasHoy: movimientosHoy.filter((m: Movement) => m.Tipo === "salida").length,
          movimientosHoy: movimientosHoy.length,
        })
      }
    } catch (error) {
      console.error("Error al cargar movimientos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [])

  const columns: ColumnDef<Movement>[] = [
    {
      accessorKey: "Fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const fecha = new Date(row.getValue("Fecha"))
        return format(fecha, "dd/MM/yyyy HH:mm", { locale: es })
      },
    },
    {
      accessorKey: "Tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const tipo = row.getValue("Tipo") as string
        return (
          <Badge variant={tipo === "entrada" ? "default" : "destructive"}>
            <div className="flex items-center gap-1">
              {tipo === "entrada" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </div>
          </Badge>
        )
      },
    },
    {
      accessorKey: "ProductoCodigo",
      header: "Código",
    },
    {
      accessorKey: "ProductoNombre",
      header: "Producto",
    },
    {
      accessorKey: "Cantidad",
      header: "Cantidad",
      cell: ({ row }) => {
        const cantidad = row.getValue("Cantidad") as number
        const tipo = row.original.Tipo
        return (
          <span className={tipo === "entrada" ? "text-green-600" : "text-red-600"}>
            {tipo === "entrada" ? "+" : "-"}
            {cantidad}
          </span>
        )
      },
    },
    {
      accessorKey: "NombreUsuario",
      header: "Usuario",
    },
    {
      accessorKey: "Observacion",
      header: "Observación",
      cell: ({ row }) => {
        const observacion = row.getValue("Observacion") as string
        return observacion || "-"
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Movimientos</h1>
        <p className="text-muted-foreground">Historial de entradas y salidas de productos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimientos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMovimientos}</div>
            <p className="text-xs text-muted-foreground">Movimientos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.movimientosHoy}</div>
            <p className="text-xs text-muted-foreground">Movimientos de hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.entradasHoy}</div>
            <p className="text-xs text-muted-foreground">Entradas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salidas Hoy</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.salidasHoy}</div>
            <p className="text-xs text-muted-foreground">Salidas registradas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>Registro completo de entradas y salidas de productos</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={movements}
            searchKey="ProductoNombre"
            searchPlaceholder="Buscar por producto..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
