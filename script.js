(() => {


/* ==================================
    SUPABASE
================================== */

const supabase_url = "https://yhtpqkszpfibsesbrefl.supabase.co";
const supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodHBxa3N6cGZpYnNlc2JyZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5OTM3NjQsImV4cCI6MjEwNTU2OTc2NH0.t6O_xtQvuHKQ3ey73CFjELX7rymg27SELzcT07bnZd8";

const supabase = window.supabase.createClient(
    supabase_url,
    supabase_anon_key
);


/* ==================================
   ELEMENTOS
================================== */

let productos = [];

// Referencias a elementos existentes en el HTML. Guardarlas en
// constantes permite actualizar la interfaz desde JavaScript sin
// buscar nuevamente cada elemento en el DOM.
const catalog = document.getElementById("catalog");
const modal = document.getElementById("productModal");
const galleryImage = document.getElementById("galleryImage");
const galleryCounter = document.getElementById("galleryCounter");
const colorOptions = document.getElementById("colorOptions");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalDescription = document.getElementById("modalDescription");
const productVideo = document.getElementById("productVideo");
const videoSource = document.getElementById("videoSource");
const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

// Numero que recibe las consultas. WhatsApp requiere codigo de pais,
// sin el signo +, espacios ni guiones.
const WHATSAPP_SELLER = "5493571621503";

/* ==================================
   VARIABLE DE GALERÍA
================================== */

// Estado temporal de la vista: producto abierto, imagen seleccionada
// e indices de imagenes que actualmente se pueden recorrer.
let productoActual = null;
let imagenActual = 0;
let imagenesVisibles = [];

// El carrito se recupera al  la pagina desde localStorage.
// Si no existe una compra anterior, se inicia con un array vacio.
// localStorage pertenece a este navegador y a este dominio; no es una
// base de datos del servidor.
let carrito = JSON.parse(
    localStorage.getItem("rush-carrito") || "[]"
);

/* ==================================
   CREAR TARJETAS
================================== */

// Se recorre el catalogo y se crea una tarjeta HTML por cada producto.
// La tarjeta usa la primera imagen como portada y muestra nombre,
// precio y cantidad de colores disponibles.
function crearTarjeta(producto) {
    const card = document.createElement("article");
    card.classList.add("product-card");
    const imagenPrincipal = producto.imagenes[0] || "";

    card.innerHTML = `
        <div class="card-image-container">
            <img
                src="${imagenPrincipal}"
                alt="${producto.nombre}"
                class="product-image">
            <div class="view-product">
                VER PRODUCTO →
            </div>
            ${producto.colores.length > 1 ? `
                <div class="card-colors">
                    ${producto.colores.length} COLORES
                </div>
            ` : ""}
        </div>
        <div class="product-info">
            <h3>
                ${producto.nombre}
            </h3>
            <p>
                ${producto.precio}
            </p>
        </div>
    `;

    // Toda la tarjeta funciona como boton: al hacer clic se abre el
    // modal con la informacion completa del producto.
    card.addEventListener(
        "click",
        () => openProduct(producto)
    );

    catalog.appendChild(card);
}
async function cargarProductos() {
    catalog.innerHTML = "<p>Cargando productos...</p>";

    const { data, error } = await supabase
        .from("products")
        .select(`
            product_id,
            name,
            description,
            price,
            products_images (
                product_id,
                url,
                gallery_position
            ),
            products_videos (
                product_id,
                url
            )
        `)
        .order("product_id");

    if (error) {
        catalog.innerHTML = `<p>❌ ERROR: ${error.message}</p>`;
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        catalog.innerHTML = "<p>No hay productos.</p>";
        return;
    }

    console.log("PRODUCTOS RECIBIDOS:", data);

    productos = data.map(producto => ({
        id: producto.product_id,
        nombre: producto.name,
        precio: `$${Number(producto.price).toLocaleString("es-AR")}`,
        descripcion: producto.description || "",

        imagenes: (producto.products_images || [])
            .sort((a, b) => a.gallery_position - b.gallery_position)
            .map(imagen => imagen.url),

        colores: [],
        video: Array.isArray(producto.products_videos)
            ? producto.products_videos[0]?.url || ""
            : producto.products_videos?.url || ""
    }));

    catalog.innerHTML = "";

    productos.forEach(crearTarjeta);
}

cargarProductos();




/* ==================================
   ABRIR PRODUCTO
================================== */

// Carga un producto en el modal y prepara su galeria, colores y video.
function openProduct(producto) {
    productoActual = producto;
    imagenActual = 0;
    imagenesVisibles = producto.imagenes.map(
        (_, index) => index
    );

    modalTitle.textContent = producto.nombre;
    modalPrice.textContent = producto.precio;
    modalDescription.textContent = producto.descripcion;
    renderColorOptions();

    productVideo.src = producto.video;
    videoSource.src = producto.video;
    productVideo.load();

    // Algunos navegadores bloquean el autoplay; catch evita que ese
    // bloqueo genere un error visible en la consola.
    productVideo.play().catch(() => {});

    updateGallery();
    modal.classList.add("active");
    document.body.classList.add("modal-open");
}

/* ==================================
   ACTUALIZAR GALERÍA
================================== */

// Genera los botones de color del producto abierto. Los colores con el
// mismo codigo se muestran una sola vez para evitar opciones repetidas.
function renderColorOptions() {
    colorOptions.innerHTML = "";
    colorOptions.hidden = productoActual.colores.length < 2;

    const coloresUnicos = productoActual.colores.filter(
        (color, index, colores) =>
            colores.findIndex(
                otroColor => otroColor.codigo.toLowerCase() === color.codigo.toLowerCase()
            ) === index
    );

    coloresUnicos.forEach((color, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "color-option";
        button.title = color.nombre;
        button.setAttribute("aria-label", color.nombre);
        button.style.backgroundColor = color.codigo;

        // Cada color reemplaza las imagenes visibles por las que le
        // corresponden y vuelve a empezar la galeria desde la primera.
        button.addEventListener("click", () => {
            imagenesVisibles = color.imagenes ?? [index];
            imagenActual = 0;
            updateGallery();
        });

        colorOptions.appendChild(button);
    });
}

// Sincroniza la imagen grande, el contador y el estado visual del color
// seleccionado con los indices guardados en el estado de la galeria.
function updateGallery() {
    galleryImage.src =
        productoActual.imagenes[imagenesVisibles[imagenActual]];

    galleryCounter.textContent =
        `${imagenActual + 1} / ${imagenesVisibles.length}`;

    const coloresUnicos = productoActual.colores.filter(
        (color, index, colores) =>
            colores.findIndex(
                otroColor => otroColor.codigo.toLowerCase() === color.codigo.toLowerCase()
            ) === index
    );

    colorOptions.querySelectorAll(".color-option").forEach((button, index) => {
        const color = coloresUnicos[index];
        const imagenesColor = color?.imagenes ?? [index];
        button.classList.toggle(
            "active",
            imagenesColor.includes(imagenesVisibles[imagenActual])
        );
    });
}

/* ==================================
   SIGUIENTE IMAGEN
================================== */

// Avanza una imagen. Cuando llega al final, vuelve circularmente al
// principio para que la navegacion nunca quede sin imagen.
function nextImage() {
    imagenActual++;

    if (imagenActual >= imagenesVisibles.length) {
        imagenActual = 0;
    }

    updateGallery();
}

/* ==================================
   IMAGEN ANTERIOR
================================== */

// Retrocede una imagen. Si estaba en la primera, salta a la ultima.
function previousImage() {
    imagenActual--;

    if (imagenActual < 0) {
        imagenActual = imagenesVisibles.length - 1;
    }

    updateGallery();
}

/* ==================================
   BOTONES GALERÍA
================================== */

document
    .getElementById("nextButton")
    .addEventListener(
        "click",
        nextImage
    );

document
    .getElementById("previousButton")
    .addEventListener(
        "click",
        previousImage
    );

/* ==================================
   CERRAR MODAL
================================== */

// Cierra el modal y detiene el video para que no siga reproduciendose
// en segundo plano mientras el usuario navega por el catalogo.
function closeProduct() {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
    productVideo.pause();
}

document
    .getElementById("closeButton")
    .addEventListener(
        "click",
        closeProduct
    );

/* ==================================
   CERRAR HACIENDO CLICK AFUERA
================================== */

modal.addEventListener(
    "click",
    function(event) {
        if (event.target === modal) {
            closeProduct();
        }
    }
);

/* ==================================
   TECLA ESC
================================== */

document.addEventListener(
    "keydown",
    function(event) {
        if (event.key === "Escape") {
            closeProduct();
        }
    }
);

/* ==================================
   FLECHAS DEL TECLADO
================================== */

document.addEventListener(
    "keydown",
    function(event) {
        if (!modal.classList.contains("active")) return;

        if (event.key === "ArrowRight") {
            nextImage();
        }

        if (event.key === "ArrowLeft") {
            previousImage();
        }
    }
);

/* ==================================
   CARRITO
================================== */

// Agrega el producto abierto al carrito. El carrito identifica cada
// producto por su id: si ya existe, aumenta su cantidad; si no, crea
// un nuevo item con los datos necesarios para mostrarlo y calcularlo.
function addToCart() {
    if (!productoActual) return;

    const itemExistente = carrito.find(
        item => item.id === productoActual.id
    );

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({
            id: productoActual.id,
            nombre: productoActual.nombre,
            precio: productoActual.precio,
            cantidad: 1
        });
    }

    // Se persiste antes de cerrar el modal para conservar el cambio
    // incluso si el usuario recarga o cierra el navegador.
    guardarCarrito();
    renderCart();
    closeProduct();
    openCart();
}

window.addToCart = addToCart;

// Convierte el array del carrito a JSON y lo guarda bajo una clave fija.
// JSON permite almacenar arrays y objetos en localStorage, que guarda
// solamente texto.
function guardarCarrito() {
    localStorage.setItem(
        "rush-carrito",
        JSON.stringify(carrito)
    );
}

// Convierte precios como "$15.000" en 15000 para poder hacer cuentas.
function precioNumerico(precio) {
    return Number(
        precio.replace(/[^0-9]/g, "")
    );
}

// Convierte un numero calculado al formato de moneda usado en Argentina.
function formatoPrecio(valor) {
    return `$${valor.toLocaleString("es-AR")}`;
}

// Redibuja todo el contenido visible del carrito a partir del array
// actual. Asi la pantalla siempre refleja el estado real de los datos.
function renderCart() {
    const cantidadTotal = carrito.reduce(
        (total, item) => total + item.cantidad,
        0
    );

    const total = carrito.reduce(
        (subtotal, item) => subtotal + precioNumerico(item.precio) * item.cantidad,
        0
    );

    cartCount.textContent = cantidadTotal;
    cartTotal.textContent = formatoPrecio(total);
    cartEmpty.hidden = carrito.length > 0;

    cartItems.innerHTML = carrito.map(item => `
        <div class="cart-item">
            <div>
                <strong>${item.nombre}</strong>
                <span>${item.precio} × ${item.cantidad}</span>
            </div>
            <button
                class="remove-item"
                type="button"
                data-product-id="${item.id}"
                aria-label="Quitar ${item.nombre}">×</button>
        </div>
    `).join("");

    // Los botones se crean junto con el HTML anterior, por eso sus
    // eventos se conectan despues de insertar ese HTML en el DOM.
    cartItems.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", () => {
            // Al quitar un producto se genera un nuevo array sin el id
            // elegido, se guarda el cambio y se vuelve a dibujar el total.
            carrito = carrito.filter(
                item => item.id !== Number(button.dataset.productId)
            );
            guardarCarrito();
            renderCart();
        });
    });
}

// Muestra el panel lateral y la capa oscura que bloquea el fondo.
function openCart() {
    cartPanel.classList.add("active");
    document.getElementById("cartOverlay").classList.add("active");
}

// Oculta el panel y la capa de fondo del carrito.
function closeCart() {
    cartPanel.classList.remove("active");
    document.getElementById("cartOverlay").classList.remove("active");
}

// Prepara una consulta de WhatsApp con el contenido actual del carrito.
// No envia el mensaje automaticamente: abre WhatsApp y el cliente debe
// revisar y presionar enviar.
function contactByWhatsApp() {
    if (!carrito.length) {
        alert("Añade al menos una prenda al carrito.");
        return;
    }

    if (WHATSAPP_SELLER.includes("X")) {
        alert("Configura el número de WhatsApp del vendedor en la constante WHATSAPP_SELLER.");
        return;
    }

    // Se crea una linea de texto por producto con cantidad y precio.
    const lineas = carrito.map(item =>
        `- ${item.nombre} x${item.cantidad} (${item.precio} c/u)`
    );

    const mensaje = [
        "Hola! Quiero consultar por estas prendas:",
        ...lineas,
        `Total estimado: ${cartTotal.textContent}`,
        "¿Me pueden ayudar con disponibilidad, talles y entrega?"
    ].join("\n");

    // encodeURIComponent convierte saltos de linea, espacios y signos
    // en una URL valida para el parametro text de wa.me.
    window.open(
        `https://wa.me/${WHATSAPP_SELLER}?text=${encodeURIComponent(mensaje)}`,
        "_blank",
        "noopener"
    );
}

// Conecta los controles del HTML con sus funciones. Estos listeners
// son los que hacen interactivos el enlace del carrito, sus cierres y
// el boton que inicia la consulta por WhatsApp.
document
    .getElementById("cartLink")
    .addEventListener("click", event => {
        event.preventDefault();
        openCart();
    });

document
    .getElementById("cartClose")
    .addEventListener("click", closeCart);

document
    .getElementById("cartOverlay")
    .addEventListener("click", closeCart);

document
    .getElementById("whatsappButton")
    .addEventListener("click", contactByWhatsApp);

// Primera renderizacion: muestra el carrito recuperado o su estado vacio
// apenas termina de cargar el script.
renderCart();

})();
