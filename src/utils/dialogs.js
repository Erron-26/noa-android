/**
 * Diálogos modales para móvil (confirmar, avisar, cargando).
 * Ubicación: src/utils/dialogs.js
 *
 * Cubre los usos de SweetAlert2 que `toast.js` no puede expresar:
 * confirmaciones, avisos con botón y estados de carga. Carga diferida
 * para no pesar en el arranque y base móvil (`swal-mobile.js`).
 *
 * Diseñado para el peor escenario: si SweetAlert2 no carga, nada lanza.
 * `confirmar` responde `false` (no se ejecuta a ciegas una acción
 * destructiva) y `aviso` resuelve como descartado.
 */

import { logger } from '@utils/logger.js';
import { toast } from '@utils/toast.js';
import { mobileBaseConfig } from '@utils/swal-mobile.js';

/** Escapa texto para interpolarlo en el `html` de un diálogo. */
export function escaparHtml(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/**
 * @param {object} [deps] puntos de sustitución (solo pruebas)
 * @param {Function} [deps.cargarSwal] resuelve el objeto Swal
 * @param {object} [deps.logger] registro
 * @param {Function} [deps.base] base de configuración móvil
 * @param {Function} [deps.notify] aviso tipo toast
 * @param {object} [deps.portapapeles] porta-papeles (`navigator.clipboard`)
 */
export function createDialogs(deps = {}) {
    const cargarSwal = deps.cargarSwal || (() => import('sweetalert2').then((m) => m.default));
    const log = deps.logger || logger;
    const base = deps.base || mobileBaseConfig;
    const notify = deps.notify || toast;
    const portapapeles = deps.portapapeles || (typeof navigator !== 'undefined' ? navigator.clipboard : null);
    let SwalRef = null;
    // Generación del modal de carga: si `cerrar()` corre mientras Swal aún
    // se importa, el `fire` tardío se aborta en vez de dejar un spinner atascado.
    let generacionCarga = 0;

    async function obtenerSwal() {
        if (!SwalRef) SwalRef = await cargarSwal();
        return SwalRef;
    }

    function noDisponible(error) {
        try {
            log.warn('Diálogo no disponible', { error: error?.message });
        } catch {
            /* el registro nunca rompe el flujo */
        }
    }

    /**
     * Aviso modal con un botón. Acepta `texto` o `html` (no ambos).
     * @returns {Promise<object>} resultado de Swal, o `{ dismissed: true }` si falla
     */
    async function aviso({ titulo = '', texto = '', html = null, icono = 'info', boton = 'Aceptar' } = {}) {
        try {
            const Swal = await obtenerSwal();
            const opciones = { title: titulo, icon: icono, confirmButtonText: boton };
            if (html != null) opciones.html = html;
            else opciones.text = texto;
            return await Swal.fire(base(opciones));
        } catch (error) {
            noDisponible(error);
            return { dismissed: true };
        }
    }

    /**
     * Pide confirmación. Ante cualquier fallo responde `false`.
     * @returns {Promise<boolean>} true solo si el usuario confirma
     */
    async function confirmar({ titulo = '', texto = '', html = null, confirmar = 'Sí, continuar', cancelar = 'Cancelar', peligro = false } = {}) {
        try {
            const Swal = await obtenerSwal();
            const opciones = {
                title: titulo,
                icon: peligro ? 'warning' : 'question',
                showCancelButton: true,
                confirmButtonText: confirmar,
                cancelButtonText: cancelar,
                confirmButtonColor: peligro ? '#d33' : '#2c7be5',
            };
            if (html != null) opciones.html = html;
            else opciones.text = texto;
            const resultado = await Swal.fire(base(opciones));
            return resultado?.isConfirmed === true;
        } catch (error) {
            noDisponible(error);
            return false;
        }
    }

    /** Modal de carga sin botones; se cierra con `cerrar()`. Nunca lanza. */
    async function mostrarCargando({ titulo = 'Cargando…', texto = '' } = {}) {
        const miGeneracion = ++generacionCarga;
        try {
            const Swal = await obtenerSwal();
            if (miGeneracion !== generacionCarga) return;
            await Swal.fire(base({
                title: titulo,
                text: texto || undefined,
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    try {
                        Swal.showLoading();
                    } catch {
                        /* sin spinner no se bloquea el flujo */
                    }
                },
            }));
        } catch (error) {
            noDisponible(error);
        }
    }

    /** Cierra el modal actual. Nunca lanza, aunque no haya nada abierto. */
    function cerrar() {
        generacionCarga++;
        try {
            SwalRef?.close();
        } catch {
            /* cerrar nunca rompe el flujo */
        }
    }

    /**
     * Muestra un enlace con botón para copiarlo al portapapeles.
     * La URL se escapa antes de interpolarla en el HTML.
     * @returns {Promise<'copiado'|'fallo-copia'|'descartado'>}
     */
    async function copiarEnlace(url, { titulo = '¡Enlace Generado!', descripcion = 'Comparte este enlace:', textoCopiar = 'Copiar', textoCerrar = 'Cerrar' } = {}) {
        const confirmado = await confirmar({
            titulo,
            html: `<p>${descripcion}</p><div class="mt-2 p-2 bg-light border rounded text-break font-monospace" style="font-size: 12px;">${escaparHtml(url)}</div>`,
            confirmar: textoCopiar,
            cancelar: textoCerrar,
        });
        if (!confirmado) return 'descartado';
        try {
            if (!portapapeles || typeof portapapeles.writeText !== 'function') {
                throw new Error('Portapapeles no disponible');
            }
            await portapapeles.writeText(url);
            try {
                await notify('¡Copiado!', 'El enlace ha sido copiado al portapapeles.', 'success');
            } catch {
                /* el aviso no cambia el resultado */
            }
            return 'copiado';
        } catch (error) {
            try {
                log.error('No se pudo copiar el enlace', { message: error?.message ?? error });
            } catch {
                /* el registro nunca rompe el flujo */
            }
            try {
                await notify('Error', 'No se pudo copiar automáticamente. Por favor selecciónalo y cópialo manualmente.', 'warning');
            } catch {
                /* el aviso no cambia el resultado */
            }
            return 'fallo-copia';
        }
    }

    return { aviso, confirmar, mostrarCargando, cerrar, copiarEnlace };
}

const dialogs = createDialogs();

export const aviso = dialogs.aviso;
export const confirmar = dialogs.confirmar;
export const mostrarCargando = dialogs.mostrarCargando;
export const cerrarDialogo = dialogs.cerrar;
export const copiarEnlace = dialogs.copiarEnlace;

export default dialogs;
