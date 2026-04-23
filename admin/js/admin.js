/**
 * admin.js - Lógica Integral del Panel Administrativo
 * Maneja Inventario, Moderación y Análisis de Datos.
 */

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // --- 1. CONFIGURACIÓN GLOBAL ---
    // Control del botón cerrar sesión del administrador
    const btnLogout = document.querySelector('.admin-navbar .text-danger');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('unisierra_sesion');
            window.location.href = '../public/index.html';
            
        });
    }

    /**
     * Actualiza los indicadores visuales (badges rojos) en el menú de navegación.
     * Lee la tabla de reportes pendientes y muestra la cantidad exacta.
     */
    function actualizarBadgesGlobales() {
        if (!localStorage.getItem('unisierra_reportes')) {
            const reportesMock = [
                { id_reporte: 101, id_resena: 1, motivo: "Lenguaje inapropiado", fecha: "Hoy" },
                { id_reporte: 102, id_resena: 3, motivo: "Spam / Fuera de contexto", fecha: "Ayer" }
            ];
            localStorage.setItem('unisierra_reportes', JSON.stringify(reportesMock));
        }

        const reportes = JSON.parse(localStorage.getItem('unisierra_reportes')) || [];
        const badges = document.querySelectorAll('.admin-nav .badge');
        
        badges.forEach(b => {
            if (reportes.length > 0) {
                b.style.display = 'inline-block';
                b.textContent = reportes.length;
            } else {
                b.style.display = 'none';
            }
        });
    }

    actualizarBadgesGlobales();

    // --- ENRUTADOR PRINCIPAL DEL ADMIN ---
    if (path.includes('panel_admin.html') || path.endsWith('panel_admin.html')) {
        iniciarPanelInventario();
    } else if (path.includes('moderacion.html')) {
        iniciarModeracion();
    } else if (path.includes('reportes.html')) {
        iniciarReportes();
    }

    // MÓDULO 1: INVENTARIO (panel_admin.html)
    /**
     * Inicializa el módulo de inventario.
     * Permite visualizar la tabla de productos, agregar nuevos, y editar/eliminar existentes (CRUD).
     */
    function iniciarPanelInventario() {
        const adminTable = document.querySelector('.admin-table tbody');
        if (!adminTable) return;

        const modal = document.getElementById('productModal');
        const form = modal.querySelector('.admin-form');
        const modalTitle = modal.querySelector('.modal-header h2');
        const searchInput = document.querySelector('.table-toolbar .search-bar input');
        const categoryFilter = document.querySelector('.table-toolbar .admin-select');

        const inputNombre = form.querySelector('input[type="text"]');
        const inputPrecio = form.querySelector('input[type="number"]');
        const selectCategoria = form.querySelector('select');
        const inputDesc = form.querySelector('textarea');
        const inputImagen = form.querySelector('input[type="url"]');

        let productoEnEdicionId = null;

        function obtenerProductos() { return JSON.parse(localStorage.getItem('unisierra_productos')) || []; }
        function guardarProductos(productos) {
            localStorage.setItem('unisierra_productos', JSON.stringify(productos));
            actualizarMetricasInventario();
            renderizarTabla();
        }

        function actualizarMetricasInventario() {
            const productos = obtenerProductos();
            const reportes = JSON.parse(localStorage.getItem('unisierra_reportes')) || [];
            
            const productosActivos = productos.filter(p => !p.etiquetas.includes("Agotado")).length;
            document.querySelector('.stat-card:nth-child(1) h3').textContent = productosActivos;

            if (productos.length > 0) {
                const prodConCalif = productos.filter(p => p.numResenas > 0);
                const sumaCalificaciones = prodConCalif.reduce((sum, p) => sum + p.calificacion, 0);
                const promedioGlobal = prodConCalif.length ? (sumaCalificaciones / prodConCalif.length).toFixed(1) : 0;
                document.querySelector('.stat-card:nth-child(2) h3').textContent = promedioGlobal;
            }

            document.querySelector('.stat-card:nth-child(3) h3').textContent = reportes.length;
        }

        function renderizarTabla() {
            const productos = obtenerProductos();
            const terminoBusqueda = searchInput.value.toLowerCase().trim();
            const categoriaSeleccionada = categoryFilter.value;

            adminTable.innerHTML = "";

            const productosFiltrados = productos.filter(p => {
                const coincideTexto = p.nombre.toLowerCase().includes(terminoBusqueda) || p.id_producto.toString().includes(terminoBusqueda);
                const coincideCategoria = categoriaSeleccionada === "Todas las categorías" || p.categoria.includes(categoriaSeleccionada);
                return coincideTexto && coincideCategoria;
            });

            if (productosFiltrados.length === 0) {
                adminTable.innerHTML = `<tr><td colspan="6" style="text-align:center;">No se encontraron productos.</td></tr>`;
                return;
            }

            productosFiltrados.forEach(p => {
                const isAgotado = p.etiquetas.includes("Agotado");
                const statusClass = isAgotado ? "inactive" : "active";
                const statusText = isAgotado ? "Agotado" : "Disponible";
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#00${p.id_producto}</td>
                    <td><strong>${p.nombre}</strong></td>
                    <td>${p.categoria}</td>
                    <td class="price-cell">$${parseFloat(p.precio_actual).toFixed(2)}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="table-actions">
                        <button class="btn-icon edit" data-id="${p.id_producto}" title="Editar"><i class="fas fa-pen"></i></button>
                        <button class="btn-icon delete" data-id="${p.id_producto}" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                adminTable.appendChild(tr);
            });

            asignarEventosBotonesAccion();
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const productos = obtenerProductos();

            const nuevoProducto = {
                nombre: inputNombre.value,
                precio_actual: parseFloat(inputPrecio.value),
                precioNivel: parseFloat(inputPrecio.value) > 40 ? "$$" : "$",
                categoria: selectCategoria.value,
                descripcion: inputDesc.value,
                imagen: inputImagen.value || "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60",
                etiquetas: ["Disponible", selectCategoria.value]
            };

            if (productoEnEdicionId) {
                const index = productos.findIndex(p => p.id_producto === productoEnEdicionId);
                if (index !== -1) {
                    productos[index] = { ...productos[index], ...nuevoProducto };
                    alert("Producto actualizado exitosamente.");
                }
            } else {
                nuevoProducto.id_producto = Date.now();
                nuevoProducto.calificacion = 0;
                nuevoProducto.numResenas = 0;
                nuevoProducto.snippet = "Nuevo producto en la cafetería.";
                productos.push(nuevoProducto);
                alert("Producto agregado exitosamente.");
            }

            guardarProductos(productos);
            modal.style.display = 'none';
            form.reset();
        });

        function asignarEventosBotonesAccion() {
            document.querySelectorAll('.btn-icon.edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    const producto = obtenerProductos().find(p => p.id_producto === id);
                    if (producto) {
                        productoEnEdicionId = producto.id_producto;
                        modalTitle.textContent = "Editar Producto";
                        inputNombre.value = producto.nombre;
                        inputPrecio.value = producto.precio_actual;
                        inputDesc.value = producto.descripcion || "";
                        inputImagen.value = producto.imagen;
                        
                        Array.from(selectCategoria.options).forEach(opt => {
                            if(producto.categoria.includes(opt.value) || opt.value.includes(producto.categoria)) opt.selected = true;
                        });
                        modal.style.display = 'flex';
                    }
                });
            });

            document.querySelectorAll('.btn-icon.delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
                        guardarProductos(obtenerProductos().filter(p => p.id_producto !== id));
                    }
                });
            });
        }

        const btnAdd = document.querySelector('.content-header .btn-solid');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                productoEnEdicionId = null;
                form.reset();
                modalTitle.textContent = "Registrar Nuevo Producto";
                modal.style.display = 'flex';
            });
        }

        searchInput.addEventListener('input', renderizarTabla);
        categoryFilter.addEventListener('change', renderizarTabla);

        actualizarMetricasInventario();
        renderizarTabla();
    }


    // MÓDULO 2: MODERACIÓN (moderacion.html)
    /**
     * Inicializa el panel de moderación de contenido.
     * Lista las reseñas reportadas y permite a los administradores ignorar el reporte o eliminar la reseña.
     */
    function iniciarModeracion() {
        const grid = document.querySelector('.moderation-grid');
        if (!grid) return;

        function renderizarReportes() {
            const reportes = JSON.parse(localStorage.getItem('unisierra_reportes')) || [];
            const resenas = JSON.parse(localStorage.getItem('unisierra_resenas')) || [];
            const productos = JSON.parse(localStorage.getItem('unisierra_productos')) || [];
            const usuarios = JSON.parse(localStorage.getItem('unisierra_usuarios')) || [];

            grid.innerHTML = "";

            if (reportes.length === 0) {
                grid.innerHTML = `
                    <div style="padding: 40px; text-align: center; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color);">
                        <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--primary-green); margin-bottom: 15px;"></i>
                        <h2 style="color: var(--text-main);">¡Comunidad Segura!</h2>
                        <p style="color: var(--text-muted);">No hay reportes pendientes de revisión. Has atendido todas las solicitudes.</p>
                    </div>`;
                return;
            }

            reportes.forEach(reporte => {
                const resena = resenas.find(r => r.id_reseña === reporte.id_resena);
                
                if (!resena) {
                    eliminarReporte(reporte.id_reporte, false);
                    return;
                }

                const producto = productos.find(p => p.id_producto === resena.id_producto) || { nombre: "Producto Eliminado" };
                const autor = usuarios.find(u => u.id_usuario === resena.id_usuario) || { nombre_usuario: "Usuario Anónimo" };

                grid.innerHTML += `
                    <div class="report-card">
                        <div class="report-header">
                            <span class="report-reason"><i class="fas fa-exclamation-circle"></i> Motivo: ${reporte.motivo}</span>
                            <span class="report-date">Reportado ${reporte.fecha}</span>
                        </div>
                        <div class="report-body">
                            <div class="review-context">
                                <strong>Producto:</strong> ${producto.nombre} <br>
                                <strong>Autor de la reseña:</strong> ${autor.nombre_usuario}
                            </div>
                            <p class="review-text">"${resena.comentario_text}"</p>
                        </div>
                        <div class="report-actions">
                            <button class="btn-outline-light text-success btn-ignorar" data-id="${reporte.id_reporte}"><i class="fas fa-check"></i> Ignorar (Mantener)</button>
                            <button class="btn-solid bg-danger btn-eliminar-resena" data-rep-id="${reporte.id_reporte}" data-res-id="${resena.id_reseña}" data-prod-id="${producto.id_producto}"><i class="fas fa-trash"></i> Eliminar Reseña</button>
                        </div>
                    </div>
                `;
            });

            asignarEventosModeracion();
        }

        function asignarEventosModeracion() {
            document.querySelectorAll('.btn-ignorar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    eliminarReporte(id, true);
                });
            });

            document.querySelectorAll('.btn-eliminar-resena').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const repId = parseInt(e.currentTarget.getAttribute('data-rep-id'));
                    const resId = parseInt(e.currentTarget.getAttribute('data-res-id'));
                    const prodId = parseInt(e.currentTarget.getAttribute('data-prod-id'));

                    if (confirm("¿Seguro que deseas eliminar esta reseña? Al hacerlo, se restarán sus estrellas del promedio del producto.")) {
                        borrarResenaYRecalcular(resId, prodId);
                        eliminarReporte(repId, false);
                        alert("La reseña ha sido eliminada permanentemente por violar las normas.");
                    }
                });
            });
        }

        function eliminarReporte(idReporte, mostrarAlerta) {
            let reportes = JSON.parse(localStorage.getItem('unisierra_reportes')) || [];
            reportes = reportes.filter(r => r.id_reporte !== idReporte);
            localStorage.setItem('unisierra_reportes', JSON.stringify(reportes));
            
            if (mostrarAlerta) alert("Reporte descartado. La reseña se mantendrá visible para los estudiantes.");
            
            actualizarBadgesGlobales();
            renderizarReportes();
        }

        /**
         * Elimina una reseña y re-calcula el promedio del producto.
         * Al eliminar una mala opinión infractora, el promedio de estrellas del producto se ajusta.
         * @param {number} idResena - ID de la reseña a eliminar.
         * @param {number} idProducto - ID del producto afectado.
         */
        function borrarResenaYRecalcular(idResena, idProducto) {
            let resenas = JSON.parse(localStorage.getItem('unisierra_resenas')) || [];
            const resenaAEliminar = resenas.find(r => r.id_reseña === idResena);
            resenas = resenas.filter(r => r.id_reseña !== idResena);
            localStorage.setItem('unisierra_resenas', JSON.stringify(resenas));

            let calificaciones = JSON.parse(localStorage.getItem('unisierra_calificaciones')) || [];
            let califValor = 0;
            if (resenaAEliminar) {
                const califIndex = calificaciones.findIndex(c => c.id_usuario === resenaAEliminar.id_usuario && c.id_producto === idProducto);
                if(califIndex !== -1){
                    califValor = calificaciones[califIndex].puntuacion;
                    calificaciones.splice(califIndex, 1);
                    localStorage.setItem('unisierra_calificaciones', JSON.stringify(calificaciones));
                }
            }

            let productos = JSON.parse(localStorage.getItem('unisierra_productos')) || [];
            const pIndex = productos.findIndex(p => p.id_producto === idProducto);
            
            if (pIndex !== -1 && califValor > 0) {
                const p = productos[pIndex];
                if (p.numResenas > 1) {
                    const puntosTotales = (p.calificacion * p.numResenas) - califValor;
                    p.numResenas -= 1;
                    p.calificacion = puntosTotales / p.numResenas;
                } else {
                    p.numResenas = 0;
                    p.calificacion = 0;
                }
                localStorage.setItem('unisierra_productos', JSON.stringify(productos));
            }
        }

        renderizarReportes();
    }

    // MÓDULO 3: REPORTES Y ESTADÍSTICAS (reportes.html)
    /**
     * Inicializa el módulo analítico.
     * Procesa todos los datos del sistema para calcular:
     * - Total de reseñas recibidas.
     * - Promedio de satisfacción global de la cafetería.
     * - Producto más popular y los listados "Top 3" (Mejores y Peores).
     */
    function iniciarReportes() {
        const statCards = document.querySelectorAll('.stat-card h3');
        const rankingPanels = document.querySelectorAll('.ranking-list');
        
        // Verificamos que existan los elementos en el HTML
        if (statCards.length < 3 || rankingPanels.length < 2) return;

        // Extraemos los datos actualizados
        const productos = JSON.parse(localStorage.getItem('unisierra_productos')) || [];
        const resenas = JSON.parse(localStorage.getItem('unisierra_resenas')) || [];

        // --- 1. MÉTRICAS SUPERIORES ---
        
        // Total de Reseñas
        const totalResenas = resenas.length;
        statCards[0].textContent = totalResenas;

        // Promedio de Satisfacción Global
        let promedioGlobal = 0;
        const prodConResenas = productos.filter(p => p.numResenas > 0); // Ignoramos los que no tienen reseñas

        if (prodConResenas.length > 0) {
            const sumaPromedios = prodConResenas.reduce((acc, p) => acc + p.calificacion, 0);
            promedioGlobal = (sumaPromedios / prodConResenas.length).toFixed(1);
        }
        statCards[1].textContent = `${promedioGlobal} / 5.0`;

        // Producto más popular (El que tiene más reseñas)
        let productoPopular = { nombre: "Aún sin datos", numResenas: 0 };
        if (prodConResenas.length > 0) {
            productoPopular = prodConResenas.reduce((prev, current) => (prev.numResenas > current.numResenas) ? prev : current);
        }
        statCards[2].textContent = productoPopular.nombre;
        
        // Actualizamos el pequeño texto debajo del producto popular
        const popSubtitle = statCards[2].nextElementSibling;
        if(popSubtitle) popSubtitle.textContent = `${productoPopular.numResenas} evaluaciones`;


        // --- 2. LISTAS DE RANKING (TOPS) ---

        // Top 3 Mejor Evaluados (Mayor a Menor)
        const topMejores = [...prodConResenas].sort((a, b) => b.calificacion - a.calificacion).slice(0, 3);
        let htmlMejores = '';
        
        topMejores.forEach((p, index) => {
            htmlMejores += `
                <li>
                    <span class="rank-number">${index + 1}</span>
                    <div class="rank-info">
                        <strong>${p.nombre}</strong>
                        <span class="text-muted">${p.calificacion.toFixed(1)} Estrellas (${p.numResenas} reseñas)</span>
                    </div>
                </li>
            `;
        });
        
        if(htmlMejores === '') htmlMejores = '<li><span class="text-muted" style="padding: 10px;">No hay productos evaluados aún.</span></li>';
        rankingPanels[0].innerHTML = htmlMejores;

        // Top 3 Áreas de Mejora (Menor a Mayor)
        const topPeores = [...prodConResenas].sort((a, b) => a.calificacion - b.calificacion).slice(0, 3);
        let htmlPeores = '';
        
        topPeores.forEach((p, index) => {
            htmlPeores += `
                <li>
                    <span class="rank-number bad">${index + 1}</span>
                    <div class="rank-info">
                        <strong>${p.nombre}</strong>
                        <span class="text-muted">${p.calificacion.toFixed(1)} Estrellas (${p.numResenas} reseñas)</span>
                    </div>
                </li>
            `;
        });
        
        if(htmlPeores === '') htmlPeores = '<li><span class="text-muted" style="padding: 10px;">No hay productos evaluados aún.</span></li>';
        rankingPanels[1].innerHTML = htmlPeores;
    }
});
