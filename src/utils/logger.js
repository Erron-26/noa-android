/**
 * Logger avanzado con enmascaramiento de datos sensibles.
 * Ubicación: src/utils/logger.js
 */

// Configuración centralizada basada en entorno
const LOGGING_CONFIG = {
    maskFields: ['tokens', 'password', 'secret', 'accessToken', 'refreshToken', 'authorization'],
    minLevel: import.meta.env.MODE === 'production' ? 'warn' : 'debug'
};

const APP_NAME = import.meta.env.VITE_APP_NAME || "NOA";

/**
 * Máscara campos sensibles recursivamente
 */
function maskSensitive(data) {
    if (data == null) return data;
    const fieldsToMask = new Set(LOGGING_CONFIG.maskFields.map((f) => f.toLowerCase()));

    const traverse = (obj) => {
        if (Array.isArray(obj)) return obj.map(traverse);
        if (obj !== null && typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = fieldsToMask.has(key.toLowerCase()) ? "***" : traverse(value);
            }
            return result;
        }
        return obj;
    };
    return traverse(data);
}

/**
 * Formateo profesional de logs
 */
function formatLog(level, message, data, context) {
    const timestamp = new Date().toISOString();
    const tags = [context.module ? `[${context.module}]` : "", context.action ? `(${context.action})` : ""]
        .filter(Boolean).join(" ");

    let logStr = `${timestamp} ${level.toUpperCase()} ${APP_NAME} ${tags} - ${message}`;

    if (data != null) {
        logStr += ` | Data: ${JSON.stringify(maskSensitive(data), null, 2)}`;
    }

    return logStr;
}

class AdvancedLogger {
    constructor() {
        this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
    }

    _log(level, message, data = null, context = {}) {
        if (this.levels[level] < this.levels[LOGGING_CONFIG.minLevel]) return;

        const formatted = formatLog(level, message, data, context);
        console[level === 'debug' ? 'log' : level](formatted);
    }

    debug(msg, data, ctx) { this._log("debug", msg, data, ctx); }
    info(msg, data, ctx) { this._log("info", msg, data, ctx); }
    warn(msg, data, ctx) { this._log("warn", msg, data, ctx); }
    error(msg, data, ctx) { this._log("error", msg, data, ctx); }

    axiosError(error, context = {}) {
        this.error("Axios request failed", error?.response?.data || error.message, { ...context, module: "api" });
    }
}

export const logger = new AdvancedLogger();
export default logger;