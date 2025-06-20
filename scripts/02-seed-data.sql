USE GestionDeposito;
GO

-- Insertar categorías
INSERT INTO [Categoria] ([Nombre_Categoria]) VALUES 
('Electrónicos'),
('Herramientas'),
('Oficina'),
('Limpieza'),
('Seguridad');

-- Insertar depósitos
INSERT INTO [Deposito] ([Ubicacion]) VALUES 
('Depósito Principal - Sector A'),
('Depósito Principal - Sector B'),
('Depósito Secundario');

-- Insertar usuario administrador por defecto
INSERT INTO [Usuario] ([NombreUsuario], [Contraseña], [Rol]) VALUES 
('admin', '$2b$10$rOzJaHq8GQeWqx8tZqKOHOxK8QxK8QxK8QxK8QxK8QxK8QxK8Qx', 'administrador');

-- Insertar productos de ejemplo
INSERT INTO [Producto] ([Nombre], [Codigo], [CantidadStock], [StockMinimo], [Descripcion], [Ubicacion], [IDDeposito], [IDCategoria]) VALUES 
('Laptop Dell', 'ELEC001', 10, 5, 'Laptop Dell Inspiron 15', 'Estante A1', 1, 1),
('Taladro Bosch', 'HERR001', 5, 2, 'Taladro percutor Bosch', 'Estante B2', 2, 2),
('Papel A4', 'OFIC001', 100, 20, 'Resma papel A4 75gr', 'Estante C1', 1, 3);
