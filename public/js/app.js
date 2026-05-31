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
            id_producto: p.id_producto,
            precio_actual: p.precio,
            imagen: p.imagen || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=500&q=60',
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

async function renderizarBusqueda() {
    const resultsList = document.querySelector('.results-list');
    if (!resultsList) return;

    // 1. Obtener lo que el usuario buscó desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';
    
    // 2. Colocar la palabra buscada en el input del header para que no se borre
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput && query) {
        searchInput.value = query;
    }

    // 3. Actualizar el título de la página
    const titleElement = document.querySelector('.results-header h2');
    if (titleElement) {
        titleElement.textContent = query ? `Top Resultados para "${query}"` : 'Todos los productos';
    }

    // 4. Obtener productos de la API
    let productos = await obtenerProductosAPI();

    // 5. Filtrar por el texto buscado
    if (query) {
        const termino = query.toLowerCase();
        productos = productos.filter(p => 
            p.nombre.toLowerCase().includes(termino) || 
            p.descripcion.toLowerCase().includes(termino)
        );
    }

    // 6. Activar la interactividad de los botones de precio (Filtro visual inicial)
    const priceBtns = document.querySelectorAll('.btn-price');
    priceBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            priceBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            // Aquí en un futuro puedes agregar lógica extra para filtrar por precio
        });
    });

    resultsList.innerHTML = ""; 

    // 7. Mostrar mensaje si no hay resultados
    if (productos.length === 0) {
        resultsList.innerHTML = `<p style="text-align:center; margin-top:20px; color:var(--text-muted);">No se encontraron productos que coincidan con tu búsqueda.</p>`;
        return;
    }

    // 8. Pintar las tarjetas de resultados usando la estructura de busqueda.html
    productos.forEach(p => {
        resultsList.innerHTML += `
            <div class="result-card">
                <div class="result-image" style="background-image: url('${p.imagen}'); cursor:pointer;" onclick="window.location.href='detalle_producto.html?id=${p.id_producto}'"></div>
                <div class="result-details">
                    <div class="result-title-row">
                        <h3 onclick="window.location.href='detalle_producto.html?id=${p.id_producto}'">${p.nombre}</h3>
                        <i class="far fa-heart heart-icon"></i>
                    </div>
                    <div class="rating-stars" style="color:var(--primary-orange); margin-bottom: 5px;">
                        ${generarEstrellas(p.calificacion)}
                        <span style="color:var(--text-muted); font-size:0.9rem; margin-left:5px;">${p.calificacion.toFixed(1)} (${p.numResenas} reseñas)</span>
                    </div>
                    <div class="result-tags">
                        <span class="tag tag-price">${p.precioNivel}</span>
                        <span class="dot-separator">•</span>
                        <span class="tag tag-category">Cafetería</span>
                    </div>
                    <p class="review-snippet">${p.descripcion.substring(0, 100)}...</p>
                </div>
            </div>
        `;
    });
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

// Cargar Reseñas desde API y Actualizar Barras de Progreso
        const resenasContenedor = document.querySelector('.reviews-list');
        if (resenasContenedor) {
            try {
                const res = await fetch(`/api/resenas/producto/${productId}`);
                const resenas = await res.json();
                resenasContenedor.innerHTML = ""; 

                // --- LÓGICA: BARRAS DE PROGRESO DINÁMICAS ---
                const ratingBarsContainer = document.querySelector('.rating-bars');
                if (ratingBarsContainer) {
                    const conteoEstrellas = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                    resenas.forEach(r => {
                        const calif = Math.round(r.calificacion);
                        if(conteoEstrellas[calif] !== undefined) conteoEstrellas[calif]++;
                    });

                    let barrasHtml = "";
                    const totalResenas = resenas.length;

                    for (let i = 5; i >= 1; i--) {
                        const porcentaje = totalResenas === 0 ? 0 : Math.round((conteoEstrellas[i] / totalResenas) * 100);
                        const numResenasEstrella = conteoEstrellas[i];
                        
                        barrasHtml += `
                            <div class="bar-row" style="display: flex; align-items: center; margin-bottom: 8px;">
                                <span class="star-label" style="width: 40px; color: var(--text-main); font-weight: bold;">${i} <i class="fas fa-star" style="color: var(--primary-orange); font-size: 0.9rem;"></i></span>
                                <div class="progress-bar" style="flex-grow: 1; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; margin: 0 12px; overflow: hidden;">
                                    <div class="progress-fill" style="width: ${porcentaje}%; height: 100%; background: var(--primary-orange); border-radius: 4px; transition: width 0.8s ease-out;"></div>
                                </div>
                                <span class="percent" style="width: 35px; text-align: right; color: var(--text-muted); font-size: 0.9rem;">${porcentaje}%</span>
                            </div>
                        `;
                    }
                    ratingBarsContainer.innerHTML = barrasHtml;
                }
                // --- FIN DE LÓGICA DE BARRAS ---

                // Pintar la lista de reseñas (Comentarios)
                if (resenas.length === 0) {
                    resenasContenedor.innerHTML = `<p style="color: var(--text-muted);">Aún no hay reseñas. ¡Sé el primero en opinar!</p>`;
                } else {
                    resenas.forEach(r => {
                        resenasContenedor.innerHTML += `
                            <article class="single-review" style="background: var(--bg-card); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--border-color); position: relative;">
                                <div class="reviewer-info" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                    <div class="reviewer-avatar" style="font-size: 2rem; color: #888;"><i class="fas fa-user-circle"></i></div>
                                    <div>
                                        <h4 class="reviewer-name" style="margin: 0; color: var(--primary-green);">${r.usuario_nombre}</h4>
                                        <span class="review-date" style="font-size: 0.8rem; color: #888;">Escrita el ${r.fecha.split(' ')[0]}</span>
                                    </div>
                                </div>
                                
                                <button onclick="reportarResena(${r.id})" title="Reportar contenido inapropiado" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem;">
                                    <i class="fas fa-flag"></i>
                                </button>

                                <div class="rating-stars small-stars" style="color:var(--primary-orange); margin-bottom: 10px;">
                                    ${generarEstrellas(r.calificacion)}
                                </div>
                                <p class="review-body" style="margin: 0; color: var(--text-main); line-height: 1.5;">${r.comentario}</p>
                            </article>
                        `;
                    });
                }
            } catch (e) {
                console.error("Error al cargar reseñas", e);
                resenasContenedor.innerHTML = `<p style="color: #d93025;">Ocurrió un error al cargar las opiniones.</p>`;
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

// Herramienta para crear modales
function mostrarModalPersonalizado({ titulo, mensaje, tipo = 'confirm', valorInput = '', valorCalif = 5, imagen = '', nombre = '' }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        
        let bodyHtml = `<p>${mensaje}</p>`;
        
        // Estructura especial para editar reseñas
        if (tipo === 'edit-review') {
            let estrellasHtml = '';
            for (let i = 1; i <= 5; i++) {
                estrellasHtml += `<i class="${i <= valorCalif ? 'fas' : 'far'} fa-star custom-star" data-val="${i}" style="cursor:pointer; font-size:1.8rem; color:var(--primary-orange); margin: 0 5px; transition: 0.2s;"></i>`;
            }
            bodyHtml = `
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; text-align:left; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                    <img src="${imagen || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=500&q=60'}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
                    <div>
                        <h4 style="margin:0; color:var(--primary-green); font-size:1.1rem;">${nombre}</h4>
                        <p style="margin:0; font-size:0.85rem; color:#aaa;">Edita tu calificación</p>
                    </div>
                </div>
                <div id="customStarContainer" style="margin-bottom:15px;">
                    ${estrellasHtml}
                </div>
                <textarea id="customComentario" rows="4" placeholder="Actualiza tu comentario...">${valorInput}</textarea>
            `;
        }

        overlay.innerHTML = `
            <div class="custom-alert-box ${tipo === 'confirm' ? 'danger-mode' : ''}">
                <h3>${titulo}</h3>
                ${bodyHtml}
                <div class="custom-alert-actions">
                    <button id="btnCustomCancel" class="btn-outline" style="border-color:#888; color:#888;">Cancelar</button>
                    <button id="btnCustomAceptar" class="btn-solid" style="background:${tipo === 'confirm' ? '#d93025' : 'var(--primary-green)'}">
                        ${tipo === 'confirm' ? 'Eliminar' : 'Guardar'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);

        // Lógica para que las estrellas sean clicables
        let currentRating = parseInt(valorCalif);
        if (tipo === 'edit-review') {
            const stars = overlay.querySelectorAll('.custom-star');
            stars.forEach(star => {
                star.addEventListener('click', (e) => {
                    currentRating = parseInt(e.currentTarget.dataset.val);
                    stars.forEach((s, idx) => {
                        s.className = idx < currentRating ? 'fas fa-star custom-star' : 'far fa-star custom-star';
                    });
                });
            });
        }

        document.getElementById('btnCustomCancel').onclick = () => {
            document.body.removeChild(overlay);
            resolve(null);
        };

        document.getElementById('btnCustomAceptar').onclick = () => {
            if (tipo === 'edit-review') {
                const comentario = document.getElementById('customComentario').value.trim();
                document.body.removeChild(overlay);
                resolve({ calificacion: currentRating, comentario: comentario });
            } else {
                document.body.removeChild(overlay);
                resolve(true);
            }
        };
    });
}

// Manejo de perfil
async function manejarPerfil() {
    const sesion = JSON.parse(localStorage.getItem('unisierra_sesion'));
    if(!sesion) return window.location.href = "index.html";

    const nombrePerfil = document.querySelector('.profile-name');
    if (nombrePerfil) nombrePerfil.textContent = sesion.nombre;

    // Lógica para cambiar entre pestañas del perfil (Resumen vs Mis Reseñas)
    const btnResumen = document.querySelector('.profile-nav li:nth-child(1)');
    const btnMisResenas = document.querySelector('.profile-nav li:nth-child(2)');
    const seccionResumen = document.getElementById('resumen-actividad');
    const seccionResenas = document.getElementById('mis-resenas');

    // Función auxiliar para cambiar pestañas visualmente
    function activarPestana(activa, inactiva, secActiva, secInactiva) {
        if(activa && secActiva) {
            activa.classList.add('active');
            inactiva.classList.remove('active');
            secActiva.style.display = 'block';
            secInactiva.style.display = 'none';
        }
    }

    if (btnResumen && btnMisResenas) {
        btnResumen.addEventListener('click', () => activarPestana(btnResumen, btnMisResenas, seccionResumen, seccionResenas));
        btnMisResenas.addEventListener('click', () => activarPestana(btnMisResenas, btnResumen, seccionResenas, seccionResumen));
    }

    const resenasContenedor = document.querySelector('.reviews-list');
    if (!resenasContenedor) return;

    // Cargar las reseñas del usuario desde la API
    async function cargarMisResenas() {
        try {
            const res = await fetch(`/api/resenas/usuario/${sesion.id}`);
            const misResenas = await res.json();
            resenasContenedor.innerHTML = ""; 

            if (misResenas.length === 0) {
                resenasContenedor.innerHTML = "<p style='color: var(--text-muted);'>Aún no has escrito ninguna reseña.</p>";
                return;
            }

            misResenas.forEach(r => {
                resenasContenedor.innerHTML += `
                    <article class="single-review" style="background: var(--bg-card); padding: 15px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 15px;">
                        <div class="reviewer-info" style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="reviewer-name" style="margin:0;">Evaluaste: <span style="color:var(--primary-green)">${r.producto_nombre}</span></h4>
                            <div class="review-actions" style="display: flex; gap: 10px;">
                                <button class="btn-action-small edit-btn" style="background:transparent; border:1px solid #aaa; color:#ccc; padding:5px 10px; border-radius:4px; cursor:pointer;" data-id="${r.id}" data-comentario="${r.comentario}" data-calif="${r.calificacion}" data-nombre="${r.producto_nombre}" data-img="${r.producto_imagen}"><i class="fas fa-edit"></i> Editar</button>
                                <button class="btn-action-small report-btn delete-btn" style="background:transparent; border:1px solid #d93025; color:#d93025; padding:5px 10px; border-radius:4px; cursor:pointer;" data-id="${r.id}"><i class="fas fa-trash"></i> Eliminar</button>
                            </div>
                        </div>
                        <span class="review-date" style="font-size:0.85rem; color:#888;">${r.fecha}</span>
                        <div class="rating-stars small-stars" style="color:var(--primary-orange); margin: 8px 0;">
                            ${generarEstrellas(r.calificacion)}
                        </div>
                        <p class="review-body" style="margin:0;">${r.comentario}</p>
                    </article>
                `;
            });

            asignarEventosResenas();
        } catch (e) {
            console.error("Error", e);
            resenasContenedor.innerHTML = "<p>Error al cargar tus reseñas.</p>";
        }
    }

    function asignarEventosResenas() {
        // Eliminar Reseña (Con Modal Estético)
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const confirmado = await mostrarModalPersonalizado({
                    titulo: 'Eliminar Reseña',
                    mensaje: '¿Estás seguro de que deseas eliminar esta reseña de forma permanente?'
                });
                
                if(confirmado) {
                    await fetch(`/api/resenas/${id}`, { method: 'DELETE' });
                    cargarMisResenas(); // Recarga la lista
                }
            });
        });

        // Editar Reseña (Con Modal Estético de Estrellas)
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const dataset = e.currentTarget.dataset;
                
                const resultado = await mostrarModalPersonalizado({
                    titulo: 'Editar Reseña',
                    tipo: 'edit-review',
                    valorCalif: dataset.calif,
                    valorInput: dataset.comentario,
                    nombre: dataset.nombre,
                    imagen: dataset.img
                });

                if (resultado) {
                    await fetch(`/api/resenas/${dataset.id}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ calificacion: resultado.calificacion, comentario: resultado.comentario })
                    });
                    cargarMisResenas();
                }
            });
        });
    }

    cargarMisResenas();
}

// Configuración de Usuario
function manejarConfiguracion() {
    const sesion = JSON.parse(localStorage.getItem('unisierra_sesion'));
    if(!sesion) return window.location.href = "index.html";

    const inputNombre = document.getElementById('configNombre');
    const inputEmail = document.getElementById('configEmail');
    const inputPassword = document.getElementById('configPassword');
    const formConfig = document.getElementById('configForm');
    const btnEliminar = document.getElementById('btnEliminarCuenta');

    if(!formConfig) return;

    // Llenar los campos con la información actual
    inputNombre.value = sesion.nombre;
    inputEmail.value = sesion.correo;

    // Guardar Cambios (Actualizar)
    formConfig.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            nombre: inputNombre.value.trim(),
            password: inputPassword.value
        };

        try {
            const res = await fetch(`/api/usuarios/${sesion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                sesion.nombre = payload.nombre;
                localStorage.setItem('unisierra_sesion', JSON.stringify(sesion));
                
                await mostrarModalPersonalizado({
                    titulo: '¡Éxito!',
                    mensaje: 'Tus datos han sido actualizados correctamente.',
                    tipo: 'success'
                });
                window.location.reload();
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
        }
    });

    // Eliminar Cuenta
    btnEliminar.addEventListener('click', async () => {
        const confirmado = await mostrarModalPersonalizado({
            titulo: 'Advertencia Peligrosa',
            mensaje: '¿Estás completamente seguro de eliminar tu cuenta? Esta acción borrará todas tus reseñas y no se puede deshacer.',
            tipo: 'confirm'
        });

        if (confirmado) {
            try {
                const res = await fetch(`/api/usuarios/${sesion.id}`, { method: 'DELETE' });
                if (res.ok) {
                    // Borramos la sesión y lo mandamos a la página principal
                    localStorage.removeItem('unisierra_sesion');
                    alert("Tu cuenta ha sido eliminada.");
                    window.location.href = "index.html";
                }
            } catch (error) {
                console.error("Error al eliminar cuenta:", error);
            }
        }
    });
}

window.reportarResena = async function(id) {
    if (!confirm("¿Estás seguro de que deseas reportar esta reseña por contenido inapropiado? (Se ocultará para revisión)")) return;
    try {
        const res = await fetch(`/api/resenas/${id}/reportar`, { method: 'PUT' });
        if (res.ok) {
            alert("Reseña reportada exitosamente. Un administrador la revisará.");
            location.reload(); 
        }
    } catch (e) {
        console.error("Error al reportar:", e);
    }
};

// --- INICIALIZACIÓN GLOBAL ---
document.addEventListener('DOMContentLoaded', () => {
    configurarAuth();
    configurarBuscadorGlobal();

    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path === '') renderizarInicio();
    else if (path.includes('detalle_producto.html')) renderizarDetalleProducto();
    else if (path.includes('menu.html')) renderizarMenu();
    else if (path.includes('busqueda.html')) renderizarBusqueda();
    else if (path.includes('escribir_resena.html')) manejarEscrituraResena();
    else if (path.includes('perfil.html')) manejarPerfil();
    else if (path.includes('configuracion.html')) manejarConfiguracion();
});