/**
 * Pantalla completa en móvil: funciones puras para activar y retirar la clase
 * `noa-fullbleed` del <body> (ver `src/styles/ancho-completo.css`).
 * El documento se inyecta para poder probar sin DOM ni navegador.
 */

/** Clase única que pone la app a sangre completa en el teléfono. */
export const CLASE_PANTALLA_COMPLETA = 'noa-fullbleed';

/**
 * Activa el ancho completo. Sin DOM (pruebas, SSR) no hace nada.
 * @param {Document} [doc] - Documento donde aplicar la clase.
 */
export function activarPantallaCompleta(doc = globalThis.document) {
    try {
        doc?.body?.classList?.add(CLASE_PANTALLA_COMPLETA);
    } catch {
        /* Sin DOM o DOM roto: no bloquea el arranque. */
    }
}

/**
 * Retira el ancho completo. Sin DOM (pruebas, SSR) no hace nada.
 * @param {Document} [doc] - Documento donde retirar la clase.
 */
export function desactivarPantallaCompleta(doc = globalThis.document) {
    try {
        doc?.body?.classList?.remove(CLASE_PANTALLA_COMPLETA);
    } catch {
        /* Sin DOM o DOM roto: no bloquea la salida. */
    }
}
