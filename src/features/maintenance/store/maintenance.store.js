import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import maintenanceService from '../services/maintenance.service.js';

/**
 * Store Pinia para la gestión de estado de mantenimientos.
 * Maneja paginación server-side, carga de catálogos y operaciones CRUD.
 */


export const useMaintenanceStore = defineStore('maintenance', {
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
         * Obtiene la lista de mantenimientos con paginación server-side.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await maintenanceService.list({
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
         * Obtiene un registro por su UUID.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<Object>} Registro obtenido.
         */
        async fetchProfileById(uuid) {
            return this._run(async () => {
                const response = await maintenanceService.get(uuid);
                return response?.data?.data ?? response?.data ?? response;
            }, 'Error al cargar el registro');
        },

        /**
         * Carga los catálogos necesarios para los formularios.
         * @returns {Promise<Object>} Catálogos cargados.
         */
        async loadCatalogs() {
            try {
                this.catalogs = await maintenanceService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },
        loadFormOptions() { return this.loadCatalogs(); },

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
         * Crea un nuevo mantenimiento.
         * @param {Object} data - Datos del mantenimiento.
         * @returns {Promise<Object>} Mantenimiento creado.
         */
        createItem(data) {
            return this._run(
                () => maintenanceService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un mantenimiento existente.
         * @param {string} uuid - UUID del mantenimiento.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>} Mantenimiento actualizado.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await maintenanceService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina un mantenimiento.
         * @param {string} uuid - UUID del mantenimiento.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await maintenanceService.delete(uuid);
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