<template>
    <BasePageHeader
        title="Perfil de Vehículo"
        :subtitle="isViewLoading ? '' : `${vehicle.brand?.description || ''} ${vehicle.line || ''} ${vehicle.model || ''}`"
        :breadcrumbs="breadcrumbs"
        :loading="isViewLoading"
        icon="fad fa-car"
        show-bg
        @back="goBack"
    >
        <template #title-after>
            <span v-if="vehicle.internal_number && !isViewLoading"
                class="badge bg-primary bg-opacity-10 text-primary border-primary border-opacity-25"
                style="font-size: 0.65rem;">
                <i class="fad fa-hashtag me-1"></i>{{ vehicle.internal_number }}
            </span>
        </template>

        <template #actions>
            <button v-if="!isViewLoading" class="btn btn-falcon-default btn-sm px-3" @click="goCompleteDocuments"
                :disabled="checkingDocs" :aria-busy="checkingDocs" title="Revisar documentos del vehículo" data-bs-toggle="tooltip">
                <i class="fas fa-file-circle-plus me-1" style="font-size: 12px;"></i>
                <span class="d-none d-sm-inline" style="font-size: 0.8rem;">Revisar documentos</span>
            </button>
            <button v-if="can('update', 'Vehicle') && !isViewLoading" class="btn btn-primary btn-sm px-3" @click="editVehicle"
                title="Editar vehículo" data-bs-toggle="tooltip">
                <i class="fas fa-pen me-1" style="font-size: 12px;"></i>
                <span class="d-none d-sm-inline" style="font-size: 0.8rem;">Editar</span>
            </button>
            <button class="btn btn-falcon-default btn-sm px-3" @click="goBack" title="Volver al listado"
                data-bs-toggle="tooltip">
                <i class="fas fa-arrow-left me-1" style="font-size: 12px;"></i>
                <span class="d-none d-sm-inline" style="font-size: 0.8rem;">Volver</span>
            </button>
        </template>
    </BasePageHeader>

    <VehicleDocumentsMenu
        v-model="showDocsMenu"
        :vehicle-uuid="vehicle.uuid || route.params.id"
        :vehicle-label="vehicle.vehicle_license_plate || ''"
    />

    <!-- SKELETON LOADING -->
    <div v-if="isViewLoading" class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="col-12 col-xxl-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body d-flex gap-4 flex-column flex-sm-row align-items-center py-4 g-2 g-md-3">
                    <div class="skeleton-avatar rounded-3 flex-shrink-0" style="width: 100px; height: 100px;"></div>
                    <div class="w-100">
                        <div class="row g-2">
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="i in 6" :key="i">
                                <div class="skeleton-text" style="height: 14px; width: 90%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <!-- ✅ SECCIÓN 1: IDENTIFICACIÓN DEL VEHÍCULO -->
        <div class="col-12 col-lg-7">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-id-card-alt text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Identificación</h6>
                </div>
                <div class="card-body py-3">
                    <div class="d-flex gap-3 flex-column flex-sm-row align-items-start g-2 g-md-3">
                        <!-- Icono/Avatar del vehículo -->
                        <div class="text-center flex-shrink-0">
                            <div class="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center fw-bold"
                                style="width: 100px; height: 100px; font-size: 2rem;">
                                <i class="fad fa-car-side"></i>
                            </div>
                        </div>

                        <!-- Datos de identificación -->
                        <div class="w-100">
                            <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
                                <dt class="col-5 text-muted fw-medium">Placa:</dt>
                                <dd class="col-7 text-dark fw-semibold font-monospace">
                                    {{ vehicle.vehicle_license_plate || '—' }}
                                </dd>

                                <dt class="col-5 text-muted fw-medium mt-1">Licencia de tránsito:</dt>
                                <dd class="col-7 text-dark font-monospace mt-1">
                                    {{ vehicle.transit_license_number || '—' }}
                                </dd>

                                <dt class="col-5 text-muted fw-medium mt-1">Tipo de servicio:</dt>
                                <dd class="col-7 text-dark mt-1">
                                    <span class="badge"
                                        :class="vehicle.type_of_service === 'PUBLICO' ? 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-25' : 'bg-light text-dark border'"
                                        style="font-size: 0.7rem;">
                                        <i class="fad fa-bus me-1"></i>{{ vehicle.type_of_service || '—' }}
                                    </span>
                                </dd>

                                <dt class="col-5 text-muted fw-medium mt-1">Clase de vehículo:</dt>
                                <dd class="col-7 text-dark mt-1">
                                    {{ vehicle.vehicle_class?.description || '—' }}
                                </dd>

                                <dt class="col-5 text-muted fw-medium mt-1">Marca / Línea:</dt>
                                <dd class="col-7 text-dark mt-1">
                                    {{ vehicle.brand?.description }} {{ vehicle.line }}
                                </dd>

                                <dt class="col-5 text-muted fw-medium mt-1">Modelo / Color:</dt>
                                <dd class="col-7 text-dark mt-1">
                                    {{ vehicle.model }} •
                                    <span class="badge bg-light border text-dark ms-1" style="font-size: 0.7rem;">
                                        {{ vehicle.color }}
                                    </span>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ✅ SECCIÓN 2: ESTADO Y CONFIGURACIÓN -->
        <div class="col-12 col-lg-5">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-toggle-on text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Estado</h6>
                </div>
                <div class="card-body py-3">
                    <dl class="row mb-0 small g-2 g-md-3 align-items-center" style="font-size: 0.85rem;">
                        <dt class="col-5 text-muted fw-medium">Estado:</dt>
                        <dd class="col-7 mt-0 mb-0">
                            <span class="badge rounded-pill"
                                :class="isVehicleActive ? 'badge-subtle-success' : 'badge-subtle-warning'"
                                style="font-size: 0.7rem; padding: 0.25em 0.6em;">
                                <i :class="statusIcon" class="me-1"></i>
                                {{ statusLabel }}
                            </span>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Pago exacto:</dt>
                        <dd class="col-7 mt-0 mb-0">
                            <span class="badge rounded-pill"
                                :class="isExactPayment ? 'badge-subtle-success' : 'badge-subtle-secondary'"
                                style="font-size: 0.7rem; padding: 0.25em 0.6em;">
                                <i :class="isExactPayment ? 'fad fa-check-circle' : 'fad fa-minus-circle'"
                                    class="me-1"></i>
                                {{ isExactPayment ? 'Obligatorio' : 'Opcional' }}
                            </span>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Registro:</dt>
                        <dd class="col-7 text-dark mt-0 mb-0">
                            {{ formatDate(vehicle.registration_date) }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Autoridad tránsito:</dt>
                        <dd class="col-7 text-dark mt-0 mb-0 small">
                            {{ vehicle.transit_authority || '—' }}
                        </dd>
                    </dl>

                    <!-- Indicadores rápidos -->
                    <div class="border-top mt-3 pt-3">
                        <div class="row g-2">
                            <div class="col-6">
                                <div class="p-2 bg-success bg-opacity-10 rounded text-center">
                                    <small class="text-success d-block">Documentos</small>
                                    <span class="fw-semibold text-success">{{ validDocumentsCount }}/4</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="p-2 bg-primary bg-opacity-10 rounded text-center">
                                    <small class="text-primary d-block">Cuotas</small>
                                    <span class="fw-semibold text-primary">{{ pendingChargesCount }} Pend.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ✅ SECCIÓN REPORTES PDF CONSOLIDADOS -->
    <div v-if="!isViewLoading" class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-file-pdf text-danger" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Documentos y Reportes PDF</h6>
                </div>
                <div class="card-body py-3">
                    <div class="row g-3">
                        <!-- Botón: Ficha Técnica -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <button class="btn btn-falcon-default w-100 p-3 justify-content-start text-start" 
                                @click="handleDownloadTechnicalSheet" 
                                :disabled="isDownloading || isViewLoading">
                                <i class="fad fa-file-invoice text-danger me-3" style="font-size: 24px;"></i>
                                <div>
                                    <span class="d-block fw-semibold text-dark" style="font-size: 0.85rem;">Ficha Técnica PDF</span>
                                    <small class="text-muted d-block" style="font-size: 0.75rem;">Especificaciones y características del vehículo</small>
                                </div>
                            </button>
                        </div>
                        <!-- Botón: Hoja de Vida Vehicular -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <button class="btn btn-falcon-default w-100 p-3 justify-content-start text-start" 
                                @click="handleDownloadVehicleHistory" 
                                :disabled="isDownloadingHistory || isViewLoading">
                                <i class="fad fa-history text-primary me-3" style="font-size: 24px;"></i>
                                <div>
                                    <span class="d-block fw-semibold text-dark" style="font-size: 0.85rem;">Hoja de Vida Vehicular</span>
                                    <small class="text-muted d-block" style="font-size: 0.75rem;">Información general y documentos asociados</small>
                                </div>
                            </button>
                        </div>
                        <!-- Botón: Historial de Mantenimientos -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <button class="btn btn-falcon-default w-100 p-3 justify-content-start text-start" 
                                @click="handleDownloadMaintenanceHistory" 
                                :disabled="isDownloadingMaintenance || isViewLoading">
                                <i class="fad fa-tools text-success me-3" style="font-size: 24px;"></i>
                                <div>
                                    <span class="d-block fw-semibold text-dark" style="font-size: 0.85rem;">Historial de Mantenimiento</span>
                                    <small class="text-muted d-block" style="font-size: 0.75rem;">Detalle de preventivos y correctivos registrados</small>
                                </div>
                            </button>
                        </div>
                        <!-- Botón: Acta de Entrega -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <button class="btn btn-falcon-default w-100 p-3 justify-content-start text-start" 
                                @click="handleDownloadHandoverRecord" 
                                :disabled="isDownloadingHandover || isViewLoading">
                                <i class="fad fa-clipboard-list text-secondary me-3" style="font-size: 24px;"></i>
                                <div>
                                    <span class="d-block fw-semibold text-dark" style="font-size: 0.85rem;">Acta de Entrega</span>
                                    <small class="text-muted d-block" style="font-size: 0.75rem;">Formato de entrega del vehículo al conductor</small>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <!-- ✅ SECCIÓN 3: ESPECIFICACIONES TÉCNICAS -->
        <div class="col-12 col-lg-6">
            <div class="card border-0 shadow-sm h-100 d-flex flex-column">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-cogs text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Especificaciones Técnicas</h6>
                </div>
                <div class="card-body py-3 flex-grow-1 d-flex flex-column">
                    <dl class="spec-list row mb-0 small g-2 g-md-3 flex-grow-1">
                        <dt class="col-6 text-muted fw-medium">Número de serie:</dt>
                        <dd class="col-6 text-dark font-monospace">{{ vehicle.serial_number || '—' }}</dd>

                        <dt class="col-6 text-muted fw-medium">Número de motor:</dt>
                        <dd class="col-6 text-dark font-monospace">{{ vehicle.engine_number || '—' }}</dd>

                        <dt class="col-6 text-muted fw-medium">Chassis / VIN:</dt>
                        <dd class="col-6 text-dark font-monospace">{{ vehicle.vin_number || '—' }}</dd>

                        <dt class="col-6 text-muted fw-medium">Cilindraje:</dt>
                        <dd class="col-6 text-dark">{{ vehicle.engine_displacement }} cm³</dd>

                        <dt class="col-6 text-muted fw-medium">Tipo de carrocería:</dt>
                        <dd class="col-6 text-dark">{{ vehicle.body_type || '—' }}</dd>

                        <dt class="col-6 text-muted fw-medium">Tipo de combustible:</dt>
                        <dd class="col-6 text-dark">
                            <span class="badge bg-light text-dark border" style="font-size: 0.7rem;">
                                <i class="fad fa-gas-pump me-1"></i>{{ vehicle.fuel_type }}
                            </span>
                        </dd>

                        <dt class="col-6 text-muted fw-medium">Puertas:</dt>
                        <dd class="col-6 text-dark">{{ vehicle.doors }}</dd>

                        <dt class="col-6 text-muted fw-medium">Ejes:</dt>
                        <dd class="col-6 text-dark">{{ vehicle.number_of_axles }}</dd>

                        <dt class="col-6 text-muted fw-medium">Capacidad de carga:</dt>
                        <dd class="col-6 text-dark">{{ vehicle.load_capacity }} kg</dd>

                        <dt class="col-6 text-muted fw-medium">Peso bruto vehicular:</dt>
                        <dd class="col-6 text-dark">{{ vehicle.gross_vehicle_weight }} kg</dd>

                        <dt class="col-6 text-muted fw-medium">Pasajeros sentados:</dt>
                        <dd class="col-6 text-dark">{{ vehicle.seated_passenger_capacity || '—' }}</dd>
                    </dl>
                </div>
            </div>
        </div>
        <div class="col-12 col-lg-6">
            <!-- ✅ SECCIÓN 4: PROPIETARIO / TERCERO -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-user-tie text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Propietario</h6>
                </div>
                <div class="card-body py-3">
                    <div class="d-flex align-items-center gap-3">
                        <!-- Avatar del propietario -->
                        <div class="bg-secondary bg-opacity-10 text-secondary rounded-3 d-flex align-items-center justify-content-center fw-bold"
                            style="width: 60px; height: 60px; font-size: 1rem;">
                            <i class="fad fa-user"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="mb-0 fw-semibold text-dark" style="font-size: 0.95rem;">
                                {{ ownerDisplayName }}
                            </h6>
                            <small v-if="vehicle.third_party?.document_number" class="text-muted d-block mt-1 font-monospace" style="font-size: 0.75rem;">
                                <i class="fad fa-id-card me-1"></i>
                                {{ vehicle.third_party.document_number }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-id-badge text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Tarjeta de Operación</h6>
                </div>
                <!-- ✅ SECCIÓN 6: TARJETA DE OPERACIÓN -->
                <div class="card-body py-3">
                    <template v-if="vehicle.operation_cards?.length">
                    <div v-for="card in vehicle.operation_cards" :key="card.uuid"
                        class="list-group list-group-flush small">
                        <div class="list-group-item py-2 px-0 border-0">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <span class="fw-medium text-dark font-monospace"> <i
                                            class="fad fa-building me-1"></i>
                                        {{ card.affiliated_company }}</span>
                                    <small class="text-muted d-block">
                                        <i class="fad fa-id-badge me-1"></i>{{ card.operating_card_number }}
                                    </small>
                                    <small class="text-muted d-block">
                                        <i class="fad fa-route me-1"></i>{{ card.area_of_coverage }} •
                                        <i class="fad fa-tag me-1"></i>{{ card.service_type }} •
                                        <i class="fad fa-users me-1"></i>{{ card.transport_mode }}
                                    </small>
                                </div>
                                <div class="text-end">
                                    <span class="badge rounded-pill"
                                        :class="isDocumentValid(card.expiration_date) ? 'badge-subtle-success' : 'badge-subtle-danger'"
                                        style="font-size: 0.7rem;">
                                        {{ isDocumentValid(card.expiration_date) ? 'Vigente' : 'Vencida' }}
                                    </span>
                                    <small class="text-muted d-block mt-1">
                                        Vence: {{ formatDateShort(card.expiration_date) }}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                    </template>
                    <p v-else class="text-muted small mb-0">Sin tarjeta de operación registrada</p>
                </div>
            </div>
            <div class="card border-0 shadow-sm mt-4">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-handshake text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Acuerdos de Colaboración</h6>
                </div>
                <div class="card-body py-3">
                    <div v-if="vehicle.business_collaboration_agreements?.length" class="list-group list-group-flush small">
                        <div v-for="agreement in vehicle.business_collaboration_agreements" :key="agreement.uuid"
                            class="list-group-item py-2 px-0 border-0">
                            <div class="d-flex justify-content-between align-items-start gap-2">
                                <div class="flex-grow-1">
                                    <span class="fw-medium text-dark d-block" style="font-size: 0.85rem;">
                                        <i class="fad fa-building me-1 text-primary"></i>
                                        {{ agreement.contracting_entity_name || '—' }}
                                    </span>
                                    <small class="text-muted d-block mt-1">
                                        <i class="fad fa-hashtag me-1"></i>
                                        Convenio Nº {{ agreement.agreement_internal_id || '—' }}
                                    </small>
                                </div>
                                <div class="text-end flex-shrink-0">
                                    <span class="badge rounded-pill"
                                        :class="isDocumentValid(agreement.expiry_date) ? 'badge-subtle-success' : 'badge-subtle-danger'"
                                        style="font-size: 0.7rem;">
                                        {{ isDocumentValid(agreement.expiry_date) ? 'Vigente' : 'Vencido' }}
                                    </span>
                                    <small class="text-muted d-block mt-1">
                                        Vence: {{ formatDateShort(agreement.expiry_date) }}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-muted small mb-0">Sin convenio de colaboración</p>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <!-- ✅ SECCIÓN 5: DOCUMENTOS DEL VEHÍCULO -->
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div
                    class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-file-contract text-primary" style="font-size: 14px;"></i>
                        <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">
                            Documentos y Seguros ({{ vehicle.vehicle_documents?.length || 0 }})
                        </h6>
                    </div>
                    <div class="d-flex gap-2">
                        <span class="badge badge-subtle-success" style="font-size: 0.7rem;">
                            <i class="fad fa-check me-1"></i>{{ validDocumentsCount }} Vigentes
                        </span>
                        <span class="badge badge-subtle-warning" style="font-size: 0.7rem;">
                            <i class="fad fa-clock me-1"></i>{{ expiringSoonCount }} Por vencer
                        </span>
                    </div>
                </div>
                <div class="card-body py-3">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover align-middle mb-0 small" style="font-size: 0.8rem;">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-3">Tipo</th>
                                    <th>Póliza / Número</th>
                                    <th>Entidad Emisora</th>
                                    <th class="text-center">Vigencia</th>
                                    <th class="text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="doc in vehicle.vehicle_documents" :key="doc.uuid">
                                    <td class="ps-3">
                                        <span class="fw-medium text-dark d-flex align-items-center gap-1">
                                            <i :class="getDocumentIcon(doc.document_type)" class="text-primary"></i>
                                            {{ doc.document_type }}
                                        </span>
                                        <small v-if="doc.tariff_code" class="text-muted d-block font-monospace"
                                            style="font-size: 0.7rem;">
                                            Código: {{ doc.tariff_code }}
                                        </small>
                                    </td>
                                    <td>
                                        <span class="fw-medium font-monospace">{{ doc.policy_number }}</span>
                                    </td>
                                    <td>
                                        <small class="text-dark">{{ doc.issuing_entity }}</small>
                                    </td>
                                    <td class="text-center">
                                        <small class="text-muted d-block">Hasta: {{ formatDateShort(doc.expiry_date) }}</small>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge rounded-pill" :class="getDocumentStatusClass(doc)"
                                            style="font-size: 0.65rem; padding: 0.2em 0.5em;">
                                            {{ getDocumentStatusLabel(doc) }}
                                        </span>
                                        <small v-if="isExpiringSoon(doc.expiry_date)" class="text-warning d-block mt-1"
                                            style="font-size: 0.65rem;">
                                            <i class="fad fa-exclamation-triangle me-1"></i>Vence pronto
                                        </small>
                                    </td>
                                </tr>
                                <tr v-if="!vehicle.vehicle_documents?.length">
                                    <td colspan="5" class="text-center text-muted py-3 small">
                                        No hay documentos registrados
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <!-- ✅ SECCIÓN 7: CUOTAS DE ADMINISTRACIÓN -->
        <div class="col-12 col-lg-12">
            <div class="card border-0 shadow-sm">
                <div
                    class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-receipt text-primary" style="font-size: 14px;"></i>
                        <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Cuotas de Administración</h6>
                    </div>
                    <span class="badge badge-subtle-warning" style="font-size: 0.7rem;">
                        {{ pendingChargesCount }} Pendiente(s)
                    </span>
                </div>
                <div class="card-body py-3">
                    <template v-if="vehicle.affiliate_admin_charges?.length">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover align-middle mb-0 small" style="font-size: 0.8rem;">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-3">Próximo Pago</th>
                                    <th class="text-center">Fecha Pago</th>
                                    <th class="text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="charge in vehicle.affiliate_admin_charges.slice(0, 5)"
                                    :key="charge.next_payment_date">
                                    <td class="ps-3 fw-medium">{{ formatDateShort(charge.next_payment_date) }}</td>
                                    <td class="text-center text-muted">
                                        {{ charge.payment_date ? formatDateShort(charge.payment_date) : '—' }}
                                    </td>
                                    <td class="text-center">
                                        <span class="badge rounded-pill"
                                            :class="charge.status === 'PAGADO' ? 'badge-subtle-success' : 'badge-subtle-warning'"
                                            style="font-size: 0.65rem; padding: 0.2em 0.5em;">
                                            {{ charge.status }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-if="vehicle.affiliate_admin_charges.length > 5" class="text-center mt-2">
                        <small class="text-muted">+ {{ vehicle.affiliate_admin_charges.length - 5 }} registros
                            más</small>
                    </div>
                    </template>
                    <p v-else class="text-muted small mb-0">Sin cuotas de administración registradas</p>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">

        <!-- ✅ SECCIÓN 8: MANTENIMIENTOS -->
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-tools text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Mantenimientos</h6>
                </div>
                <div class="card-body py-3">
                    <div v-if="vehicle.maintenances?.length" class="list-group list-group-flush small">
                        <div v-for="maint in vehicle.maintenances" :key="maint.uuid"
                            class="list-group-item py-2 px-0 border-0">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="fw-medium text-dark">{{ maint.maintenance_type }}</span>
                                    <small class="text-muted d-block">
                                        <i class="fad fa-calendar me-1"></i>Próximo: {{
                                            formatDateShort(maint.next_maintenance_date) }}
                                    </small>
                                </div>
                                <span class="badge rounded-pill"
                                    :class="maint.status === 1 ? 'badge-subtle-success' : 'badge-subtle-warning'"
                                    style="font-size: 0.7rem;">
                                    {{ maint.status === 1 ? 'Activo' : 'Inactivo' }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-muted small mb-0">No se han registrado mantenimientos</p>
                </div>
            </div>
        </div>

    </div>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVehiclesStore } from '../store/vehicles.store.js';
import { usePermissionsStore } from '@store';
import VehiclesService from '../services/vehicles.service.js';
import { useToast } from 'vue-toastification';
import { logger } from '@/utils/logger.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import VehicleDocumentsMenu from '../components/VehicleDocumentsMenu.vue';

// ===== DEPENDENCIAS =====
const route = useRoute();
const router = useRouter();
const store = useVehiclesStore();
const permissionsStore = usePermissionsStore();
const can = (action, subject) => permissionsStore.can(action, subject);

// ===== ESTADO =====
const vehicle = ref({});
const isViewLoading = ref(true);
const isDownloading = ref(false);
const isDownloadingHistory = ref(false);
const isDownloadingMaintenance = ref(false);
const isDownloadingHandover = ref(false);
const toast = useToast();

// ===== COMPUTED: BÁSICOS =====
const breadcrumbs = computed(() => [
    { to: '/vehiculos', label: 'Vehículos' },
    { label: vehicle.value.vehicle_license_plate || 'Detalle' }
]);

const isVehicleActive = computed(() =>
    vehicle.value.is_active === true || vehicle.value.is_active === 1 || vehicle.value.is_active === '1'
);

const isExactPayment = computed(() =>
    vehicle.value.exact_payment === true || vehicle.value.exact_payment === 1 || vehicle.value.exact_payment === '1'
);

const statusLabel = computed(() =>
    isVehicleActive.value ? 'Activo' : 'Inactivo'
);

const statusIcon = computed(() =>
    isVehicleActive.value
        ? 'fad fa-check-circle'
        : 'fad fa-pause-circle'
);

const ownerDisplayName = computed(() => {
    const tp = vehicle.value.third_party;
    if (!tp) return 'Sin asignar';
    // Personas naturales (first_name / last_name)
    if (tp.first_name || tp.last_name) {
        return [tp.first_name, tp.last_name].filter(Boolean).join(' ');
    }
    // Personas jurídicas (trade_name o company_name)
    if (tp.company_name) return tp.company_name;
    if (tp.trade_name) return tp.trade_name;
    // Fallback al documento antes que a identificadores internos
    if (tp.document_number) return `Documento: ${tp.document_number}`;
    return 'Sin asignar';
});

const validDocumentsCount = computed(() => {
    return vehicle.value.vehicle_documents?.filter(doc =>
        doc.status === 'VIGENTE' || doc.status === 'SI' || isDocumentValid(doc.expiry_date)
    ).length || 0;
});

const expiringSoonCount = computed(() => {
    const daysThreshold = 30;
    return vehicle.value.vehicle_documents?.filter(doc =>
        isExpiringSoon(doc.expiry_date, daysThreshold) &&
        (doc.status === 'VIGENTE' || doc.status === 'SI')
    ).length || 0;
});

const pendingChargesCount = computed(() => {
    return vehicle.value.affiliate_admin_charges?.filter(c => c.status === 'PENDIENTE').length || 0;
});

// ===== UTILIDADES DE FORMATO =====
const formatDate = (date) => {
    if (!date) return '—';
    try {
        return new Date(date).toLocaleDateString('es-CO', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch { return '—'; }
};

const formatDateShort = (date) => {
    if (!date) return '—';
    try {
        return new Date(date).toLocaleDateString('es-CO', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    } catch { return '—'; }
};



const isDocumentValid = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) > new Date();
};

const isExpiringSoon = (expiryDate, days = 30) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threshold = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return expiry <= threshold && expiry > today;
};

const getDocumentIcon = (type) => {
    const icons = {
        'SOAT': 'fad fa-shield-alt',
        'RCE': 'fad fa-file-contract',
        'RCC': 'fad fa-file-invoice',
        'RTM': 'fad fa-clipboard-check',
        'TECNOMECÁNICA': 'fad fa-wrench'
    };
    return icons[type] || 'fad fa-file';
};

const getDocumentStatusClass = (doc) => {
    if (doc.status === 'VENCIDO' || !isDocumentValid(doc.expiry_date)) return 'badge-subtle-danger';
    if (isExpiringSoon(doc.expiry_date)) return 'badge-subtle-warning';
    return 'badge-subtle-success';
};

const getDocumentStatusLabel = (doc) => {
    if (doc.status === 'VENCIDO') return 'Vencido';
    if (!isDocumentValid(doc.expiry_date)) return 'Vencido';
    if (isExpiringSoon(doc.expiry_date)) return 'Por vencer';
    return 'Vigente';
};

// ===== NAVEGACIÓN Y ACCIONES =====
const goBack = () => {
    router.push('/vehiculos');
};

const editVehicle = () => {
    if (vehicle.value.uuid && can('update', 'Vehicle')) {
        router.push(`/vehiculos/editar/${vehicle.value.uuid}`);
    }
};

/** Abre el menú de gestión documental (faltantes, edición y registro nuevo) */
const showDocsMenu = ref(false);
const checkingDocs = ref(false);
const goCompleteDocuments = () => {
    if (!vehicle.value.uuid && !route.params.id) return;
    showDocsMenu.value = true;
};

const handleDownloadTechnicalSheet = async () => {
    if (!vehicle.value.uuid) return;

    isDownloading.value = true;
    try {
        await VehiclesService.downloadTechnicalSheet(vehicle.value.uuid);
        toast.success('Ficha técnica generada correctamente');
    } catch (error) {
        logger.error('Error al descargar ficha técnica:', { message: error?.message ?? error });        toast.error('No se pudo generar la ficha técnica');
    } finally {
        isDownloading.value = false;
    }
};

const handleDownloadVehicleHistory = async () => {
    if (!vehicle.value.uuid) return;

    isDownloadingHistory.value = true;
    try {
        await VehiclesService.downloadVehicleHistory(vehicle.value.uuid);
        toast.success('Hoja de vida generada correctamente');
    } catch (error) {
        logger.error('Error al descargar hoja de vida:', { message: error?.message ?? error });
        toast.error('No se pudo generar la hoja de vida');
    } finally {
        isDownloadingHistory.value = false;
    }
};

const handleDownloadMaintenanceHistory = async () => {
    if (!vehicle.value.uuid) return;

    isDownloadingMaintenance.value = true;
    try {
        await VehiclesService.downloadMaintenanceHistory(vehicle.value.uuid);
        toast.success('Historial de mantenimiento generado correctamente');
    } catch (error) {
        logger.error('Error al descargar historial de mantenimiento:', { message: error?.message ?? error });
        toast.error('No se pudo generar el historial de mantenimiento');
    } finally {
        isDownloadingMaintenance.value = false;
    }
};

const handleDownloadHandoverRecord = async () => {
    if (!vehicle.value.uuid) return;

    isDownloadingHandover.value = true;
    try {
        await VehiclesService.downloadHandoverRecord(vehicle.value.uuid);
        toast.success('Acta de entrega generada correctamente');
    } catch (error) {
        logger.error('Error al descargar acta de entrega:', { message: error?.message ?? error });
        toast.error('No se pudo generar el acta de entrega');
    } finally {
        isDownloadingHandover.value = false;
    }
};

// ===== CARGA DE DATOS =====
const loadVehicle = async () => {
    isViewLoading.value = true;
    try {
        const id = route.params.id;
        if (!id) {
            router.push('/vehiculos');
            return;
        }

        const response = await store.getProfile(id);

        // El store normaliza y guarda en selectedItem; lo asignamos a la vista.
        // Como fallback extraemos directamente de la respuesta Axios.
        vehicle.value = store.selectedItem
            || response?.data?.data
            || response?.data
            || {};



    } catch (error) {
        logger.error('Error cargando vehículo:', { message: error?.message ?? error });
    } finally {
        isViewLoading.value = false;
        initTooltips();
    }
};

// ===== TOOLTIPS =====
const initTooltips = () => {
    if (typeof window.bootstrap?.Tooltip !== 'undefined') {
        setTimeout(() => {
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                const instance = window.bootstrap.Tooltip.getInstance(el);
                if (instance) instance.dispose();
                new window.bootstrap.Tooltip(el, { trigger: 'hover', delay: { show: 150, hide: 80 } });
            });
        }, 100);
    }
};

// ===== CICLO DE VIDA =====
onMounted(async () => {
    await loadVehicle();
    // Al volver del asistente se reabre el menú con la información ya actualizada
    if (route.query.panel === 'documentos') {
        showDocsMenu.value = true;
        router.replace({ path: route.path, query: {} });
    }
});
watch(() => route.query.panel, (panel) => {
    if (panel === 'documentos') {
        loadVehicle();
        showDocsMenu.value = true;
        router.replace({ path: route.path, query: {} });
    }
});
onUnmounted(() => {
    if (typeof window.bootstrap?.Tooltip !== 'undefined') {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            const instance = window.bootstrap.Tooltip.getInstance(el);
            if (instance) instance.dispose();
        });
    }
});
</script>

<style scoped>
/* ===== HEREDA VARIABLES DEL SISTEMA - MISMO ESTILO QUE TERCEROS ===== */

/* ===== ANIMACIONES ===== */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.35s ease-out forwards;
}

/* Especificaciones técnicas: reparte las filas en la altura disponible de la card */
.spec-list {
    align-content: space-between;
}

/* ===== CARDS ===== */
.card {
    border-radius: 0.625rem !important;
    transition: box-shadow 150ms ease-in-out;
}

.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-header {
    border-radius: 0.625rem 0.625rem 0 0 !important;
    background: linear-gradient(135deg, #f8f9fa, #fff);
}

/* ===== TIPOGRAFÍA COMPACTA ===== */
.small {
    font-size: 0.85rem !important;
    line-height: 1.4;
}

.fw-medium {
    font-weight: 500 !important;
}

.fw-semibold {
    font-weight: 600 !important;
}

.font-monospace {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* ===== TABLA DE DATOS ===== */
dl.row {
    margin: 0;
}

dt {
    color: #6c757d !important;
}

dd {
    color: #212529 !important;
    margin-bottom: 0;
}

dt,
dd {
    padding: 0;
}

table th {
    font-weight: 600;
    color: #495057;
    font-size: 0.75rem !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

table td {
    vertical-align: middle;
}

/* ===== BADGES FALCON ===== */
.badge-subtle-success {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, 0.2);
}

.badge-subtle-danger {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
}

.badge-subtle-secondary {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.2);
}

.badge.rounded-pill {
    font-weight: 500;
    transition: transform 150ms ease-in-out;
}

.badge.rounded-pill:hover {
    transform: translateY(-1px);
}

/* ===== BOTONES ===== */
.btn {
    transition: all 150ms ease-in-out;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
}

.btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.btn-falcon-default {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #212529;
}

.btn-falcon-default:hover {
    background: #e9ecef;
    border-color: #dee2e6;
}

/* ===== LISTAS ===== */
.list-group-item {
    padding: 0.5rem 0 !important;
}

.list-group-item+.list-group-item {
    border-top: 1px dashed #e9ecef !important;
}

/* ===== SCROLLBAR ===== */
::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 2px;
}

::-webkit-scrollbar-thumb {
    background: #adb5bd;
    border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
    background: #6c757d;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
    .card-body {
        padding: 0.875rem !important;
    }

    dt.col-5,
    dd.col-7 {
        width: 100% !important;
    }

    dt {
        margin-top: 0.5rem !important;
    }

    .btn {
        flex: 1;
        max-width: 100px;
        font-size: 0.75rem !important;
    }

    table thead {
        display: none;
    }

    table,
    table tbody,
    table tr,
    table td {
        display: block;
        width: 100%;
    }

    table tr {
        margin-bottom: 1rem;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 0.5rem;
    }

    table td {
        text-align: right !important;
        padding-left: 50% !important;
        position: relative;
        border-bottom: 1px dashed #e9ecef !important;
    }

    table td:last-child {
        border-bottom: none !important;
    }

    table td::before {
        content: attr(data-label);
        position: absolute;
        left: 0.75rem;
        width: 45%;
        padding-right: 10px;
        white-space: nowrap;
        text-align: left;
        font-weight: 600;
        color: #6c757d;
    }
}

/* ===== ACCESIBILIDAD ===== */
:focus-visible {
    outline: 2px solid #0d6efd !important;
    outline-offset: 2px !important;
}

/* El cursor de ayuda (?) solo aplica a elementos informativos no clicables.
   Los controles interactivos mantienen la mano (pointer). */
[title]:not(button, a, input, select, textarea, [role="button"]),
[data-bs-toggle="tooltip"]:not(button, a, input, select, textarea, [role="button"]) {
    cursor: help;
}

button[title],
a[title],
button[data-bs-toggle="tooltip"],
a[data-bs-toggle="tooltip"] {
    cursor: pointer;
}

a:focus {
    outline: 2px solid #0d6efd;
    outline-offset: 2px;
    border-radius: 2px;
}

/* ===== UTILIDADES ===== */
.bg-opacity-10 {
    --bs-bg-opacity: 0.1;
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>