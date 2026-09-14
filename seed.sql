-- Datos iniciales para pruebas (idempotente: limpia y vuelve a cargar).
-- Contraseña de ambos usuarios: Admin123!

TRUNCATE TABLE detalle_venta, venta, imagen, producto, forma_de_pago, categoria, reset_token, usuario
RESTART IDENTITY CASCADE;

-- Usuarios de prueba
INSERT INTO usuario (nombre, email, password, rol, activo) VALUES
('Administrador', 'admin@antu.com', '$2b$10$PzrDfdAPo1z5XjIoXCYAxuPzx9.s1Qg42q7tQ2wPd4C/srowBxmtu', 'admin', true),
('Empleado Demo', 'empleado@antu.com', '$2b$10$PzrDfdAPo1z5XjIoXCYAxuPzx9.s1Qg42q7tQ2wPd4C/srowBxmtu', 'empleado', true);

-- Categorías raíz
INSERT INTO categoria (nombre) VALUES
('Velas'),
('Piezas de yeso'),
('Homespray'),
('Difusor'),
('Textil'),
('Madera');

-- Subcategorías
INSERT INTO categoria (nombre, categoria_padre_id) VALUES
('Velas en envase de vidrio', (SELECT id FROM categoria WHERE nombre = 'Velas')),
('Velas en yeso',            (SELECT id FROM categoria WHERE nombre = 'Velas')),
('Velas de molde',           (SELECT id FROM categoria WHERE nombre = 'Velas')),
('Cuencos',                  (SELECT id FROM categoria WHERE nombre = 'Piezas de yeso')),
('Bandejas',                 (SELECT id FROM categoria WHERE nombre = 'Piezas de yeso')),
('Floreros',                 (SELECT id FROM categoria WHERE nombre = 'Piezas de yeso')),
('Hogar',                    (SELECT id FROM categoria WHERE nombre = 'Difusor')),
('Auto',                     (SELECT id FROM categoria WHERE nombre = 'Difusor')),
('Caminos de mesa',          (SELECT id FROM categoria WHERE nombre = 'Textil')),
('Individuales',             (SELECT id FROM categoria WHERE nombre = 'Textil')),
('Rodajas de madera',        (SELECT id FROM categoria WHERE nombre = 'Madera'));

-- Productos de prueba
INSERT INTO producto (nombre, descripcion, precio, categoria_id) VALUES
('Vela aromática de lavanda',  'Vela en envase de vidrio con aroma a lavanda',       2499.0, (SELECT id FROM categoria WHERE nombre = 'Velas en envase de vidrio')),
('Vela en yeso forma flor',    'Vela artesanal en yeso con forma de flor',          1899.0, (SELECT id FROM categoria WHERE nombre = 'Velas en yeso')),
('Cuenco de yeso chico',       'Cuenco pequeño de yeso para decoración',            3299.0, (SELECT id FROM categoria WHERE nombre = 'Cuencos')),
('Homespray relajante',        'Spray aromático para el hogar',                     1999.0, (SELECT id FROM categoria WHERE nombre = 'Homespray')),
('Difusor de autopista',       'Difusor de aroma para el auto',                     1499.0, (SELECT id FROM categoria WHERE nombre = 'Auto')),
('Camino de mesa tejido',      'Camino de mesa tejido a mano en algodón',           5999.0, (SELECT id FROM categoria WHERE nombre = 'Caminos de mesa'));

-- Imagen de prueba para la primera vela
INSERT INTO imagen (url, producto_id) VALUES
('https://images.unsplash.com/photo-1602607547478-a5f0b3a2c494?w=400', (SELECT id FROM producto WHERE nombre = 'Vela aromática de lavanda'));

-- Formas de pago
INSERT INTO forma_de_pago (nombre) VALUES
('Efectivo'),
('Transferencia');

-- Venta de prueba
INSERT INTO venta (cliente, fecha, total, forma_de_pago_id) VALUES
('Cliente Prueba', NOW(), 4398.0, (SELECT id FROM forma_de_pago WHERE nombre = 'Efectivo'));

INSERT INTO detalle_venta (cantidad, producto_id, venta_id) VALUES
(1, (SELECT id FROM producto WHERE nombre = 'Vela aromática de lavanda'), (SELECT id FROM venta WHERE cliente = 'Cliente Prueba')),
(1, (SELECT id FROM producto WHERE nombre = 'Cuenco de yeso chico'),      (SELECT id FROM venta WHERE cliente = 'Cliente Prueba'));