
/*
    Proyecto: Calculadora de Notas Definitivas
    Archivo: auth.js

    Responsabilidad:
    Registrar estudiantes, iniciar sesiones
    y recuperar sesiones existentes.
*/


// Registrar o iniciar sesión
export function iniciarSesion(bd, documento) {

    return new Promise((resolve, reject) => {

        // Validar que el documento tenga solamente números
        if (!/^\d+$/.test(documento)) {
            reject(new Error("Ingresa un documento válido."));
            return;
        }

        // Crear una transacción para usuarios y sesiones
        const transaccion = bd.transaction(
            ["usuarios", "sesiones"],
            "readwrite"
        );

        const usuarios = transaccion.objectStore("usuarios");
        const sesiones = transaccion.objectStore("sesiones");

        // Buscar si el estudiante ya existe
        const consulta = usuarios.get(documento);

        consulta.onsuccess = () => {

            // Si no existe, registrarlo
            if (!consulta.result) {

                usuarios.add({
                    documento: documento
                });

            }

            // Guardar o actualizar la sesión activa
            sesiones.put({
                id: "activa",
                documento: documento
            });

        };

        // La operación terminó correctamente
        transaccion.oncomplete = () => {

            resolve({
                documento: documento
            });

        };

        // Manejar errores
        transaccion.onerror = () => {

            reject(
                transaccion.error ||
                new Error("No fue posible iniciar la sesión.")
            );

        };

        transaccion.onabort = () => {

            reject(
                transaccion.error ||
                new Error("La operación fue cancelada.")
            );

        };

    });

}


// Recuperar la sesión activa
export function recuperarSesion(bd) {

    return new Promise((resolve, reject) => {

        // Consultar el almacén de sesiones
        const transaccion = bd.transaction(
            ["sesiones", "usuarios"],
            "readonly"
        );

        const sesiones = transaccion.objectStore("sesiones");
        const usuarios = transaccion.objectStore("usuarios");

        // Buscar la sesión identificada como activa
        const consulta = sesiones.get("activa");

        let estudiante = null;

        consulta.onsuccess = () => {

            const sesion = consulta.result;

            // Si no hay sesión, no hay estudiante activo
            if (!sesion) {
                return;
            }

            // Verificar que el estudiante siga registrado
            const consultaUsuario = usuarios.get(sesion.documento);

            consultaUsuario.onsuccess = () => {

                if (consultaUsuario.result) {

                    estudiante = consultaUsuario.result;

                }

            };

        };

        // Finalizar la consulta
        transaccion.oncomplete = () => {

            resolve(estudiante);

        };

        // Manejar errores
        transaccion.onerror = () => {

            reject(
                transaccion.error ||
                new Error("No fue posible recuperar la sesión.")
            );

        };

        transaccion.onabort = () => {

            reject(
                transaccion.error ||
                new Error("No fue posible recuperar la sesión.")
            );

        };

    });

}
