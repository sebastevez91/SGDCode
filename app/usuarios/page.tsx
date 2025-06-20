"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, ToggleLeft, ToggleRight, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserForm } from "@/components/forms/user-form"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface User {
  IDUsuario: number
  NombreUsuario: string
  Rol: "administrador" | "supervisor" | "operario"
  Estado: boolean
  FechaCreacion: string
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (user: User) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/usuarios/${user.IDUsuario}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: !user.Estado }),
      })
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getRoleBadgeVariant = (rol: string) => {
    switch (rol) {
      case "administrador":
        return "destructive"
      case "supervisor":
        return "default"
      case "operario":
        return "secondary"
      default:
        return "outline"
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "NombreUsuario",
      header: "Usuario",
    },
    {
      accessorKey: "Rol",
      header: "Rol",
      cell: ({ row }) => {
        const rol = row.getValue("Rol") as string
        return (
          <Badge variant={getRoleBadgeVariant(rol)}>
            <Shield className="h-3 w-3 mr-1" />
            {rol.charAt(0).toUpperCase() + rol.slice(1)}
          </Badge>
        )
      },
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
      accessorKey: "FechaCreacion",
      header: "Fecha Creación",
      cell: ({ row }) => {
        const fecha = new Date(row.getValue("FechaCreacion"))
        return format(fecha, "dd/MM/yyyy", { locale: es })
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const user = row.original
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
        const canEdit = currentUser.id !== user.IDUsuario // No puede editarse a sí mismo

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingUser(user)
                setShowUserForm(true)
              }}
              disabled={!canEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user)} disabled={!canEdit}>
              {user.Estado ? (
                <ToggleRight className="h-4 w-4 text-green-500" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-500" />
              )}
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
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestión de usuarios del sistema</p>
        </div>
        <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUser(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
            </DialogHeader>
            <UserForm
              user={editingUser}
              onSuccess={() => {
                setShowUserForm(false)
                setEditingUser(null)
                fetchUsers()
              }}
              onCancel={() => {
                setShowUserForm(false)
                setEditingUser(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {users.filter((u) => u.Rol === "administrador").length}
            </div>
            <p className="text-xs text-muted-foreground">Con acceso completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supervisores</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{users.filter((u) => u.Rol === "supervisor").length}</div>
            <p className="text-xs text-muted-foreground">Gestión de inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operarios</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{users.filter((u) => u.Rol === "operario").length}</div>
            <p className="text-xs text-muted-foreground">Operaciones básicas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Gestión completa de usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} searchKey="NombreUsuario" searchPlaceholder="Buscar usuarios..." />
        </CardContent>
      </Card>
    </div>
  )
}
