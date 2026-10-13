/**
 * Descripción visual de un estado (pastilla).
 * Ubicación: src/utils/estadoBadge.js
 *
 * Lógica pura: código de estado → etiqueta en español, tono e icono.
 * El estado NUNCA se comunica solo con color: siempre lleva texto e icono
 * (regla de Diseño móvil del AGENTS.md). El naranja queda para pendientes.
 */

/** Tono → color base (tokens) e icono decorativo. */
export const TONOS = Object.freeze({
    pendiente: { color: 'var(--noa-alert)', icono: 'fas fa-clock' },
    proceso: { color: 'var(--noa-action)', icono: 'fas fa-spinner' },
    exito: { color: 'var(--noa-success)', icono: 'fas fa-check-circle' },
    neutro: { color: 'var(--noa-ink-soft)', icono: 'fas fa-circle' },
    error: { color: 'var(--noa-error)', icono: 'fas fa-exclamation-circle' },
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
    RECHAZADO: { etiqueta: 'Rechazado', tono: 'error' },
    RECHAZADA: { etiqueta: 'Rechazada', tono: 'error' },
});

const SIN_ESTADO = Object.freeze({ etiqueta: 'Sin estado', tono: 'neutro' });

/**
 * Describe un código de estado para pintarlo.
 * @param {string} codigo
 * @returns {{etiqueta: string, tono: string, color: string, icono: string}}
 */
export function describirEstado(codigo) {
    const clave = String(codigo ?? '').trim().toUpperCase();
    const base = MAPA[clave] || (clave ? { etiqueta: clave, tono: 'neutro' } : SIN_ESTADO);
    const tono = TONOS[base.tono] || TONOS.neutro;
    return { etiqueta: base.etiqueta, tono: base.tono, color: tono.color, icono: tono.icono };
}

export default describirEstado;
