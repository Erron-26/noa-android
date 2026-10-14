/**
 * Descripción visual de un estado (pastilla).
 * Ubicación: src/utils/estadoBadge.js
 *
 * Lógica pura: código de estado → etiqueta en español, tono e icono.
 * El estado NUNCA se comunica solo con color: siempre lleva texto e icono
 * (regla de Diseño móvil del AGENTS.md). El naranja queda para pendientes.
 */

/** Tono → colores de pastilla (fondo claro + texto oscuro: contraste AA) e icono. */
export const TONOS = Object.freeze({
    pendiente: { fondo: '#ffedd5', texto: '#c2410c', borde: 'var(--noa-alert)', icono: 'fas fa-clock' },
    proceso: { fondo: '#dbeafe', texto: '#1e40af', borde: 'var(--noa-action)', icono: 'fas fa-spinner' },
    exito: { fondo: '#dcfce7', texto: '#15803d', borde: 'var(--noa-success)', icono: 'fas fa-check-circle' },
    neutro: { fondo: 'var(--noa-paper)', texto: 'var(--noa-ink-soft)', borde: 'var(--noa-line)', icono: 'fas fa-circle' },
    error: { fondo: 'var(--noa-error-container)', texto: 'var(--noa-on-error-container)', borde: 'var(--noa-error)', icono: 'fas fa-exclamation-circle' },
});

const MAPA = Object.freeze({
    BORRADOR: { etiqueta: 'Borrador', tono: 'neutro' },
    EN_CURSO: { etiqueta: 'En curso', tono: 'proceso' },
    PARCIAL: { etiqueta: 'Parcial', tono: 'proceso' },
    CERRADA_OPERATIVAMENTE: { etiqueta: 'Cerrada', tono: 'exito' },
    CERTIFICADA: { etiqueta: 'Certificada', tono: 'exito' },
    CERRADA_CON_EXCEPCION: { etiqueta: 'Cerrada con excepción', tono: 'pendiente' },
    VIGENTE: { etiqueta: 'Vigente', tono: 'exito' },
    'NO VIGENTE': { etiqueta: 'No vigente', tono: 'error' },
    INACTIVA: { etiqueta: 'Inactiva', tono: 'neutro' },
    ACTIVO: { etiqueta: 'Activo', tono: 'exito' },
    INACTIVO: { etiqueta: 'Inactivo', tono: 'neutro' },
    PENDIENTE: { etiqueta: 'Pendiente', tono: 'pendiente' },
    APROBADO: { etiqueta: 'Aprobado', tono: 'exito' },
    APROBADA: { etiqueta: 'Aprobada', tono: 'exito' },
    FIRMADO: { etiqueta: 'Firmado', tono: 'exito' },
    FIRMADA: { etiqueta: 'Firmada', tono: 'exito' },
    RECHAZADO: { etiqueta: 'Rechazado', tono: 'error' },
    RECHAZADA: { etiqueta: 'Rechazada', tono: 'error' },
});

const SIN_ESTADO = Object.freeze({ etiqueta: 'Sin estado', tono: 'neutro' });

/** "EN_REVISION" → "En revision": legible sin inventar un estado nuevo. */
function humanizar(codigo) {
    return codigo
        .split('_')
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Describe un código de estado para pintarlo.
 * @param {string} codigo
 * @returns {{etiqueta: string, tono: string, fondo: string, texto: string, borde: string, icono: string}}
 */
export function describirEstado(codigo) {
    const clave = String(codigo ?? '').trim().toUpperCase();
    const base = MAPA[clave] || (clave ? { etiqueta: humanizar(clave), tono: 'neutro' } : SIN_ESTADO);
    const tono = TONOS[base.tono] || TONOS.neutro;
    return { etiqueta: base.etiqueta, tono: base.tono, fondo: tono.fondo, texto: tono.texto, borde: tono.borde, icono: tono.icono };
}

export default describirEstado;
