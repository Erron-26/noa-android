/**
 * Regla única de "modo conductor": decide qué vista y qué shell se muestran.
 * Ubicación: src/utils/modoConductor.js
 *
 * Funciones puras: reciben ruta, rol y plataforma, y no tocan DOM, Pinia
 * ni Capacitor. El hook `useModoConductor` las conecta con la app.
 *
 * `?view=conductor` previsualiza el modo conductor; `?view=admin` lo anula.
 */

/** Anchura (px) hasta la que un conductor en web recibe el shell móvil. */
export const ANCHO_MOVIL_MAX = 768;

/** Rutas operativas donde el conductor usa el shell móvil. */
export const RUTAS_OPERATIVAS_CONDUCTOR = [
    '/dashboard',
    '/inspeccion-vehiculos',
    '/planillas-de-control-de-servicios',
    '/planilla-de-control-de-prestacion-servicios',
    '/extracto-de-contrato',
    '/vehiculos',
    '/profile',
    '/notificaciones',
];

export function esRutaOperativaConductor(path = '') {
    return RUTAS_OPERATIVAS_CONDUCTOR.some((r) => path.startsWith(r));
}

/** ¿Se trata la sesión como conductor? (rol, o previsualización; `view=admin` lo anula). */
export function esModoConductor({ view = null, esConductor = false } = {}) {
    if (view === 'admin') return false;
    if (view === 'conductor') return true;
    return !!esConductor;
}

/** ¿El layout oculta el sidebar por estar en el dashboard del conductor? */
export function esDashboardDeConductor({ path = '', view = null, esConductor = false } = {}) {
    if (view === 'admin') return false;
    if (path.includes('/dashboard/conductor')) return true;
    if (view === 'conductor') return true;
    return path === '/dashboard' && !!esConductor;
}

/** ¿Se usa el shell/vista móvil del conductor en esta ruta? */
export function esMovilConductor({ path = '', view = null, esConductor = false, esAndroidNativo = false, ancho = Infinity } = {}) {
    if (!esModoConductor({ view, esConductor })) return false;
    const plataformaMovil = esAndroidNativo || view === 'conductor' || (ancho <= ANCHO_MOVIL_MAX && !!esConductor);
    return plataformaMovil && esRutaOperativaConductor(path);
}
