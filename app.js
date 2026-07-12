// Ranchillo App Mobile-First PWA Logic

// Formato de moneda para Pesos Chilenos (CLP)
const formatoMoneda = (valor) => {
    return '$' + Number(valor).toLocaleString('es-CL');
};

// --- HAPTIC FEEDBACK (Vibración del Celular) ---
function vibrar(ms = 15) {
    if (navigator.vibrate) {
        navigator.vibrate(ms);
    }
}

// --- ESTADO DE LA APLICACIÓN ---
let productos = JSON.parse(localStorage.getItem('ranchillo_productos')) || [
    // Perros
    { id: 1, nombre: 'Master Dog Adulto 15kg', precio: 18500, stock: 10 },
    { id: 2, nombre: 'Master Dog Cachorro 15kg', precio: 21000, stock: 10 },
    { id: 3, nombre: 'Champion Dog Adulto 15kg', precio: 19990, stock: 10 },
    { id: 4, nombre: 'Pedigree Adulto Carne 15kg', precio: 22500, stock: 10 },
    { id: 5, nombre: 'Dog Chow Adulto Raza Mediana 15kg', precio: 26990, stock: 10 },
    { id: 6, nombre: 'Fit Formula Adulto 15kg', precio: 17500, stock: 10 },
    { id: 7, nombre: 'Royal Canin Maxi Adult 15kg', precio: 62900, stock: 10 },
    { id: 8, nombre: 'Pro Plan Adulto Raza Mediana 15kg', precio: 58900, stock: 10 },
    { id: 9, nombre: 'Cannes Adulto Carne 15kg', precio: 16500, stock: 10 },
    { id: 10, nombre: 'Doko Adulto Carne y Verduras 15kg', precio: 15990, stock: 10 },
    // Gatos
    { id: 11, nombre: 'Champion Cat Adulto Mariscos 8kg', precio: 12000, stock: 10 },
    { id: 12, nombre: 'Cat Chow Gatos Adultos Pescado 8kg', precio: 18990, stock: 10 },
    { id: 13, nombre: 'Whiskas Gato Adulto Carne 10kg', precio: 24990, stock: 10 },
    { id: 14, nombre: 'Gati Gato Adulto Mixto 15kg', precio: 22900, stock: 10 },
    { id: 15, nombre: 'Master Cat Carne y Leche 8kg', precio: 11500, stock: 10 },
    { id: 16, nombre: 'Purina Excellent Gato Adulto 7.5kg', precio: 29900, stock: 10 },
    { id: 17, nombre: 'Royal Canin Fit 32 Gato 7.5kg', precio: 48900, stock: 10 },
    { id: 18, nombre: 'Pro Plan Gato Adulto Optirenal 7.5kg', precio: 39900, stock: 10 },
    { id: 19, nombre: 'Felix Gato Adulto Mix Selección 8kg', precio: 19500, stock: 10 },
    { id: 20, nombre: 'Nutra Gold Gato Pro Active 3kg', precio: 14990, stock: 10 }
];

let ventas = JSON.parse(localStorage.getItem('ranchillo_ventas')) || [];

// --- REGISTRO DE SERVICE WORKER PARA CAPACIDAD OFFLINE ---
function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((reg) => {
                    console.log('Service Worker registrado con éxito:', reg.scope);
                })
                .catch((err) => {
                    console.error('Fallo al registrar el Service Worker:', err);
                });
        });
    }
}

// --- GESTIÓN DE INSTALACIÓN PWA ---
let deferredPrompt;
function configurarInstalacionPWA() {
    const installBanner = document.getElementById('installBanner');
    const installBtn = document.getElementById('installBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir que el navegador muestre el banner por defecto
        e.preventDefault();
        // Guardar el evento para poder dispararlo luego
        deferredPrompt = e;
        // Mostrar nuestro banner personalizado de instalación
        if (installBanner) {
            installBanner.style.display = 'flex';
        }
    });

    if (installBtn) {
        installBtn.addEventListener('click', () => {
            vibrar(25);
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('El usuario aceptó la instalación de Ranchillo');
                    }
                    deferredPrompt = null;
                    if (installBanner) {
                        installBanner.style.display = 'none';
                    }
                });
            }
        });
    }
}

function cerrarBannerInstalacion() {
    vibrar(10);
    const installBanner = document.getElementById('installBanner');
    if (installBanner) {
        installBanner.style.display = 'none';
    }
}

// --- NAVEGACIÓN POR PESTAÑAS (TAB NAVIGATION) ---
function cambiarTab(tabId, element) {
    vibrar(20);
    
    // Ocultar todos los contenidos de pestaña
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active-tab'));
    
    // Quitar clase activa de los botones de navegación
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active-nav'));
    
    // Mostrar la pestaña seleccionada
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active-tab');
    }
    
    // Activar botón pulsado
    if (element) {
        element.classList.add('active-nav');
    }

    // Cargar datos de reportes si se cambia a la pestaña de reportes
    if (tabId === 'tab-reportes') {
        cargarReporte();
        actualizarAlertasStock();
    }

    // Mostrar/ocultar FAB de registro de ventas según la pestaña activa (solo en Panel)
    const fab = document.getElementById('salesFAB');
    if (fab) {
        if (tabId === 'tab-dashboard') {
            fab.style.display = 'flex';
        } else {
            fab.style.display = 'none';
        }
    }

    // Scroll al inicio de la página al cambiar
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- CONTROLES DE BOTTOM SHEET (MODAL DE REGISTRO) ---
function abrirModalRegistro() {
    vibrar(25);
    document.getElementById('bottomSheetRegistro').classList.add('active');
    // Scroll lock
    document.body.style.overflow = 'hidden';
}

function cerrarModalRegistro() {
    vibrar(15);
    document.getElementById('bottomSheetRegistro').classList.remove('active');
    // Scroll release
    document.body.style.overflow = '';
}

// --- INICIALIZACIÓN DE LA APP ---
function inicializar() {
    registrarServiceWorker();
    configurarInstalacionPWA();
    actualizarSelectProductos();
    actualizarTablaVentas();
    actualizarTablaModalProductos();
    inicializarTema();
    configurarEventos();
    inicializarReportes(); // <-- Inicializa la sección de reportes e inventario
}

function configurarEventos() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Cerrar menú desplegable al hacer clic afuera
    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.dropdown-wrapper');
        const menu = document.getElementById('paletteDropdownMenu');
        if (wrapper && menu && !wrapper.contains(e.target)) {
            menu.style.display = 'none';
        }
    });
}

// --- CONTROL DEL TEMA VISUAL Y PALETA DE COLORES ---
const TEMAS_PALETA = {
    azul: {
        nombre: 'Azul Midnight',
        color: '#2563eb',
        claro: {
            '--primary-color': '#2563eb',
            '--primary-hover': '#1d4ed8',
            '--primary-light': '#eff6ff'
        },
        oscuro: {
            '--bg-primary': '#0b0f19',
            '--bg-card': '#151e30',
            '--border-color': '#1e293b',
            '--primary-color': '#3b82f6',
            '--primary-hover': '#60a5fa',
            '--primary-light': 'rgba(59, 130, 246, 0.12)'
        }
    },
    verde: {
        nombre: 'Verde Esmeralda',
        color: '#16a34a',
        claro: {
            '--primary-color': '#16a34a',
            '--primary-hover': '#15803d',
            '--primary-light': '#f0fdf4'
        },
        oscuro: {
            '--bg-primary': '#061a10',
            '--bg-card': '#0e2b1d',
            '--border-color': '#133d27',
            '--primary-color': '#10b981',
            '--primary-hover': '#34d399',
            '--primary-light': 'rgba(16, 185, 129, 0.12)'
        }
    },
    morado: {
        nombre: 'Violeta Profundo',
        color: '#8b5cf6',
        claro: {
            '--primary-color': '#8b5cf6',
            '--primary-hover': '#7c3aed',
            '--primary-light': '#f5f3ff'
        },
        oscuro: {
            '--bg-primary': '#110b1a',
            '--bg-card': '#1d132b',
            '--border-color': '#27193b',
            '--primary-color': '#a78bfa',
            '--primary-hover': '#c4b5fd',
            '--primary-light': 'rgba(139, 92, 246, 0.12)'
        }
    },
    rojo: {
        nombre: 'Rojo Rubí',
        color: '#dc2626',
        claro: {
            '--primary-color': '#dc2626',
            '--primary-hover': '#b91c1c',
            '--primary-light': '#fef2f2'
        },
        oscuro: {
            '--bg-primary': '#1a0b0b',
            '--bg-card': '#2d1414',
            '--border-color': '#3f1c1c',
            '--primary-color': '#f87171',
            '--primary-hover': '#fca5a5',
            '--primary-light': 'rgba(220, 38, 38, 0.12)'
        }
    },
    naranja: {
        nombre: 'Naranja Sunset',
        color: '#ea580c',
        claro: {
            '--primary-color': '#ea580c',
            '--primary-hover': '#c2410c',
            '--primary-light': '#fff7ed'
        },
        oscuro: {
            '--bg-primary': '#1c100b',
            '--bg-card': '#2e1c14',
            '--border-color': '#3e261b',
            '--primary-color': '#fb923c',
            '--primary-hover': '#fdba74',
            '--primary-light': 'rgba(234, 88, 12, 0.12)'
        }
    }
};

function aplicarEstilosTema() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const paletteKey = localStorage.getItem('ranchillo_palette') || 'naranja';
    
    const palette = TEMAS_PALETA[paletteKey] || TEMAS_PALETA.naranja;
    const styles = theme === 'dark' ? palette.oscuro : palette.claro;
    
    // Eliminar variables del DOM inline previas
    Object.keys(TEMAS_PALETA.azul.claro).forEach(prop => {
        document.documentElement.style.removeProperty(prop);
    });
    Object.keys(TEMAS_PALETA.azul.oscuro).forEach(prop => {
        document.documentElement.style.removeProperty(prop);
    });
    
    // Aplicar nuevas variables de color
    Object.keys(styles).forEach(prop => {
        document.documentElement.style.setProperty(prop, styles[prop]);
    });
}

function cambiarPaleta(key) {
    vibrar(25);
    if (!TEMAS_PALETA[key]) return;
    
    localStorage.setItem('ranchillo_palette', key);
    aplicarEstilosTema();
    showToast(`Paleta activa: ${TEMAS_PALETA[key].nombre}`);
}

function setTemaManual(newTheme) {
    vibrar(25);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ranchillo_theme', newTheme);
    aplicarEstilosTema();
    actualizarIconosTema(newTheme);
    showToast(`Fondo ${newTheme === 'dark' ? 'Oscuro 🌙' : 'Claro ☀️'}`);
}

function toggleFondoPerrito() {
    vibrar(25);
    const isBgImg = document.body.classList.toggle('theme-bg-image');
    localStorage.setItem('ranchillo_bg_image', isBgImg ? 'true' : 'false');
    actualizarBotonFondo();
    showToast(isBgImg ? '🐶 Fondo de perrito activado' : 'Fondo liso activado');
}

function actualizarBotonFondo() {
    const btn = document.getElementById('btnFondoPerrito');
    if (!btn) return;
    const isBgImg = document.body.classList.contains('theme-bg-image');
    if (isBgImg) {
        btn.style.borderColor = 'var(--primary-color)';
        btn.style.backgroundColor = 'var(--primary-light)';
        btn.style.color = 'var(--primary-color)';
    } else {
        btn.style.borderColor = 'var(--border-color)';
        btn.style.backgroundColor = 'var(--bg-primary)';
        btn.style.color = 'var(--text-primary)';
    }
}

function togglePaletteDropdown() {
    vibrar(15);
    const menu = document.getElementById('paletteDropdownMenu');
    if (!menu) return;
    const isShowing = menu.style.display === 'block';
    menu.style.display = isShowing ? 'none' : 'block';
}

function inicializarTema() {
    const savedTheme = localStorage.getItem('ranchillo_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    aplicarEstilosTema();
    actualizarIconosTema(savedTheme);

    // Inicializar Fondo de Perrito
    const savedBgImg = localStorage.getItem('ranchillo_bg_image') === 'true';
    if (savedBgImg) {
        document.body.classList.add('theme-bg-image');
    }
    actualizarBotonFondo();

}



function toggleTheme() {
    vibrar(25);
    const temaActual = document.documentElement.getAttribute('data-theme');
    const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nuevoTema);
    localStorage.setItem('ranchillo_theme', nuevoTema);
    aplicarEstilosTema();
    actualizarIconosTema(nuevoTema);
    showToast(`Tema ${nuevoTema === 'dark' ? 'Oscuro 🌙' : 'Claro ☀️'}`);
}

function actualizarIconosTema(tema) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (!sunIcon || !moonIcon) return;
    if (tema === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

// --- SECCIÓN VENTAS ---
function actualizarSelectProductos() {
    const select = document.getElementById('productoSelect');
    if (!select) return;
    select.innerHTML = '';
    
    if (productos.length === 0) {
        const option = document.createElement('option');
        option.text = '⚠️ No hay productos';
        option.disabled = true;
        select.appendChild(option);
        return;
    }

    productos.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.text = `${prod.nombre} - ${formatoMoneda(prod.precio)}`;
        select.appendChild(option);
    });
}

function registrarVenta() {
    const select = document.getElementById('productoSelect');
    if (productos.length === 0) {
        vibrar(40);
        return showToast('❌ Agrega productos en catálogo primero.');
    }
    
    const productoId = parseInt(select.value);
    const cantidadInput = document.getElementById('cantidad');
    const cantidad = parseInt(cantidadInput.value);
    const metodoPago = document.querySelector('input[name="pago"]:checked').value;
    
    if (isNaN(cantidad) || cantidad <= 0) {
        vibrar(40);
        return showToast('❌ Ingresa una cantidad válida.');
    }

    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    // VALIDACIÓN DE STOCK
    if (producto.stock === undefined) producto.stock = 0;
    if (producto.stock < cantidad) {
        vibrar(40);
        return showToast(`⚠️ Stock insuficiente. Solo quedan ${producto.stock} unidades en bodega.`);
    }

    const precioFinal = producto.precio + (metodoPago === 'Débito' ? 500 : 0);
    const totalVenta = precioFinal * cantidad;

    // DESCUENTO DE STOCK
    producto.stock -= cantidad;

    // Agregar al inicio del listado de ventas
    ventas.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        fecha: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        producto: producto.nombre,
        cantidad: cantidad,
        precioUnitario: precioFinal,
        total: totalVenta,
        pago: metodoPago
    });

    guardarDatos();
    actualizarTablaVentas();
    actualizarTablaModalProductos();
    actualizarAlertasStock();
    cantidadInput.value = 1; // reset
    cerrarModalRegistro();
    showToast('✅ Venta registrada con éxito');
    vibrar(50);
}

function cambiarCantidad(diff) {
    vibrar(15);
    const input = document.getElementById('cantidad');
    let val = parseInt(input.value) || 1;
    val += diff;
    if (val < 1) val = 1;
    input.value = val;
}

function actualizarTablaVentas() {
    const tbody = document.getElementById('listaVentas');
    if (!tbody) return;
    
    const searchVal = document.getElementById('buscarVenta').value.toLowerCase();
    const filtroPago = document.getElementById('filtroPago').value;
    
    tbody.innerHTML = '';
    
    let tEfectivo = 0;
    let tTransferencia = 0;
    let tArticulos = 0;
    let mostradosCount = 0;

    ventas.forEach((venta) => {
        // Totales sobre el estado completo
        if (venta.pago === 'Efectivo') {
            tEfectivo += venta.total;
        } else {
            // Transferencia y Débito sumados
            tTransferencia += venta.total;
        }
        tArticulos += venta.cantidad;

        // Filtro
        const coincideBusqueda = venta.producto.toLowerCase().includes(searchVal);
        const coincidePago = filtroPago === 'todos' || venta.pago === filtroPago;

        if (coincideBusqueda && coincidePago) {
            mostradosCount++;
            const tr = document.createElement('tr');
            
            let badgeClass = 'badge-transferencia';
            let badgeIcon = '🏦';
            if (venta.pago === 'Efectivo') {
                badgeClass = 'badge-efectivo';
                badgeIcon = '💵';
            } else if (venta.pago === 'Débito') {
                badgeClass = 'badge-debito';
                badgeIcon = '💳';
            }

            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${venta.producto}</div>
                    <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 1px;">${venta.fecha}</div>
                </td>
                <td style="font-weight: 700;">x${venta.cantidad}</td>
                <td>
                    <span class="badge-pago ${badgeClass}">
                        <span>${badgeIcon}</span> ${venta.pago}
                    </span>
                </td>
                <td style="font-weight: 700; color: var(--text-primary);">${formatoMoneda(venta.total)}</td>
            `;
            tbody.appendChild(tr);
        }
    });

    // Mostrar/ocultar estado vacío
    const noVentasMsg = document.getElementById('noVentasMsg');
    if (mostradosCount === 0) {
        noVentasMsg.style.display = 'flex';
    } else {
        noVentasMsg.style.display = 'none';
    }

    // Actualizar Dashboard e Indicadores
    document.getElementById('totalEfectivo').innerText = formatoMoneda(tEfectivo);
    document.getElementById('totalTransferencia').innerText = formatoMoneda(tTransferencia);
    document.getElementById('totalGeneral').innerText = formatoMoneda(tEfectivo + tTransferencia);
    document.getElementById('totalArticulos').innerText = tArticulos;

    // Actualizar vista de movimientos recientes (Dashboard)
    actualizarVentasRecientes();
}

function actualizarVentasRecientes() {
    const listContainer = document.getElementById('listaVentasRecientes');
    const emptyMsg = document.getElementById('noRecentSalesMsg');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    if (ventas.length === 0) {
        emptyMsg.style.display = 'flex';
        return;
    }
    
    emptyMsg.style.display = 'none';
    
    // Mostrar solo las últimas 3 ventas
    const ultimasVentas = ventas.slice(0, 3);
    
    ultimasVentas.forEach(v => {
        const li = document.createElement('li');
        li.className = 'recent-sale-item';
        
        let badgeIcon = '🏦';
        if (v.pago === 'Efectivo') badgeIcon = '💵';
        else if (v.pago === 'Débito') badgeIcon = '💳';
        
        li.innerHTML = `
            <div class="recent-sale-details">
                <span class="recent-sale-name">${v.producto}</span>
                <span class="recent-sale-meta">${badgeIcon} ${v.pago} • Cant. ${v.cantidad} • ${v.fecha}</span>
            </div>
            <span class="recent-sale-total">${formatoMoneda(v.total)}</span>
        `;
        listContainer.appendChild(li);
    });
}

function eliminarVenta(id) {
    vibrar(20);
    if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
        ventas = ventas.filter(v => v.id !== id);
        guardarDatos();
        actualizarTablaVentas();
        showToast('🗑️ Venta eliminada');
        vibrar(30);
    }
}

function eliminarVentas() {
    vibrar(30);
    if (ventas.length === 0) return showToast('No hay ventas registradas.');
    
    if (confirm('⚠️ ¿Reiniciar el día? Se borrarán TODAS las ventas registradas.')) {
        ventas = [];
        guardarDatos();
        actualizarTablaVentas();
        showToast('🗑️ Historial de ventas vaciado.');
        vibrar(60);
    }
}

function filtrarVentas() {
    actualizarTablaVentas();
}

function enviarWhatsApp() {
    vibrar(25);
    if (ventas.length === 0) {
        return showToast('❌ No hay ventas para reportar.');
    }

    let texto = "*🐾 REPORTE DIARIO - RANCHILLO 🐾*\n";
    texto += `*Fecha:* ${new Date().toLocaleDateString('es-CL')}\n`;
    texto += `*Hora:* ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}\n\n`;
    texto += "*Detalle de ventas:*\n";
    
    let tEfectivo = 0;
    let tTransferencia = 0;
    let tDebito = 0;
    let totalBags = 0;

    const ventasCronologicas = [...ventas].reverse();

    ventasCronologicas.forEach((v, index) => {
        texto += `*${index + 1}.* ${v.producto} (x${v.cantidad}) — _${v.pago}_: *${formatoMoneda(v.total)}*\n`;
        if (v.pago === 'Efectivo') {
            tEfectivo += v.total;
        } else if (v.pago === 'Débito') {
            tDebito += v.total;
        } else {
            tTransferencia += v.total;
        }
        totalBags += v.cantidad;
    });

    texto += `\n*📊 RESUMEN:* \n`;
    texto += `📦 *Sacos/Unidades:* ${totalBags}\n`;
    texto += `💵 *Efectivo:* ${formatoMoneda(tEfectivo)}\n`;
    texto += `🏦 *Transferencia:* ${formatoMoneda(tTransferencia)}\n`;
    texto += `💳 *Débito:* ${formatoMoneda(tDebito)}\n`;
    texto += `💰 *TOTAL GENERAL: ${formatoMoneda(tEfectivo + tTransferencia + tDebito)}*`;

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

// --- SECCIÓN CATALOGO DE PRODUCTOS ---
function guardarProducto() {
    vibrar(20);
    const nombreInput = document.getElementById('nuevoProductoNombre');
    const precioInput = document.getElementById('nuevoProductoPrecio');
    const stockInput = document.getElementById('nuevoProductoStock');
    
    const nombre = nombreInput.value.trim();
    const precio = parseInt(precioInput.value);
    const stock = parseInt(stockInput.value) || 0;
    
    if (!nombre || isNaN(precio) || precio < 0 || isNaN(stock) || stock < 0) {
        vibrar(40);
        return showToast('❌ Completa todos los campos con valores válidos.');
    }

    const id = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    
    productos.push({ id, nombre, precio, stock });
    
    nombreInput.value = '';
    precioInput.value = '';
    stockInput.value = '0';
    
    guardarDatos();
    actualizarTablaModalProductos();
    actualizarSelectProductos();
    actualizarAlertasStock();
    showToast('📦 Producto agregado al catálogo');
    vibrar(30);
}

function eliminarProducto(id) {
    vibrar(20);
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    if (confirm(`¿Eliminar "${producto.nombre}" del catálogo?`)) {
        productos = productos.filter(p => p.id !== id);
        guardarDatos();
        actualizarTablaModalProductos();
        actualizarSelectProductos();
        actualizarAlertasStock();
        showToast('🗑️ Producto eliminado');
        vibrar(30);
    }
}

function ajustarStock(id) {
    vibrar(15);
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    
    const nuevoStockStr = prompt(`Ajustar stock para:\n"${prod.nombre}"\n\nIngresa la nueva cantidad en bodega:`, prod.stock === undefined ? 0 : prod.stock);
    if (nuevoStockStr === null) return;
    
    const nuevoStock = parseInt(nuevoStockStr);
    if (isNaN(nuevoStock) || nuevoStock < 0) {
        vibrar(40);
        return showToast('❌ Cantidad de stock no válida.');
    }
    
    prod.stock = nuevoStock;
    guardarDatos();
    actualizarTablaModalProductos();
    actualizarSelectProductos();
    actualizarAlertasStock();
    showToast('✅ Stock actualizado');
    vibrar(30);
}

function actualizarTablaModalProductos() {
    const tbody = document.getElementById('listaProductosModal');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-secondary); padding: 20px;">El catálogo está vacío.</td></tr>`;
        return;
    }

    productos.forEach(prod => {
        if (prod.stock === undefined) prod.stock = 0;
        
        let stockClass = 'stock-normal';
        if (prod.stock === 0) stockClass = 'stock-out';
        else if (prod.stock < 3) stockClass = 'stock-warning';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 500;">${prod.nombre}</td>
            <td style="font-weight: 700; color: var(--text-primary);">${formatoMoneda(prod.precio)}</td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                    <span class="badge-stock ${stockClass}">📦 ${prod.stock}</span>
                    <button class="btn-stock-adjust" onclick="ajustarStock(${prod.id})">✏️ Ajustar</button>
                </div>
            </td>
            <td style="text-align: center;">
                <button class="btn-delete-row" onclick="eliminarProducto(${prod.id})" title="Eliminar del catálogo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- UTILERÍAS & NOTIFICACIONES ---
function guardarDatos() {
    localStorage.setItem('ranchillo_productos', JSON.stringify(productos));
    localStorage.setItem('ranchillo_ventas', JSON.stringify(ventas));
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

const DB_PREDETERMINADA = [
    { id: 1, nombre: "Ganacan Adulto 25kg", precio: 23000, stock: 15 },
    { id: 2, nombre: "Acomer Cachorro 10kg", precio: 16000, stock: 15 },
    { id: 3, nombre: "Excellent Adulto 15kg", precio: 28000, stock: 15 },
    { id: 4, nombre: "Alfa Dog Adulto 25kg", precio: 32000, stock: 15 },
    { id: 5, nombre: "Sanson Adulto 25kg", precio: 27000, stock: 15 },
    { id: 6, nombre: "Strong Adulto 25kg", precio: 33000, stock: 15 },
    { id: 7, nombre: "Masko Adulto 25kg", precio: 25000, stock: 15 },
    { id: 8, nombre: "Fit Fórmula Raza Pequeña 10kg", precio: 20000, stock: 15 },
    { id: 9, nombre: "Nomade Adulto Raza Pequeña 10kg", precio: 19000, stock: 15 },
    { id: 10, nombre: "Excellent Cachorro 15kg", precio: 37000, stock: 15 },
    { id: 11, nombre: "Pro Plan Raza Mediana 12kg", precio: 45000, stock: 15 },
    { id: 12, nombre: "Pro Plan Adulto 12kg", precio: 44000, stock: 15 },
    { id: 13, nombre: "Nomade Senior Raza Pequeña 9kg", precio: 20000, stock: 15 },
    { id: 14, nombre: "Fit Senior Raza Pequeña 10kg", precio: 23000, stock: 15 },
    { id: 15, nombre: "Cachupín Adulto 9kg", precio: 15000, stock: 15 },
    { id: 16, nombre: "Nomade Senior 15kg", precio: 30000, stock: 15 },
    { id: 17, nombre: "Sabrokan Cachorro 8kg", precio: 13000, stock: 15 },
    { id: 18, nombre: "Alimento Completo para Pollita 5kg", precio: 6000, stock: 15 },
    { id: 19, nombre: "Champion Dog 3kg", precio: 8000, stock: 15 },
    { id: 20, nombre: "Alimento Completo para Conejo 5kg", precio: 5000, stock: 15 },
    { id: 21, nombre: "Dog Chow 3kg", precio: 7000, stock: 15 },
    { id: 22, nombre: "Nomade Adulto 10kg", precio: 20000, stock: 15 },
    { id: 23, nombre: "Nomade Adulto 20kg", precio: 31000, stock: 15 },
    { id: 24, nombre: "Nomade Cachorro 10kg", precio: 22000, stock: 15 },
    { id: 25, nombre: "Tito Perro Adulto 25kg", precio: 18000, stock: 15 },
    { id: 26, nombre: "Economican Adulto 25kg", precio: 19000, stock: 15 },
    { id: 27, nombre: "Pedigree Senior 21kg", precio: 39000, stock: 15 },
    { id: 28, nombre: "Alfa Dog Adulto 20kg", precio: 32000, stock: 15 },
    { id: 29, nombre: "Fit Fórmula Adulto 20kg", precio: 35000, stock: 15 },
    { id: 30, nombre: "Fit Senior 20kg", precio: 42000, stock: 15 },
    { id: 31, nombre: "Fit Cachorro 10kg", precio: 20000, stock: 15 },
    { id: 32, nombre: "Cachupín Adulto 25kg", precio: 28000, stock: 15 },
    { id: 33, nombre: "Sabrokan 25kg", precio: 24500, stock: 15 },
    { id: 34, nombre: "Champion Adulto 18kg", precio: 24000, stock: 15 },
    { id: 35, nombre: "Champion Senior 18kg", precio: 24000, stock: 15 },
    { id: 36, nombre: "Champion Adulto Raza Pequeña 18kg", precio: 24000, stock: 15 },
    { id: 37, nombre: "Champion Cachorro 18kg", precio: 24000, stock: 15 },
    { id: 38, nombre: "Master Dog Cachorro 18kg", precio: 27000, stock: 15 },
    { id: 39, nombre: "XT 21 Adulto 25kg", precio: 27500, stock: 15 },
    { id: 40, nombre: "Master Dog Adulto 18kg", precio: 27000, stock: 15 },
    { id: 41, nombre: "Himalaya Adulto 18kg", precio: 27000, stock: 15 },
    { id: 42, nombre: "Himalaya Cachorro 18kg", precio: 27000, stock: 15 },
    { id: 43, nombre: "Mastín Senior 20kg", precio: 33000, stock: 15 },
    { id: 44, nombre: "Mastín Madre y Cachorro 15kg", precio: 23500, stock: 15 },
    { id: 45, nombre: "Mastín Adulto 22kg", precio: 30000, stock: 15 },
    { id: 46, nombre: "Acomer Adulto 25kg", precio: 29000, stock: 15 },
    { id: 47, nombre: "Master Dog Adulto Raza Pequeña 8kg", precio: 16000, stock: 15 },
    { id: 48, nombre: "Master Dog Senior 8kg", precio: 16000, stock: 15 },
    { id: 49, nombre: "Economicat 8kg", precio: 12000, stock: 15 },
    { id: 50, nombre: "Champion Cat 20kg", precio: 38000, stock: 15 },
    { id: 51, nombre: "Molidog 20kg", precio: 11500, stock: 15 },
    { id: 52, nombre: "Happy Dog 20kg", precio: 13000, stock: 15 },
    { id: 53, nombre: "Harinilla de Arroz 25kg", precio: 8000, stock: 15 },
    { id: 54, nombre: "Harinilla Trigo 25kg", precio: 8000, stock: 15 },
    { id: 55, nombre: "Harinilla de Trigo 25kg", precio: 7000, stock: 15 },
    { id: 56, nombre: "Harina Molino Longaví 25kg", precio: 16000, stock: 15 },
    { id: 57, nombre: "Conejo Mantención 25kg", precio: 15000, stock: 15 },
    { id: 58, nombre: "Cerdo Crianza 25kg", precio: 16000, stock: 15 },
    { id: 59, nombre: "Performance Training 25kg", precio: 18000, stock: 15 },
    { id: 60, nombre: "Performance Sweet Feed 25kg", precio: 18000, stock: 15 },
    { id: 61, nombre: "Concentrado 20kg", precio: 8000, stock: 15 },
    { id: 62, nombre: "Ponedora Inicial 25kg", precio: 16000, stock: 15 },
    { id: 63, nombre: "Ponedora Final 25kg", precio: 15000, stock: 15 },
    { id: 64, nombre: "Recría 25kg", precio: 17000, stock: 15 },
    { id: 65, nombre: "Maíz 25kg", precio: 8000, stock: 15 },
    { id: 66, nombre: "Chancao 20kg", precio: 7000, stock: 15 },
    { id: 67, nombre: "Afrechillo 25kg", precio: 7000, stock: 15 },
    { id: 68, nombre: "Sobre Champion Dog", precio: 600, stock: 15 },
    { id: 69, nombre: "Casa para Mascota", precio: 10000, stock: 15 },
    { id: 70, nombre: "Confort Suan 20 Metros", precio: 9000, stock: 15 },
    { id: 71, nombre: "Confort Elite 50 Metros", precio: 18000, stock: 15 },
    { id: 72, nombre: "Confort Elite 20 Metros", precio: 10000, stock: 15 },
    { id: 73, nombre: "Detergente", precio: 3000, stock: 15 },
    { id: 74, nombre: "Cloro", precio: 2000, stock: 15 },
    { id: 75, nombre: "Plato Pet Bowl", precio: 4000, stock: 15 },
    { id: 76, nombre: "Plato Plástico Doble", precio: 2500, stock: 15 },
    { id: 77, nombre: "Plato Plástico", precio: 2000, stock: 15 },
    { id: 78, nombre: "Bloqueador Juguete Perro", precio: 2000, stock: 15 },
    { id: 79, nombre: "Botella con Pelota Juguete", precio: 3000, stock: 15 },
    { id: 80, nombre: "Hueso Juguete", precio: 2000, stock: 15 },
    { id: 81, nombre: "Plástico con Cordel Juguete Perro", precio: 2000, stock: 15 },
    { id: 82, nombre: "Hueso Juguete Goma", precio: 2500, stock: 15 },
    { id: 83, nombre: "Pino de Bolos Juguete Perro", precio: 2000, stock: 15 },
    { id: 84, nombre: "Comida Plástica Juguete", precio: 2500, stock: 15 },
    { id: 85, nombre: "3 Pelotas Rosadas", precio: 3000, stock: 15 },
    { id: 86, nombre: "3 Pelotas Naranjas", precio: 3000, stock: 15 },
    { id: 87, nombre: "Ropa Chica Talla 1-3", precio: 2500, stock: 15 },
    { id: 88, nombre: "Ropa Grande Talla 4-6", precio: 3500, stock: 15 },
    { id: 89, nombre: "Juguete Rosquilla Perro", precio: 2000, stock: 15 },
    { id: 90, nombre: "Pelota con Dientes Juguete", precio: 2000, stock: 15 },
    { id: 91, nombre: "Pelotas Deportivas Juguete", precio: 2000, stock: 15 },
    { id: 92, nombre: "Aro Masticable Juguete", precio: 2000, stock: 15 },
    { id: 93, nombre: "Pelota Sonido Juguete", precio: 2000, stock: 15 },
    { id: 94, nombre: "Collar Largo con Puntas", precio: 2500, stock: 15 },
    { id: 95, nombre: "Collar Brillante con Estrellas", precio: 2500, stock: 15 },
    { id: 96, nombre: "Collar con un Perro", precio: 2500, stock: 15 },
    { id: 97, nombre: "Collar con Cuadrados", precio: 2500, stock: 15 },
    { id: 98, nombre: "Collar con Corazones", precio: 2500, stock: 15 },
    { id: 99, nombre: "Collar Chico", precio: 2000, stock: 15 },
    { id: 100, nombre: "Collar para Nombre", precio: 2500, stock: 15 },
    { id: 101, nombre: "Collar Chico con Pañuelo", precio: 2000, stock: 15 },
    { id: 102, nombre: "Collar con Pañuelo", precio: 2500, stock: 15 },
    { id: 103, nombre: "Collar Mediano con Puntas", precio: 2500, stock: 15 },
    { id: 104, nombre: "Collar Grande con Pañuelo", precio: 3000, stock: 15 },
    { id: 105, nombre: "Collar Grande Grueso", precio: 2500, stock: 15 },
    { id: 106, nombre: "Collar Diseño de Flores Blanco/Negro", precio: 2500, stock: 15 },
    { id: 107, nombre: "Collar Diseño Perros Mirando", precio: 2000, stock: 15 },
    { id: 108, nombre: "Collar Pañuelo Diseños", precio: 2000, stock: 15 },
    { id: 109, nombre: "Collar Brillante con Corazón", precio: 2000, stock: 15 },
    { id: 110, nombre: "Collar Brillante Azul con Corazón", precio: 2000, stock: 15 },
    { id: 111, nombre: "Renovador de Goma", precio: 2000, stock: 15 },
    { id: 112, nombre: "Renovador de Goma con Tirador", precio: 3000, stock: 15 },
    { id: 113, nombre: "Desengrasante", precio: 2500, stock: 15 },
    { id: 114, nombre: "Shampoo Auto", precio: 2000, stock: 15 },
    { id: 115, nombre: "Cera Auto", precio: 2500, stock: 15 },
    { id: 116, nombre: "Silicona", precio: 2500, stock: 15 },
    { id: 117, nombre: "Desodorante Ambiental", precio: 2500, stock: 15 },
    { id: 118, nombre: "Renovador de Goma 5 Litros", precio: 6000, stock: 15 },
    { id: 119, nombre: "Escoba", precio: 7000, stock: 15 },
    { id: 120, nombre: "Cama Chica", precio: 7500, stock: 15 },
    { id: 121, nombre: "Cama Grande", precio: 10000, stock: 15 },
    { id: 122, nombre: "Manga Arroz 10kg", precio: 7000, stock: 15 }
];

function cargarBaseDatosPredeterminada() {
    vibrar(30);
    if (confirm('⚠️ Esta acción reemplazará tu catálogo actual por la base de datos predeterminada de 122 productos (con stock inicial de 15). ¿Deseas continuar?')) {
        productos = DB_PREDETERMINADA.map(p => ({ ...p }));
        guardarDatos();
        actualizarTablaModalProductos();
        actualizarSelectProductos();
        actualizarAlertasStock();
        showToast('📥 Base de datos cargada');
        vibrar(50);
    }
}

// --- SECCIÓN REPORTES ---
let reportePeriodoActual = 'diario';

function inicializarReportes() {
    const hoyStr = new Date().toISOString().split('T')[0];
    const reporteFecha = document.getElementById('reporteFecha');
    if (reporteFecha) {
        reporteFecha.value = hoyStr;
    }
    
    llenarSelectoresMesAnio();
    cargarReporte();
    actualizarAlertasStock();
}

function llenarSelectoresMesAnio() {
    const selectMes = document.getElementById('reporteMes');
    const selectAnio = document.getElementById('reporteAnio');
    if (!selectMes || !selectAnio) return;
    
    selectMes.innerHTML = '';
    selectAnio.innerHTML = '';
    
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const mesActual = new Date().getMonth();
    meses.forEach((mes, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.text = mes;
        if (idx === mesActual) opt.selected = true;
        selectMes.appendChild(opt);
    });
    
    const anioActual = new Date().getFullYear();
    for (let a = anioActual; a >= anioActual - 3; a--) {
        const opt = document.createElement('option');
        opt.value = a;
        opt.text = a;
        if (a === anioActual) opt.selected = true;
        selectAnio.appendChild(opt);
    }
}

function cambiarPeriodoReporte(tipo) {
    vibrar(20);
    reportePeriodoActual = tipo;
    
    document.getElementById('btnPeriodoDiario').classList.remove('active-period');
    document.getElementById('btnPeriodoMensual').classList.remove('active-period');
    document.getElementById('btnPeriodoAnual').classList.remove('active-period');
    
    document.getElementById('group-selector-fecha').style.display = 'none';
    document.getElementById('group-selector-mes').style.display = 'none';
    document.getElementById('group-selector-anio').style.display = 'none';
    
    if (tipo === 'diario') {
        document.getElementById('btnPeriodoDiario').classList.add('active-period');
        document.getElementById('group-selector-fecha').style.display = 'flex';
    } else if (tipo === 'mensual') {
        document.getElementById('btnPeriodoMensual').classList.add('active-period');
        document.getElementById('group-selector-mes').style.display = 'flex';
        document.getElementById('group-selector-anio').style.display = 'flex';
    } else if (tipo === 'anual') {
        document.getElementById('btnPeriodoAnual').classList.add('active-period');
        document.getElementById('group-selector-anio').style.display = 'flex';
    }
    
    cargarReporte();
}

function cargarReporte() {
    let filtradas = [];
    let titulo = '';
    
    const fechaInputVal = document.getElementById('reporteFecha').value;
    const mesSelectVal = parseInt(document.getElementById('reporteMes').value);
    const anioSelectVal = parseInt(document.getElementById('reporteAnio').value);
    
    if (reportePeriodoActual === 'diario') {
        if (!fechaInputVal) return;
        const [anio, mes, dia] = fechaInputVal.split('-').map(Number);
        const fObj = new Date(anio, mes - 1, dia);
        titulo = 'Reporte del Día: ' + fObj.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        filtradas = ventas.filter(v => {
            const vFecha = new Date(v.timestamp || v.id);
            return vFecha.getFullYear() === anio && vFecha.getMonth() === (mes - 1) && vFecha.getDate() === dia;
        });
    } else if (reportePeriodoActual === 'mensual') {
        const mesesNombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        titulo = `Reporte Mensual: ${mesesNombres[mesSelectVal]} ${anioSelectVal}`;
        
        filtradas = ventas.filter(v => {
            const vFecha = new Date(v.timestamp || v.id);
            return vFecha.getFullYear() === anioSelectVal && vFecha.getMonth() === mesSelectVal;
        });
    } else if (reportePeriodoActual === 'anual') {
        titulo = `Reporte Anual: ${anioSelectVal}`;
        
        filtradas = ventas.filter(v => {
            const vFecha = new Date(v.timestamp || v.id);
            return vFecha.getFullYear() === anioSelectVal;
        });
    }
    
    document.getElementById('tituloReporte').innerText = titulo;
    
    let tGeneral = 0;
    let tEfectivo = 0;
    let tTransferencia = 0;
    let tArticulos = 0;
    
    filtradas.forEach(v => {
        tGeneral += v.total;
        if (v.pago === 'Efectivo') tEfectivo += v.total;
        else tTransferencia += v.total;
        tArticulos += v.cantidad;
    });
    
    document.getElementById('repTotalGeneral').innerText = formatoMoneda(tGeneral);
    document.getElementById('repTotalEfectivo').innerText = formatoMoneda(tEfectivo);
    document.getElementById('repTotalTransferencia').innerText = formatoMoneda(tTransferencia);
    document.getElementById('repTotalArticulos').innerText = tArticulos;
    
    window.ventasFiltradasReporte = filtradas;
    window.tituloReporteActual = titulo;
}

function compartirReporte() {
    vibrar(25);
    if (productos.length === 0) {
        return showToast('❌ No hay productos en el catálogo.');
    }
    
    let texto = `*🐾 REPORTE DE INVENTARIO (BODEGA) - RANCHILLO 🐾*\n`;
    texto += `*Fecha:* ${new Date().toLocaleDateString('es-CL')}\n`;
    texto += `*Hora:* ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}\n\n`;
    
    texto += "*Detalle de Stock en Bodega:*\n";
    
    let totalValorBodega = 0;
    let itemsAgotados = [];
    let itemsBajos = [];
    
    productos.forEach((p, index) => {
        const stock = p.stock === undefined ? 0 : p.stock;
        const valorItem = p.precio * stock;
        totalValorBodega += valorItem;
        
        let statusIcon = '📦';
        if (stock === 0) {
            statusIcon = '🔴';
            itemsAgotados.push(p.nombre);
        } else if (stock < 3) {
            statusIcon = '🟡';
            itemsBajos.push(p.nombre);
        }
        
        texto += `*${index + 1}.* ${p.nombre}\n`;
        texto += `   • Stock: ${statusIcon} *${stock} unids.*\n`;
        texto += `   • Valor estimado: *${formatoMoneda(valorItem)}* _(${formatoMoneda(p.precio)} c/u)_\n`;
    });
    
    texto += `\n*📊 RESUMEN DE BODEGA:* \n`;
    texto += `💰 *Valor Total en Inventario: ${formatoMoneda(totalValorBodega)}*\n`;
    texto += `📦 *Productos Registrados:* ${productos.length}\n`;
    
    if (itemsAgotados.length > 0 || itemsBajos.length > 0) {
        texto += `\n*⚠️ ALERTAS CRÍTICAS:*\n`;
        if (itemsAgotados.length > 0) {
            texto += `🚨 *AGOTADOS (Stock 0):*\n`;
            itemsAgotados.forEach(name => {
                texto += `   • _${name}_\n`;
            });
        }
        if (itemsBajos.length > 0) {
            texto += `⚠️ *STOCK BAJO (Menos de 3):*\n`;
            itemsBajos.forEach(name => {
                texto += `   • _${name}_\n`;
            });
        }
    }
    
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

function actualizarAlertasStock() {
    const list = document.getElementById('listaAlertasStock');
    const emptyMsg = document.getElementById('noStockAlertsMsg');
    const repValorBodega = document.getElementById('repValorBodega');
    const repStockCritico = document.getElementById('repStockCritico');
    
    if (!list) return;
    
    list.innerHTML = '';
    
    let totalValorBodega = 0;
    let stockCriticoCount = 0;
    
    productos.forEach(p => {
        const stock = p.stock === undefined ? 0 : p.stock;
        totalValorBodega += p.precio * stock;
        
        if (stock < 3) {
            stockCriticoCount++;
            const li = document.createElement('li');
            li.className = 'stock-alert-item';
            
            const badgeClass = stock === 0 ? 'stock-out' : 'stock-warning';
            const badgeText = stock === 0 ? '⚠️ AGOTADO' : `📦 Quedan ${stock}`;
            
            li.innerHTML = `
                <span class="stock-alert-name">${p.nombre}</span>
                <span class="badge-stock ${badgeClass}">${badgeText}</span>
            `;
            list.appendChild(li);
        }
    });
    
    if (repValorBodega) repValorBodega.innerText = formatoMoneda(totalValorBodega);
    if (repStockCritico) repStockCritico.innerText = stockCriticoCount;
    
    if (stockCriticoCount === 0) {
        emptyMsg.style.display = 'flex';
    } else {
        emptyMsg.style.display = 'none';
    }
}

// --- ASIGNACIONES DE CONTEXTO GLOBAL PARA ELEMENTOS HTML ---
window.cambiarTab = cambiarTab;
window.abrirModalRegistro = abrirModalRegistro;
window.cerrarModalRegistro = cerrarModalRegistro;
window.registrarVenta = registrarVenta;
window.eliminarVentas = eliminarVentas;
window.eliminarVenta = eliminarVenta;
window.enviarWhatsApp = enviarWhatsApp;
window.guardarProducto = guardarProducto;
window.eliminarProducto = eliminarProducto;
window.cambiarCantidad = cambiarCantidad;
window.filtrarVentas = filtrarVentas;
window.cerrarBannerInstalacion = cerrarBannerInstalacion;
window.cargarBaseDatosPredeterminada = cargarBaseDatosPredeterminada;
window.ajustarStock = ajustarStock;
window.cambiarPeriodoReporte = cambiarPeriodoReporte;
window.cargarReporte = cargarReporte;
window.compartirReporte = compartirReporte;
window.cambiarPaleta = cambiarPaleta;
window.setTemaManual = setTemaManual;
window.toggleFondoPerrito = toggleFondoPerrito;
window.togglePaletteDropdown = togglePaletteDropdown;

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', inicializar);
