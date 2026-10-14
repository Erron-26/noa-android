import { defineStore } from "pinia";
import { defineAbilities } from "@services/security/permissions/abilities.js";
import { permissionsPersistencePlugin } from "@store/plugins/persistence.js";

export const usePermissionsStore = defineStore("permissions", {
    state: () => ({
        user: null,
        roles: [],
        permissions: [],
        abilities: {},
        isLoaded: false,
        isHydrated: false,
    }),

    getters: {
        /** SUPERADMIN opera sin filtro de empresa ni de tercero. */
        isSuperAdmin() {
            return this.hasRole('SUPERADMIN');
        },
    },

    actions: {
        setUser(user) {
            this.user = user;
            this.roles = Array.isArray(user.roles) ? user.roles : Object.values(user.roles || {});
            this.permissions = Array.isArray(user.permissions) ? user.permissions : Object.values(user.permissions || {});

            this.abilities = defineAbilities({ roles: this.roles, permissions: this.permissions });
            this.isLoaded = true;
        },

        async load() {
            if (this.isLoaded) return;
            const { authService } = await import("@services/api/auth.service.js");
            const user = await authService.getProfile();
            this.setUser(user);
        },

        hasRole(role) {
            if (!role) return false;
            // Normaliza separadores para que 'super-admin', 'super_admin' y
            // 'SUPERADMIN' coincidan con una sola comparación canónica.
            const normalize = (v) => String(v).toUpperCase().replace(/[-_\s]+/g, '');
            const target = normalize(role);
            return (this.roles || []).some(r => {
                const name = typeof r === 'string' ? r : r?.name;
                if (!name) return false;
                return normalize(name) === target;
            });
        },

        hasAnyRole(...roles) {
            return roles.some(r => this.hasRole(r));
        },

        can(action, subject = null) {
            // Acceso global de administración (una sola comparación normalizada)
            if (this.hasRole('superadmin') || this.hasRole('administrador')) {
                return true;
            }
            
            let permissionName = action;
            if (subject) {
                permissionName = `${subject}.${action}`;
            }
            
            return this.permissions.includes(permissionName);
        },

        clear() {
            this.$reset();
        }
    },
    persist: { plugins: [permissionsPersistencePlugin] }
});