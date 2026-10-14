<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-file-invoice-dollar text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información Tributaria y Fiscal</h5>
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
                        
                        <div :class="withholdingAgentColClass">
                            <label class="form-label" for="withholdingSelect">
                                ¿Exento de Agente de Retención?
                            </label>
                            <PrimeSelect :input-id="'withholdingSelect'" v-model="formData.is_withholding_agent_exempt"
                                :options="[{ label: 'Sí — Exento', value: '1' }, { label: 'No — Agente de retención', value: '0' }]"
                                option-label="label" option-value="value" placeholder="Seleccione una opción..."
                                showClear filter class="w-100"
                                :invalid="!!validationErrors.is_withholding_agent_exempt" />
                            <div v-if="validationErrors.is_withholding_agent_exempt"
                                class="invalid-feedback d-block" id="f-is_withholding_agent_exempt-error" role="alert">
                                {{ validationErrors.is_withholding_agent_exempt }}
                            </div>
                        </div>

                        <div :class="taxSpecialRegimeColClass">
                            <label class="form-label" for="tax_special_regime">
                                Régimen Tributario Especial
                            </label>
                            <input id="tax_special_regime" v-model="formData.tax_special_regime"
                                class="form-control" :class="{ 'is-invalid': validationErrors.tax_special_regime }"
                                type="text" autocomplete="off" maxlength="255"
                                placeholder="Ej: Régimen Especial de las ONG, Ley 1819 de 2016..." />
                            <div v-if="validationErrors.tax_special_regime" class="invalid-feedback d-block" id="f-tax_special_regime-error" role="alert">
                                {{ validationErrors.tax_special_regime }}
                            </div>
                        </div>
                        
                        <div class="col-12 col-sm-12 col-md-12 col-lg-12">
                            <label class="form-label" for="companySizeSelect">
                                Tamaño de la Empresa
                            </label>
                            <PrimeSelect :input-id="'companySizeSelect'" v-model="formData.company_size"
                                :options="[{ label: 'Microempresa', value: 'micro' }, { label: 'Pequeña empresa', value: 'pequena' }, { label: 'Mediana empresa', value: 'mediana' }, { label: 'Gran empresa', value: 'grande' }]"
                                option-label="label" option-value="value" placeholder="Seleccione un tamaño..."
                                showClear filter class="w-100"
                                :invalid="!!validationErrors.company_size" />
                            <div v-if="validationErrors.company_size" class="invalid-feedback d-block" id="f-company_size-error" role="alert">
                                {{ validationErrors.company_size }}
                            </div>
                        </div>
                        
                        <div class="col-12 col-sm-12 col-md-12 col-lg-12">
                            <label class="form-label" for="remarks">
                                Observaciones Tributarias
                            </label>
                            <textarea id="remarks" v-model="formData.remarks" class="form-control"
                                :class="{ 'is-invalid': validationErrors.remarks }" rows="4"
                                placeholder="Observaciones generales de carácter tributario, notas sobre declaraciones especiales, etc."></textarea>
                            <div v-if="validationErrors.remarks" class="invalid-feedback d-block" id="f-remarks-error" role="alert">
                                {{ validationErrors.remarks }}
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
                                    Las empresas clasificadas como <strong>Mipyme</strong> pueden acceder a tarifas
                                     reducidas del impuesto de renta según la Ley 2010 de 2019, siempre que cumplan con
                                     los topes de activos e ingresos definidos por la DIAN.
                                </li>
                                <li>
                                    El estado de <strong>Agente de Retención</strong> es obligatorio para empresas que
                                     superen los topes establecidos en el Estatuto Tributario (Art. 368). Verifica
                                     anualmente si la empresa mantiene o pierde esta condición.
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
 * @resource {TaxInformation}
 */

import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaxInformationStore } from '../store/taxInformation.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useTaxInformationStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Información Tributaria' : 'Registrar Información Tributaria');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica la información tributaria y fiscal de la empresa' : 'Completa los datos tributarios y fiscales de la empresa');
const breadcrumbs = computed(() => [ { label: 'Información Tributaria', to: '/empresas/informacion-tributaria', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

/** Clases responsivas dinámicas para columnas */
const withholdingAgentColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-6 col-md-4 col-lg-4'
        : 'col-12 col-sm-6 col-md-6 col-lg-6';
});

const taxSpecialRegimeColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-12 col-md-4 col-lg-4'
        : 'col-12 col-sm-6 col-md-6 col-lg-6';
});

const formData = reactive({
    company_uuid: '',
    is_withholding_agent_exempt: '',
    tax_special_regime: '',
    company_size: '',
    remarks: '',
});

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (!formData.company_uuid || formData.company_uuid === '') {
        validationErrors.company_uuid = 'Debe seleccionar una empresa';
    }

    if (formData.tax_special_regime && formData.tax_special_regime.length > 255) {
        validationErrors.tax_special_regime = 'El régimen no puede exceder 255 caracteres';
    }

    if (formData.remarks && formData.remarks.length > 5000) {
        validationErrors.remarks = 'Las observaciones no pueden exceder 5000 caracteres';
    }

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/empresas/informacion-tributaria');

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

        const payload = {
            company_uuid: formData.company_uuid,
            is_withholding_agent_exempt: formData.is_withholding_agent_exempt === '1' || formData.is_withholding_agent_exempt === 1 || formData.is_withholding_agent_exempt === true,
            tax_special_regime: formData.tax_special_regime?.trim() || null,
            company_size: formData.company_size || null,
            remarks: formData.remarks?.trim() || null,
        };

        if (isEditMode.value) {
            await store.updateItem(uuid, payload);
        } else {
            const newItem = await store.createItem(payload);
            uuid = newItem?.uuid || newItem?.id;
        }

        goBack();
    } catch (error) {
        console.error(error);
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
                formData.company_uuid = item.company_uuid || '';
                formData.is_withholding_agent_exempt = (item.is_withholding_agent_exempt == 1 || item.is_withholding_agent_exempt === true || item.is_withholding_agent_exempt === '1') ? '1' : (item.is_withholding_agent_exempt !== null && item.is_withholding_agent_exempt !== undefined ? '0' : '');
                formData.tax_special_regime = item.tax_special_regime || '';
                formData.company_size = item.company_size || '';
                formData.remarks = item.remarks || '';
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
