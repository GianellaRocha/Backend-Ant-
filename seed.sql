-- Datos iniciales para pruebas (idempotente: limpia y vuelve a cargar).
-- Contraseña de ambos usuarios: Admin123!

TRUNCATE TABLE detalle_venta, venta, imagen, producto, forma_de_pago, categoria, reset_token, usuario
RESTART IDENTITY CASCADE;

-- Usuarios de prueba
INSERT INTO usuario (nombre, email, password, rol, activo) VALUES
('Administrador', 'admin@antu.com', '$2b$10$PzrDfdAPo1z5XjIoXCYAxuPzx9.s1Qg42q7tQ2wPd4C/srowBxmtu', 'admin', true),
('Empleado Demo', 'empleado@antu.com', '$2b$10$PzrDfdAPo1z5XjIoXCYAxuPzx9.s1Qg42q7tQ2wPd4C/srowBxmtu', 'empleado', true);

-- Categorías
INSERT INTO categoria (nombre) VALUES
('Carteras'),
('Accesorios'),
('Ropa');

-- Productos de prueba
INSERT INTO producto (nombre, descripcion, precio, categoria_id) VALUES
('Cartera de cuero', 'Cartera artesanal de cuero marrón', 149.9, (SELECT id FROM categoria WHERE nombre = 'Carteras')),
('Billetera slim', 'Billetera delgada con 8 compartimentos', 49.9, (SELECT id FROM categoria WHERE nombre = 'Carteras')),
('Llavero tejido', 'Llavero artesanal tejido a mano', 15.0, (SELECT id FROM categoria WHERE nombre = 'Accesorios')),
('Cinturón trenzado', 'Cinturón de cuero trenzado', 69.9, (SELECT id FROM categoria WHERE nombre = 'Accesorios'));

-- Imagen de prueba para el primer producto
INSERT INTO imagen (url, producto_id) VALUES
('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', (SELECT id FROM producto WHERE nombre = 'Cartera de cuero'));

-- Formas de pago
INSERT INTO forma_de_pago (nombre) VALUES
('Efectivo'),
('Tarjeta'),
('Transferencia');

-- Venta de prueba con la fecha de hoy
INSERT INTO venta (cliente, fecha, total, forma_de_pago_id) VALUES
('Cliente Prueba', NOW(), 299.8, (SELECT id FROM forma_de_pago WHERE nombre = 'Tarjeta'));

INSERT INTO detalle_venta (cantidad, producto_id, venta_id) VALUES
(2, (SELECT id FROM producto WHERE nombre = 'Cartera de cuero'), (SELECT id FROM venta WHERE cliente = 'Cliente Prueba'));