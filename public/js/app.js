/**
 * app.js - Integrado con API RESTful (Fetch API)
 * UniSierra Eats
 */

// --- COMUNICACIÓN CON LA API (FETCH) ---

// Obtiene los productos desde SQLite y adapta los nombres de variables para el Frontend
async function obtenerProductosAPI() {
    try {
        const res = await fetch('/api/productos');
        const prods = await res.json();
        return prods.map(p => ({
            ...p,
            id_producto: p.id,
            precio_actual: p.precio,
            imagen: p.imagen_url || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60',
            categoria: "Catálogo General",
            precioNivel: p.precio < 40 ? "$" : "$$",
            etiquetas: ["Disponible"]
        }));
    } catch (e) {
        console.error("Error cargando productos:", e);
        return [];
    }
}

function generarEstrellas(calificacion) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (calificacion >= i) html += '<i class="fas fa-star"></i>'; 
        else if (calificacion >= i - 0.5) html += '<i class="fas fa-star-half-alt"></i>'; 
        else html += '<i class="far fa-star"></i>'; 
    }
    return html;
}

// --- MANEJO DE AUTENTICACIÓN ---
function configurarAuth() {
    const navActions = document.querySelector('.nav-actions');
    const sesion = JSON.parse(localStorage.getItem('unisierra_sesion'));

    if (navActions) {
        if (sesion) {
            navActions.innerHTML = `
                <a href="perfil.html" class="btn-solid"><i class="fas fa-user-circle"></i> Hola, ${sesion.nombre.split(' ')[0]}</a>
                <button id="btnLogout" class="btn-outline" style="border-color: #d93025; color: #d93025; padding: 6px 12px; margin-left: 10px;">Salir</button>
            `;
            document.getElementById('btnLogout').addEventListener('click', () => {
                localStorage.removeItem('unisierra_sesion');
                window.location.href = 'index.html';
            });
        } else {
            navActions.innerHTML = `
                <button class="btn-outline auth-btn" data-type="login" style="background:none; cursor:pointer;">Iniciar Sesión</button>
                <button class="btn-solid auth-btn" data-type="register" style="cursor:pointer;">Registrarse</button>
            `;
        }
    }

    const modal = document.getElementById('authModal');
    if (!modal) return;
    
    let isLoginMode = true;
    const authBtns = document.querySelectorAll('.auth-btn');
    const authForm = document.getElementById('authForm');
    const groupNombre = document.getElementById('groupNombre');
    const inputNombre = document.getElementById('authNombre');

    authBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            isLoginMode = e.target.dataset.type === 'login';
            document.getElementById('modalTitle').textContent = isLoginMode ? "Iniciar Sesión" : "Crear Cuenta";
            document.querySelector('#authForm button[type="submit"]').textContent = isLoginMode ? "Entrar" : "Registrarme";
            groupNombre.style.display = isLoginMode ? "none" : "block";
            inputNombre.required = !isLoginMode;
            modal.style.display = 'flex';
        });
    });

    document.getElementById('closeAuthModal').addEventListener('click', () => modal.style.display = 'none');

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            correo: document.getElementById('authEmail').value,
            password: document.getElementById('authPassword').value
        };

        try {
            if (isLoginMode) {
                // INICIAR SESIÓN
                const res = await fetch('/api/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                const data = await res.json();
                
                if (res.ok) {
                    localStorage.setItem('unisierra_sesion', JSON.stringify(data.usuario));
                    modal.style.display = 'none';
                    if (data.usuario.rol_id === 1) {
                        window.location.href = '../admin/panel_admin.html';
                    } else {
                        window.location.reload(); 
                    }
                } else {
                    alert(data.error || "Error al iniciar sesión");
                }
            } else {
                // REGISTRARSE
                payload.nombre = inputNombre.value;
                const res = await fetch('/api/registro', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                const data = await res.json();
                
                if (res.ok) {
                    alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
                    isLoginMode = true;
                    document.getElementById('modalTitle').textContent = "Iniciar Sesión";
                    document.querySelector('#authForm button[type="submit"]').textContent = "Entrar";
                    groupNombre.style.display = "none";
                    authForm.reset();
                } else {
                    alert(data.error || "Error al registrar");
                }
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
}

function configurarBuscadorGlobal() {
    const inputBusqueda = document.querySelector('.search-bar input');
    const btnBusqueda = document.querySelector('.btn-search');
    if (!inputBusqueda || !btnBusqueda) return;

    const ejecutarBusqueda = () => {
        const termino = inputBusqueda.value.trim();
        if (termino !== "") window.location.href = `busqueda.html?q=${encodeURIComponent(termino)}`;
    };
    btnBusqueda.addEventListener('click', ejecutarBusqueda);
    inputBusqueda.addEventListener('keypress', (e) => { if (e.key === 'Enter') ejecutarBusqueda(); });
}

// --- LÓGICA DE VISTAS ---

async function renderizarInicio() {
    const contenedorTop = document.querySelector('.product-grid');
    if (!contenedorTop) return;

    const productos = await obtenerProductosAPI();
    contenedorTop.innerHTML = ""; 
    
    // Top 3 Productos
    const topProductos = [...productos].sort((a, b) => b.calificacion - a.calificacion).slice(0, 3);
    
    topProductos.forEach(producto => {
        contenedorTop.innerHTML += `
            <article class="product-card">
                <div class="card-image" style="background-image: url('${producto.imagen}'); cursor: pointer;" 
                     onclick="window.location.href='detalle_producto.html?id=${producto.id_producto}'"></div>
                <div class="card-content">
                    <h3 class="product-title" style="cursor: pointer;" onclick="window.location.href='detalle_producto.html?id=${producto.id_producto}'">
                        ${producto.nombre}
                    </h3>
                    <div class="rating">
                        <span class="rating-stars" style="color:var(--primary-orange); margin-right: 5px;">
                            ${generarEstrellas(producto.calificacion)}
                        </span>
                        <span class="review-count">${producto.calificacion.toFixed(1)} (${producto.numResenas})</span>
                    </div>
                    <p class="review-snippet">${producto.descripcion.substring(0, 80)}...</p>
                </div>
            </article>
        `;
    });
}

async function renderizarMenu() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;
    
    let productos = await obtenerProductosAPI();
    
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query) {
        const termino = query.toLowerCase();
        productos = productos.filter(p => 
            p.nombre.toLowerCase().includes(termino) || 
            p.descripcion.toLowerCase().includes(termino)
        );
        document.title = `Resultados para "${query}" - UniSierra Eats`;
    }

    menuGrid.innerHTML = ""; 

    // Mensaje si no hay resultados
    if (productos.length === 0) {
        menuGrid.innerHTML = `<p style="text-align:center; width: 100%; color: var(--text-muted); margin-top: 20px;">No se encontraron productos para tu búsqueda.</p>`;
        return;
    }

    let listaHtml = "";
    productos.forEach(p => {
        listaHtml += `
            <li style="display: flex; justify-content: space-between; align-items: flex-start; padding: 15px 0; border-bottom: 1px dashed var(--border-color);">
                <div class="menu-item-info" style="flex-grow: 1; padding-right: 20px;">
                    <a href="detalle_producto.html?id=${p.id_producto}" style="text-decoration: none;">
                        <span class="item-name" style="color: var(--text-main); font-size: 1.1rem; font-weight: bold;">
                            ${p.nombre}
                        </span>
                    </a>
                    <p class="item-desc" style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">${p.descripcion}</p>
                </div>
                <span class="item-price" style="color: var(--primary-green); font-weight: bold; font-size: 1.1rem;">$${parseFloat(p.precio_actual).toFixed(2)}</span>
            </li>
        `;
    });

    // Cambiamos el título dependiendo de si es una búsqueda o el menú general
    const tituloSeccion = query ? `Resultados de búsqueda: "${query}"` : 'Catálogo General';

    menuGrid.innerHTML = `
        <section class="menu-category" style="margin-bottom: 40px;">
            <h2 class="category-title" style="font-size: 1.8rem; color: var(--primary-orange); margin-bottom: 20px;">${tituloSeccion}</h2>
            <ul class="menu-list" style="list-style: none; padding: 0;">${listaHtml}</ul>
        </section>
    `;
}

async function renderizarDetalleProducto() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (!productId) return;

    const productos = await obtenerProductosAPI();
    const producto = productos.find(p => p.id_producto === productId);

    if (producto) {
        document.title = `${producto.nombre} - UniSierra Eats`;
        document.querySelector('.header-titles h1').textContent = producto.nombre;
        document.querySelector('.about-section p').textContent = producto.descripcion;
        document.querySelector('.gallery-main').style.backgroundImage = `url('${producto.imagen}')`;
        
        document.querySelector('.quick-stats').innerHTML = `
            <span class="rating-stars" style="color:var(--primary-orange)">${generarEstrellas(producto.calificacion)}</span>
            <a href="#reviews" class="review-link">${producto.calificacion.toFixed(1)} (${producto.numResenas} reseñas)</a>
        `;

        document.querySelector('.score-big .number').textContent = producto.calificacion.toFixed(1);
        document.querySelector('.score-big .total-count').textContent = `${producto.numResenas} reseñas`;

        const btnEscribirResena = document.querySelector('.reviews-header-flex .btn-solid');
        if(btnEscribirResena) {
            btnEscribirResena.onclick = () => {
                if (localStorage.getItem('unisierra_sesion')) {
                    window.location.href = `escribir_resena.html?id=${producto.id_producto}`;
                } else {
                    alert('Inicia sesión para escribir una reseña.');
                }
            };
        }

        // Cargar Reseñas desde API
        const resenasContenedor = document.querySelector('.reviews-list');
        if (resenasContenedor) {
            try {
                const res = await fetch(`/api/resenas/producto/${productId}`);
                const resenas = await res.json();
                resenasContenedor.innerHTML = ""; 

                if (resenas.length === 0) {
                    resenasContenedor.innerHTML = `<p style="color: var(--text-muted);">Aún no hay reseñas. ¡Sé el primero en opinar!</p>`;
                } else {
                    resenas.forEach(r => {
                        resenasContenedor.innerHTML += `
                            <article class="single-review">
                                <div class="reviewer-info">
                                    <div class="reviewer-avatar"><i class="fas fa-user-circle"></i></div>
                                    <div>
                                        <h4 class="reviewer-name">${r.usuario_nombre}</h4>
                                        <span class="review-date">Escrita el ${r.fecha}</span>
                                    </div>
                                </div>
                                <div class="rating-stars small-stars" style="color:var(--primary-orange)">
                                    ${generarEstrellas(r.calificacion)}
                                </div>
                                <p class="review-body">${r.comentario}</p>
                            </article>
                        `;
                    });
                }
            } catch (e) {
                console.error("Error al cargar reseñas", e);
            }
        }
    }
}

async function manejarEscrituraResena() {
    const formReview = document.querySelector('.review-form');
    if(!formReview) return;

    const urlParams = new URLSearchParams(window.location.search);
    const prodId = parseInt(urlParams.get('id'));
    const sesion = JSON.parse(localStorage.getItem('unisierra_sesion'));
    
    if(!sesion) {
        alert("Debes iniciar sesión");
        window.location.href = "index.html";
        return;
    }

    const productos = await obtenerProductosAPI();
    const producto = productos.find(p => p.id_producto === prodId);
    if(producto) {
        document.querySelector('.summary-details h3').textContent = producto.nombre;
        document.querySelector('.summary-image').style.backgroundImage = `url('${producto.imagen}')`;
    }

    let calificacionSeleccionada = 0;
    const estrellas = document.querySelectorAll('.star-rating-input i');
    estrellas.forEach((estrella, index) => {
        estrella.addEventListener('click', () => {
            calificacionSeleccionada = index + 1;
            document.querySelector('.rating-text').textContent = `${calificacionSeleccionada} estrellas`;
            estrellas.forEach((s, i) => {
                s.className = i <= index ? 'fas fa-star active' : 'far fa-star';
            });
        });
    });

    formReview.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (calificacionSeleccionada === 0) return alert("Selecciona una calificación.");
        const comentario = document.getElementById('review-body').value.trim();

        const payload = {
            usuario_id: sesion.id,
            producto_id: prodId,
            calificacion: calificacionSeleccionada,
            comentario: comentario
        };

        try {
            const res = await fetch('/api/resenas', {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("¡Gracias por tu opinión!");
                window.location.href = `detalle_producto.html?id=${prodId}`;
            }
        } catch (error) {
            alert("Error al guardar reseña.");
        }
    });
}

// Manejo del Perfil y Edición/Eliminación de Reseñas
async function manejarPerfil() {
    const sesion = JSON.parse(localStorage.getItem('unisierra_sesion'));
    if(!sesion) return window.location.href = "index.html";

    const nombrePerfil = document.querySelector('.profile-name');
    if (nombrePerfil) nombrePerfil.textContent = sesion.nombre;

    const resenasContenedor = document.querySelector('.reviews-list');
    if (!resenasContenedor) return;

    // Cargar las reseñas del usuario desde la API
    async function cargarMisResenas() {
        try {
            const res = await fetch(`/api/resenas/usuario/${sesion.id}`);
            const misResenas = await res.json();
            resenasContenedor.innerHTML = ""; 

            if (misResenas.length === 0) {
                resenasContenedor.innerHTML = "<p>Aún no has escrito ninguna reseña.</p>";
                return;
            }

            misResenas.forEach(r => {
                resenasContenedor.innerHTML += `
                    <article class="single-review" style="background: var(--bg-card); padding: 15px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 15px;">
                        <div class="reviewer-info" style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="reviewer-name">Evaluaste: ${r.producto_nombre}</h4>
                            <div class="review-actions" style="gap: 10px;">
                                <button class="btn-action-small edit-btn" data-id="${r.id}" data-comentario="${r.comentario}" data-calif="${r.calificacion}"><i class="fas fa-edit"></i> Editar</button>
                                <button class="btn-action-small report-btn delete-btn" data-id="${r.id}"><i class="fas fa-trash"></i> Eliminar</button>
                            </div>
                        </div>
                        <span class="review-date">${r.fecha}</span>
                        <div class="rating-stars small-stars" style="color:var(--primary-orange); margin: 5px 0;">
                            ${generarEstrellas(r.calificacion)}
                        </div>
                        <p class="review-body">${r.comentario}</p>
                    </article>
                `;
            });

            asignarEventosResenas();
        } catch (e) {
            resenasContenedor.innerHTML = "<p>Error al cargar tus reseñas.</p>";
        }
    }

    function asignarEventosResenas() {
        // Eliminar Reseña
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if(confirm("¿Seguro que deseas eliminar esta reseña?")) {
                    await fetch(`/api/resenas/${id}`, { method: 'DELETE' });
                    cargarMisResenas();
                }
            });
        });

        // Editar Reseña (Prompt rápido para simplificar la interfaz)
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const dataset = e.currentTarget.dataset;
                const nuevoComentario = prompt("Edita tu comentario:", dataset.comentario);
                if (nuevoComentario === null) return;
                
                let nuevaCalif = prompt("Nueva calificación (1 a 5):", dataset.calif);
                nuevaCalif = parseInt(nuevaCalif);
                if (isNaN(nuevaCalif) || nuevaCalif < 1 || nuevaCalif > 5) {
                    return alert("Calificación inválida.");
                }

                await fetch(`/api/resenas/${dataset.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ calificacion: nuevaCalif, comentario: nuevoComentario })
                });
                cargarMisResenas();
            });
        });
    }

    cargarMisResenas();
}

// --- INICIALIZACIÓN GLOBAL ---
document.addEventListener('DOMContentLoaded', () => {
    configurarAuth();
    configurarBuscadorGlobal();

    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path === '') renderizarInicio();
    else if (path.includes('detalle_producto.html')) renderizarDetalleProducto();
    else if (path.includes('menu.html') || path.includes('busqueda.html')) renderizarMenu();
    else if (path.includes('escribir_resena.html')) manejarEscrituraResena();
    else if (path.includes('perfil.html')) manejarPerfil();
});