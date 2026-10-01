<template>
    <!-- VISTA ESCRITORIO / TABLET -->
    <div class="d-none d-md-block">
        <BasePageHeader :title="'Inspecciones Vehiculares'" description="Gestión del módulo en el sistema."
            icon="fad fa-clipboard-list text-primary" :show-refresh="true" :show-create="true" :show-bg="true"
            :loading="isViewLoading || store.loading" :compact="true"
            :breadcrumbs="[{ label: 'Inspecciones' }, { label: 'Listado' }]" @refresh="refreshTable"
            @create="goToCreate" />

    <!-- STATS CARDS -->
    <div class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.15s;" v-if="!isViewLoading">
        <!-- Card 1: Total Inspecciones -->
        <div class="col-12 col-sm-6 col-md-4">
            <div class="card border-0 shadow-sm h-100 bg-white">
                <div class="card-body p-2 p-md-3 p-lg-4 d-flex align-items-center gap-3">
                    <div class="avatar-icon bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; min-width: 48px;">
                        <i class="fad fa-clipboard-list fs-4"></i>
                    </div>
                    <div>
                        <span class="text-muted small text-uppercase fw-semibold" style="font-size: 0.65rem; letter-spacing: 0.5px;">Total Inspecciones Flota</span>
                        <h4 class="mb-0 fw-bold text-slate-800 mt-1">{{ formatNumber(store.pagination.totalItems) }}</h4>
                    </div>
                </div>
            </div>
        </div>

        <!-- Card 2: Total Km Recorridos -->
        <div class="col-12 col-sm-6 col-md-4">
            <div class="card border-0 shadow-sm h-100 bg-white">
                <div class="card-body p-2 p-md-3 p-lg-4 d-flex align-items-center gap-3">
                    <div class="avatar-icon bg-soft-success text-success rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; min-width: 48px;">
                        <i class="fad fa-road fs-4"></i>
                    </div>
                    <div>
                        <span class="text-muted small text-uppercase fw-semibold" style="font-size: 0.65rem; letter-spacing: 0.5px;">Km Recorridos Acumulados</span>
                        <h4 class="mb-0 fw-bold text-success mt-1">+{{ formatNumber(totalKmTraveled) }} km</h4>
                    </div>
                </div>
            </div>
        </div>

        <!-- Card 3: Promedio Odométro -->
        <div class="col-12 col-sm-12 col-md-4">
            <div class="card border-0 shadow-sm h-100 bg-white">
                <div class="card-body p-2 p-md-3 p-lg-4 d-flex align-items-center gap-3">
                    <div class="avatar-icon bg-soft-info text-info rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; min-width: 48px;">
                        <i class="fad fa-tachometer-alt fs-4"></i>
                    </div>
                    <div>
                        <span class="text-muted small text-uppercase fw-semibold" style="font-size: 0.65rem; letter-spacing: 0.5px;">Promedio Kilometraje</span>
                        <h4 class="mb-0 fw-bold text-slate-800 mt-1">{{ formatNumber(averageMileage) }} km</h4>
                    </div>
                </div>
            </div>
        </div>
    </div>

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
                            type="search" placeholder="Buscar..." aria-label="Buscar inspección" @input="debouncedSearch" />
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
                    <!-- Vista Escritorio / Tablet Grande -->
                    <div class="table-responsive scrollbar d-none d-md-block">
                        <DataTable :value="store.recentInspections" lazy :paginator="true"
                            :rows="store.pagination.itemsPerPage" :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) *
                                store.pagination.itemsPerPage
                                " :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]"
                            responsiveLayout="scroll" tableStyle="min-width: 50rem"
                            class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">
                            <Column field="inspection_date" header="Fecha" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ formatDate(data.inspection_date) }}</span>
                                </template>
                            </Column>

                            <Column field="vehicle.vehicle_license_plate" header="Vehículo" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark fw-bold">{{ data.vehicle?.vehicle_license_plate || '-'
                                        }}</span>
                                    <div class="small text-muted" v-if="data.vehicle?.model">{{
                                        data.vehicle?.brand?.description || '' }} {{ data.vehicle?.model }}</div>
                                </template>
                            </Column>

                            <Column field="driver.first_name" header="Conductor" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark fw-bold" v-if="data.driver">{{ data.driver.first_name }} {{
                                        data.driver.last_name }}</span>
                                    <span class="text-dark fw-bold" v-else>-</span>
                                    <div class="small text-muted" v-if="data.driver">CC: {{ data.driver.document_number
                                        }}</div>
                                </template>
                            </Column>

                            <Column field="inspector_name" header="Inspector" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.inspector_name || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="mileage" header="Kilometraje" sortable>
                                <template #body="{ data }">
                                    <span class="badge bg-light text-dark border fw-semibold" style="font-size: 0.78rem; letter-spacing: 0.02em;">
                                        <i class="fad fa-tachometer-alt me-1 text-primary" style="font-size: 0.75rem;"></i>
                                        {{ formatNumber(data.mileage) }} km
                                    </span>
                                </template>
                            </Column>

                            <Column header="Acciones" class="text-center" style="min-width:170px; width: 170px;">
                                <template #body="{ data }">
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button class="btn btn-falcon-default" type="button" title="Ver historial" :aria-label="`Ver historial de ${data.vehicle?.vehicle_license_plate}`"
                                            @click="openHistory(data)">
                                            <i class="fad fa-history text-info" style="font-size:14px;" />
                                        </button>
                                        <button class="btn btn-falcon-default" type="button" title="Abrir PDF" :aria-label="`Abrir PDF de ${data.vehicle?.vehicle_license_plate}`"
                                            @click="downloadPdf(data.uuid)" :disabled="downloadingPdf === data.uuid">
                                            <span v-if="downloadingPdf === data.uuid"
                                                class="spinner-border spinner-border-sm text-danger"
                                                style="width: 14px; height: 14px;"></span>
                                            <i v-else class="fad fa-file-pdf text-danger" style="font-size:14px;" />
                                        </button>
                                        <button v-if="isAdmin" class="btn btn-falcon-default" type="button" title="Firmar inspección" :aria-label="`Firmar inspección de ${data.vehicle?.vehicle_license_plate}`"
                                            @click="openSignaturePad(data)">
                                            <i class="fad fa-signature text-success" style="font-size:14px;" />
                                        </button>
                                        <button v-if="isAdmin" class="btn btn-falcon-default" type="button" title="Compartir link de firma" :aria-label="`Compartir link de firma de ${data.vehicle?.vehicle_license_plate}`"
                                            @click="generatePublicSignLink(data.uuid)">
                                            <i class="fad fa-share-alt text-primary" style="font-size:14px;" />
                                        </button>
                                        <button
                                            v-if="can('vehicleInspections.update') && isSameDay(data.inspection_date)"
                                            class="btn btn-falcon-default" type="button" title="Editar" :aria-label="`Editar inspección de ${data.vehicle?.vehicle_license_plate}`"
                                            @click="goToEdit(data.uuid)">
                                            <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                        </button>
                                        <button
                                            v-if="can('vehicleInspections.delete') && isSameDay(data.inspection_date)"
                                            class="btn btn-falcon-default" type="button" title="Eliminar" :aria-label="`Eliminar inspección de ${data.vehicle?.vehicle_license_plate}`"
                                            @click="handleDelete(data)">
                                            <i class="fad fa-trash text-danger" style="font-size:14px;" />
                                        </button>
                                    </div>
                                </template>
                            </Column>
                            <!-- Loading state -->
                            <template #loading>
                                <NoaTableSpinner message="Cargando inspecciones..." />
                            </template>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>

    <!-- VISTA MÓVIL ANDROID CAPACITOR (Pantalla completa de borde a borde) -->
    <div class="d-md-none w-100 px-1 pt-1 pb-3 mobile-inspection-feed">
        <MobileSectionHeader
            title="Inspecciones Preoperacionales"
            icon-class="fas fa-clipboard-check"
            icon-bg="#1e40af"
            :badge="store.pagination.totalItems ? `${store.pagination.totalItems}` : '0'"
        >
            <template #action>
                <button v-if="can('vehicleInspections.create')" type="button" class="btn btn-primary btn-sm py-1 px-2 fs-11 rounded-3" @click="goToCreate">
                    <i class="fas fa-plus me-1" aria-hidden="true"></i> Nueva
                </button>
            </template>
        </MobileSectionHeader>

        <div v-if="store.recentInspections && store.recentInspections.length > 0" class="d-flex flex-column w-100">
            <MobileCard
                v-for="item in store.recentInspections"
                :key="item.uuid"
                variant="blue"
                :title="item.vehicle?.vehicle_license_plate || 'SIN PLACA'"
                :subtitle="item.vehicle?.brand?.description ? `${item.vehicle.brand.description} ${item.vehicle.model || ''}` : 'Vehículo asignado'"
                :badge="formatDate(item.inspection_date)"
                icon-class="fas fa-clipboard-check"
            >
                <div class="d-flex justify-content-between align-items-center py-2 border-top border-bottom my-1">
                    <div>
                        <small class="text-muted d-block fs-10">Conductor</small>
                        <span class="fw-semibold text-dark fs-12">
                            {{ item.driver?.first_name ? `${item.driver.first_name} ${item.driver.last_name || ''}` : '-' }}
                        </span>
                    </div>
                    <div class="text-end">
                        <small class="text-muted d-block fs-10">Kilometraje</small>
                        <span class="badge bg-light text-primary border fw-bold fs-11">
                            <i class="fad fa-tachometer-alt me-1" aria-hidden="true"></i>{{ formatNumber(item.mileage) }} km
                        </span>
                    </div>
                </div>

                <template #actions>
                    <button class="mc-btn-primary" type="button" @click="downloadPdf(item.uuid)" :disabled="downloadingPdf === item.uuid">
                        <span v-if="downloadingPdf === item.uuid" class="spinner-border spinner-border-sm" style="width:12px;height:12px;"></span>
                        <i v-else class="fad fa-file-pdf" aria-hidden="true"></i>
                        <span>PDF</span>
                    </button>
                    <button class="mc-btn-secondary" type="button" @click="openHistory(item)">
                        <i class="fad fa-history text-info" aria-hidden="true"></i>
                        <span>Historial</span>
                    </button>
                    <button v-if="can('vehicleInspections.update') && isSameDay(item.inspection_date)" class="mc-btn-secondary" type="button" @click="goToEdit(item.uuid)">
                        <i class="fad fa-edit text-warning" aria-hidden="true"></i>
                        <span>Editar</span>
                    </button>
                </template>
            </MobileCard>
        </div>

        <MobileEmptyState
            v-else
            emoji="📋"
            title="Sin inspecciones registradas"
            description="No hay inspecciones con los filtros aplicados o no tienes asignadas para hoy."
            action-text="Nueva Inspección"
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

    <!-- DIÁLOGO HISTORIAL -->
    <Dialog v-model:visible="showHistoryDialog" :modal="true" :closable="true" :draggable="false" :style="{ width: '780px', maxWidth: '95vw' }" :breakpoints="{ '960px': '92vw', '640px': '95vw' }" :content-style="{ overflowY: 'auto' }" class="p-fluid history-dialog">
        <template #header>
            <div class="d-flex align-items-center gap-2">
                <i class="fad fa-history text-primary fs-4"></i>
                <h5 class="mb-0 fw-bold text-slate-800">Historial de Inspecciones</h5>
            </div>
        </template>

        <template v-if="historyVehicle">
            <!-- Info del Vehículo -->
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
                <div class="d-flex align-items-center gap-2">
                    <div class="license-plate-badge">
                        {{ historyVehicle.vehicle?.vehicle_license_plate }}
                    </div>
                    <div>
                        <h6 class="mb-0 fw-bold text-slate-800">
                            {{ historyVehicle.vehicle?.brand?.description || '' }} {{ historyVehicle.vehicle?.model || '' }}
                        </h6>
                        <span class="text-muted small">Historial de control de kilometraje e inspecciones</span>
                    </div>
                </div>
                <div>
                    <span class="badge bg-light text-secondary border border-200">
                        <i class="fad fa-truck me-1"></i>{{ historyVehicle.vehicle?.type_of_service || 'PÚBLICO' }}
                    </span>
                </div>
            </div>

            <!-- Cargando Estado -->
            <div v-if="store.historyLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="text-muted small mt-2">Recuperando registros del historial...</p>
            </div>

            <!-- Sin Datos -->
            <div v-else-if="store.historyItems.length === 0" class="text-center py-5 text-muted">
                <div class="avatar avatar-4xl bg-soft-secondary mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px; border-radius: 50%;">
                    <i class="fad fa-inbox fa-2x text-secondary" />
                </div>
                <h6 class="fw-bold">Sin inspecciones</h6>
                <p class="text-muted small mb-0">No se encontraron inspecciones previas registradas para este vehículo.</p>
            </div>

            <!-- Historial Encontrado -->
            <template v-else>
                <!-- Resumen de Stats -->
                <div class="row g-3 mb-4">
                    <div class="col-12 col-md-4">
                        <div class="stat-card p-3 bg-light rounded-3 border">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <span class="text-muted small text-uppercase fw-semibold" style="font-size: 0.65rem;">Total Inspecciones</span>
                                    <h4 class="mb-0 fw-bold text-slate-800 mt-1">{{ store.historyItems.length }}</h4>
                                </div>
                                <div class="stat-icon bg-soft-primary text-primary">
                                    <i class="fad fa-clipboard-check fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="stat-card p-3 bg-light rounded-3 border">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <span class="text-muted small text-uppercase fw-semibold" style="font-size: 0.65rem;">Kilometraje Actual</span>
                                    <h4 class="mb-0 fw-bold text-slate-800 mt-1">{{ formatNumber(store.historyItems[0]?.mileage) }} <span class="small text-muted" style="font-size: 0.75rem;">km</span></h4>
                                </div>
                                <div class="stat-icon bg-soft-info text-info">
                                    <i class="fad fa-tachometer-alt fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="stat-card p-3 bg-light rounded-3 border">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <span class="text-muted small text-uppercase fw-semibold" style="font-size: 0.65rem;">Km Totales Recorridos</span>
                                    <h4 class="mb-0 fw-bold text-success mt-1">+{{ formatNumber(totalHistoryKmTraveled) }} <span class="small text-muted" style="font-size: 0.75rem;">km</span></h4>
                                </div>
                                <div class="stat-icon bg-soft-success text-success">
                                    <i class="fad fa-road fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabla del Historial -->
                <div class="table-responsive border rounded-3 overflow-hidden bg-white">
                    <table class="table table-sm table-hover mb-0 align-middle history-table">
                        <thead class="bg-light">
                            <tr>
                                <th class="text-uppercase text-muted fw-bold ps-3 py-2" style="font-size: 0.7rem; letter-spacing: 0.5px;">Fecha</th>
                                <th class="text-uppercase text-muted fw-bold py-2" style="font-size: 0.7rem; letter-spacing: 0.5px;">Inspector</th>
                                <th class="text-uppercase text-muted fw-bold py-2 text-end" style="font-size: 0.7rem; letter-spacing: 0.5px;">Odómetro</th>
                                <th class="text-uppercase text-muted fw-bold py-2 text-end" style="font-size: 0.7rem; letter-spacing: 0.5px; width: 140px;">Km Recorridos</th>
                                <th class="text-uppercase text-muted fw-bold py-2 text-center" style="font-size: 0.7rem; letter-spacing: 0.5px; width: 80px;">PDF</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, idx) in processedHistoryItems" :key="item.uuid" :class="{'table-primary-subtle': idx === 0}">
                                <td class="ps-3 py-2 fw-medium text-slate-800">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="fad fa-calendar-alt text-muted" style="font-size: 13px;"></i>
                                        <span>{{ formatDate(item.inspection_date) }}</span>
                                        <span v-if="idx === 0" class="badge bg-primary bg-opacity-10 text-primary px-2 py-0.5 rounded-pill" style="font-size: 0.65rem;">Reciente</span>
                                    </div>
                                </td>
                                <td class="py-2">
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="avatar-initials bg-soft-secondary text-secondary">
                                            {{ getInitials(item.inspector_name) }}
                                        </div>
                                        <span class="text-slate-700" style="font-size: 0.8rem;">{{ item.inspector_name || 'Sin especificar' }}</span>
                                    </div>
                                </td>
                                <td class="py-2 text-end fw-semibold text-slate-800">
                                    {{ formatNumber(item.mileage) }} km
                                </td>
                                <td class="py-2 text-end">
                                    <span v-if="item.km_traveled !== null" class="badge badge-subtle-success font-monospace px-2 py-1 rounded">
                                        <i class="fas fa-arrow-up me-1" style="font-size: 10px;"></i>+{{ formatNumber(item.km_traveled) }} km
                                    </span>
                                    <span v-else class="badge bg-light text-muted px-2 py-1 rounded">
                                        Inicial
                                    </span>
                                </td>
                                <td class="py-2 text-center">
                                    <button class="btn btn-falcon-default btn-sm shadow-none border p-1 rounded-circle" style="width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;" type="button" title="Abrir PDF"
                                        @click="downloadPdf(item.uuid)" :disabled="downloadingPdf === item.uuid">
                                        <span v-if="downloadingPdf === item.uuid"
                                            class="spinner-border spinner-border-sm text-danger"
                                            style="width: 12px; height: 12px;"></span>
                                        <i v-else class="fad fa-file-pdf text-danger" style="font-size: 13px;" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-light">
                            <tr class="fw-bold border-top border-2">
                                <td colspan="3" class="ps-3 py-2 text-slate-800 text-end">Total Recorrido Histórico:</td>
                                <td class="py-2 text-end text-success font-monospace">+{{ formatNumber(totalHistoryKmTraveled) }} km</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </template>
        </template>
    </Dialog>

    <!-- DIÁLOGO FIRMA -->
    <Dialog v-model:visible="showSignatureDialog" :modal="true" :closable="true" :draggable="false" :style="{ width: '520px', maxWidth: '95vw' }" :breakpoints="{ '960px': '92vw', '640px': '95vw' }" :content-style="{ overflowY: 'auto' }" class="p-fluid signature-dialog">
        <template #header>
            <div class="d-flex align-items-center gap-2">
                <i class="fad fa-signature text-primary fs-4"></i>
                <h5 class="mb-0 fw-bold text-slate-800">Firmar Inspección Vehicular</h5>
            </div>
        </template>

        <div v-if="sigLoadingDetail" class="text-center py-4">
            <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
            <p class="mt-2 text-muted small">Cargando información de firmas...</p>
        </div>
        <div v-else-if="selectedInspectionForSignature && sigDetail" class="p-1">
            <div class="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2" style="border-radius: 6px;">
                <i class="fad fa-info-circle text-primary"></i>
                <span class="text-slate-700">
                    Firmando inspección del vehículo <strong>{{ selectedInspectionForSignature.vehicle?.vehicle_license_plate }}</strong> del día <strong>{{ formatDate(selectedInspectionForSignature.inspection_date) }}</strong>.
                </span>
            </div>

            <!-- Estado de firmas -->
            <div class="p-3 bg-light rounded border mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted small fw-medium">Firma Inspector / Conductor:</span>
                    <span v-if="sigDetail.has_inspector_signature" class="badge bg-success">
                        <i class="fas fa-check-circle me-1"></i> Firmado
                    </span>
                    <span v-else class="badge bg-warning text-dark">
                        <i class="fas fa-clock me-1"></i> Pendiente
                    </span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted small fw-medium">Firma Coordinador HSEQ / Operaciones:</span>
                    <span v-if="sigDetail.has_coordinator_signature" class="badge bg-success">
                        <i class="fas fa-check-circle me-1"></i> Firmado
                    </span>
                    <span v-else class="badge bg-warning text-dark">
                        <i class="fas fa-clock me-1"></i> Pendiente
                    </span>
                </div>

                <!-- Mensaje de completado -->
                <div v-if="sigDetail.has_inspector_signature && sigDetail.has_coordinator_signature" class="alert alert-success text-center mt-3 mb-0 py-2 small">
                    <i class="fad fa-check-double me-1"></i>
                    ¡Ambas firmas registradas!
                </div>
            </div>

            <!-- Selector de rol + pad (solo si falta alguna) -->
            <template v-if="!(sigDetail.has_inspector_signature && sigDetail.has_coordinator_signature)">
                <label class="sig-label small fw-medium text-muted mb-1">Seleccione el firmante:</label>
                <div class="d-flex gap-2 mb-3">
                    <button
                        type="button"
                        :class="['btn btn-sm flex-fill', sigActiveRole === 'inspector' ? 'btn-primary' : 'btn-outline-secondary']"
                        :disabled="sigDetail.has_inspector_signature"
                        @click="sigActiveRole = 'inspector'"
                    >
                        <i class="fad fa-user-helmet-safety me-1"></i> Inspector
                    </button>
                    <button
                        type="button"
                        :class="['btn btn-sm flex-fill', sigActiveRole === 'coordinator' ? 'btn-primary' : 'btn-outline-secondary']"
                        :disabled="sigDetail.has_coordinator_signature"
                        @click="sigActiveRole = 'coordinator'"
                    >
                        <i class="fad fa-user-tie me-1"></i> Coordinador
                    </button>
                </div>

                <SignaturePad
                    :key="sigActiveRole"
                    entity-type="vehicle_inspection"
                    :entity-id="sigDetail?.id || selectedInspectionForSignature?.id"
                    :role="sigActiveRole"
                    @saved="onSignatureSaved"
                />
            </template>
        </div>
    </Dialog>
</template>

<script setup>
import { toast } from '@/utils/toast.js';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVehicleInspectionsStore } from '../store/vehicleInspections.store.js';
import { usePermissionsStore } from '@store';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import VehicleInspectionsService from '../services/vehicleInspections.service.js';
import { useAuthStore } from '@/store/modules/auth.js';
import apiClient from '@/services/api/client.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import SignaturePad from '@/components/SignaturePad.vue';
import Swal from 'sweetalert2';
import MobileCard from '@/components/mobile/MobileCard.vue';
import MobileSectionHeader from '@/components/mobile/MobileSectionHeader.vue';
import MobileEmptyState from '@/components/mobile/MobileEmptyState.vue';

const router = useRouter();
const store = useVehicleInspectionsStore();
const permissionsStore = usePermissionsStore();

const isViewLoading = ref(true);
const searchQuery = ref('');
const downloadingPdf = ref(null);
const showHistoryDialog = ref(false);
const historyVehicle = ref(null);
const showSignatureDialog = ref(false);
const selectedInspectionForSignature = ref(null);
const sigDetail = ref(null);
const sigLoadingDetail = ref(false);
const sigActiveRole = ref('coordinator');

const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete, initTooltips, destroyTooltips } = useTableActions(store, router);

const can = (action) => permissionsStore.can(action);

// Solo administradores (SUPERADMIN o ADMIN_EMPRESA) pueden firmar inspecciones vehiculares
const isAdmin = computed(() => permissionsStore.hasRole('SUPERADMIN') || permissionsStore.hasRole('ADMIN_EMPRESA'));

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr.split(' ')[0].split('T')[0];
};

const formatNumber = (val) => {
    if (val === null || val === undefined) return '-';
    return new Intl.NumberFormat('es-CO').format(val);
};

const getInitials = (name) => {
    if (!name) return 'IN';
    return name.split(' ')
        .filter(n => n.length > 0)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('');
};

const totalKmTraveled = computed(() => {
    return store.recentInspections.reduce((sum, item) => {
        return sum + (item.km_traveled || 0);
    }, 0);
});

const averageMileage = computed(() => {
    const items = store.recentInspections.filter(item => item.mileage > 0);
    if (items.length === 0) return 0;
    const sum = items.reduce((s, item) => s + (item.mileage || 0), 0);
    return Math.round(sum / items.length);
});

const processedHistoryItems = computed(() => {
    const items = [...store.historyItems];
    return items.map((item, index) => {
        const prevItem = items[index + 1];
        let kmTraveled = null;
        if (prevItem && item.mileage !== null && prevItem.mileage !== null) {
            kmTraveled = Math.max(0, item.mileage - prevItem.mileage);
        }
        return {
            ...item,
            km_traveled: kmTraveled
        };
    });
});

const totalHistoryKmTraveled = computed(() => {
    const items = store.historyItems;
    if (items.length < 2) return 0;
    const newestMileage = items[0].mileage || 0;
    const oldestMileage = items[items.length - 1].mileage || 0;
    return Math.max(0, newestMileage - oldestMileage);
});

const isSameDay = (dateStr) => {
    if (!dateStr) return false;
    const itemDate = formatDate(dateStr);

    // Obtener la fecha actual en formato YYYY-MM-DD ajustada a la zona horaria local
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const today = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];

    return itemDate === today;
};

const clearSearch = async () => { searchQuery.value = ''; await store.clearFilters(); };
const refreshTable = () => store.fetchItems();
const onPageChange = async ({ first, rows }) => {
    await store.setPage(Math.floor(first / rows) + 1);
};

const goToCreate = () => router.push('/inspeccion-vehiculos/crear');
const goToEdit = (uuid) => router.push(`/inspeccion-vehiculos/editar/${uuid}`);

const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar inspección?',
    nameField: 'inspector_name',
});

const openHistory = async (data) => {
    historyVehicle.value = data;
    showHistoryDialog.value = true;
    const vehicleUuid = data.vehicle?.uuid;
    if (vehicleUuid) {
        await store.fetchHistory(vehicleUuid);
    }
};

const openSignaturePad = async (data) => {
    if (!isAdmin.value) {
        Swal.fire({
            title: 'Sin permiso',
            text: 'Solo un administrador puede firmar inspecciones vehiculares.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    selectedInspectionForSignature.value = data;
    showSignatureDialog.value = true;
    sigLoadingDetail.value = true;
    sigDetail.value = null;
    try {
        const tenantId = useAuthStore().currentTenant?.id;
        const instance = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
        const response = await instance.get(`/fleet-management/vehicle-inspections/${data.uuid}`);
        sigDetail.value = response.data.data;
        if (!sigDetail.value.has_coordinator_signature) {
            sigActiveRole.value = 'coordinator';
        } else if (!sigDetail.value.has_inspector_signature) {
            sigActiveRole.value = 'inspector';
        }
    } catch (err) {
        console.error('Error fetching inspection detail:', err);
        sigDetail.value = { has_inspector_signature: false, has_coordinator_signature: false };
    } finally {
        sigLoadingDetail.value = false;
    }
};

const onSignatureSaved = async (signatureData) => {
    // Actualizar estado local optimista inmediatamente
    if (sigDetail.value) {
        if (sigActiveRole.value === 'inspector') sigDetail.value.has_inspector_signature = true;
        else if (sigActiveRole.value === 'coordinator') sigDetail.value.has_coordinator_signature = true;
    }
    
    Swal.fire({
        icon: 'success',
        title: 'Firma guardada',
        text: `Firma de ${sigActiveRole.value === 'inspector' ? 'Inspector/Conductor' : 'Coordinador HSEQ'} registrada correctamente.`,
        timer: 2000,
        showConfirmButton: false
    });

    // Auto-select the OTHER role if it is pending, so the user can sign the next one immediately
    if (sigActiveRole.value === 'inspector' && !sigDetail.value.has_coordinator_signature) {
        sigActiveRole.value = 'coordinator';
    } else if (sigActiveRole.value === 'coordinator' && !sigDetail.value.has_inspector_signature) {
        sigActiveRole.value = 'inspector';
    }

    // Refrescar estado real desde el backend
    try {
        const tenantId = useAuthStore().currentTenant?.id;
        const instance = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
        const response = await instance.get(`/fleet-management/vehicle-inspections/${selectedInspectionForSignature.value.uuid}`);
        
        // Preserve the intelligently selected role if possible
        const incomingData = response.data.data;
        sigDetail.value = incomingData;
        
        // Only force a role change if the current role was somehow signed externally in the meantime
        if (sigActiveRole.value === 'inspector' && incomingData.has_inspector_signature && !incomingData.has_coordinator_signature) {
            sigActiveRole.value = 'coordinator';
        } else if (sigActiveRole.value === 'coordinator' && incomingData.has_coordinator_signature && !incomingData.has_inspector_signature) {
            sigActiveRole.value = 'inspector';
        }
    } catch (err) {
        console.error('Error refreshing signature status:', err);
    }
    
    // Si ambas ya están firmadas, cerrar el diálogo
    if (sigDetail.value?.has_inspector_signature && sigDetail.value?.has_coordinator_signature) {
        setTimeout(() => { showSignatureDialog.value = false; }, 800);
    }
    store.fetchItems();
};

const generatePublicSignLink = async (uuid) => {
    if (!isAdmin.value) {
        Swal.fire({
            title: 'Sin permiso',
            text: 'Solo un administrador puede compartir el enlace de firma.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    try {
        Swal.fire({
            title: 'Generando enlace...',
            text: 'Por favor espera mientras generamos el enlace de firma temporal.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const tenantId = useAuthStore().currentTenant?.id;
        const instance = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;

        const response = await instance.post(`/fleet-management/vehicle-inspections/${uuid}/generate-sign-url`);
        const publicUrl = response.data.data.url;

        Swal.close();

        Swal.fire({
            title: '¡Enlace Generado!',
            html: `
                <p>El siguiente enlace público tiene una vigencia de <b>1 hora</b>:</p>
                <div class="mt-2 p-2 bg-light border rounded text-break text-start font-monospace" style="font-size: 12px; max-height: 100px; overflow-y: auto; word-break: break-all;">
                    ${publicUrl}
                </div>
            `,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: '<i class="fad fa-copy"></i> Copiar Enlace',
            cancelButtonText: 'Cerrar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa'
        }).then((result) => {
            if (result.isConfirmed) {
                navigator.clipboard.writeText(publicUrl).then(() => {
                    Swal.fire({
                        title: '¡Copiado!',
                        text: 'El enlace de firma ha sido copiado al portapapeles.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }).catch(err => {
                    console.error('Error al copiar:', err);
                    toast('Error', 'No se pudo copiar automáticamente. Por favor selecciónalo y cópialo manualmente.', 'warning');
                });
            }
        });
    } catch (err) {
        console.error('Error al generar enlace firmado:', err);
        Swal.fire({
            title: 'Error',
            text: err.response?.data?.message ?? 'No se pudo generar el enlace firmado.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
};

const downloadPdf = async (uuid) => {
    try {
        downloadingPdf.value = uuid;
        await VehicleInspectionsService.downloadPdf(uuid);
    } catch (error) {
        console.error(error);
        toast('Error', 'No se pudo generar o abrir el PDF', 'error');
    } finally {
        downloadingPdf.value = null;
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

/* License plate styling */
.license-plate-badge {
    background-color: #fcd53f;
    color: #1e293b;
    font-weight: 800;
    font-size: 1.1rem;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    border: 2px solid #1e293b;
    font-family: 'Courier New', Courier, monospace;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: inline-block;
}

/* Avatar Initials */
.avatar-initials {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
}

/* Stats styles */
.bg-soft-primary {
    background-color: rgba(13, 110, 253, 0.1);
}
.bg-soft-success {
    background-color: rgba(25, 135, 84, 0.1);
}
.bg-soft-info {
    background-color: rgba(13, 202, 240, 0.1);
}
.bg-soft-secondary {
    background-color: rgba(108, 117, 125, 0.1);
}

.stat-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.text-slate-800 {
    color: #1e293b;
}

.text-slate-700 {
    color: #334155;
}

.history-dialog :deep(.p-dialog-content) {
    padding: 1.5rem !important;
}

.history-dialog :deep(.p-dialog-header) {
    padding: 1.25rem 1.5rem 0.75rem 1.5rem !important;
    border-bottom: 1px solid #e9ecef;
}

.history-table tbody tr {
    transition: background-color 0.15s ease;
}

.history-table tbody tr:hover {
    background-color: #f8fafc;
}
</style>