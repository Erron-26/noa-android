/**
 * Ejecutor único de acciones de stores Pinia (carga + error).
 * Ubicación: src/store/helpers/runStoreAction.js
 *
 * Reemplaza las copias de `_run` repetidas en los stores de features.
 * Diseñado para el peor escenario del conductor: sin red, API caída,
 * errores sin mensaje y sistema de avisos no disponible. Nunca lanza por
 * fallos del aviso o del registro: siempre restablece `loading` y relanza
 * el error original para que la vista decida.
 *
 * Los 422 de validación se guardan en `store.error` pero no disparan el
 * aviso global: el formulario los muestra inline con `role="alert"`.
 */

import { toast } from '@utils/toast.js';
import { logger } from '@utils/logger.js';

export const VALIDATION_STATUS = 422;
export const FALLBACK_ERROR_MESSAGE = 'Error inesperado. Inténtalo de nuevo.';

/** Extrae el mensaje más útil: backend → error → respaldo. Nunca vacío. */
export function extractStoreErrorMessage(error, fallback = FALLBACK_ERROR_MESSAGE) {
    const backend = error?.response?.data?.message;
    if (typeof backend === 'string' && backend.trim()) return backend;
    const direct = typeof error === 'string' ? error : error?.message;
    if (typeof direct === 'string' && direct.trim()) return direct;
    if (typeof fallback === 'string' && fallback.trim()) return fallback;
    return FALLBACK_ERROR_MESSAGE;
}

function isValidationError(error) {
    return error?.response?.status === VALIDATION_STATUS;
}

/**
 * @param {object} store estado con `loading` y `error` (p. ej. `this` del store)
 * @param {Function} action trabajo asíncrono a ejecutar
 * @param {string} [errorMsg] mensaje de respaldo si el error no trae ninguno
 * @param {object} [deps] puntos de sustitución (solo pruebas): `{ notify, logger }`
 */
export async function runStoreAction(store, action, errorMsg, deps = {}) {
    const notify = deps.notify || toast;
    const log = deps.logger || logger;
    store.loading = true;
    store.error = null;
    try {
        return await action();
    } catch (error) {
        store.error = extractStoreErrorMessage(error, errorMsg);
        if (!isValidationError(error)) {
            try {
                await notify('Error', store.error, 'error');
            } catch (avisoError) {
                try {
                    log.warn('Store: no se pudo mostrar el aviso de error', { error: avisoError?.message });
                } catch {
                    /* el registro nunca rompe el flujo */
                }
            }
        }
        try {
            log.error('Store: acción fallida', { message: store.error });
        } catch {
            /* el registro nunca rompe el flujo */
        }
        throw error;
    } finally {
        store.loading = false;
    }
}

export default runStoreAction;
