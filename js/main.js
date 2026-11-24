
/*
    Proyecto: Calculadora de Notas Definitivas
    Archivo: main.js

    Responsabilidad:
    Iniciar la aplicación, conectar IndexedDB
    y controlar el acceso del estudiante.
*/

import { conectarBD } from "./database.js";

import {
    iniciarSesion,
    recuperarSesion
} from "./auth.js";

import {
    configurarCalculos,
    cargarHistorial
} from "./calculos.js";

import { configurarNotas } from "./notas.js";


// Elementos del HTML
const formulario = document.getElementById("formulario-acceso");

const campoDocumento = document.getElementById("documento");

const mensaje = document.getElementById("mensaje-acceso");

const pantallaAcceso = document.getElementById("pantalla-acceso");

const panelNotas = document.getElementById("panel-notas");


// Mostrar el panel del estudiante
function mostrarPanel(estudiante) {

    pantallaAcceso.hidden = true;

    panelNotas.hidden = false;

    mensaje.textContent = "";

    document.getElementById("documento-estudiante").textContent =
        estudiante.documento;

    console.log("Estudiante activo:", estudiante.documento);

}


// Mostrar un mensaje de error
function mostrarError(texto) {

    mensaje.textContent = texto;

}


// Iniciar la aplicación
async function iniciarAplicacion() {

    try {

        // Conectar con IndexedDB
        const bd = await conectarBD();

        console.log("Base de datos conectada.");

        // Activar la configuración de notas
        configurarNotas();
        configurarCalculos(bd); 

        // Recuperar sesión anterior
        const estudiante = await recuperarSesion(bd);

        if (estudiante) {

          mostrarPanel(estudiante);

          await cargarHistorial(bd, estudiante.documento);

        }

        // Escuchar el formulario de acceso
        formulario.addEventListener("submit", async (evento) => {

            evento.preventDefault();

            const documento = campoDocumento.value.trim();

            // Validar documento vacío
            if (documento === "") {

                mostrarError("El documento es obligatorio.");

                return;

            }

            // Validar que solamente tenga números
            if (!/^\d+$/.test(documento)) {

                mostrarError(
                    "El documento debe contener solamente números."
                );

                return;

            }

            try {

                const estudiante = await iniciarSesion(
                    bd,
                    documento
                );

                mostrarPanel(estudiante);
                await cargarHistorial(bd, estudiante.documento);

            } catch (error) {

                mostrarError(
                    "No fue posible iniciar la sesión. Intenta nuevamente."
                );

                console.error(error);

            }

        });

    } catch (error) {

        mostrarError(
            "No fue posible conectar con la base de datos. Verifica que tu navegador sea compatible."
        );

        console.error(error);

    }

}


// Ejecutar aplicación
iniciarAplicacion();
