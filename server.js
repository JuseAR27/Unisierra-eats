const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(express.json()); // Entender formato JSON
app.use(express.static(__dirname)); // Servir archivos estáticos del frontend

// Conexión a la Base de Datos SQLite
const db = new sqlite3.Database('./unisierra_eats.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Servidor conectado a la base de datos SQLite.');
    }
});

// -- API RESTful PARA PRODUCTOS --

// GET: Listar todos los productos con su calificación promedio
app.get('/api/productos', (req, res) => {
    const sql = `
        SELECT p.*, 
               IFNULL(AVG(r.calificacion), 0) as calificacion,
               COUNT(r.id) as numResenas
        FROM Productos p
        LEFT JOIN Resenas r ON p.id = r.producto_id
        GROUP BY p.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST: Crear un nuevo producto (Alta)
app.post('/api/productos', (req, res) => {
    const { nombre, descripcion, precio, imagen_url } = req.body;
    const sql = "INSERT INTO Productos (nombre, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?)";
    
    db.run(sql, [nombre, descripcion, precio, imagen_url || ''], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ 
            mensaje: "Producto creado con éxito", 
            id: this.lastID // Devolvemos el ID del producto recién creado
        });
    });
});

// PUT: Modificar un producto existente
app.put('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, precio, imagen_url } = req.body;
    const sql = "UPDATE Productos SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ? WHERE id = ?";
    
    db.run(sql, [nombre, descripcion, precio, imagen_url || '', id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ mensaje: `Producto ${id} actualizado correctamente` });
    });
});

// DELETE: Eliminar un producto
app.delete('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Productos WHERE id = ?";
    
    db.run(sql, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ mensaje: `Producto ${id} eliminado correctamente` });
    });
});

// -- API RESTful PARA USUARIOS (Autenticación) --

// POST: Registrar un nuevo usuario
app.post('/api/registro', (req, res) => {
    const { nombre, correo, password } = req.body;
    const sql = "INSERT INTO Usuarios (nombre, correo, password, rol_id) VALUES (?, ?, ?, 2)";
    
    db.run(sql, [nombre, correo, password], function(err) {
        if (err) {
            // Si el correo ya existe, SQLite arrojará un error de restricción UNIQUE
            return res.status(400).json({ error: "Error al registrar: Es posible que el correo ya esté en uso." });
        }
        res.json({ mensaje: "Usuario registrado con éxito", id: this.lastID });
    });
});

// POST: Inicio de sesión
app.post('/api/login', (req, res) => {
    const { correo, password } = req.body;
    const sql = "SELECT id, nombre, correo, rol_id FROM Usuarios WHERE correo = ? AND password = ?";
    
    db.get(sql, [correo, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ mensaje: "Inicio de sesión exitoso", usuario: row });
        } else {
            res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }
    });
});

// PUT: Modificar datos del usuario (Nombre o Contraseña)
app.put('/api/usuarios/:id', (req, res) => {
    const { nombre, password } = req.body;
    let sql, params;

    // Si el usuario escribió una nueva contraseña, la actualizamos. Si no, solo el nombre.
    if (password && password.trim() !== "") {
        sql = "UPDATE Usuarios SET nombre = ?, password = ? WHERE id = ?";
        params = [nombre, password, req.params.id];
    } else {
        sql = "UPDATE Usuarios SET nombre = ? WHERE id = ?";
        params = [nombre, req.params.id];
    }

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Perfil actualizado correctamente" });
    });
});

// DELETE: Eliminar cuenta de usuario
app.delete('/api/usuarios/:id', (req, res) => {
    // Primero, eliminamos las reseñas que este usuario escribió para evitar errores de llave foránea
    db.run("DELETE FROM Resenas WHERE usuario_id = ?", req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Luego, eliminamos al usuario
        db.run("DELETE FROM Usuarios WHERE id = ?", req.params.id, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: "Cuenta eliminada correctamente" });
        });
    });
});

// -- API RESTful PARA RESEÑAS --

// GET: Obtener todas las reseñas de un usuario específico (Para el Perfil)
app.get('/api/resenas/usuario/:usuario_id', (req, res) => {
    const sql = `
        SELECT r.id, r.calificacion, r.comentario, r.fecha, 
               p.nombre as producto_nombre, p.imagen_url as producto_imagen 
        FROM Resenas r 
        JOIN Productos p ON r.producto_id = p.id 
        WHERE r.usuario_id = ? 
        ORDER BY r.fecha DESC
    `;
    db.all(sql, [req.params.usuario_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST: Crear una nueva reseña
app.post('/api/resenas', (req, res) => {
    const { usuario_id, producto_id, calificacion, comentario } = req.body;
    const sql = "INSERT INTO Resenas (usuario_id, producto_id, calificacion, comentario) VALUES (?, ?, ?, ?)";
    
    db.run(sql, [usuario_id, producto_id, calificacion, comentario], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Reseña guardada con éxito", id: this.lastID });
    });
});

// PUT: Editar una reseña existente
app.put('/api/resenas/:id', (req, res) => {
    const { calificacion, comentario } = req.body;
    const sql = "UPDATE Resenas SET calificacion = ?, comentario = ? WHERE id = ?";
    
    db.run(sql, [calificacion, comentario, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Reseña actualizada" });
    });
});

// DELETE: Eliminar una reseña
app.delete('/api/resenas/:id', (req, res) => {
    const sql = "DELETE FROM Resenas WHERE id = ?";
    
    db.run(sql, req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Reseña eliminada" });
    });
});

// Iniciar el Servidor
app.listen(PORT, () => {
    console.log(`Servidor de UniSierra Eats corriendo en http://localhost:${PORT}`);
});