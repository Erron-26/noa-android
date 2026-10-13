/**
 * @fileoverview Store de Pinia para el módulo de Declaraciones de Renta.
 * @module store/taxDeclarationsStore
 */

import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import taxDeclarationsService from '../services/taxDeclarations.service.js';

/**
 * Muestra un mensaje de alerta al usuario.
 * @param {string} title - Título del mensaje.
 * @param {string} text - Texto del mensaje.
 * @param {string} icon - Icono de la alerta (success, error, warning, info).
 */


/**
 * Store para gestionar el estado de las declaraciones de renta.
 * @typedef {Object} TaxDeclarationsState
 * @property {Array} items - Lista de declaraciones de renta.
 * @property {Object|null} selectedItem - Declaración seleccionada.
 * @property {boolean} loading - Indica si se está cargando.
 * @property {string|null} error - Error actual.
 * @property {Object} catalogs - Catálogos de opciones.
 * @property {Object} pagination - Configuración de paginación.
 * @property {string} search - Término de búsqueda.
 */

/**
 * Store de Pinia para el módulo de Declaraciones de Renta.
 */
export const useTaxDeclarationsStore = defineStore('taxDeclarations', {
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
         * Ejecuta una acción con manejo de loading y errores.
         * @param {Function} action - Acción a ejecutar.
         * @param {string} errorMsg - Mensaje de error.
         * @returns {Promise} Promesa con el resultado de la acción.
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Obtiene el listado de declaraciones de renta.
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await taxDeclarationsService.list({
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
         * Carga los catálogos necesarios para el formulario.
         */
        async loadCatalogs() {
            try {
                this.catalogs = await taxDeclarationsService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },

        /**
         * Carga las opciones del formulario.
         */
        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza un item localmente.
         * @param {string} uuid - UUID del item.
         * @param {Object} patch - Datos a actualizar.
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Acción a realizar después de crear un item.
         * @param {Object} response - Respuesta del servidor.
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea un nuevo item.
         * @param {Object} data - Datos del item.
         */
        createItem(data) {
            return this._run(
                () => taxDeclarationsService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un item.
         * @param {string} uuid - UUID del item.
         * @param {Object} data - Datos actualizados.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await taxDeclarationsService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina un item.
         * @param {string} uuid - UUID del item.
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await taxDeclarationsService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene el perfil de un item.
         * @param {string} uuid - UUID del item.
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await taxDeclarationsService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Obtiene un item por su UUID.
         * @param {string} uuid - UUID del item.
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await taxDeclarationsService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        /**
         * Establece la página actual.
         * @param {number} page - Número de página.
         */
        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },

        /**
         * Establece el filtro global.
         * @param {string} query - Término de búsqueda.
         */
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },

        /**
         * Limpia los filtros.
         */
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});