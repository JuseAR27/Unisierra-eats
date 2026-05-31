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
            } catch (error) {
                console.error("Error al cargar productos:", error);
                adminTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error al cargar la base de datos.</td></tr>`;
            }
        }

        function renderizarTabla(productos) {
            const terminoBusqueda = searchInput.value.toLowerCase().trim();
            adminTable.innerHTML = "";

            const productosFiltrados = productos.filter(p => {
                return p.nombre.toLowerCase().includes(terminoBusqueda) || p.id_producto.toString().includes(terminoBusqueda);
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

        const payload = {
            nombre: inputNombre.value,
            precio: parseFloat(inputPrecio.value),
            descripcion: inputDesc.value,
            imagen: inputImagen.value || "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60",
            categoria: inputCategoria.value
        };

        // POST y PUT: Enviar datos del formulario a la API
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                nombre: inputNombre.value,
                precio: parseFloat(inputPrecio.value),
                descripcion: inputDesc.value,
                imagen_url: inputImagen.value || "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60",
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
                    alert("Producto actualizado exitosamente en la BD.");
                } else {
                    // Crear nuevo
                    await fetch('/api/productos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    alert("Producto agregado exitosamente a la BD.");
                }

                modal.style.display = 'none';
                form.reset();
                cargarProductos();
            } catch (error) {
                console.error("Error al guardar:", error);
                alert("Hubo un error al guardar el producto.");
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

        // Abrir modal para nuevo registro
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

        // Iniciar la carga de la tabla al entrar a la página
        cargarProductos();
    }

    // ==========================================
    // MÓDULOS DE MODERACIÓN Y REPORTES 
    // ==========================================
    function iniciarModeracion() {
        console.log("Módulo de moderación pendiente de migrar a base de datos.");
    }

    function iniciarReportes() {
        console.log("Módulo de reportes pendiente de migrar a base de datos.");
    }
});