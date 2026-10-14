<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-file-certificate text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información General</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <form @submit.prevent="handleSubmit" class="row g-2 g-md-3" novalidate>
                        
                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                        
                        <div class="col-12 col-sm-6 col-md-4 col-lg-4" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa</label>
                            <PrimeSelect :input-id="'company_uuid'" v-model="formData.company_uuid"
                                :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                placeholder="Seleccione una empresa..." showClear filter class="w-100"
                                :invalid="!!validationErrors.company_uuid" />
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>
                        
                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label required" for="resolution_number">
                                Número de Resolución
                            </label>
                            <input id="resolution_number" v-model="formData.resolution_number" class="form-control"
                                :class="{ 'is-invalid': validationErrors.resolution_number }" type="text" autocomplete="off"
                                placeholder="Ej: RES-2026-001" maxlength="20" />
                            <div v-if="validationErrors.resolution_number" class="invalid-feedback d-block" id="f-resolution_number-error" role="alert">
                                {{ validationErrors.resolution_number }}
                            </div>
                        </div>
                        
                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label required" for="number_fuec">
                                Número FUEC
                            </label>
                            <input id="number_fuec" v-model="formData.number_fuec" class="form-control"
                                :class="{ 'is-invalid': validationErrors.number_fuec }" type="text" autocomplete="off"
                                placeholder="Ej: FUEC-2026-0001" maxlength="20" />
                            <div v-if="validationErrors.number_fuec" class="invalid-feedback d-block" id="f-number_fuec-error" role="alert">
                                {{ validationErrors.number_fuec }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label required" for="territorial_code">
                                Código Territorial
                            </label>
                            <input id="territorial_code" v-model="formData.territorial_code" class="form-control"
                                :class="{ 'is-invalid': validationErrors.territorial_code }" type="text" autocomplete="off"
                                placeholder="Ej: CT-001" maxlength="20" />
                            <div v-if="validationErrors.territorial_code" class="invalid-feedback d-block" id="f-territorial_code-error" role="alert">
                                {{ validationErrors.territorial_code }}
                            </div>
                        </div>

                        <div :class="secondRowColClass">
                            <label class="form-label required" for="resolution_date">
                                Fecha de Resolución
                            </label>
                            <input id="resolution_date" v-model="formData.resolution_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.resolution_date }" type="date" />
                            <div v-if="validationErrors.resolution_date" class="invalid-feedback d-block" id="f-resolution_date-error" role="alert">
                                {{ validationErrors.resolution_date }}
                            </div>
                        </div>

                        <div :class="secondRowColClass">
                            <label class="form-label required" for="statusSelect">
                                Estado de Vigencia
                            </label>
                            <PrimeSelect :input-id="'statusSelect'" v-model="formData.status"
                                :options="[{ label: 'Vigente', value: '1' }, { label: 'No Vigente', value: '0' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors.status" />
                            <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">
                                {{ validationErrors.status }}
                            </div>
                        </div>

                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    La Resolución de Habilitación es el acto administrativo que
                                    otorga la empresa de transporte la capacidad legal para emitir
                                    FUECs (Formularios Únicos Electrónicos de Comunicación) ante
                                    la Superintendencia de Puertos y Transporte.
                                </li>
                                <li>
                                    El número FUEC debe corresponder al consecutivo autorizado en
                                    el sistema de la Superintendencia; un FUEC mal reportado puede
                                    generar sanciones y multas para la empresa.
                                </li>
                                <li>
                                    El código territorial identifica la jurisdicción de la
                                    dirección territorial que emitió la resolución. Asegúrate de
                                    que coincida con el área de operación registrada.
                                </li>
                                <li>
                                    Las resoluciones tienen una vigencia limitada. Mantén el
                                    estado actualizado para evitar que se sigan generando
                                    despachos con una resolución vencida.
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
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-14
 * @module {Features.Administrations}
 * @resource {EnablingResolution}
 */

import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEnablingResolutionsStore } from '../store/enablingResolutions.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';

/** @type {import('vue-router').Route} Ruta activa */
const route = useRoute();

/** @type {import('vue-router').Router} Instancia del router */
const router = useRouter();

/** @type {import('pinia').Store} Store del módulo */
const store = useEnablingResolutionsStore();

/** @type {import('pinia').Store} Store de permisos */
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Resolución de Habilitación' : 'Registrar Resolución de Habilitación');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos de la resolución de habilitación en el sistema' : 'Completa los datos para registrar una nueva resolución de habilitación para emisión de FUECs');
const breadcrumbs = computed(() => [ { label: 'Resoluciones de Habilitación', to: '/empresas/resoluciones-habilitacion', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);

/** @type {import('vue').Ref<boolean>} Indicador de carga inicial */
const isViewLoading = ref(true);

/** @type {import('vue').Ref<boolean>} Indicador de envío en progreso */
const submitting = ref(false);

/** @type {import('vue').Reactive<Object>} Errores de validación por campo */
const validationErrors = reactive({});

/**
 * Estado reactivo del formulario.
 */
const formData = reactive({
    company_uuid: '',
    resolution_number: '',
    number_fuec: '',
    territorial_code: '',
    resolution_date: '',
    status: '1',
});

/** Clases responsivas dinámicas para columnas */
const secondRowColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-6 col-md-4 col-lg-4'
        : 'col-12 col-sm-6 col-md-6 col-lg-6';
});

/**
 * Valida los campos obligatorios del formulario.
 */
const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (!formData.company_uuid || formData.company_uuid === '' || formData.company_uuid === null || formData.company_uuid === undefined) {
        validationErrors.company_uuid = 'Debe seleccionar una empresa';
    }

    if (!formData.resolution_number || formData.resolution_number.trim() === '') {
        validationErrors.resolution_number = 'El número de resolución es obligatorio';
    }

    if (!formData.number_fuec || formData.number_fuec.trim() === '') {
        validationErrors.number_fuec = 'El número FUEC es obligatorio';
    }

    if (!formData.territorial_code || formData.territorial_code.trim() === '') {
        validationErrors.territorial_code = 'El código territorial es obligatorio';
    }

    if (!formData.resolution_date || formData.resolution_date === '' || formData.resolution_date === null || formData.resolution_date === undefined) {
        validationErrors.resolution_date = 'La fecha de resolución es obligatoria';
    }

    if (formData.status === '' || formData.status === null || formData.status === undefined) {
        validationErrors.status = 'Debe seleccionar un estado';
    }

    return Object.keys(validationErrors).length === 0;
};

/**
 * Navega de regreso al listado de resoluciones.
 */
const goBack = () => router.push('/empresas/resoluciones-habilitacion');

/**
 * Procesa el envío del formulario (crear o actualizar).
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
                    resolution_number: item.resolution_number || '',
                    number_fuec: item.number_fuec || '',
                    territorial_code: item.territorial_code || '',
                    resolution_date: item.resolution_date || '',
                    status: (item.status == 1 || item.status === true || item.status === '1') ? '1' : '0',
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
