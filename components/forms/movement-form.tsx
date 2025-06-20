"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  IDProducto: number
  Nombre: string
  Codigo: string
  CantidadStock: number
}

interface MovementFormProps {
  product: Product
  onSuccess: () => void
  onCancel: () => void
}

export function MovementForm({ product, onSuccess, onCancel }: MovementFormProps) {
  const [formData, setFormData] = useState({
    tipo: "",
    cantidad: 1,
    observacion: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validar que no se pueda sacar más stock del disponible
    if (formData.tipo === "salida" && formData.cantidad > product.CantidadStock) {
      setError("No se puede sacar más cantidad de la disponible en stock")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/movimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo: formData.tipo,
          cantidad: formData.cantidad,
          idProducto: product.IDProducto,
          observacion: formData.observacion,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || "Error al registrar el movimiento")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{product.Nombre}</CardTitle>
          <CardDescription>
            Código: {product.Codigo} | Stock actual: {product.CantidadStock} unidades
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Movimiento *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="salida">Salida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad *</Label>
          <Input
            id="cantidad"
            type="number"
            min="1"
            max={formData.tipo === "salida" ? product.CantidadStock : undefined}
            value={formData.cantidad}
            onChange={(e) => setFormData({ ...formData, cantidad: Number.parseInt(e.target.value) || 1 })}
            required
            disabled={loading}
          />
          {formData.tipo === "salida" && (
            <p className="text-sm text-muted-foreground">Máximo disponible: {product.CantidadStock} unidades</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacion">Observación</Label>
          <Textarea
            id="observacion"
            value={formData.observacion}
            onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
            placeholder="Motivo del movimiento, proveedor, destino, etc."
            disabled={loading}
          />
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
          <Button type="submit" disabled={loading || !formData.tipo}>
            {loading ? "Registrando..." : "Registrar Movimiento"}
          </Button>
        </div>
      </form>
    </div>
  )
}
