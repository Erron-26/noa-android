<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-chart-line text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h6 class="mb-0 fw-medium">Información Financiera</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <form @submit.prevent="handleSubmit" class="row g-3" novalidate>
                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa</label>
                            <PrimeSelect :input-id="'f-company_uuid'" v-model="formData.company_uuid"
                                :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                placeholder="Seleccione..." showClear filter class="w-100"
                                :invalid="!!validationErrors.company_uuid" />
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">{{
                                validationErrors.company_uuid }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="fiscal_year">Año fiscal</label>
                            <input id="fiscal_year" v-model="formData.fiscal_year" class="form-control"
                                :class="{ 'is-invalid': validationErrors.fiscal_year }" type="number" autocomplete="off"
                                placeholder="Ej: 2025" />
                            <div v-if="validationErrors.fiscal_year" class="invalid-feedback d-block" id="f-fiscal_year-error" role="alert">{{
                                validationErrors.fiscal_year }}</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="currency">Moneda</label>
                            <input id="currency" v-model="formData.currency" class="form-control" type="text"
                                autocomplete="off" placeholder="COP, USD, EUR" />
                        </div>


                        <!-- ========== Balance general ========== -->
                        <div class="col-12">
                            <hr class="my-2">
                            <h6 class="fw-medium text-primary"><i class="fad fa-chart-pie me-1"></i>Balance general</h6>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="current_assets">Activo corriente</label>
                            <input type="number" step="0.01" class="form-control" v-model="formData.current_assets"
                                id="current_assets" autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="inventory">Inventarios</label>
                            <input type="number" step="0.01" class="form-control" v-model="formData.inventory"
                                id="inventory" autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="total_assets">Activo total</label>
                            <input type="number" step="0.01" class="form-control" v-model="formData.total_assets"
                                id="total_assets" autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="current_liabilities">Pasivo corriente</label>
                            <input type="number" step="0.01" class="form-control" v-model="formData.current_liabilities"
                                id="current_liabilities" autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="financial_obligations">Obligaciones financieras</label>
                            <input type="number" step="0.01" class="form-control"
                                v-model="formData.financial_obligations" id="financial_obligations" autocomplete="off"
                                placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="total_liabilities">Pasivo total</label>
                            <input type="number" step="0.01" class="form-control" v-model="formData.total_liabilities"
                                id="total_liabilities" autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="retained_earnings">Utilidades retenidas</label>
                            <input type="number" step="0.01" class="form-control" v-model="formData.retained_earnings"
                                id="retained_earnings" autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="equity">Patrimonio total (Calculado)</label>
                            <input type="number" step="0.01" class="form-control bg-light" v-model="formData.equity"
                                id="equity" readonly aria-readonly="true" tabindex="-1" autocomplete="off" placeholder="0.00" />
                        </div>
                        <!-- ========== RESULTADOS ========== -->
                        <div class="col-12">
                            <hr class="my-2">
                            <h6 class="fw-medium text-primary"><i class="fad fa-chart-line me-1"></i> Estados de
                                resultados (PyG)</h6>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="operational_income">Ingresos operacionales</label>
                            <input type="number" step="0.01" class="form-control" v-model="formData.operational_income"
                                id="operational_income" autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="operating_profit_before_tax">Utilidades
                                operacionales</label>
                            <input type="number" step="0.01" class="form-control"
                                v-model="formData.operating_profit_before_tax" id="operating_profit_before_tax"
                                autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="net_income_period">Utilidad neta del periodo</label>
                            <input type="number" step="0.01" class="form-control" v-model="formData.net_income_period"
                                id="net_income_period" autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="depreciation_amortization">Depreciación y
                                amortización</label>
                            <input type="number" step="0.01" class="form-control"
                                v-model="formData.depreciation_amortization" id="depreciation_amortization"
                                autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="financial_expenses">Gastos financieros</label>
                            <input type="number" step="0.01" class="form-control" v-model="formData.financial_expenses"
                                id="financial_expenses" autocomplete="off" placeholder="0.00" />
                        </div>
                        <div class="col-12">
                            <label class="form-label" for="remarks">Observaciones</label>
                            <textarea class="form-control" v-model="formData.remarks" id="remarks" rows="3"
                                placeholder="Notas de auditoría o revelaciones"></textarea>
                        </div>
                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
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
                            <h6 class="fw-medium mb-1">Consejos para el registro financiero</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>Verifica que el año fiscal corresponda al período declarado ante la DIAN.</li>
                                <li>Los saldos en moneda extranjera deben convertirse a COP usando la TRM vigente al
                                    cierre.</li>
                                <li>El activo total debe coincidir con la suma del pasivo total más el patrimonio
                                    (ecuación contable).</li>
                                <li>Las observaciones de auditoría son clave para la memoria de los estados financieros.
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
import { useFinancialStatementsStore } from '../store/financialStatements.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useFinancialStatementsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);


const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Estados Financieros' : 'Registrar Estados Financieros');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del reporte financiero' : 'Completa los datos para crear un nuevo reporte');
const breadcrumbs = computed(() => [{ label: 'Estados financieros', to: '/financial-statements' }, { label: isEditMode.value ? 'Editar' : 'Nuevo' },]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

const formData = reactive({
    company_uuid: '',
    fiscal_year: null,
    currency: 'COP',
    current_assets: null,
    inventory: null,
    total_assets: null,
    current_liabilities: null,
    financial_obligations: null,
    total_liabilities: null,
    retained_earnings: null,
    equity: null,
    operational_income: null,
    operating_profit_before_tax: null,
    net_income_period: null,
    depreciation_amortization: null,
    financial_expenses: null,
    remarks: '',
});

// Cálculo automático de Patrimonio Total = Activo Total - Pasivo Total
watch(
    [() => formData.total_assets, () => formData.total_liabilities],
    ([assets, liabilities]) => {
        const a = parseFloat(assets) || 0;
        const l = parseFloat(liabilities) || 0;
        if (assets !== null || liabilities !== null) {
            formData.equity = Number((a - l).toFixed(2));
        } else {
            formData.equity = null;
        }
    }
);

const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (isEmpty(formData.company_uuid)) validationErrors.company_uuid = 'Debe seleccionar una empresa';
    if (!formData.fiscal_year || formData.fiscal_year === '') validationErrors.fiscal_year = 'El año fiscal es obligatorio';

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/empresas/estados-financieros');

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
        if (isEditMode.value) {
            await store.updateItem(route.params.id, formData);
        } else {
            await store.createItem(formData);
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

                // Procesar campos monetarios que puedan venir como objetos desde MoneyCast
                const moneyFields = [
                    'current_assets', 'inventory', 'total_assets',
                    'current_liabilities', 'financial_obligations', 'total_liabilities',
                    'retained_earnings', 'equity', 'operational_income',
                    'operating_profit_before_tax', 'net_income_period',
                    'depreciation_amortization', 'financial_expenses'
                ];

                moneyFields.forEach(field => {
                    if (formData[field] && typeof formData[field] === 'object' && formData[field].amount !== undefined) {
                        formData[field] = formData[field].amount;
                    }
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
