import { BaseService } from '@services/api/base.service.js';
import { logger } from '@utils/logger.js';

/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-19
 * @module {Features.Fleet}
 * @resource {ServiceDeliveryControlSheet}
 */
class ServiceDeliveryControlSheetService extends BaseService {
    constructor() {
        super({
            resourcePath: '/control-sheets/service-delivery-control-sheets',
            metadata: { module: 'serviceDeliveryControlSheet', service: 'serviceDeliveryControlSheet' },
        });
    }

    /**
     * Obtiene el listado paginado de registros.
     * @param {Object} params - Parámetros de búsqueda y paginación.
     * @returns {Promise<Object>} Respuesta con los datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene un registro específico por su UUID.
     * @param {string} uuid - Identificador único del registro.
     * @returns {Promise<Object>} Datos del registro.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea un nuevo registro.
     * @param {Object} data - Datos del formulario.
     * @returns {Promise<Object>} Registro creado.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un registro existente (soporta multipart para archivos).
     * @param {string} uuid - Identificador único del registro.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Registro actualizado.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina un registro por su UUID.
     * @param {string} uuid - Identificador único del registro.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Obtiene el perfil/detalle completo de un registro.
     * @param {string} uuid - Identificador único del registro.
     * @returns {Promise<Object>} Datos detallados.
     */
    getProfile(uuid) { return this.get(uuid); }

    /**
     * Sube un archivo específico asociado al registro.
     * @param {string} uuid - Identificador del registro.
     * @param {string} field - Nombre del campo de archivo.
     * @param {File} file - Archivo a subir.
     * @returns {Promise<Object>} Resultado de la subida.
     * @private
     */
    _uploadFile(uuid, field, file) {
        const form = new FormData();
        form.append(field, file);
        return this._multipart('POST', `/${uuid}/${field}`, form);
    }

    /**
     * Obtiene el listado completo (no paginado) de hojas de control.
     * @returns {Promise<Array>} Lista de registros.
     */
    listAll() { return this._request('GET', '/list'); }

    /**
     * Obtiene las opciones de los catálogos relacionados (Empresas, Vehículos, Conductores).
     * @returns {Promise<Object>} Objeto con los arreglos de opciones.
     */
    async getFormOptions(companyUuid, thirdPartyUuid = null) {
        // Timeout acotado (15s): un catálogo colgado no debe bloquear la vista 30s.
        const fetchSafe = async (url) => {
            try {
                const res = await this._getInstance().get(url, { timeout: 15000 });
                return res.data?.data ?? res.data ?? [];
            } catch (err) {
                logger.warn(`Error cargando catálogo: ${url}`, err.message);
                return [];
            }
        };

        const [companies, vehicles, drivers, vehicleClasses, fuecs] = await Promise.all([
            fetchSafe('administration/companies/list'),
            fetchSafe('fleet-management/vehicles/list'),
            fetchSafe('third-parties/list?type=is_driver'),
            fetchSafe('catalogs/vehicle-classes/list'),
            fetchSafe('contract-extract/fuecs/list'),
        ]);

        // Si se proporciona companyUuid, también cargar proyectos de esa empresa.
        // Si se proporciona thirdPartyUuid (conductor), solo se traen sus proyectos asignados.
        let projects = [];
        if (companyUuid) {
            try {
                const params = new URLSearchParams({ company_uuid: companyUuid });
                if (thirdPartyUuid) params.append('third_party_uuid', thirdPartyUuid);
                const res = await this._getInstance().get(`projects/list?${params.toString()}`, { timeout: 15000 });
                projects = res.data?.data ?? res.data ?? [];
            } catch (err) {
                logger.warn('Error cargando proyectos', err.message);
            }
        }

        return {
            companies,
            vehicles,
            drivers,
            vehicleClasses,
            fuecs,
            projects,
        };
    }

    /**
     * Obtiene el listado de proyectos para una empresa.
     * Usa instancia directa porque no cuelga del resourcePath de planillas.
     * @param {string} companyUuid - UUID de la empresa.
     * @param {string|null} thirdPartyUuid - UUID del conductor para filtrar solo sus proyectos asignados.
     * @returns {Promise<Array>} Lista de proyectos.
     */
    async listProjects(companyUuid, thirdPartyUuid = null) {
        try {
            const params = new URLSearchParams();
            if (companyUuid) params.append('company_uuid', companyUuid);
            if (thirdPartyUuid) params.append('third_party_uuid', thirdPartyUuid);
            const query = params.toString() ? `projects/list?${params.toString()}` : 'projects/list';
            const res = await this._getInstance().get(query, { timeout: 15000 });
            return res.data?.data ?? res.data ?? [];
        } catch (err) {
            logger.warn('Error cargando proyectos', err.message);
            return [];
        }
    }

    /**
     * Obtiene un proyecto con sus asignaciones conductor-vehículo.
     * @param {string} uuid - UUID del proyecto.
     * @returns {Promise<Object>} Proyecto con driverVehicleAssignments.
     */
    async getProjectDetail(uuid) {
        try {
            const res = await this._getInstance().get(`projects/${uuid}`, { timeout: 15000 });
            return res.data?.data ?? res.data ?? null;
        } catch (err) {
            logger.warn('Error cargando detalle de proyecto', err.message);
            return null;
        }
    }

    /**
     * Inicia un servicio (Marca la planilla como en curso)
     * @param {string} uuid - Identificador de la planilla
     * @param {Object} data - Datos de inicio (hora, km, combustible, etc)
     * @returns {Promise<Object>}
     */
    startService(uuid, data) {
        return this._request('POST', `/${uuid}/start`, { data });
    }

    /**
     * Cierra o finaliza un servicio
     * @param {string} uuid - Identificador de la planilla
     * @param {Object} data - Datos de cierre (hora, km, firmas, etc)
     * @returns {Promise<Object>}
     */
    closeService(uuid, data) {
        return this._request('POST', `/${uuid}/close`, { data });
    }

    /**
     * Guarda el cierre de un solo recorrido (cierre parcial por recorrido).
     * @param {string} uuid - Identificador de la planilla
     * @param {Object} data - Datos de cierre del recorrido (route_uuid/route_index, hora, km, firmas, etc)
     * @returns {Promise<Object>}
     */
    closeRoute(uuid, data) {
        return this._request('POST', `/${uuid}/close-route`, { data });
    }

    /**
     * Genera el enlace público temporal para la firma del coordinador (1 hora).
     * @param {string} uuid - Identificador de la planilla.
     * @returns {Promise<Object>} Respuesta con { url, expires_at }.
     */
    generateCoordinatorSignUrl(uuid) {
        return this._request('POST', `/${uuid}/generate-sign-url`);
    }

    /**
     * Busca funcionarios ya registrados por número de CC en la empresa.
     * @param {string} cc - Número de CC (mínimo 3 caracteres).
     * @returns {Promise<Object>} Respuesta con la lista de coincidencias.
     */
    searchFuncionario(cc) {
        return this._request('GET', '/funcionarios/buscar', { params: { cc } });
    }

    /**
     * Descarga el PDF diario de un registro.
     * @param {string} uuid - Identificador único del registro.
     */
    downloadDailyPdf(uuid) {
        return this._downloadPdf(`/${uuid}/pdf`);
    }

    /**
     * Descarga el PDF mensual consolidado de un vehículo.
     * @param {Object} params - Parámetros: vehicle_uuid, year, month.
     */
    downloadMonthlyPdf(params) {
        const queryParams = new URLSearchParams(params).toString();
        const queryStr = queryParams ? `?${queryParams}` : '';
        return this._downloadPdf(`/monthly/pdf${queryStr}`);
    }

    /**
     * Descarga un reporte filtrado solo con días cerrados.
     * @param {string} tipo - rango|vehiculo|conductor|dia|mensual.
     * @param {Object} params - Filtros del reporte.
     * @param {string} formato - pdf|excel.
     */
    downloadReport(tipo, params = {}, formato = 'pdf') {
        const limpios = {};
        for (const [k, v] of Object.entries(params ?? {})) {
            if (v === undefined || v === null || v === '' || v === 'undefined') continue;
            limpios[k] = v;
        }
        const queryParams = new URLSearchParams(limpios).toString();
        const queryStr = queryParams ? `?${queryParams}` : '';
        const url = `/reports/${tipo}/${formato}${queryStr}`;
        if (formato === 'excel') return this._downloadExcel(url);
        return this._downloadPdf(url);
    }
}

export default new ServiceDeliveryControlSheetService();