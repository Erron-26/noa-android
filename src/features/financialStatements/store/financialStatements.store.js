import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import financialStatementsService from '../services/financialStatements.service.js';



/**
 * Store de estados financieros.
 * Maneja paginación server-side, CRUD y catálogos.
 */
export const useFinancialStatementsStore = defineStore('financialStatements', {
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
         * Ejecuta una acción con manejo centralizado de loading/error.
         * @param {Function} action
         * @param {string} errorMsg
         * @returns {Promise}
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Carga la lista de estados financieros con paginación y búsqueda.
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await financialStatementsService.list({
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
         * Carga los catálogos (empresas, etc.) desde el servicio.
         */
        async loadCatalogs() {
            try {
                this.catalogs = await financialStatementsService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },
        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza un elemento localmente después de una actualización.
         * @param {string} uuid
         * @param {Object} patch
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea un nuevo estado financiero.
         * @param {Object} data
         */
        createItem(data) {
            return this._run(
                () => financialStatementsService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un estado financiero existente.
         * @param {string} uuid
         * @param {Object} data
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await financialStatementsService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina un estado financiero.
         * @param {string} uuid
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await financialStatementsService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene el perfil de un estado financiero.
         * @param {string} uuid
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await financialStatementsService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Obtiene un registro por UUID (sin modificar selectedItem necesariamente).
         * @param {string} uuid
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await financialStatementsService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        setPage(page) {
            this.pagination.currentPage = page;
            return this.fetchItems();
        },
        setGlobalFilter(query) {
            this.search = query;
            this.pagination.currentPage = 1;
            return this.fetchItems();
        },
        clearFilters() {
            this.search = '';
            this.pagination.currentPage = 1;
            return this.fetchItems();
        },
    },
});