<template>
    <div class="row g-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <WizardProgress
                v-if="!isEditMode"
                current="vehiculo"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Información General</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos
                            obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-3 p-md-4">
                    <form @submit.prevent="handleSubmit" class="row g-3" novalidate>
                        <!-- Empresa / Hidden context -->
                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />

                        <!-- Placa del Vehículo -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-vehicle_license_plate">Placa del
                                Vehículo</label>
                            <input id="f-vehicle_license_plate" :aria-invalid="!!validationErrors['vehicle_license_plate']" :aria-describedby="validationErrors['vehicle_license_plate'] ? 'f-vehicle_license_plate-error' : undefined" type="text" autocomplete="off"
                                class="form-control text-uppercase fw-bold text-primary" :class="{
                                    'is-invalid': validationErrors.vehicle_license_plate,
                                    'is-valid': formData.vehicle_license_plate && !validationErrors.vehicle_license_plate
                                }" v-model="formData.vehicle_license_plate" placeholder="Ej: ABC123" maxlength="10"
                                @input="formData.vehicle_license_plate = $event.target.value.toUpperCase(); validateField('vehicle_license_plate', formData.vehicle_license_plate, 'La placa es obligatoria')"
                                @blur="validateField('vehicle_license_plate', formData.vehicle_license_plate, 'La placa es obligatoria')" />
                            <div v-if="validationErrors.vehicle_license_plate" class="invalid-feedback d-block" id="f-vehicle_license_plate-error" role="alert">
                                {{ validationErrors.vehicle_license_plate }}
                            </div>
                        </div>

                        <!-- Licencia de Tránsito -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-transit_license_number">Licencia de
                                Tránsito</label>
                            <input id="f-transit_license_number" :aria-invalid="!!validationErrors['transit_license_number']" :aria-describedby="validationErrors['transit_license_number'] ? 'f-transit_license_number-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.transit_license_number,
                                'is-valid': formData.transit_license_number && !validationErrors.transit_license_number
                            }" v-model="formData.transit_license_number" placeholder="Ej: TR-2026-001"
                                @input="validateField('transit_license_number', formData.transit_license_number, 'La licencia es obligatoria')"
                                @blur="validateField('transit_license_number', formData.transit_license_number, 'La licencia es obligatoria')" />
                            <div v-if="validationErrors.transit_license_number" class="invalid-feedback d-block" id="f-transit_license_number-error" role="alert">
                                {{ validationErrors.transit_license_number }}
                            </div>
                        </div>

                        <!-- Clase de Vehículo -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="vehicle_class_uuid">Clase de
                                Vehículo</label>
                            <PrimeSelect :input-id="'vehicle_class_uuid'" v-model="formData.vehicle_class_uuid"
                                :options="store.catalogs.vehicleClasses ?? []" option-value="uuid" option-label="description"
                                placeholder="Seleccionar clase" showClear filter class="w-100"
                                :invalid="!!validationErrors['vehicle_class_uuid']" />
                            <div v-if="validationErrors.vehicle_class_uuid" class="invalid-feedback d-block" id="f-vehicle_class_uuid-error" role="alert">
                                <i class="fad fa-exclamation-circle me-1"></i>{{ validationErrors.vehicle_class_uuid }}
                            </div>
                        </div>

                        <!-- Modalidad de Servicio -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required" for="type_of_service">Modalidad de Servicio</label>
                            <PrimeSelect :input-id="'type_of_service'" v-model="formData.type_of_service"
                                :options="[{ label: 'Público', value: 'PUBLICO' }, { label: 'Particular', value: 'PARTICULAR' }]"
                                option-label="label" option-value="value" placeholder="Seleccione..." showClear filter class="w-100"
                                :invalid="!!validationErrors['type_of_service']" />
                            <div v-if="validationErrors.type_of_service" class="invalid-feedback d-block" id="f-type_of_service-error" role="alert">
                                {{ validationErrors.type_of_service }}
                            </div>
                        </div>

                        <!-- SECCIÓN: MARCA Y MODELO -->
                        <div class="col-12 mt-4">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-industry me-2"></i>Información general del vehículo
                            </h6>
                        </div>

                        <!-- Marca -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="brand_uuid">Marca</label>
                            <PrimeSelect :input-id="'brand_uuid'" v-model="formData.brand_uuid"
                                :options="store.catalogs.brands ?? []" option-value="uuid" option-label="description"
                                placeholder="Seleccionar marca" showClear filter class="w-100"
                                :invalid="!!validationErrors['brand_uuid']" />
                            <div v-if="validationErrors.brand_uuid" class="invalid-feedback d-block" id="f-brand_uuid-error" role="alert">
                                <i class="fad fa-exclamation-circle me-1"></i>{{ validationErrors.brand_uuid }}
                            </div>
                        </div>

                        <!-- Línea -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-line">Línea</label>
                            <input id="f-line" :aria-invalid="!!validationErrors['line']" :aria-describedby="validationErrors['line'] ? 'f-line-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.line,
                                'is-valid': formData.line && !validationErrors.line
                            }" v-model="formData.line" placeholder="Ej: Hilux, D-Max"
                                @input="validateField('line', formData.line, 'La línea es obligatoria')"
                                @blur="validateField('line', formData.line, 'La línea es obligatoria')" />
                            <div v-if="validationErrors.line" class="invalid-feedback d-block" id="f-line-error" role="alert">
                                {{ validationErrors.line }}
                            </div>
                        </div>

                        <!-- Modelo -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-model">Modelo</label>
                            <input id="f-model" :aria-invalid="!!validationErrors['model']" :aria-describedby="validationErrors['model'] ? 'f-model-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.model,
                                'is-valid': formData.model && !validationErrors.model
                            }" v-model="formData.model" placeholder="Ej: 2025"
                                @input="validateField('model', formData.model, 'El modelo es obligatorio')"
                                @blur="validateField('model', formData.model, 'El modelo es obligatorio')" />
                            <div v-if="validationErrors.model" class="invalid-feedback d-block" id="f-model-error" role="alert">
                                {{ validationErrors.model }}
                            </div>
                        </div>

                        <!-- Color -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-color">Color</label>
                            <input id="f-color" :aria-invalid="!!validationErrors['color']" :aria-describedby="validationErrors['color'] ? 'f-color-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.color,
                                'is-valid': formData.color && !validationErrors.color
                            }" v-model="formData.color" placeholder="Ej: Blanco"
                                @input="validateField('color', formData.color, 'El color es obligatorio')"
                                @blur="validateField('color', formData.color, 'El color es obligatorio')" />
                            <div v-if="validationErrors.color" class="invalid-feedback d-block" id="f-color-error" role="alert">
                                {{ validationErrors.color }}
                            </div>
                        </div>

                        <!-- Número de Serie -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;" for="f-serial_number">Número de Serie</label>
                            <input id="f-serial_number" :aria-invalid="!!validationErrors['serial_number']" :aria-describedby="validationErrors['serial_number'] ? 'f-serial_number-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.serial_number
                            }" v-model="formData.serial_number" placeholder="SER123456" />
                            <div v-if="validationErrors.serial_number" class="invalid-feedback d-block" id="f-serial_number-error" role="alert">
                                {{ validationErrors.serial_number }}
                            </div>
                        </div>

                        <!-- Número de Motor -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-engine_number">Número de
                                Motor</label>
                            <input id="f-engine_number" :aria-invalid="!!validationErrors['engine_number']" :aria-describedby="validationErrors['engine_number'] ? 'f-engine_number-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.engine_number,
                                'is-valid': formData.engine_number && !validationErrors.engine_number
                            }" v-model="formData.engine_number" placeholder="ENG9876"
                                @input="validateField('engine_number', formData.engine_number, 'El número de motor es obligatorio')"
                                @blur="validateField('engine_number', formData.engine_number, 'El número de motor es obligatorio')" />
                            <div v-if="validationErrors.engine_number" class="invalid-feedback d-block" id="f-engine_number-error" role="alert">
                                {{ validationErrors.engine_number }}
                            </div>
                        </div>

                        <!-- Número de Chasis -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-chassis_number">Número de
                                Chasis</label>
                            <input id="f-chassis_number" :aria-invalid="!!validationErrors['chassis_number']" :aria-describedby="validationErrors['chassis_number'] ? 'f-chassis_number-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.chassis_number,
                                'is-valid': formData.chassis_number && !validationErrors.chassis_number
                            }" v-model="formData.chassis_number" placeholder="CHS123"
                                @input="validateField('chassis_number', formData.chassis_number, 'El chasis es obligatorio')"
                                @blur="validateField('chassis_number', formData.chassis_number, 'El chasis es obligatorio')" />
                            <div v-if="validationErrors.chassis_number" class="invalid-feedback d-block" id="f-chassis_number-error" role="alert">
                                {{ validationErrors.chassis_number }}
                            </div>
                        </div>

                        <!-- Número VIN -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;" for="f-vin_number">Número VIN</label>
                            <input id="f-vin_number" :aria-invalid="!!validationErrors['vin_number']" :aria-describedby="validationErrors['vin_number'] ? 'f-vin_number-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.vin_number
                            }" v-model="formData.vin_number" placeholder="VIN123456" />
                            <div v-if="validationErrors.vin_number" class="invalid-feedback d-block" id="f-vin_number-error" role="alert">
                                {{ validationErrors.vin_number }}
                            </div>
                        </div>

                        <!-- Cilindraje -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-engine_displacement">Cilindraje</label>
                            <input id="f-engine_displacement" :aria-invalid="!!validationErrors['engine_displacement']" :aria-describedby="validationErrors['engine_displacement'] ? 'f-engine_displacement-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.engine_displacement,
                                'is-valid': formData.engine_displacement && !validationErrors.engine_displacement
                            }" v-model="formData.engine_displacement" placeholder="Ej: 2400"
                                @input="validateField('engine_displacement', formData.engine_displacement, 'El cilindraje es obligatorio')"
                                @blur="validateField('engine_displacement', formData.engine_displacement, 'El cilindraje es obligatorio')" />
                            <div v-if="validationErrors.engine_displacement" class="invalid-feedback d-block" id="f-engine_displacement-error" role="alert">
                                {{ validationErrors.engine_displacement }}
                            </div>
                        </div>

                        <!-- Tipo de Carrocería -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-body_type">Tipo de
                                Carrocería</label>
                            <input id="f-body_type" :aria-invalid="!!validationErrors['body_type']" :aria-describedby="validationErrors['body_type'] ? 'f-body_type-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.body_type,
                                'is-valid': formData.body_type && !validationErrors.body_type
                            }" v-model="formData.body_type" placeholder="Ej: Sedán"
                                @input="validateField('body_type', formData.body_type, 'La carrocería es obligatoria')"
                                @blur="validateField('body_type', formData.body_type, 'La carrocería es obligatoria')" />
                            <div v-if="validationErrors.body_type" class="invalid-feedback d-block" id="f-body_type-error" role="alert">
                                {{ validationErrors.body_type }}
                            </div>
                        </div>

                        <!-- Tipo de Combustible -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="fuel_type">Tipo de
                                Combustible</label>
                            <PrimeSelect :input-id="'fuel_type'" v-model="formData.fuel_type"
                                :options="[{ label: 'Gasolina', value: 'GASOLINA' }, { label: 'Diésel', value: 'DIESEL' }, { label: 'GNV (Gas Natural Vehicular)', value: 'GNV' }, { label: 'Gas', value: 'GAS' }, { label: 'Híbrido', value: 'HIBRIDO' }, { label: 'Eléctrico', value: 'ELECTRICO' }, { label: 'Otro', value: 'OTRO' }]"
                                option-label="label" option-value="value" placeholder="Seleccionar combustible" showClear filter class="w-100"
                                :invalid="!!validationErrors['fuel_type']" />
                            <div v-if="validationErrors.fuel_type" class="invalid-feedback d-block" id="f-fuel_type-error" role="alert">
                                <i class="fad fa-exclamation-circle me-1"></i>{{ validationErrors.fuel_type }}
                            </div>
                        </div>

                        <!-- Número de Puertas -->
                        <div class="col-12 col-md-6 col-lg-3">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;" for="f-doors">Número de Puertas</label>
                            <input id="f-doors" :aria-invalid="!!validationErrors['doors']" :aria-describedby="validationErrors['doors'] ? 'f-doors-error' : undefined" type="number" autocomplete="off" placeholder="Ej: 4" class="form-control" v-model.number="formData.doors"
                                min="1" max="10" />
                        </div>

                        <!-- Fecha de Matriculación -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-registration_date">Fecha de
                                Matriculación</label>
                            <input id="f-registration_date" :aria-invalid="!!validationErrors['registration_date']" :aria-describedby="validationErrors['registration_date'] ? 'f-registration_date-error' : undefined" type="date" class="form-control" placeholder="YYYY-MM-DD" :class="{
                                'is-invalid': validationErrors.registration_date,
                                'is-valid': formData.registration_date && !validationErrors.registration_date
                            }" v-model="formData.registration_date"
                                @input="validateField('registration_date', formData.registration_date, 'La fecha es obligatoria')"
                                @blur="validateField('registration_date', formData.registration_date, 'La fecha es obligatoria')" />
                            <div v-if="validationErrors.registration_date" class="invalid-feedback d-block" id="f-registration_date-error" role="alert">
                                {{ validationErrors.registration_date }}
                            </div>
                        </div>

                        <!-- Autoridad de Tránsito -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-transit_authority">Autoridad de
                                Tránsito</label>
                            <input id="f-transit_authority" :aria-invalid="!!validationErrors['transit_authority']" :aria-describedby="validationErrors['transit_authority'] ? 'f-transit_authority-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{
                                'is-invalid': validationErrors.transit_authority,
                                'is-valid': formData.transit_authority && !validationErrors.transit_authority
                            }" v-model="formData.transit_authority" placeholder="Ej: Secretaría de Tránsito"
                                @input="validateField('transit_authority', formData.transit_authority, 'La autoridad es obligatoria')"
                                @blur="validateField('transit_authority', formData.transit_authority, 'La autoridad es obligatoria')" />
                            <div v-if="validationErrors.transit_authority" class="invalid-feedback d-block" id="f-transit_authority-error" role="alert">
                                {{ validationErrors.transit_authority }}
                            </div>
                        </div>

                        <!-- Sucursal de Operación -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label" for="branch_uuid">Sucursal de Operación</label>
                            <PrimeSelect :input-id="'branch_uuid'" v-model="formData.branch_uuid"
                                :options="store.catalogs.branches ?? []" option-value="uuid" option-label="name"
                                placeholder="Seleccione..." showClear filter class="w-100"
                                :invalid="!!validationErrors['branch_uuid']" />
                            <div v-if="validationErrors.branch_uuid" class="invalid-feedback d-block" id="f-branch_uuid-error" role="alert">
                                {{ validationErrors.branch_uuid }}
                            </div>
                        </div>

                        <!-- SECCIÓN: DATOS TÉCNICOS -->
                        <div class="col-12 mt-4">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-file-contract me-2"></i>Datos Técnicos del Vehículo
                            </h6>
                        </div>

                        <!-- Capacidad de Carga -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;" for="f-load_capacity">Capacidad de Carga
                                (kg)</label>
                            <input id="f-load_capacity" :aria-invalid="!!validationErrors['load_capacity']" :aria-describedby="validationErrors['load_capacity'] ? 'f-load_capacity-error' : undefined" type="number" autocomplete="off" placeholder="Ej: 2000" class="form-control"
                                v-model.number="formData.load_capacity" min="0" />
                        </div>

                        <!-- Peso Bruto -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;" for="f-gross_vehicle_weight">Peso Bruto (kg)</label>
                            <input id="f-gross_vehicle_weight" :aria-invalid="!!validationErrors['gross_vehicle_weight']" :aria-describedby="validationErrors['gross_vehicle_weight'] ? 'f-gross_vehicle_weight-error' : undefined" type="number" autocomplete="off" placeholder="Ej: 3500" class="form-control"
                                v-model.number="formData.gross_vehicle_weight" min="0" />
                        </div>

                        <!-- Cap. Pasajeros -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;" for="f-passenger_capacity">Cap. Pasajeros</label>
                            <input id="f-passenger_capacity" :aria-invalid="!!validationErrors['passenger_capacity']" :aria-describedby="validationErrors['passenger_capacity'] ? 'f-passenger_capacity-error' : undefined" type="number" autocomplete="off" placeholder="Ej: 5" class="form-control"
                                v-model.number="formData.passenger_capacity" min="0" />
                        </div>

                        <!-- Pasajeros Sentados -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-seated_passenger_capacity">Pasajeros
                                Sentados</label>
                            <input id="f-seated_passenger_capacity" :aria-invalid="!!validationErrors['seated_passenger_capacity']" :aria-describedby="validationErrors['seated_passenger_capacity'] ? 'f-seated_passenger_capacity-error' : undefined" type="number" autocomplete="off" placeholder="Ej: 4" class="form-control" :class="{
                                'is-invalid': validationErrors.seated_passenger_capacity,
                                'is-valid': formData.seated_passenger_capacity !== null && formData.seated_passenger_capacity !== '' && !validationErrors.seated_passenger_capacity
                            }" v-model.number="formData.seated_passenger_capacity" min="0"
                                @input="validateField('seated_passenger_capacity', formData.seated_passenger_capacity, 'Los pasajeros sentados son obligatorios')"
                                @blur="validateField('seated_passenger_capacity', formData.seated_passenger_capacity, 'Los pasajeros sentados son obligatorios')" />
                            <div v-if="validationErrors.seated_passenger_capacity" class="invalid-feedback d-block" id="f-seated_passenger_capacity-error" role="alert">
                                {{ validationErrors.seated_passenger_capacity }}
                            </div>
                        </div>

                        <!-- Número de Ejes -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label fw-medium" style="font-size: 0.9rem;" for="f-number_of_axles">Número de Ejes</label>
                            <input id="f-number_of_axles" :aria-invalid="!!validationErrors['number_of_axles']" :aria-describedby="validationErrors['number_of_axles'] ? 'f-number_of_axles-error' : undefined" type="number" autocomplete="off" placeholder="Ej: 2" class="form-control"
                                v-model.number="formData.number_of_axles" min="1" />
                        </div>

                        <!-- Número Interno (Móvil) -->
                        <div class="col-12 col-md-4 col-lg-4">
                            <label class="form-label" for="internal_number">Número Interno (Móvil)</label>
                            <input id="internal_number" v-model="formData.internal_number" class="form-control"
                                :class="{ 'is-invalid': validationErrors.internal_number }" type="text"
                                autocomplete="off" placeholder="Ingresa el número interno" />
                            <div v-if="validationErrors.internal_number" class="invalid-feedback d-block" id="f-internal_number-error" role="alert">
                                {{ validationErrors.internal_number }}
                            </div>
                            <div v-if="hasAgreements" class="text-warning small mb-0 mt-1 d-flex align-items-center gap-1">
                                <i class="fad fa-exclamation-triangle"></i>
                                <span>Vehículo con convenio. Auto-asignación inactiva.</span>
                            </div>
                        </div>

                        <!-- Empresa Transporte -->
                        <div class="col-12 col-md-12 col-lg-6" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa Transporte</label>
                            <PrimeSelect :input-id="'company_uuid'" v-model="formData.company_uuid"
                                :options="store.catalogs.companies ?? []" option-value="uuid" option-label="business_name"
                                placeholder="Seleccione..." showClear filter class="w-100"
                                :invalid="!!validationErrors['company_uuid']" />
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>

                        <!-- Afiliado -->
                        <div :class="isSuperAdmin ? 'col-12 col-md-12 col-lg-6' : 'col-12 col-md-12 col-lg-4'">
                            <label class="form-label required" for="owner_third_party_uuid">Afiliado</label>
                            <PrimeSelect :input-id="'owner_third_party_uuid'" v-model="formData.third_party_uuid"
                                :options="store.catalogs.thirdParties ?? []" option-value="uuid" option-label="company_name"
                                placeholder="Seleccione..." showClear filter class="w-100"
                                :invalid="!!validationErrors['third_party_uuid']" />
                            <div v-if="validationErrors.third_party_uuid" class="invalid-feedback d-block" id="f-third_party_uuid-error" role="alert">
                                {{ validationErrors.third_party_uuid }}
                            </div>
                        </div>

                        <!-- Estado Operativo -->
                        <div :class="isSuperAdmin ? 'col-12 col-md-6 col-lg-6' : 'col-12 col-md-6 col-lg-4'">
                            <label class="form-label required" for="statusSelect">Estado Operativo</label>
                            <PrimeSelect :input-id="'statusSelect'" v-model="formData.is_active"
                                :options="[{ label: 'Activo', value: '1' }, { label: 'Inactivo', value: '0' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['is_active']" />
                            <div v-if="validationErrors.is_active" class="invalid-feedback d-block" id="f-is_active-error" role="alert">
                                {{ validationErrors.is_active }}
                            </div>
                        </div>

                        <!-- Pago Exacto -->
                        <div :class="isSuperAdmin ? 'col-12 col-md-6 col-lg-6' : 'col-12 col-md-6 col-lg-4'">
                            <label class="form-label" for="exact_payment">Pago Exacto</label>
                            <div class="form-check form-switch mt-2">
                                <input class="form-check-input" type="checkbox" id="exact_payment"
                                    v-model="formData.exact_payment" :true-value="1" :false-value="0" />
                                <label class="form-check-label" for="exact_payment">Activar cobro por pago
                                    exacto</label>
                            </div>
                        </div>

                        <!-- Responsable del Vehículo Header -->
                        <div
                            class="col-12 mt-5 d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                            <h6 class="fw-bold text-info mb-0">
                                <i class="fas fa-user-tie me-2"></i>Responsable del Vehículo
                            </h6>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="has_owner"
                                    v-model="formData.has_owner" :true-value="1" :false-value="0" />
                                <label class="form-check-label text-muted small" for="has_owner">¿Registrar
                                    Responsable?</label>
                            </div>
                        </div>

                        <!-- Sección Propietario / Responsable -->
                        <template v-if="formData.has_owner === 1">
                            <div class="col-12 mb-2">
                                <div class="alert alert-info py-2 d-flex align-items-center">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <small>Si el vehículo pertenece a un tercero registrado, puede seleccionarlo aquí o
                                        ingresar los datos manualmente.</small>
                                </div>
                            </div>

                            <!-- Propietario: Tipo de Documento -->
                            <div class="col-12 col-md-4 col-lg-3">
                                <label class="form-label"
                                    :class="{ 'required': formData.owner.document_type_uuid || formData.owner.document_number || formData.owner.owner_name }"
                                    for="owner_document_type_uuid">Tipo de Documento</label>
                                <PrimeSelect :input-id="'owner_document_type_uuid'" v-model="formData.owner.document_type_uuid"
                                    :options="store.catalogs.typeOfDocuments ?? []" option-value="uuid" option-label="name"
                                    placeholder="Seleccione..." showClear filter class="w-100"
                                    :invalid="!!validationErrors['owner.document_type_uuid']" />
                                <div v-if="validationErrors['owner.document_type_uuid']"
                                    class="invalid-feedback d-block" id="f-owner-document_type_uuid-error" role="alert">
                                    {{ validationErrors['owner.document_type_uuid'] }}
                                </div>
                            </div>

                            <!-- Propietario: Número de Documento -->
                            <div class="col-12 col-md-4 col-lg-3">
                                <label class="form-label"
                                    :class="{ 'required': formData.owner.document_type_uuid || formData.owner.document_number || formData.owner.owner_name }"
                                    for="owner_document_number">Número de Documento</label>
                                <input id="owner_document_number" v-model="formData.owner.document_number"
                                    class="form-control"
                                    :class="{ 'is-invalid': validationErrors['owner.document_number'] }" type="text"
                                    autocomplete="off" placeholder="Ingresa el número de documento" />
                                <div v-if="validationErrors['owner.document_number']" class="invalid-feedback d-block" id="f-owner-document_number-error" role="alert">
                                    {{ validationErrors['owner.document_number'] }}
                                </div>
                            </div>

                            <!-- Propietario: Dígito de Verificación -->
                            <div class="col-12 col-md-4 col-lg-2">
                                <label class="form-label" for="owner_verification_digit">Dígito de Verificación</label>
                                <input id="owner_verification_digit" v-model="formData.owner.verification_digit"
                                    class="form-control"
                                    :class="{ 'is-invalid': validationErrors['owner.verification_digit'] }" type="text"
                                    autocomplete="off" placeholder="Ingresa el dígito de verificación" maxlength="1" />
                                <div v-if="validationErrors['owner.verification_digit']"
                                    class="invalid-feedback d-block" id="f-owner-verification_digit-error" role="alert">
                                    {{ validationErrors['owner.verification_digit'] }}
                                </div>
                            </div>

                            <!-- Propietario: Nombre / Razón Social -->
                            <div class="col-12 col-md-12 col-lg-4">
                                <label class="form-label"
                                    :class="{ 'required': formData.owner.document_type_uuid || formData.owner.document_number || formData.owner.owner_name }"
                                    for="owner_name">Nombre / Razón Social del Propietario</label>
                                <input id="owner_name" v-model="formData.owner.owner_name" class="form-control"
                                    :class="{ 'is-invalid': validationErrors['owner.owner_name'] }" type="text"
                                    autocomplete="off"
                                    placeholder="Ingresa el nombre completo o razón social del propietario" />
                                <div v-if="validationErrors['owner.owner_name']" class="invalid-feedback d-block" id="f-owner-owner_name-error" role="alert">
                                    {{ validationErrors['owner.owner_name'] }}
                                </div>
                            </div>
                        </template>

                        <!-- Acciones del Formulario -->
                        <div class="col-12 mt-4">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 mt-md-4 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-3 p-md-4">
                    <div class="d-flex flex-column flex-sm-row align-items-start gap-3 g-2 g-md-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0 mb-2 mb-sm-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    La placa y el número de VIN son identificadores únicos críticos; asegúrate de
                                    verificarlos con los documentos oficiales del vehículo antes de registrarlos.
                                </li>
                                <li>
                                    El tipo de servicio (Público/Particular) determina los requisitos legales y de
                                    seguros aplicables al vehículo en el sistema.
                                </li>
                                <li>
                                    Mantener actualizada la fecha de registro y la autoridad de tránsito es vital para
                                    cumplir con las normativas locales de movilidad.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { toast } from '@/utils/toast.js';
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVehiclesStore } from '../store/vehicles.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useDocumentWizard } from '@/hooks/useDocumentWizard.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';
import WizardProgress from '@/components/WizardProgress.vue';

const route = useRoute();
const router = useRouter();
const store = useVehiclesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Vehicles' : 'Registrar Vehicles');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [{ label: 'Vehicles', to: '/vehiculos', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' },]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

const hasAgreements = computed(() => {
    const agreements = formData.business_collaboration_agreements || formData.businessCollaborationAgreements;
    return Array.isArray(agreements) && agreements.length > 0;
});

const formData = reactive({
    business_collaboration_agreements: [],
    is_active: '1',
    company_uuid: '',
    branch_uuid: '',
    third_party_uuid: '',
    exact_payment: 0,
    has_owner: 0,
    doors: 0,
    load_capacity: 0,
    gross_vehicle_weight: 0,
    passenger_capacity: 0,
    seated_passenger_capacity: 0,
    number_of_axles: 0,
    vehicle_license_plate: '',
    transit_license_number: '',
    vehicle_class_uuid: '',
    type_of_service: '',
    brand_uuid: '',
    line: '',
    model: '',
    color: '',
    serial_number: '',
    engine_number: '',
    chassis_number: '',
    vin_number: '',
    engine_displacement: '',
    body_type: '',
    fuel_type: '',
    registration_date: '',
    transit_authority: '',
    internal_number: '',

    owner: {
        third_party_uuid: '',
        document_type_uuid: '',
        owner_name: '',
        document_number: '',
        verification_digit: ''
    }
});

const validateField = (field, value, message) => {
    if (value === null || value === undefined || String(value).trim() === '') {
        validationErrors[field] = message;
    } else {
        delete validationErrors[field];
    }
};

const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    // Validar requeridos según el JSON
    if (isEmpty(formData.company_uuid)) validationErrors.company_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.vehicle_license_plate)) validationErrors.vehicle_license_plate = 'Este campo es obligatorio';
    if (isEmpty(formData.transit_license_number)) validationErrors.transit_license_number = 'Este campo es obligatorio';
    if (isEmpty(formData.type_of_service)) validationErrors.type_of_service = 'Este campo es obligatorio';
    if (isEmpty(formData.vehicle_class_uuid)) validationErrors.vehicle_class_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.brand_uuid)) validationErrors.brand_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.line)) validationErrors.line = 'Este campo es obligatorio';
    if (isEmpty(formData.model)) validationErrors.model = 'Este campo es obligatorio';
    if (isEmpty(formData.color)) validationErrors.color = 'Este campo es obligatorio';
    if (isEmpty(formData.engine_number)) validationErrors.engine_number = 'Este campo es obligatorio';
    if (isEmpty(formData.chassis_number)) validationErrors.chassis_number = 'Este campo es obligatorio';
    if (isEmpty(formData.engine_displacement)) validationErrors.engine_displacement = 'Este campo es obligatorio';
    if (isEmpty(formData.body_type)) validationErrors.body_type = 'Este campo es obligatorio';
    if (isEmpty(formData.fuel_type)) validationErrors.fuel_type = 'Este campo es obligatorio';
    if (isEmpty(formData.registration_date)) validationErrors.registration_date = 'Este campo es obligatorio';
    if (isEmpty(formData.transit_authority)) validationErrors.transit_authority = 'Este campo es obligatorio';
    if (formData.doors === '' || formData.doors === null || formData.doors === undefined) validationErrors.doors = 'Este campo es obligatorio';
    if (formData.load_capacity === '' || formData.load_capacity === null || formData.load_capacity === undefined) validationErrors.load_capacity = 'Este campo es obligatorio';
    if (formData.gross_vehicle_weight === '' || formData.gross_vehicle_weight === null || formData.gross_vehicle_weight === undefined) validationErrors.gross_vehicle_weight = 'Este campo es obligatorio';
    if (formData.passenger_capacity === '' || formData.passenger_capacity === null || formData.passenger_capacity === undefined) validationErrors.passenger_capacity = 'Este campo es obligatorio';
    if (formData.seated_passenger_capacity === '' || formData.seated_passenger_capacity === null || formData.seated_passenger_capacity === undefined) validationErrors.seated_passenger_capacity = 'Este campo es obligatorio';
    if (formData.number_of_axles === '' || formData.number_of_axles === null || formData.number_of_axles === undefined) validationErrors.number_of_axles = 'Este campo es obligatorio';
    if (isEmpty(formData.third_party_uuid)) validationErrors.third_party_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.is_active)) validationErrors.is_active = 'Este campo es obligatorio';

    // Validación condicional del propietario
    const { owner, has_owner } = formData;
    if (has_owner === 1) {
        if (isEmpty(owner.third_party_uuid)) {
            if (isEmpty(owner.document_type_uuid)) validationErrors['owner.document_type_uuid'] = 'Este campo es obligatorio';
            if (isEmpty(owner.document_number)) validationErrors['owner.document_number'] = 'Este campo es obligatorio';
            if (isEmpty(owner.owner_name)) validationErrors['owner.owner_name'] = 'Este campo es obligatorio';
        }
    }

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/vehiculos');

const handleSubmit = async () => {
    if (!validateForm()) {
        await nextTick();
        const firstError = document.querySelector('[aria-invalid="true"], .is-invalid');
        if (firstError) {
            if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(firstError.tagName)) firstError.setAttribute('tabindex', '-1');
            firstError.focus({ preventScroll: true });
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return toast('Atención', 'Revisa los campos obligatorios', 'warning');
    }

    try {
        submitting.value = true;
        let uuid = isEditMode.value ? route.params.id : null;

        const payload = { ...formData };
        payload.exact_payment = (formData.exact_payment == 1 || formData.exact_payment === true || formData.exact_payment === '1') ? 1 : 0;
        // Número de serie y VIN son opcionales: enviar null en lugar de cadena vacía
        const optionalText = (v) => (v === null || v === undefined || String(v).trim() === '' ? null : v);
        payload.serial_number = optionalText(payload.serial_number);
        payload.vin_number = optionalText(payload.vin_number);
        if (!payload.has_owner) {
            delete payload.owner;
        }
        delete payload.has_owner;

        if (isEditMode.value) {
            await store.updateItem(uuid, payload);
            goBack();
        } else {
            const newItem = await store.createItem(payload);
            uuid = newItem?.uuid || newItem?.id;
            // Tras crear, encadenar el asistente de documentos (si hay pasos permitidos)
            if (uuid) {
                const { firstStep, stepRoute } = useDocumentWizard();
                const step = firstStep(permissionsStore);
                if (!step) {
                    goBack();
                } else {
                    router.push(stepRoute(step.key, uuid));
                    return;
                }
            } else {
                goBack();
            }
        }
    } catch (error) {
        toast('Error', 'No se pudo procesar la solicitud', 'error');
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.loadFormOptions();
        if (!isSuperAdmin.value) {
            formData.company_uuid = userStore.company_uuid;
        }
        if (isEditMode.value) {
            const item = await store.fetchProfileById(route.params.id);
            if (item) {
                const text = (v) => (v === null || v === undefined ? '' : v);
                const num = (v) => (v === null || v === undefined || v === '' ? 0 : v);
                formData.company_uuid = text(item.company_uuid);
                formData.branch_uuid = text(item.branch?.uuid || item.branch_uuid);
                formData.third_party_uuid = text(item.third_party_uuid);
                formData.vehicle_license_plate = text(item.vehicle_license_plate);
                formData.transit_license_number = text(item.transit_license_number);
                formData.vehicle_class_uuid = text(item.vehicle_class_uuid);
                formData.type_of_service = text(item.type_of_service);
                formData.brand_uuid = text(item.brand_uuid);
                formData.line = text(item.line);
                formData.model = text(item.model);
                formData.color = text(item.color);
                formData.serial_number = text(item.serial_number);
                formData.engine_number = text(item.engine_number);
                formData.chassis_number = text(item.chassis_number);
                formData.vin_number = text(item.vin_number);
                formData.engine_displacement = text(item.engine_displacement);
                formData.body_type = text(item.body_type);
                formData.fuel_type = text(item.fuel_type);
                formData.registration_date = text(item.registration_date)?.slice?.(0, 10) ?? text(item.registration_date);
                formData.transit_authority = text(item.transit_authority);
                formData.internal_number = text(item.internal_number);
                formData.doors = num(item.doors);
                formData.load_capacity = num(item.load_capacity);
                formData.gross_vehicle_weight = num(item.gross_vehicle_weight);
                formData.passenger_capacity = num(item.passenger_capacity);
                formData.seated_passenger_capacity = num(item.seated_passenger_capacity);
                formData.number_of_axles = num(item.number_of_axles);
                formData.business_collaboration_agreements = Array.isArray(item.business_collaboration_agreements)
                    ? item.business_collaboration_agreements
                    : (Array.isArray(item.businessCollaborationAgreements) ? item.businessCollaborationAgreements : []);
                if (!isSuperAdmin.value && !formData.company_uuid) {
                    formData.company_uuid = userStore.company_uuid;
                }
                formData.is_active = (item.is_active == 1 || item.is_active === true || item.is_active === '1') ? '1' : '0';
                formData.exact_payment = (item.exact_payment == 1 || item.exact_payment === true || item.exact_payment === '1') ? 1 : 0;

                if (item.owners && item.owners.length > 0) {
                    const firstOwner = item.owners[0];
                    formData.has_owner = 1;
                    formData.owner = {
                        third_party_uuid: firstOwner.third_party_uuid || '',
                        document_type_uuid: firstOwner.document_type_uuid || '',
                        owner_name: firstOwner.owner_name || '',
                        document_number: firstOwner.document_number || '',
                        verification_digit: firstOwner.verification_digit || ''
                    };
                }
            }
        }
    } finally {
        isViewLoading.value = false;
        await nextTick();
    }
});
</script>

<style scoped>
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

/* ==================== TOUCH-FRIENDLY & NATIVAS ==================== */

.required::after {
    content: " *";
    color: #dc3545;
    font-weight: 600;
}

.form-control.is-invalid,
.form-select.is-invalid {
    border-color: #dc3545 !important;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* ==================== SELECT2 VALIDATION ==================== */


.invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875em;
    color: #dc3545;
}

/* ==================== SELECT2 UI FIXES ==================== */





/* ===== BOTONES ===== */
.btn {
    transition: all 150ms ease-in-out;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
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

.bg-opacity-10 {
    --bs-bg-opacity: 0.1;
}

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
</style>