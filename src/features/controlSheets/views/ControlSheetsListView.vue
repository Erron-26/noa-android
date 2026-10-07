<template>
    <!-- VISTA ESCRITORIO / TABLET -->
    <div class="d-none d-md-block">
        <BasePageHeader title="Listado de Planillas de Control" description="Gestión de planillas de control vehicular en el sistema."
            icon="fad fa-clipboard-list text-primary" :show-refresh="true" :show-create="true" :show-bg="true"
            :loading="isViewLoading || store.loading" :compact="true"
            :breadcrumbs="[{ label: 'Planillas de Control' }, { label: 'Listado' }]" @refresh="refreshTable" @create="goToCreate"
            :canCreate="can('control_sheets.create')" />

    <!-- BARRA DE BÃšSQUEDA -->
    <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="bg-holder d-none d-lg-block bg-card"
            style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
        <div class="card-body position-relative py-2">
            <div
                class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 g-2 g-md-3">
                <div
                    class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1 g-2 g-md-3">
                    <h6 class="mb-0 fw-medium text-nowrap">BÃºsqueda</h6>
                    <div class="input-group input-group-sm w-100" style="max-width: 420px;">
                        <span class="input-group-text bg-light border-end-0">
                            <i class="fad fa-search text-muted" />
                        </span>
                        <input v-model="searchQuery" class="form-control form-control-sm border-start-0 shadow-none"
                            type="search" placeholder="Buscar por empresa o placa..." aria-label="Buscar hoja de control" @input="debouncedSearch" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
                            title="Limpiar bÃºsqueda" @click="clearSearch">
                            <i class="fad fa-times" />
                        </button>
                    </div>
                </div>

                <div v-if="!isViewLoading && !store.loading" class="text-muted text-lg-end text-nowrap">
                    <small>
                        <i class="fad fa-filter me-1" />
                        {{ store.pagination.totalItems }} resultado{{ store.pagination.totalItems !== 1 ? "s" : "" }}
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
                                    <th v-for="w in (isSuperAdmin ? ['25%', '20%', '20%', '15%', '10%', '10%'] : ['30%', '20%', '20%', '15%', '15%'])" :key="w"
                                        style="padding:12px 8px">
                                        <div class="skeleton-text" :style="`height:16px;width:${w}`" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="n in store.pagination.itemsPerPage" :key="`sk-${n}`">
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="skeleton-icon" style="height:32px;width:32px;" />
                                            <div class="flex-grow-1">
                                                <div class="skeleton-text mb-1" style="height:18px;width:80%;" />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="skeleton-text" style="height:18px;width:75%;" />
                                    </td>
                                    <td>
                                        <div class="skeleton-text" style="height:18px;width:75%;" />
                                    </td>
                                    <td>
                                        <div class="skeleton-badge mx-auto" style="height:24px;width:60px;" />
                                    </td>
                                    <td>
                                        <div class="d-flex justify-content-center gap-1">
                                            <div v-for="j in 2" :key="j" class="skeleton-icon"
                                                style="height:28px;width:28px;" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-else class="card-body p-0">
                    <!-- Vista Escritorio -->
                    <div class="table-responsive scrollbar d-none d-md-block">
                        <DataTable :value="store.items" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems"
                            :first="(store.pagination.currentPage - 1) * store.pagination.itemsPerPage"
                            :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]" responsiveLayout="scroll"
                            tableStyle="min-width: 50rem" class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">

                            <Column v-if="isSuperAdmin" header="Empresa / VehÃ­culo" sortable style="min-width: 180px;">
                                <template #body="{ data }">
                                    <div class="d-flex flex-column">
                                        <span class="text-dark fw-medium text-truncate" style="max-width: 180px;" :title="data.company?.business_name">
                                            <i class="fad fa-building text-muted me-1"></i>{{ data.company?.business_name || 'â€”' }}
                                        </span>
                                        <span class="text-muted mt-1 fw-bold" style="font-size: 0.85rem;">
                                            <i class="fad fa-car-side text-muted me-1"></i>{{ data.vehicle?.vehicle_license_plate || 'â€”' }}
                                        </span>
                                    </div>
                                </template>
                            </Column>

                            <Column v-else header="VehÃ­culo" sortable style="min-width: 140px;">
                                <template #body="{ data }">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="fad fa-car-side text-muted"></i>
                                        <span class="text-dark fw-bold">{{ data.vehicle?.vehicle_license_plate || 'â€”' }}</span>
                                    </div>
                                </template>
                            </Column>

                            <Column field="observations" header="Observaciones" sortable>
                                <template #body="{ data }">
                                    <span class="text-truncate d-inline-block"
                                        style="max-width: 200px; font-size:0.85rem;" :title="data.observations">
                                        {{ data.observations || 'â€”' }}
                                    </span>
                                </template>
                            </Column>

                            <Column header="Documentos" class="text-center" style="width: 120px;">
                                <template #body="{ data }">
                                    <div v-if="data.media && data.media.length > 0"
                                        class="d-flex flex-wrap justify-content-center gap-1">
                                        <a v-for="file in data.media" :key="file.uuid"
                                            :href="file.original_url || file.url" target="_blank"
                                            class="btn btn-sm btn-falcon-default px-2 py-1"
                                            :title="file.file_name || file.name"
                                            v-tooltip="file.file_name || file.name">
                                            <i class="fad fa-file-pdf text-danger" style="font-size: 13px;"></i>
                                        </a>
                                    </div>
                                    <span v-else class="text-muted small">â€”</span>
                                </template>
                            </Column>

                            <Column field="is_active" header="Estado" sortable class="text-center"
                                style="width: 110px;">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle"
                                        :class="data.is_active ? 'badge-subtle-success' : 'badge-subtle-warning'"
                                        style="font-size:0.8rem;padding:0.4em 0.75em;">
                                        <i :class="data.is_active ? 'fad fa-check-circle me-1' : 'fad fa-circle me-1'"
                                            style="font-size:10px;" />
                                        {{ data.is_active ? "Activo" : "Inactivo" }}
                                    </span>
                                </template>
                            </Column>

                            <Column header="Acciones" class="text-center" style="width: 80px;"
                                v-if="can('control_sheets.update') || can('control_sheets.delete')">
                                <template #body="{ data }">
                                    <!-- El botón Imprimir llamaba a handlePrint(), que no existe:
                                         los PDFs ya se abren desde la columna Documentos. -->
                                    <button v-if="permissions.edit" class="btn btn-falcon-default btn-sm px-2" type="button" title="Editar" @click="goToEdit(data.uuid)">
                                        <i class="fad fa-edit text-warning"></i>
                                    </button>
                                    <button v-if="permissions.delete" class="btn btn-falcon-default btn-sm px-2" type="button" title="Eliminar" @click="handleDelete(data)">
                                        <i class="fad fa-trash text-danger"></i>
                                    </button>
                                </template>
                            </Column>

                            <!-- Empty state -->
                            <template #empty>
                                <div class="text-center py-5">
                                    <i class="fad fa-clipboard-list fs-1 text-muted opacity-50 mb-3 d-block" />
                                    <h6 class="text-muted mb-1 fw-medium">No hay registros encontrados</h6>
                                    <p class="text-muted small mb-3">Comienza creando tu primera planilla de control.</p>
                                    <button v-if="can('control_sheets.create')" class="btn btn-primary btn-sm"
                                        @click="goToCreate">
                                        <i class="fad fa-plus me-1" />Nuevo Registro
                                    </button>
                                </div>
                            </template>

                            <!-- Loading state -->
                            <template #loading>
                                <NoaTableSpinner message="Cargando registros..." />
                            </template>

                            <!-- Footer -->
                            <template #footer>
                                <div
                                    class="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 px-3 bg-light rounded-bottom">
                                    <small class="text-muted" style="font-size:0.85rem;">
                                        <i class="fad fa-list me-1" /> Mostrando <strong>{{ store.items.length
                                            }}</strong> de <strong>{{ store.pagination.totalItems }}</strong> registros
                                    </small>
                                    <small class="text-muted" style="font-size:0.85rem;">
                                        <i class="fad fa-pages me-1" /> PÃ¡gina <strong>{{ store.pagination.currentPage
                                            }}</strong> de <strong>{{ store.pagination.totalPages }}</strong>
                                    </small>
                                </div>
                            </template>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>

    <!-- VISTA MÓVIL ANDROID CAPACITOR (Pantalla completa de borde a borde) -->
    <div class="d-md-none w-100 px-1 pt-1 pb-3 mobile-control-feed">
        <MobileSectionHeader
            title="Planillas de Control"
            icon-class="fas fa-clipboard-list"
            icon-bg="#f97316"
            :badge="store.pagination.totalItems ? `${store.pagination.totalItems}` : '0'"
        >
            <template #action>
                <button v-if="can('control_sheets.create')" type="button" class="btn btn-primary btn-sm py-1 px-2 fs-11 rounded-3" @click="goToCreate">
                    <i class="fas fa-plus me-1" aria-hidden="true"></i> Nueva
                </button>
            </template>
        </MobileSectionHeader>

        <div v-if="store.items && store.items.length > 0" class="d-flex flex-column w-100">
            <MobileCard
                v-for="item in store.items"
                :key="item.uuid"
                variant="orange"
                :title="item.vehicle?.vehicle_license_plate || 'SIN PLACA'"
                :subtitle="item.company?.business_name || 'Control de Servicio'"
                :badge="item.is_active ? 'Activo' : 'Inactivo'"
                icon-class="fas fa-clipboard-list"
            >
                <div v-if="item.observations" class="py-2 text-muted fs-11 border-top border-bottom my-1">
                    <i class="far fa-comment-alt me-1" aria-hidden="true"></i>{{ item.observations }}
                </div>

                <template #actions>
                    <template v-if="item.media && item.media.length > 0">
                        <a v-for="file in item.media" :key="file.uuid"
                            :href="file.original_url || file.url" target="_blank"
                            class="mc-btn-primary">
                            <i class="fad fa-file-pdf" aria-hidden="true"></i>
                            <span>PDF</span>
                        </a>
                    </template>
                    <button class="mc-btn-secondary" type="button" @click="handlePrint(item)">
                        <i class="fad fa-print text-primary" aria-hidden="true"></i>
                        <span>Imprimir</span>
                    </button>
                    <button v-if="permissions.edit" class="mc-btn-secondary" type="button" @click="goToEdit(item.uuid)">
                        <i class="fad fa-edit text-warning" aria-hidden="true"></i>
                        <span>Editar</span>
                    </button>
                </template>
            </MobileCard>
        </div>

        <MobileEmptyState
            v-else
            emoji="📋"
            title="Sin planillas de control"
            description="No hay planillas de control registradas o asignadas para este filtro."
            action-text="Nueva Planilla"
            action-icon="fas fa-plus"
            @action="goToCreate"
        />

        <!-- Paginación Móvil Táctil -->
        <div v-if="store.pagination.totalPages > 1" class="d-flex justify-content-between align-items-center mt-2 pt-1 px-1">
            <button class="btn btn-light btn-sm border px-3 rounded-pill fs-11" :disabled="store.pagination.currentPage <= 1"
                @click="onPageChange({ page: store.pagination.currentPage - 2, rows: store.pagination.itemsPerPage })">
                <i class="fas fa-chevron-left me-1" aria-hidden="true"></i> Anterior
            </button>
            <span class="fs-11 text-muted fw-semibold">
                {{ store.pagination.currentPage }} / {{ store.pagination.totalPages }}
            </span>
            <button class="btn btn-light btn-sm border px-3 rounded-pill fs-11" :disabled="store.pagination.currentPage >= store.pagination.totalPages"
                @click="onPageChange({ page: store.pagination.currentPage, rows: store.pagination.itemsPerPage })">
                Siguiente <i class="fas fa-chevron-right ms-1" aria-hidden="true"></i>
            </button>
        </div>
    </div>
    <!-- MENÃš PRIMEVUE (Evita recortes en tablas/tarjetas) -->
    
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-29
 * @module {Features.Fleet}
 * @resource {ControlSheet}
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useControlSheetsStore } from '../store/controlSheets.store.js';
import { usePermissionsStore } from '@store';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MobileCard from '@/components/mobile/MobileCard.vue';
import MobileSectionHeader from '@/components/mobile/MobileSectionHeader.vue';
import MobileEmptyState from '@/components/mobile/MobileEmptyState.vue';

const router = useRouter();
const store = useControlSheetsStore();
const permissionsStore = usePermissionsStore();

const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);

const isViewLoading = ref(true);
const searchQuery = ref('');



const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete, initTooltips, destroyTooltips } = useTableActions(store, router);

const can = (action) => permissionsStore.can(action);

const clearSearch = async () => { searchQuery.value = ''; await store.clearFilters(); };
const refreshTable = () => store.fetchItems();
const onPageChange = async ({ first, rows }) => {
    await store.setPage(Math.floor(first / rows) + 1);
};

const goToCreate = () => router.push('/planillas-de-control-de-servicios/crear');
const goToEdit = (uuid) => router.push(`/planillas-de-control-de-servicios/editar/${uuid}`);

const handleDelete = (item) => confirmDelete(item, {
    title: 'Â¿Eliminar registro?',
    html: `<p class="mb-2">Â¿EstÃ¡s seguro de eliminar la planilla del vehÃ­culo <strong>"${item.vehicle?.vehicle_license_plate || 'este registro'}"</strong>?</p>
           <div class="alert alert-warning small mb-0 mt-2">
               <i class="fad fa-exclamation-triangle me-1"></i>
               Esta acciÃ³n no se puede deshacer.
           </div>`
});

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
:root {
    --table-header-bg: #f8f9fa;
    --table-hover-bg: #f8f9fa;
    --table-border: #e9ecef;
    --transition-fast: 150ms ease-in-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

.card {
    border-radius: 0.75rem !important;
    transition: box-shadow var(--transition-fast);
}

.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, .15) !important;
}

/* Avatar */
.avatar-placeholder {
    width: 36px;
    height: 36px;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
    user-select: none;
    transition: transform var(--transition-fast);
}

:deep(.professional-table .p-datatable-tbody > tr:hover) .avatar-placeholder {
    transform: scale(1.05);
}

/* Tabla */
:deep(.professional-table .p-datatable-thead > tr > th) {
    padding: 0.625rem 0.75rem !important;
    font-size: 0.75rem !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #495057;
    border-bottom: 2px solid var(--table-border) !important;
    background: var(--table-header-bg);
}

:deep(.professional-table .p-datatable-tbody > tr > td) {
    padding: 0.625rem 0.75rem !important;
    vertical-align: middle;
    border-bottom: 1px solid var(--table-border);
    font-size: 0.825rem !important;
    color: #212529;
    transition: background-color var(--transition-fast);
}

:deep(.professional-table .p-datatable-tbody > tr:hover) {
    background: var(--table-hover-bg) !important;
}

:deep(.professional-table .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}

/* Badges */
.badge-subtle {
    font-weight: 500;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.badge-subtle-success {
    background: rgba(25, 135, 84, .1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, .2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, .1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, .2);
}

.badge-subtle:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
}

/* Botones */
:deep(.btn-group .btn) {
    padding: 0.3rem 0.5rem;
    transition: all var(--transition-fast);
}

:deep(.btn-group .btn:hover) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, .12);
    z-index: 1;
}

:deep(.btn-group .btn + .btn) {
    margin-left: -1px;
}

/* Paginador */
:deep(.p-paginator) {
    padding: 0.5rem 1rem !important;
    background: var(--table-header-bg) !important;
    border-top: 1px solid var(--table-border) !important;
    border-radius: 0 0 0.75rem 0.75rem !important;
}

:deep(.p-paginator .p-paginator-page) {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.25rem !important;
    margin: 0 0.125rem;
    font-size: 0.8rem;
    transition: all var(--transition-fast);
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
    font-size: 0.8rem;
    color: #6c757d;
}

:deep(.p-paginator .p-dropdown) {
    min-height: auto !important;
    height: 28px !important;
    font-size: 0.75rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
    font-size: 0.75rem !important;
    padding: 0 0.25rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
    width: 20px !important;
}

:deep(.p-paginator .p-dropdown-panel .p-dropdown-items li) {
    font-size: 0.8rem !important;
    padding: 0.25rem 0.75rem !important;
}

/* Input bÃºsqueda */
.input-group:focus-within {
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, .15);
    border-radius: 0.25rem;
}

.input-group .form-control:focus {
    box-shadow: none;
}

.bg-opacity-10 {
    --bs-bg-opacity: 0.1;
}

/* Scrollbar */
.scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.scrollbar::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb {
    background: #adb5bd;
    border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6c757d;
}
</style>



