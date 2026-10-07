<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <WizardProgress
                v-if="wizardUuid"
                current="tarjeta"
                :done-keys="wizardDoneKeys"
                :incomplete-keys="wizardIncompleteKeys"
                :disabled-keys="wizardDisabledKeys"
                clickable
                @navigate="onWizardNavigate"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 py-md-3 px-3 px-md-4 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Información General</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos
                            obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <form ref="cardFormRef" @submit.prevent="handleSubmit" class="row g-3" novalidate>

                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-company_uuid">Empresa
                                Propietaria/Asignada</label>
                            <PrimeSelect :input-id="'f-company_uuid'" v-model="formData.company_uuid"
                                :options="store.catalogs?.companies || []" option-value="uuid" option-label="business_name"
                                placeholder="Seleccionar empresa" showClear filter class="w-100"
                                :invalid="!!validationErrors['company_uuid']" />
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">{{
                                validationErrors.company_uuid }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-affiliated_company">Empresa
                                Afiliada</label>
                            <input id="f-affiliated_company" :aria-invalid="!!validationErrors['affiliated_company']" :aria-describedby="validationErrors['affiliated_company'] ? 'f-affiliated_company-error' : undefined" type="text" autocomplete="off" class="form-control"
                                v-model="formData.affiliated_company" placeholder="Ingrese empresa afiliada"
                                :class="{ 'is-invalid': validationErrors.affiliated_company }" />
                            <div v-if="validationErrors.affiliated_company" class="invalid-feedback d-block" id="f-affiliated_company-error" role="alert">{{
                                validationErrors.affiliated_company }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-area_of_coverage">Radio de
                                Acción</label>
                            <input id="f-area_of_coverage" :aria-invalid="!!validationErrors['area_of_coverage']" :aria-describedby="validationErrors['area_of_coverage'] ? 'f-area_of_coverage-error' : undefined" type="text" autocomplete="off" class="form-control bg-light"
                                v-model="formData.area_of_coverage" placeholder="Ingrese radio de acción"
                                :readonly="true" aria-readonly="true" :class="{ 'is-invalid': validationErrors.area_of_coverage }" />
                            <div v-if="validationErrors.area_of_coverage" class="invalid-feedback d-block" id="f-area_of_coverage-error" role="alert">{{
                                validationErrors.area_of_coverage }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-service_type">Modalidad de
                                Servicio</label>
                            <input id="f-service_type" :aria-invalid="!!validationErrors['service_type']" :aria-describedby="validationErrors['service_type'] ? 'f-service_type-error' : undefined" type="text" autocomplete="off" class="form-control bg-light"
                                v-model="formData.service_type" placeholder="Ingrese modalidad de servicio"
                                :readonly="true" aria-readonly="true" :class="{ 'is-invalid': validationErrors.service_type }" />
                            <div v-if="validationErrors.service_type" class="invalid-feedback d-block" id="f-service_type-error" role="alert">{{
                                validationErrors.service_type }}</div>
                        </div>

                        <div class="col-12 mt-2">
                            <h6 class="text-muted fw-medium mb-3 pb-2 pt-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-calendar-alt me-2"></i>Vigencia y Detalles
                            </h6>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-transport_mode">Modalidad de
                                Transporte</label>
                            <input id="f-transport_mode" :aria-invalid="!!validationErrors['transport_mode']" :aria-describedby="validationErrors['transport_mode'] ? 'f-transport_mode-error' : undefined" type="text" autocomplete="off" class="form-control bg-light"
                                v-model="formData.transport_mode" placeholder="Ingrese modalidad de transporte"
                                :readonly="true" aria-readonly="true" :class="{ 'is-invalid': validationErrors.transport_mode }" />
                            <div v-if="validationErrors.transport_mode" class="invalid-feedback d-block" id="f-transport_mode-error" role="alert">{{
                                validationErrors.transport_mode }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-issue_date">Fecha de
                                Expedición</label>
                            <input id="f-issue_date" :aria-invalid="!!validationErrors['issue_date']" :aria-describedby="validationErrors['issue_date'] ? 'f-issue_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.issue_date"
                                :class="{ 'is-invalid': validationErrors.issue_date }" />
                            <div v-if="validationErrors.issue_date" class="invalid-feedback d-block" id="f-issue_date-error" role="alert">{{
                                validationErrors.issue_date }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-expiration_date">Fecha de
                                Expiración</label>
                            <input id="f-expiration_date" :aria-invalid="!!validationErrors['expiration_date']" :aria-describedby="validationErrors['expiration_date'] ? 'f-expiration_date-error' : undefined" type="date" autocomplete="off" placeholder="YYYY-MM-DD" class="form-control"
                                v-model="formData.expiration_date"
                                :class="{ 'is-invalid': validationErrors.expiration_date }" />
                            <div v-if="validationErrors.expiration_date" class="invalid-feedback d-block" id="f-expiration_date-error" role="alert">{{
                                validationErrors.expiration_date }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-operating_card_number">N°
                                Tarjeta</label>
                            <input id="f-operating_card_number" :aria-invalid="!!validationErrors['operating_card_number']" :aria-describedby="validationErrors['operating_card_number'] ? 'f-operating_card_number-error' : undefined" type="text" autocomplete="off" class="form-control"
                                v-model="formData.operating_card_number" placeholder="Ej: 12345678"
                                :class="{ 'is-invalid': validationErrors.operating_card_number }" />
                            <div v-if="validationErrors.operating_card_number" class="invalid-feedback d-block" id="f-operating_card_number-error" role="alert">{{
                                validationErrors.operating_card_number }}</div>
                        </div>

                        <div class="col-12 mt-2">
                            <h6 class="text-muted fw-medium mb-3 pb-2 pt-2 border-bottom" style="font-size: 0.9rem;">
                                <i class="fad fa-car-bus me-2"></i>Asignación de Vehículo
                            </h6>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-vehicle_uuid">Vehículo</label>
                            <PrimeSelect :input-id="'f-vehicle_uuid'" v-model="formData.vehicle_uuid"
                                :options="uniqueVehicles" option-value="uuid" option-label="vehicle_license_plate"
                                placeholder="Seleccionar vehículo" showClear filter class="w-100" :disabled="!!wizardUuid"
                                :invalid="!!validationErrors['vehicle_uuid']" />
                            <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">{{
                                validationErrors.vehicle_uuid }}</div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="internal_number">N° Interno del
                                Vehículo</label>
                            <input type="text" autocomplete="off" class="form-control" id="internal_number"
                                v-model="formData.internal_number" placeholder="Ej: 001"
                                :class="{ 'is-invalid': validationErrors.internal_number }" />
                            <div v-if="validationErrors.internal_number" class="invalid-feedback d-block" id="f-internal_number-error" role="alert">{{
                                validationErrors.internal_number }}</div>
                            <div v-if="hasAgreements" class="small mb-0 mt-1 d-flex align-items-center gap-1" style="color: #8a5a00;">
                                <i class="fad fa-exclamation-triangle"></i>
                                <span>Vehículo con convenio. Auto-asignación inactiva.</span>
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-status">Estado</label>
                            <PrimeSelect :input-id="'f-status'" v-model="formData.status"
                                :options="[{ label: 'Activo', value: '1' }, { label: 'Inactivo', value: '0' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['status']" />
                            <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">{{
                                validationErrors.status }}</div>
                        </div>

                        <!-- Decisión de convenio: solo en flujo de alta del vehículo -->
                        <div v-if="wizardUuid && canCreateAgreement" class="col-12 mt-3">
                            <div class="alert alert-info d-flex gap-2 align-items-start mb-0" role="note">
                                <i class="fad fa-handshake mt-1" aria-hidden="true"></i>
                                <div class="flex-grow-1">
                                    <div class="form-check">
                                        <input id="f-requires_agreement" v-model="requiresAgreement"
                                            class="form-check-input" type="checkbox" />
                                        <label class="form-check-label fw-medium" for="f-requires_agreement">
                                            La tarjeta pertenece a otra empresa y requiere convenio de colaboración
                                        </label>
                                    </div>
                                    <small class="text-muted d-block mt-1">
                                        Puedes marcarlo aunque no cambies ningún campo: al continuar se abrirá el
                                        convenio. Si la tarjeta es de Transportes Sin Barreras, déjalo sin marcar.
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 mt-4 pt-3 border-top">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isUpdateMode" :wizard-mode="!!wizardUuid"
                                :disabled="!canSubmitForm" :submit-label="submitLabel"
                                :cancel-label="cancelLabel" cancel-icon="fas fa-arrow-left" @cancel="handleCancel" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body py-3">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-6"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    La tarjeta de operación es el documento que acredita la autorización legal para
                                    prestar el servicio de transporte público o privado especial.
                                </li>
                                <li>
                                    Es fundamental mantener actualizada la fecha de expiración para evitar sanciones por
                                    parte de las autoridades de tránsito y transporte.
                                </li>
                                <li>
                                    El área de cobertura determina si el vehículo puede operar solo a nivel municipal,
                                    departamental o nacional.
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
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from '@/utils/toast.js';
import { useOperationCardsStore } from '../store/operationCards.store.js';
import { useVehiclesStore } from '@/features/vehicles/store/vehicles.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useNoAutocomplete } from '@/hooks/useNoAutocomplete.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';
import WizardProgress from '@/components/WizardProgress.vue';
import { useDocumentWizard } from '@/hooks/useDocumentWizard.js';
import { confirmUnsavedChanges } from '@/utils/confirm.js';

const route = useRoute();
const router = useRouter();
const store = useOperationCardsStore();
const vehiclesStore = useVehiclesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);


const isEditMode = computed(() => route.params.id !== undefined);

/** Modo asistente: creación encadenada tras registrar el vehículo (?wizard=<uuid>) */
const wizardUuid = computed(() => (route.query.wizard ? String(route.query.wizard) : null));
/** Origen al que volver al guardar/cancelar desde el menú de documentos (?retorno=<ruta>) */
const returnTo = computed(() => (route.query.retorno ? String(route.query.retorno) : null));
/** Registrar versión nueva aunque ya exista una tarjeta (?nuevo=1) */
const isNuevo = computed(() => route.query.nuevo === '1');
const { WIZARD_STEPS, availableSteps, stepRoute, nextStepRoute, prevStepRoute, exitRoute, fetchExistingDocs, getSessionDone, markStepDone, clearSessionDone, toDateInput } = useDocumentWizard();
const wizardDoneKeys = ref([]);
const wizardIncompleteKeys = ref([]);
// UUID de la tarjeta precargada en el asistente para actualizar en vez de duplicar
const editingCardUuid = ref(null);
// El asistente actualiza la tarjeta existente (precargada y sin flag de nuevo)
const esActualizacion = computed(() => !isEditMode.value && !!wizardUuid.value && !isNuevo.value && !!editingCardUuid.value);

/**
 * Decisión explícita del usuario: la tarjeta es de otra empresa y el flujo
 * debe continuar hacia el convenio. Solo controla la navegación, no persiste.
 */
const requiresAgreement = ref(false);

/** Permiso para abrir el formulario de convenios tras guardar la tarjeta. */
const canCreateAgreement = computed(() => {
    try {
        return permissionsStore.can('business_collaboration_agreements.create');
    } catch {
        return false;
    }
});

/** El usuario pidió continuar al convenio (con permiso y en flujo de alta). */
const agreementRequested = computed(() =>
    requiresAgreement.value && canCreateAgreement.value && !!wizardUuid.value
);

/** Hay un documento existente que se está actualizando (desde listado o desde el perfil). */
const isUpdateMode = computed(() => isEditMode.value || esActualizacion.value);

/** Normaliza valores para comparar sin falsos positivos (espacios, formatos). */
const normalizeForCompare = (data) => {
    const out = {};
    Object.keys(data).forEach((key) => {
        const value = data[key];
        out[key] = typeof value === 'string' ? value.trim() : value;
    });
    return out;
};

const originalSnapshot = ref('');

/** Solo se permite guardar si hay cambios reales respecto al documento original. */
const hasChanges = computed(() => {
    if (!isUpdateMode.value) return true;
    return JSON.stringify(normalizeForCompare(formData)) !== originalSnapshot.value;
});

/**
 * Campos que no cuentan como contenido del usuario: auto-rellenados,
 * valores por defecto o de solo lectura.
 */
const AUTO_FILLED_CARD_FIELDS = new Set([
    'vehicle_uuid',
    'company_uuid',
    'status',
    'area_of_coverage',
    'service_type',
    'transport_mode',
    'internal_number',
]);

/** Indica si el usuario escribió contenido (modo creación, para no perderlo en silencio). */
const hasUserInput = computed(() => {
    const normalized = normalizeForCompare(formData);
    return Object.entries(normalized).some(([key, value]) => {
        if (AUTO_FILLED_CARD_FIELDS.has(key)) return false;
        return value !== null && value !== undefined && value !== '';
    });
});

/** Indica si salir requiere confirmación: cambios reales o contenido nuevo sin guardar. */
const needsLeaveConfirm = () => (isUpdateMode.value && hasChanges.value)
    || (!isUpdateMode.value && hasUserInput.value);

const submitLabel = computed(() => {
    if (agreementRequested.value) {
        // Sin cambios no hace falta volver a guardar: solo continuar.
        return (isUpdateMode.value && !hasChanges.value)
            ? 'Continuar al convenio'
            : 'Guardar y continuar al convenio';
    }
    if (isUpdateMode.value) return hasChanges.value ? 'Actualizar' : 'Sin cambios';
    return wizardUuid.value ? 'Guardar y finalizar' : 'Guardar';
});

/** El botón principal está activo si hay cambios, o si se pidió el convenio. */
const canSubmitForm = computed(() => {
    if (agreementRequested.value) return true;
    return !(isUpdateMode.value && !hasChanges.value);
});

const cancelLabel = computed(() => {
    if (returnTo.value) return 'Volver al vehículo';
    if (wizardUuid.value) return 'Volver al perfil';
    return 'Volver al listado';
});

/** Pasos que no se pueden abrir: vehículo (ya registrado) o sin permiso. */
const wizardDisabledKeys = computed(() => {
    const allowed = new Set(availableSteps(permissionsStore).map((s) => s.key));
    return WIZARD_STEPS
        .filter((s) => s.key === 'vehiculo' || !allowed.has(s.key))
        .map((s) => s.key);
});

const goExit = () => {
    clearSessionDone(wizardUuid.value);
    router.push(returnTo.value || exitRoute(wizardUuid.value));
};

/** Navega a un paso concreto del asistente (nodos del stepper). */
const navigateToStep = (stepKey) => {
    if (stepKey === 'vehiculo') {
        router.push(exitRoute(wizardUuid.value));
        return;
    }
    const target = stepRoute(stepKey, wizardUuid.value);
    const query = { ...(target.query || {}) };
    // Conserva el origen para que guardar/cancelar siga volviendo al perfil.
    if (returnTo.value) query.retorno = returnTo.value;
    router.push({ path: target.path, query });
};

/** Sale del formulario tras guardar: perfil, siguiente paso o listado. */
const navigateAfterSave = () => {
    if (returnTo.value) {
        router.push(returnTo.value);
        return;
    }
    if (wizardUuid.value) {
        const next = nextStepRoute('tarjeta', wizardUuid.value, permissionsStore);
        if (next?.path?.includes('/vehiculos/perfil/')) {
            goExit();
            return;
        }
        router.push(next);
        return;
    }
    goBack();
};

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => (isEditMode.value || esActualizacion.value) ? 'Actualizar Tarjeta de Operación' : 'Registrar Tarjeta de Operación');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [{ label: 'Tarjetas de Operación', to: '/tarjetas-de-operacion', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' },]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario (inicializar campos del JSON de la Tarea 1)
const formData = reactive({
    status: '1',
    area_of_coverage: 'NACIONAL',
    company_uuid: '',
    affiliated_company: '',
    service_type: 'PÚBLICO',
    transport_mode: 'TERRESTRE',
    issue_date: '',
    expiration_date: '',
    operating_card_number: '',
    vehicle_uuid: '',
    internal_number: ''
});

const hasAgreements = ref(false);
// Mientras carga el formulario no se debe marcar como "con cambios".
const isLoadingData = ref(true);

// Deduplica los vehículos del catálogo por uuid (evita registros repetidos en el select)
const uniqueVehicles = computed(() => {
    const seen = new Set();
    return (store.catalogs?.vehicles || []).filter((v) => {
        const key = v?.uuid ?? v?.vehicle_license_plate;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
});

/** Carga metadatos del vehículo: convenios y N° interno (autocompletado). */
const applyVehicleMeta = async (vehicleUuid) => {
    if (!vehicleUuid) {
        hasAgreements.value = false;
        return;
    }
    try {
        const vehicle = await vehiclesStore.fetchProfileById(vehicleUuid);
        if (vehicle) {
            const agreements = vehicle.business_collaboration_agreements || vehicle.businessCollaborationAgreements;
            hasAgreements.value = Array.isArray(agreements) && agreements.length > 0;
            formData.internal_number = vehicle.internal_number || '';
        }
    } catch (error) {
        console.error('Error al obtener detalles del vehículo:', error);
        hasAgreements.value = false;
    }
};

watch(() => formData.vehicle_uuid, async (newVal) => {
    // Durante la carga inicial los datos se completan de forma controlada
    // para no marcar el formulario como "modificado".
    if (isLoadingData.value) return;
    await applyVehicleMeta(newVal);
});

// Sin sugerencias del navegador en el asistente (salvo N° interno)
const cardFormRef = ref(null);
useNoAutocomplete(cardFormRef, { except: ['internal_number'] });

const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    // Validar requeridos según el JSON
    if (isEmpty(formData.company_uuid)) validationErrors.company_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.affiliated_company)) validationErrors.affiliated_company = 'Este campo es obligatorio';
    if (isEmpty(formData.area_of_coverage)) validationErrors.area_of_coverage = 'Este campo es obligatorio';
    if (isEmpty(formData.service_type)) validationErrors.service_type = 'Este campo es obligatorio';
    if (isEmpty(formData.transport_mode)) validationErrors.transport_mode = 'Este campo es obligatorio';
    if (isEmpty(formData.issue_date)) validationErrors.issue_date = 'Este campo es obligatorio';
    if (isEmpty(formData.expiration_date)) validationErrors.expiration_date = 'Este campo es obligatorio';
    if (isEmpty(formData.operating_card_number)) validationErrors.operating_card_number = 'Este campo es obligatorio';
    if (isEmpty(formData.status)) validationErrors.status = 'Este campo es obligatorio';

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => {
    // Desde el menú de documentos: volver al origen (perfil) en vez del listado
    if (returnTo.value) {
        router.push(returnTo.value);
    } else if (wizardUuid.value) {
        router.push(prevStepRoute('tarjeta', wizardUuid.value, permissionsStore));
    } else {
        router.push('/tarjetas-de-operacion');
    }
};

/** Valida y persiste la tarjeta actual. Devuelve `true` si se guardó. */
const persistForm = async () => {
    // En modo asistente el vehículo queda fijado al que originó el flujo
    if (wizardUuid.value) formData.vehicle_uuid = wizardUuid.value;

    if (!validateForm()) {
        await nextTick();
        const firstError = document.querySelector('[aria-invalid="true"], .is-invalid');
        if (firstError) {
            if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(firstError.tagName)) firstError.setAttribute('tabindex', '-1');
            firstError.focus({ preventScroll: true });
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        toast('Atención', 'Revisa los campos obligatorios', 'warning');
        return false;
    }

    try {
        submitting.value = true;

        if (isEditMode.value) {
            await store.updateItem(route.params.id, formData);
        } else if (editingCardUuid.value) {
            await store.updateItem(editingCardUuid.value, formData);
        } else {
            await store.createItem(formData);
        }

        originalSnapshot.value = JSON.stringify(normalizeForCompare(formData));
        return true;
    } catch (error) {
        toast('Error', 'No se pudo procesar la solicitud', 'error');
        return false;
    } finally {
        submitting.value = false;
    }
};

/** Continúa hacia el convenio precargado con los datos de la tarjeta recién guardada. */
const goToAgreementForm = () => {
    const plate = uniqueVehicles.value.find((v) => v?.uuid === wizardUuid.value)?.vehicle_license_plate || '';
    // Conserva el origen real (perfil con panel) si ya venía definido.
    const retorno = returnTo.value || `/vehiculos/perfil/${wizardUuid.value}`;
    router.push({
        path: '/convenios-colaboracion/crear',
        query: {
            wizard: wizardUuid.value,
            retorno,
            origen: 'tarjeta',
            vehicle_uuid: formData.vehicle_uuid,
            company_uuid: formData.company_uuid,
            contracting_entity_name: formData.affiliated_company,
            effective_date: formData.issue_date,
            expiry_date: formData.expiration_date,
            operating_card_number: formData.operating_card_number,
            vehicle_plate: plate,
        },
    });
};

const handleSubmit = async () => {
    // Sin cambios pendientes: solo continuar al convenio, sin repetir el guardado.
    if (agreementRequested.value && isUpdateMode.value && !hasChanges.value) {
        if (wizardUuid.value) markStepDone(wizardUuid.value, 'tarjeta');
        goToAgreementForm();
        return;
    }

    const saved = await persistForm();
    if (!saved) return;
    if (wizardUuid.value) markStepDone(wizardUuid.value, 'tarjeta');
    // Tarjeta externa: el flujo continúa en el convenio sin salir del alta.
    if (agreementRequested.value) {
        goToAgreementForm();
        return;
    }
    navigateAfterSave();
};

/** Abre un nodo del stepper, confirmando si hay cambios sin guardar. */
const onWizardNavigate = async (stepKey) => {
    if (!wizardUuid.value || stepKey === 'tarjeta') return;

    if (needsLeaveConfirm()) {
        const decision = await confirmUnsavedChanges();
        if (decision === 'cancel') return;
        if (decision === 'save') {
            const saved = await persistForm();
            if (!saved) return;
        }
    }
    navigateToStep(stepKey);
};

/** Botón secundario: vuelve atrás confirmando cambios sin guardar. */
const handleCancel = async () => {
    if (needsLeaveConfirm()) {
        const decision = await confirmUnsavedChanges();
        if (decision === 'cancel') return;
        if (decision === 'save') {
            const saved = await persistForm();
            if (!saved) return;
        }
    }
    goBack();
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
                Object.assign(formData, item);
                if (formData.issue_date) formData.issue_date = String(formData.issue_date).slice(0, 10);
                if (formData.expiration_date) formData.expiration_date = String(formData.expiration_date).slice(0, 10);
                if (item.vehicle?.internal_number && !formData.internal_number) {
                    formData.internal_number = item.vehicle.internal_number;
                }
                formData.status = (item.status == 1 || item.status === true || item.status === '1') ? '1' : '0';
            }
        } else if (wizardUuid.value) {
            // Modo asistente: vehículo prefijado y documentos ya registrados
            formData.vehicle_uuid = wizardUuid.value;
        }

        // Progreso del stepper + precarga de la tarjeta existente (una sola consulta)
        if (wizardUuid.value) {
            wizardDoneKeys.value = getSessionDone(wizardUuid.value);
            try {
                const found = await fetchExistingDocs(wizardUuid.value);
                const done = new Set(['vehiculo', ...getSessionDone(wizardUuid.value)]);
                const incomplete = new Set();
                if (found.soat) done.add('soat');
                if (found.rce && found.rcc) done.add('poliza');
                else if (found.rce || found.rcc) incomplete.add('poliza');
                if (found.rtm) done.add('tecnomecanica');
                if (found.tarjeta) done.add('tarjeta');
                wizardDoneKeys.value = [...done];
                wizardIncompleteKeys.value = [...incomplete];

                // Precarga la tarjeta ya registrada (salvo registro de versión nueva)
                if (found.tarjeta && !isNuevo.value && !isEditMode.value) {
                    const t = found.tarjeta;
                    editingCardUuid.value = t.uuid ?? null;
                    Object.assign(formData, {
                        company_uuid: t.company_uuid || formData.company_uuid,
                        affiliated_company: t.affiliated_company ?? formData.affiliated_company,
                        area_of_coverage: t.area_of_coverage ?? formData.area_of_coverage,
                        service_type: t.service_type ?? formData.service_type,
                        transport_mode: t.transport_mode ?? formData.transport_mode,
                        issue_date: toDateInput(t.issue_date),
                        expiration_date: toDateInput(t.expiration_date),
                        operating_card_number: t.operating_card_number ?? '',
                    });
                    if (t.status !== undefined && t.status !== null) {
                        formData.status = (t.status == 1 || t.status === true || t.status === '1') ? '1' : '0';
                    }
                }
            } catch {
                wizardIncompleteKeys.value = [];
            }
        }

        // Completa metadatos del vehículo y habilita la detección de cambios
        await applyVehicleMeta(formData.vehicle_uuid);
        isLoadingData.value = false;
        // Foto del estado cargado para detectar cambios reales antes de actualizar
        originalSnapshot.value = JSON.stringify(normalizeForCompare(formData));
    } finally {
        isViewLoading.value = false;
    }
});

</script>

<style scoped>
.required::after {
    content: " *";
    color: #dc3545;
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
