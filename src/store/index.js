/**
 * Store Configuration - Pinia
 * Centraliza la gestión de estado siguiendo la arquitectura modular.
 */

import { createPinia } from 'pinia';
import { logger } from '@utils/logger.js';
import { createLoggerPlugin } from '@store/plugins/logger.js';
import {
    authPersistencePlugin,
    permissionsPersistencePlugin,
    userProfilePersistencePlugin
} from '@store/plugins/persistence.js';
import { useAuthStore } from '@store/modules/auth.js';

// Instancia de Pinia
export const pinia = createPinia();

/**
 * Registro de plugins por ID de Store
 */
const PLUGIN_REGISTRY = {
    'auth': [authPersistencePlugin],
    'permissions': [permissionsPersistencePlugin],
    'user': [userProfilePersistencePlugin],
};

// 1. Inyección de plugins base
pinia.use(({ store }) => {
    const plugins = PLUGIN_REGISTRY[store.$id] || [];
    plugins.forEach(plugin => {
        if (typeof plugin === 'function') plugin({ store });
    });
});

// 2. Plugins de desarrollo (Solo en modo DEV)
if (import.meta.env.DEV) {
    pinia.use(createLoggerPlugin({
        logLevel: 'debug',
        maskFields: ['tokens', 'password', 'secret', 'accessToken', 'refreshToken'],
    }));
}

// 3. Global Event Bus (Solo cliente para logout)
if (typeof window !== 'undefined') {
    window.addEventListener('noa:logout', () => {
        useAuthStore().$reset();
        logger.warn('Logout global recibido: Estado de autenticación reseteado.');
    });
}

/**
 * Instalador para la App Vue
 */
export const installPinia = (app) => {
    app.use(pinia);
    logger.debug('Pinia instalado correctamente.');
};

// Re-exportación para acceso limpio desde los componentes
export { useAuthStore } from '@store/modules/auth.js';
export { useUserStore } from '@store/modules/user.js';
export { usePermissionsStore } from '@store/modules/permissions.js';
export { useConfigStore } from '@store/modules/config.js';

// Exportación de utilidades para configuración avanzada
export * from '@store/plugins/encryption.js';
export * from '@store/plugins/persistence.js';
export { createLoggerPlugin } from '@store/plugins/logger.js';

export default pinia;