//-----------------------------------//
//--|funcionalidad_anuario_escolar|--//
//-----------------------------------//
const CLAVE = "anuario-escolar";
const CLAVE_NOMBRE = "anuario-nombre";
let estudiantes = [];
let fotoActual = "";
const campoNombre = document.getElementById("nombre");
const campoFoto = document.getElementById("foto");
const vista = document.getElementById("vista");
const mensaje = document.getElementById("mensaje");
const campoBuscar = document.getElementById("buscar");
const contador = document.getElementById("contador");
const vacio = document.getElementById("vacio");
const lista = document.getElementById("lista");
const plantilla = document.getElementById("plantilla");
//-------------------//
//--|guardar_datos|--//
//-------------------//
function guardar() {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(estudiantes));
        return true;
    } catch (error) {
        mensaje.textContent = "No se pudo guardar: el espacio está lleno.";
        return false;
    }
}
function cargar() {
    try {
        const texto = localStorage.getItem(CLAVE);
        if (texto) {
            const datos = JSON.parse(texto);
            if (Array.isArray(datos)) {
                estudiantes = datos.filter(function (estudiante) {
                    return estudiante && typeof estudiante.nombre === "string" && typeof estudiante.foto === "string";
                });
            }
        }
    } catch (error) {
        estudiantes = [];
    }
    campoNombre.value = localStorage.getItem(CLAVE_NOMBRE) || "";
    mostrar();
}
//-------------------------//
//--|mostrar_estudiantes|--//
//-------------------------//
function mostrar() {
    const buscado = campoBuscar.value.toLowerCase().trim();
    lista.innerHTML = "";
    estudiantes.forEach(function (estudiante, posicion) {
        if (!estudiante.nombre.toLowerCase().includes(buscado)) {
            return;
        }
        const tarjeta = plantilla.content.cloneNode(true);
        tarjeta.querySelector("img").src = estudiante.foto;
        tarjeta.querySelector("img").alt = "Foto de " + estudiante.nombre;
        tarjeta.querySelector("h3").textContent = estudiante.nombre;
        tarjeta.querySelector("button").onclick = function () {
            quitar(posicion);
        };
        lista.appendChild(tarjeta);
    });
    contador.textContent = "Total: " + estudiantes.length;
    vacio.hidden = lista.children.length > 0;
}
//-------------------------//
//--|preparar_fotografia|--//
//-------------------------//
function prepararFoto(archivo) {
    if (!archivo.type.startsWith("image/")) {
        mensaje.textContent = "Selecciona un archivo de imagen válido.";
        campoFoto.value = "";
        return;
    }
    const lector = new FileReader();
    lector.onload = function () {
        const imagen = new Image();
        imagen.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = 200;
            canvas.height = 200;
            const lado = Math.min(imagen.width, imagen.height);
            const x = (imagen.width - lado) / 2;
            const y = (imagen.height - lado) / 2;
            const contexto = canvas.getContext("2d");
            contexto.drawImage(imagen, x, y, lado, lado, 0, 0, 200, 200);
            fotoActual = canvas.toDataURL("image/jpeg", 0.7);
            vista.src = fotoActual;
            vista.hidden = false;
            mensaje.textContent = "";
        };
        imagen.onerror = function () {
            mensaje.textContent = "No se pudo cargar la fotografía seleccionada.";
            campoFoto.value = "";
        };
        imagen.src = lector.result;
    };
    lector.onerror = function () {
        mensaje.textContent = "No se pudo leer el archivo seleccionado.";
    };
    lector.readAsDataURL(archivo);
}
//------------------------//
//--|agregar_estudiante|--//
//------------------------//
function agregar() {
    const nombre = campoNombre.value.trim();
    if (nombre === "") {
        mensaje.textContent = "Escribe el nombre del estudiante.";
        return;
    }
    if (fotoActual === "") {
        mensaje.textContent = "Elige una fotografía.";
        return;
    }
    estudiantes.push({ nombre: nombre, foto: fotoActual });
    if (!guardar()) {
        estudiantes.pop();
        return;
    }
    campoNombre.value = "";
    campoFoto.value = "";
    fotoActual = "";
    localStorage.removeItem(CLAVE_NOMBRE);
    vista.removeAttribute("src");
    vista.hidden = true;
    mensaje.textContent = "";
    mostrar();
}
//-----------------------//
//--|quitar_estudiante|--//
//-----------------------//
function quitar(posicion) {
    const estudianteEliminado = estudiantes.splice(posicion, 1);
    if (!guardar()) {
        estudiantes.splice(posicion, 0, estudianteEliminado[0]);
        mostrar();
        return;
    }
    mostrar();
}
//----------------------------//
//--|eventos_del_formulario|--//
//----------------------------//
campoFoto.addEventListener("change", function () {
    if (campoFoto.files[0]) {
        prepararFoto(campoFoto.files[0]);
    }
});
campoNombre.addEventListener("input", function () {
    try {
        localStorage.setItem(CLAVE_NOMBRE, campoNombre.value);
    } catch (error) {
        mensaje.textContent = "No se pudo guardar el nombre temporalmente.";
    }
});
document.getElementById("agregar").addEventListener("click", agregar);
campoBuscar.addEventListener("input", mostrar);
document.getElementById("borrar-todo").addEventListener("click", function () {
    if (confirm("¿Seguro que quieres borrar todo el anuario?")) {
        const estudiantesAnteriores = estudiantes;
        estudiantes = [];
        if (!guardar()) {
            estudiantes = estudiantesAnteriores;
            mostrar();
            return;
        }
        mostrar();
    }
});
cargar();