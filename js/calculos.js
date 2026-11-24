
import { obtenerEvaluaciones } from "./notas.js";

export function configurarCalculos(bd) {
    const botonCalcular = document.getElementById("btn-calcular");

    botonCalcular.addEventListener("click", async () => {
        const evaluaciones = obtenerEvaluaciones();

        const mensaje = document.getElementById("mensaje-calculo");
        const resultado = document.getElementById("nota-definitiva");
        const estado = document.getElementById("estado-definitiva");

        mensaje.textContent = "";
        resultado.textContent = "";
        estado.textContent = "";

        if (evaluaciones.length === 0) {
            mensaje.textContent = "Primero debes generar las notas.";
            return;
        }

        let sumaPorcentajes = 0;
        let definitiva = 0;

        for (const evaluacion of evaluaciones) {
            if (
                evaluacion.nota === "" ||
                evaluacion.porcentaje === ""
            ) {
                mensaje.textContent = "Debes completar todas las notas y porcentajes.";
                return;
            }

            if (evaluacion.nota < 0 || evaluacion.nota > 5) {
                mensaje.textContent = "Las notas deben estar entre 0 y 5.";
                return;
            }

            if (
                evaluacion.porcentaje < 0 ||
                evaluacion.porcentaje > 100
            ) {
                mensaje.textContent = "Los porcentajes deben estar entre 0 y 100.";
                return;
            }

            sumaPorcentajes += evaluacion.porcentaje;

            definitiva +=
                evaluacion.nota * (evaluacion.porcentaje / 100);
        }

        if (Math.abs(sumaPorcentajes - 100) > 0.000000001) {
            mensaje.textContent = "La suma de los porcentajes debe ser exactamente 100%.";
            return;
        }

        const documento = document.getElementById(
            "documento-estudiante"
        ).textContent;

        const estadoFinal = definitiva >= 3 ? "Aprobado" : "Reprobado";

        const calculo = {
            documento: documento,
            notas: evaluaciones.map(evaluacion => ({
                nota: evaluacion.nota,
                porcentaje: evaluacion.porcentaje
            })),
            definitiva: definitiva,
            estado: estadoFinal,
            fechaHora: new Date().toISOString()
        };

        try {
            await guardarCalculo(bd, calculo);

            resultado.textContent = `Nota definitiva: ${definitiva.toFixed(2)}`;
            estado.textContent = `Estado: ${estadoFinal}`;
            mensaje.textContent = "El cálculo se guardó correctamente.";

            await cargarHistorial(bd, documento);

        } catch (error) {
            console.error("Error al guardar el cálculo:", error);
            mensaje.textContent = "No fue posible guardar el cálculo. Inténtalo nuevamente.";
        }
    });
}

function guardarCalculo(bd, calculo) {
    return new Promise((resolve, reject) => {
        const transaccion = bd.transaction("calculos", "readwrite");
        const almacen = transaccion.objectStore("calculos");

        almacen.add(calculo);

        transaccion.oncomplete = () => resolve();

        transaccion.onerror = () => {
            reject(transaccion.error);
        };

        transaccion.onabort = () => {
            reject(transaccion.error || new Error("No se pudo guardar el cálculo."));
        };
    });
}

export function cargarHistorial(bd, documento) {
    return new Promise((resolve, reject) => {
        const transaccion = bd.transaction("calculos", "readonly");
        const almacen = transaccion.objectStore("calculos");

        const solicitud = almacen.getAll();

        solicitud.onsuccess = () => {
            const historial = solicitud.result
                .filter(calculo => calculo.documento === documento)
                .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

            mostrarHistorial(historial);
            resolve(historial);
        };

        solicitud.onerror = () => {
            reject(solicitud.error);
        };
    });
}

function mostrarHistorial(historial) {
    const contenedor = document.getElementById("lista-historial");
    const mensaje = document.getElementById("mensaje-historial");

    contenedor.innerHTML = "";

    if (historial.length === 0) {
        mensaje.textContent = "Todavía no tienes cálculos guardados.";
        return;
    }

    mensaje.textContent = "";

    historial.forEach((calculo, indice) => {
        const elemento = document.createElement("div");
        const titulo = document.createElement("h3");
        const fecha = document.createElement("p");
        const detalle = document.createElement("p");
        const definitiva = document.createElement("p");
        const estado = document.createElement("p");

        const fechaFormato = new Date(calculo.fechaHora).toLocaleString("es-CO");

        titulo.textContent = `Cálculo ${indice + 1}`;
        fecha.textContent = `Fecha: ${fechaFormato}`;

        detalle.textContent = calculo.notas
            .map((item, posicion) =>
                `Nota ${posicion + 1}: ${item.nota} (${item.porcentaje}%)`
            )
            .join(" | ");

        definitiva.textContent =
            `Nota definitiva: ${calculo.definitiva.toFixed(2)}`;

        estado.textContent = `Estado: ${calculo.estado}`;

        elemento.append(titulo, fecha, detalle, definitiva, estado);
        contenedor.appendChild(elemento);
    });
}
