import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import taxInformationService from '../services/taxInformation.service.js';



export const useTaxInformationStore = defineStore('taxInformation', {
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
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        async fetchItems() {
            return this._run(async () => {
                const response = await taxInformationService.list({
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

        async loadCatalogs() {
            try {
                this.catalogs = await taxInformationService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },
        loadFormOptions() { return this.loadCatalogs(); },

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

        createItem(data) {
            return this._run(
                () => taxInformationService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await taxInformationService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        async deleteItem(uuid) {
            return this._run(async () => {
                await taxInformationService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        getProfile(uuid) {
            return this._run(async () => {
                const r = await taxInformationService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await taxInformationService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        uploadFinancialStatements(uuid, file) {
            return this._run(
                () => taxInformationService._uploadFinancialStatements(uuid, file),
                'Error al subir estados financieros'
            );
        },

        uploadCompanySizeCertificate(uuid, file) {
            return this._run(
                () => taxInformationService._uploadCompanySizeCertificate(uuid, file),
                'Error al subir certificado de tamaño'
            );
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});