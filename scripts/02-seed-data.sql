USE GestionDeposito;
GO

-- Insertar datos iniciales

-- Categorías
INSERT INTO [Categoria] ([Nombre_Categoria]) VALUES 
('Electrónicos'),
('Herramientas'),
('Oficina'),
('Limpieza'),
('Seguridad');

-- Depósitos
INSERT INTO [Deposito] ([Ubicacion]) VALUES 
('Depósito Principal - Sector A'),
('Depósito Principal - Sector B'),
('Depósito Secundario');

-- Usuario administrador por defecto (contraseña: admin123)
INSERT INTO [Usuario] ([NombreUsuario], [Contraseña], [Rol]) VALUES 
('admin', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq', 'administrador'),
('supervisor1', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq', 'supervisor'),
('operario1', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq', 'operario');

-- Productos de ejemplo
INSERT INTO [Producto] ([Nombre], [Codigo], [CantidadStock], [StockMinimo], [Descripcion], [Ubicacion], [IDDeposito], [IDCategoria]) VALUES 
('Laptop Dell', 'ELEC001', 15, 5, 'Laptop Dell Inspiron 15', 'Estante A1', 1, 1),
('Taladro Bosch', 'HERR001', 8, 3, 'Taladro percutor Bosch', 'Estante B2', 1, 2),
('Papel A4', 'OFIC001', 100, 20, 'Resma papel A4 75g', 'Estante C1', 2, 3);
