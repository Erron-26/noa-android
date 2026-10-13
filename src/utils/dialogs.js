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
import { mobileBaseConfig } from '@utils/swal-mobile.js';

/**
 * @param {object} [deps] puntos de sustitución (solo pruebas)
 * @param {Function} [deps.cargarSwal] resuelve el objeto Swal
 * @param {object} [deps.logger] registro
 * @param {Function} [deps.base] base de configuración móvil
 */
export function createDialogs(deps = {}) {
    const cargarSwal = deps.cargarSwal || (() => import('sweetalert2').then((m) => m.default));
    const log = deps.logger || logger;
    const base = deps.base || mobileBaseConfig;
    let SwalRef = null;

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
        try {
            const Swal = await obtenerSwal();
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
        try {
            SwalRef?.close();
        } catch {
            /* cerrar nunca rompe el flujo */
        }
    }

    return { aviso, confirmar, mostrarCargando, cerrar };
}

const dialogs = createDialogs();

export const aviso = dialogs.aviso;
export const confirmar = dialogs.confirmar;
export const mostrarCargando = dialogs.mostrarCargando;
export const cerrarDialogo = dialogs.cerrar;

export default dialogs;
