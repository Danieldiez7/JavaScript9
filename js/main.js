class Estudiante {
    constructor(nombre, apellido, promedio, carrera) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.promedio = promedio;
        this.carrera = carrera;
    }

    consultar() {
        this.aprobado = this.promedio >= 7 ? true : false;
        return this.aprobado;
    }
}

// Array de estudiantes base (Tarjetas por defecto)
const estudiantesBase = [
    new Estudiante("Natalia", "Gonzalez", 8.5, "Ingeniería en Sistemas"),
    new Estudiante("Juan", "Perez", 7.8, "Ingeniería en Mecánica"),
    new Estudiante("María", "Rodriguez", 9.2, "Ingeniería en Electrónica"),
    new Estudiante("Carlos", "Ramirez", 5.0, "Ingeniería en Civil"),
    new Estudiante("Ana", "Lopez", 8.0, "Ingeniería en Química"),
    new Estudiante("Luis", "Martinez", 6.5, "Ingeniería en Software")
];

// 💾 PERSISTENCIA: Cargar estados iniciales aplicando TRY-CATCH
let estudiantes;
let alumnos;

try {
    // Intentamos leer y parsear los datos de LocalStorage
    const estudiantesGuardados = localStorage.getItem("estudiantes");
    estudiantes = estudiantesGuardados 
        ? JSON.parse(estudiantesGuardados).map(e => new Estudiante(e.nombre, e.apellido, e.promedio, e.carrera))
        : estudiantesBase;

    alumnos = JSON.parse(localStorage.getItem("alumnosSeleccionados")) || [];
    console.log("Datos cargados correctamente desde el Storage.");
} catch (error) {
    // Si el JSON estaba roto o el almacenamiento bloqueado, usamos los datos por defecto
    console.error("Error al cargar desde LocalStorage, se usarán datos por defecto:", error);
    estudiantes = estudiantesBase;
    alumnos = [];
} finally {
    // El bloque finally se ejecuta SIEMPRE, haya error o no. Ideal para limpiar o inicializar interfaces.
    console.log("Proceso de inicialización de datos terminado.");
}

// Nodos del DOM
const listaAlumnos = document.getElementById("lista-alumnos");
const estudianteContainer = document.getElementById('estudiante-container');
const inputBuscar = document.getElementById('inputBuscar');
const btnReset = document.getElementById('btnReset');
const form = document.getElementById("form-alumno");

// 💾 Función centralizada para actualizar Storage
function guardarEnStorage() {
    localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
    localStorage.setItem("alumnosSeleccionados", JSON.stringify(alumnos));
}

// Función para renderizar los seleccionados en la lista lateral/inferior
function renderizarAlumnos() { 
    listaAlumnos.innerHTML = ""; 
    alumnos.forEach((alumno, indice) => { 
        // 🔹 DESTRUCTURING
        const { nombre, apellido, promedio } = alumno;

        const li = document.createElement("li");
        li.innerHTML = `
            <span><strong>${nombre} ${apellido}</strong> (Promedio: ${promedio})</span>
            <button class="btn-borrar-item" title="Quitar de la selección">❌</button>
        `;

        // Evento para deseleccionar / borrar del storage
        li.querySelector(".btn-borrar-item").addEventListener("click", () => {
            alumnos.splice(indice, 1);
            guardarEnStorage();
            renderizarAlumnos();
        });

        listaAlumnos.appendChild(li);
    }); 
}

// Escuchador del formulario para añadir estudiantes a la base general
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombreInput = document.getElementById("nombre").value;
    const apellidoInput = document.getElementById("apellido").value;
    const carreraInput = document.getElementById("carrera").value;
    const promedioInput = parseFloat(document.getElementById("promedio").value);
  
    const nuevoEstudiante = new Estudiante(nombreInput, apellidoInput, promedioInput, carreraInput);
    estudiantes.push(nuevoEstudiante); 
    
    guardarEnStorage();
    mostrarEstudiantes(estudiantes); 
    form.reset();
});

// Filtro de búsqueda
const buscarConFilter = (estudiantesArray, textoBusqueda) => { 
    const termino = textoBusqueda.toLowerCase().trim();
    return estudiantesArray.filter((estudiante) => 
        estudiante.nombre.toLowerCase().includes(termino) || 
        estudiante.apellido.toLowerCase().includes(termino)
    ); 
}

// Función para renderizar dinámicamente las tarjetas de estudiantes
function mostrarEstudiantes(arrayEstudiantes) {
    estudianteContainer.innerHTML = ''; 
    
    arrayEstudiantes.forEach((estudiante, indiceOriginal) => {
        //  DESTRUCTURING
        const { nombre, apellido, carrera, promedio } = estudiante;

        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h3>${nombre} ${apellido}</h3>
            <p class="Carrera">${carrera}</p>
            <p class="Promedio">${promedio}</p>
            <button class="btn-seleccionar">Seleccionar Estudiante</button>
            <button class="btn-eliminar-base">Eliminar permanentemente</button>
            <div class="feedback-mensaje" style="margin-top: 10px; font-size: 0.9rem; font-weight: bold; text-align: center;"></div>
        `;

        const btnSeleccionar = card.querySelector(".btn-seleccionar");
        const btnEliminarBase = card.querySelector(".btn-eliminar-base");
        const feedbackMensaje = card.querySelector(".feedback-mensaje");

        // Evento: Seleccionar estudiante para la lista
        btnSeleccionar.addEventListener('click', () => {
            const estudianteAprobado = estudiante.consultar();
            
            // 🔹 OPERADOR MODERNO (Ternario)
            feedbackMensaje.textContent = estudianteAprobado ? `✅ Seleccionado con éxito` : `⚠️ Seleccionado (No aprobado)`;
            feedbackMensaje.style.color = estudianteAprobado ? "#2f855a" : "#dd6b20";
            //TEMPORIZADOR ****
            setTimeout(() => { feedbackMensaje.textContent = ""; }, 2500);

            alumnos.push({ nombre, apellido, promedio });
            guardarEnStorage();
            renderizarAlumnos();
        });

        // Evento: Eliminar de la base de datos (Tarjeta)
        btnEliminarBase.addEventListener('click', () => {
            // Buscamos el índice real del elemento en el array original 'estudiantes'
            const indiceReal = estudiantes.findIndex(e => e.nombre === nombre && e.apellido === apellido);
            if (indiceReal !== -1) {
                estudiantes.splice(indiceReal, 1);
                guardarEnStorage();
                mostrarEstudiantes(buscarConFilter(estudiantes, inputBuscar.value)); // Mantiene el filtro si estaba buscando
            }
        });

        estudianteContainer.appendChild(card);
    });
}

// Evento Reset: Limpia filtros de búsqueda y vacía la lista de seleccionados
btnReset.addEventListener("click", () => {
    inputBuscar.value = '';
    alumnos.length = 0; 
    localStorage.removeItem("alumnosSeleccionados"); 
    renderizarAlumnos();
    mostrarEstudiantes(estudiantes);
});

// Filtro en tiempo real
inputBuscar.addEventListener("input", () => {
    const estudiantesFiltrados = buscarConFilter(estudiantes, inputBuscar.value);
    mostrarEstudiantes(estudiantesFiltrados);
});

// Inicialización
mostrarEstudiantes(estudiantes);
renderizarAlumnos();