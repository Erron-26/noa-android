/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-30
 * @module Features.Dashboard
 * @resource DashboardStore
 */

import { defineStore } from 'pinia';
import { logger } from '@utils/logger.js';
import dashboardService from '../services/dashboard.service';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        stats: [],
        metricData: {
            revenue: { mainValue: '$0', mainLabel: '', goal: 0, goalLabel: '', breakdown: [] },
            vehicles: { mainValue: '0', mainLabel: '', goal: 0, goalLabel: '', breakdown: [] },
            fuec: { mainValue: '0', mainLabel: '', goal: 0, goalLabel: '', breakdown: [] },
            profit: { mainValue: '$0', mainLabel: '', goal: 0, goalLabel: '', breakdown: [] },
        },
        recentContracts: [],
        activities: [],
        alerts: [],
        isLoading: false,
        conductorData: {
            conductor: { name: '', document: null, phone: null, email: '', license: null },
            kpis: {
                total_km: 0,
                vehicles_count: 0,
                inspections_count: 0,
                fuecs_count: 0,
                control_sheets_count: 0,
                service_delivery_count: 0,
            },
            quick_access: {},
            vehicles: [],
            recent_inspections: [],
            recent_fuecs: [],
        },
        conductorVehicles: [],
        conductorInspections: [],
        conductorFuecs: [],
    }),

    actions: {
        async fetchDashboardData(days = 30) {
            this.isLoading = true;
            try {
                const [summaryRes, activityRes, alertsRes] = await Promise.all([
                    dashboardService.getSummary(days),
                    dashboardService.getRecentActivity(),
                    dashboardService.getAlerts()
                ]);

                if (summaryRes?.success) {
                    this.stats = summaryRes.data?.stats ?? [];
                }

                if (activityRes?.success) {
                    this.recentContracts = activityRes.data?.contracts ?? [];
                    this.activities     = activityRes.data?.activities ?? [];
                }

                if (alertsRes?.success) {
                    this.alerts = alertsRes.data ?? [];
                }
            } catch (error) {
                logger.error('Error al cargar datos del dashboard', { message: error?.message ?? error });
            } finally {
                this.isLoading = false;
            }
        },

        async fetchConductorDashboardData(days = 30) {
            this.isLoading = true;
            try {
                const body = await dashboardService.getConductorSummary(days);

                if (body?.success && body?.data) {
                    const data = body.data;
                    this.conductorData = data;

                    const kpis = data.kpis || {};
                    this.stats = [
                        { label: 'Km Recorrido', value: Number(kpis.total_km || 0).toLocaleString() + ' km', current: kpis.total_km || 0, previous: 0, icon: 'fas fa-road', color: '#2c7be5', trend: 0 },
                        { label: 'Vehículos', value: String(kpis.vehicles_count || 0), current: kpis.vehicles_count || 0, previous: 0, icon: 'fas fa-truck-moving', color: '#27bcfd', trend: 0 },
                        { label: 'Inspecciones', value: String(kpis.inspections_count || 0), current: kpis.inspections_count || 0, previous: 0, icon: 'fas fa-clipboard-check', color: '#00d27a', trend: 0 },
                        { label: 'FUECs', value: String(kpis.fuecs_count || 0), current: kpis.fuecs_count || 0, previous: 0, icon: 'fas fa-file-contract', color: '#f5803e', trend: 0 },
                        { label: 'Planillas PCP', value: String((kpis.service_delivery_count || 0) + (kpis.control_sheets_count || 0)), current: (kpis.service_delivery_count || 0) + (kpis.control_sheets_count || 0), previous: 0, icon: 'fas fa-clipboard-list', color: '#9b59b6', trend: 0 },
                    ];

                    this.conductorVehicles = data.vehicles || [];
                    this.conductorInspections = data.recent_inspections || [];
                    this.conductorFuecs = data.recent_fuecs || [];
                    return data;
                }
            } catch (error) {
                logger.error('Error al cargar datos del conductor', { message: error?.message ?? error });
            } finally {
                this.isLoading = false;
            }
        },

        async fetchConductorData(days = 30) {
            return this.fetchConductorDashboardData(days);
        }
    }
});
