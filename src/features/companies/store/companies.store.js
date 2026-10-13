import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import companiesService from '../services/companies.service.js';

// ─── Helpers de UI ────────────────────────────────────────────────────────────



const confirm = (text) =>
    toast({
        title: '¿Estás seguro?', text, icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
    });

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCompaniesStore = defineStore('companies', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: { documentTypes: [], municipalities: [], taxRegimes: [] },
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
    }),

    getters: {
        filteredItems: (state) => state.items,
        paginatedItems: (state) => state.items,
    },

    actions: {
        /**
         * Wrapper que centraliza el patrón loading → acción → error → finally.
         * Evita repetir los mismos try/catch/finally en cada action.
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        async fetchItems() {
            return this._run(async () => {
                const response = await companiesService.list({
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
            }, 'Error al cargar las empresas');
        },

        async loadCatalogs() {
            try {
                this.catalogs = await companiesService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar todas las opciones del formulario', 'warning');
                throw error;
            }
        },

        loadFormOptions() { return this.loadCatalogs(); },

        // ─── Helpers internos de CRUD ─────────────────────────────────────

        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Empresa creada correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(c => c.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        // ─── CRUD ─────────────────────────────────────────────────────────

        createItem(data) {
            return this._run(
                () => companiesService.create(data).then(r => this._afterCreate(r)),
                'Error al crear la empresa'
            );
        },

        createItemWithFiles(data) {
            return this._run(
                () => companiesService.createWithFiles(data).then(r => this._afterCreate(r)),
                'Error al crear la empresa'
            );
        },

        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await companiesService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Empresa actualizada correctamente', 'success');
                return updated;
            }, 'Error al actualizar la empresa');
        },

        async deleteItem(uuid) {
            const result = await confirm('Esta acción no se puede deshacer');
            if (!result.isConfirmed) return;

            return this._run(async () => {
                await companiesService.delete(uuid);
                await toast('¡Eliminada!', 'La empresa ha sido eliminada correctamente', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar la empresa');
        },

        async updateStatus(uuid) {
            try {
                const response = await companiesService.toggleStatus(uuid);
                this._patchLocal(uuid, response?.data?.data ?? response?.data ?? response);
                await toast({ title: '¡Éxito!', text: 'Estado actualizado correctamente', icon: 'success', timer: 2000, showConfirmButton: false });
            } catch {
                await toast('Error', 'No se pudo actualizar el estado', 'error');
                throw new Error('Error al actualizar el estado');
            }
        },

        // ─── Archivos ─────────────────────────────────────────────────────

        uploadLogo(uuid, file) { return companiesService.uploadLogo(uuid, file).catch(e => console.error('Error subiendo logo:', e)); },
        uploadSignature(uuid, file) { return companiesService.uploadSignature(uuid, file).catch(e => console.error('Error subiendo firma:', e)); },

        // ─── Perfil ───────────────────────────────────────────────────────

        getProfile(uuid) {
            return this._run(async () => {
                const r = await companiesService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil de la empresa');
        },

        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await companiesService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar la empresa');
        },

        // ─── Paginación ───────────────────────────────────────────────────

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});