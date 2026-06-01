/**
 * admin.js - Lógica Integral del Panel Administrativo
 * Integrado con API RESTful (Node.js + Express + SQLite)
 */

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // --- CONFIGURACIÓN GLOBAL ---
    const btnLogout = document.querySelector('.admin-navbar .text-danger');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('unisierra_sesion');
            window.location.href = '../public/index.html';
        });
    }

    // --- ENRUTADOR PRINCIPAL DEL ADMIN ---
    if (path.includes('panel_admin.html') || path.endsWith('panel_admin.html')) {
        iniciarPanelInventario();
    } else if (path.includes('moderacion.html')) {
        iniciarModeracion();
    } else if (path.includes('reportes.html')) {
        iniciarReportes();
    }

    // ==========================================
    // MÓDULO: INVENTARIO CON FETCH API
    // ==========================================
    function iniciarPanelInventario() {
        const adminTable = document.querySelector('.admin-table tbody');
        if (!adminTable) return;

        const modal = document.getElementById('productModal');
        const form = modal.querySelector('.admin-form');
        const modalTitle = modal.querySelector('.modal-header h2');
        const searchInput = document.querySelector('.table-toolbar .search-bar input');
        const inputNombre = form.querySelector('input[type="text"]');
        const inputPrecio = form.querySelector('input[type="number"]');
        const inputDesc = form.querySelector('textarea');
        const inputImagen = form.querySelector('input[type="url"]');
        const inputCategoria = form.querySelector('select');

        let productoEnEdicionId = null;

        // GET: Listar productos desde la API
        async function cargarProductos() {
            try {
                const respuesta = await fetch('/api/productos');
                const productos = await respuesta.json();
                renderizarTabla(productos);
                actualizarEstadisticas(productos);
            } catch (error) {
                console.error("Error al cargar productos:", error);
                adminTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error al cargar la base de datos.</td></tr>`;
            }
        }

        function actualizarEstadisticas(productos) {
            const totalProductosEl = document.getElementById('total-productos');
            const totalResenasEl = document.getElementById('total-resenas');
            const promedioCalifEl = document.getElementById('promedio-calificacion');

            if (!productos || productos.length === 0) {
                if (totalProductosEl) totalProductosEl.textContent = "0";
                if (totalResenasEl) totalResenasEl.textContent = "0";
                if (promedioCalifEl) promedioCalifEl.textContent = "0.0";
                return;
            }

            if (totalProductosEl) totalProductosEl.textContent = productos.length;

            let totalResenas = 0;
            let sumaCalificaciones = 0;

            productos.forEach(p => {
                if (p.numResenas > 0) {
                    totalResenas += p.numResenas;
                    sumaCalificaciones += (p.calificacion * p.numResenas);
                }
            });

            if (totalResenasEl) totalResenasEl.textContent = totalResenas;

            if (promedioCalifEl) {
                if (totalResenas > 0) {
                    const promedio = sumaCalificaciones / totalResenas;
                    promedioCalifEl.textContent = promedio.toFixed(1);
                } else {
                    promedioCalifEl.textContent = "0.0";
                }
            }
        }

        function renderizarTabla(productos) {
            const terminoBusqueda = searchInput.value.toLowerCase().trim();
            const selectCategoria = document.getElementById('filtro-categoria-admin');
            const categoriaBuscada = selectCategoria ? selectCategoria.value.toLowerCase() : "";
            adminTable.innerHTML = "";
            const productosFiltrados = productos.filter(p => {
                const pasaTexto = p.nombre.toLowerCase().includes(terminoBusqueda) || p.id_producto.toString().includes(terminoBusqueda);
                let pasaCategoria = true;
                if (categoriaBuscada !== "") {
                    pasaCategoria = p.categoria && p.categoria.toLowerCase().includes(categoriaBuscada);
                }
                return pasaTexto && pasaCategoria;
            });

            if (productosFiltrados.length === 0) {
                adminTable.innerHTML = `<tr><td colspan="6" style="text-align:center;">No se encontraron productos.</td></tr>`;
                return;
            }

            productosFiltrados.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#00${p.id_producto}</td>
                    <td><strong>${p.nombre}</strong></td>
                    <td>${p.categoria}</td>
                    <td class="price-cell">$${parseFloat(p.precio).toFixed(2)}</td>
                    <td><span class="status-badge active">Disponible</span></td>
                    <td class="table-actions">
                        <button class="btn-icon edit" data-id="${p.id_producto}" data-nombre="${p.nombre}" data-precio="${p.precio}" data-desc="${p.descripcion}" data-img="${p.imagen}" data-categoria="${p.categoria}" title="Editar"><i class="fas fa-pen"></i></button>
                        <button class="btn-icon delete" data-id="${p.id_producto}" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                adminTable.appendChild(tr);
            });

            asignarEventosBotonesAccion();
        }

        // POST y PUT: Enviar datos del formulario a la API
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const precioIngresado = parseFloat(inputPrecio.value);
            let nivelCalculado = "$";
            if (precioIngresado > 50 && precioIngresado <= 100) nivelCalculado = "$$";
            if (precioIngresado > 100) nivelCalculado = "$$$";

            const payload = {
                nombre: inputNombre.value,
                precio: precioIngresado,
                precioNivel: nivelCalculado,
                descripcion: inputDesc.value,
                imagen: inputImagen.value || "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60",
                categoria: inputCategoria.value
            };

            try {
                if (productoEnEdicionId) {
                    // Actualizar
                    await fetch(`/api/productos/${productoEnEdicionId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    Swal.fire({ icon: 'success', title: '¡Actualizado!', text: 'Producto actualizado exitosamente.', confirmButtonColor: '#0cb06e' });
                } else {
                    await fetch('/api/productos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    Swal.fire({ icon: 'success', title: '¡Agregado!', text: 'Producto agregado exitosamente.', confirmButtonColor: '#0cb06e' });
                }

                modal.style.display = 'none';
                form.reset();
                cargarProductos();
            } catch (error) {
                console.error("Error al guardar:", error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un error al guardar el producto.', confirmButtonColor: '#d93025' });
            }
        });

        function asignarEventosBotonesAccion() {
            // Cargar datos en el modal para Editar
            document.querySelectorAll('.btn-icon.edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const dataset = e.currentTarget.dataset;
                    productoEnEdicionId = dataset.id;
                    
                    modalTitle.textContent = "Editar Producto";
                    inputNombre.value = dataset.nombre;
                    inputPrecio.value = dataset.precio;
                    inputDesc.value = dataset.desc !== 'null' ? dataset.desc : "";
                    inputImagen.value = dataset.img !== 'null' ? dataset.img : "";
                    
                    if(inputCategoria) {
                        inputCategoria.value = dataset.categoria !== 'null' && dataset.categoria !== 'undefined' ? dataset.categoria : "";
                    }
                    
                    modal.style.display = 'flex';
                });
            });

            // DELETE: Eliminar producto
            document.querySelectorAll('.btn-icon.delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    
                    // Creamos el modal estético en el vuelo
                    const overlay = document.createElement('div');
                    overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;";
                    overlay.innerHTML = `
                        <div style="background:var(--bg-card,#1e1e1e); border-top:4px solid #d93025; padding:25px; border-radius:12px; text-align:center; color:#fff;">
                            <h3 style="margin-bottom:15px;">Eliminar Producto</h3>
                            <p style="margin-bottom:20px; color:#aaa;">¿Seguro que deseas eliminar el producto #${id}?</p>
                            <button id="btnAdminCancel" style="background:transparent; border:1px solid #888; color:#888; padding:8px 15px; border-radius:6px; margin-right:10px; cursor:pointer;">Cancelar</button>
                            <button id="btnAdminEliminar" style="background:#d93025; border:none; color:#fff; padding:8px 15px; border-radius:6px; cursor:pointer;">Eliminar</button>
                        </div>
                    `;
                    document.body.appendChild(overlay);

                    document.getElementById('btnAdminCancel').onclick = () => document.body.removeChild(overlay);
                    document.getElementById('btnAdminEliminar').onclick = async () => {
                        document.body.removeChild(overlay);
                        try {
                            await fetch(`/api/productos/${id}`, { method: 'DELETE' });
                            cargarProductos();
                        } catch (error) {
                            console.error("Error al eliminar:", error);
                        }
                    };
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

        searchInput.addEventListener('input', () => {
            cargarProductos(); 
        });

        const selectCategoria = document.getElementById('filtro-categoria-admin');
        if (selectCategoria) {
            selectCategoria.addEventListener('change', () => {
                cargarProductos();
            });
        }

        // Iniciar la carga de la tabla al entrar a la página
        cargarProductos();
    }

    // ==========================================
    // MÓDULOS DE MODERACIÓN Y REPORTES 
    // ==========================================
    function iniciarModeracion() {
        const gridModeracion = document.querySelector('.moderation-grid');
        if (!gridModeracion) return;

        async function cargarReportadas() {
            try {
                const res = await fetch('/api/admin/resenas-reportadas');
                const reportadas = await res.json();
                renderizarModeracion(reportadas);
            } catch(e) {
                console.error(e);
                gridModeracion.innerHTML = `<p style="color:red;">Error al cargar reportes.</p>`;
            }
        }

        function renderizarModeracion(resenas) {
            gridModeracion.innerHTML = "";
            if(resenas.length === 0) {
                gridModeracion.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--bg-card); border-radius: 8px;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-green); margin-bottom: 15px;"></i>
                        <h2>¡Todo limpio!</h2>
                        <p class="text-muted">No hay reseñas pendientes de moderación.</p>
                    </div>`;
                return;
            }

            resenas.forEach(r => {
                gridModeracion.innerHTML += `
                    <div style="background: var(--bg-card); padding: 20px; border-radius: 8px; border-left: 4px solid #d93025; margin-bottom: 15px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                            <div>
                                <h4 style="margin:0; color:var(--primary-green);">${r.usuario_nombre}</h4>
                                <span style="font-size:0.85rem; color:#888;">Producto: <strong>${r.producto_nombre}</strong></span>
                            </div>
                            <div class="stars" style="color:var(--primary-orange);">
                                ${Array(r.calificacion).fill('<i class="fas fa-star"></i>').join('')}
                            </div>
                        </div>
                        <p style="background:rgba(255,255,255,0.05); padding:15px; border-radius:6px; font-style:italic;">"${r.comentario}"</p>
                        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top: 15px;">
                            <button onclick="aprobarResena(${r.id})" class="btn-outline" style="border-color:var(--primary-green); color:var(--primary-green);"><i class="fas fa-check"></i> Ignorar Reporte</button>
                            <button onclick="eliminarResena(${r.id})" class="btn-solid" style="background:#d93025;"><i class="fas fa-trash"></i> Eliminar</button>
                        </div>
                    </div>
                `;
            });
        }

        // Funciones para los botones de la tarjeta
        window.aprobarResena = (id) => {
            Swal.fire({
                title: '¿Ignorar Reporte?',
                text: "La reseña volverá a ser pública.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#0cb06e',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, restaurar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await fetch(`/api/admin/resenas/${id}/aprobar`, {method: 'PUT'});
                    cargarReportadas();
                    Swal.fire({ icon: 'success', title: 'Restaurada', text: 'La reseña vuelve a ser pública.', confirmButtonColor: '#0cb06e' });
                }
            });
        };

        window.eliminarResena = (id) => {
            Swal.fire({
                title: '¿Borrar definitivamente?',
                text: "Esta reseña será eliminada por violar las normas.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d93025',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, borrar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await fetch(`/api/resenas/${id}`, {method: 'DELETE'});
                    cargarReportadas();
                    Swal.fire({ icon: 'success', title: 'Eliminada', text: 'La reseña fue borrada del sistema.', confirmButtonColor: '#0cb06e' });
                }
            });
        };

        cargarReportadas();
    }

    function iniciarReportes() {
        const adminStatsGrid = document.querySelector('.admin-stats-grid');
        if (!adminStatsGrid) return; // Validación de seguridad

        async function cargarDatosEstadisticos() {
            try {
                // 1. Obtenemos TODOS los productos aprovechando la ruta que ya tiene los promedios
                const res = await fetch('/api/productos');
                const productos = await res.json();
                
                // Solo nos interesan los productos que ya han sido calificados
                const evaluados = productos.filter(p => p.numResenas > 0);
                
                // Elementos del DOM donde pintaremos la información
                const elTotal = document.getElementById('rep-total');
                const elPromedio = document.getElementById('rep-promedio');
                const elPopNombre = document.getElementById('rep-pop-nombre');
                const elPopVotos = document.getElementById('rep-pop-votos');
                const listaMejores = document.getElementById('rep-lista-mejores');
                const listaPeores = document.getElementById('rep-lista-peores');

                if (evaluados.length === 0) {
                    if (listaMejores) listaMejores.innerHTML = "<p class='text-muted' style='padding:15px;'>No hay datos suficientes.</p>";
                    if (listaPeores) listaPeores.innerHTML = "<p class='text-muted' style='padding:15px;'>No hay datos suficientes.</p>";
                    return;
                }

                // 2. Realizamos los cálculos globales
                let totalResenas = 0;
                let sumaCalificaciones = 0;
                let masPopular = evaluados[0]; // Asumimos el primero temporalmente

                evaluados.forEach(p => {
                    totalResenas += p.numResenas;
                    sumaCalificaciones += (p.calificacion * p.numResenas); // Peso real de la calificación
                    
                    // Comparamos para encontrar el que tiene más reseñas
                    if (p.numResenas > masPopular.numResenas) {
                        masPopular = p;
                    }
                });

                const promedioGeneral = (sumaCalificaciones / totalResenas).toFixed(1);

                // 3. Inyectar datos en las tarjetas principales
                if(elTotal) elTotal.textContent = totalResenas;
                if(elPromedio) elPromedio.textContent = `${promedioGeneral} / 5.0`;
                if(elPopNombre) elPopNombre.textContent = masPopular.nombre;
                if(elPopVotos) elPopVotos.textContent = `${masPopular.numResenas} evaluaciones`;

                // 4. Preparar Rankings
                // Mejores: Ordenados de mayor a menor calificación
                const topMejores = [...evaluados].sort((a, b) => b.calificacion - a.calificacion).slice(0, 3);
                // Peores: Ordenados de menor a mayor calificación
                const topPeores = [...evaluados].sort((a, b) => a.calificacion - b.calificacion).slice(0, 3);

                // 5. Inyectar listas de Rankings
                if(listaMejores) {
                    listaMejores.innerHTML = "";
                    topMejores.forEach(p => {
                        listaMejores.innerHTML += `
                            <li style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border-color);">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <img src="${p.imagen}" style="width:45px; height:45px; border-radius:8px; object-fit:cover; border:1px solid var(--border-color);">
                                    <div style="display:flex; flex-direction:column;">
                                        <strong>${p.nombre}</strong>
                                        <small class="text-muted">${p.numResenas} reseñas registradas</small>
                                    </div>
                                </div>
                                <span style="color:var(--primary-orange); font-weight:bold; font-size:1.2rem;">
                                    <i class="fas fa-star"></i> ${p.calificacion.toFixed(1)}
                                </span>
                            </li>
                        `;
                    });
                }

                if(listaPeores) {
                    listaPeores.innerHTML = "";
                    topPeores.forEach(p => {
                        listaPeores.innerHTML += `
                            <li style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border-color);">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <img src="${p.imagen}" style="width:45px; height:45px; border-radius:8px; object-fit:cover; border:1px solid var(--border-color);">
                                    <div style="display:flex; flex-direction:column;">
                                        <strong>${p.nombre}</strong>
                                        <small class="text-muted">${p.numResenas} reseñas registradas</small>
                                    </div>
                                </div>
                                <span style="color:#d93025; font-weight:bold; font-size:1.2rem;">
                                    <i class="fas fa-star"></i> ${p.calificacion.toFixed(1)}
                                </span>
                            </li>
                        `;
                    });
                }

            } catch (error) {
                console.error("Error al cargar las estadísticas:", error);
            }
        }

        // Ejecutar al entrar a la vista
        cargarDatosEstadisticos();
    }
    
    const btnNuevoAdmin = document.getElementById('btn-nuevo-admin');
    const adminModal = document.getElementById('admin-modal');
    
    if (btnNuevoAdmin && adminModal) {
        const closeAdminModal = document.getElementById('close-admin-modal');
        const cancelAdminModal = document.getElementById('cancel-admin-modal');
        const formNuevoAdmin = document.getElementById('form-nuevo-admin');

        const cerrarModalAdmin = () => {
            adminModal.style.display = 'none';
            formNuevoAdmin.reset();
        };

        btnNuevoAdmin.addEventListener('click', () => adminModal.style.display = 'flex');
        closeAdminModal.addEventListener('click', cerrarModalAdmin);
        cancelAdminModal.addEventListener('click', cerrarModalAdmin);

        formNuevoAdmin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                nombre: document.getElementById('new-admin-nombre').value,
                correo: document.getElementById('new-admin-correo').value,
                password: document.getElementById('new-admin-password').value
            };

            try {
                const res = await fetch('/api/admin/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    alert("¡Éxito! " + data.message);
                    cerrarModalAdmin();
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error(error);
                alert("Hubo un problema de conexión al registrar al administrador.");
            }
        });
    }
});