<template>
    <BasePageHeader :title="getDocumentTypeTitle(route.params.documentType)"
        description="Gestión del módulo en el sistema." icon="fad fa-clipboard-list text-primary" :show-refresh="true"
        :show-create="can('vehicle_documents.create')" :show-bg="true" :loading="isViewLoading || store.loading"
        :compact="true"
        :breadcrumbs="[{ label: 'Documentos' }, { label: getDocumentTypeTitle(route.params.documentType) }]"
        @refresh="refreshTable" @create="goToCreate" />

    <!-- BARRA DE BÚSQUEDA -->
    <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="bg-holder d-none d-lg-block bg-card"
            style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
        <div class="card-body position-relative py-2">
            <div
                class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 g-2 g-md-3">

                <!-- Izquierda: título + input -->
                <div
                    class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1 g-2 g-md-3">
                    <h6 class="mb-0 fw-medium text-nowrap">Búsqueda</h6>
                    <div class="input-group input-group-sm w-100" style="max-width: 420px;">
                        <span class="input-group-text bg-light border-end-0">
                            <i class="fad fa-search text-muted" />
                        </span>
                        <input v-model="searchQuery" class="form-control form-control-sm border-start-0 shadow-none"
                            type="search" placeholder="Buscar..." aria-label="Buscar documento de vehículo" @input="debouncedSearch" />
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
                        {{ store.pagination.totalItems }}
                        resultado{{ store.pagination.totalItems !== 1 ? 's' : '' }}
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
                        <DataTable :value="displayRows" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) *
                                store.pagination.itemsPerPage
                                " :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]"
                            responsiveLayout="scroll" tableStyle="min-width: 50rem"
                            class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">
                            <template v-if="isPolizaView">
                                <!-- Vista consolidada de Pólizas (RCC y RCE) -->
                                <Column field="vehicle.vehicle_license_plate" header="Placa" sortable class="text-nowrap">
                                    <template #body="{ data }">
                                        <span class="badge bg-200 text-dark font-monospace">{{
                                            data.vehicle?.vehicle_license_plate || '-' }}</span>
                                    </template>
                                </Column>

                                <Column field="issuing_entity" header="Entidad Prestadora" sortable>
                                    <template #body="{ data }">
                                        <span class="text-dark">{{ data.issuing_entity || '-' }}</span>
                                    </template>
                                </Column>

                                <Column field="expiry_date" header="Vencimiento" sortable>
                                    <template #body="{ data }">
                                        <span class="text-dark text-nowrap">{{ data.expiry_date ? String(data.expiry_date).split(' ')[0] : '-' }}</span>
                                    </template>
                                </Column>

                                <Column field="status" header="Estado" sortable class="text-center" style="width: 120px;">
                                    <template #body="{ data }">
                                        <span class="badge rounded-pill badge-subtle" :class="data.status === 'VIGENTE'
                                            ? 'badge-subtle-success'
                                            : 'badge-subtle-warning'
                                            ">
                                            {{ data.status }}
                                        </span>
                                    </template>
                                </Column>

                                <Column header="Acciones" class="text-center" style="min-width:170px; width: 170px;">
                                    <template #body="{ data }">
                                        <div class="btn-group btn-group-sm" role="group">
                                            <button class="btn btn-falcon-default" type="button" title="Ver pólizas" :aria-label="`Ver pólizas de ${data.vehicle?.vehicle_license_plate}`"
                                                @click="openPoliciesModal(data)">
                                                <i class="fad fa-eye text-primary" style="font-size:14px;" />
                                            </button>
                                            <button class="btn btn-falcon-default" type="button" title="Editar" :aria-label="`Editar pólizas de ${data.vehicle?.vehicle_license_plate}`"
                                                v-if="can('vehicle_documents.update')"
                                                @click="goToEdit(data.policies?.[0]?.uuid || data.uuid)">
                                                <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                            </button>
                                            <button class="btn btn-falcon-default" type="button" title="Eliminar" :aria-label="`Eliminar pólizas de ${data.vehicle?.vehicle_license_plate}`"
                                                v-if="can('vehicle_documents.delete')"
                                                @click="handleDeletePolicies(data)">
                                                <i class="fad fa-trash text-danger" style="font-size:14px;" />
                                            </button>
                                        </div>
                                    </template>
                                </Column>
                            </template>

                            <template v-else>
                                <!-- Vista individual (SOAT / RTM) -->
                                <Column field="policy_number" :header="getDocumentNumberHeader(route.params.documentType)"
                                    sortable class="text-nowrap font-monospace">
                                    <template #body="{ data }">
                                        <span class="text-dark">{{ data.policy_number || '-' }}</span>
                                    </template>
                                </Column>

                                <Column field="document_type" header="Tipo" sortable>
                                    <template #body="{ data }">
                                        <span class="badge rounded-pill badge-subtle badge-subtle-info">
                                            {{ data.document_type }}
                                        </span>
                                    </template>
                                </Column>

                                <Column field="vehicle.vehicle_license_plate" header="Vehículo" class="text-nowrap">
                                    <template #body="{ data }">
                                        <span class="badge bg-200 text-dark font-monospace">{{
                                            data.vehicle?.vehicle_license_plate || '-' }}</span>
                                    </template>
                                </Column>

                                <Column field="issuing_entity" header="Entidad" sortable>
                                    <template #body="{ data }">
                                        <span class="text-dark">{{ data.issuing_entity || '-' }}</span>
                                    </template>
                                </Column>

                                <Column field="expiry_date" header="Vencimiento" sortable>
                                    <template #body="{ data }">
                                        <span class="text-dark">{{ data.expiry_date ? String(data.expiry_date).split(' ')[0]
                                            : '-' }}</span>
                                    </template>
                                </Column>

                                <Column field="status" header="Estado" sortable class="text-center" style="width: 120px;">
                                    <template #body="{ data }">
                                        <span class="badge rounded-pill badge-subtle" :class="data.status === 'VIGENTE'
                                            ? 'badge-subtle-success'
                                            : 'badge-subtle-warning'
                                            ">
                                            {{ data.status }}
                                        </span>
                                    </template>
                                </Column>

                                <Column header="Acciones" class="text-center" style="min-width:140px; width: 140px;"
                                    v-if="can('vehicle_documents.update') || can('vehicle_documents.delete')">
                                    <template #body="{ data }">
                                        <div class="btn-group btn-group-sm" role="group">
                                            <button class="btn btn-falcon-default" type="button" title="Editar" :aria-label="`Editar ${data.policy_number}`"
                                                v-if="can('vehicle_documents.update')" @click="goToEdit(data.uuid)">
                                                <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                            </button>
                                            <button class="btn btn-falcon-default" type="button" title="Eliminar" :aria-label="`Eliminar ${data.policy_number}`"
                                                v-if="can('vehicle_documents.delete')" @click="handleDelete(data)">
                                                <i class="fad fa-trash text-danger" style="font-size:14px;" />
                                            </button>
                                        </div>
                                    </template>
                                </Column>
                            </template>
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

    <!-- MODAL: Detalle de pólizas RCC y RCE -->
    <Dialog v-model:visible="showPoliciesModal" :modal="true" :closable="true" :draggable="false"
        :style="{ width: '680px', maxWidth: '95vw' }" :breakpoints="{ '960px': '92vw', '640px': '95vw' }" :content-style="{ overflowY: 'auto' }" class="p-fluid policies-dialog" header="Detalle de Pólizas">
        <template v-if="selectedPolicies && selectedPolicies.vehicle">
            <div class="text-center mb-3">
                <span class="badge bg-200 text-dark font-monospace px-3 py-2" style="font-size: 1rem;">
                    <i class="fad fa-car me-2 text-primary"></i>
                    {{ selectedPolicies.vehicle.vehicle_license_plate || '-' }}
                </span>
            </div>
            <div class="row g-3">
                <div class="col-md-6" v-for="doc in selectedPolicies.policies" :key="doc.document_type">
                    <div class="border rounded-3 p-3 h-100"
                        :class="doc.document_type === 'RCC' ? 'border-primary' : 'border-success'">
                        <h6 class="fw-bold text-uppercase mb-3"
                            :class="doc.document_type === 'RCC' ? 'text-primary' : 'text-success'">
                            {{ doc.document_type }} - Póliza
                        </h6>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted small">Número de Póliza</span>
                            <span class="fw-medium font-monospace">{{ doc.policy_number || '-' }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted small">Entidad Prestadora</span>
                            <span class="fw-medium text-end">{{ doc.issuing_entity || '-' }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted small">Vencimiento</span>
                            <span class="fw-medium">{{ doc.expiry_date ? String(doc.expiry_date).split(' ')[0] : '-' }}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span class="text-muted small">Estado</span>
                            <span class="badge rounded-pill" :class="doc.status === 'VIGENTE'
                                ? 'badge-subtle-success'
                                : 'badge-subtle-warning'
                                ">
                                {{ doc.status }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <p class="text-muted mb-0">No hay información disponible.</p>
        </template>
        <template #footer>
            <button type="button" class="btn btn-secondary rounded-pill" @click="showPoliciesModal = false">Cerrar</button>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVehicleDocumentsStore } from '../store/vehicleDocuments.store.js';
import { usePermissionsStore } from '@store';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Swal from 'sweetalert2';
import vehicleDocumentsService from '../services/vehicleDocuments.service.js';

const route = useRoute();
const router = useRouter();
const store = useVehicleDocumentsStore();
const permissionsStore = usePermissionsStore();

const isViewLoading = ref(true);
const searchQuery = ref('');
const showPoliciesModal = ref(false);
const selectedPolicies = ref(null);

const isPolizaView = computed(() => route.params.documentType === 'poliza');

/**
 * Filas a mostrar en la tabla.
 * En la vista de pólizas el backend ya devuelve un registro por vehículo
 * con sus pólizas anidadas en la propiedad "policies".
 */
const displayRows = computed(() => store.items);

const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete, initTooltips, destroyTooltips } = useTableActions(store, router);

const can = (action) => permissionsStore.can(action);

const clearSearch = async () => { searchQuery.value = ''; await store.clearFilters(); };
const refreshTable = () => store.fetchItems();
const onPageChange = async ({ first, rows }) => {
    await store.setPage(Math.floor(first / rows) + 1);
};

const getDocumentTypeTitle = (documentType) => {
    switch (documentType) {
        case 'soat': return 'Póliza SOAT';
        case 'tecnomecanica': return 'Revisión Técnico Mecánica (RTM)';
        case 'poliza': return 'Pólizas de Responsabilidad Civil (RCC y RCE)';
        default: return 'Documentos';
    }
};

const getDocumentNumberHeader = (documentType) => {
    switch (documentType) {
        case 'soat': return 'Número de SOAT';
        case 'tecnomecanica': return 'Número de Tecnomecánica';
        case 'poliza': return 'Número de Póliza';
        default: return 'Número de Documento';
    }
};

const openPoliciesModal = (row) => {
    selectedPolicies.value = row;
    showPoliciesModal.value = true;
};

/**
 * Elimina todas las pólizas (RCC y RCE) de un vehículo, previa confirmación.
 */
const handleDeletePolicies = async (row) => {
    const plate = row.vehicle?.vehicle_license_plate || '';
    const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar pólizas?',
        text: `Se eliminarán las pólizas RCC y RCE del vehículo ${plate || 'seleccionado'}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
    });
    if (!isConfirmed) return;

    const uuids = (row.policies || []).map(p => p.uuid);
    try {
        if (uuids.length > 0) {
            await Promise.all(uuids.map(uuid => vehicleDocumentsService.delete(uuid)));
        }
        await Swal.fire({ icon: 'success', title: '¡Eliminado!', text: 'Las pólizas del vehículo fueron eliminadas.', timer: 1500, showConfirmButton: false });
        await store.fetchItems();
    } catch (error) {
        await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron eliminar las pólizas.' });
    }
};

const goToCreate = () => {
    const type = route.params.documentType;
    if (type) return router.push(`/vehiculos-documentos/${type}/crear`);
    return router.push('/vehiculos-documentos/crear');
};

const goToEdit = (uuid) => {
    const type = route.params.documentType;
    if (type) return router.push(`/vehiculos-documentos/${type}/editar/${uuid}`);
    return router.push(`/vehiculos-documentos/editar/${uuid}`);
};

const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar documento?',
    nameField: 'policy_number',
});

onMounted(async () => {
    try {
        searchQuery.value = store.search;
        const type = route.params.documentType;
        if (type === 'soat') store.documentTypeFilter = 'SOAT';
        else if (type === 'tecnomecanica') store.documentTypeFilter = 'RTM';
        else if (type === 'poliza') store.documentTypeFilter = 'RCE,RCC';
        else store.documentTypeFilter = null;
        await store.fetchItems();
    } finally {
        isViewLoading.value = false;
        initTooltips();
    }
});

watch(() => route.path, async () => {
    isViewLoading.value = true;
    const type = route.params.documentType;
    if (type === 'soat') store.documentTypeFilter = 'SOAT';
    else if (type === 'tecnomecanica') store.documentTypeFilter = 'RTM';
    else if (type === 'poliza') store.documentTypeFilter = 'RCE,RCC';
    else store.documentTypeFilter = null;

    await store.setPage(1);
    isViewLoading.value = false;
    initTooltips();
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