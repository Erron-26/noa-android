import { defineStore } from "pinia";
import { rbac } from "@services/security/permissions/rbac.js";
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

    actions: {
        setUser(user) {
            this.user = user;
            this.roles = Array.isArray(user.roles) ? user.roles : Object.values(user.roles || {});
            this.permissions = Array.isArray(user.permissions) ? user.permissions : Object.values(user.permissions || {});

            rbac.setUser({ ...user, roles: this.roles, permissions: this.permissions });
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
            }) || (typeof rbac.hasRole === 'function' && rbac.hasRole(role));
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
            
            return this.permissions.includes(permissionName) || rbac.can(action, subject);
        },

        clear() {
            this.$reset();
            rbac.clearUser();
        }
    },
    persist: { plugins: [permissionsPersistencePlugin] }
});