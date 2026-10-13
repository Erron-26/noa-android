import { useAuthStore } from "@store/modules/auth.js";
import { usePermissionsStore } from "@store/modules/permissions.js";
import { handleGlobalError } from "@utils/error-handler.js";

// Sustituimos ROUTES por rutas directas o constantes locales
const LOGIN_ROUTE = "/login";
const DASHBOARD_ROUTE = "/dashboard";
const CONDUCTOR_DASHBOARD_ROUTE = "/dashboard/conductor";

function esConductor() {
    try {
        return usePermissionsStore().hasRole('CONDUCTOR');
    } catch {
        return false; // Sin permisos legibles: se usa el destino por defecto.
    }
}

function getDashboardRoute() {
    return esConductor() ? CONDUCTOR_DASHBOARD_ROUTE : DASHBOARD_ROUTE;
}

export async function authGuard(to, from, next) {
    const authStore = useAuthStore();

    try {
        if (!authStore.isHydrated) await waitForAuthHydration(authStore);

        const isAuthenticated = authStore.isAuthenticated && authStore.accessToken;

        // Si la ruta es solo para invitados (ej: login) y ya está autenticado, enviarlo al dashboard
        if (to.meta.guestOnly && isAuthenticated) {
            return next({ path: getDashboardRoute() });
        }

        // Si la ruta es pública, permitir el paso sin requerir autenticación
        if (to.meta.public) return next();

        // Si requiere autenticación y no lo está
        if (!isAuthenticated) {
            return next({ path: LOGIN_ROUTE, query: { redirect: to.fullPath } });
        }

        if (authStore.isTokenExpired) {
            await authStore.logout({ redirect: false });
            return next(LOGIN_ROUTE);
        }

        // Si el conductor intenta acceder al dashboard general, redirigir al suyo
        if (to.path === '/dashboard' && esConductor()) {
            return next({ path: CONDUCTOR_DASHBOARD_ROUTE });
        }

        next();
    } catch (error) {
        handleGlobalError(error, "router");
        next(LOGIN_ROUTE);
    }
}

async function waitForAuthHydration(authStore, timeoutMs = 1000) {
    if (authStore.isHydrated) return;
    return new Promise((resolve) => {
        if (authStore.isHydrated) return resolve();

        const timer = setTimeout(() => resolve(), timeoutMs);

        const pollInterval = setInterval(() => {
            if (authStore.isHydrated) {
                clearInterval(pollInterval);
                clearTimeout(timer);
                resolve();
            }
        }, 10);

        const unsubscribe = authStore.$subscribe((mutation, state) => {
            if (state.isHydrated || authStore.isHydrated) {
                clearInterval(pollInterval);
                clearTimeout(timer);
                unsubscribe();
                resolve();
            }
        });
    });
}