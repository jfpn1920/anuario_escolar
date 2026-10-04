// Anuario Escolar: muestra fotos y nombres de estudiantes.
// Todo se guarda en localStorage para que no se pierda al recargar la página.
// Claves con las que se guarda la información en localStorage
const CLAVE = "anuario-escolar";       // lista de estudiantes
const CLAVE_NOMBRE = "anuario-nombre"; // nombre que se está escribiendo
let estudiantes = []; // lista: cada estudiante es { nombre, foto }
let fotoActual = "";  // foto elegida que todavía no se agrega
// Elementos de la página
const campoNombre = document.getElementById("nombre");
const campoFoto = document.getElementById("foto");
const vista = document.getElementById("vista");
const mensaje = document.getElementById("mensaje");
const campoBuscar = document.getElementById("buscar");
const contador = document.getElementById("contador");
const vacio = document.getElementById("vacio");
const lista = document.getElementById("lista");
const plantilla = document.getElementById("plantilla");
// Guarda la lista en localStorage; devuelve false si no hay espacio
function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estudiantes)); return true; }
    catch (error) { mensaje.textContent = "No se pudo guardar: el espacio está lleno."; return false; }
}
// Recupera lo guardado al abrir o refrescar la página
function cargar() {
    const texto = localStorage.getItem(CLAVE);
    if (texto) estudiantes = JSON.parse(texto);
    campoNombre.value = localStorage.getItem(CLAVE_NOMBRE) || ""; // nombre a medio escribir
    mostrar();
}
// Dibuja las tarjetas según la lista y lo que se busca
function mostrar() {
    const buscado = campoBuscar.value.toLowerCase();
    lista.innerHTML = "";
    estudiantes.forEach(function (estudiante, posicion) {
        // Si el nombre no contiene lo buscado, no se dibuja
        if (!estudiante.nombre.toLowerCase().includes(buscado)) return;
        // Copia la plantilla y le pone la foto y el nombre
        const tarjeta = plantilla.content.cloneNode(true);
        tarjeta.querySelector("img").src = estudiante.foto;
        tarjeta.querySelector("img").alt = "Foto de " + estudiante.nombre;
        tarjeta.querySelector("h3").textContent = estudiante.nombre;
        // El botón Quitar borra a este estudiante
        tarjeta.querySelector("button").onclick = function () { quitar(posicion); };
        lista.appendChild(tarjeta);
    });
    contador.textContent = "Total: " + estudiantes.length;
    vacio.hidden = estudiantes.length > 0; // oculta el texto si ya hay estudiantes
}
// Reduce la foto a 200x200 para que quepa en localStorage
function prepararFoto(archivo) {
    const lector = new FileReader();
    lector.onload = function () {
        const imagen = new Image();
        imagen.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = 200; canvas.height = 200;
            // Recorta un cuadrado del centro de la imagen
            const lado = Math.min(imagen.width, imagen.height);
            const x = (imagen.width - lado) / 2, y = (imagen.height - lado) / 2;
            canvas.getContext("2d").drawImage(imagen, x, y, lado, lado, 0, 0, 200, 200);
            // Guarda la foto como texto y la muestra como vista previa
            fotoActual = canvas.toDataURL("image/jpeg", 0.7);
            vista.src = fotoActual; vista.hidden = false;
        };
        imagen.src = lector.result;
    };
    lector.readAsDataURL(archivo);
}
// Agrega un estudiante nuevo a la lista
function agregar() {
    const nombre = campoNombre.value.trim();
    // Revisa que estén el nombre y la foto
    if (nombre === "") { mensaje.textContent = "Escribe el nombre del estudiante."; return; }
    if (fotoActual === "") { mensaje.textContent = "Elige una fotografía."; return; }
    estudiantes.push({ nombre: nombre, foto: fotoActual });
    if (!guardar()) { estudiantes.pop(); return; } // si no se pudo guardar, se deshace
    // Limpia el formulario para el siguiente estudiante
    campoNombre.value = ""; campoFoto.value = ""; fotoActual = "";
    localStorage.removeItem(CLAVE_NOMBRE);
    vista.hidden = true; mensaje.textContent = "";
    mostrar();
}
// Quita un estudiante de la lista
function quitar(posicion) {
    estudiantes.splice(posicion, 1); guardar(); mostrar();
}
// Eventos: qué pasa cuando el usuario hace algo
campoFoto.addEventListener("change", function () { if (campoFoto.files[0]) prepararFoto(campoFoto.files[0]); });
campoNombre.addEventListener("input", function () { localStorage.setItem(CLAVE_NOMBRE, campoNombre.value); });
document.getElementById("agregar").addEventListener("click", agregar);
campoBuscar.addEventListener("input", mostrar);
document.getElementById("borrar-todo").addEventListener("click", function () {
    if (confirm("¿Seguro que quieres borrar todo el anuario?")) { estudiantes = []; guardar(); mostrar(); }
});
// Al abrir la página se carga lo guardado
cargar();