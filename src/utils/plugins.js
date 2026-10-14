/**
 * Orquestador de Plugins - NOA
 * Ubicación: src/utils/plugins.js
 */

import { watch } from "vue";
import pinia from "@store/index.js";
import { useAuthStore, usePermissionsStore, useUserStore } from "@store/index.js";
import router from "../router/index";
import { logger } from "@utils/logger.js";
import { handleGlobalError, setupGlobalErrorHandlers } from "@utils/error-handler.js";
import { verifyConnection, subscribe, setToastHandler } from "@utils/connectivity.js";
import { installPrimeVue } from "@components/app/primevue.js";
import { installI18n } from "@utils/i18n.js";
import { tokenManager } from "@services/security/token-manager.js";
import { toast } from '@/utils/toast.js';
import { storeRegistry } from "@services/api/interceptors.js";
import { setAuthRouter } from "@features/auth/store/auth.store.js";
import { setErrorRouter } from "@utils/error-handler.js";

/**
 * Registra todos los plugins de la aplicación en orden crítico.
 */
export async function registerPlugins(app) {
    try {
        // 1. Inicialización de Estado y UI
        await medirPlugin("Pinia", async () => app.use(pinia));
        await medirPlugin("PrimeVue", async () => installPrimeVue(app));
        // 2. Seguridad inicial
        await medirPlugin("Token Manager", async () => await tokenManager.init());

        // 3. Hidratación de Stores (Crítico: El Router depende de los stores)
        await medirPlugin("Hidratación de stores", async () => {
            const authStore = useAuthStore();
            const permissionsStore = usePermissionsStore();
            const userStore = useUserStore();

            await Promise.all([
                waitForStoreHydration(authStore),
                waitForStoreHydration(permissionsStore),
                waitForStoreHydration(userStore),
            ]);

            // Registrar stores en el registry del interceptor (evita dynamic imports inefectivos)
            storeRegistry.authStore = authStore;
            storeRegistry.userStore = userStore;
            storeRegistry.permissionsStore = permissionsStore;

            // Helpers globales para permisos
            app.config.globalProperties.$can = (a, s) => permissionsStore.can(a, s);
            app.config.globalProperties.$hasRole = (r) => permissionsStore.hasRole(r);

            // [NUEVO] Refrescar permisos silenciosamente en background
            // Esto asegura que si se modifican roles en BD, la app los tomará en el próximo F5
            if (authStore.isAuthenticated) {
                authStore.fetchProfile().catch(() => {
                    // Si falla (ej. sin red), la app sigue funcionando con lo cacheado localmente
                    logger.warn("Fetch silencioso de perfil falló o fue bloqueado.");
                });
            }
        });

        // 4. Navegación e Internacionalización
        await medirPlugin("Router", async () => {
            app.use(router);
            // Inyectar instancia del router en módulos que la necesitan
            setAuthRouter(router);
            setErrorRouter(router);
        });
        await medirPlugin("Vue I18n", async () => await installI18n(app));

        // 5. Manejo de Errores y Monitoreo
        medirPlugin("Manejadores Globales", () => {
            app.config.errorHandler = (err, instance, info) => handleGlobalError(err, "vue", {
                meta: {
                    component: instance?.$options?.name || instance?.$?.type?.name || instance?.$?.type?.__name || null,
                    info: info || null,
                    route: window?.location?.hash || window?.location?.pathname || null,
                    stack: err?.stack ? String(err.stack).split('\n').slice(0, 6).join('\n') : null,
                },
            });
            setupGlobalErrorHandlers();
        });

        if (typeof window !== "undefined") {
            setToastHandler(({ message, type }) => {
                toast('', message, type || 'info');
            });
            window.addEventListener('app:toast', (e) => {
                const { type, message } = e.detail;
                toast('', message, type || 'info');
            });
            inicializarMonitoreoConectividad();
            registrarListenerSesionExpirada();
        }

        logger.info("NOA: Sistema inicializado correctamente.");
    } catch (error) {
        logger.error("Error crítico en el registro de plugins:", error);
        throw error;
    }
}

/**
 * Espera la hidratación de estados persistidos (máximo 1s).
 * Usa watch de Vue para detectar cambios reactivos de forma inmediata y no quemar CPU.
 * @param {Object} store - Instancia del store de Pinia.
 * @param {number} [timeoutMs=1000] - Tiempo de espera máximo en milisegundos.
 * @returns {Promise<void>}
 */
async function waitForStoreHydration(store, timeoutMs = 1000) {
    if (!store || store.isHydrated) return;

    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            logger.warn(`[Performance] Timeout esperando hidratación de ${store.$id}`);
            resolve();
        }, timeoutMs);

        const unwatch = watch(
            () => store.isHydrated,
            (val) => {
                if (val) {
                    clearTimeout(timer);
                    unwatch();
                    resolve();
                }
            },
            { immediate: true }
        );
    });
}

/**
 * Wrapper de rendimiento para logs.
 */
async function medirPlugin(nombre, fn) {
    const inicio = performance.now();
    await fn();
    const tiempo = performance.now() - inicio;
    if (tiempo > 10) {
        logger.debug(`[Performance] ${nombre} cargado en ${tiempo.toFixed(2)}ms`);
    }
}

/**
 * Monitoreo de conectividad.
 */
function inicializarMonitoreoConectividad() {
    subscribe(({ online, reachable }) => {
        if (online && reachable) logger.info("Conexión restaurada");
        else logger.warn("Conexión perdida");
    });
    // Chequeo inicial diferido: no bloquea el primer pintado
    setTimeout(() => {
        verifyConnection().catch(err => logger.warn("Error en chequeo de conectividad", err));
    }, 2500);
}

/**
 * Escucha el evento auth:unauthorized emitido por el interceptor Axios
 * y redirige al login. El flag evita múltiples redirects en cascada
 * cuando varias peticiones fallan con 401 simultáneamente.
 */
function registrarListenerSesionExpirada() {
    let redirecting = false;

    window.addEventListener('auth:unauthorized', async () => {
        if (redirecting) return;
        redirecting = true;

        logger.warn('Sesión expirada: redirigiendo al login.');

        window.dispatchEvent(new CustomEvent('app:toast', {
            detail: { type: 'warning', message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.' }
        }));

        try {
            // router está importado estáticamente — no necesita dynamic import
            await router.push('/login');
        } catch (e) {
            logger.error('Error al redirigir tras sesión expirada', e);
        } finally {
            setTimeout(() => { redirecting = false; }, 3000);
        }
    });
}