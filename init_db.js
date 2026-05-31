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