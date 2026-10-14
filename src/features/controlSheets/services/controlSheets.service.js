/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-29
 * @module {Features.Fleet}
 * @resource {ControlSheet}
 */

import { BaseService } from '@services/api/base.service.js';
import { logger } from '@utils/logger.js';

class ControlSheetsService extends BaseService {
    constructor() {
        super({
            resourcePath: 'fleet-management/control-sheets',
            metadata: { module: 'controlSheets', service: 'controlSheets' },
        });
    }

    /**
     * Obtiene la lista paginada de hojas de control.
     * @param {Object} params - Parámetros de búsqueda y paginación.
     * @returns {Promise} Respuesta de la API.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene una hoja de control específica por UUID.
     * @param {string} uuid - UUID del registro.
     * @returns {Promise} Respuesta de la API.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea una nueva hoja de control.
     * @param {Object} data - Datos del formulario.
     * @returns {Promise} Respuesta de la API.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza una hoja de control existente.
     * @param {string} uuid - UUID del registro.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise} Respuesta de la API.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina una hoja de control.
     * @param {string} uuid - UUID del registro.
     * @returns {Promise} Respuesta de la API.
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Alias para obtener el perfil/detalle (mismo que get).
     * @param {string} uuid - UUID del registro.
     * @returns {Promise} Respuesta de la API.
     */
    getProfile(uuid) { return this.get(uuid); }

    /**
     * Obtiene las opciones de los catálogos relacionados (Empresas y Vehículos).
     * Utiliza endpoints terminados en /list para evitar paginación.
     * @returns {Promise<Object>} Objeto con los arreglos de opciones.
     */
    async getFormOptions() {
        const fetchSafe = async (url) => {
            try {
                const res = await this._getInstance().get(url);
                return res.data?.data ?? res.data ?? [];
            } catch (err) {
                logger.warn(`Error cargando catálogo: ${url}`, err.message);
                return [];
            }
        };

        const [companies, vehicles] = await Promise.all([
            fetchSafe('administration/companies/list'),
            fetchSafe('fleet-management/vehicles/list')
        ]);

        return { companies, vehicles };
    }

    uploadMultiplePdfs(uuid, formData) {
        return this._multipart('POST', `/${uuid}/upload-pdfs`, formData);
    }

    /**
     * Obtiene el listado de PDFs asociados a la Hoja de Control.
     * @param {string} uuid - UUID de la Hoja de Control.
     * @returns {Promise} Respuesta de la API.
     */
    getPdfs(uuid) { return this._request('GET', `/${uuid}/pdfs`); }

    /**
     * Elimina un PDF específico de la Hoja de Control.
     * @param {string} uuid - UUID de la Hoja de Control.
     * @param {string} mediaUuid - UUID del archivo PDF/Media.
     * @returns {Promise} Respuesta de la API.
     */
    deletePdf(uuid, mediaUuid) { return this._request('DELETE', `/${uuid}/pdfs/${mediaUuid}`); }
}

export default new ControlSheetsService();