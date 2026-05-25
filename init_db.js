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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        imagen_url TEXT
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
        FOREIGN KEY (producto_id) REFERENCES Productos (id)
    )`);

    console.log('Tablas creadas correctamente.');

    // Insertar datos iniciales para poder hacer pruebas
    // Usamos INSERT OR IGNORE para evitar duplicados
    db.run(`INSERT OR IGNORE INTO Roles (id, nombre) VALUES (1, 'Administrador'), (2, 'Estudiante')`);
    
    db.run(`INSERT OR IGNORE INTO Usuarios (id, nombre, correo, password, rol_id) 
            VALUES (1, 'Admin Principal', 'admin@unisierra.edu.mx', 'admin123', 1)`);

    db.run(`INSERT OR IGNORE INTO Productos (id, nombre, descripcion, precio) VALUES 
        (1, 'Café Americano', 'Delicioso café de grano recién hecho', 20.00),
        (2, 'Sandwich Especial', 'Sandwich integral con jamón, queso y aderezos', 35.50)
    `);

    console.log('Datos iniciales (Seeders) insertados.');
});

// Cierre de la conexión a la base de datos
db.close((err) => {
    if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
    } else {
        console.log('Configuración de base de datos finalizada con éxito.');
    }
});