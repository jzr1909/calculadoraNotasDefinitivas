
/*
    Proyecto: Calculadora de Notas Definitivas
    Archivo: notas.js

    Responsabilidad:
    Generar los campos de las evaluaciones,
    validar la cantidad y sumar porcentajes.
*/


// Lista de evaluaciones en memoria
let evaluaciones = [];


// Generar las evaluaciones
export function configurarNotas() {

    // Obtener elementos del HTML
    const formulario = document.getElementById("formulario-notas");

    const campoCantidad = document.getElementById("cantidad-notas");

    const contenedor = document.getElementById("contenedor-notas");

    const alertas = document.getElementById("alertas-notas");

    const acumulado = document.getElementById("porcentaje-acumulado");


    // Escuchar el formulario
    formulario.addEventListener("submit", (evento) => {

        evento.preventDefault();

        // Obtener cantidad
        const cantidadTexto = campoCantidad.value.trim();

        const cantidad = Number(cantidadTexto);


        // Validar cantidad
        if (
            cantidadTexto === "" ||
            !Number.isInteger(cantidad) ||
            cantidad < 1 ||
            cantidad > 20
        ) {

            alertas.textContent =
                "Ingresa un número entero entre 1 y 20.";

            return;

        }


        // Si la cantidad es igual, conservar los datos
        if (cantidad === evaluaciones.length) {

            alertas.textContent = "";

            return;

        }


        // Limpiar evaluaciones anteriores
        evaluaciones = [];

        contenedor.innerHTML = "";

        alertas.textContent = "";

        acumulado.textContent =
            "Porcentaje acumulado: 0%";


        // Crear nuevas evaluaciones
        for (let i = 1; i <= cantidad; i++) {

            // Crear objeto de evaluación
            const evaluacion = {
                indice: i,
                nota: "",
                porcentaje: ""
            };

            evaluaciones.push(evaluacion);


            // Crear contenedor de la fila
            const fila = document.createElement("div");

            fila.classList.add("fila-evaluacion");


            // Crear título
            const titulo = document.createElement("h4");

            titulo.textContent = `Evaluación ${i}`;


            // Crear campo de nota
            const etiquetaNota = document.createElement("label");

            etiquetaNota.textContent = "Nota (0.0 - 5.0)";

            const campoNota = document.createElement("input");

            campoNota.type = "number";

            campoNota.min = "0";

            campoNota.max = "5";

            campoNota.step = "any";

            campoNota.placeholder = "Ejemplo: 4.5";


            // Crear campo de porcentaje
            const etiquetaPorcentaje = document.createElement("label");

            etiquetaPorcentaje.textContent = "Porcentaje (0 - 100)";

            const campoPorcentaje = document.createElement("input");

            campoPorcentaje.type = "number";

            campoPorcentaje.min = "0";

            campoPorcentaje.max = "100";

            campoPorcentaje.step = "any";

            campoPorcentaje.placeholder = "Ejemplo: 30";


            // Guardar los cambios de la nota
            campoNota.addEventListener("input", () => {

                evaluacion.nota =
                    campoNota.value === ""
                        ? ""
                        : Number(campoNota.value);

            });


            // Guardar los cambios del porcentaje
            campoPorcentaje.addEventListener("input", () => {

                evaluacion.porcentaje =
                    campoPorcentaje.value === ""
                        ? ""
                        : Number(campoPorcentaje.value);

                actualizarAcumulado();

            });


            // Agregar elementos a la fila
            fila.appendChild(titulo);

            fila.appendChild(etiquetaNota);

            fila.appendChild(campoNota);

            fila.appendChild(etiquetaPorcentaje);

            fila.appendChild(campoPorcentaje);


            // Agregar fila al contenedor principal
            contenedor.appendChild(fila);

        }

    });


    // Actualizar porcentaje acumulado
    function actualizarAcumulado() {

        let total = 0;

        evaluaciones.forEach((evaluacion) => {

            if (evaluacion.porcentaje !== "") {

                total += evaluacion.porcentaje;

            }

        });

        acumulado.textContent =
            `Porcentaje acumulado: ${total}%`;

    }

    

}
export function obtenerEvaluaciones() {
    return evaluaciones;
}
