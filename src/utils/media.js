import env from './env.js';

/**
 * Retorna la URL completa para un recurso de media.
 * @param {string|null} path - Ruta relativa del archivo.
 * @param {string|null} fallback - URL/Ruta de respaldo si el path es nulo.
 * @returns {string} - URL absoluta del recurso.
 */
export function getMediaUrl(path, fallback = null) {
    if (!path) {
        return fallback || '/assets/img/favicons/favicon-32x32.png';
    }

    if (path.startsWith('data:')) {
        return path;
    }

    // Obtener la URL base del servidor (quitando la parte de /api/v1 si existe)
    const baseApiUrl = env.API_BASE_URL || 'https://apinoatransportes.solucionesintegralesmana.com/api/v1';
    const baseUrl = baseApiUrl.replace(/\/api\/v1\/?$/, '');

    // Si el backend devuelve una URL absoluta, extraemos su ruta (pathname)
    if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
            const urlObj = new URL(path);
            // Si la URL absoluta apunta a /storage o /assets, forzamos usar el baseUrl del entorno
            if (urlObj.pathname.startsWith('/storage') || urlObj.pathname.startsWith('/assets')) {
                return `${baseUrl}${urlObj.pathname}${urlObj.search}`;
            }
        } catch (e) {
            // Si falla el parseo, continuamos y devolvemos la ruta original
        }
        return path;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    if (cleanPath.startsWith('/storage') || cleanPath.startsWith('/assets')) {
        return `${baseUrl}${cleanPath}`;
    }

    return `${baseUrl}/storage${cleanPath}`;
}

export default getMediaUrl;
