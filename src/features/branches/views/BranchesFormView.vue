<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">

            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-map-signs text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-map-signs text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información de la sucursal</h5>
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
                                placeholder="Seleccionar empresa..." showClear filter class="w-100"
                                :invalid="!!validationErrors.company_uuid" />
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                {{ validationErrors.company_uuid }}
                            </div>
                        </div>

                        <div :class="nameColClass">
                            <label class="form-label required" for="name">Nombre de la sucursal</label>
                            <input id="name" v-model="formData.name" class="form-control"
                                :class="{ 'is-invalid': validationErrors.name }" type="text" autocomplete="off"
                                placeholder="Ej: Sucursal Norte, Oficina Principal..." />
                            <div v-if="validationErrors.name" class="invalid-feedback d-block" id="f-name-error" role="alert">
                                {{ validationErrors.name }}
                            </div>
                        </div>

                        <div :class="isPrimaryColClass">
                            <label class="form-label required" for="is_primary">¿Sede principal?</label>
                            <PrimeSelect :input-id="'is_primary'" v-model="formData.is_primary"
                                :options="[{ label: 'No', value: '0' }, { label: 'Sí', value: '1' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors.is_primary" />
                            <div v-if="validationErrors.is_primary" class="invalid-feedback d-block" id="f-is_primary-error" role="alert">
                                {{ validationErrors.is_primary }}
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-map-marker-alt me-2"></i>Ubicación y Estado
                            </h6>
                        </div>

                        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
                            <label class="form-label required" for="address">Dirección</label>
                            <input id="address" v-model="formData.address" class="form-control"
                                :class="{ 'is-invalid': validationErrors.address }" type="text" autocomplete="off"
                                placeholder="Ej: Calle 45 # 12-34" />
                            <div v-if="validationErrors.address" class="invalid-feedback d-block" id="f-address-error" role="alert">
                                {{ validationErrors.address }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="municipality_uuid">Municipio</label>
                            <PrimeSelect :input-id="'municipality_uuid'" v-model="formData.municipality_uuid"
                                :options="store.catalogs.municipalities" option-value="uuid" option-label="name"
                                placeholder="Seleccionar municipio..." showClear filter class="w-100"
                                :invalid="!!validationErrors.municipality_uuid" />
                            <div v-if="validationErrors.municipality_uuid" class="invalid-feedback d-block" id="f-municipality_uuid-error" role="alert">
                                {{ validationErrors.municipality_uuid }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="status">Estado</label>
                            <PrimeSelect :input-id="'status'" v-model="formData.status"
                                :options="[{ label: 'Activo', value: '1' }, { label: 'Inactivo', value: '0' }]"
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
                            <p class="text-muted small mb-0">
                                Las sucursales permiten organizar la operación y segmentar la flota por zonas
                                geográficas.
                                Asegúrate de marcar una como sede principal para los reportes consolidados.
                            </p>
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
 * @resource {Branch}
 */

import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBranchesStore } from '../store/branches.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';

// --- STORES Y ROUTER ---
const route = useRoute();
const router = useRouter();
const store = useBranchesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

// --- ESTADOS ---
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Sucursal' : 'Nueva Sucursal');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica la información y ubicación de la sucursal' : 'Completa los datos para dar de alta una nueva sucursal');
const breadcrumbs = computed(() => [ { label: 'Sucursales', to: '/empresas/sucursales/listas-sucursal' }, { label: isEditMode.value ? 'Editar' : 'Nueva' } ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

/** Clases responsivas dinámicas para columnas */
const nameColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-6 col-md-5 col-lg-5'
        : 'col-12 col-sm-8 col-md-8 col-lg-9';
});

const isPrimaryColClass = computed(() => {
    return isSuperAdmin.value
        ? 'col-12 col-sm-12 col-md-3 col-lg-3'
        : 'col-12 col-sm-4 col-md-4 col-lg-3';
});

const formData = reactive({
    company_uuid: '',
    name: '',
    address: '',
    municipality_uuid: '',
    is_primary: '0',
    status: '1',
});

// --- VALIDACION Y SUBMIT ---
const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    const requiredFields = ['name', 'address', 'municipality_uuid'];
    if (isSuperAdmin.value) {
        requiredFields.push('company_uuid');
    }

    requiredFields.forEach(field => {
        if (isEmpty(formData[field])) validationErrors[field] = 'Este campo es obligatorio';
    });

    if (formData.status === '' || formData.status === null || formData.status === undefined) {
        validationErrors.status = 'El estado es obligatorio';
    }

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/empresas/sucursales/listas-sucursal');

const handleSubmit = async () => {
    if (!validateForm()) {
        await nextTick();
        const firstError = document.querySelector('[aria-invalid="true"], .is-invalid, .is-invalid-select2');
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

// --- CICLO DE VIDA ---
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
                formData.is_primary = (item.is_primary == 1 || item.is_primary === true || item.is_primary === '1') ? '1' : '0';
                formData.status = (item.status == 1 || item.status === true || item.status === '1') ? '1' : '0';
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
