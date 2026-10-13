/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-30
 * @module Features.Dashboard
 * @resource DashboardService
 */

import { BaseService } from '@services/api/base.service.js';

class DashboardService extends BaseService {
    constructor() {
        super({
            resourcePath: 'dashboard',
            metadata: { module: 'dashboard', service: 'dashboard' },
        });
    }

    /**
     * Obtiene el resumen de métricas del dashboard
     * @param {number} days Rango de días a consultar
     * @returns {Promise<Object>} Cuerpo de la API ({ success, message, data })
     */
    async getSummary(days = 30) {
        return this._request('GET', '/summary', { params: { days } });
    }

    /**
     * Obtiene la actividad reciente (FUECs, Contratos, Timeline)
     * @returns {Promise<Object>} Cuerpo de la API ({ success, message, data })
     */
    async getRecentActivity() {
        return this._request('GET', '/recent-activity');
    }

    /**
     * Obtiene las alertas de documentos por vencer
     * @returns {Promise<Object>} Cuerpo de la API ({ success, message, data })
     */
    async getAlerts() {
        return this._request('GET', '/alerts');
    }

    /**
     * Obtiene el resumen del dashboard para el rol CONDUCTOR
     * @param {number} days Rango de días a consultar
     * @returns {Promise<Object>} Cuerpo de la API ({ success, message, data })
     */
    async getConductorSummary(days = 30) {
        return this._request('GET', '/conductor-summary', { params: { days } });
    }
}

export default new DashboardService();
