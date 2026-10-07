<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <!-- Contexto: convenio requerido por una tarjeta de otra empresa -->
            <div v-if="fromExternalCard" class="alert alert-info d-flex gap-2 align-items-start mb-3" role="note">
                <i class="fad fa-handshake mt-1" aria-hidden="true"></i>
                <div>
                    <span class="fw-medium d-block">Convenio requerido por tarjeta externa</span>
                    <small class="d-block">
                        Tarjeta
                        <strong>{{ agreementContext.cardNumber || '—' }}</strong>
                        del vehículo
                        <strong>{{ agreementContext.plate || '—' }}</strong>
                        <template v-if="agreementContext.company">
                            (empresa {{ agreementContext.company }})
                        </template>.
                        Se precargaron los datos conocidos; completa la información contractual.
                    </small>
                </div>
            </div>

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary" aria-hidden="true"></i>
                        <h6 class="mb-0 fw-medium">Información General</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;" aria-hidden="true"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <form @submit.prevent="handleSubmit" class="row g-3" novalidate>

                        <!-- Campo oculto empresa (no superadmin) -->
                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />

                        <!-- Empresa (solo superadmin) -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                            <label class="form-label required" for="f-company_uuid">Empresa</label>
                            <PrimeSelect :input-id="'f-company_uuid'" v-model="formData.company_uuid"
                                :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                placeholder="Seleccione..." showClear filter class="w-100"
                                :invalid="!!validationErrors['company_uuid']" />
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>

                        <!-- Vehículo -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="f-vehicle_uuid">Vehículo</label>
                            <PrimeSelect :input-id="'f-vehicle_uuid'" v-model="formData.vehicle_uuid"
                                :options="store.catalogs.vehicles" option-value="uuid" option-label="vehicle_license_plate"
                                placeholder="Seleccione..." showClear filter class="w-100"
                                :invalid="!!validationErrors['vehicle_uuid']" />
                            <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">
                                {{ validationErrors.vehicle_uuid }}
                            </div>
                        </div>

                        <!-- ID Interno del Acuerdo (automático) -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="f-agreement_internal_id">ID Interno del Acuerdo</label>
                            <input id="f-agreement_internal_id" v-model="formData.agreement_internal_id"
                                class="form-control font-monospace" :class="{ 'is-invalid': validationErrors.agreement_internal_id }"
                                :aria-invalid="!!validationErrors.agreement_internal_id"
                                :aria-describedby="validationErrors.agreement_internal_id ? 'f-agreement_internal_id-error' : undefined"
                                type="text" maxlength="4" autocomplete="off" placeholder="Ej: 0001 (Automático)" />
                            <small class="form-text text-muted d-block mt-1">Se genera automáticamente con 4 dígitos.</small>
                            <div v-if="validationErrors.agreement_internal_id" class="invalid-feedback d-block" id="f-agreement_internal_id-error" role="alert">
                                {{ validationErrors.agreement_internal_id }}
                            </div>
                        </div>

                        <!-- NIT Entidad Contratante -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="f-contracting_entity_nit">NIT Entidad
                                Contratante</label>
                            <input id="f-contracting_entity_nit" v-model="formData.contracting_entity_nit"
                                class="form-control" :class="{ 'is-invalid': validationErrors.contracting_entity_nit }"
                                :aria-invalid="!!validationErrors.contracting_entity_nit"
                                :aria-describedby="validationErrors.contracting_entity_nit ? 'f-contracting_entity_nit-error' : undefined"
                                type="text" autocomplete="off" placeholder="Ingresa el NIT" />
                            <div v-if="validationErrors.contracting_entity_nit" class="invalid-feedback d-block" id="f-contracting_entity_nit-error" role="alert">
                                {{ validationErrors.contracting_entity_nit }}
                            </div>
                        </div>

                        <!-- Nombre Entidad Contratante -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="f-contracting_entity_name">Nombre Entidad
                                Contratante</label>
                            <input id="f-contracting_entity_name" v-model="formData.contracting_entity_name"
                                class="form-control" :class="{ 'is-invalid': validationErrors.contracting_entity_name }"
                                :aria-invalid="!!validationErrors.contracting_entity_name"
                                :aria-describedby="validationErrors.contracting_entity_name ? 'f-contracting_entity_name-error' : undefined"
                                type="text" autocomplete="off" placeholder="Ingresa el nombre de la entidad" />
                            <div v-if="validationErrors.contracting_entity_name" class="invalid-feedback d-block" id="f-contracting_entity_name-error" role="alert">
                                {{ validationErrors.contracting_entity_name }}
                            </div>
                        </div>

                        <!-- Fecha de Inicio de Vigencia -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="f-effective_date">Fecha de Inicio de Vigencia</label>
                            <input id="f-effective_date" v-model="formData.effective_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.effective_date }"
                                :aria-invalid="!!validationErrors.effective_date"
                                :aria-describedby="validationErrors.effective_date ? 'f-effective_date-error' : undefined"
                                type="date" autocomplete="off" />
                            <div v-if="validationErrors.effective_date" class="invalid-feedback d-block" id="f-effective_date-error" role="alert">
                                {{ validationErrors.effective_date }}
                            </div>
                        </div>

                        <!-- Fecha de Expiración -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="f-expiry_date">Fecha de Expiración</label>
                            <input id="f-expiry_date" v-model="formData.expiry_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.expiry_date }"
                                :aria-invalid="!!validationErrors.expiry_date"
                                :aria-describedby="validationErrors.expiry_date ? 'f-expiry_date-error' : undefined"
                                type="date" autocomplete="off" />
                            <div v-if="validationErrors.expiry_date" class="invalid-feedback d-block" id="f-expiry_date-error" role="alert">
                                {{ validationErrors.expiry_date }}
                            </div>
                        </div>

                        <!-- Nombre del Representante -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="f-rep_name">Nombre del Representante</label>
                            <input id="f-rep_name" v-model="formData.rep_name" class="form-control"
                                :class="{ 'is-invalid': validationErrors.rep_name }"
                                :aria-invalid="!!validationErrors.rep_name"
                                :aria-describedby="validationErrors.rep_name ? 'f-rep_name-error' : undefined"
                                type="text" autocomplete="off" placeholder="Ingresa el nombre del representante" />
                            <div v-if="validationErrors.rep_name" class="invalid-feedback d-block" id="f-rep_name-error" role="alert">
                                {{ validationErrors.rep_name }}
                            </div>
                        </div>

                        <!-- Documento del Representante -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="f-rep_document_id">Documento del Representante</label>
                            <input id="f-rep_document_id" v-model="formData.rep_document_id" class="form-control"
                                :class="{ 'is-invalid': validationErrors.rep_document_id }"
                                :aria-invalid="!!validationErrors.rep_document_id"
                                :aria-describedby="validationErrors.rep_document_id ? 'f-rep_document_id-error' : undefined"
                                type="text" autocomplete="off" placeholder="Ingresa el documento" />
                            <div v-if="validationErrors.rep_document_id" class="invalid-feedback d-block" id="f-rep_document_id-error" role="alert">
                                {{ validationErrors.rep_document_id }}
                            </div>
                        </div>

                        <!-- Modalidad de Transporte (fija: Especial) -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="f-transport_modality">Modalidad de Transporte</label>
                            <input id="f-transport_modality" v-model="formData.transport_modality" class="form-control bg-light"
                                type="text" readonly aria-readonly="true" />
                        </div>

                        <!-- Estado -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="f-status">Estado</label>
                            <PrimeSelect :input-id="'f-status'" v-model="formData.status"
                                :options="[{ label: 'Activo', value: '1' }, { label: 'Inactivo', value: '0' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['status']" />
                            <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">
                                {{ validationErrors.status }}
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>

                    </form>
                </div>
            </div>

            <!-- Card informativa -->
            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body py-3">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    Los convenios de colaboración empresarial permiten formalizar alianzas
                                    estratégicas para la operación conjunta de flotas o servicios.
                                </li>
                                <li>
                                    Es crucial verificar que la fecha de expiración del convenio esté alineada
                                    con los contratos vigentes de los vehículos asociados.
                                </li>
                                <li>
                                    La modalidad de transporte definida en el convenio determina las restricciones
                                    legales y operativas aplicables a la flota vinculada.
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
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBusinessCollaborationAgreementsStore } from '../store/businessCollaborationAgreements.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useBusinessCollaborationAgreementsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);


const isEditMode = computed(() => route.params.id !== undefined);

/** Ruta a la que volver al guardar/cancelar cuando viene de otro flujo. */
const returnTo = computed(() => (route.query.retorno ? String(route.query.retorno) : null));
/** El convenio se abrió automáticamente tras guardar una tarjeta externa. */
const fromExternalCard = computed(() => route.query.origen === 'tarjeta');

/** Datos de contexto para el aviso (solo informativos, no se guardan). */
const agreementContext = computed(() => ({
    plate: route.query.vehicle_plate ? String(route.query.vehicle_plate) : '',
    cardNumber: route.query.operating_card_number ? String(route.query.operating_card_number) : '',
    company: route.query.contracting_entity_name ? String(route.query.contracting_entity_name) : '',
}));

/** Campos que pueden venir precargados desde la tarjeta de operación. */
const AGREEMENT_PREFILL_FIELDS = [
    'vehicle_uuid',
    'company_uuid',
    'contracting_entity_name',
    'effective_date',
    'expiry_date',
];

/** Modalidad fija del convenio (no editable). */
const FIXED_TRANSPORT_MODALITY = 'ESPECIAL';

/** Normaliza una fecha a YYYY-MM-DD para inputs type="date". */
const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

/** Aplica la precarga sin pisar valores ya diligenciados. */
const applyAgreementPrefill = () => {
    AGREEMENT_PREFILL_FIELDS.forEach((key) => {
        const raw = route.query[key];
        if (raw === undefined || raw === null || raw === '') return;
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') return;
        formData[key] = key === 'effective_date' || key === 'expiry_date'
            ? toDateInput(raw)
            : raw;
    });
};

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Convenio de Colaboración' : 'Registrar Convenio de Colaboración');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [ { label: 'Convenios de Colaboración', to: '/convenios-colaboracion' }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario
const formData = reactive({
    status: '1',
    company_uuid: '',
    vehicle_uuid: '',
    agreement_internal_id: '',
    contracting_entity_nit: '',
    contracting_entity_name: '',
    effective_date: '',
    expiry_date: '',
    rep_name: '',
    rep_document_id: '',
    transport_modality: FIXED_TRANSPORT_MODALITY,
});

const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    // Validar requeridos
    if (isEmpty(formData.company_uuid)) validationErrors.company_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Este campo es obligatorio';
    // agreement_internal_id es automático / opcional
    if (isEmpty(formData.contracting_entity_nit)) validationErrors.contracting_entity_nit = 'Este campo es obligatorio';
    if (isEmpty(formData.contracting_entity_name)) validationErrors.contracting_entity_name = 'Este campo es obligatorio';
    if (isEmpty(formData.effective_date)) validationErrors.effective_date = 'Este campo es obligatorio';
    if (isEmpty(formData.expiry_date)) validationErrors.expiry_date = 'Este campo es obligatorio';
    if (isEmpty(formData.rep_name)) validationErrors.rep_name = 'Este campo es obligatorio';
    if (isEmpty(formData.rep_document_id)) validationErrors.rep_document_id = 'Este campo es obligatorio';
    if (isEmpty(formData.status)) validationErrors.status = 'Este campo es obligatorio';

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push(returnTo.value || '/convenios-colaboracion');

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

        if (isEditMode.value) {
            await store.updateItem(uuid, formData);
        } else {
            const newItem = await store.createItem(formData);
            uuid = newItem?.uuid || newItem?.id;
        }

        // Desde el alta del vehículo o el perfil: volver al origen con datos frescos.
        if (returnTo.value) router.push(returnTo.value);
        else goBack();
    } catch (error) {
        toast('Error', 'No se pudo procesar la solicitud', 'error');
    } finally {
        submitting.value = false;
    }
};

watch(() => formData.company_uuid, async (newVal) => {
    if (!isEditMode.value && newVal) {
        formData.agreement_internal_id = await store.fetchNextConsecutive(newVal);
    }
});

onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.loadFormOptions();
        if (!isSuperAdmin.value) {
            formData.company_uuid = userStore.company_uuid;
        }
        if (isEditMode.value) {
            const item = await store.getItem(route.params.id);
            if (item) {
                Object.assign(formData, item);
                formData.status = (item.status == 1 || item.status === true || item.status === '1') ? '1' : '0';
                // Normaliza fechas al formato del input type="date"
                formData.effective_date = toDateInput(item.effective_date);
                formData.expiry_date = toDateInput(item.expiry_date);
            }
        } else {
            // Precarga contextual (p. ej. desde una tarjeta externa) antes del consecutivo.
            applyAgreementPrefill();
            formData.agreement_internal_id = await store.fetchNextConsecutive(formData.company_uuid);
        }
        // La modalidad es fija, independientemente de lo que devuelva el registro.
        formData.transport_modality = FIXED_TRANSPORT_MODALITY;
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

/* ===== FORM LABELS ===== */
.form-label {
    font-size: 0.825rem;
    font-weight: 500;
    line-height: 1.25;
    margin-bottom: 0.3rem;
    display: inline-block;
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

.invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875em;
    color: #dc3545;
}

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
