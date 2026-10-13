import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import rupRecordsService from '../services/rupRecords.service.js';

/**
 * Muestra una notificación toast usando SweetAlert2.
 * @param {string} title - Título de la alerta.
 * @param {string} text - Texto descriptivo.
 * @param {string} icon - Tipo de icono (success, error, warning, info).
 */


/**
 * Store Pinia para la gestión del estado del módulo RUP Records.
 * Maneja paginación server-side, carga de catálogos y operaciones CRUD.
 */
export const useRupRecordsStore = defineStore('rupRecords', {
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
        /**
         * Devuelve los items filtrados (en este caso, igual a items ya que el filtro es server-side).
         * @returns {Array} Lista de registros.
         */
        filteredItems: (state) => state.items,

        /**
         * Devuelve los items paginados actuales.
         * @returns {Array} Lista de registros de la página actual.
         */
        paginatedItems: (state) => state.items,
    },

    actions: {
        /**
         * Ejecuta una acción asíncrona manejando estados de loading y error globalmente.
         * @param {Function} action - Función asíncrona a ejecutar.
         * @param {string} errorMsg - Mensaje de error por defecto.
         * @returns {Promise<any>} Resultado de la acción.
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Obtiene la lista de registros RUP desde el backend con paginación.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await rupRecordsService.list({
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
         * Carga los catálogos necesarios para los formularios (empresas).
         * @returns {Promise<Object>} Catálogos cargados.
         */
        async loadCatalogs() {
            try {
                this.catalogs = await rupRecordsService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },

        /** Alias para loadCatalogs */
        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza un item localmente en el estado después de una edición.
         * @param {string} uuid - UUID del item.
         * @param {Object} patch - Datos parciales a actualizar.
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Post-procesamiento después de crear un item exitosamente.
         * @param {Object} response - Respuesta del servidor.
         * @returns {Object} Item creado.
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea un nuevo registro RUP.
         * @param {Object} data - Datos del formulario.
         * @returns {Promise<Object>} Registro creado.
         */
        createItem(data) {
            return this._run(
                () => rupRecordsService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un registro RUP existente.
         * @param {string} uuid - UUID del registro.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>} Registro actualizado.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await rupRecordsService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina un registro RUP.
         * @param {string} uuid - UUID del registro a eliminar.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await rupRecordsService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene el perfil detallado de un registro RUP.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<Object>} Datos del perfil.
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await rupRecordsService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Carga un registro por ID para edición o visualización.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<Object>} Datos del registro.
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await rupRecordsService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        /**
         * Cambia la página actual y recarga los datos.
         * @param {number} page - Número de página.
         * @returns {Promise<void>}
         */
        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },

        /**
         * Establece el término de búsqueda global y recarga desde la página 1.
         * @param {string} query - Término de búsqueda.
         * @returns {Promise<void>}
         */
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },

        /**
         * Limpia los filtros de búsqueda y recarga los datos.
         * @returns {Promise<void>}
         */
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});