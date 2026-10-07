<template>
    <!-- Vista móvil solo para conductor en Android nativo (mockup Capacitor) -->
    <ConductorDashboardMobileView
        v-if="esMovilAndroidConductor"
    />

    <!-- Vista especializada para el rol Conductor -->
    <ConductorDashboardView
        v-else-if="isConductorMode"
    />

    <!-- Vista de administración general -->
    <div v-else>
        <div class="row mb-3">
            <div class="col">
            <div class="card bg-100 shadow-none border">
                <div class="card-body py-3 d-flex flex-wrap justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="me-3 fs-3" :style="{ color: greetingIcon.color }">
                            <i :class="greetingIcon.icon"></i>
                        </div>
                        <div>
                            <p class="text-primary fs--1 mb-0">{{ greeting }}, {{ userName }}</p>
                            <h1 class="text-primary fw-bold mb-0 h4">Resumen Operativo <span class="text-info fw-medium">—
                                    {{ currentTenantName }}</span></h1>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2 mt-2 mt-md-0">
                        <label class="fs--1 text-700 fw-semi-bold me-2" for="f-periodo">Periodo:</label>
                        <select id="f-periodo" v-model="selectedPeriod" class="form-select form-select-sm" style="width: 150px"
                            @change="refreshData">
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 3 meses</option>
                            <option value="365">Este año</option>
                        </select>
                        <button class="btn btn-primary btn-sm ms-2" @click="refreshData" title="Actualizar datos" aria-label="Actualizar datos">
                            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- STATS OVERVIEW -->
    <div class="row mb-3 g-3">
        <div class="col-lg-12 col-xxl-12">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-lg-3 border-end-lg border-bottom border-bottom-lg-0 pb-3 pb-lg-0"
                            v-for="(stat, idx) in stats" :key="idx"
                            :class="{ 'border-end-lg-0': idx === stats.length - 1 }">
                            <div class="d-flex flex-between-center mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="icon-item icon-item-sm shadow-none me-2"
                                        :style="`background-color: ${stat.color}15; color: ${stat.color}`">
                                        <span class="fs-11" :class="stat.icon"></span>
                                    </div>
                                    <h2 class="mb-0 h6">{{ stat.label }}</h2>
                                </div>
                            </div>
                            <div class="d-flex">
                                <div class="d-flex">
                                    <p class="stat-value font-sans-serif lh-1 mb-1 fs-5 pe-2">{{ stat.value }}</p>
                                    <div class="d-flex flex-column">
                                        <span class="me-1 fas"
                                            :class="stat.trend >= 0 ? 'fa-caret-up text-success' : 'fa-caret-down text-danger'"></span>
                                        <p class="stat-trend mb-0 text-nowrap">{{ Math.abs(stat.trend) }}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ROW 2: FUEC Table & Alerts -->
    <div class="row g-3 mb-3" v-if="canViewRestrictedSections">
        <!-- RECENT FUEC (Deal table equivalent) -->
        <div class="col-xxl-8 col-lg-7">
            <div class="card h-100 border-0 shadow-sm">
                <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                    <h2 class="mb-0 h6">FUEC & Contratos Recientes</h2>
                    <button class="btn btn-link btn-sm text-600 text-decoration-none">Ver todo</button>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <table class="table table-sm table-hover fs--1 mb-0 overflow-hidden">
                            <caption class="visually-hidden">FUEC y contratos recientes</caption>
                            <thead class="bg-200 text-900">
                                <tr>
                                    <th scope="col" class="ps-3 border-bottom-0" style="min-width: 120px;">Referencia</th>
                                    <th scope="col" class="border-bottom-0">Cliente</th>
                                    <th scope="col" class="border-bottom-0 text-center">Vehículo</th>
                                    <th scope="col" class="border-bottom-0 text-center">Estado</th>
                                    <th scope="col" class="pe-3 border-bottom-0 text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="contracts.length === 0">
                                    <td colspan="5" class="text-center py-4 text-muted">
                                        No hay registros recientes para este periodo.
                                    </td>
                                </tr>
                                <tr v-for="item in contracts" :key="item.id" class="align-middle">
                                    <td class="ps-3 text-primary fw-semi-bold">
                                        #{{ (item.code ?? 'N/A').split('-').pop() }}
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="ms-2">
                                                <h3 class="mb-0 text-800 h6">{{ item.client }}</h3>
                                                <p class="mb-0 fs--2 text-500">{{ item.clientDoc }}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge badge-soft-secondary">{{ item.plate }}</span>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge rounded-pill"
                                            :class="item.statusClass.replace('status-', 'badge-soft-')">
                                            {{ item.statusText }}
                                        </span>
                                    </td>
                                    <td class="pe-3 text-end">
                                        <div class="dropdown font-sans-serif position-static">
                                            <button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal"
                                                type="button" data-bs-toggle="dropdown" data-boundary="window"
                                                aria-haspopup="true" aria-expanded="false" aria-label="Opciones del registro">
                                                <span class="fas fa-ellipsis-h fs--1" aria-hidden="true"></span>
                                            </button>
                                            <div class="dropdown-menu dropdown-menu-end border py-0">
                                                <div class="py-2">
                                                    <a class="dropdown-item" href="#!">Ver detalles</a>
                                                    <a class="dropdown-item text-danger" href="#!">Descargar PDF</a>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- ALERTS (To-Do List equivalent) -->
        <div class="col-xxl-4 col-lg-5">
            <div class="card h-100 border-0 shadow-sm">
                <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                    <h2 class="mb-0 h6">Alertas de Documentación</h2>
                    <span class="badge badge-soft-warning px-2 py-1">{{ alerts.length }} Pendientes</span>
                </div>
                <div class="card-body p-0 scrollbar" style="max-height: 400px; overflow-y: auto;">
                    <div class="list-group list-group-flush">
                        <div v-if="alerts.length === 0" class="list-group-item text-center text-success py-4">
                            <i class="fas fa-check-circle fs-3 mb-2"></i>
                            <p class="mb-0 fw-semi-bold">Toda la flota está al día.</p>
                        </div>
                        <div class="list-group-item py-3" v-for="alert in alerts" :key="alert.id">
                            <div class="d-flex">
                                <div class="fs-1 me-3"
                                    :class="alert.severity === 'high' ? 'text-danger' : 'text-warning'">
                                    <i class="fas"
                                        :class="alert.severity === 'high' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'"></i>
                                </div>
                                <div class="flex-1">
                                    <h3 class="mb-1 text-800 d-flex justify-content-between h6">
                                        {{ alert.title }}
                                        <span class="badge bg-200 text-600">{{ alert.tag }}</span>
                                    </h3>
                                    <p class="mb-0 fs--1 text-500">{{ alert.desc }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ROW 3: Map & Activity -->
    <div class="row g-3">
        <!-- LIVE GPS (Mapa de conductores en tiempo real) -->
        <div :class="canViewRestrictedSections ? 'col-xxl-8 col-lg-7' : 'col-12'">
            <div class="card h-100 border-0 shadow-sm overflow-hidden">
                <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                    <div class="d-flex align-items-center gap-2">
                        <h2 class="mb-0 fw-bold text-900 h6">Monitoreo de Flota en Vivo</h2>
                        <span class="badge rounded-pill bg-danger text-white">
                            <span class="pulse-indicator-dot bg-white me-1"></span>
                            LIVE
                        </span>
                    </div>
                    <span class="fs--2 text-500">
                        <i class="fas fa-user-shield me-1 text-success"></i>
                        {{ trackingStore.activeDrivers.length }} conductor{{ trackingStore.activeDrivers.length !== 1 ? 'es' : '' }} activo{{ trackingStore.activeDrivers.length !== 1 ? 's' : '' }}
                    </span>
                </div>
                <div class="card-body p-0 position-relative" style="min-height: 350px;">
                    <DriverMap :show-geofences="true" :interactive="true" @driver-selected="onDriverSelected" />
                </div>
                <div v-if="trackingStore.activeDrivers.length === 0 && !trackingStore.error" class="position-absolute top-50 start-50 translate-middle text-center z-1 w-100" style="pointer-events: none;">
                    <div class="d-inline-flex flex-column align-items-center bg-white rounded-3 shadow-sm px-4 py-3">
                        <i class="fas fa-satellite-dish fs-2 text-400 mb-2"></i>
                        <p class="mb-0 fw-bold text-700 fs--1">Sin conductores activos</p>
                        <p class="mb-0 text-500 fs--2">Ningún conductor tiene sesión de rastreo abierta</p>
                    </div>
                </div>
                <div v-if="trackingStore.error" class="position-absolute top-50 start-50 translate-middle text-center z-1 w-100" style="pointer-events: none;">
                    <div class="d-inline-flex flex-column align-items-center bg-white rounded-3 shadow-sm px-4 py-3 border border-danger-subtle">
                        <i class="fas fa-exclamation-triangle fs-2 text-danger mb-2"></i>
                        <p class="mb-0 fw-bold text-700 fs--1">Error al cargar conductores</p>
                        <p class="mb-0 text-500 fs--2">{{ trackingStore.error }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- PREVENTIVE MAINTENANCE -->
        <div class="col-xxl-4 col-lg-5" v-if="canViewRestrictedSections">
            <div class="card h-100 border-0 shadow-sm overflow-hidden">
                <div class="card-header bg-light d-flex justify-content-between align-items-center py-2.5 px-3 border-bottom border-200">
                    <div class="d-flex align-items-center">
                        <div class="icon-item icon-item-sm bg-soft-success text-success me-2 rounded-circle">
                            <span class="fas fa-tools fs--1"></span>
                        </div>
                        <h2 class="mb-0 text-900 fw-bold h6">Mantenimientos Preventivos</h2>
                    </div>
                    <span class="badge badge-soft-success rounded-pill px-2.5 py-1 fs--2 fw-semi-bold">
                        <i class="fas fa-check-circle me-1"></i>{{ activities.length }} Recientes
                    </span>
                </div>
                <div class="card-body p-3 scrollbar" style="max-height: 400px; overflow-y: auto;">
                    <div v-if="activities.length === 0" class="text-center text-muted py-5">
                        <div class="avatar avatar-3xl mx-auto mb-3 bg-soft-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                            <i class="fas fa-clipboard-check fs-2 text-400"></i>
                        </div>
                        <p class="fw-bold text-700 mb-1">Sin mantenimientos recientes</p>
                        <p class="fs--1 text-500 mb-0">No se han registrado mantenimientos en el período.</p>
                    </div>
                    <div v-else class="d-flex flex-column gap-2.5">
                        <div 
                            v-for="act in activities" 
                            :key="act.id" 
                            class="card maintenance-item border p-3 rounded-3 position-relative transition-all"
                        >
                            <!-- Header de la tarjeta: Placa + Tipo + Tiempo -->
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="license-plate-badge">
                                        <i class="fas fa-bus-alt me-1"></i>{{ act.plate || 'N/A' }}
                                    </span>
                                    <span class="badge bg-soft-success text-success rounded-pill fs--2 px-2 py-0.5">
                                        <i class="fas fa-shield-alt me-1"></i>Preventivo
                                    </span>
                                </div>
                                <span class="text-500 fs--2 fw-medium d-flex align-items-center" :title="act.dateFormatted">
                                    <i class="far fa-clock me-1 text-400"></i>{{ act.time }}
                                </span>
                            </div>

                            <!-- Conductor asignado -->
                            <div class="d-flex align-items-center mb-2 bg-light rounded-2 p-2 border-0">
                                <div class="driver-avatar-sm me-2">
                                    <i class="fas fa-user-circle fs-1 text-primary"></i>
                                </div>
                                <div class="lh-1 overflow-hidden">
                                    <span class="d-block text-500 fw-semi-bold uppercase-label">Conductor a Cargo</span>
                                    <span class="fs--1 text-800 fw-bold text-truncate d-block">{{ act.driver || 'No asignado' }}</span>
                                </div>
                            </div>

                            <!-- Descripción del servicio -->
                            <p class="mb-2 fs--1 text-700 lh-sm maintenance-desc">
                                {{ act.desc }}
                            </p>

                            <!-- Footer: Kilometraje y Taller -->
                            <div class="d-flex justify-content-between align-items-center pt-2 border-top border-200 fs--2 text-500">
                                <span v-if="act.mileage" class="fw-bold text-800">
                                    <i class="fas fa-tachometer-alt me-1 text-info"></i>{{ Number(act.mileage).toLocaleString() }} Km
                                </span>
                                <span v-if="act.workshop" class="text-truncate text-500" style="max-width: 170px;">
                                    <i class="fas fa-store me-1 text-400"></i>{{ act.workshop }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 6.0.0 (Strictly functional Falcon CRM Layout)
 * @created_at 2026-06-30
 * @module Features.Dashboard
 * @resource DashboardView
 */

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore, useUserStore, usePermissionsStore } from '@store';
import { useDashboardStore } from '../store/dashboard.store';
import { useTrackingStore } from '@/features/tracking/store/tracking.store';
import DriverMap from '@/features/tracking/components/DriverMap.vue';
import ConductorDashboardView from './ConductorDashboardView.vue';
import ConductorDashboardMobileView from './ConductorDashboardMobileView.vue';
import { useModoConductor } from '@/hooks/useModoConductor.js';
import { saludoPorHora } from '@/features/dashboard/utils/presentacionConductor.js';

const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const permissionsStore = usePermissionsStore();
const dashboardStore = useDashboardStore();
const trackingStore = useTrackingStore();

// ── CONTROL DE ROL Y MODO CONDUCTOR ─────────────────────────
const { modoConductor: isConductorMode, movilConductor: esMovilAndroidConductor } = useModoConductor();

const canViewRestrictedSections = computed(() => {
    return permissionsStore.hasRole('ADMINISTRADOR') || 
           permissionsStore.hasRole('ADMIN_EMPRESA') || 
           permissionsStore.hasRole('ADMINISTRADOR_EMPRESA') ||
           permissionsStore.hasRole('SUPERADMIN');
});

// ── ESTADO GENERAL ──────────────────────────────────────────
const greeting = computed(() => saludoPorHora());
const greetingIcon = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { icon: 'fas fa-sun', color: '#f5803e' }; // Naranja/Amarillo
    if (hour < 18) return { icon: 'fas fa-cloud-sun', color: '#27bcfd' }; // Azul Claro
    return { icon: 'fas fa-moon', color: '#2c7be5' }; // Azul Oscuro
});
const userName = computed(() => {
    return userStore.fullName || userStore.username || 'Usuario';
});
const currentTenantName = ref('Tenant Principal');
const selectedPeriod = ref('30');
const isRefreshing = computed(() => dashboardStore.isLoading);

// ── DATA REAL DEL BACKEND (Sin placeholders innecesarios) ───
const stats = computed(() => dashboardStore.stats.length > 0 ? dashboardStore.stats : [
    { label: 'Cargando...', value: '-', current: 0, previous: 0, icon: 'fas fa-ellipsis-h', color: '#9da9bb', trend: 0 },
    { label: 'Cargando...', value: '-', current: 0, previous: 0, icon: 'fas fa-ellipsis-h', color: '#9da9bb', trend: 0 },
    { label: 'Cargando...', value: '-', current: 0, previous: 0, icon: 'fas fa-ellipsis-h', color: '#9da9bb', trend: 0 },
    { label: 'Cargando...', value: '-', current: 0, previous: 0, icon: 'fas fa-ellipsis-h', color: '#9da9bb', trend: 0 }
]);

const alerts = computed(() => dashboardStore.alerts);
const contracts = computed(() => dashboardStore.recentContracts);
const activities = computed(() => dashboardStore.activities);

// ── GPS LOGIC (Monitoreo de conductores en tiempo real) ─────
let refreshInterval = null;

function startDriverTracking() {
    trackingStore.fetchActiveDrivers();
    trackingStore.fetchGeofences();
    refreshInterval = setInterval(() => {
        trackingStore.fetchActiveDrivers();
    }, 10000);
}

function stopDriverTracking() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

function onDriverSelected(driver) {
    trackingStore.selectDriver(driver);
}

// ── EVENTOS Y CICLO DE VIDA ─────────────────────────────────
const refreshData = async () => {
    await dashboardStore.fetchDashboardData(Number(selectedPeriod.value));
};

watch(selectedPeriod, () => {
    refreshData();
});

onMounted(() => {
    currentTenantName.value = authStore.currentTenant?.name || 'Falcon Transportes S.A.S.';
    if (!isConductorMode.value) {
        startDriverTracking();
        refreshData();
    }
});

watch(() => isConductorMode.value, (isConductor) => {
    if (!isConductor && stats.value.length === 0) {
        startDriverTracking();
        refreshData();
    }
});

onBeforeUnmount(() => {
    stopDriverTracking();
});
</script>

<style scoped>

/* ══════════════════════════════════════════
   FALCON CRM THEME (Only strictly useful info)
══════════════════════════════════════════ */
.falcon-dashboard {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: #f5f7fa;
    color: #344050;
    min-height: 100vh;
    padding: 1.5rem;
    font-size: 0.85rem;
}

/* Helpers */
.text-primary {
    color: #2c7be5 !important;
}

.text-success {
    color: #00d27a !important;
}

.text-danger {
    color: #e63757 !important;
}

.text-warning {
    color: #f5803e !important;
}

.text-muted {
    color: #9da9bb !important;
}

.text-800 {
    color: #344050 !important;
}

.text-600 {
    color: #5e6e82 !important;
}

.text-500 {
    color: #5e6e82 !important;
}

.text-400 {
    color: #5e6e82 !important;
}

.bg-light {
    background-color: #f9fafd !important;
}

.bg-200 {
    background-color: #edf2f9 !important;
}

.bg-white {
    background-color: #ffffff !important;
}

/* Punto pulsante del badge LIVE */
.pulse-indicator-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
    animation: pulse-ring-live 1.4s ease-out infinite;
}

@keyframes pulse-ring-live {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
    70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

.fw-bold {
    font-weight: 700 !important;
}

.fw-semi-bold {
    font-weight: 600 !important;
}

.fs--1 {
    font-size: 0.83333rem !important;
}

.fs--2 {
    font-size: 0.69444rem !important;
}

.fs-1 {
    font-size: 1.2rem !important;
}

.fs-3 {
    font-size: 1.75rem !important;
}

/* Valores e indicadores de las tarjetas de estadísticas.
   Se usa tamaño entero (no 11.11px de .fs-11) para evitar el renderizado
   borroso/pixelado y cifras tabulares para que no salten al cambiar. */
.stat-value {
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
}

.stat-trend {
    font-size: 12px;
    line-height: 1.1;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

/* Margins & Paddings */
.mb-0 {
    margin-bottom: 0 !important;
}

.mb-1 {
    margin-bottom: 0.25rem !important;
}

.mb-2 {
    margin-bottom: 0.5rem !important;
}

.mb-3 {
    margin-bottom: 1rem !important;
}

.mb-4 {
    margin-bottom: 1.5rem !important;
}

.mt-1 {
    margin-top: 0.25rem !important;
}

.me-1 {
    margin-right: 0.25rem !important;
}

.me-2 {
    margin-right: 0.5rem !important;
}

.me-3 {
    margin-right: 1rem !important;
}

.ms-2 {
    margin-left: 0.5rem !important;
}

.ps-3 {
    padding-left: 1rem !important;
}

.pe-3 {
    padding-right: 1rem !important;
}

.p-0 {
    padding: 0 !important;
}

.py-2 {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
}

.py-3 {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
}

.py-4 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
}

.px-2 {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
}

/* Flexbox */
.d-flex {
    display: flex !important;
}

.flex-wrap {
    flex-wrap: wrap !important;
}

.align-items-center {
    align-items: center !important;
}

.align-items-end {
    align-items: flex-end !important;
}

.justify-content-between {
    justify-content: space-between !important;
}

.text-center {
    text-align: center !important;
}

.text-end {
    text-align: right !important;
}

.flex-1 {
    flex: 1 !important;
}

.gap-2 {
    gap: 0.5rem !important;
}

.gap-3 {
    gap: 1rem !important;
}

.position-relative {
    position: relative !important;
}

.position-absolute {
    position: absolute !important;
}

.position-static {
    position: static !important;
}

.top-50 {
    top: 50% !important;
}

.start-50 {
    left: 50% !important;
}

.translate-middle {
    transform: translate(-50%, -50%) !important;
}

.z-index-1 {
    z-index: 1 !important;
}

.overflow-hidden {
    overflow: hidden !important;
}

/* Grid */
.row {
    display: flex;
    flex-wrap: wrap;
    margin-top: -1rem;
    margin-left: -1rem;
}

.row>* {
    padding-top: 1rem;
    padding-left: 1rem;
}

.g-3 {
    margin-top: -1rem;
    margin-left: -1rem;
}

.g-3>* {
    padding-top: 1rem;
    padding-left: 1rem;
}

.col-sm-6 {
    width: 50%;
}

.col-md-3 {
    width: 25%;
}

.col-lg-7 {
    width: 58.33333%;
}

.col-lg-5 {
    width: 41.66667%;
}

@media (min-width: 1400px) {
    .col-xxl-8 {
        width: 66.66667%;
    }

    .col-xxl-4 {
        width: 33.33333%;
    }
}

@media (max-width: 991px) {

    .col-lg-7,
    .col-lg-5,
    .col-xxl-8,
    .col-xxl-4 {
        width: 100%;
    }

    .col-sm-6 {
        width: 50%;
    }
}

@media (max-width: 575px) {
    .col-sm-6 {
        width: 100%;
    }
}

/* Forms & Selects */
.input-group {
    display: flex;
    align-items: center;
}

.input-group-text {
    padding: 0.375rem 0.5rem;
}

.form-select {
    display: block;
    width: 100%;
    padding: 0.375rem 2.25rem 0.375rem 0.75rem;
    font-size: 0.9rem;
    font-weight: 400;
    line-height: 1.5;
    color: #344050;
    background-color: #fff;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23344050' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    border: 1px solid #d8e2ef;
    border-radius: 0.25rem;
    appearance: none;
    outline: none;
}

.form-select-sm {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    font-size: 0.83333rem;
}

.shadow-none {
    box-shadow: none !important;
}

.border-0 {
    border: 0 !important;
}

.border {
    border: 1px solid #d8e2ef !important;
}

.rounded {
    border-radius: 0.25rem !important;
}

.rounded-pill {
    border-radius: 50rem !important;
}

.bg-transparent {
    background-color: transparent !important;
}

/* Buttons */
.btn {
    display: inline-block;
    font-weight: 600;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 0.9rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease-in-out;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.83333rem;
}

.btn-primary {
    color: #fff;
    background-color: #2c7be5;
    border-color: #2c7be5;
}

.btn-primary:hover:not(:disabled) {
    background-color: #1a68d1;
    border-color: #1862c6;
}

.btn-primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.btn-link {
    color: #2c7be5;
    text-decoration: none;
    background: transparent;
}

.btn-link:hover {
    text-decoration: underline;
}

.btn-reveal {
    color: #5e6e82;
    background: transparent;
    border: none;
}

.btn-reveal:hover {
    color: #344050;
}

.text-decoration-none {
    text-decoration: none !important;
}

/* Cards */
.card {
    background-color: #fff;
    background-clip: border-box;
    border: 1px solid #d8e2ef;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
}

.shadow-sm {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.card-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #edf2f9;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
}

.card-header h6 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #344050;
}

.card-body {
    flex: 1 1 auto;
    padding: 1.25rem;
}

.h-100 {
    height: 100% !important;
}

/* Icons */
.icon-circle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
}

/* Badges */
.badge {
    display: inline-block;
    padding: 0.35em 0.65em;
    font-size: 0.75em;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25rem;
}

.badge-soft-success {
    background-color: #ccf6e4;
    color: #006e40;
}

.badge-soft-danger {
    background-color: #fad7dd;
    color: #962438;
}

.badge-soft-warning {
    background-color: #fdf0e6;
    color: #8a441f;
}

.badge-soft-secondary {
    background-color: #e3e6ed;
    color: #5e6e82;
}

/* Tables */
.table-responsive {
    overflow-x: auto;
}

.table {
    width: 100%;
    margin-bottom: 1rem;
    color: #5e6e82;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 0.5rem;
    border-bottom: 1px solid #edf2f9;
}

.table thead th {
    vertical-align: bottom;
    border-bottom: 2px solid #edf2f9;
    font-weight: 600;
    text-transform: uppercase;
}

.table-hover tbody tr:hover {
    background-color: #f9fafd;
}

.align-middle {
    vertical-align: middle !important;
}

.border-bottom-0 {
    border-bottom: 0 !important;
}

/* Dropdown */
.dropdown-menu {
    display: none;
    position: absolute;
    z-index: 1000;
    background-color: #fff;
    border: 1px solid #d8e2ef;
    border-radius: 0.25rem;
    padding: 0.5rem 0;
    min-width: 10rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-item {
    display: block;
    width: 100%;
    padding: 0.25rem 1rem;
    clear: both;
    font-weight: 400;
    color: #344050;
    text-align: inherit;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
    text-decoration: none;
}

.dropdown-item:hover {
    color: #1e2022;
    text-decoration: none;
    background-color: #f9fafd;
}

/* Lists */
.list-group {
    display: flex;
    flex-direction: column;
    padding-left: 0;
    margin-bottom: 0;
}

.list-group-item {
    position: relative;
    display: block;
    padding: 0.75rem 1.25rem;
    background-color: #fff;
    border-bottom: 1px solid #edf2f9;
}

.list-group-item:last-child {
    border-bottom: 0;
}

/* Scrollbar styling */
.scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
    background-color: #d8e2ef;
    border-radius: 10px;
}

.scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: #9da9bb;
}

/* Timeline */
.timeline-basic {
    position: relative;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-top: 1rem;
}

.timeline-basic::before {
    content: '';
    position: absolute;
    top: 1rem;
    bottom: 0;
    left: 24px;
    width: 2px;
    background-color: #edf2f9;
}

.timeline-item {
    position: relative;
    margin-bottom: 1.5rem;
}

.timeline-item:last-child {
    margin-bottom: 0;
}

.timeline-icon {
    position: absolute;
    left: -1.8rem;
    background: #fff;
    padding: 2px 0;
    margin-left: -3px;
}

/* Animations */
@keyframes pulse {
    0% {
        transform: scale(0.95);
        opacity: 0.7;
    }

    50% {
        transform: scale(1.1);
        opacity: 1;
    }

    100% {
        transform: scale(0.95);
        opacity: 0.7;
    }
}

.pulse-anim {
    animation: pulse 2s infinite;
}

::v-deep(.falcon-map-marker .marker-dot) {
    width: 12px;
    height: 12px;
    background-color: #2c7be5;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(44, 123, 229, 0.2);
}

/* ══════════════════════════════════════════
   ESTILOS PARA MANTENIMIENTOS PREVENTIVOS
══════════════════════════════════════════ */
.license-plate-badge {
    background: #fff8e1;
    color: #856404;
    border: 1px solid #ffeeba;
    font-weight: 700;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    letter-spacing: 0.5px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.maintenance-item {
    background-color: #ffffff;
    border-color: #edf2f9 !important;
    border-left: 3px solid #00d27a !important;
    transition: all 0.2s ease-in-out;
}

.maintenance-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0, 210, 122, 0.12) !important;
    border-color: #cbd0d8 !important;
}

.bg-soft-success {
    background-color: rgba(0, 210, 122, 0.12) !important;
}

.bg-soft-secondary {
    background-color: rgba(157, 169, 187, 0.15) !important;
}

.gap-2\.5 {
    gap: 0.65rem !important;
}

.px-2\.5 {
    padding-left: 0.65rem !important;
    padding-right: 0.65rem !important;
}

.py-2\.5 {
    padding-top: 0.65rem !important;
    padding-bottom: 0.65rem !important;
}

.uppercase-label {
    font-size: 0.65rem !important;
    letter-spacing: 0.4px;
    text-transform: uppercase;
}

.maintenance-desc {
    color: #4d5868;
    line-height: 1.35;
}

.transition-all {
    transition: all 0.2s ease-in-out !important;
}
</style>