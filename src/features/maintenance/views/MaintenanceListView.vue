<template>
    <BasePageHeader title="Listado de Mantenimiento Vehicular" description="Gestión y registro del mantenimiento preventivo y correctivo de la flota."
        icon="fad fa-tools text-primary" :show-refresh="true" :show-create="true" :show-bg="true"
        :loading="isViewLoading || store.loading" :compact="true"
        :breadcrumbs="[{ label: 'Mantenimiento' }, { label: 'Listado' }]" @refresh="refreshTable" @create="goToCreate" />

    <!-- BARRA DE BÚSQUEDA -->
    <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="bg-holder d-none d-lg-block bg-card"
            style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
        <div class="card-body position-relative py-2">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 g-2 g-md-3">

                <!-- Izquierda: título + input -->
                <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1 g-2 g-md-3">
                    <h6 class="mb-0 fw-medium text-nowrap">Búsqueda</h6>
                    <div class="input-group input-group-sm w-100" style="max-width: 420px;">
                        <span class="input-group-text bg-light border-end-0">
                            <i class="fad fa-search text-muted" />
                        </span>
                        <input v-model="searchQuery" class="form-control form-control-sm border-start-0 shadow-none"
                            type="search" placeholder="Buscar..." aria-label="Buscar mantenimiento" @input="debouncedSearch" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
                            title="Limpiar búsqueda" @click="clearSearch">
                            <i class="fad fa-times" />
                        </button>
                    </div>
                </div>

                <!-- Derecha: contador -->
                <div v-if="!isViewLoading && !store.loading" class="text-muted text-lg-end text-nowrap">
                    <small>
                        <i class="fad fa-filter me-1" />
                        {{ store.pagination.totalItems }} resultado{{ store.pagination.totalItems !== 1 ? 's' : '' }}
                        <span v-if="store.search"> para "{{ store.search }}"</span>
                    </small>
                </div>

            </div>
        </div>
    </div>

    <!-- TABLA -->
    <div class="row gx-3 fade-in-up" style="animation-delay: 0.2s;">
        <div class="col-12 col-xxl-12">
            <div class="card border-0 shadow-sm">
                <div class="bg-holder d-none d-lg-block bg-card"
                    style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />

                <!-- SKELETON -->
                <div v-if="isViewLoading" class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <table class="table table-sm mb-0">
                            <thead>
                                <tr>
                                    <th v-for="w in ['30%', '20%', '20%', '15%', '15%']" :key="w"
                                        style="padding:12px 8px">
                                        <div class="skeleton-text" :style="`height:16px;width:${w}`" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="n in store.pagination.itemsPerPage" :key="`sk-${n}`">
                                    <td v-for="i in 4" :key="i">
                                        <div class="skeleton-text" style="height:18px;width:75%;" />
                                    </td>
                                    <td>
                                        <div class="d-flex justify-content-center gap-1">
                                            <div v-for="j in 3" :key="j" class="skeleton-icon"
                                                style="height:28px;width:28px;" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- DATATABLE (Paginación Server-Side) -->
                <div v-else class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <DataTable :value="groupedItems" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) *
                                store.pagination.itemsPerPage
                                " :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]" responsiveLayout="scroll"
                            tableStyle="min-width: 50rem" class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">
                            <Column field="vehicle.vehicle_license_plate" header="Vehículo" sortable style="min-width: 150px; width: 180px;">
                                <template #body="{ data }">
                                    <span class="text-dark fw-bold" style="font-size: 0.9rem;">{{ data.vehicle?.vehicle_license_plate || '-' }}</span>
                                    <span v-if="data.vehicle?.internal_number" class="text-muted small ms-1">
                                        ({{ data.vehicle.internal_number }})
                                    </span>
                                </template>
                            </Column>

                            <Column header="Mantenimientos Registrados">
                                <template #body="{ data }">
                                    <div class="row g-2 py-1">
                                        <div v-for="m in data.maintenances" :key="m.uuid" class="col-12 col-md-6">
                                            <div class="p-2 border rounded bg-light position-relative" style="border-color: #e9ecef !important;">
                                                <div class="d-flex justify-content-between align-items-center mb-1">
                                                    <span class="badge rounded-pill badge-subtle badge-subtle-info">
                                                        {{ m.maintenance_type }}
                                                    </span>
                                                    <span class="text-muted small fw-medium">
                                                        <i class="fad fa-calendar-alt me-1" />{{ dateUtils.format(m.maintenance_date) }}
                                                    </span>
                                                </div>
                                                <div class="text-dark small fw-semibold mb-1" style="font-size: 0.8rem;">{{ m.service_description }}</div>
                                                <div class="text-muted small d-flex flex-wrap gap-2 align-items-center mb-1" style="font-size: 0.725rem;">
                                                    <span><strong>KM:</strong> {{ m.mileage }} km</span>
                                                    <span>•</span>
                                                    <span><strong>Taller:</strong> {{ m.workshop_name || '-' }}</span>
                                                    <span>•</span>
                                                    <span>
                                                        <span class="badge rounded-pill py-0 px-1" :class="{
                                                            'bg-warning text-dark': m.status === 'Pendiente',
                                                            'bg-success': m.status === 'Finalizado',
                                                            'bg-danger': m.status === 'Anulado'
                                                        }">{{ m.status }}</span>
                                                    </span>
                                                </div>
                                                <div class="d-flex justify-content-end gap-1 mt-1">
                                                    <button v-if="can('maintenance.update')" class="btn btn-sm btn-falcon-default py-0 px-2"
                                                        type="button" title="Editar" :aria-label="`Editar ${m.service_description}`" @click="goToEdit(m.uuid)">
                                                        <i class="fad fa-edit text-warning" style="font-size:11px;" />
                                                    </button>
                                                    <button v-if="can('maintenance.delete')" class="btn btn-sm btn-falcon-default py-0 px-2"
                                                        type="button" title="Eliminar" :aria-label="`Eliminar ${m.service_description}`" @click="handleDelete(m)">
                                                        <i class="fad fa-trash text-danger" style="font-size:11px;" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Column>

                            <Column header="Acciones" class="text-center" style="min-width: 100px; width: 100px;">
                                <template #body="{ data }">
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button v-if="data.vehicle" class="btn btn-falcon-default"
                                            type="button" title="Descargar hoja de vida de mantenimiento (PDF)" :aria-label="`Descargar PDF de mantenimiento de ${data.vehicle?.vehicle_license_plate}`" @click="downloadMaintenanceHistoryPdf(data.vehicle)">
                                            <i class="fad fa-file-pdf text-danger" style="font-size:14px;" />
                                        </button>
                                    </div>
                                </template>
                            </Column>
                            <!-- Loading state -->
                            <template #loading>
                                <NoaTableSpinner message="Cargando datos..." />
                            </template>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMaintenanceStore } from '../store/maintenance.store.js';
import { usePermissionsStore } from '@store';
import VehiclesService from '@/features/vehicles/services/vehicles.service.js';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Swal from 'sweetalert2';
import dateUtils from '@/utils/date.js';

const router = useRouter();
const store = useMaintenanceStore();
const permissionsStore = usePermissionsStore();

const isViewLoading = ref(true);
const searchQuery = ref('');

const groupedItems = computed(() => {
    const groups = {};
    store.items.forEach(item => {
        const key = item.vehicle?.uuid || 'no-vehicle';
        if (!groups[key]) {
            groups[key] = {
                uuid: key,
                vehicle: item.vehicle,
                maintenances: [],
            };
        }
        groups[key].maintenances.push(item);
    });
    return Object.values(groups);
});

const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete, initTooltips, destroyTooltips } = useTableActions(store, router);

const can = (action) => permissionsStore.can(action);

const clearSearch = async () => { searchQuery.value = ''; await store.clearFilters(); };
const refreshTable = () => store.fetchItems();
const onPageChange = async ({ first, rows }) => {
    await store.setPage(Math.floor(first / rows) + 1);
};

const goToCreate = () => router.push('/mantenimiento/crear');
const goToEdit = (uuid) => router.push(`/mantenimiento/editar/${uuid}`);

const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar mantenimiento?',
    nameField: 'service_description',
});

const downloadMaintenanceHistoryPdf = async (vehicle) => {
    if (!vehicle?.uuid) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin vehículo',
            text: 'Este registro no trae el identificador del vehículo. Recargue el listado e intente de nuevo.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
        });
        return;
    }
    try {
        await VehiclesService.downloadMaintenanceHistory(vehicle.uuid);
    } catch (error) {
        console.error('Error al descargar la hoja de vida de mantenimiento:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error?.message || error.response?.data?.message || 'No se pudo descargar la hoja de vida de mantenimiento.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
        });
    }
};

onMounted(async () => {
    try {
        searchQuery.value = store.search;
        await store.fetchItems();
    } finally {
        isViewLoading.value = false;
        initTooltips();
    }
});

onUnmounted(() => destroyTooltips());
</script>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 15px, 0);
    }

    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

/* Tabla Estilo Profesional Falcon */
:deep(.professional-table .p-datatable-thead > tr > th) {
    padding: 0.625rem 0.75rem !important;
    font-size: 0.75rem !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #495057;
    border-bottom: 2px solid #e9ecef !important;
    background: #f8f9fa;
}

:deep(.professional-table .p-datatable-tbody > tr > td) {
    padding: 0.625rem 0.75rem !important;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.825rem !important;
    color: #212529;
    transition: background-color 150ms ease-in-out;
}

:deep(.professional-table .p-datatable-tbody > tr:hover) {
    background: #f8f9fa !important;
}

:deep(.professional-table .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}

/* Paginador */
:deep(.p-paginator) {
    padding: 0.5rem 1rem !important;
    background: #f8f9fa !important;
    border-top: 1px solid #e9ecef !important;
    border-radius: 0 0 0.75rem 0.75rem !important;
}

:deep(.p-paginator .p-paginator-page) {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.25rem !important;
    margin: 0 0.125rem;
    font-size: 0.75rem;
    transition: all 150ms ease-in-out;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
    background: #0d6efd !important;
    border-color: #0d6efd !important;
    color: #fff !important;
}

:deep(.p-paginator .p-paginator-page:not(.p-highlight):hover) {
    background: #e9ecef !important;
}

:deep(.p-paginator .p-paginator-current) {
    font-size: 0.75rem;
    color: #6c757d;
}

:deep(.p-paginator .p-dropdown) {
    min-height: auto !important;
    height: 26px !important;
    font-size: 0.75rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
    font-size: 0.725rem !important;
    padding: 0 0.25rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
    width: 18px !important;
}

/* Badges */
.badge-subtle {
    font-weight: 500;
    font-size: 0.75rem;
    padding: 0.35em 0.6em;
    transition: all 150ms ease-in-out;
    white-space: nowrap;
}

.badge-subtle-success {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.badge-subtle-secondary {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.2);
}

.badge-subtle-info {
    background: rgba(13, 202, 240, 0.1);
    color: #0dcaf0;
    border: 1px solid rgba(13, 202, 240, 0.2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, 0.2);
}

.badge-subtle:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Botones Acciones */
:deep(.btn-group .btn) {
    padding: 0.25rem 0.45rem;
    transition: all 150ms ease-in-out;
}

:deep(.btn-group .btn:hover) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    z-index: 1;
}
</style>