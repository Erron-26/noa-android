import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { logger } from '@utils/logger.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import fuecService from '../services/fuec.service.js';
import { dateUtils } from '@utils/date.js';

/**
 * Muestra una notificación toast usando SweetAlert2.
 * @param {string} title - Título de la alerta.
 * @param {string} text - Texto descriptivo.
 * @param {string} icon - Tipo de icono (success, error, warning, info).
 */


export const useFuecStore = defineStore('fuec', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: {},
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
    }),

    getters: {
        filteredItems: (state) => state.items,
        paginatedItems: (state) => state.items,
    },

    actions: {
        /**
         * Ejecuta una acción asíncrona manejando estados de carga y errores.
         * @param {Function} action - Función asíncrona a ejecutar.
         * @param {string} errorMsg - Mensaje de error por defecto.
         * @returns {Promise<any>} Resultado de la acción.
         * @private
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Obtiene la lista paginada de FUECs desde el servidor.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await fuecService.list({
                    page: this.pagination.currentPage,
                    per_page: this.pagination.itemsPerPage,
                    search: this.search || undefined,
                });
                const p = response?.data ?? response;
                this.items = p.data ?? [];
                this.pagination.currentPage = p.current_page ?? 1;
                this.pagination.totalItems = p.total ?? 0;
                this.pagination.totalPages = p.last_page ?? 1;
                this.pagination.itemsPerPage = p.per_page ?? this.pagination.itemsPerPage;
            }, 'Error al cargar los datos');
        },

        /**
         * Carga los catálogos necesarios para los formularios.
         * @returns {Promise<Object>} Catálogos cargados.
         */
        async loadCatalogs() {
            try {
                this.catalogs = await fuecService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },

        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza localmente un item en la lista después de una edición.
         * @param {string} uuid - UUID del item.
         * @param {Object} patch - Cambios a aplicar.
         * @private
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Maneja la lógica posterior a la creación exitosa.
         * @param {Object} response - Respuesta de la API.
         * @returns {Object} Item creado.
         * @private
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea un nuevo FUEC.
         * @param {Object} data - Datos del formulario.
         * @returns {Promise<Object>}
         */
        createItem(data) {
            return this._run(
                () => fuecService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un FUEC existente.
         * @param {string} uuid - UUID del FUEC.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>}
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await fuecService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina un FUEC.
         * @param {string} uuid - UUID del FUEC.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await fuecService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene el perfil detallado de un FUEC.
         * @param {string} uuid - UUID del FUEC.
         * @returns {Promise<Object>}
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await fuecService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Carga un FUEC por ID para edición o vista.
         * @param {string} uuid - UUID del FUEC.
         * @returns {Promise<Object>}
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await fuecService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },
        
        /**
         * Asigna un vehículo al contrato y genera el número FUEC.
         * @param {string} contractUuid - UUID del contrato.
         * @returns {Promise<Object>} Datos del FUEC asignado.
         */
        assignVehicleToContract(contractUuid) {
            return this._run(
                () => fuecService.assignVehicleToContract(contractUuid),
                'Error al asignar el vehículo y generar el número FUEC'
            );
        },
        
        /**
         * Obtiene los contratistas asociados a un vehículo.
         * @param {string} vehicleUuid - UUID del vehículo.
         * @returns {Promise<Array>} Lista de contratistas.
         */
        getContractorsByVehicle(vehicleUuid) {
            return this._run(
                () => fuecService.getContractorsByVehicle(vehicleUuid),
                'Error al obtener los contratistas del vehículo'
            );
        },
        
        /**
         * Busca contratistas por nombre o número de documento.
         * @param {string} query - Término de búsqueda.
         * @returns {Promise<Array>} Lista de contratistas.
         */
        searchContractors(query) {
            return this._run(async () => {
                const res = await fuecService._request('GET', '/../contractors', { params: { search: query, per_page: 10 } });
                return res?.data?.data ?? res?.data ?? [];
            }, 'Error al buscar contratistas');
        },

        /**
         * Obtiene una vista previa del número FUEC de 23 dígitos.
         * @param {string} companyUuid - UUID de la empresa.
         * @param {string|null} contractorUuid - UUID del contratista.
         * @param {string|null} contractNumber - Consecutivo del contrato.
         * @returns {Promise<string>}
         */
        getPreviewFuecNumber(companyUuid, contractorUuid = null, contractNumber = null) {
            return this._run(
                () => fuecService.getPreviewFuecNumber(companyUuid, contractorUuid, contractNumber),
                'Error al obtener la vista previa del número FUEC'
            );
        },

        /**
         * Obtiene el estado de expiración de la licencia de un conductor.
         * @param {string} conductorUuid - UUID del conductor.
         * @returns {Promise<Object>} Estado de la licencia ({ is_expired, message }).
         */
        async getIsDriverLicenseExpired(conductorUuid) {
            try {
                const licenses = await fuecService.getDriverLicenses(conductorUuid);
                if (!licenses || !licenses.length) {
                    return { is_expired: true, message: 'El conductor seleccionado no tiene una licencia de conducción registrada.', expiration_date: null };
                }
                
                // Buscamos licencia activa o la primera
                const activeLicense = licenses.find(l => l.status === 'ACTIVA' || l.status == 1 || l.status === true);
                const license = activeLicense || licenses[0];
                
                if (!license.expiration_date) {
                    return { is_expired: false, expiration_date: null };
                }
                
                const isExpired = dateUtils.dayjs(license.expiration_date).isBefore(dateUtils.dayjs(), 'day');
                
                if (isExpired) {
                    return {
                        is_expired: true,
                        message: `La licencia de conducción del conductor está vencida desde el ${dateUtils.format(license.expiration_date, 'DD/MM/YYYY')}.`,
                        expiration_date: license.expiration_date
                    };
                }
                
                return { is_expired: false, expiration_date: license.expiration_date };
            } catch (error) {
                logger.error('Error al validar la licencia de conducción:', error?.message);
                return { is_expired: false, expiration_date: null };
            }
        },

        /**
         * Obtiene los datos de validación de un vehículo (vehículo con relaciones y cobros de administración).
         * @param {string} vehicleUuid - UUID del vehículo.
         * @returns {Promise<Object>} Datos del vehículo y cobros.
         */
        async fetchVehicleValidationData(vehicleUuid) {
            return this._run(async () => {
                const [vehicle, adminCharges] = await Promise.all([
                    fuecService.getVehicle(vehicleUuid),
                    fuecService.getVehicleAdminCharges(vehicleUuid)
                ]);
                return { vehicle, adminCharges };
            }, 'Error al obtener los datos de validación del vehículo');
        },

        /**
         * Obtiene el PDF generado por el servidor.
         * @param {string} uuid - UUID del FUEC.
         * @returns {Promise<Blob>} Archivo PDF binario.
         */
        downloadPdf(uuid) {
            return this._run(
                () => fuecService.downloadPdf(uuid),
                'Error al generar el PDF del servidor'
            );
        },

        getRawPdf(uuid) {
            return this._run(
                () => fuecService.getRawPdf(uuid),
                'Error al generar el PDF crudo del servidor'
            );
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});