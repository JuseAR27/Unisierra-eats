const sqlite3 = require('sqlite3').verbose();

// 1. Conectar a la base de datos
// Esto creará un archivo llamado "unisierra_eats.db"
const db = new sqlite3.Database('./unisierra_eats.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

db.serialize(() => {
    // Habilitar el soporte para llaves foráneas en SQLite
    db.run("PRAGMA foreign_keys = ON;");

    // Crear tabla Roles
    db.run(`CREATE TABLE IF NOT EXISTS Roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL
    )`);

    // Crear tabla Usuarios
    db.run(`CREATE TABLE IF NOT EXISTS Usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rol_id INTEGER,
        FOREIGN KEY (rol_id) REFERENCES Roles (id)
    )`);

    // Crear tabla Productos
    db.run(`CREATE TABLE IF NOT EXISTS Productos (
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    precioNivel TEXT NOT NULL,
    descripcion TEXT,
    imagen TEXT,
    calificacion REAL DEFAULT 0.0,
    numResenas INTEGER DEFAULT 0,
    categoria TEXT NOT NULL
    )`);

    // Crear tabla Reseñas
    db.run(`CREATE TABLE IF NOT EXISTS Resenas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        calificacion INTEGER NOT NULL CHECK(calificacion >= 1 AND calificacion <= 5),
        comentario TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        estado TEXT DEFAULT 'activa',
        FOREIGN KEY (usuario_id) REFERENCES Usuarios (id),
        FOREIGN KEY (producto_id) REFERENCES Productos (id_producto)
    )`);

    console.log('Tablas creadas correctamente.');

    //Datos de prueba
    db.run(`INSERT OR IGNORE INTO Roles (id, nombre) VALUES (1, 'Administrador'), (2, 'Estudiante')`);
    
    db.run(`INSERT OR IGNORE INTO Usuarios (id, nombre, correo, password, rol_id) 
            VALUES (1, 'Admin Principal', 'admin@unisierra.edu.mx', 'admin123', 1)`);

    db.run(`INSERT OR IGNORE INTO Productos (nombre, precio, precioNivel, descripcion, imagen, categoria) 
            VALUES ('Torta de Asada', 65.00, '$$', 'Deliciosa torta de carne asada con aguacate, tomate y mayonesa. Perfecta para un gran apetito.', 'https://images.unsplash.com/photo-1615719413546-198b25453f85?auto=format&fit=crop&w=500&q=60', 'comidas'),
            ('Chilaquiles Rojos', 55.00, '$$', 'Chilaquiles tradicionales con queso, crema, cebolla y un huevo estrellado.', 'https://images.unsplash.com/photo-1640718879612-40156d6ba433?auto=format&fit=crop&w=500&q=60', 'comidas'),
            ('Café Americano', 20.00, '$', 'Café americano caliente recién hecho. Ideal para despertar antes de clases.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60', 'bebidas'),
            ('Agua Fresca de Jamaica', 15.00, '$', 'Vaso grande de agua de jamaica 100% natural y refrescante.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=60', 'bebidas'),
            ('Papas a la Francesa', 35.00, '$', 'Porción generosa de papas fritas crujientes con un toque de sal.', 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=60', 'snacks'),
            ('Galleta con Chispas', 15.00, '$', 'Galleta grande recién horneada con deliciosas chispas de chocolate.', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=60', 'snacks'),
            ('Ensalada de Pollo', 75.00, '$$$', 'Mezcla de lechugas frescas, tomate, pepino y pechuga de pollo a la plancha.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60', 'sanas'),
            ('Coctel de Frutas', 40.00, '$', 'Fruta de temporada picada (melón, papaya, plátano y manzana) con un poco de miel y granola.', 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=500&q=60', 'sanas');`);

    db.run(`INSERT OR IGNORE INTO Usuarios (id, nombre, correo, password, rol_id) VALUES 
        (2, 'María López', 'maria.lopez@unisierra.edu.mx', 'secreta123', 2),
        (3, 'Carlos Mendoza', 'carlos.mendoza@unisierra.edu.mx', 'secreta123', 2),
        (4, 'Ana Torres', 'ana.torres@unisierra.edu.mx', 'secreta123', 2),
        (5, 'Luis Ruiz', 'luis.ruiz@unisierra.edu.mx', 'secreta123', 2),
        (6, 'Elena Soto', 'elena.soto@unisierra.edu.mx', 'secreta123', 2),
        (7, 'Jorge Vega', 'jorge.vega@unisierra.edu.mx', 'secreta123', 2),
        (8, 'Valeria Castro', 'valeria.castro@unisierra.edu.mx', 'secreta123', 2),
        (9, 'Raúl Silva', 'raul.silva@unisierra.edu.mx', 'secreta123', 2),
        (10, 'Diana Morales', 'diana.morales@unisierra.edu.mx', 'secreta123', 2),
        (11, 'Fernando Gómez', 'fernando.gomez@unisierra.edu.mx', 'secreta123', 2)
    `);

    db.run(`INSERT OR IGNORE INTO Resenas (usuario_id, producto_id, calificacion, comentario, estado) VALUES 
        (2, 1, 5, '¡La mejor torta de asada que he probado en la uni! Muy bien servida.', 'activa'),
        (3, 1, 4, 'Está muy rica, aunque a veces tardan un poco en entregarla por la fila.', 'activa'),
        (7, 1, 5, 'Vale cada peso. Te deja súper lleno para el resto de las clases.', 'activa'),
        (4, 2, 5, 'Los chilaquiles nunca fallan para el desayuno. Excelente porción.', 'activa'),
        (5, 2, 3, 'Estaban un poco fríos hoy, pero el sabor sigue siendo bueno.', 'activa'),
        (8, 2, 5, 'Mis favoritos por siempre. El queso y la crema están en su punto.', 'activa'),
        (6, 3, 5, 'Perfecto para despertar antes de la clase de las 7 am.', 'activa'),
        (7, 3, 4, 'Buen café, pero me gustaría que tuvieran opciones de leche vegetal.', 'activa'),
        (8, 4, 5, 'Muy refrescante y no está tan dulce. La pido todos los días.', 'activa'),
        (9, 5, 4, 'Buenas papas, muy crujientes. A veces les falta un poco de sal.', 'activa'),
        (10, 5, 2, 'Esta vez me tocaron medio quemadas, ojalá mejoren eso pronto.', 'activa'),
        (11, 6, 5, 'La galleta es gigante y súper suave. Excelente snack para la tarde.', 'activa'),
        (2, 6, 5, 'Siempre calientitas, el chocolate se derrite en la boca. Recomendadas.', 'activa'),
        (3, 7, 4, 'Muy buena opción para cuidarse. El pollo tiene muy buen sazón.', 'activa'),
        (4, 7, 5, 'Me encanta, las verduras siempre están frescas y aderezo rico.', 'activa'),
        (5, 8, 3, 'Buena fruta, pero le echaron mucha miel para mi gusto personal.', 'activa'),
        (6, 8, 4, 'Excelente coctel para el calorcito de mediodía, fruta fresca.', 'activa')
    `);
    
    console.log('Datos iniciales insertados.');
});

// Cierre de la conexión a la base de datos
db.close((err) => {
    if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
    } else {
        console.log('Configuración de base de datos finalizada con éxito.');
    }
});