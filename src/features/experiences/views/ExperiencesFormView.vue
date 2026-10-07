<template>
    <div class="row g-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-briefcase text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Información General</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos
                            obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-3 p-md-4">
                    <form @submit.prevent="handleSubmit" class="row g-3" novalidate>
                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4 col-xxl-4" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa</label>
                             <PrimeSelect :input-id="'company_uuid'" v-model="formData.company_uuid"
                                :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                placeholder="Seleccione una empresa..." showClear filter class="w-100"
                                :invalid="!!validationErrors.company_uuid" />
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4 col-xxl-4">
                            <label class="form-label required" for="customer_name">
                                Nombre del Cliente
                            </label>
                            <input id="customer_name" v-model="formData.customer_name" class="form-control"
                                :class="{ 'is-invalid': validationErrors.customer_name }" type="text" autocomplete="off"
                                placeholder="Razón social o nombre del cliente" maxlength="255" />
                            <div v-if="validationErrors.customer_name" class="invalid-feedback d-block" id="f-customer_name-error" role="alert">
                                {{ validationErrors.customer_name }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4 col-xxl-4">
                            <label class="form-label" for="value_before_tax">
                                Valor Antes de Impuestos
                            </label>
                            <div class="input-group">
                                <span class="input-group-text">$</span>
                                <input id="value_before_tax" v-model.number="formData.value_before_tax"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.value_before_tax }"
                                    type="number" placeholder="0.00" step="0.01" min="0" />
                            </div>
                            <div v-if="validationErrors.value_before_tax" class="invalid-feedback d-block" id="f-value_before_tax-error" role="alert">
                                {{ validationErrors.value_before_tax }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4 col-xxl-4">
                            <label class="form-label" for="currency">Moneda</label>
                            <input id="currency" v-model="formData.currency" class="form-control"
                                :class="{ 'is-invalid': validationErrors.currency }" type="text" autocomplete="off"
                                placeholder="COP" maxlength="10" />
                            <div v-if="validationErrors.currency" class="invalid-feedback d-block" id="f-currency-error" role="alert">
                                {{ validationErrors.currency }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4 col-xxl-4">
                            <label class="form-label" for="start_date">Fecha de Inicio</label>
                            <input id="start_date" v-model="formData.start_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.start_date }" type="date" />
                            <div v-if="validationErrors.start_date" class="invalid-feedback d-block" id="f-start_date-error" role="alert">
                                {{ validationErrors.start_date }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4 col-xxl-4">
                            <label class="form-label" for="end_date">Fecha de Fin</label>
                            <input id="end_date" v-model="formData.end_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.end_date }" type="date" />
                            <div v-if="validationErrors.end_date" class="invalid-feedback d-block" id="f-end_date-error" role="alert">
                                {{ validationErrors.end_date }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4 col-xxl-4">
                            <label class="form-label" for="is_ongoing">Vigente Hasta</label>
                            <input id="is_ongoing" v-model="formData.is_ongoing" class="form-control"
                                :class="{ 'is-invalid': validationErrors.is_ongoing }" type="date" />
                            <small class="form-text text-muted d-block mt-1">Dejar vacío si la experiencia finalizó.</small>
                            <div v-if="validationErrors.is_ongoing" class="invalid-feedback d-block" id="f-is_ongoing-error" role="alert">
                                {{ validationErrors.is_ongoing }}
                            </div>
                        </div>
                        <div class="col-12">
                            <label class="form-label" for="remarks">Observaciones</label>
                            <textarea id="remarks" v-model="formData.remarks" class="form-control"
                                :class="{ 'is-invalid': validationErrors.remarks }" rows="4"
                                placeholder="Detalles sobre alcance, cumplimiento o desempeño..."></textarea>
                            <div v-if="validationErrors.remarks" class="invalid-feedback d-block" id="f-remarks-error" role="alert">
                                {{ validationErrors.remarks }}
                            </div>
                        </div>
                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                            <!-- BOTONES -->
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 mt-md-4 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-3 p-md-4">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li class="mb-1">
                                    Registrar experiencias previas es fundamental para acreditar capacidad financiera y
                                    técnica en licitaciones públicas y privadas.
                                </li>
                                <li class="mb-1">
                                    El campo <strong>Vigente Hasta</strong> determina si el sistema marca
                                    automáticamente el contrato como "En Curso". Si lo dejas vacío, se asumirá como
                                    finalizado en la fecha de fin indicada.
                                </li>
                                <li class="mb-1">
                                    Asegúrate de que el <strong>Valor Antes de Impuestos</strong> corresponda
                                    exactamente al valor firmado en el acta de inicio o contrato marco, sin incluir IVA
                                    ni retenciones.
                                </li>
                                <li>
                                    Las observaciones detalladas sobre el desempeño ayudan a justificar la calidad del
                                    servicio prestado en futuros procesos de selección.
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
/**
 * @file ExperiencesFormView.vue
 * @description Vista de formulario (crear/editar) del módulo de Experiencias.
 * Gestiona la carga de catálogos, validación manual y persistencia de datos.
 * @module experiences/FormView
 */

import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExperiencesStore } from '../store/experiences.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';

/** @type {import('vue-router').Route} Ruta activa */
const route = useRoute();

/** @type {import('vue-router').Router} Instancia del router */
const router = useRouter();

/** @type {import('pinia').Store} Store del módulo */
const store = useExperiencesStore();

/** @type {import('pinia').Store} Store de permisos */
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Experiencia' : 'Registrar Experiencia');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos de la experiencia comercial registrada' : 'Completa los datos para registrar una nueva experiencia o contrato comercial previo');
const breadcrumbs = computed(() => [{ label: 'Experiencias', to: '/empresas/experiencias', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' },]);


/**
 * Indica si el formulario está en modo edición.
 * @type {import('vue').ComputedRef<boolean>}
 */

/** @type {import('vue').Ref<boolean>} Indicador de carga inicial */
const isViewLoading = ref(true);

/** @type {import('vue').Ref<boolean>} Indicador de envío en progreso */
const submitting = ref(false);

/** @type {import('vue').Reactive<Object>} Errores de validación por campo */
const validationErrors = reactive({});

/**
 * Estado reactivo del formulario.
 * @type {import('vue').Reactive<Object>}
 * @property {string} company_uuid - UUID de la empresa.
 * @property {string} customer_name - Nombre del cliente.
 * @property {number} value_before_tax - Valor del contrato.
 * @property {string} currency - Moneda.
 * @property {string} start_date - Fecha de inicio.
 * @property {string} end_date - Fecha de fin.
 * @property {string} is_ongoing - Fecha de vigencia actual.
 * @property {string} remarks - Observaciones.
 */
const formData = reactive({
    company_uuid: '',
    customer_name: '',
    value_before_tax: null,
    currency: 'COP',
    start_date: '',
    end_date: '',
    is_ongoing: '',
    remarks: '',
});

/**
 * Valida los campos obligatorios del formulario.
 * Para campos numéricos usa comparación explícita contra '', null y undefined.
 * @returns {boolean} True si el formulario es válido.
 */
const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (!formData.company_uuid || formData.company_uuid === '' || formData.company_uuid === null || formData.company_uuid === undefined) {
        validationErrors.company_uuid = 'Debe seleccionar una empresa';
    }

    if (!formData.customer_name || formData.customer_name.trim() === '') {
        validationErrors.customer_name = 'El nombre del cliente es obligatorio';
    }

    return Object.keys(validationErrors).length === 0;
};

/**
 * Navega de regreso al listado de experiencias.
 */
const goBack = () => router.push('/empresas/experiencias');

/**
 * Procesa el envío del formulario (crear o actualizar).
 * Valida, persiste datos y navega al listado al completar.
 * @returns {Promise<void>}
 */
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

        goBack();
    } catch (error) {
        toast('Error', 'No se pudo procesar la solicitud', 'error');
    } finally {
        submitting.value = false;
    }
};

/**
 * Hook del ciclo de vida: carga catálogos y datos del registro (si edita).
 */
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
                Object.assign(formData, {
                    company_uuid: item.company_uuid || '',
                    customer_name: item.customer_name || '',
                    value_before_tax: item.value_before_tax?.amount ?? item.value_before_tax ?? null,
                    currency: item.value_before_tax?.currency ?? item.currency ?? 'COP',
                    start_date: item.start_date ? item.start_date.split(' ')[0] : '',
                    end_date: item.end_date ? item.end_date.split(' ')[0] : '',
                    is_ongoing: item.is_ongoing ? item.is_ongoing.split(' ')[0] : '',
                    remarks: item.remarks || '',
                });
            }
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
