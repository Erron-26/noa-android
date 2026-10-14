import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import projectsService from '../services/projects.service.js';

/**
 * Store Pinia para la gestión de proyectos y sus asignaciones de conductores y vehículos.
 */
export const useProjectsStore = defineStore('projects', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: { drivers: [], vehicles: [] },
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
        thirdPartyFilter: '',
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
         * Carga la lista de proyectos con paginación server-side.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await projectsService.list({
                    page: this.pagination.currentPage,
                    per_page: this.pagination.itemsPerPage,
                    search: this.search || undefined,
                    third_party_uuid: this.thirdPartyFilter || undefined,
                });
                const p = response?.data ?? response;
                this.items = p.data ?? [];
                this.pagination.currentPage = p.current_page ?? 1;
                this.pagination.totalItems = p.total ?? 0;
                this.pagination.totalPages = p.last_page ?? 1;
                this.pagination.itemsPerPage = p.per_page ?? this.pagination.itemsPerPage;
            }, 'Error al cargar los proyectos');
        },

        /**
         * Carga los catálogos necesarios para los formularios.
         * @returns {Promise<Object>} Catálogos cargados.
         */
        async loadCatalogs() {
            try {
                this.catalogs = await projectsService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar todas las opciones del formulario', 'warning');
                throw error;
            }
        },

        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza localmente un item en la lista.
         * @param {string} uuid - UUID del item.
         * @param {Object} patch - Datos parciales a actualizar.
         * @private
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Post-procesamiento tras creación exitosa.
         * @param {Object} response - Respuesta del servidor.
         * @returns {Object} Item creado.
         * @private
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            const message = response?.data?.message || response?.message || 'Registro creado correctamente';
            await toast('¡Éxito!', message, 'success');
            this.pagination.currentPage = 1;
            try { await this.fetchItems(); } catch (_e) { /* silencioso */ }
            return item;
        },

        /**
         * Crea un nuevo proyecto.
         * @param {Object} data - Datos del proyecto.
         * @returns {Promise<Object>} Proyecto creado.
         */
        createItem(data) {
            return this._run(
                () => projectsService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el proyecto'
            );
        },

        /**
         * Actualiza un proyecto existente.
         * @param {string} uuid - UUID del proyecto.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>} Proyecto actualizado.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await projectsService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                const message = response?.data?.message || response?.message || 'Registro actualizado correctamente';
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', message, 'success');
                return updated;
            }, 'Error al actualizar el proyecto');
        },

        /**
         * Elimina un proyecto.
         * @param {string} uuid - UUID del proyecto.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await projectsService.delete(uuid);
                await toast('¡Eliminado!', 'El proyecto ha sido eliminado correctamente', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el proyecto');
        },

        /**
         * Obtiene el perfil de un proyecto.
         * @param {string} uuid - UUID del proyecto.
         * @returns {Promise<Object>} Proyecto.
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await projectsService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el proyecto');
        },

        /**
         * Carga un proyecto por UUID para edición o vista.
         * @param {string} uuid - UUID del proyecto.
         * @returns {Promise<Object>} Datos del proyecto.
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await projectsService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el proyecto');
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        setThirdPartyFilter(thirdPartyUuid) {
            this.thirdPartyFilter = thirdPartyUuid;
            this.pagination.currentPage = 1;
            return this.fetchItems();
        },
        clearFilters() {
            this.search = '';
            this.thirdPartyFilter = '';
            this.pagination.currentPage = 1;
            return this.fetchItems();
        },
    },
});