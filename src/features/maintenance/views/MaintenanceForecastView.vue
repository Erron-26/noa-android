<template>
    <div class="maintenance-forecast-view">
        <BasePageHeader title="Proyección de Mantenimiento Preventivo"
            description="Planificación inteligente basada en el kilometraje real de inspecciones y mantenimientos previos."
            icon="fad fa-calendar-check text-primary"
            :show-bg="true"
            :compact="true"
            :show-back="true"
            :breadcrumbs="[{ label: 'Mantenimiento', to: '/mantenimiento' }, { label: 'Proyección' }]"
            @back="goBack" />

        <div class="row g-3">
            <!-- Columna de Selección -->
            <div class="col-12 col-md-4">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-header bg-light border-bottom">
                        <h5 class="mb-0 text-primary">
                            <i class="fad fa-car me-2"></i>Selección de Vehículo
                        </h5>
                    </div>
                    <div class="card-body">
                        <label class="form-label text-muted small">Seleccione un vehículo de la flota *</label>
                        <select v-model="selectedVehicleUuid" class="form-select form-select-lg mb-3" @change="loadForecast">
                            <option value="" disabled>-- Elija un vehículo --</option>
                            <option v-for="veh in vehicles" :key="veh.uuid" :value="veh.uuid">
                                {{ veh.vehicle_license_plate }}
                            </option>
                        </select>
                        <button class="btn btn-primary w-100" :disabled="!selectedVehicleUuid || isLoading" @click="loadForecast">
                            <i class="fas" :class="isLoading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                            {{ isLoading ? 'Analizando datos...' : 'Proyectar Mantenimientos' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Columna de Resultados -->
            <div class="col-12 col-md-8">
                <div class="card shadow-sm border-0 h-100" v-if="forecastData">
                    <div class="card-header bg-light border-bottom d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 text-dark">
                            <i class="fad fa-tachometer-alt-fast me-2"></i>Estado Actual: {{ forecastData.plate }}
                        </h5>
                        <div class="text-end">
                            <span v-if="forecastData.mileage_sources" class="badge bg-light text-secondary me-2">
                                {{ forecastData.mileage_sources.length }} lectura(s)
                            </span>
                            <span class="badge bg-primary fs-6">{{ formatKm(forecastData.current_mileage) }}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div v-if="forecastData.mileage_sources" class="mb-4">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <span class="text-muted small fw-semibold text-uppercase">
                                    <i class="fad fa-road me-1"></i>Fuentes de Kilometraje
                                </span>
                            </div>
                            <div class="row g-2">
                                <div v-for="src in forecastData.mileage_sources" :key="src.tipo" class="col-12 col-md-4">
                                    <div class="border rounded-3 p-2 h-100"
                                        :class="src.is_current ? 'border border-2 border-primary bg-primary bg-opacity-10' : 'bg-white'">
                                        <div class="d-flex align-items-center justify-content-between">
                                            <span class="small fw-semibold" :class="src.is_current ? 'text-primary' : 'text-secondary'">
                                                <i class="fad me-1" :class="sourceIcon(src.tipo)"></i>{{ sourceLabel(src.tipo) }}
                                            </span>
                                            <i v-if="src.is_current" class="fad fa-check-circle text-primary" title="Kilometraje vigente"></i>
                                        </div>
                                        <div class="fw-bold fs-5" :class="src.is_current ? 'text-primary' : 'text-dark'">
                                            {{ formatKm(src.valor) }}
                                        </div>
                                        <div class="text-muted" style="font-size: 11px;">{{ src.fecha || 'Sin fecha' }}</div>
                                    </div>
                                </div>
                                <div v-if="forecastData.mileage_sources.length === 0" class="col-12">
                                    <div class="alert alert-light border text-muted small mb-0">
                                        No se encontraron lecturas de kilometraje registradas para este vehículo.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="forecastData.forecasts.length === 0" class="alert alert-info">
                            No hay planes de mantenimiento configurados.
                        </div>
                        
                        <div v-else class="forecast-list">
                            <div v-for="item in forecastData.forecasts" :key="item.plan_id" class="card mb-3 border-0 bg-light shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h5 class="mb-1 fw-bold text-dark">{{ item.plan_name }}</h5>
                                            <p class="text-muted small mb-0">{{ item.description }}</p>
                                        </div>
                                        <span class="badge" :class="getStatusBadgeClass(item.status)">
                                            {{ item.status }}
                                        </span>
                                    </div>
                                    
                                    <div class="row align-items-center mt-3">
                                        <div class="col-12 col-md-4 text-center text-md-start mb-2 mb-md-0">
                                            <span class="d-block text-muted small">Último Mantenimiento</span>
                                            <strong class="text-dark">{{ formatKm(item.last_maintenance_mileage) }}</strong>
                                            <span class="d-block text-muted" style="font-size: 11px;">
                                                {{ item.last_maintenance_date ? item.last_maintenance_date : 'Sin registro previo' }}
                                            </span>
                                        </div>
                                        
                                        <div class="col-12 col-md-4 text-center">
                                            <div class="progress" style="height: 10px;">
                                                <div class="progress-bar" :class="getProgressBarClass(item.status)"
                                                    role="progressbar" :style="{ width: item.progress_percentage + '%' }"
                                                    :aria-valuenow="item.progress_percentage" aria-valuemin="0" aria-valuemax="100">
                                                </div>
                                            </div>
                                            <span class="d-block mt-1 small fw-semibold" :class="getTextColorClass(item.status)">
                                                {{ item.km_remaining <= 0 ? '¡Vencido por ' + formatKm(Math.abs(item.km_remaining)) + '!' : 'Faltan ' + formatKm(item.km_remaining) }}
                                            </span>
                                        </div>
                                        
                                        <div class="col-12 col-md-4 text-center text-md-end mt-2 mt-md-0">
                                            <span class="d-block text-muted small">Próximo Hito (Meta)</span>
                                            <strong class="text-primary fs-5">{{ formatKm(item.next_due_mileage) }}</strong>
                                        </div>
                                    </div>
                                    
                                    <!-- Botón rápido para ir a registrar el mantenimiento -->
                                    <div class="text-end mt-3 border-top pt-2">
                                        <router-link
                                            :to="{
                                                path: '/mantenimiento/crear',
                                                query: {
                                                    vehicle: forecastData.vehicle_uuid,
                                                    type: 'PREVENTIVA',
                                                    mileage: forecastData.current_mileage,
                                                    description: `${item.plan_name}: ${item.description}`
                                                }
                                            }"
                                            class="btn btn-sm rounded-pill px-3"
                                            :class="item.status === 'VENCIDO' ? 'btn-outline-danger' : (item.status === 'PROXIMO' ? 'btn-outline-warning' : 'btn-outline-success')"
                                        >
                                            <i class="fad fa-tools me-1"></i>
                                            {{ item.status === 'VENCIDO' ? 'Registrar ahora' : (item.status === 'PROXIMO' ? 'Registrar preventivo' : 'Registrar anticipado') }}
                                        </router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card shadow-sm border-0 h-100 d-flex justify-content-center align-items-center bg-light" v-else>
                    <div class="text-center p-5 text-muted">
                        <i class="fad fa-car-mechanic fa-4x mb-3 text-secondary opacity-50"></i>
                        <h4>Proyección Inteligente</h4>
                        <p class="mb-0">Seleccione un vehículo de la lista y haga clic en "Proyectar Mantenimientos" para visualizar los hitos según su historial y kilometraje actual.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-30
 * @module Features.Maintenance
 * @resource PreventiveForecast
 */

import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useUserStore, usePermissionsStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import apiClient from '@/services/api/client.js';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const vehicles = ref([]);
const selectedVehicleUuid = ref('');
const isLoading = ref(false);
const forecastData = ref(null);

const goBack = () => router.push('/mantenimiento');

onMounted(async () => {
    try {
        const authStore = useAuthStore();
        const tenantId = authStore.currentTenant?.id;
        const instance = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;

        const permissionsStore = usePermissionsStore();
        const userStore = useUserStore();
        const isAfiliado = permissionsStore.hasAnyRole('AFILIADO', 'EMPLEADO', 'CONDUCTOR');
        const thirdPartyUuid = userStore.third_party_uuid;

        let params = {};
        if (tenantId) {
            params.company_uuid = tenantId;
            params.companyUuid = tenantId;
        }
        if (isAfiliado && thirdPartyUuid) {
            params['filter[third_party_uuid]'] = thirdPartyUuid;
            params.third_party_uuid = thirdPartyUuid;
        }

        const response = await instance.get('/fleet-management/vehicles/list', { params });
        vehicles.value = response.data.data || response.data;
        
        // Auto-seleccionar si viene de la URL
        if (route.query.vehicle) {
            selectedVehicleUuid.value = route.query.vehicle;
            await loadForecast();
        }
    } catch (error) {
        console.error('Error loading vehicles', error);
        Swal.fire('Error', 'No se pudieron cargar los vehículos.', 'error');
    }
});

watch(() => route.query.vehicle, async (newVal) => {
    if (newVal) {
        selectedVehicleUuid.value = newVal;
        await loadForecast();
    } else {
        selectedVehicleUuid.value = '';
        forecastData.value = null;
    }
});

const loadForecast = async () => {
    if (!selectedVehicleUuid.value) return;
    
    isLoading.value = true;
    try {
        const authStore = useAuthStore();
        const tenantId = authStore.currentTenant?.id;
        const instance = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;

        const response = await instance.get(`/fleet-management/vehicles/${selectedVehicleUuid.value}/maintenance-forecast`);
        forecastData.value = response.data.data;
    } catch (error) {
        console.error('Error loading forecast', error);
        forecastData.value = null;
        Swal.fire('Error', 'Ocurrió un error al calcular la proyección. Verifique que el vehículo exista.', 'error');
    } finally {
        isLoading.value = false;
    }
};

const formatKm = (value) => {
    return Number(value).toLocaleString('es-CO') + ' km';
};

const sourceIcon = (tipo) => {
    if (tipo === 'INSPECCION') return 'fa-shield';
    if (tipo === 'MANTENIMIENTO') return 'fa-tools';
    return 'fa-calendar-check';
};

const sourceLabel = (tipo) => {
    if (tipo === 'INSPECCION') return 'Inspecciones';
    if (tipo === 'MANTENIMIENTO') return 'Mantenimientos';
    return 'Planillas de Control';
};

const getStatusBadgeClass = (status) => {
    if (status === 'VENCIDO') return 'bg-danger';
    if (status === 'PROXIMO') return 'bg-warning text-dark';
    return 'bg-success';
};

const getProgressBarClass = (status) => {
    if (status === 'VENCIDO') return 'bg-danger progress-bar-striped progress-bar-animated';
    if (status === 'PROXIMO') return 'bg-warning text-dark progress-bar-striped';
    return 'bg-success';
};

const getTextColorClass = (status) => {
    if (status === 'VENCIDO') return 'text-danger';
    if (status === 'PROXIMO') return 'text-warning text-dark';
    return 'text-success';
};
</script>

<style scoped>
.maintenance-forecast-view {
    padding-bottom: 2rem;
}
.card {
    transition: all 0.2s ease-in-out;
}
.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}
</style>
