<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-tools text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Información General</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <form @submit.prevent="handleSubmit" class="row g-3" novalidate>
                        <div class="col-12 mt-4">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-truck-monster me-2"></i>Información Técnica del Vehículo
                            </h6>
                        </div>                            
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="vehicle_uuid">Vehículo</label>
                                <PrimeSelect :input-id="'vehicle_uuid'" v-model="formData.vehicle_uuid"
                                    :options="store.catalogs.vehicles" option-value="uuid"
                                    option-label="vehicle_license_plate" placeholder="Seleccione..." showClear filter
                                    class="w-100" :invalid="!!validationErrors['vehicle_uuid']" />
                                <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">{{
                                    validationErrors.vehicle_uuid }}</div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="steering_type">Tipo de Dirección</label>
                                <input id="steering_type" v-model="formData.steering_type" class="form-control"
                                    type="text" autocomplete="off" placeholder="Ej: Hidráulica" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="transmission_type">Tipo de Transmisión</label>
                                <PrimeSelect :input-id="'transmission_type'" v-model="formData.transmission_type"
                                    :options="[{ label: 'Mecánica', value: 'Mecánica' }, { label: 'Automática', value: 'Automática' }]"
                                    option-label="label" option-value="value" placeholder="Seleccionar" showClear filter
                                    class="w-100" :invalid="!!validationErrors['transmission_type']" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="number_of_speeds">Número de Velocidades</label>
                                <input id="number_of_speeds" v-model="formData.number_of_speeds" class="form-control"
                                    type="text" autocomplete="off" placeholder="Ej: 6 + Reversa" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="bearing_type">Tipo de Rodamiento</label>
                                <PrimeSelect :input-id="'bearing_type'" v-model="formData.bearing_type"
                                    :options="[{ label: '4X4', value: '4X4' }, { label: '4X2', value: '4X2' }]"
                                    option-label="label" option-value="value" placeholder="Seleccionar" showClear filter
                                    class="w-100" :invalid="!!validationErrors['bearing_type']" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="rear_suspension">Suspensión Trasera</label>
                                <PrimeSelect :input-id="'rear_suspension'" v-model="formData.rear_suspension"
                                    :options="[{ label: 'Muelle', value: 'Muelle' }, { label: 'Amortiguador', value: 'Amortiguador' }]"
                                    option-label="label" option-value="value" placeholder="Seleccionar" showClear filter
                                    class="w-100" :invalid="!!validationErrors['rear_suspension']" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="number_of_tires">Número de Llantas</label>
                                <input id="number_of_tires" v-model="formData.number_of_tires" class="form-control"
                                    type="text" autocomplete="off" placeholder="Ej: 6 dobles" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="rim_size">Tamaño de Rin</label>
                                <input id="rim_size" v-model="formData.rim_size" class="form-control" type="text" autocomplete="off"
                                    placeholder="Ej: 22.5" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="rim_material">Material del Rin</label>
                                <input id="rim_material" v-model="formData.rim_material" class="form-control"
                                    type="text" autocomplete="off" placeholder="Ej: Acero" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="front_brake_type">Frenos Delanteros</label>
                                <input id="front_brake_type" v-model="formData.front_brake_type" class="form-control"
                                    type="text" autocomplete="off" placeholder="Ej: Disco" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="rear_brake_type">Frenos Traseros</label>
                                <PrimeSelect :input-id="'rear_brake_type'" v-model="formData.rear_brake_type"
                                    :options="[{ label: 'Disco', value: 'Disco' }, { label: 'Tambor', value: 'Tambor' }]"
                                    option-label="label" option-value="value" placeholder="Seleccionar" showClear filter
                                    class="w-100" :invalid="!!validationErrors['rear_brake_type']" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="number_of_windows">Número de Ventanas</label>
                                <input id="number_of_windows" v-model="formData.number_of_windows" class="form-control"
                                    type="text" autocomplete="off" placeholder="Ej: 4 laterales" />
                            </div>
                        <div class="col-12">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-info-circle me-2"></i>Datos principales
                            </h6>
                        </div>                            
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="mileage">Kilometraje</label>
                                <input id="mileage" v-model="formData.mileage" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.mileage }" type="number" autocomplete="off"
                                    placeholder="Ej: 45000" />
                                <div v-if="validationErrors.mileage" class="invalid-feedback d-block" id="f-mileage-error" role="alert">{{
                                    validationErrors.mileage }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="maintenance_type">Tipo de Mantenimiento</label>
                                <PrimeSelect :input-id="'maintenance_type'" v-model="formData.maintenance_type"
                                    :options="[{ label: 'Preventiva', value: 'PREVENTIVA' }, { label: 'Correctiva', value: 'CORRECTIVA' }, { label: 'Otro', value: 'OTRO' }]"
                                    option-label="label" option-value="value" placeholder="Seleccione..." showClear filter
                                    class="w-100" :invalid="!!validationErrors['maintenance_type']" />
                                <div v-if="validationErrors.maintenance_type" class="invalid-feedback d-block" id="f-maintenance_type-error" role="alert">{{
                                    validationErrors.maintenance_type }}</div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="maintenance_date">Fecha del
                                    Mantenimiento</label>
                                <input id="maintenance_date" v-model="formData.maintenance_date" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.maintenance_date }" type="date" placeholder="YYYY-MM-DD" />
                                <div v-if="validationErrors.maintenance_date" class="invalid-feedback d-block" id="f-maintenance_date-error" role="alert">{{
                                    validationErrors.maintenance_date }}</div>
                            </div>
                                                    
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="workshop_name">Taller</label>
                                <input id="workshop_name" v-model="formData.workshop_name" class="form-control"
                                    type="text" autocomplete="off" placeholder="Nombre del taller" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="mechanic_name">Mecánico</label>
                                <input id="mechanic_name" v-model="formData.mechanic_name" class="form-control"
                                    type="text" autocomplete="off" placeholder="Nombre del mecánico" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="status">Estado</label>
                                <PrimeSelect :input-id="'status'" v-model="formData.status"
                                    :options="[{ label: 'Pendiente', value: 'Pendiente' }, { label: 'Finalizado', value: 'Finalizado' }, { label: 'Anulado', value: 'Anulado' }]"
                                    option-label="label" option-value="value" placeholder="Seleccione..." showClear filter
                                    class="w-100" :invalid="!!validationErrors['status']" />
                                <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">{{
                                    validationErrors.status }}</div>
                            </div>
                            <div class="col-12">
                                <label class="form-label required" for="service_description">Descripción del
                                    Servicio</label>
                                <textarea id="service_description" v-model="formData.service_description"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.service_description }"
                                    rows="3" placeholder="Detalle de los trabajos realizados"></textarea>
                                <div v-if="validationErrors.service_description" class="invalid-feedback d-block" id="f-service_description-error" role="alert">{{
                                    validationErrors.service_description }}</div>
                        </div>

                        <div class="col-12 mt-3">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-file-invoice-dollar me-2"></i>Costos y facturación
                            </h6>
                        </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="labor_cost">Costo de Mano de Obra</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input id="labor_cost" v-model="formData.labor_cost" class="form-control"
                                        type="number" step="0.01" autocomplete="off" placeholder="0.00" />
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="parts_cost">Costo de Repuestos</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input id="parts_cost" v-model="formData.parts_cost" class="form-control"
                                        type="number" step="0.01" autocomplete="off" placeholder="0.00" />
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="invoice_number">Número de Factura</label>
                                <input id="invoice_number" v-model="formData.invoice_number" class="form-control"
                                    type="text" autocomplete="off" placeholder="Ej: FAC-1234" />
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="next_maintenance_date">Próximo Mantenimiento</label>
                                <input id="next_maintenance_date" v-model="formData.next_maintenance_date"
                                    class="form-control" type="date" placeholder="YYYY-MM-DD" />
                            </div>

                        <div class="row mt-3 g-2 g-md-3">
                            <div :class="isSuperAdmin ? 'col-12 col-md-6 col-lg-9' : 'col-12'">
                                <label class="form-label" for="notes">Notas Adicionales</label>
                                <input id="notes" v-model="formData.notes" class="form-control" type="text" autocomplete="off"
                                    placeholder="Observaciones o notas" />
                            </div>
                            <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                                <label class="form-label required" for="company_uuid">Empresa</label>
                                <PrimeSelect :input-id="'company_uuid'" v-model="formData.company_uuid"
                                    :options="store.catalogs.companies" option-value="uuid"
                                    :option-label="(opt) => opt.business_name || opt.name" placeholder="Seleccione..."
                                    showClear filter class="w-100" :invalid="!!validationErrors['company_uuid']" />
                                <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">{{
                                    validationErrors.company_uuid }}</div>
                            </div>
                        </div>



                        <div class="col-12 mt-3">
                            <h6 class="fw-bold text-info mb-3 border-bottom pb-2">
                                <i class="fad fa-cogs me-2"></i>Repuestos Utilizados
                            </h6>
                        </div>                            <div class="col-12">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-sm align-middle">
                                        <thead class="bg-light">
                                            <tr>
                                                <th>Nombre del Repuesto <span class="text-danger">*</span></th>
                                                <th>Código</th>
                                                <th style="width: 100px;">Cantidad <span class="text-danger">*</span>
                                                </th>
                                                <th style="width: 150px;">Costo Unit. <span class="text-danger">*</span>
                                                </th>
                                                <th>Proveedor</th>
                                                <th>Notas</th>
                                                <th style="width: 50px;"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(part, index) in formData.parts" :key="index">
                                                <td>
                                                    <input v-model="part.part_name" class="form-control form-control-sm"
                                                        :id="`f-parts-${index}-part_name`"
                                                        :aria-label="`Repuesto ${index + 1}: nombre`"
                                                        :aria-invalid="!!validationErrors[`parts.${index}.part_name`]"
                                                        :aria-describedby="validationErrors[`parts.${index}.part_name`] ? `f-parts-${index}-part_name-error` : undefined"
                                                        :class="{ 'is-invalid': validationErrors[`parts.${index}.part_name`] }"
                                                        type="text" autocomplete="off" placeholder="Nombre" />
                                                </td>
                                                <td>
                                                    <input v-model="part.part_code" class="form-control form-control-sm"
                                                        type="text" autocomplete="off" placeholder="Código" />
                                                </td>
                                                <td>
                                                    <input v-model="part.quantity" class="form-control form-control-sm"
                                                        :id="`f-parts-${index}-quantity`"
                                                        :aria-label="`Repuesto ${index + 1}: cantidad`"
                                                        :aria-invalid="!!validationErrors[`parts.${index}.quantity`]"
                                                        :aria-describedby="validationErrors[`parts.${index}.quantity`] ? `f-parts-${index}-quantity-error` : undefined"
                                                        :class="{ 'is-invalid': validationErrors[`parts.${index}.quantity`] }"
                                                        type="number" step="0.01" autocomplete="off" />
                                                </td>
                                                <td>
                                                    <input v-model="part.unit_cost" class="form-control form-control-sm"
                                                        :id="`f-parts-${index}-unit_cost`"
                                                        :aria-label="`Repuesto ${index + 1}: costo unitario`"
                                                        :aria-invalid="!!validationErrors[`parts.${index}.unit_cost`]"
                                                        :aria-describedby="validationErrors[`parts.${index}.unit_cost`] ? `f-parts-${index}-unit_cost-error` : undefined"
                                                        :class="{ 'is-invalid': validationErrors[`parts.${index}.unit_cost`] }"
                                                        type="number" step="0.01" autocomplete="off" />
                                                </td>
                                                <td>
                                                    <PrimeSelect v-model="part.provider_uuid"
                                                        :input-id="`f-parts-${index}-provider_uuid`"
                                                        :options="store.catalogs.thirdParties" option-value="uuid"
                                                        :option-label="(opt) => opt.first_name || opt.trade_name"
                                                        placeholder="Ninguno" showClear filter class="w-100" />
                                                </td>
                                                <td>
                                                    <input v-model="part.notes" class="form-control form-control-sm"
                                                        type="text" autocomplete="off" placeholder="Notas" />
                                                </td>
                                                <td class="text-center">
                                                    <button type="button" class="btn btn-sm btn-danger px-2"
                                                        @click="removePart(index)" :aria-label="`Quitar repuesto ${index + 1}`">
                                                        <i class="fas fa-trash" aria-hidden="true"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr v-if="formData.parts.length === 0">
                                                <td colspan="7" class="text-center text-muted py-3">No hay repuestos
                                                    registrados</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div v-if="partsErrorMessages.length" class="alert alert-danger py-2 mt-2" role="alert">
                                        <ul class="mb-0 ps-3">
                                            <li v-for="(msg, i) in partsErrorMessages" :key="i">{{ msg }}</li>
                                        </ul>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-primary mt-2" @click="addPart">
                                    <i class="fas fa-plus me-1"></i> Agregar Repuesto
                                </button>
                                </div>

                                <div class="col-12 mt-4">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                        <!-- BOTONES -->
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { toast } from '@/utils/toast.js';
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api/client.js';
import { useMaintenanceStore } from '../store/maintenance.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const store = useMaintenanceStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);


const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Mantenimiento' : 'Nuevo Mantenimiento');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [ { label: 'Mantenimiento', to: '/mantenimiento' }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario
const formData = reactive({
    company_uuid: '',
    vehicle_uuid: '',
    maintenance_type: '',
    mileage: '',
    service_description: '',
    mechanic_name: '',
    workshop_name: '',
    maintenance_date: '',
    labor_cost: '',
    parts_cost: '',
    invoice_number: '',
    next_maintenance_date: '',
    notes: '',
    status: 'Finalizado',
    address_type: '',
    steering_type: '',
    transmission_type: '',
    number_of_speeds: '',
    bearing_type: '',
    rear_suspension: '',
    number_of_tires: '',
    rim_size: '',
    rim_material: '',
    front_brake_type: '',
    rear_brake_type: '',
    number_of_windows: '',
    parts: []
});

const addPart = () => {
    formData.parts.push({
        part_name: '',
        part_code: '',
        quantity: 1,
        unit_cost: 0,
        supplier_uuid: '',
        notes: ''
    });
};

const removePart = (index) => {
    formData.parts.splice(index, 1);
};

// Fetch vehicle technical data when a vehicle is selected
watch(() => formData.vehicle_uuid, async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
        try {
            // Check if vehicle data is already loaded in catalogs (if it has all fields)
            let vehicleData = store.catalogs.vehicles.find(v => v.uuid === newVal);

            // If it doesn't have technical fields, fetch from API
            if (!vehicleData || vehicleData.transmission_type === undefined) {
                const res = await apiClient.global.get(`/fleet-management/vehicles/${newVal}`);
                vehicleData = res.data?.data;
            }

            if (vehicleData) {
                formData.address_type = vehicleData.address_type || '';
                formData.steering_type = vehicleData.steering_type || '';
                formData.transmission_type = vehicleData.transmission_type || '';
                formData.number_of_speeds = vehicleData.number_of_speeds || '';
                formData.bearing_type = vehicleData.bearing_type || '';
                formData.rear_suspension = vehicleData.rear_suspension || '';
                formData.number_of_tires = vehicleData.number_of_tires || '';
                formData.rim_size = vehicleData.rim_size || '';
                formData.rim_material = vehicleData.rim_material || '';
                formData.front_brake_type = vehicleData.front_brake_type || '';
                formData.rear_brake_type = vehicleData.rear_brake_type || '';
                formData.number_of_windows = vehicleData.number_of_windows || '';
            }
        } catch (err) {
            console.error('Error fetching vehicle technical details:', err);
        }
    }
});

const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (isEmpty(formData.company_uuid)) validationErrors.company_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.maintenance_type)) validationErrors.maintenance_type = 'Este campo es obligatorio';
    if (isEmpty(formData.status)) validationErrors.status = 'Este campo es obligatorio';
    if (isEmpty(formData.maintenance_date)) validationErrors.maintenance_date = 'Este campo es obligatorio';
    if (formData.mileage === '' || formData.mileage === null || formData.mileage === undefined) {
        validationErrors.mileage = 'Este campo es obligatorio';
    }
    if (isEmpty(formData.service_description)) validationErrors.service_description = 'Este campo es obligatorio';

    formData.parts.forEach((part, index) => {
        if (isEmpty(part.part_name)) validationErrors[`parts.${index}.part_name`] = 'Obligatorio';
        if (part.quantity === '' || part.quantity === null || part.quantity === undefined) validationErrors[`parts.${index}.quantity`] = 'Obligatorio';
        if (part.unit_cost === '' || part.unit_cost === null || part.unit_cost === undefined) validationErrors[`parts.${index}.unit_cost`] = 'Obligatorio';
    });

    return Object.keys(validationErrors).length === 0;
};

/** Mensajes de error de repuestos con contexto de fila (resumen anunciable). */
const partsErrorMessages = computed(() => {
    const fieldLabel = { part_name: 'nombre', quantity: 'cantidad', unit_cost: 'costo unitario' };
    return Object.keys(validationErrors)
        .filter((k) => k.startsWith('parts.'))
        .map((k) => {
            const [, idx, field] = k.split('.');
            return `Repuesto ${Number(idx) + 1} (${fieldLabel[field] || field}): ${validationErrors[k]}`;
        });
});

const goBack = () => router.push('/mantenimiento');

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

        if (isEditMode.value) {
            await store.updateItem(uuid, payload);
        } else {
            const newItem = await store.createItem(payload);
            uuid = newItem?.uuid || newItem?.id;
        }

        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: isEditMode.value ? 'Mantenimiento actualizado correctamente' : 'Mantenimiento registrado correctamente',
            timer: 1500,
            showConfirmButton: false
        }).then(() => goBack());
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
                // Parse date appropriately (assuming YYYY-MM-DD from API)
                if (item.maintenance_date) item.maintenance_date = item.maintenance_date.substring(0, 10);
                if (item.next_maintenance_date) item.next_maintenance_date = item.next_maintenance_date.substring(0, 10);

                Object.assign(formData, item);
                if (!formData.parts) formData.parts = [];
            }
        } else {
            if (route.query.company_uuid) {
                formData.company_uuid = route.query.company_uuid;
            }
            if (route.query.vehicle) {
                formData.vehicle_uuid = route.query.vehicle;
            }
            if (route.query.type) {
                formData.maintenance_type = route.query.type;
            }
            if (route.query.mileage) {
                formData.mileage = Number(route.query.mileage);
            }
            if (route.query.description) {
                formData.service_description = route.query.description;
            }
            // Asignar fecha actual por defecto para facilidad
            formData.maintenance_date = new Date().toISOString().substring(0, 10);
        }
    } finally {
        isViewLoading.value = false;
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


/* ===== VALIDACIONES (Nativas) ===== */
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
