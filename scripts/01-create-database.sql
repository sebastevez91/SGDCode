-- Crear base de datos
CREATE DATABASE GestionDeposito;
GO

USE GestionDeposito;
GO

-- Tabla Categoria
CREATE TABLE [Categoria] (
  [IDCategoria] INT IDENTITY(1,1) PRIMARY KEY,
  [Nombre_Categoria] VARCHAR(100) NOT NULL,
  [Estado] BIT DEFAULT 1
);

-- Tabla Deposito
CREATE TABLE [Deposito] (
  [IDDeposito] INT IDENTITY(1,1) PRIMARY KEY,
  [Ubicacion] VARCHAR(200) NOT NULL,
  [Estado] BIT DEFAULT 1
);

-- Tabla Usuario
CREATE TABLE [Usuario] (
  [IDUsuario] INT IDENTITY(1,1) PRIMARY KEY,
  [NombreUsuario] VARCHAR(50) NOT NULL UNIQUE,
  [Contraseña] VARCHAR(255) NOT NULL,
  [Rol] VARCHAR(20) NOT NULL CHECK ([Rol] IN ('administrador', 'supervisor', 'operario')),
  [Estado] BIT DEFAULT 1,
  [FechaCreacion] DATETIME DEFAULT GETDATE()
);

-- Tabla Producto
CREATE TABLE [Producto] (
  [IDProducto] INT IDENTITY(1,1) PRIMARY KEY,
  [Nombre] VARCHAR(100) NOT NULL,
  [Codigo] VARCHAR(50) NOT NULL UNIQUE,
  [CantidadStock] INT DEFAULT 0,
  [StockMinimo] INT DEFAULT 0,
  [Descripcion] VARCHAR(500),
  [Ubicacion] VARCHAR(100),
  [IDDeposito] INT,
  [IDCategoria] INT,
  [Estado] BIT DEFAULT 1,
  [FechaCreacion] DATETIME DEFAULT GETDATE(),
  CONSTRAINT [FK_Producto_Deposito]
    FOREIGN KEY ([IDDeposito])
      REFERENCES [Deposito]([IDDeposito]),
  CONSTRAINT [FK_Producto_Categoria]
    FOREIGN KEY ([IDCategoria])
      REFERENCES [Categoria]([IDCategoria])
);

-- Tabla Movimiento
CREATE TABLE [Movimiento] (
  [IDMovimiento] INT IDENTITY(1,1) PRIMARY KEY,
  [Tipo] VARCHAR(10) NOT NULL CHECK ([Tipo] IN ('entrada', 'salida')),
  [Fecha] DATETIME DEFAULT GETDATE(),
  [Cantidad] INT NOT NULL,
  [IDProducto] INT NOT NULL,
  [IDUsuario] INT NOT NULL,
  [Observacion] VARCHAR(500),
  CONSTRAINT [FK_Movimiento_Producto]
    FOREIGN KEY ([IDProducto])
      REFERENCES [Producto]([IDProducto]),
  CONSTRAINT [FK_Movimiento_Usuario]
    FOREIGN KEY ([IDUsuario])
      REFERENCES [Usuario]([IDUsuario])
);
