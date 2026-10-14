/**
 * @file enablingResolutions.store.js
 * @description Store Pinia para el módulo de Resoluciones de Habilitación.
 * Gestiona el estado, paginación server-side, catálogos y acciones CRUD.
 * @module enablingResolutions/store
 */

import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import enablingResolutionsService from '../services/enablingResolutions.service.js';

/**
 * Muestra una notificación toast con SweetAlert2.
 * @param {string} title - Título de la notificación.
 * @param {string} text - Texto descriptivo.
 * @param {string} icon - Icono ('success', 'error', 'warning', 'info').
 * @returns {Promise<SweetAlertResult>} Resultado del Swal.
 */


/**
 * Store Pinia para gestionar el estado del módulo de Resoluciones de Habilitación.
 * Implementa paginación server-side estricta y centraliza el manejo de loading/error.
 * @type {import('pinia').StoreDefinition}
 */
export const useEnablingResolutionsStore = defineStore('enablingResolutions', {
    /**
     * Estado reactivo del store.
     * @returns {Object} Estado inicial.
     * @property {Array<Object>} items - Listado de resoluciones.
     * @property {Object|null} selectedItem - Resolución seleccionada para detalle.
     * @property {boolean} loading - Indicador de carga global.
     * @property {string|null} error - Mensaje de error actual.
     * @property {Object} catalogs - Catálogos cargados para formularios.
     * @property {Object} pagination - Estado de paginación server-side.
     * @property {string} search - Texto de búsqueda global.
     */
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: {},
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
    }),

    /**
     * Getters computados del store.
     * En este módulo la paginación es server-side, por lo que los getters
     * simplemente retornan el arreglo completo de items.
     */
    getters: {
        /**
         * Retorna los items del listado (ya filtrados server-side).
         * @param {Object} state - Estado del store.
         * @returns {Array<Object>} Items filtrados.
         */
        filteredItems: (state) => state.items,

        /**
         * Retorna los items paginados (ya paginados server-side).
         * @param {Object} state - Estado del store.
         * @returns {Array<Object>} Items paginados.
         */
        paginatedItems: (state) => state.items,
    },

    /**
     * Acciones del store para operaciones CRUD, paginación y catálogos.
     */
    actions: {
        /**
         * Ejecuta una acción asíncrona centralizando el manejo de loading, error y finally.
         * @param {Function} action - Función asíncrona a ejecutar.
         * @param {string} errorMsg - Mensaje de error por defecto.
         * @returns {Promise<*>} Resultado de la acción.
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Obtiene el listado paginado de resoluciones de habilitación desde el backend.
         * Actualiza el estado de paginación con los metadatos recibidos.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await enablingResolutionsService.list({
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
         * Carga los catálogos necesarios para los selects del formulario.
         * @returns {Promise<Object>} Catálogos cargados.
         */
        async loadCatalogs() {
            try {
                this.catalogs = await enablingResolutionsService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },

        /**
         * Alias de loadCatalogs para compatibilidad con el hook useFormManager.
         * @returns {Promise<Object>} Catálogos cargados.
         */
        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza un item localmente sin necesidad de recargar el listado.
         * @param {string} uuid - UUID del item a actualizar.
         * @param {Object} patch - Propiedades a mezclar con el item existente.
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Procesa la respuesta posterior a la creación exitosa de un registro.
         * Reinicia la paginación a la página 1 y recarga el listado.
         * @param {Object} response - Respuesta del servicio.
         * @returns {Promise<Object>} Item creado.
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea una nueva resolución de habilitación.
         * @param {Object} data - Datos del formulario.
         * @returns {Promise<Object>} Registro creado.
         */
        createItem(data) {
            return this._run(
                () => enablingResolutionsService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza una resolución de habilitación existente.
         * @param {string} uuid - UUID de la resolución.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>} Registro actualizado.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await enablingResolutionsService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina una resolución de habilitación y ajusta la paginación si es necesario.
         * @param {string} uuid - UUID de la resolución a eliminar.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await enablingResolutionsService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene el perfil completo de una resolución de habilitación.
         * @param {string} uuid - UUID de la resolución.
         * @returns {Promise<Object>} Datos del perfil.
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await enablingResolutionsService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Carga un registro por UUID para mostrarlo en la vista de detalle o formulario.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<Object>} Registro cargado.
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await enablingResolutionsService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        /**
         * Cambia la página activa y recarga el listado.
         * @param {number} page - Número de página (base 1).
         * @returns {Promise<void>}
         */
        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },

        /**
         * Establece el filtro de búsqueda global y recarga desde la página 1.
         * @param {string} query - Texto de búsqueda.
         * @returns {Promise<void>}
         */
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },

        /**
         * Limpia todos los filtros y recarga desde la página 1.
         * @returns {Promise<void>}
         */
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});