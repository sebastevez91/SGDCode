"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  IDUsuario: number
  NombreUsuario: string
  Rol: "administrador" | "supervisor" | "operario"
  Estado: boolean
}

interface UserFormProps {
  user?: User | null
  onSuccess: () => void
  onCancel: () => void
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    contraseña: "",
    confirmarContraseña: "",
    rol: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        nombreUsuario: user.NombreUsuario,
        contraseña: "",
        confirmarContraseña: "",
        rol: user.Rol,
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validar contraseñas
    if (!user && formData.contraseña !== formData.confirmarContraseña) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (!user && formData.contraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const url = user ? `/api/usuarios/${user.IDUsuario}` : "/api/usuarios"
      const method = user ? "PUT" : "POST"

      const body: any = {
        nombreUsuario: formData.nombreUsuario,
        rol: formData.rol,
      }

      // Solo incluir contraseña si es un usuario nuevo o si se está cambiando
      if (!user || formData.contraseña) {
        body.contraseña = formData.contraseña
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || "Error al guardar el usuario")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombreUsuario">Nombre de Usuario *</Label>
        <Input
          id="nombreUsuario"
          value={formData.nombreUsuario}
          onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rol">Rol *</Label>
        <Select
          value={formData.rol}
          onValueChange={(value) => setFormData({ ...formData, rol: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="administrador">Administrador</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="operario">Operario</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contraseña">
          {user ? "Nueva Contraseña (dejar vacío para mantener actual)" : "Contraseña *"}
        </Label>
        <Input
          id="contraseña"
          type="password"
          value={formData.contraseña}
          onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
          required={!user}
          disabled={loading}
        />
      </div>

      {(!user || formData.contraseña) && (
        <div className="space-y-2">
          <Label htmlFor="confirmarContraseña">Confirmar Contraseña *</Label>
          <Input
            id="confirmarContraseña"
            type="password"
            value={formData.confirmarContraseña}
            onChange={(e) => setFormData({ ...formData, confirmarContraseña: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      )}

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
          {loading ? "Guardando..." : user ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}
