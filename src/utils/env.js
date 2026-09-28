/**
 * Validador de variables de entorno.
 * Ubicación: src/utils/env.js
 */

const envVars = import.meta.env;

const required = (key) => {
    const value = envVars[`VITE_${key}`];
    if (!value) throw new Error(`Falta variable requerida: VITE_${key}`);
    return value;
};

const optional = (key, fallback) => envVars[`VITE_${key}`] ?? fallback;
const num = (key, fallback) => parseInt(envVars[`VITE_${key}`] || fallback, 10);
const bool = (key, fallback) => envVars[`VITE_${key}`] === "true";

export const env = Object.freeze({
    NODE_ENV: envVars.MODE || "development",
    APP_NAME: optional("APP_NAME", "NOA Transportes"),
    APP_VERSION: optional("APP_VERSION", "1.1.6"),
    API_BASE_URL: required("API_BASE_URL"),
    API_NATIVE_URL: optional("API_NATIVE_URL", "https://api.transportessinbarreras.com/api/v1/"),
    API_TIMEOUT: num("API_TIMEOUT", 30000),
    AUTH_TOKEN_KEY: optional("AUTH_TOKEN_KEY", "auth_token"),
    ENCRYPTION_KEY: optional("ENCRYPTION_KEY", "secreto_seguro"),
    // Feature Flags
    FEATURES: {
        AUTH: bool("FEATURE_AUTH_ENABLED", true),
        DASHBOARD: bool("FEATURE_DASHBOARD_ENABLED", true),
    }
});

export default env;