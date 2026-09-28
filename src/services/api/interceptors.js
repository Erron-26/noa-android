/**
 * Interceptores unificados para reducir sobrecarga de importación
 * Ubicación: src/services/api/interceptors.js
 */
import { logger } from "@utils/logger.js";
import { tokenManager } from "@services/security/token-manager.js";
import { maskRequestData, maskResponseData } from "@utils/mask.js";
import { handleGlobalError } from "@utils/error-handler.js";

/**
 * Registry de stores para romper dependencia circular sin dynamic import.
 * Los stores se registran en plugins.js tras la hidratación inicial.
 * @type {{ authStore: Object|null, userStore: Object|null, permissionsStore: Object|null }}
 */
export const storeRegistry = { authStore: null, userStore: null, permissionsStore: null };

// Flag para evitar cascada de 401 → logout → /logout → 401
let _isHandling401 = false;

// Interceptor de Request
export const requestInterceptor = async (config) => {
    config.metadata = { startTime: Date.now() };

    // Inyección automática de token (Sanctum PAT)
    const token = await tokenManager.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    logger.debug("📡 Request", { url: config.url, data: maskRequestData(config.data) });
    return config;
};

// Interceptor de Response
export const responseInterceptor = {
    success: (response) => {
        const duration = Date.now() - (response?.config?.metadata?.startTime || Date.now());
        logger.info(`✅ ${response?.config?.method?.toUpperCase() || 'HTTP'} ${response?.config?.url || ''} (${duration}ms)`);
        return response;
    },
    error: async (error) => {
        const { response, config } = error;

        // Las rutas públicas de autenticación gestionan su propio error en la vista
        // de login (mensaje inline). No deben limpiar la sesión ni emitir
        // `auth:unauthorized`, o un 401 por credenciales se convierte en logout global.
        const url = String(config?.url || '');
        const esRutaAuthPublica = url.includes('/login') || url.includes('/refresh-token');
        if (esRutaAuthPublica) return Promise.reject(error);

        if (response?.status === 401) {
            if (_isHandling401) return Promise.reject(error);
            _isHandling401 = true;

            try {
                const { authStore, userStore, permissionsStore } = storeRegistry;
                if (authStore?.isAuthenticated && authStore?.accessToken) {
                    authStore.$reset();
                    userStore?.clear();
                    permissionsStore?.clear();
                }
                await tokenManager.clearTokens();
            } catch {
                await tokenManager.clearTokens();
            }
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            setTimeout(() => { _isHandling401 = false; }, 3000);
            return Promise.reject(error);
        }

        if (response?.status === 422) {
            logger.warn(`⚠️ Validación de formulario 422 en ${config?.url}`, { data: maskResponseData(response?.data) });
            return Promise.reject(error);
        }

        const estado = response?.status ?? error?.code ?? 'sin-respuesta';
        logger.error(`💥 API Error ${estado} | ${config?.method?.toUpperCase() || ''} ${config?.url || ''} | ${error?.message || ''}`, { url: config?.url, data: maskResponseData(response?.data) });
        await handleGlobalError(error, "api", { redirectToErrorView: false });
        return Promise.reject(error);
    }
};