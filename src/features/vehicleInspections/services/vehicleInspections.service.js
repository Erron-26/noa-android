import { BaseService } from '@services/api/base.service.js';
import { logger } from '@utils/logger.js';

/**
 * Servicio para la gestión de inspecciones de vehículos.
 * Extiende BaseService para manejar peticiones HTTP estandarizadas.
 */
class VehicleInspectionService extends BaseService {
    constructor() {
        super({
            resourcePath: 'fleet-management/vehicle-inspections',
            metadata: { module: 'vehicleInspections', service: 'vehicleInspections' },
        });
    }

    /**
     * Obtiene el listado paginado de inspecciones.
     * @param {Object} params - Parámetros de búsqueda y paginación.
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene una inspección por su UUID.
     * @param {string} uuid - UUID de la inspección.
     * @returns {Promise<Object>} Datos de la inspección.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea una nueva inspección.
     * @param {Object} data - Datos de la inspección a crear.
     * @returns {Promise<Object>} Inspección creada.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza una inspección existente.
     * @param {string} uuid - UUID de la inspección.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Inspección actualizada.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina una inspección.
     * @param {string} uuid - UUID de la inspección.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Descarga el PDF de la inspección en una nueva pestaña.
     * @param {string} uuid - UUID de la inspección.
     */
    downloadPdf(uuid) {
        return this._downloadPdf(`/${uuid}/pdf`);
    }

    /**
     * Verifica si existe inspección de un vehículo en una fecha (una al día).
     * @param {string} vehicleUuid - UUID del vehículo.
     * @param {string} date - Fecha Y-m-d a verificar.
     * @returns {Promise<{exists:boolean, inspection:Object|null}>}
     */
    async checkToday(vehicleUuid, date, companyUuid = '') {
        try {
            const res = await this._getInstance().get(
                `fleet-management/vehicle-inspections/check-today?vehicle_uuid=${vehicleUuid}&date=${date}${companyUuid ? `&company_uuid=${companyUuid}` : ''}`
            );
            return res.data?.data ?? res.data ?? { exists: false, inspection: null };
        } catch (err) {
            logger.warn('Error verificando inspección del día:', err.message);
            return { exists: false, inspection: null };
        }
    }

    /**
     * Obtiene el historial de inspecciones para un vehículo.
     * @param {string} vehicleUuid - UUID del vehículo.
     * @param {Object} params - Parámetros adicionales de paginación.
     * @returns {Promise<Object>} Respuesta con datos paginados del historial.
     */
    getVehicleHistory(vehicleUuid, params = {}) {
        return this._request('GET', '', {
            params: { ...params, filter: { vehicle_uuid: vehicleUuid }, sort: '-inspection_date' }
        });
    }

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

        const { companyUuid, thirdPartyUuid, isAfiliado } = this._getUserContext();

        const buildParams = (extra = {}) => {
            const params = new URLSearchParams();
            // El backend acepta ambos formatos (snake_case y camelCase) según el endpoint
            params.set('company_uuid', companyUuid || '');
            params.set('companyUuid', companyUuid || '');

            // isAfiliado ya incluye el caso "conductor" (ver _getUserContext)
            if (isAfiliado && thirdPartyUuid) {
                params.set('filter[third_party_uuid]', thirdPartyUuid);
                params.set('third_party_uuid', thirdPartyUuid);
            }

            Object.entries(extra).forEach(([key, value]) => params.set(key, value));

            return `?${params.toString()}`;
        };

        const companyQuery = buildParams();
        const vehicleQuery = buildParams();
        const driverQuery = buildParams({ type: 'is_driver' });

        const [companies, vehicles, drivers, inspectionItems] = await Promise.all([
            fetchSafe('administration/companies/list' + companyQuery),
            fetchSafe('fleet-management/vehicles/list' + vehicleQuery),
            fetchSafe('third-parties/list' + driverQuery),
            fetchSafe('catalogs/inspection-items/list')
        ]);

        return { companies, vehicles, drivers, inspectionItems };
    }
}

export default new VehicleInspectionService();