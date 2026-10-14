import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import businessCollaborationAgreementsService from '../services/businessCollaborationAgreements.service.js';

/**
 * Store Pinia para la gestión de estado de convenios de colaboración.
 * Maneja paginación server-side, carga de catálogos y operaciones CRUD.
 */


export const useBusinessCollaborationAgreementsStore = defineStore('businessCollaborationAgreements', {
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
         * Ejecuta una acción asíncrona manejando estados de carga y error.
         * @param {Function} action - Función asíncrona a ejecutar.
         * @param {string} errorMsg - Mensaje de error por defecto.
         * @returns {Promise<any>} Resultado de la acción.
         * @private
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Obtiene la lista de convenios con paginación server-side.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await businessCollaborationAgreementsService.list({
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
                this.catalogs = await businessCollaborationAgreementsService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },
        loadFormOptions() { return this.loadCatalogs(); },
        
        /**
         * Obtiene el siguiente ID interno consecutivo de acuerdo.
         * @param {string} [companyUuid] - UUID de la empresa opcional.
         * @returns {Promise<string>}
         */
        async fetchNextConsecutive(companyUuid) {
            try {
                const response = await businessCollaborationAgreementsService.getNextConsecutive(companyUuid);
                return response?.data?.agreement_internal_id || response?.agreement_internal_id || '0001';
            } catch (err) {
                console.warn('Error obteniendo consecutivo de acuerdo:', err);
                return '0001';
            }
        },

        /**
         * Actualiza localmente un item en la lista sin recargar todo.
         * @param {string} uuid - UUID del item.
         * @param {Object} patch - Datos parciales a actualizar.
         * @private
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Post-procesamiento después de crear un item.
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
         * Crea un nuevo convenio.
         * @param {Object} data - Datos del convenio.
         * @returns {Promise<Object>} Convenio creado.
         */
        createItem(data) {
            return this._run(
                () => businessCollaborationAgreementsService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un convenio existente.
         * @param {string} uuid - UUID del convenio.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>} Convenio actualizado.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await businessCollaborationAgreementsService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Obtiene un convenio existente.
         * @param {string} uuid - UUID del convenio.
         * @returns {Promise<Object>} Convenio recuperado.
         */
        getItem(uuid) {
            return this._run(async () => {
                const response = await businessCollaborationAgreementsService.get(uuid);
                return response?.data?.data ?? response?.data ?? response;
            }, 'Error al obtener el registro');
        },

        /**
         * Elimina un convenio.
         * @param {string} uuid - UUID del convenio.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await businessCollaborationAgreementsService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});