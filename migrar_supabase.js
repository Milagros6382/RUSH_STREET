

/* ==================================
    PRODUCTOS
================================== */

// Fuente de datos del catalogo. Cada objeto representa un producto y
// contiene todo lo necesario para mostrarlo en la tarjeta y en el modal.
// Las posiciones del array imagenes se relacionan con las posiciones
// indicadas en colores.imagenes para filtrar la galeria por color.
const productos = [
    {
        id: 1,
        nombre: "Boxy fit",
        precio: "$15.000",
        imagenes: [
            "productos/remera-boxy/remera-boxy-blanca-frente.jpeg",
            "productos/remera-boxy/remera-boxy-blanca-diseno.jpeg",
            "productos/remera-boxy/remera-boxy-blanca-espalda.jpeg",
            "productos/remera-boxy/remera-boxy-blanca-vermont.jpeg",
            "productos/remera-boxy/remera-boxy-gris.jpeg",
            "productos/remera-boxy/remera-boxy-negra-chaotic.jpeg",
            "productos/remera-boxy/remera-boxy-negra-frente.jpeg",
            "productos/remera-boxy/remera-boxy-negra-espalda.jpeg",
            "productos/remera-boxy/remera-boxy-negra-vermont-02.jpeg",
            "productos/remera-boxy/remera-boxy-marron-vermont.jpeg",
            "productos/remera-boxy/remera-boxy-marron-frente.jpeg",
            "productos/remera-boxy/remera-boxy-marron-espalda.jpeg",
        ],
        colores: [
            { nombre: "Blanco", codigo: "#f2f2f2", imagenes: [0, 1, 2, 3] },
            { nombre: "Gris", codigo: "#858585", imagenes: [4] },
            { nombre: "Negro", codigo: "#050505", imagenes: [5, 6, 7, 8] },
            { nombre: "Marron", codigo: "#795548", imagenes: [9, 10, 11] }
        ],
        video: "productos/remera-boxy/video.mp4",
        descripcion: "Remera oversize de algodón pesado 100%. Corte boxy, hombros caídos y cuello cerrado. Una pieza pensada para combinar con pantalones baggy, cargos o denim."
    },
    {
        id: 2,
        nombre: "Remeron (OVERSIZE)",
        precio: "$15.000",
        imagenes: [
            "productos/remeron-oversize/remeron-blanco.jpeg",
            "productos/remeron-oversize/remeron-marron.jpeg",
            "productos/remeron-oversize/remeron-negro.jpeg"
        ],
        colores: [
            { nombre: "Blanco", codigo: "#f2f2f2", imagenes: [0] },
            { nombre: "Marron", codigo: "#795548", imagenes: [1] },
            { nombre: "Negro", codigo: "#050505", imagenes: [2] }
        ],
        video: "productos/remeron-oversize/video.mp4",
        descripcion: "Hoodie de corte oversize con interior frizado. Capucha amplia, mangas voluminosas y bolsillo frontal. Diseñado para un fit relajado."
    },
    {
        id: 3,
        nombre: "Campera",
        precio: "$25.000",
        imagenes: [
            "productos/campera/campera-denim-azul.webp"
        ],
        colores: [],
        video: "productos/campera/video.mp4",
        descripcion: "Campera oversize de denim con lavado vintage y hombros caídos."
    },
    {
        id: 4,
        nombre: "Buzo BOXY",
        precio: "$20.000",
        imagenes: [
            "productos/buzo-boxy/buzo-boxy-amarillo-tribal.jpeg",
            "productos/buzo-boxy/buzo-boxy-gris.jpeg",
            "productos/buzo-boxy/buzo-boxy-negro-cruz.jpeg",
            "productos/buzo-boxy/buzo-boxy-negro-tribal-01.jpeg",
            "productos/buzo-boxy/buzo-boxy-negro-tribal-02.jpeg",
            "productos/buzo-boxy/buzo-boxy-negro-tribal-03.jpeg"
        ],
        colores: [
            { nombre: "Amarillo tribal", codigo: "#d5a521", imagenes: [0] },
            { nombre: "Gris espina", codigo: "#858585", imagenes: [1] },
            { nombre: "Negro cruz", codigo: "#050505", imagenes: [2] },
            { nombre: "Negro triba simple", codigo: "#1b1b1b", imagenes: [3] },
            { nombre: "Negro tribal", codigo: "#2e2e2e", imagenes: [4] },
            { nombre: "Negro", codigo: "#000000", imagenes: [5] }
        ],
        video: "productos/buzo-boxy/video.mp4",
        descripcion: "Buzo de corte boxy, cómodo y de silueta amplia."
    },
    {
        id: 5,
        nombre: "Buzo oversize",
        precio: "$22.000",
        imagenes: [
            "productos/buzo-oversize/buzo-oversize-gris.avif"
        ],
        colores: [],
        video: "productos/buzo-oversize/video.mp4",
        descripcion: "Buzo oversize de calce relajado y volumen amplio."
    }
];
