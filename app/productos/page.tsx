"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProductForm } from "@/components/forms/product-form"
import { MovementForm } from "@/components/forms/movement-form"

interface Product {
  IDProducto: number
  Nombre: string
  Codigo: string
  CantidadStock: number
  StockMinimo: number
  Descripcion: string
  Ubicacion: string
  Estado: boolean
  Nombre_Categoria: string
  DepositoUbicacion: string
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showMovementForm, setShowMovementForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/productos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error al cargar productos:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (product: Product) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/productos/${product.IDProducto}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: !product.Estado }),
      })
      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "Codigo",
      header: "Código",
    },
    {
      accessorKey: "Nombre",
      header: "Nombre",
    },
    {
      accessorKey: "Nombre_Categoria",
      header: "Categoría",
    },
    {
      accessorKey: "CantidadStock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("CantidadStock") as number
        const stockMinimo = row.original.StockMinimo
        const isLowStock = stock <= stockMinimo

        return (
          <div className="flex items-center gap-2">
            <span className={isLowStock ? "text-red-600 font-semibold" : ""}>{stock}</span>
            {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        )
      },
    },
    {
      accessorKey: "Ubicacion",
      header: "Ubicación",
    },
    {
      accessorKey: "Estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("Estado") as boolean
        return <Badge variant={estado ? "default" : "secondary"}>{estado ? "Activo" : "Inactivo"}</Badge>
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingProduct(product)
                setShowProductForm(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleProductStatus(product)}>
              {product.Estado ? (
                <ToggleRight className="h-4 w-4 text-green-500" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-500" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedProduct(product)
                setShowMovementForm(true)
              }}
            >
              Movimiento
            </Button>
          </div>
        )
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestión del inventario de productos</p>
        </div>
        <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setShowProductForm(false)
                setEditingProduct(null)
                fetchProducts()
              }}
              onCancel={() => {
                setShowProductForm(false)
                setEditingProduct(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            Total de productos: {products.length} | Activos: {products.filter((p) => p.Estado).length} | Stock bajo:{" "}
            {products.filter((p) => p.CantidadStock <= p.StockMinimo).length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={products} searchKey="Nombre" searchPlaceholder="Buscar productos..." />
        </CardContent>
      </Card>

      <Dialog open={showMovementForm} onOpenChange={setShowMovementForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <MovementForm
              product={selectedProduct}
              onSuccess={() => {
                setShowMovementForm(false)
                setSelectedProduct(null)
                fetchProducts()
              }}
              onCancel={() => {
                setShowMovementForm(false)
                setSelectedProduct(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
