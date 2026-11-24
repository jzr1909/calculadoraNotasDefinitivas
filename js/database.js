
/*
    Proyecto: Calculadora de Notas Definitivas
    Archivo: database.js

    Responsabilidad:
    Crear y conectar la base de datos
    utilizando IndexedDB.
*/

// Nombre de nuestra base de datos
const NOMBRE_BD = "NotasDefinitivasDB";

// Versión inicial de la base de datos
const VERSION_BD = 1;


// Función para abrir la base de datos
export function conectarBD() {

    return new Promise((resolve, reject) => {

        // Comprobar si IndexedDB está disponible
        if (!window.indexedDB) {
            reject(new Error("IndexedDB no está disponible."));
            return;
        }

        // Solicitar la apertura de la base de datos
        const solicitud = indexedDB.open(
            NOMBRE_BD,
            VERSION_BD
        );

        // Se ejecuta cuando se crea la BD
        // o cuando necesita actualizar su estructura
        solicitud.onupgradeneeded = (evento) => {

            const bd = evento.target.result;

            // Almacén de usuarios
            if (!bd.objectStoreNames.contains("usuarios")) {

                bd.createObjectStore("usuarios", {
                    keyPath: "documento"
                });

            }

            // Almacén de sesiones
            if (!bd.objectStoreNames.contains("sesiones")) {

                bd.createObjectStore("sesiones", {
                    keyPath: "id"
                });

            }

            // Almacén de cálculos
            if (!bd.objectStoreNames.contains("calculos")) {

                bd.createObjectStore("calculos", {
                    keyPath: "id",
                    autoIncrement: true
                });

            }

        };

        // Se ejecuta cuando la conexión es exitosa
        solicitud.onsuccess = () => {

            const bd = solicitud.result;

            console.log("Base de datos conectada correctamente.");

            // Cerrar conexiones antiguas si se actualiza la BD
            bd.onversionchange = () => {
                bd.close();
            };

            resolve(bd);

        };

        // Se ejecuta cuando ocurre un error
        solicitud.onerror = () => {

            console.error(
                "Error al conectar con IndexedDB:",
                solicitud.error
            );

            reject(
                solicitud.error || new Error("No fue posible conectar con la base de datos.")
            );

        };

        // Se ejecuta si otra pestaña bloquea la actualización
        solicitud.onblocked = () => {

            console.error(
                "La conexión está bloqueada por otra pestaña."
            );

        };

    });

}
