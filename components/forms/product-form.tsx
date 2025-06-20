"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  IDProducto: number
  Nombre: string
  Codigo: string
  CantidadStock: number
  StockMinimo: number
  Descripcion: string
  Ubicacion: string
  Estado: boolean
  IDCategoria: number
  IDDeposito: number
}

interface Category {
  IDCategoria: number
  Nombre_Categoria: string
}

interface Deposito {
  IDDeposito: number
  Ubicacion: string
}

interface ProductFormProps {
  product?: Product | null
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    ubicacion: "",
    stockMinimo: 0,
    idCategoria: "",
    idDeposito: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.Nombre,
        codigo: product.Codigo,
        descripcion: product.Descripcion || "",
        ubicacion: product.Ubicacion || "",
        stockMinimo: product.StockMinimo,
        idCategoria: product.IDCategoria?.toString() || "",
        idDeposito: product.IDDeposito?.toString() || "",
      })
    }
    fetchCategories()
    fetchDepositos()
  }, [product])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/categorias", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error)
    }
  }

  const fetchDepositos = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/depositos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDepositos(data)
      }
    } catch (error) {
      console.error("Error al cargar depósitos:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const url = product ? `/api/productos/${product.IDProducto}` : "/api/productos"
      const method = product ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          codigo: formData.codigo,
          descripcion: formData.descripcion,
          ubicacion: formData.ubicacion,
          stockMinimo: Number.parseInt(formData.stockMinimo.toString()),
          idCategoria: Number.parseInt(formData.idCategoria),
          idDeposito: Number.parseInt(formData.idDeposito),
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || "Error al guardar el producto")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría *</Label>
          <Select
            value={formData.idCategoria}
            onValueChange={(value) => setFormData({ ...formData, idCategoria: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.IDCategoria} value={category.IDCategoria.toString()}>
                  {category.Nombre_Categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposito">Depósito *</Label>
          <Select
            value={formData.idDeposito}
            onValueChange={(value) => setFormData({ ...formData, idDeposito: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar depósito" />
            </SelectTrigger>
            <SelectContent>
              {depositos.map((deposito) => (
                <SelectItem key={deposito.IDDeposito} value={deposito.IDDeposito.toString()}>
                  {deposito.Ubicacion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ubicacion">Ubicación</Label>
          <Input
            id="ubicacion"
            value={formData.ubicacion}
            onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockMinimo">Stock Mínimo</Label>
          <Input
            id="stockMinimo"
            type="number"
            min="0"
            value={formData.stockMinimo}
            onChange={(e) => setFormData({ ...formData, stockMinimo: Number.parseInt(e.target.value) || 0 })}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : product ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}
