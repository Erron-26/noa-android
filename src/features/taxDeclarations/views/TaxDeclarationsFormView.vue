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

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información General</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos
                            obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                                                                                <form @submit.prevent="handleSubmit" class="row g-3" novalidate>

                        
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="fiscal_year">Año Gravable</label>
                                <input id="fiscal_year" v-model="formData.fiscal_year" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.fiscal_year }" type="number"
                                    placeholder="Ingresa el año gravable" />
                                <div v-if="validationErrors.fiscal_year" class="invalid-feedback d-block" id="f-fiscal_year-error" role="alert">
                                    {{ validationErrors.fiscal_year }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="gross_assets">Patrimonio Bruto</label>
                                <input id="gross_assets" v-model="formData.gross_assets" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.gross_assets }" type="number" step="0.01"
                                    placeholder="Ingresa el patrimonio bruto" />
                                <div v-if="validationErrors.gross_assets" class="invalid-feedback d-block" id="f-gross_assets-error" role="alert">
                                    {{ validationErrors.gross_assets }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="net_assets">Patrimonio Líquido</label>
                                <input id="net_assets" v-model="formData.net_assets" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.net_assets }" type="number" step="0.01"
                                    placeholder="Ingresa el patrimonio líquido" />
                                <div v-if="validationErrors.net_assets" class="invalid-feedback d-block" id="f-net_assets-error" role="alert">
                                    {{ validationErrors.net_assets }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="total_gross_income">Total Ingresos Brutos</label>
                                <input id="total_gross_income" v-model="formData.total_gross_income"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.total_gross_income }"
                                    type="number" step="0.01" placeholder="Ingresa el total de ingresos brutos" />
                                <div v-if="validationErrors.total_gross_income" class="invalid-feedback d-block" id="f-total_gross_income-error" role="alert">
                                    {{ validationErrors.total_gross_income }}
                                </div>
                            </div>
                        

                        
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="ordinary_net_income">Renta Líquida Ordinaria</label>
                                <input id="ordinary_net_income" v-model="formData.ordinary_net_income"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.ordinary_net_income }"
                                    type="number" step="0.01" placeholder="Ingresa la renta líquida ordinaria" />
                                <div v-if="validationErrors.ordinary_net_income" class="invalid-feedback d-block" id="f-ordinary_net_income-error" role="alert">
                                    {{ validationErrors.ordinary_net_income }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="pre_tax_net_profit">Utilidad Neta Antes de
                                    Impuestos</label>
                                <input id="pre_tax_net_profit" v-model="formData.pre_tax_net_profit"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.pre_tax_net_profit }"
                                    type="number" step="0.01"
                                    placeholder="Ingresa la utilidad neta antes de impuestos" />
                                <div v-if="validationErrors.pre_tax_net_profit" class="invalid-feedback d-block" id="f-pre_tax_net_profit-error" role="alert">
                                    {{ validationErrors.pre_tax_net_profit }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label" for="total_operating_non_operating_income">Total Ingresos
                                    Operacionales y No Operacionales</label>
                                <input id="total_operating_non_operating_income"
                                    v-model="formData.total_operating_non_operating_income" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.total_operating_non_operating_income }"
                                    type="number" step="0.01"
                                    placeholder="Ingresa el total de ingresos operacionales y no operacionales" />
                                <div v-if="validationErrors.total_operating_non_operating_income"
                                    class="invalid-feedback d-block" id="f-total_operating_non_operating_income-error" role="alert">
                                    {{ validationErrors.total_operating_non_operating_income }}
                                </div>
                            </div>
                        

                        
                            <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                                <label class="form-label required" for="company_uuid">Empresa</label>
                                <PrimeSelect :input-id="'f-company_uuid'" v-model="formData.company_uuid"
                                    :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                    placeholder="Seleccione..." showClear filter class="w-100"
                                    :invalid="!!validationErrors['company_uuid']" />
                                <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                    {{ validationErrors.company_uuid }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="statusSelect">Estado</label>
                                <PrimeSelect :input-id="'f-status'" v-model="formData.status"
                                    :options="[{ label: 'Borrador', value: 'BORRADOR' }, { label: 'Presentado', value: 'PRESENTADO' }]"
                                    option-label="label" option-value="value" class="w-100"
                                    :invalid="!!validationErrors['status']" />
                                <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">
                                    {{ validationErrors.status }}
                                </div>
                            </div>
                        

                        
                            <div class="col-12">
                                <label class="form-label" for="remarks">Observaciones Generales</label>
                                <textarea id="remarks" v-model="formData.remarks" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.remarks }" rows="3"
                                    placeholder="Ingresa observaciones generales"></textarea>
                                <div v-if="validationErrors.remarks" class="invalid-feedback d-block" id="f-remarks-error" role="alert">
                                    {{ validationErrors.remarks }}
                                </div>
                            </div>
                        

                        <div class="col-12">
                        <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" /><!-- BOTONES -->
                        </div>
                        </form>
                </div>
            </div>

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
                                    Las declaraciones de renta son obligatorias para todas las empresas en Colombia,
                                    según el
                                    <strong>Estatuto Tributario (Artículo 594 y siguientes)</strong>.
                                </li>
                                <li>
                                    El <strong>patrimonio bruto</strong> incluye todos los activos de la empresa,
                                    mientras que el
                                    <strong>patrimonio líquido</strong> es el resultado de restar los pasivos al
                                    patrimonio bruto.
                                </li>
                                <li>
                                    La <strong>renta líquida ordinaria</strong> es la base gravable para el cálculo del
                                    impuesto de renta.
                                </li>
                                <li>
                                    Asegúrate de verificar que los valores ingresados estén en <strong>pesos colombianos
                                        (COP)</strong>.
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
 * @fileoverview Vista de formulario para declaraciones de renta.
 * @module views/TaxDeclarationsFormView
 */

import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaxDeclarationsStore } from '../store/taxDeclarations.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useTaxDeclarationsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);


const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Declaración de Renta' : 'Registrar Declaración de Renta');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos de la declaración de renta en el sistema' : 'Completa los datos para crear una nueva declaración de renta');
const breadcrumbs = computed(() => [ { label: 'Declaraciones de Renta', to: '/declaraciones-de-renta', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario
const formData = reactive({
    company_uuid: '',
    fiscal_year: '',
    gross_assets: '',
    net_assets: '',
    total_gross_income: '',
    ordinary_net_income: '',
    pre_tax_net_profit: '',
    total_operating_non_operating_income: '',
    remarks: '',
    status: 'BORRADOR',
});

/**
 * Valida el formulario.
 * @returns {boolean} Verdadero si el formulario es válido.
 */
const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (isEmpty(formData.company_uuid)) validationErrors.company_uuid = 'La empresa es obligatoria';
    if (isEmpty(formData.fiscal_year)) validationErrors.fiscal_year = 'El año gravable es obligatorio';
    if (isEmpty(formData.status)) validationErrors.status = 'El estado es obligatorio';

    return Object.keys(validationErrors).length === 0;
};

/**
 * Navega hacia atrás.
 */
const goBack = () => router.push('/empresas/declaraciones-de-renta');

/**
 * Maneja el envío del formulario.
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
