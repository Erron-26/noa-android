<template>
    <!-- VISTA ESCRITORIO / TABLET -->
    <div class="d-none d-md-block">
        <BasePageHeader title="Hojas de Control de Servicio"
            description="Gestión de las planillas de control de prestación de servicios."
            icon="fad fa-clipboard-list text-primary" :show-bg="true" :loading="isViewLoading || store.loading"
            :compact="true" :breadcrumbs="[{ label: 'Hojas de Control' }, { label: 'Listado' }]">
        <template #actions>
            <!-- REFRESH -->
            <button class="btn btn-falcon-default btn-sm px-3 me-2" type="button" title="Actualizar"
                @click="refreshTable">
                <i class="fad fa-sync"></i>
            </button>

            <!-- REPORTES: un solo diálogo con rango, vehículo, conductor, día y mensual en PDF y Excel -->
            <button v-if="permissions.pdf" class="btn btn-info btn-sm px-3 fw-medium shadow-sm me-2" type="button" title="Reportes solo días cerrados"
                @click="showReportsDialog = true">
                <i class="fad fa-file-chart-column me-1" aria-hidden="true"></i> <span class="d-none d-sm-inline">Reportes</span>
            </button>

            <!-- CREATE -->
            <button v-if="permissionsStore.can('service_delivery_control_sheets.create') && !permissionsStore.hasRole('CONDUCTOR')"
                class="btn btn-primary btn-sm px-3 me-2" type="button" title="Nuevo registro" @click="goToCreate">
                <i class="fad fa-plus me-1"></i> <span class="d-none d-sm-inline">Nuevo</span>
            </button>

            <!-- CUSTOM: Control de Servicios -->
            <button class="btn btn-success btn-sm px-3 fw-medium shadow-sm" type="button" title="Control de Servicios (En Ruta)"
                @click="goToInternalControl">
                <i class="fad fa-steering-wheel me-1"></i> <span class="d-none d-sm-inline">Control en Ruta</span>
            </button>
        </template>
    </BasePageHeader>

    <!-- BARRA DE BÃƒÅ¡SQUEDA -->
    <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="bg-holder d-none d-lg-block bg-card"
            style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
        <div class="card-body position-relative py-2">
            <div
                class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-2">
                <!-- Izquierda: tÃƒÂ­tulo + input -->
                <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                    <h6 class="mb-0 fw-medium text-nowrap">Búsqueda Rápida</h6>
                    <div class="input-group input-group-sm w-100" style="max-width: 420px;">
                        <span class="input-group-text bg-light border-end-0">
                            <i class="fad fa-search text-muted" />
                        </span>
                        <input v-model="searchQuery" class="form-control form-control-sm border-start-0 shadow-none"
                            type="search" placeholder="Buscar por ruta, vehículo, conductor..."
                            aria-label="Buscar hoja de control" @input="debouncedSearch" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
                            title="Limpiar" @click="clearSearch">
                            <i class="fad fa-times" />
                        </button>
                    </div>
                </div>
                <!-- Centro: filtro proyecto -->
                <div class="d-flex align-items-center gap-2 w-100" style="max-width: 340px;">
                    <i class="fad fa-briefcase text-muted" />
                    <select v-model="projectFilter" class="form-select form-select-sm" @change="onProjectFilterChange">
                        <option value="">Todos los proyectos</option>
                        <option v-for="p in store.projects" :key="p.uuid" :value="p.uuid">{{ p.project_name }}</option>
                    </select>
                </div>
                <!-- Derecha: contador + filtro cerradas -->
                <div class="d-flex align-items-center gap-2">
                    <div class="form-check form-switch mb-0" title="Mostrar solo planillas cerradas">
                        <input id="filtroSoloCerradas" v-model="soloCerradas" class="form-check-input" type="checkbox" @change="onSoloCerradasChange" />
                        <label class="form-check-label small text-muted" for="filtroSoloCerradas">Solo cerradas</label>
                    </div>
                    <div v-if="!isViewLoading && !store.loading" class="text-muted text-nowrap">
                        <small>
                            <i class="fad fa-filter me-1" />
                            {{ store.pagination.totalItems }} resultado{{
                                store.pagination.totalItems !== 1 ? "s" : ""
                            }}
                            <span v-if="store.search"> para "{{ store.search }}"</span>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- TABLA -->
    <div class="row gx-3 fade-in-up" style="animation-delay: 0.2s;">
        <div class="col-12">
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
                    <!-- Vista Escritorio -->
                    <div class="table-responsive scrollbar d-none d-md-block">
                        <DataTable :value="store.items" v-model:expandedRows="expandedRows" dataKey="uuid" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) *
                                store.pagination.itemsPerPage
                                " :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]"
                            responsiveLayout="scroll" tableStyle="min-width: 50rem"
                            class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">

                            <Column expander style="width: 3rem" />

                            <Column header="Proyecto / Tipo" style="min-width: 160px;">
                                <template #body="{ data }">
                                    <div class="d-flex flex-column">
                                        <span class="text-dark fw-medium text-truncate" style="max-width: 180px;" :title="data.project?.project_name">{{ data.project?.project_name || 'Sin Proyecto' }}</span>
                                        <span class="badge rounded-pill badge-subtle-secondary mt-1 align-self-start" style="font-size: 0.65rem;">
                                            {{ tipoLabel(data.type_of_control_sheet) }}
                                        </span>
                                    </div>
                                </template>
                            </Column>

                            <Column header="Vehículo / Conductor" style="min-width: 170px;">
                                <template #body="{ data }">
                                    <div class="d-flex flex-column">
                                        <span class="text-dark fw-bold"><i class="fad fa-car-side text-muted me-1"></i>{{ data.vehicle_license_plate || '-' }}</span>
                                        <small class="text-muted text-truncate" style="max-width: 170px;" :title="data.driver_name || data.official_name_and_surname">
                                            <i class="fad fa-user-tie text-muted me-1"></i>{{ data.driver_name || data.official_name_and_surname || 'Sin Conductor' }}
                                        </small>
                                    </div>
                                </template>
                            </Column>

                            <Column header="Recorridos" style="min-width: 180px;">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle-info">
                                        <i class="fad fa-route me-1"></i> {{ recorridosCount(data) }} recorrido{{ recorridosCount(data) !== 1 ? 's' : '' }}
                                    </span>
                                    <div class="small text-muted mt-1" style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="recorridosTexto(data)">
                                        {{ recorridosTexto(data) }}
                                    </div>
                                </template>
                            </Column>

                            <Column header="Fechas" sortable style="min-width: 140px;">
                                <template #body="{ data }">
                                    <div class="d-flex flex-column text-dark" style="font-size: 0.85rem;">
                                        <span class="fw-medium"><i class="fad fa-calendar-alt text-muted me-1"></i> {{ formatRango(data.start_date || data.service_date) || '-' }}</span>
                                        <span v-if="(data.end_date || data.service_date) && (data.end_date || data.service_date) !== (data.start_date || data.service_date)" class="text-muted mt-1">
                                            <i class="fad fa-arrow-down text-muted mx-1" style="font-size: 0.7rem;"></i>{{ formatRango(data.end_date || data.service_date) }}
                                        </span>
                                    </div>
                                </template>
                            </Column>

                            <Column field="control_status" header="Estado" sortable class="text-center"
                                style="width: 120px;">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle" :class="estadoBadge(data)">
                                        <i :class="estadoIcono(data)" style="font-size:10px;" />
                                        {{ estadoLabel(data) }}
                                    </span>
                                </template>
                            </Column>

                            <Column header="Acciones" class="text-center" style="width: 110px;">
                                <template #body="{ data }">
                                    <div class="d-flex align-items-center justify-content-center gap-1">
                                        <!-- La vista de detalle no existe (sin ruta): se eliminó el botón muerto. -->
                                        <button v-if="!isServicioCerrado(data)" class="btn btn-falcon-default btn-sm px-2" type="button"
                                            title="Continuar servicio" @click="goToControl(data.uuid)">
                                            <i class="fad fa-steering-wheel text-success"></i>
                                        </button>

                                        <!-- Más acciones (Menu) -->
                                        <!-- Secondary actions -->
<button v-if="permissions.pdf" class="btn btn-falcon-default btn-sm px-2" type="button" title="Descargar PDF Diario" @click="downloadParentPdf(data)">
<i class="fad fa-file-pdf text-danger"></i>
</button>
<button v-if="canShareCoordinatorLink && !isServicioCerrado(data) && !data.has_coordinator_signature" class="btn btn-falcon-default btn-sm px-2" type="button" title="Firma Coordinador" @click="shareCoordinatorLink(data.uuid)">
<i class="fad fa-share-alt text-primary"></i>
</button>
<button v-if="permissions.edit && !isServicioCerrado(data)" class="btn btn-falcon-default btn-sm px-2" type="button" title="Editar" @click="goToEdit(data.uuid)">
<i class="fad fa-edit text-warning"></i>
</button>
<button v-if="permissions.delete && !isServicioCerrado(data)" class="btn btn-falcon-default btn-sm px-2" type="button" title="Eliminar" @click="handleDelete(data)">
<i class="fad fa-trash text-danger"></i>
</button>
                                    </div>
                                </template>
                            </Column>
                            <!-- Loading state -->
                            <template #loading>
                                <NoaTableSpinner message="Cargando datos..." />
                            </template>
                            <template #expansion="{ data }">
                                <div class="p-2">
                                    <div class="fw-semibold mb-2" style="font-size: 0.85rem;">
                                        Días del servicio ({{ diasHijos(data).length }})
                                    </div>
                                    <div v-if="diasHijos(data).length" class="table-responsive">
                                        <table class="table table-sm mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Estado</th>
                                                    <th>Recorridos</th>
                                                    <th class="text-center">PDF del día</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="dia in diasHijos(data)" :key="dia.uuid">
                                                    <td>{{ formatRango(dia.service_date) || '-' }}</td>
                                                    <td>
                                                        <span class="badge rounded-pill"
                                                            :class="(dia.is_active == 1 || dia.is_active === true) ? 'badge-subtle-success' : 'badge-subtle-secondary'">
                                                            {{ (dia.is_active == 1 || dia.is_active === true) ? 'Abierto' : 'Cerrado' }}
                                                        </span>
                                                    </td>
                                                    <td>{{ Array.isArray(dia.routes) ? dia.routes.length : 0 }}</td>
                                                    <td class="text-center">
                                                        <button v-if="permissions.pdf" class="btn btn-falcon-default btn-sm p-0 px-1"
                                                            type="button" title="Descargar PDF de este día"
                                                            :aria-label="`Descargar PDF del día ${formatRango(dia.service_date)}`"
                                                            :disabled="downloadingDaily === dia.uuid"
                                                            @click="downloadDaily(dia.uuid)">
                                                            <span v-if="downloadingDaily === dia.uuid"
                                                                class="spinner-border spinner-border-sm text-danger"
                                                                style="width: 14px; height: 14px;"></span>
                                                            <i v-else class="fad fa-file-pdf text-danger"
                                                                style="font-size:14px;" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <small v-else class="text-muted">{{ soloCerradas ? 'Sin fechas cerradas en este servicio.' : 'Servicio de un solo día: usa el botón PDF de la fila.' }}</small>
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
    <div class="d-md-none w-100 px-1 pt-1 pb-3 mobile-service-feed">
        <MobileSectionHeader
            title="Control de Servicio"
            icon-class="fas fa-route"
            icon-bg="#14b8a6"
            :badge="store.pagination.totalItems ? `${store.pagination.totalItems}` : '0'"
        >
            <template #action>
                <button v-if="permissions.create" type="button" class="btn btn-primary btn-sm py-1 px-2 fs-11 rounded-3" @click="goToCreate">
                    <i class="fas fa-plus me-1" aria-hidden="true"></i> Nuevo
                </button>
            </template>
        </MobileSectionHeader>

        <div v-if="store.items && store.items.length > 0" class="d-flex flex-column w-100">
            <MobileCard
                v-for="item in store.items"
                :key="item.uuid"
                variant="teal"
                :title="item.vehicle_license_plate || 'SIN PLACA'"
                :subtitle="item.project?.project_name || 'Servicio de Transporte'"
                :badge="tipoLabel(item.type_of_control_sheet)"
                icon-class="fas fa-route"
            >
                <div class="d-flex justify-content-between align-items-center py-2 border-top border-bottom my-1">
                    <div>
                        <small class="text-muted d-block fs-10">Conductor</small>
                        <span class="fw-semibold text-dark fs-12">
                            {{ item.driver_name || item.official_name_and_surname || 'Sin conductor' }}
                        </span>
                    </div>
                    <div class="text-end">
                        <small class="text-muted d-block fs-10">Recorridos</small>
                        <span class="badge bg-light text-primary border fw-bold fs-11">
                            <i class="fad fa-road me-1" aria-hidden="true"></i>{{ recorridosCount(item) }}
                        </span>
                    </div>
                </div>

                <template #actions>
                    <button class="mc-btn-primary" type="button" @click="goToInternalControl">
                        <i class="fad fa-steering-wheel" aria-hidden="true"></i>
                        <span>Control en Ruta</span>
                    </button>
                    <button class="mc-btn-secondary" type="button" @click="downloadParentPdf(item)">
                        <i class="fad fa-file-pdf text-danger" aria-hidden="true"></i>
                        <span>PDF</span>
                    </button>
                    <button v-if="permissions.edit && !isServicioCerrado(item)" class="mc-btn-secondary" type="button" @click="goToEdit(item.uuid)">
                        <i class="fad fa-edit text-warning" aria-hidden="true"></i>
                        <span>Editar</span>
                    </button>
                </template>
            </MobileCard>
        </div>

        <MobileEmptyState
            v-else
            emoji="🚌"
            title="Sin hojas de servicio"
            description="No hay registros de control de servicio para los filtros seleccionados."
            action-text="Control en Ruta"
            action-icon="fad fa-steering-wheel"
            @action="goToInternalControl"
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
    <!-- DIÁLOGO ÚNICO DE REPORTES: rango, vehículo, conductor, día y mensual en PDF y Excel (solo cerradas) -->
    <ServiceReportsDialog v-model:visible="showReportsDialog" :vehicles="reportVehicles" :drivers="reportDrivers" />
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-19
 * @module {Features.Fleet}
 * @resource {ServiceDeliveryControlSheet}
 */
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useServiceDeliveryControlSheetStore } from '../store/serviceDeliveryControlSheet.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { toast } from '@/utils/toast.js';
import Swal from 'sweetalert2';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import ServiceReportsDialog from '../components/ServiceReportsDialog.vue';
import { formatRango as formatRangoHook, diasHijos as diasHijosHook, recorridosCount as recorridosCountHook, recorridosTexto as recorridosTextoHook, esCerrado } from '../hooks/useServiceList.js';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MobileCard from '@/components/mobile/MobileCard.vue';
import MobileSectionHeader from '@/components/mobile/MobileSectionHeader.vue';
import MobileEmptyState from '@/components/mobile/MobileEmptyState.vue';

const router = useRouter();
const store = useServiceDeliveryControlSheetStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

const isViewLoading = ref(true);
const searchQuery = ref('');
const projectFilter = ref('');
const soloCerradas = ref(false);
const expandedRows = ref([]);

const showReportsDialog = ref(false);
const reportVehicles = computed(() => store.catalogs.vehicles ?? []);
const reportDrivers = computed(() => store.catalogs.drivers ?? []);
const downloadingDaily = ref(null);
const sharingLink = ref(null);

const canShareCoordinatorLink = computed(() => permissionsStore.hasAnyRole('SUPERADMIN', 'ADMIN_EMPRESA'));

const permissions = reactive({ edit: false, delete: false, pdf: false });
const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete, initTooltips } = useTableActions(store, router);

const clearSearch = async () => { searchQuery.value = ''; await store.clearFilters(); };
const refreshTable = () => store.fetchItems();
const onProjectFilterChange = async () => { await store.setProjectFilter(projectFilter.value); };
const onSoloCerradasChange = async () => { await store.setSoloCerradas(soloCerradas.value); };

const recorridosCount = (data) => recorridosCountHook(data);
const diasHijos = (data) => diasHijosHook(data, soloCerradas.value);
const recorridosTexto = (data) => recorridosTextoHook(data);
const formatRango = (fecha) => formatRangoHook(fecha);
const isServicioCerrado = (data) => esCerrado(data) || data.control_status === 'CLOSED' || data.control_status === 'CERRADO';
const estadoLabel = (data) => isServicioCerrado(data) ? 'CERRADO' : 'EN CURSO';
const estadoBadge = (data) => isServicioCerrado(data) ? 'badge-subtle-secondary' : 'badge-subtle-success';
const estadoIcono = (data) => isServicioCerrado(data) ? 'fad fa-lock me-1' : 'fad fa-clock me-1';
const tipoLabel = (type) => { const tipos = { 'DIRECTO_CON_LA_EMPRESA': 'Directo con la empresa', 'SUBCONTRATADO': 'Subcontratado', 'CON_VEHICULO_CONTRATADO': 'Vehículo contratado', 'EXTERNO_PLATAFORMA': 'Externo de plataforma' }; return tipos[type] || type || 'Desconocido'; };

const goToInternalControl = () => router.push('/planilla-de-control-de-prestacion-servicios/control-de-servicios');
const goToCreate = () => router.push('/planilla-de-control-de-prestacion-servicios/crear');
const goToControl = (uuid) => router.push(`/planilla-de-control-de-prestacion-servicios/control-de-servicios?id=${uuid}`);
const goToEdit = (uuid) => router.push(`/planilla-de-control-de-prestacion-servicios/editar/${uuid}`);

const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar registro?',
    html: `<p class="mb-2">¿Estás seguro de eliminar el registro de <strong>"${item.vehicle_license_plate || item.vehicle?.vehicle_license_plate || 'este vehículo'}"</strong>?</p>
           <div class="alert alert-warning small mb-0 mt-2"><i class="fad fa-exclamation-triangle me-1"></i>Esta acción no se puede deshacer.</div>`
});

const downloadParentPdf = async (data) => {
    try {
        downloadingDaily.value = data.uuid;
        await store.downloadDailyPdf(data.uuid);
    } catch (err) {
        toast('Error', 'No se pudo descargar el PDF.', 'error');
    } finally {
        downloadingDaily.value = null;
    }
};

const downloadDaily = async (uuid) => {
    try {
        downloadingDaily.value = uuid;
        await store.downloadDailyPdf(uuid);
    } catch (e) {
        toast('Error', 'Error descargando PDF', 'error');
    } finally {
        downloadingDaily.value = null;
    }
};

const shareCoordinatorLink = async (uuid) => {
    try {
        sharingLink.value = uuid;
        Swal.fire({ title: 'Generando enlace...', text: 'Por favor espera...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const result = await store.generateCoordinatorSignUrl(uuid);
        const url = result?.url;
        if(!url) throw new Error();
        Swal.close();
        Swal.fire({
            title: '¡Enlace Generado!',
            html: `<p>Comparte este enlace con el coordinador:</p><div class="mt-2 p-2 bg-light border rounded text-break font-monospace" style="font-size: 12px;">${url}</div>`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: '<i class="fad fa-copy"></i> Copiar',
            cancelButtonText: 'Cerrar'
        }).then(r => {
            if(r.isConfirmed) navigator.clipboard.writeText(url).then(() => toast('Éxito', 'Enlace copiado', 'success'));
        });
    } catch(err) {
        toast('Error', 'Error al generar enlace', 'error');
    } finally {
        sharingLink.value = null;
    }
};

onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.loadFormOptions(userStore.company_uuid);
        if (store.catalogs.projects) store.projects = store.catalogs.projects;
        permissions.pdf = permissionsStore.can('service_delivery_control_sheets.history_pdf');
        // El listado arranca mostrando todo (abiertas y cerradas); el
        // interruptor "Solo cerradas" filtra bajo demanda.
        soloCerradas.value = store.soloCerradas;
        permissions.view = permissionsStore.can('service_delivery_control_sheets.view');
        permissions.edit = permissionsStore.can('service_delivery_control_sheets.update');
        permissions.delete = permissionsStore.can('service_delivery_control_sheets.delete');
        await store.fetchItems();
    } finally {
        isViewLoading.value = false;
        setTimeout(() => initTooltips(), 200);
    }
});
</script>

<style scoped>
/* El menú de Reportes va a body: siempre por encima del listado */
:deep(.p-menu-overlay) {
    z-index: 1100 !important;
}
</style>
