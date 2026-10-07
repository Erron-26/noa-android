<template>
    <div class="conductor-dashboard fade-in">
        <!-- ═══════════════════════════════════════════════════════════
             1. HEADER / BIENVENIDA DEL CONDUCTOR
        ═══════════════════════════════════════════════════════════ -->
        <div class="row mb-3">
            <div class="col-12">
                <div class="card border-0 shadow-sm welcome-card overflow-hidden">
                    <div class="card-body p-3 p-md-4">
                        <div class="row align-items-center g-3">
                            <!-- Datos del Conductor -->
                            <div class="col-12 col-lg-7">
                                <div class="d-flex align-items-center">
                                    <div class="avatar avatar-3xl me-2 me-sm-3 flex-shrink-0">
                                        <div class="avatar-name rounded-circle bg-primary text-white fs-4 fw-bold shadow-sm d-flex align-items-center justify-content-center">
                                            <span>{{ driverInitials }}</span>
                                        </div>
                                    </div>
                                    <div class="min-w-0">
                                        <div class="d-flex align-items-center gap-1 gap-sm-2 flex-wrap mb-1">
                                            <span class="badge bg-warning text-dark fw-bold px-2 py-1 fs-11">
                                                <i class="fas fa-steering-wheel me-1" aria-hidden="true"></i> ROL CONDUCTOR
                                            </span>
                                            <span v-if="licenseInfo" class="badge bg-subtle-success text-success fw-semibold fs-11">
                                                <i class="fas fa-id-card me-1" aria-hidden="true"></i> Licencia Cat. {{ licenseInfo.category || 'C2' }} · {{ licenseInfo.status || 'ACTIVA' }}
                                            </span>
                                        </div>
                                        <h1 class="text-900 fw-bold mb-1 fs-18 fs-sm-20 text-truncate h4">
                                            {{ greeting }}, <span class="text-primary">Sr. {{ conductorFirstName }}</span>
                                        </h1>
                                        <p class="text-600 mb-0 fs-11 text-truncate">
                                            <span class="fw-semi-bold">{{ companyName }}</span>
                                            <span v-if="conductorDocument" class="text-400 mx-1">|</span>
                                            <span v-if="conductorDocument" class="text-muted">CC: {{ conductorDocument }}</span>
                                            <span v-if="licenseInfo?.due_date" class="text-400 mx-1">|</span>
                                            <span v-if="licenseInfo?.due_date" class="text-muted">Vence: {{ licenseInfo.due_date }}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Controles de Periodo y Actualización -->
                            <div class="col-12 col-lg-5 text-lg-end">
                                <div class="d-flex align-items-center justify-content-between justify-content-lg-end gap-2 flex-nowrap">
                                    <div class="d-flex align-items-center gap-1 bg-white border rounded px-2 py-1 shadow-xs flex-grow-1 flex-lg-grow-0">
                                        <i class="far fa-calendar-alt text-primary fs-11" aria-hidden="true"></i>
                                        <label class="visually-hidden" for="f-periodo-conductor">Periodo</label>
                                        <select id="f-periodo-conductor" v-model="selectedPeriod" class="form-select form-select-sm border-0 py-0 ps-1 pe-4 shadow-none fs-11 w-100"
                                            style="cursor: pointer;" @change="loadData">
                                            <option value="7">Últimos 7 días</option>
                                            <option value="15">Últimos 15 días</option>
                                            <option value="30">Últimos 30 días</option>
                                            <option value="90">Últimos 3 meses</option>
                                            <option value="365">Este año</option>
                                        </select>
                                    </div>

                                    <button class="btn btn-primary btn-sm px-3 shadow-xs d-inline-flex align-items-center justify-content-center gap-1 flex-shrink-0"
                                        :disabled="isLoading" @click="loadData" title="Actualizar datos del dashboard" aria-label="Actualizar datos del dashboard">
                                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }" aria-hidden="true"></i>
                                        <span>Actualizar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════
             SERVICIO ACTIVO (planilla en ruta)
        ═══════════════════════════════════════════════════════════ -->
        <div v-if="activeService" class="row mb-3">
            <div class="col-12">
                <div class="card border-0 shadow-sm overflow-hidden" :style="esDisponibilidadActiva ? 'border-left: 5px solid #f5803e !important;' : 'border-left: 5px solid #00d27a !important;'">
                    <div class="card-body p-3 p-md-4">
                        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                            <div class="d-flex align-items-center gap-2 flex-shrink-0">
                                <span v-if="esDisponibilidadActiva" class="badge bg-warning text-dark d-flex align-items-center gap-2 px-3 py-2 fw-bold rounded-pill text-uppercase">
                                    <span class="pulse-indicator bg-dark"></span>
                                    En servicio · Disponibilidad
                                </span>
                                <span v-else class="badge bg-success d-flex align-items-center gap-2 px-3 py-2 fw-bold rounded-pill text-uppercase">
                                    <span class="pulse-indicator bg-white"></span>
                                    Servicio activo · En ruta
                                </span>
                            </div>
                            <div class="flex-fill">
                                <h5 class="fw-bold text-900 mb-1">
                                    {{ activeService.project_name || 'Servicio en curso' }}
                                    <span v-if="activeService.vehicle_plate" class="badge bg-subtle-secondary text-dark fw-bold ms-1">
                                        {{ activeService.vehicle_plate }}
                                    </span>
                                    <span v-if="activeService.tracking_active" class="badge bg-subtle-success text-success fw-bold ms-1" title="GPS transmitiendo">
                                        <i class="fas fa-satellite-dish me-1"></i>GPS
                                    </span>
                                </h5>
                                <p class="text-600 fs-11 mb-0">
                                    <span v-if="activeService.start_time">
                                        <i class="far fa-clock me-1"></i>Salida: <strong>{{ activeService.start_time }}</strong>
                                    </span>
                                    <span v-if="activeService.routes_count" class="ms-2">
                                        <i class="fas fa-route me-1"></i>{{ activeService.routes_count }} recorrido{{ activeService.routes_count !== 1 ? 's' : '' }}
                                    </span>
                                    <span v-else class="ms-2 text-warning fw-semibold">
                                        <i class="fas fa-clock me-1"></i>Sin recorridos asignados
                                    </span>
                                    <span v-if="activeService.routes_text" class="d-block text-truncate mt-1" :title="activeService.routes_text">
                                        {{ activeService.routes_text }}
                                    </span>
                                </p>
                            </div>
                            <router-link v-if="activeService.service_uuid" :to="`/planilla-de-control-de-prestacion-servicios/control-de-servicios?service_uuid=${activeService.service_uuid}`"
                                class="btn btn-success btn-sm px-4 py-2 shadow-xs d-inline-flex align-items-center justify-content-center gap-2 w-100 w-md-auto flex-shrink-0">
                                <i class="fas fa-play-circle"></i>
                                <span>Continuar servicio</span>
                            </router-link>
                            <router-link v-else to="/planilla-de-control-de-prestacion-servicios/control-de-servicios"
                                class="btn btn-warning btn-sm px-4 py-2 shadow-xs d-inline-flex align-items-center justify-content-center gap-2 w-100 w-md-auto flex-shrink-0">
                                <i class="fas fa-plus-circle"></i>
                                <span>Abrir servicio</span>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════
             3. ACCESOS DIRECTOS PRINCIPALES (TARJETAS GRANDES)
             Inspecciones, Planillas de Control, FUEC, Hojas de Control
        ═══════════════════════════════════════════════════════════ -->
        <div class="mb-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center gap-2">
                    <div class="section-icon-badge bg-primary text-white">
                        <i class="fas fa-th-large"></i>
                    </div>
                    <div>
                        <h5 class="mb-0 fw-bold text-1000">Módulos de Gestión Rápida</h5>
                        <p class="text-500 fs-11 mb-0">Accesos directos a tus operaciones vehiculares y normativas</p>
                    </div>
                </div>
            </div>

            <div class="row g-3">
                <!-- 1. Listado de Inspecciones -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm module-card card-action-blue">
                        <div class="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex align-items-start justify-content-between mb-3">
                                    <div class="module-avatar bg-subtle-primary text-primary">
                                        <i class="fas fa-tasks-alt fs-2"></i>
                                    </div>
                                    <span class="badge bg-primary bg-opacity-10 text-primary fw-semi-bold fs-11">
                                        {{ kpis.inspections_count }} Registradas
                                    </span>
                                </div>
                                <h5 class="fw-bold text-900 mb-1 fs-16 fs-sm-18">Listado de Inspecciones</h5>
                                <p class="text-600 fs-11 mb-3">
                                    Histórico de inspecciones de seguridad vial pre-operacionales de la flota.
                                </p>
                            </div>
                            <div class="d-flex flex-column gap-2 mt-auto">
                                <router-link to="/inspeccion-vehiculos" class="btn btn-primary btn-sm w-100 shadow-xs d-flex align-items-center justify-content-center gap-2 py-2">
                                    <i class="fas fa-folder-open"></i>
                                    <span>Ver Inspecciones</span>
                                </router-link>
                                <router-link to="/inspeccion-vehiculos/crear" class="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                                    <i class="fas fa-plus"></i>
                                    <span>Nueva Inspección</span>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. Listado de Planillas de Control -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm module-card card-action-amber">
                        <div class="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex align-items-start justify-content-between mb-3">
                                    <div class="module-avatar bg-subtle-warning text-warning">
                                        <i class="fas fa-clipboard-list fs-2"></i>
                                    </div>
                                    <span class="badge bg-warning bg-opacity-10 text-warning fw-semi-bold fs-11">
                                        {{ kpis.control_sheets_count }} Registradas
                                    </span>
                                </div>
                                <h5 class="fw-bold text-900 mb-1 fs-16 fs-sm-18">Listado de Planillas de Control</h5>
                                <p class="text-600 fs-11 mb-3">
                                    Consulta las planillas de control vehicular, verificación de documentos PDF y auditoría de flota.
                                </p>
                            </div>
                            <div class="d-flex flex-column gap-2 mt-auto">
                                <router-link to="/planillas-de-control-de-servicios" class="btn btn-warning btn-sm w-100 text-dark shadow-xs d-flex align-items-center justify-content-center gap-2 py-2">
                                    <i class="fas fa-folder-open"></i>
                                    <span>Ver Planillas</span>
                                </router-link>
                                <router-link to="/planillas-de-control-de-servicios/crear" class="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                                    <i class="fas fa-plus"></i>
                                    <span>Nueva Planilla</span>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Listado de FUEC -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm module-card card-action-green">
                        <div class="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex align-items-start justify-content-between mb-3">
                                    <div class="module-avatar bg-subtle-success text-success">
                                        <i class="fas fa-file-contract fs-2"></i>
                                    </div>
                                    <span class="badge bg-success bg-opacity-10 text-success fw-semi-bold fs-11">
                                        {{ kpis.fuecs_count }} Asignados
                                    </span>
                                </div>
                                <h5 class="fw-bold text-900 mb-1 fs-16 fs-sm-18">Listado de FUEC</h5>
                                <p class="text-600 fs-11 mb-3">
                                    Consulta tus Extractos Únicos de Contrato vigentes, rutas autorizadas y descarga el PDF reglamentario.
                                </p>
                            </div>
                            <div class="d-flex flex-column gap-2 mt-auto">
                                <router-link to="/extracto-de-contrato" class="btn btn-success btn-sm w-100 shadow-xs d-flex align-items-center justify-content-center gap-2 py-2">
                                    <i class="fas fa-file-alt"></i>
                                    <span>Consultar mis FUECs</span>
                                </router-link>
                                <span class="text-center text-muted fs-11 py-1">
                                    <i class="fas fa-shield-check text-success me-1"></i> Documento legal en ruta
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. Hojas de Control de Servicio (PCP) -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm module-card card-action-cyan">
                        <div class="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex align-items-start justify-content-between mb-3">
                                    <div class="module-avatar bg-subtle-info text-info">
                                        <i class="fas fa-route fs-2"></i>
                                    </div>
                                    <span class="badge bg-info bg-opacity-10 text-info fw-semi-bold fs-11">
                                        {{ kpis.service_delivery_count }} Servicios
                                    </span>
                                </div>
                                <h5 class="fw-bold text-900 mb-1 fs-16 fs-sm-18">Hojas de Control de Servicio</h5>
                                <p class="text-600 fs-11 mb-3">
                                    Planillas de Control de Prestación de Servicios (PCP). Registra hora y kilometraje inicial y final de cada recorrido.
                                </p>
                            </div>
                            <div class="d-flex flex-column gap-2 mt-auto">
                                <router-link to="/planilla-de-control-de-prestacion-servicios/control-de-servicios" class="btn btn-info btn-sm w-100 shadow-xs text-white d-flex align-items-center justify-content-center gap-2 py-2">
                                    <i class="fas fa-play-circle"></i>
                                    <span>Registrar Recorrido</span>
                                </router-link>
                                <router-link to="/planilla-de-control-de-prestacion-servicios" class="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                                    <i class="fas fa-table"></i>
                                    <span>Listado de Planillas</span>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════
             4. SECCIÓN DE VEHÍCULOS Y SU KM RECORRIDO
             Cartas de los vehículos que use con su kilometraje
        ═══════════════════════════════════════════════════════════ -->
        <div class="mb-4">
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body p-3 p-md-4">
                    <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 gap-sm-3 mb-3">
                        <div class="d-flex align-items-center gap-2">
                            <div class="section-icon-badge bg-warning text-dark flex-shrink-0">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <div>
                                <h5 class="mb-0 fw-bold text-900 fs-16 fs-sm-18">Vehículos y Control de Kilometraje</h5>
                                <p class="text-500 fs-11 mb-0">
                                    Kilometraje recorrido y lecturas registradas por cada vehículo que conduces
                                </p>
                            </div>
                        </div>

                        <!-- Buscador de Vehículo -->
                        <div class="w-100 w-sm-auto">
                            <div class="input-group input-group-sm search-vehicle-input">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="fas fa-search text-muted"></i>
                                </span>
                                <input v-model="vehicleSearch" type="text" class="form-control border-start-0"
                                    placeholder="Buscar placa o marca..." />
                                <button v-if="vehicleSearch" class="btn btn-light border border-start-0 text-muted" type="button" @click="vehicleSearch = ''">
                                    <i class="fas fa-times fs-11"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Grid de Vehículos -->
                    <div v-if="filteredVehicles.length > 0" class="row g-3">
                        <div v-for="vehicle in filteredVehicles" :key="vehicle.uuid" class="col-12 col-md-6 col-xl-4">
                            <div class="card h-100 border vehicle-card shadow-xs">
                                <div class="card-body p-3">
                                    <!-- Header de la tarjeta del vehículo -->
                                    <div class="d-flex align-items-start justify-content-between mb-3">
                                        <!-- Placa estilo matrícula vehicular -->
                                        <div class="colombia-license-plate shadow-xs">
                                            <div class="plate-top">COLOMBIA</div>
                                            <div class="plate-number">{{ formatPlate(vehicle.plate) }}</div>
                                        </div>

                                        <!-- Badge de estado -->
                                        <div class="text-end">
                                            <span class="badge" :class="vehicle.is_active ? 'bg-subtle-success text-success' : 'bg-subtle-secondary text-secondary'">
                                                <i class="fas fa-circle me-1" style="font-size: 7px;"></i>
                                                {{ vehicle.is_active ? 'HABILITADO' : 'INACTIVO' }}
                                            </span>
                                            <small v-if="vehicle.internal_number" class="d-block text-muted fs-11 mt-1">
                                                Int. #{{ vehicle.internal_number }}
                                            </small>
                                        </div>
                                    </div>

                                    <!-- Datos técnicos del vehículo -->
                                    <div class="mb-3">
                                        <h6 class="fw-bold text-900 mb-1 fs-15">
                                            {{ vehicle.brand }} {{ vehicle.line }}
                                        </h6>
                                        <p class="text-muted fs-11 mb-0">
                                            <span class="badge bg-light text-700 border me-1">{{ vehicle.vehicle_class }}</span>
                                            <span class="badge bg-light text-700 border me-1">Modelo {{ vehicle.model || 'N/A' }}</span>
                                            <span v-if="vehicle.fuel_type" class="badge bg-light text-700 border">{{ vehicle.fuel_type }}</span>
                                        </p>
                                    </div>

                                    <!-- Cuadro de Kilometraje (Odómetro) -->
                                    <div class="odometer-box rounded p-3 mb-3">
                                        <div class="d-flex align-items-baseline justify-content-between">
                                            <span class="text-muted fs-11 text-uppercase fw-semibold">
                                                <i class="fas fa-tachometer-alt me-1 text-primary"></i> Km Actual
                                            </span>
                                            <span class="odometer-display">
                                                {{ formatNumber(vehicle.current_mileage) }} <span class="fs-10">km</span>
                                            </span>
                                        </div>

                                        <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-200">
                                            <span class="text-muted fs-11">
                                                Recorrido periodo:
                                            </span>
                                            <span class="fw-bold text-success fs-11">
                                                +{{ formatNumber(vehicle.km_traveled_period) }} km
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Historial de inspección del vehículo -->
                                    <div class="d-flex align-items-center justify-content-between text-muted fs-11 mb-3">
                                        <span class="text-truncate me-2">
                                            <i class="far fa-clock me-1"></i>
                                            Última insp: <strong class="text-700">{{ vehicle.last_inspection_date || 'Sin registro' }}</strong>
                                        </span>
                                        <span class="badge bg-subtle-primary text-primary flex-shrink-0">
                                            {{ vehicle.inspections_count }} Inspecciones
                                        </span>
                                    </div>

                                    <!-- Acciones directas para este vehículo -->
                                    <div class="d-flex gap-2">
                                        <router-link :to="`/inspeccion-vehiculos/crear?vehicle_uuid=${vehicle.uuid}`"
                                            class="btn btn-subtle-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1 fs-11 py-2">
                                            <i class="fas fa-clipboard-check"></i>
                                            <span>Inspeccionar</span>
                                        </router-link>
                                        <router-link to="/planilla-de-control-de-prestacion-servicios/control-de-servicios"
                                            class="btn btn-subtle-info btn-sm flex-fill d-flex align-items-center justify-content-center gap-1 fs-11 py-2">
                                            <i class="fas fa-route"></i>
                                            <span>Iniciar Recorrido</span>
                                        </router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Estado vacío si no hay vehículos filtrados -->
                    <div v-else class="text-center py-5">
                        <div class="avatar avatar-3xl mx-auto mb-3">
                            <div class="avatar-name rounded-circle bg-light text-muted fs-3">
                                <i class="fas fa-car-side"></i>
                            </div>
                        </div>
                        <h6 class="fw-bold text-700 mb-1">No tienes vehículos asignados</h6>
                        <p class="text-500 fs-11 mb-3">
                            No posees vehículos vinculados a proyectos existentes ni a extractos de contrato (FUEC).
                        </p>
                        <button v-if="vehicleSearch" class="btn btn-outline-secondary btn-sm" @click="vehicleSearch = ''">
                            Limpiar búsqueda
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════
             5. HISTORIAL DE ACTIVIDAD RECIENTE DEL CONDUCTOR
        ═══════════════════════════════════════════════════════════ -->
        <div class="row g-3 g-lg-4">
            <!-- Últimas Inspecciones -->
            <div class="col-12 col-lg-6">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-header bg-light d-flex align-items-center justify-content-between py-2 px-3">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-clipboard-check text-primary"></i>
                            <h6 class="mb-0 fw-bold fs-14">Últimas Inspecciones Registradas</h6>
                        </div>
                        <router-link to="/inspeccion-vehiculos" class="btn btn-link btn-sm text-primary p-0 fs-11 text-decoration-none">
                            Ver todas
                        </router-link>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive scrollbar">
                            <table class="table table-sm table-hover mb-0 fs-11 text-nowrap align-middle">
                                <caption class="visually-hidden">Inspecciones recientes del conductor</caption>
                                <thead class="bg-200 text-700">
                                    <tr>
                                        <th scope="col" class="ps-3 py-2">Fecha</th>
                                        <th scope="col" class="py-2">Vehículo</th>
                                        <th scope="col" class="text-end py-2">Km Reportado</th>
                                        <th scope="col" class="pe-3 text-end py-2">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="recentInspections.length === 0">
                                        <td colspan="4" class="text-center py-4 text-muted">
                                            <i class="far fa-clipboard me-1"></i> No has registrado inspecciones en este periodo.
                                        </td>
                                    </tr>
                                    <tr v-for="item in recentInspections" :key="item.uuid">
                                        <td class="ps-3 fw-semi-bold text-800">
                                            {{ item.date }}
                                        </td>
                                        <td>
                                            <span class="badge bg-subtle-secondary text-dark fw-bold">
                                                {{ item.plate }}
                                            </span>
                                        </td>
                                        <td class="text-end font-sans-serif fw-semi-bold">
                                            {{ formatNumber(item.mileage) }} km
                                        </td>
                                        <td class="pe-3 text-end">
                                            <router-link :to="`/inspeccion-vehiculos`" class="btn btn-falcon-default btn-xs p-1" title="Ver detalle" aria-label="Ver detalle de inspección">
                                                <i class="fas fa-eye text-primary" aria-hidden="true"></i>
                                            </router-link>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Últimos FUECs Asignados -->
            <div class="col-12 col-lg-6">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-header bg-light d-flex align-items-center justify-content-between py-2 px-3">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fas fa-file-contract text-success"></i>
                            <h6 class="mb-0 fw-bold fs-14">FUECs y Contratos Asignados</h6>
                        </div>
                        <router-link to="/extracto-de-contrato" class="btn btn-link btn-sm text-primary p-0 fs-11 text-decoration-none">
                            Ver todos
                        </router-link>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive scrollbar">
                            <table class="table table-sm table-hover mb-0 fs-11 text-nowrap align-middle">
                                <caption class="visually-hidden">FUECs y contratos asignados al conductor</caption>
                                <thead class="bg-200 text-700">
                                    <tr>
                                        <th scope="col" class="ps-3 py-2">N° FUEC</th>
                                        <th scope="col" class="py-2">Vehículo</th>
                                        <th scope="col" class="py-2">Contratante</th>
                                        <th scope="col" class="pe-3 text-end py-2">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="recentFuecs.length === 0">
                                        <td colspan="4" class="text-center py-4 text-muted">
                                            <i class="far fa-file-alt me-1"></i> No tienes FUECs asignados en este periodo.
                                        </td>
                                    </tr>
                                    <tr v-for="fuec in recentFuecs" :key="fuec.uuid">
                                        <td class="ps-3 fw-bold text-primary">
                                            #{{ fuec.number }}
                                        </td>
                                        <td>
                                            <span class="badge bg-subtle-secondary text-dark fw-bold">
                                                {{ fuec.plate }}
                                            </span>
                                        </td>
                                        <td class="text-truncate" style="max-width: 140px;">
                                            {{ fuec.contractor }}
                                        </td>
                                        <td class="pe-3 text-end">
                                            <span class="badge rounded-pill" :class="fuec.status === 'ACTIVO' ? 'bg-subtle-success text-success' : 'bg-subtle-warning text-warning'">
                                                {{ fuec.status || 'GENERADO' }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════
             6. RASTREO GPS AUTOMÁTICO DEL CONDUCTOR (SOLO MAPA)
        ═══════════════════════════════════════════════════════════ -->
        <div class="mb-4 mt-4">
            <div class="d-flex align-items-center gap-2 mb-3">
                <div class="section-icon-badge bg-success text-white">
                    <i class="fas fa-satellite-dish"></i>
                </div>
                <div>
                    <h5 class="mb-0 fw-bold text-1000">Mi Ubicación en Tiempo Real</h5>
                    <p class="text-500 fs-11 mb-0">El rastreo GPS inicia automáticamente al iniciar sesión. La central visualiza tu ruta en vivo.</p>
                </div>
            </div>
            <DriverSelfMap :vehicles="vehiclesList" :preferred-vehicle-uuid="preferredVehicleUuid" />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore, useUserStore } from '@store';
import { useDashboardStore } from '../store/dashboard.store';
import DriverSelfMap from '@/features/tracking/components/DriverSelfMap.vue';
import { primerNombre, iniciales, saludoPorHora, filtrarVehiculos, formatearNumero, formatearPlaca } from '../utils/presentacionConductor.js';

const authStore = useAuthStore();
const userStore = useUserStore();
const dashboardStore = useDashboardStore();

const selectedPeriod = ref('30');
const vehicleSearch = ref('');
const isLoading = computed(() => dashboardStore.isLoading);


// Datos reactivos del store
const conductorData = computed(() => dashboardStore.conductorData || {});
const conductorName = computed(() => {
    return conductorData.value.conductor?.name || userStore.fullName || userStore.username || 'Conductor';
});
const conductorDocument = computed(() => conductorData.value.conductor?.document || null);
const companyName = computed(() => authStore.currentTenant?.name || userStore.companyName || 'Falcon Transportes S.A.S.');
const licenseInfo = computed(() => conductorData.value.conductor?.license || null);
const kpis = computed(() => conductorData.value.kpis || {
    total_km: 0,
    vehicles_count: 0,
    inspections_count: 0,
    fuecs_count: 0,
    control_sheets_count: 0,
    service_delivery_count: 0,
});
const vehiclesList = computed(() => conductorData.value.vehicles || []);
const recentInspections = computed(() => conductorData.value.recent_inspections || []);
const recentFuecs = computed(() => conductorData.value.recent_fuecs || []);
const activeService = computed(() => conductorData.value.active_service || null);
const esDisponibilidadActiva = computed(() => {
    if (!activeService.value) return false;
    if (activeService.value.service_mode && activeService.value.service_mode !== 'CON_RECORRIDOS') return true;
    return !activeService.value.routes_count;
});

const conductorFirstName = computed(() => primerNombre(conductorData.value.conductor?.name || userStore.fullName || userStore.username));
const greeting = computed(() => saludoPorHora());
const driverInitials = computed(() => iniciales(conductorName.value));
const filteredVehicles = computed(() => filtrarVehiculos(vehiclesList.value, vehicleSearch.value));
const formatNumber = formatearNumero;
const formatPlate = formatearPlaca;

const preferredVehicleUuid = computed(() => {
    const serviceVehicle = conductorData.value.active_service?.vehicle_uuid;
    if (serviceVehicle) return serviceVehicle;
    const firstVehicle = vehiclesList.value[0];
    return firstVehicle?.uuid || null;
});





// Cargar datos
const loadData = async () => {
    await dashboardStore.fetchConductorDashboardData(Number(selectedPeriod.value));
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   ESTILOS PREMIUM CONDUCTOR DASHBOARD
═══════════════════════════════════════════════════════════ */
.conductor-dashboard {
    width: 100%;
    max-width: 100%;
}

.welcome-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafd 100%);
    border-left: 5px solid var(--bs-primary) !important;
}

.dark .welcome-card {
    background: linear-gradient(135deg, #1b1e22 0%, #15171a 100%);
    border-left: 5px solid var(--bs-primary) !important;
}

/* Iconos de sección */
.section-icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

/* KPI Cards */
.kpi-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-radius: 10px;
}

.kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
}

.kpi-km {
    border-left: 4px solid var(--bs-primary) !important;
}

.kpi-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.text-purple {
    color: #6f42c1 !important;
}

.bg-purple {
    background-color: #6f42c1 !important;
}

/* Tarjetas de Módulos (Accesos Rápidos) */
.module-card {
    border-radius: 12px;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
    overflow: hidden;
    position: relative;
}

.module-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1) !important;
}

.card-action-blue {
    border-top: 4px solid #2c7be5 !important;
}

.card-action-amber {
    border-top: 4px solid #f5803e !important;
}

.card-action-green {
    border-top: 4px solid #00d27a !important;
}

.card-action-cyan {
    border-top: 4px solid #27bcfd !important;
}

.module-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Tarjetas de Vehículos */
.vehicle-card {
    border-radius: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    background-color: #ffffff;
}

.dark .vehicle-card {
    background-color: #1b1e22;
    border-color: #2c3238 !important;
}

.vehicle-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
}

/* Placa Vehicular Colombiana Realista */
.colombia-license-plate {
    background: linear-gradient(180deg, #ffdf00 0%, #f4c430 100%);
    border: 2px solid #212529;
    border-radius: 6px;
    padding: 3px 12px 4px;
    display: inline-block;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.plate-top {
    font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: #1a1a1a;
    line-height: 1;
    margin-bottom: 2px;
}

.plate-number {
    font-family: 'Bebas Neue', 'DM Sans', impact, sans-serif;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 1px;
    color: #111111;
    line-height: 1;
}

/* Odómetro */
.odometer-box {
    background-color: #f8f9fa;
    border: 1px solid #edf2f9;
}

.dark .odometer-box {
    background-color: #16181b;
    border-color: #25282c;
}

.odometer-display {
    font-family: 'Bebas Neue', 'DM Sans', monospace, sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #2c7be5;
    letter-spacing: 0.5px;
    font-variant-numeric: tabular-nums;
}

/* Los tamaños globales .fs-10 y .fs-11 son fraccionarios (13.33px y 11.11px)
   y el texto pequeño se ve pixelado. Dentro del odómetro se usa 12px enteros
   y cifras tabulares. */
.odometer-box .fs-10,
.odometer-box .fs-11 {
    font-size: 12px !important;
    font-variant-numeric: tabular-nums;
}

/* Indicador pulsante de servicio activo */
.pulse-indicator {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    display: inline-block;
    animation: pulse-ring 1.4s ease-out infinite;
}

@keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
    70% { box-shadow: 0 0 0 7px rgba(255, 255, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

/* Utilitarios */
.shadow-xs {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important;
}

.btn-subtle-primary {
    background-color: rgba(44, 123, 229, 0.1);
    color: #2c7be5;
    border: 1px solid rgba(44, 123, 229, 0.2);
}

.btn-subtle-primary:hover {
    background-color: #2c7be5;
    color: #ffffff;
}

.btn-subtle-info {
    background-color: rgba(39, 188, 253, 0.1);
    color: #179ed4;
    border: 1px solid rgba(39, 188, 253, 0.2);
}

.btn-subtle-info:hover {
    background-color: #179ed4;
    color: #ffffff;
}

.btn-xs {
    padding: 0.15rem 0.4rem;
    font-size: 0.75rem;
}

/* Responsive adjustments for mobile screens */
@media (max-width: 575.98px) {
    .conductor-dashboard {
        padding-left: 2px;
        padding-right: 2px;
    }

    .welcome-card .avatar-3xl {
        width: 44px;
        height: 44px;
    }

    .welcome-card .avatar-name {
        font-size: 1.1rem !important;
    }

    .search-vehicle-input {
        width: 100% !important;
        max-width: 100% !important;
    }

    .colombia-license-plate {
        padding: 2px 8px 3px;
    }

    .plate-number {
        font-size: 16px;
    }

    .odometer-display {
        font-size: 18px;
    }

    .module-card .card-body {
        padding: 0.75rem !important;
    }

    .table-responsive {
        -webkit-overflow-scrolling: touch;
    }

    .row.g-3 {
        --bs-gutter-y: 0.5rem !important;
        --bs-gutter-x: 0.5rem !important;
    }

    .mb-3, .mb-4 {
        margin-bottom: 0.65rem !important;
    }

    .card-body {
        padding: 0.75rem !important;
    }
}

@media (min-width: 576px) {
    .search-vehicle-input {
        max-width: 280px;
    }
}
</style>
