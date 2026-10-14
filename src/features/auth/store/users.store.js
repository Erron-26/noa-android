import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import usersService from '../services/users.service.js';

export const useUsersStore = defineStore('users', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        pagination: { currentPage: 1, itemsPerPage: 15, totalItems: 0, totalPages: 0 },
        search: '',
        rolesCatalog: [],
    }),

    actions: {
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        async fetchItems() {
            return this._run(async () => {
                const response = await usersService.list({
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
            }, 'Error al cargar usuarios');
        },

        async fetchRolesCatalog() {
            try {
                this.rolesCatalog = await usersService.getRolesCatalog();
            } catch (e) {
                console.warn('No se pudo cargar catálogo de roles', e.message);
                this.rolesCatalog = [];
            }
        },

        async removeRoleFromUser(user) {
            // user = { uuid, roles: [] } o item completo
            return this._run(async () => {}, '');
        },

        async syncRoles(uuid, roles) {
            return this._run(async () => {
                const res = await usersService.syncRoles(uuid, roles);
                const updated = res?.data?.data ?? res?.data ?? res;
                const idx = this.items.findIndex(u => u.uuid === uuid);
                if (idx !== -1) {
                    // El backend devuelve roles como array de nombres
                    const newRoles = updated?.roles ?? roles;
                    this.items[idx] = { ...this.items[idx], roles: newRoles };
                }
                await toast('¡Éxito!', 'Roles actualizados correctamente', 'success');
                return updated;
            }, 'Error al actualizar roles');
        },

        async removeRole(uuid, roleName) {
            const target = this.items.find(u => u.uuid === uuid);
            const currentRoles = target?.roles ?? [];
            const nextRoles = currentRoles.filter(r => r !== roleName);
            return this.syncRoles(uuid, nextRoles);
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setSearch(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearSearch() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});
