<template>
    <!-- VISTA ESCRITORIO / TABLET -->
    <div class="d-none d-md-block">
        <BasePageHeader :title="'Listado de ' + 'Fuec'" description="Gestión del módulo en el sistema."
            icon="fad fa-clipboard-list text-primary" :show-refresh="true" :show-create="can('fuec.create')" :show-bg="true"
            :loading="isViewLoading || store.loading" :compact="true"
            :breadcrumbs="[{ label: 'Fuec' }, { label: 'Listado' }]" @refresh="refreshTable" @create="goToCreate" />

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
                            type="search" placeholder="Buscar..." aria-label="Buscar FUEC" @input="debouncedSearch" />
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
                                    <th v-for="w in ['15%', '15%', '15%', '15%', '15%', '10%', '15%']" :key="w"
                                        style="padding:12px 8px">
                                        <div class="skeleton-text" :style="`height:16px;width:${w}`" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="n in store.pagination.itemsPerPage" :key="`sk-${n}`">
                                    <td v-for="i in 6" :key="i">
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
                    <!-- Vista Escritorio -->
                    <div class="table-responsive scrollbar d-none d-md-block">
                        <DataTable :value="store.items" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) *
                                store.pagination.itemsPerPage
                                " :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]"
                            responsiveLayout="scroll" tableStyle="min-width: 50rem"
                            class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">
                            <Column field="number_fuec" header="N° FUEC" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark fw-medium">{{ data.number_fuec || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="request_number" header="N° Solicitud" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.request_number || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="contract_number_display" header="Contrato" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.contract_number_display || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="issue_date" header="Fecha Expedición" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ dateUtils.format(data.issue_date) }}</span>
                                </template>
                            </Column>

                            <Column field="origin_route" header="Origen" sortable>
                                <template #body="{ data }">
                                    <span class="text-truncate d-block" style="max-width: 150px;"
                                        :title="data.origin_route">{{ data.origin_route || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="destination_route" header="Destino" sortable>
                                <template #body="{ data }">
                                    <span class="text-truncate d-block" style="max-width: 150px;"
                                        :title="data.destination_route">{{ data.destination_route || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="status" header="Estado" sortable class="text-center" style="width: 120px;">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle" :class="{
                                        'badge-subtle-success': data.status === 'ACTIVO',
                                        'badge-subtle-warning': data.status === 'CERRADO',
                                        'badge-subtle-danger': data.status === 'ANULADO'
                                    }">
                                        <i :class="{
                                            'fad fa-check-circle me-1': data.status === 'ACTIVO',
                                            'fad fa-lock me-1': data.status === 'CERRADO',
                                            'fad fa-ban me-1': data.status === 'ANULADO'
                                        }" style="font-size:10px;" />
                                        {{ data.status }}
                                    </span>
                                </template>
                            </Column>

                            <Column header="Acciones" class="text-center" style="min-width:200px; width: 200px;">
                                <template #body="{ data }">
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button v-if="can('fuec.profile')" class="btn btn-falcon-default" type="button"
                                            title="Ver detalle" :aria-label="`Ver detalle de ${data.number_fuec}`" @click="goToDetail(data.uuid)">
                                            <i class="fad fa-eye text-primary" style="font-size:14px;" />
                                        </button>
                                        <button class="btn btn-falcon-default" type="button"
                                            title="Descargar PDF (Servidor)" :aria-label="`Descargar PDF de ${data.number_fuec}`" @click="downloadPdfServer(data)">
                                            <i class="fad fa-file-pdf text-danger" style="font-size:14px;" />
                                        </button>
                                        <button v-if="can('fuec.update')" class="btn btn-falcon-default" type="button"
                                            title="Editar" :aria-label="`Editar ${data.number_fuec}`" @click="goToEdit(data.uuid)">
                                            <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                        </button>
                                        <button v-if="can('fuec.delete')" class="btn btn-falcon-default" type="button"
                                            title="Eliminar" :aria-label="`Eliminar ${data.number_fuec}`" @click="handleDelete(data)">
                                            <i class="fad fa-trash text-danger" style="font-size:14px;" />
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
    </div>

    <!-- VISTA MÓVIL ANDROID CAPACITOR (Pantalla completa de borde a borde) -->
    <div class="d-md-none w-100 px-1 pt-1 pb-3 mobile-fuec-feed">
        <MobileSectionHeader
            title="Extractos de Contrato (FUEC)"
            icon-class="fas fa-file-contract"
            icon-bg="#22c55e"
            :badge="store.pagination.totalItems ? `${store.pagination.totalItems}` : '0'"
        >
            <template #action>
                <button v-if="can('fuec.create')" type="button" class="btn btn-primary btn-sm py-1 px-2 fs-11 rounded-3" @click="goToCreate">
                    <i class="fas fa-plus me-1" aria-hidden="true"></i> Nuevo
                </button>
            </template>
        </MobileSectionHeader>

        <div v-if="store.items && store.items.length > 0" class="d-flex flex-column w-100">
            <MobileCard
                v-for="item in store.items"
                :key="item.uuid"
                variant="green"
                :title="item.number_fuec ? `FUEC: ${item.number_fuec}` : 'FUEC PENDIENTE'"
                :subtitle="item.contract_number_display ? `Contrato: ${item.contract_number_display}` : 'Extracto Único de Contrato'"
                :badge="item.status"
                icon-class="fas fa-file-contract"
            >
                <div class="py-2 border-top border-bottom my-1">
                    <div class="d-flex align-items-center gap-2 text-dark fs-12 fw-semibold">
                        <i class="fad fa-map-marker-alt text-danger" aria-hidden="true"></i>
                        <span>{{ item.origin_route || 'Origen' }}</span>
                        <i class="fas fa-arrow-right text-muted fs-10" aria-hidden="true"></i>
                        <span>{{ item.destination_route || 'Destino' }}</span>
                    </div>
                    <div class="text-muted fs-11 mt-1">
                        <i class="far fa-calendar-alt me-1" aria-hidden="true"></i>Expedido: {{ dateUtils.format(item.issue_date) }}
                    </div>
                </div>

                <template #actions>
                    <button v-if="can('fuec.profile')" class="mc-btn-primary" type="button" @click="goToDetail(item.uuid)">
                        <i class="fad fa-file-check" aria-hidden="true"></i>
                        <span>Doc. en Ruta</span>
                    </button>
                    <button class="mc-btn-secondary" type="button" @click="downloadPdfServer(item)">
                        <i class="fad fa-file-pdf text-danger" aria-hidden="true"></i>
                        <span>PDF</span>
                    </button>
                    <button v-if="can('fuec.update')" class="mc-btn-secondary" type="button" @click="goToEdit(item.uuid)">
                        <i class="fad fa-edit text-warning" aria-hidden="true"></i>
                        <span>Editar</span>
                    </button>
                </template>
            </MobileCard>
        </div>

        <MobileEmptyState
            v-else
            emoji="📜"
            title="Sin FUECs asignados"
            description="No hay extractos únicos de contrato activos o asignados a tus vehículos."
            action-text="Crear FUEC"
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
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFuecStore } from '../store/fuec.store.js';
import { usePermissionsStore } from '@store';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import dateUtils from '@/utils/date.js';
import { logger } from '@/utils/logger.js';
import { toast } from '@/utils/toast.js';
import { aviso, mostrarCargando, cerrarDialogo } from '@/utils/dialogs.js';
import MobileCard from '@/components/mobile/MobileCard.vue';
import MobileSectionHeader from '@/components/mobile/MobileSectionHeader.vue';
import MobileEmptyState from '@/components/mobile/MobileEmptyState.vue';

const router = useRouter();
const store = useFuecStore();
const permissionsStore = usePermissionsStore();

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

const goToCreate = () => router.push('/extracto-de-contrato/crear');
const goToEdit = (uuid) => router.push(`/extracto-de-contrato/editar/${uuid}`);
const goToDetail = (uuid) => router.push(`/extracto-de-contrato/perfil/${uuid}`);

const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar FUEC?',
    nameField: 'number_fuec',
});

const downloadPdfServer = async (item) => {
    await mostrarCargando({
        titulo: 'Generando PDF...',
        texto: 'Por favor espere mientras el servidor prepara el documento.',
    });

    try {
        await store.downloadPdf(item.uuid);

        cerrarDialogo();
        toast('¡Listo!', 'El PDF del FUEC se ha generado y abierto en el navegador.', 'success');
    } catch (error) {
        logger.error('Error al generar PDF del servidor', { message: error?.message ?? error });
        cerrarDialogo();
        await aviso({
            titulo: 'Error de Generación',
            texto: error.response?.data?.message || 'No se pudo generar el documento PDF desde el servidor.',
            icono: 'error',
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

.badge-subtle-danger {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
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