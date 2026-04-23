/**
 * app.js - Lógica principal para la vista de Estudiantes
 * UniSierra Eats
 */

// --- 1. DATOS INICIALES ---
// (Los arreglos de productosIniciales, rolesIniciales, usuariosIniciales, 
//  calificacionesIniciales y resenasIniciales.
const productosIniciales = [
    { id_producto: 1, nombre: "Lonche de Pierna Especial", descripcion: "El clásico de la UniSierra. Un lonche preparado al momento con pan calientito, pierna de cerdo deshebrada, mayonesa, tomate, cebolla y aguacate.", precio_actual: 50.00, precioNivel: "$$", calificacion: 4.8, numResenas: 142, imagen: "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", etiquetas: ["Disponible", "Comidas Fuertes"], categoria: "Comidas Fuertes"},
    { id_producto: 2, nombre: "Jugo Natural Naranja", descripcion: "Jugo 100% natural, exprimido al instante. Sin azúcar añadida y lleno de vitamina C.", precio_actual: 30.00, precioNivel: "$", calificacion: 5.0, numResenas: 45, imagen: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", etiquetas: ["Disponible", "Bebidas y Café"], categoria: "Bebidas y Café"},
    { id_producto: 3, nombre: "Pizza Peperoni (Rebanada)", descripcion: "Rebanada grande de pizza clásica de peperoni con abundante queso derretido.", precio_actual: 35.00, precioNivel: "$", calificacion: 3.0, numResenas: 85, imagen: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", etiquetas: ["Agotado", "Comidas Fuertes"], categoria: "Comidas Fuertes"},
    { id_producto: 4, nombre: "Sándwich Vegetariano", descripcion: "Preparado con pan integral, lechuga fresca, tomate, pepino, aguacate y aderezo especial.", precio_actual: 40.00, precioNivel: "$", calificacion: 4.0, numResenas: 89, imagen: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", etiquetas: ["Disponible", "Opciones Sanas"], categoria: "Opciones Sanas"},
    { id_producto: 5, nombre: "Galletas Chokis", descripcion: "Paquete de galletas tradicionales con chispas de sabor a chocolate.", precio_actual: 18.00, precioNivel: "$", calificacion: 4.5, numResenas: 20, imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", etiquetas: ["Disponible", "Snacks"], categoria: "Snacks"}
];

const rolesIniciales = [
    { id_rol: 1, nombre_rol: "Administrador" },
    { id_rol: 2, nombre_rol: "Estudiante" }
];

const usuariosIniciales = [
    { 
        id_usuario: 999, 
        correo_institucional: "admin@unisierra.edu.mx", 
        password: "admin", 
        nombre_usuario: "Personal", 
        apellidos: "Cafetería",
        carrera: "N/A",
        ubicacion: "Cafetería Central",
        miembroDesde: "Enero 2026",
        id_rol: 1 
    },
    { 
        id_usuario: 101, 
        correo_institucional: "jaquino@unisierra.edu.mx", 
        password: "123", 
        nombre_usuario: "José Francisco", 
        apellidos: "Aquino Rivera",
        carrera: "sistemas",
        ubicacion: "Moctezuma, Sonora",
        miembroDesde: "Marzo 2026",
        id_rol: 2 
    },
    { id_usuario: 102, correo_institucional: "ana@unisierra.edu.mx", 
        password: "123", 
        nombre_usuario: "Ana M.", 
        apellidos: "Garcia", 
        carrera: "biologia", 
        ubicacion: "Sonora, México", 
        miembroDesde: "Marzo 2026", 
        id_rol: 2 
    }
];

const calificacionesIniciales = [
    { id_calificacion: 1, id_usuario: 101, id_producto: 1, puntuacion: 5 },
    { id_calificacion: 2, id_usuario: 102, id_producto: 2, puntuacion: 5 },
    { id_calificacion: 3, id_usuario: 101, id_producto: 3, puntuacion: 3 }
];

const resenasIniciales = [
    { id_reseña: 1, id_usuario: 101, id_producto: 1, comentario_text: "El pan siempre está en su punto. La carne tiene muy buen sabor y la porción te deja satisfecho. El único detalle es que a las 11 AM se hace mucha fila, pero vale la pena la espera.", fecha_publicacion: "24/03/2026" },
    { id_reseña: 2, id_usuario: 102, id_producto: 2, comentario_text: "Excelente para empezar el día antes de la clase de bases de datos, súper fresco.", fecha_publicacion: "25/03/2026" },
    { id_reseña: 3, id_usuario: 101, id_producto: 3, comentario_text: "A veces la sirven un poco fría, pero saca del apuro cuando hay poco tiempo.", fecha_publicacion: "26/03/2026" }
];

/**
 * Inicializa la base de datos simulada en localStorage.
 * Si es la primera vez que se carga la página, guarda los arreglos iniciales.
 */
function inicializarDatos() {
    if (!localStorage.getItem('unisierra_roles')) {
        localStorage.clear(); 
        localStorage.setItem('unisierra_productos', JSON.stringify(productosIniciales));
        localStorage.setItem('unisierra_roles', JSON.stringify(rolesIniciales));
        localStorage.setItem('unisierra_usuarios', JSON.stringify(usuariosIniciales));
        localStorage.setItem('unisierra_calificaciones', JSON.stringify(calificacionesIniciales));
        localStorage.setItem('unisierra_resenas', JSON.stringify(resenasIniciales));
        localStorage.setItem('unisierra_sesion', JSON.stringify(usuariosIniciales[0]));
    }
}

/**
 * Obtiene la lista completa de productos desde localStorage.
 * @returns {Array} Arreglo de objetos de productos.
 */
function obtenerProductos() {
    return JSON.parse(localStorage.getItem('unisierra_productos')) || [];
}

/**
 * Simula una consulta INNER JOIN de base de datos.
 * Cruza las tablas de Reseñas, Usuarios y Calificaciones para un producto específico.
 * @param {number} productoId - El ID del producto a consultar.
 * @returns {Array} Arreglo con los detalles completos de las reseñas (autor, fecha, texto, estrellas).
 */
function obtenerResenasCompletas(productoId) {
    const resenas = JSON.parse(localStorage.getItem('unisierra_resenas')) || [];
    const calificaciones = JSON.parse(localStorage.getItem('unisierra_calificaciones')) || [];
    const usuarios = JSON.parse(localStorage.getItem('unisierra_usuarios')) || [];
    const resenasDelProducto = resenas.filter(r => r.id_producto === productoId);

    return resenasDelProducto.map(reseña => {
        const usuario = usuarios.find(u => u.id_usuario === reseña.id_usuario) || { nombre_usuario: "Anónimo" };
        const calif = calificaciones.find(c => c.id_usuario === reseña.id_usuario && c.id_producto === productoId) || { puntuacion: 0 };
        return {
            nombre_usuario: usuario.nombre_usuario,
            fecha: reseña.fecha_publicacion,
            comentario: reseña.comentario_text,
            puntuacion: calif.puntuacion
        };
    });
}

/**
 * Genera el código HTML para mostrar visualmente las estrellas de calificación.
 * @param {number} calificacion - Promedio del producto (ej. 4.5).
 * @returns {string} Cadena de texto con etiquetas <i> de FontAwesome.
 */
function generarEstrellas(calificacion) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (calificacion >= i) {
            html += '<i class="fas fa-star"></i>'; 
        } else if (calificacion >= i - 0.5) {
            html += '<i class="fas fa-star-half-alt"></i>'; 
        } else {
            html += '<i class="far fa-star"></i>'; 
        }
    }
    return html;
}

// --- 2. MANEJO DE AUTENTICACIÓN Y HEADER ---
/**
 * Configura la barra de navegación superior.
 * Verifica si hay una sesión activa para mostrar el perfil, o muestra los botones de login.
 * También controla el envío del formulario de inicio de sesión modal.
 */
function configurarAuth() {
    const navActions = document.querySelector('.nav-actions');
    const sesion = JSON.parse(localStorage.getItem('unisierra_sesion'));

    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get('id') || ""; 
    const linkResena = prodId ? `escribir_resena.html?id=${prodId}` : `index.html`;

    if (navActions) {
        if (sesion) {
            navActions.innerHTML = `
                <a href="${linkResena}" class="btn-text" id="navEscribirResena">Escribir Reseña</a>
                <a href="perfil.html" class="btn-solid"><i class="fas fa-user-circle"></i> Mi Perfil</a>
                <button id="btnLogout" class="btn-outline" style="border-color: #d93025; color: #d93025; padding: 6px 12px; margin-left: 10px;">Salir</button>
            `;
            document.getElementById('btnLogout').addEventListener('click', () => {
                localStorage.removeItem('unisierra_sesion');
                window.location.href = 'index.html';
            });

            if (!prodId && document.getElementById('navEscribirResena')) {
                document.getElementById('navEscribirResena').addEventListener('click', (e) => {
                    e.preventDefault();
                    alert("Busca y selecciona un producto primero para poder escribirle una reseña.");
                });
            }
        } else {
            navActions.innerHTML = `
                <button class="btn-text" onclick="alert('Debes iniciar sesión para escribir una reseña.')" style="background:none; border:none; font-size:1rem; cursor:pointer;">Escribir Reseña</button>
                <button class="btn-outline auth-btn" data-type="login" style="background:none; font-size:1rem; cursor:pointer;">Iniciar Sesión</button>
                <button class="btn-solid auth-btn" data-type="register" style="font-size:1rem; cursor:pointer;">Registrarse</button>
            `;
        }
    }

    const modal = document.getElementById('authModal');
    if (!modal) return; 
    const authBtns = document.querySelectorAll('.auth-btn');
    const closeBtn = document.getElementById('closeAuthModal');
    const authForm = document.getElementById('authForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.querySelector('#authForm button[type="submit"]');

    authBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const isLogin = e.target.dataset.type === 'login';
            modalTitle.textContent = isLogin ? "Iniciar Sesión" : "Crear Cuenta";
            submitBtn.textContent = isLogin ? "Entrar" : "Registrarme";
            modal.style.display = 'flex';
        });
    });
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    // Procesa el inicio de sesión y redirige basado en el ID de Rol
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Capturamos lo que el usuario escribió en el modal
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;

        // 2. Buscamos al usuario en la Base de Datos (localStorage)
        const listaUsuarios = JSON.parse(localStorage.getItem('unisierra_usuarios')) || [];
        const usuarioEncontrado = listaUsuarios.find(u => u.correo_institucional === email && u.password === password);

        if (usuarioEncontrado) {
            // Si el correo y contraseña coinciden, guardamos la sesión
            localStorage.setItem('unisierra_sesion', JSON.stringify(usuarioEncontrado));
            modal.style.display = 'none';
            
            // 3. REDIRECCIÓN BASADA EN ROLES
            if (usuarioEncontrado.id_rol === 1) {
                alert("¡Bienvenido al Panel de Administración!");
                window.location.href = '../admin/panel_admin.html';
                
            } else {
                alert("¡Bienvenido a UniSierra Eats!");
                window.location.reload(); 
            }
        } else {
            // Si se equivoca, le avisamos
            alert("Correo o contraseña incorrectos. Verifica tus datos.");
        }
    });
}

/**
 * Habilita la barra de búsqueda del encabezado para redirigir a busqueda.html
 */
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

// --- 3. LÓGICA POR PÁGINAS (RUTAS) ---

/**
 * Renderiza la página de Inicio (index.html).
 * Obtiene los 3 productos mejor evaluados y asigna eventos a las tarjetas de categorías.
 */
function renderizarInicio() {
    const contenedorTop = document.querySelector('.product-grid');
    if (contenedorTop) {
        const productos = obtenerProductos();
        const todasLasResenas = JSON.parse(localStorage.getItem('unisierra_resenas')) || [];
        
        contenedorTop.innerHTML = ""; 
        
        // Ordenamos por calificación para mostrar el "Top 3"
        const topProductos = [...productos].sort((a, b) => b.calificacion - a.calificacion).slice(0, 3);
        
        topProductos.forEach(producto => {
            // Buscamos la última reseña real de este producto
            const resenasDelProducto = todasLasResenas.filter(r => r.id_producto === producto.id_producto);
            const ultimaResena = resenasDelProducto.length > 0 
                ? resenasDelProducto[resenasDelProducto.length - 1].comentario_text 
                : "Aún no hay reseñas. ¡Sé el primero en opinar!";

            contenedorTop.innerHTML += `
                <article class="product-card">
                    <div class="card-image" style="background-image: url('${producto.imagen}'); cursor: pointer;" 
                         onclick="window.location.href='detalle_producto.html?id=${producto.id_producto}'">
                    </div>
                    <div class="card-content">
                        <h3 class="product-title" style="cursor: pointer;" 
                            onclick="window.location.href='detalle_producto.html?id=${producto.id_producto}'">
                            ${producto.nombre}
                        </h3>
                        <div class="rating">
                            <span class="rating-stars" style="color:var(--primary-orange); margin-right: 5px;">
                                ${generarEstrellas(producto.calificacion)}
                            </span>
                            <span class="review-count">${producto.calificacion.toFixed(1)} (${producto.numResenas})</span>
                        </div>
                        <p class="review-snippet">"${ultimaResena}"</p>
                    </div>
                </article>
            `;
        });
    }

    const categorias = document.querySelectorAll('.category-card');
    categorias.forEach(card => {
        card.addEventListener('click', () => {
            const nombreCategoria = card.querySelector('h3').textContent;
            window.location.href = `busqueda.html?categoria=${encodeURIComponent(nombreCategoria)}`;
        });
    });
}

/**
 * Renderiza la página de Búsqueda (busqueda.html).
 * Aplica filtros dinámicos por URL (texto/categoría) y por los elementos del DOM (checkboxes y precios).
 */
function renderizarBusqueda() {
    const contenedorResultados = document.querySelector('.results-list');
    const tituloResultados = document.querySelector('.results-header h2');
    if (!contenedorResultados || !tituloResultados) return;

    const priceBtns = document.querySelectorAll('.btn-price');
    const allCheckboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
    const sortSelect = document.getElementById('sort');
    const productosBase = obtenerProductos();
    const urlParams = new URLSearchParams(window.location.search);
    const queryUrl = urlParams.get('q');
    const categoriaUrl = urlParams.get('categoria'); 

    if (queryUrl || categoriaUrl) {
        allCheckboxes.forEach(cb => cb.checked = false); 
        if (categoriaUrl) {
            allCheckboxes.forEach(cb => {
                const label = cb.parentElement.textContent.trim();
                if (label.toLowerCase() === categoriaUrl.toLowerCase()) cb.checked = true;
            });
        }
    }

    const aplicarFiltros = () => {
        let filtrados = [...productosBase];

        if (queryUrl) {
            filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(queryUrl.toLowerCase()));
            tituloResultados.textContent = `Resultados para "${queryUrl}"`;
            document.querySelector('.search-bar input').value = queryUrl;
        } else if (categoriaUrl) {
            tituloResultados.textContent = `Categoría: ${categoriaUrl}`;
        } else {
            tituloResultados.textContent = `Todos los productos`;
        }

        const botonPrecioActivo = document.querySelector('.btn-price.active');
        if (botonPrecioActivo) {
            const nivelPrecio = botonPrecioActivo.textContent.trim();
            filtrados = filtrados.filter(p => p.precioNivel === nivelPrecio);
        }

        let filtrosSeleccionados = Array.from(allCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.parentElement.textContent.trim()); 

        if (categoriaUrl && filtrosSeleccionados.length === 0) {
            filtrosSeleccionados.push(categoriaUrl);
        }

        if (filtrosSeleccionados.length > 0) {
            filtrados = filtrados.filter(p => {
                return filtrosSeleccionados.some(filtro => 
                    p.categoria.toLowerCase() === filtro.toLowerCase() || 
                    p.etiquetas.some(e => e.toLowerCase() === filtro.toLowerCase())
                );
            });
        }

        if (sortSelect) {
            const criterio = sortSelect.value;
            if (criterio === 'rating') {
                filtrados.sort((a, b) => b.calificacion - a.calificacion);
            } else if (criterio === 'reviews') {
                filtrados.sort((a, b) => b.numResenas - a.numResenas); 
            }
        }

        contenedorResultados.innerHTML = ""; 
        if (filtrados.length === 0) {
            contenedorResultados.innerHTML = `<p style="padding: 20px;">No se encontraron productos con estos filtros.</p>`;
        } else {
            filtrados.forEach((producto, index) => {
                contenedorResultados.innerHTML += `
                    <article class="result-card">
                        <div class="result-image" style="background-image: url('${producto.imagen}'); cursor: pointer;" onclick="window.location.href='detalle_producto.html?id=${producto.id_producto}'"></div>
                        <div class="result-details">
                            <div class="result-title-row">
                                <h3 onclick="window.location.href='detalle_producto.html?id=${producto.id_producto}'">${index + 1}. ${producto.nombre}</h3>
                            </div>
                            <div class="rating">
                                <span class="rating-stars" style="color:var(--primary-orange); margin-right: 5px;">
                                    ${generarEstrellas(producto.calificacion)}
                                </span>
                                <span class="review-count">${producto.calificacion.toFixed(1)} (${producto.numResenas} reseñas)</span>
                            </div>
                            <div class="result-tags">
                                <span class="tag-price">${producto.precioNivel}</span>
                                <span class="tag-category">${producto.categoria}</span>
                            </div>
                            <p class="review-snippet">"${producto.snippet}" <a href="detalle_producto.html?id=${producto.id_producto}" class="read-more">leer más</a></p>
                        </div>
                    </article>
                `;
            });
        }
    };

    priceBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.classList.contains('active')) {
                e.target.classList.remove('active'); 
            } else {
                priceBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active'); 
            }
            aplicarFiltros();
        });
    });

    allCheckboxes.forEach(cb => cb.addEventListener('change', aplicarFiltros));
    if (sortSelect) sortSelect.addEventListener('change', aplicarFiltros);
    priceBtns.forEach(b => b.classList.remove('active')); 
    aplicarFiltros();
}

/**
 * Renderiza la página del Menú (menu.html).
 * Agrupa todos los productos almacenados según su categoría y genera listas HTML.
 */
function renderizarMenu() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return; // Solo se ejecuta si estamos en menu.html

    const productos = obtenerProductos();
    menuGrid.innerHTML = ""; // Limpiamos el HTML estático

    // Obtenemos una lista única de todas las categorías disponibles en la BD
    const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];

    categoriasUnicas.forEach(categoria => {
        // Filtramos los productos que pertenecen a esta categoría
        const prodsCategoria = productos.filter(p => p.categoria === categoria);
        
        let listaHtml = "";
        prodsCategoria.forEach(p => {
            // Verificamos si el producto está agotado para cambiar el estilo
            const isAgotado = p.etiquetas.includes("Agotado") || p.etiquetas.includes("agotado");
            const priceStyle = isAgotado ? "text-decoration: line-through; color: var(--text-muted);" : "color: var(--primary-green); font-weight: bold;";
            const agotadoBadge = isAgotado ? `<span style="color: #d93025; font-size: 0.8rem; margin-left: 10px; font-weight: bold;">(Agotado)</span>` : '';

            listaHtml += `
                <li style="display: flex; justify-content: space-between; align-items: flex-start; padding: 15px 0; border-bottom: 1px dashed var(--border-color);">
                    <div class="menu-item-info" style="flex-grow: 1; padding-right: 20px;">
                        <a href="detalle_producto.html?id=${p.id_producto}" style="text-decoration: none;">
                            <span class="item-name" style="color: var(--text-main); font-size: 1.1rem; font-weight: bold; transition: color 0.2s;">
                                ${p.nombre} ${agotadoBadge}
                            </span>
                        </a>
                        <p class="item-desc" style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">${p.descripcion}</p>
                    </div>
                    <span class="item-price" style="${priceStyle}; font-size: 1.1rem; white-space: nowrap;">$${parseFloat(p.precio_actual).toFixed(2)}</span>
                </li>
            `;
        });

        // Agregamos el bloque de la categoría al Grid del Menú
        menuGrid.innerHTML += `
            <section class="menu-category" style="margin-bottom: 40px;">
                <h2 class="category-title" style="font-size: 1.8rem; color: var(--primary-orange); margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">${categoria}</h2>
                <ul class="menu-list" style="list-style: none; padding: 0;">
                    ${listaHtml}
                </ul>
            </section>
        `;
    });
}

/**
 * Renderiza la ficha técnica de un producto (detalle_producto.html).
 * Extrae el ID de la URL, dibuja las estadísticas visuales (barras de porcentaje) y carga las reseñas históricas.
 */
function renderizarDetalleProducto() {
    const headerTitulos = document.querySelector('.header-titles h1');
    if (!headerTitulos) return;

    const urlParams = new URLSearchParams(window.location.search);
    let productId = parseInt(urlParams.get('id')) || 1;
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id_producto === productId);

    if (producto) {
        document.title = `${producto.nombre} - UniSierra Eats`;
        headerTitulos.textContent = producto.nombre;

        const descElement = document.querySelector('.about-section p');
        if(descElement) descElement.textContent = producto.descripcion;

        const breadcrumbsSpan = document.querySelector('.breadcrumbs span');
        if(breadcrumbsSpan) breadcrumbsSpan.textContent = producto.nombre;

        const galleryMain = document.querySelector('.gallery-main');
        if(galleryMain) galleryMain.style.backgroundImage = `url('${producto.imagen}')`;
        
        const statsRow = document.querySelector('.quick-stats');
        if(statsRow) {
            statsRow.innerHTML = `
                <span class="rating-stars" style="color:var(--primary-orange)">
                    ${generarEstrellas(producto.calificacion)}
                </span>
                <a href="#reviews" class="review-link">${producto.calificacion.toFixed(1)} (${producto.numResenas} reseñas)</a>
                <span class="dot-separator">•</span>
                <span>${producto.precioNivel}</span>
                <span class="dot-separator">•</span>
                <span>${producto.categoria}</span>
            `;
        }

        const reviewsSummary = document.querySelector('.reviews-summary');
        if(reviewsSummary) {
            let p5 = 0, p4 = 0, p3 = 0, p2 = 0, p1 = 0;
            if (producto.calificacion >= 4.5) { p5 = 80; p4 = 15; p3 = 5; }
            else if (producto.calificacion >= 4.0) { p5 = 40; p4 = 40; p3 = 15; p2 = 5; }
            else if (producto.calificacion >= 3.0) { p5 = 10; p4 = 20; p3 = 50; p2 = 15; p1 = 5; }
            else { p5 = 5; p4 = 10; p3 = 20; p2 = 30; p1 = 35; }

            let textCalif = "Excelente";
            if(producto.calificacion < 4.5) textCalif = "Muy Bueno";
            if(producto.calificacion < 4.0) textCalif = "Bueno";
            if(producto.calificacion < 3.0) textCalif = "Regular";

            reviewsSummary.innerHTML = `
                <div class="score-big">
                    <span class="number">${producto.calificacion.toFixed(1)}</span>
                    <span class="text">${textCalif}</span>
                    <span class="rating-stars" style="color:var(--primary-orange)">
                        ${generarEstrellas(producto.calificacion)}
                    </span>
                    <span class="total-count">${producto.numResenas} reseñas</span>
                </div>
                <div class="rating-bars">
                    <div class="bar-row"><span class="bar-label">Excelente</span><div class="bar-track"><div class="bar-fill" style="width: ${p5}%;"></div></div><span class="bar-count">${Math.floor(producto.numResenas * p5/100)}</span></div>
                    <div class="bar-row"><span class="bar-label">Muy Bueno</span><div class="bar-track"><div class="bar-fill" style="width: ${p4}%;"></div></div><span class="bar-count">${Math.floor(producto.numResenas * p4/100)}</span></div>
                    <div class="bar-row"><span class="bar-label">Regular</span><div class="bar-track"><div class="bar-fill" style="width: ${p3}%;"></div></div><span class="bar-count">${Math.floor(producto.numResenas * p3/100)}</span></div>
                    <div class="bar-row"><span class="bar-label">Malo</span><div class="bar-track"><div class="bar-fill" style="width: ${p2}%;"></div></div><span class="bar-count">${Math.floor(producto.numResenas * p2/100)}</span></div>
                    <div class="bar-row"><span class="bar-label">Terrible</span><div class="bar-track"><div class="bar-fill" style="width: ${p1}%;"></div></div><span class="bar-count">${Math.floor(producto.numResenas * p1/100)}</span></div>
                </div>
            `;
        }

        const btnEscribirResena = document.querySelector('.reviews-header-flex .btn-solid');
        if(btnEscribirResena) {
            btnEscribirResena.onclick = () => {
                if (localStorage.getItem('unisierra_sesion')) {
                    window.location.href = `escribir_resena.html?id=${producto.id_producto}`;
                } else {
                    alert('Por favor, inicia sesión para escribir una reseña.');
                }
            };
        }

        const resenasContenedor = document.querySelector('.reviews-list');
        if (resenasContenedor) {
            resenasContenedor.innerHTML = ""; 
            const resenasCompletas = obtenerResenasCompletas(producto.id_producto);

            if (resenasCompletas.length === 0) {
                resenasContenedor.innerHTML = `<p style="color: var(--text-muted); margin-top: 15px;">Aún no hay reseñas para este producto. ¡Sé el primero en opinar!</p>`;
            } else {
                resenasCompletas.reverse().forEach(r => {
                    resenasContenedor.innerHTML += `
                        <article class="single-review">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar"><i class="fas fa-user-circle"></i></div>
                                <div>
                                    <h4 class="reviewer-name">${r.nombre_usuario}</h4>
                                    <span class="review-date">Escrita el ${r.fecha}</span>
                                </div>
                            </div>
                            <div class="rating-stars small-stars" style="color:var(--primary-orange)">
                                ${generarEstrellas(r.puntuacion)}
                            </div>
                            <p class="review-body">${r.comentario}</p>
                        </article>
                    `;
                });
            }
        }
    }
}

/**
 * Maneja la interacción en la página de Configuración (configuracion.html).
 * Controla el cambio de pestañas (Perfil/Contraseña) y guarda las actualizaciones en localStorage.
 */
function manejarConfiguracion() {
    const sesion = JSON.parse(localStorage.getItem('unisierra_sesion'));
    if (!sesion) return;

    // 1. Manejo de pestañas (Tabs)
    const tabProfile = document.getElementById('tab-profile');
    const tabPassword = document.getElementById('tab-password');
    const sectionProfile = document.getElementById('section-profile');
    const sectionPassword = document.getElementById('section-password');

    if (tabProfile && tabPassword) {
        tabProfile.addEventListener('click', (e) => {
            e.preventDefault();
            tabProfile.classList.add('active');
            tabPassword.classList.remove('active');
            sectionProfile.style.display = 'block';
            sectionPassword.style.display = 'none';
        });

        tabPassword.addEventListener('click', (e) => {
            e.preventDefault();
            tabPassword.classList.add('active');
            tabProfile.classList.remove('active');
            sectionPassword.style.display = 'block';
            sectionProfile.style.display = 'none';
        });
    }

    // 2. Cargar datos iniciales del perfil
    const inputNombre = document.getElementById('first-name');
    const inputApellidos = document.getElementById('last-name');
    const selectCarrera = document.getElementById('major');
    const inputEmail = document.getElementById('email');

    if (inputNombre) inputNombre.value = sesion.nombre_usuario || "";
    if (inputApellidos) inputApellidos.value = sesion.apellidos || "";
    if (inputEmail) inputEmail.value = sesion.correo_institucional;
    if (selectCarrera) selectCarrera.value = sesion.carrera || "sistemas";

    // 3. Guardar cambios del perfil
    const profileForm = sectionProfile.querySelector('form');
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usuarioActualizado = {
            ...sesion,
            nombre_usuario: inputNombre.value,
            apellidos: inputApellidos.value,
            carrera: selectCarrera.value
        };
        actualizarUsuarioEnBD(usuarioActualizado);
        alert("¡Perfil actualizado con éxito!");
    });

    // 4. Funcionalidad de Cambio de Contraseña
    const passwordForm = document.getElementById('form-change-password');
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        // Validación: Contraseña actual correcta
        if (currentPass !== sesion.password) {
            alert("La contraseña actual es incorrecta.");
            return;
        }

        // Validación: Nueva contraseña longitud mínima
        if (newPass.length < 6) {
            alert("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }

        // Validación: Confirmación coincide
        if (newPass !== confirmPass) {
            alert("La nueva contraseña y la confirmación no coinciden.");
            return;
        }

        // Actualización de datos
        const usuarioConNuevaPass = { ...sesion, password: newPass };
        actualizarUsuarioEnBD(usuarioConNuevaPass);
        
        passwordForm.reset();
        alert("¡Contraseña actualizada correctamente!");
    });
}

/**
 * Función auxiliar para actualizar los datos de un usuario de forma persistente.
 * Actualiza la sesión actual y el registro maestro en la tabla simulada de usuarios.
 * @param {Object} usuarioActualizado - El objeto de usuario con los datos modificados.
 */
function actualizarUsuarioEnBD(usuarioActualizado) {
    // Actualizar sesión activa
    localStorage.setItem('unisierra_sesion', JSON.stringify(usuarioActualizado));
    
    // Actualizar en la lista global de usuarios
    const listaUsuarios = JSON.parse(localStorage.getItem('unisierra_usuarios')) || [];
    const index = listaUsuarios.findIndex(u => u.id_usuario === usuarioActualizado.id_usuario);
    if (index !== -1) {
        listaUsuarios[index] = usuarioActualizado;
        localStorage.setItem('unisierra_usuarios', JSON.stringify(listaUsuarios));
    }
}

/**
 * Procesa la creación de una nueva reseña (escribir_resena.html).
 * Guarda la reseña, la calificación y recalcula automáticamente el promedio del producto (RNF-12).
 */
function manejarEscrituraResena() {
    const urlParams = new URLSearchParams(window.location.search);
    const prodId = parseInt(urlParams.get('id')) || 1;
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id_producto === prodId);

    if (producto) {
        const tituloSidebar = document.querySelector('.summary-details h3');
        const imagenSidebar = document.querySelector('.summary-image');
        if (tituloSidebar) tituloSidebar.textContent = producto.nombre;
        if (imagenSidebar) imagenSidebar.style.backgroundImage = `url('${producto.imagen}')`;
    }

    const estrellas = document.querySelectorAll('.star-rating-input i');
    const textoCalificacion = document.querySelector('.rating-text');
    const areaTexto = document.getElementById('review-body');
    let calificacionSeleccionada = 0;

    if (!estrellas.length) return;

    estrellas.forEach((estrella, index) => {
        estrella.style.cursor = "pointer";
        estrella.addEventListener('mouseover', () => resaltarEstrellas(index));
        estrella.addEventListener('mouseout', () => resaltarEstrellas(calificacionSeleccionada - 1));
        estrella.addEventListener('click', () => {
            calificacionSeleccionada = index + 1;
            textoCalificacion.textContent = `Calificaste con ${calificacionSeleccionada} estrellas`;
            resaltarEstrellas(index);
        });
    });

    function resaltarEstrellas(idx) {
        estrellas.forEach((s, i) => {
            if (i <= idx) {
                s.classList.replace('far', 'fas');
                s.classList.add('active');
            } else {
                s.classList.replace('fas', 'far');
                s.classList.remove('active');
            }
        });
    }

    const formReview = document.querySelector('.review-form');
    if(formReview) {
        formReview.addEventListener('submit', (e) => {
            e.preventDefault();
            if (calificacionSeleccionada === 0) return alert("Por favor, selecciona una calificación.");
            
            const comentario = areaTexto.value.trim();
            if (comentario.length < 10) return alert("La reseña es muy corta. Cuéntanos un poco más.");

            const sesion = JSON.parse(localStorage.getItem('unisierra_sesion'));
            const idUser = sesion ? sesion.id_usuario : 101;

            const nuevaResena = { id_reseña: Date.now(), id_usuario: idUser, id_producto: prodId, comentario_text: comentario, fecha_publicacion: new Date().toLocaleDateString() };
            const nuevaCalif = { id_calificacion: Date.now(), id_usuario: idUser, id_producto: prodId, puntuacion: calificacionSeleccionada };

            const resenasExistentes = JSON.parse(localStorage.getItem('unisierra_resenas')) || [];
            resenasExistentes.push(nuevaResena);
            localStorage.setItem('unisierra_resenas', JSON.stringify(resenasExistentes));

            const calificacionesExistentes = JSON.parse(localStorage.getItem('unisierra_calificaciones')) || [];
            calificacionesExistentes.push(nuevaCalif);
            localStorage.setItem('unisierra_calificaciones', JSON.stringify(calificacionesExistentes));

            const prodIndex = productos.findIndex(p => p.id_producto === prodId);
            if(prodIndex !== -1) {
                const prod = productos[prodIndex];
                const puntosTotales = prod.calificacion * prod.numResenas;
                prod.numResenas += 1;
                prod.calificacion = (puntosTotales + calificacionSeleccionada) / prod.numResenas;
                localStorage.setItem('unisierra_productos', JSON.stringify(productos));
            }

            alert("¡Gracias por tu opinión! Se ha publicado con éxito.");
            window.location.href = `detalle_producto.html?id=${prodId}`;
        });
    }
}

/**
 * Carga la información del usuario en su Panel Personal (perfil.html).
 * Muestra sus datos demográficos y la lista de reseñas que ha redactado.
 */
function manejarPerfil() {
    const nombrePerfil = document.querySelector('.profile-name');
    if (!nombrePerfil) return;

    const sesion = JSON.parse(localStorage.getItem('unisierra_sesion'));
    if(!sesion) return;

    // Mostrar Nombre y la inicial del apellido (como pide tu HTML)
    const inicialApellido = sesion.apellidos ? sesion.apellidos.charAt(0) + "." : "";
    nombrePerfil.textContent = `${sesion.nombre_usuario} ${inicialApellido}`;
    
    // Actualizar el widget de "Más sobre mí"
    const values = document.querySelectorAll('.about-value');
    if(values.length >= 3) {
        values[0].textContent = sesion.ubicacion || "No especificada";
        values[1].textContent = sesion.miembroDesde || "Reciente";
        
        // Mapeo de nombres de carrera para que se vea bien
        const nombresCarreras = {
            "sistemas": "Ing. en Sistemas Computacionales",
            "administracion": "Lic. en Administración",
            "biologia": "Lic. en Biología",
            "industrial": "Ingeniería Industrial"
        };
        values[2].textContent = nombresCarreras[sesion.carrera] || sesion.carrera;
    }

    // (Lógica de carga de reseñas del perfil se mantiene igual...)
    const resenasContenedor = document.querySelector('.reviews-list');
    const todasLasResenas = JSON.parse(localStorage.getItem('unisierra_resenas')) || [];
    const calificaciones = JSON.parse(localStorage.getItem('unisierra_calificaciones')) || [];
    const productos = obtenerProductos();

    const misResenas = todasLasResenas.filter(r => r.id_usuario === sesion.id_usuario);

    if (misResenas.length > 0 && resenasContenedor) {
        resenasContenedor.innerHTML = ""; 
        misResenas.reverse().forEach(r => {
            const prod = productos.find(p => p.id_producto === r.id_producto) || { nombre: "Producto" };
            const calif = calificaciones.find(c => c.id_usuario === sesion.id_usuario && c.id_producto === r.id_producto) || { puntuacion: 0 };

            resenasContenedor.innerHTML += `
                <article class="single-review">
                    <div class="reviewer-info">
                        <h4 class="reviewer-name">Evaluaste: ${prod.nombre}</h4>
                        <span class="review-date">${r.fecha_publicacion}</span>
                    </div>
                    <div class="rating-stars small-stars" style="color:var(--primary-orange)">
                        ${generarEstrellas(calif.puntuacion)}
                    </div>
                    <p class="review-body">${r.comentario_text}</p>
                </article>
            `;
        });
    }
}

// --- 7. INICIALIZACIÓN GLOBAL ---
document.addEventListener('DOMContentLoaded', () => {
    inicializarDatos();
    configurarAuth();
    configurarBuscadorGlobal();

    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path === '') renderizarInicio();
    else if (path.includes('busqueda.html')) renderizarBusqueda();
    else if (path.includes('detalle_producto.html')) renderizarDetalleProducto();
    else if (path.includes('menu.html')) renderizarMenu();  // ¡Agregamos el menú a las rutas!
    else if (path.includes('configuracion.html')) manejarConfiguracion();
    else if (path.includes('escribir_resena.html')) manejarEscrituraResena();
    else if (path.includes('perfil.html')) manejarPerfil();
});
