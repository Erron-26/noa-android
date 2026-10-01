// Confirmaciones con SweetAlert2 cargado de forma diferida.
// Se usa `import()` para no sumar SweetAlert2 al arranque de la aplicación.
import { mobileBaseConfig } from './swal-mobile.js';

let SwalPromise = null;

function getSwal() {
    if (!SwalPromise) {
        SwalPromise = import('sweetalert2').then(({ default: Swal }) => Swal);
    }
    return SwalPromise;
}

/**
 * Pregunta al usuario qué hacer con cambios sin guardar.
 * @returns {Promise<'save'|'discard'|'cancel'>}
 */
export async function confirmUnsavedChanges() {
    try {
        const Swal = await getSwal();
        const result = await Swal.fire(mobileBaseConfig({
            title: 'Tienes cambios sin guardar',
            text: 'Puedes guardarlos antes de continuar o salir sin guardar.',
            icon: 'warning',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Guardar y continuar',
            denyButtonText: 'Salir sin guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#2c7be5',
            denyButtonColor: '#e63757',
            reverseButtons: true,
        }));

        if (result.isConfirmed) return 'save';
        if (result.isDenied) return 'discard';
        return 'cancel';
    } catch {
        // Si SweetAlert2 no está disponible, no bloqueamos la navegación.
        return 'discard';
    }
}

/**
 * Pregunta confirmación antes de cerrar la sesión activa.
 * @returns {Promise<boolean>} true si el usuario confirma el cierre de sesión
 */
export async function confirmLogout() {
    try {
        const Swal = await getSwal();
        const result = await Swal.fire(mobileBaseConfig({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas salir de tu cuenta?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e63757',
            cancelButtonColor: '#748194',
            reverseButtons: true,
        }));

        return Boolean(result.isConfirmed);
    } catch {
        // En caso de fallo o fallback, usar confirm nativo del navegador
        return window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    }
}

