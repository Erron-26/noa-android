<template>
    <BasePageHeader :title="'Listado de ' + 'Vehicles'" description="Gestión del módulo en el sistema."
        icon="fad fa-clipboard-list text-primary" :show-refresh="true" :show-create="can('vehicles.create')" :show-bg="true"
        :loading="isViewLoading || store.loading" :compact="true" 
        :breadcrumbs="[{ label: 'Vehicles' }, { label: 'Listado' }]" @refresh="refreshTable" @create="goToCreate"  />

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
                            type="search" placeholder="Buscar..." aria-label="Buscar vehículo" @input="debouncedSearch" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
                            title="Limpiar" @click="clearSearch">
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
                        <DataTable :value="store.items" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) *
                                store.pagination.itemsPerPage
                                " :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]"
                            responsiveLayout="scroll" tableStyle="min-width: 50rem"
                            class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">
                            <Column field="vehicle_license_plate" header="Placa / Afiliado" sortable>
                                <template #body="{ data }">
                                    <div class="d-flex flex-column">
                                        <span class="text-dark fw-semibold">{{ data.vehicle_license_plate || '-'
                                        }}</span>
                                        <small class="text-muted" v-if="data.third_party" style="font-size: 0.75rem;">
                                            {{ data.third_party.company_name || `${data.third_party.first_name}
                                            ${data.third_party.last_name}` }}
                                        </small>
                                    </div>
                                </template>
                            </Column>

                            <Column field="vehicle_class.description" header="Clase" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.vehicle_class?.description || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="brand.description" header="Marca" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.brand?.description || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="line" header="Línea" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.line || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="model" header="Modelo" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.model || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="branch.name" header="Sucursal" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.branch?.name || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="type_of_service" header="Servicio" sortable>
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle badge-subtle-info">
                                        {{ data.type_of_service === 'PUBLICO' ? 'Público' : 'Particular' }}
                                    </span>
                                </template>
                            </Column>

                            <Column field="is_active" header="Estado" sortable class="text-center"
                                style="width: 100px;">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle" :class="data.is_active
                                        ? 'badge-subtle-success'
                                        : 'badge-subtle-warning'
                                        ">
                                        <i :class="data.is_active
                                            ? 'fad fa-check-circle me-1'
                                            : 'fad fa-circle me-1'
                                            " style="font-size:10px;" />
                                        {{ data.is_active ? "Activo" : "Inactivo" }}
                                    </span>
                                </template>
                            </Column>

                            <Column header="Acciones" class="text-center" style="min-width:150px; width: 150px;"
                                v-if="can('vehicles.profile') || can('vehicles.update') || can('vehicles.change_branch') || can('vehicles.delete')">
                                <template #body="{ data }">
                                    <div class="btn-group btn-group-sm" role="group">
                                         <button class="btn btn-falcon-default" type="button" title="Ver detalle" :aria-label="`Ver detalle de ${data.vehicle_license_plate}`"
                                             v-if="can('vehicles.profile')" @click="goToDetail(data.uuid)">
                                             <i class="fad fa-eye text-primary" style="font-size:14px;" />
                                         </button>
                                         <button class="btn btn-falcon-default" type="button" title="Editar" :aria-label="`Editar ${data.vehicle_license_plate}`"
                                             v-if="can('vehicles.update')" @click="goToEdit(data.uuid)">
                                             <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                         </button>
                                         <button class="btn btn-falcon-default" type="button" title="Cambiar Sede" :aria-label="`Cambiar sede de ${data.vehicle_license_plate}`"
                                             v-if="can('vehicles.change_branch')" @click="handleChangeBranch(data)">
                                             <i class="fad fa-building text-info" style="font-size:14px;" />
                                         </button>
                                         <button class="btn btn-falcon-default" type="button" title="Proyección de Mantenimiento" :aria-label="`Proyección de mantenimiento de ${data.vehicle_license_plate}`"
                                             v-if="can('maintenance.forecast')" @click="goToForecast(data.uuid)">
                                             <i class="fad fa-calendar-check text-success" style="font-size:14px;" />
                                         </button>
                                         <button class="btn btn-falcon-default" type="button" title="Eliminar" :aria-label="`Eliminar ${data.vehicle_license_plate}`"
                                             v-if="can('vehicles.delete')" @click="handleDelete(data)">
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
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useVehiclesStore } from '../store/vehicles.store.js';
import { usePermissionsStore } from '@store';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Swal from 'sweetalert2';
import { logger } from '@/utils/logger.js';

const router = useRouter();
const route = useRoute();
const store = useVehiclesStore();
const permissionsStore = usePermissionsStore();

const isViewLoading = ref(true);
const searchQuery = ref('');

const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete, initTooltips, destroyTooltips } = useTableActions(store, router);

const can = (action) => permissionsStore.can(action);

const clearSearch = async () => { searchQuery.value = ''; await store.clearFilters(); };
const refreshTable = () => store.fetchItems();
const onPageChange = async ({ first, rows }) => {
    store.pagination.itemsPerPage = rows;
    await store.setPage(Math.floor(first / rows) + 1);
};

const goToCreate = () => router.push('/vehiculos/crear');
const goToEdit = (uuid) => router.push(`/vehiculos/editar/${uuid}`);
const goToDetail = (uuid) => router.push(`/vehiculos/perfil/${uuid}`);
const goToForecast = (uuid) => router.push({ path: '/mantenimiento/proyeccion', query: { vehicle: uuid } });

const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar vehículo?',
    nameField: 'vehicle_license_plate',
});

const handleChangeBranch = async (vehicle) => {
    try {
        if (!store.catalogs.branches || store.catalogs.branches.length === 0) {
            await store.loadCatalogs();
        }

        const branches = store.catalogs.branches || [];
        if (branches.length === 0) {
            await Swal.fire({
                title: 'Atención',
                text: 'No hay sedes configuradas en el sistema.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        const currentBranchUuid = vehicle.branch?.uuid || '';
        const availableBranches = branches.filter(b => b.uuid !== currentBranchUuid);

        if (availableBranches.length === 0) {
            await Swal.fire({
                title: 'Información',
                text: 'No hay otras sedes configuradas en el sistema a las que se pueda trasladar este vehículo.',
                icon: 'info',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        let selectedBranchUuid = '';

        let branchesHtml = `
            <style>
                .branch-card-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    margin-bottom: 8px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    background: #fff;
                    cursor: pointer;
                    transition: all 150ms ease-in-out;
                    text-align: left;
                }
                .branch-card-item:hover {
                    border-color: #0d6efd;
                    background-color: #f8f9fa;
                }
                .branch-card-item.selected {
                    border-color: #0d6efd !important;
                    background-color: #f0f5ff !important;
                }
                .branch-card-item.selected .branch-icon-box {
                    background: #0d6efd !important;
                    color: #fff !important;
                }
                .branch-card-item.selected .select-check-indicator {
                    border-color: #0d6efd !important;
                    background-color: #0d6efd !important;
                    color: #fff !important;
                }
                .branch-card-item .select-check-indicator i,
                .branch-card-item .select-check-indicator svg {
                    display: none !important;
                }
                .branch-card-item.selected .select-check-indicator i,
                .branch-card-item.selected .select-check-indicator svg {
                    display: block !important;
                }
            </style>
            <div class="branch-selector-container" style="max-height: 320px; overflow-y: auto; padding: 4px;">
        `;
        availableBranches.forEach(b => {
            branchesHtml += `
                <div class="branch-card-item" data-uuid="${b.uuid}">
                    <div class="branch-icon-box" style="
                        width: 36px;
                        height: 36px;
                        border-radius: 6px;
                        background: #f8f9fa;
                        color: #0d6efd;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        transition: all 150ms ease;
                    ">
                        <i class="fad fa-building"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: #2d3748; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.name}</div>
                        <div style="font-size: 0.725rem; color: #718096; margin-top: 1px;">
                            Trasladar vehículo a esta sede
                        </div>
                    </div>
                    <div class="select-check-indicator" style="
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        border: 2px solid #cbd5e0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #fff;
                        color: #fff;
                        font-size: 9px;
                        transition: all 150ms ease;
                    ">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
            `;
        });
        branchesHtml += `</div>`;

        const { isConfirmed } = await Swal.fire({
            title: '<span style="font-size: 1.15rem; font-weight: 700; color: #1a202c;">Cambiar Sede del Vehículo</span>',
            html: `
                <div style="text-align: left; margin-bottom: 12px; font-size: 0.8rem; color: #4a5568; line-height: 1.4;">
                    Seleccione la nueva sucursal para asociar al vehículo con placa <strong class="text-primary">${vehicle.vehicle_license_plate}</strong>:
                </div>
                ${branchesHtml}
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            customClass: {
                popup: 'rounded-3 shadow-lg border-0',
                confirmButton: 'btn btn-primary px-3 py-2 fw-medium btn-sm',
                cancelButton: 'btn btn-secondary px-3 py-2 fw-medium btn-sm'
            },
            didOpen: (popup) => {
                const confirmButton = popup.querySelector('.swal2-confirm');
                if (confirmButton) {
                    confirmButton.disabled = true;
                }

                const cards = popup.querySelectorAll('.branch-card-item');
                cards.forEach(card => {
                    card.addEventListener('click', () => {
                        cards.forEach(c => {
                            c.classList.remove('selected');
                        });

                        card.classList.add('selected');
                        selectedBranchUuid = card.getAttribute('data-uuid');
                        if (confirmButton) {
                            confirmButton.disabled = false;
                        }
                    });
                });
            }
        });

        if (isConfirmed && selectedBranchUuid && selectedBranchUuid !== currentBranchUuid) {
            await store.updateItem(vehicle.uuid, { branch_uuid: selectedBranchUuid });
            await store.fetchItems();
        }
    } catch (error) {
        logger.error('Error al cambiar la sede:', { message: error?.message ?? error });
    }
};

watch(
    () => [store.search, store.pagination.currentPage, store.pagination.itemsPerPage],
    ([newSearch, newPage, newPerPage]) => {
        router.replace({
            query: {
                ...route.query,
                search: newSearch || undefined,
                page: newPage > 1 ? newPage : undefined,
                per_page: newPerPage !== 10 ? newPerPage : undefined,
            },
        });
    }
);

onMounted(async () => {
    try {
        const queryPage = route.query.page ? parseInt(route.query.page, 10) : 1;
        const queryPerPage = route.query.per_page ? parseInt(route.query.per_page, 10) : 10;
        const querySearch = route.query.search || '';

        store.search = querySearch;
        store.pagination.currentPage = queryPage;
        store.pagination.itemsPerPage = queryPerPage;

        searchQuery.value = querySearch;
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