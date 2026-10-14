/**
 * Cliente API centralizado (Axios)
 * Ubicación: src/services/api/client.js
 */

import axios from "axios";
import env from "@utils/env.js";
import { Capacitor } from "@capacitor/core";
import { requestInterceptor, responseInterceptor } from "@services/api/interceptors.js";

const getBaseUrl = () => {
    if (Capacitor.isNativePlatform()) {
        if (env.API_NATIVE_URL) return env.API_NATIVE_URL;
        if (env.API_BASE_URL && /^https?:\/\//i.test(env.API_BASE_URL)) {
            return env.API_BASE_URL;
        }
        return "https://api.transportessinbarreras.com/api/v1/";
    }
    return env.API_BASE_URL;
};

const DEFAULT_CONFIG = {
    baseURL: getBaseUrl(),
    timeout: env.API_TIMEOUT || 30000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-App-Version": env.APP_VERSION,
    }
};

const instances = { global: null, tenants: new Map() };

const apiClient = {
    /**
     * Instancia global para servicios generales
     */
    get global() {
        if (!instances.global) instances.global = this._createInstance();
        return instances.global;
    },

    /**
     * Instancia dinámica para tenants (Multi-tenant)
     */
    forTenant(tenantId) {
        if (!tenantId) throw new Error("Tenant ID requerido");

        if (!instances.tenants.has(tenantId)) {
            instances.tenants.set(tenantId, this._createInstance({
                headers: { "X-Company-UUID": tenantId }
            }));
        }
        return instances.tenants.get(tenantId);
    },

    /**
     * Factoría de instancias con interceptores unificados
     */
    _createInstance(extraConfig = {}) {
        const instance = axios.create({
            ...DEFAULT_CONFIG,
            ...extraConfig,
            headers: { ...DEFAULT_CONFIG.headers, ...extraConfig.headers }
        });

        // Aplicar interceptores unificados (Request/Auth + Response/Error)
        instance.interceptors.request.use(requestInterceptor);
        instance.interceptors.response.use(
            responseInterceptor.success,
            responseInterceptor.error
        );

        return instance;
    }
};

export default apiClient;