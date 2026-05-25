const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// --- Configuraciones base ---

// Permitir que el servidor entienda y procese datos en formato JSON.
app.use(express.json());

// Servir los archivos estáticos del Frontend
// Con esto, Express mostrará los archivos HTML, CSS y el JS del cliente
app.use(express.static(__dirname));

// --- Rutas de prueba ---

// Endpoint de prueba para asegurar que la API responde
app.get('/api/status', (req, res) => {
    res.json({ 
        estado: 'Exito',
        mensaje: 'Servidor Express funcionando y listo para crear la API de UniSierra Eats' 
    });
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor de UniSierra Eats corriendo en http://localhost:${PORT}`);
});