// ===== Datos base =====
const productos = [
  { id: 1, nombre: "Zapatillas de entrenamiento", precio: 45000, emoji: "👟" },
  { id: 2, nombre: "Remera deportiva", precio: 12000, emoji: "👕" },
  { id: 3, nombre: "Botella térmica", precio: 8500, emoji: "🧴" },
  { id: 4, nombre: "Mochila urbana", precio: 28000, emoji: "🎒" },
  { id: 5, nombre: "Auriculares", precio: 19000, emoji: "🎧" },
  { id: 6, nombre: "Gorra", precio: 6500, emoji: "🧢" },
];

const STORAGE_KEY = "carrito";

// ===== Referencias al DOM =====
const listaProductos = document.getElementById("lista-productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalEl = document.getElementById("total");
const mensajeEl = document.getElementById("mensaje");
const btnVaciar = document.getElementById("btn-vaciar");

// ===== Storage =====
// JSON.parse(null) devuelve null, así que ?? usa [] la primera vez
const cargarCarrito = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const guardarCarrito = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
};

let carrito = cargarCarrito();

// ===== Utilidades =====
const formatearPrecio = (valor) =>
  valor.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const mostrarMensaje = (texto, tipo = "ok") => {
  mensajeEl.textContent = texto;
  mensajeEl.className = `mensaje mensaje-${tipo}`;
};

// ===== Render =====
const renderProductos = () => {
  listaProductos.innerHTML = productos
    .map((producto) => {
      const { id, nombre, precio, emoji } = producto; // destructuring
      return `
        <article class="tarjeta">
          <span class="emoji" aria-hidden="true">${emoji}</span>
          <h3>${nombre}</h3>
          <p class="precio">${formatearPrecio(precio)}</p>
          <button class="btn btn-agregar" data-id="${id}" type="button">Agregar</button>
        </article>`;
    })
    .join("");
};

const renderCarrito = () => {
  listaCarrito.innerHTML = carrito.length
    ? carrito
        .map(({ id, nombre, precio, cantidad, emoji }) => `
          <div class="item">
            <span class="item-nombre">${emoji ?? "🛒"} ${nombre}</span>
            <div class="item-cantidad">
              <button class="btn btn-mini" data-accion="restar" data-id="${id}" type="button" aria-label="Restar uno">−</button>
              <span>${cantidad}</span>
              <button class="btn btn-mini" data-accion="sumar" data-id="${id}" type="button" aria-label="Sumar uno">+</button>
            </div>
            <span class="item-subtotal">${formatearPrecio(precio * cantidad)}</span>
            <button class="btn btn-peligro" data-accion="eliminar" data-id="${id}" type="button">Eliminar</button>
          </div>`)
        .join("")
    : `<p class="vacio">Tu carrito está vacío.</p>`;

  const total = carrito.reduce((acc, { precio, cantidad }) => acc + precio * cantidad, 0);
  totalEl.textContent = formatearPrecio(total);
  btnVaciar.disabled = carrito.length === 0;
};

// Flujo de sincronización: array -> localStorage -> vista
const sincronizar = () => {
  guardarCarrito();
  renderCarrito();
};

// ===== Acciones =====
const agregarAlCarrito = (id) => {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  const existente = carrito.find((item) => item.id === id);
  existente
    ? existente.cantidad++
    : carrito.push({ ...producto, cantidad: 1 });

  mostrarMensaje(`Agregaste "${producto.nombre}" al carrito.`);
  sincronizar();
};

const cambiarCantidad = (id, delta) => {
  const item = carrito.find((i) => i.id === id);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    eliminarDelCarrito(id);
    return;
  }
  sincronizar();
};

const eliminarDelCarrito = (id) => {
  const { nombre } = carrito.find((i) => i.id === id) ?? { nombre: "El producto" };
  carrito = carrito.filter((item) => item.id !== id);
  mostrarMensaje(`${nombre} se eliminó del carrito.`, "aviso");
  sincronizar();
};

const vaciarCarrito = () => {
  carrito = [];
  localStorage.removeItem(STORAGE_KEY);
  mostrarMensaje("Vaciaste el carrito.", "aviso");
  renderCarrito();
};

// ===== Eventos =====
listaProductos.addEventListener("click", ({ target }) => {
  const id = Number(target.dataset?.id);
  if (target.classList.contains("btn-agregar")) agregarAlCarrito(id);
});

listaCarrito.addEventListener("click", ({ target }) => {
  const { accion, id } = target.dataset ?? {};
  if (!accion) return;

  const idNum = Number(id);
  accion === "eliminar" && eliminarDelCarrito(idNum);
  accion === "sumar" && cambiarCantidad(idNum, 1);
  accion === "restar" && cambiarCantidad(idNum, -1);
});

btnVaciar.addEventListener("click", vaciarCarrito);

// ===== Inicio =====
renderProductos();
renderCarrito();
