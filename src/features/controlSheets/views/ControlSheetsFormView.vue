<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-clipboard-list text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

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
                    <!-- SKELETON FORM -->
                    <div v-if="isViewLoading" role="status">
                        <div class="row">
                            <div class="col-md-6 mb-3" v-for="i in 4" :key="i">
                                <div class="skeleton-text mb-2" style="height: 16px; width: 100px;"></div>
                                <div class="skeleton-input" style="height: 38px;"></div>
                            </div>
                        </div>
                    </div>

                    <form v-else @submit.prevent="handleSubmit" class="row g-2 g-md-3" novalidate>
                        <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />

                        <div class="col-12 col-sm-6 col-md-6" v-if="isSuperAdmin">
                            <label class="form-label required" for="company_uuid">Empresa</label>
                            <PrimeSelect :input-id="'company_uuid'" v-model="formData.company_uuid"
                                :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                placeholder="Seleccione..." showClear filter class="w-100"
                                :invalid="!!validationErrors['company_uuid']" />
                            <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">{{
                                validationErrors.company_uuid }}</div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6">
                            <label class="form-label required" for="vehicle_uuid">Vehículo</label>
                            <PrimeSelect :input-id="'vehicle_uuid'" v-model="formData.vehicle_uuid"
                                :options="store.catalogs.vehicles" option-value="uuid" option-label="vehicle_license_plate"
                                placeholder="Seleccione..." showClear filter class="w-100"
                                :invalid="!!validationErrors['vehicle_uuid']" />
                            <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">{{
                                validationErrors.vehicle_uuid }}</div>
                        </div>
                        <!-- Estado Checkbox/Select -->
                        <div class="col-12 col-sm-6 col-md-4">
                            <label class="form-label required" for="statusSelect">Estado</label>
                            <PrimeSelect :input-id="'statusSelect'" v-model="formData.is_active"
                                :options="[{ label: 'Activo', value: '1' }, { label: 'Inactivo', value: '0' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['is_active']" />
                            <div v-if="validationErrors.is_active" class="invalid-feedback d-block" id="f-is_active-error" role="alert">
                                {{ validationErrors.is_active }}
                            </div>
                        </div>

                        <div class="col-12">
                            <label class="form-label" for="observations">Observaciones</label>
                            <textarea id="observations" v-model="formData.observations" class="form-control"
                                :class="{ 'is-invalid': validationErrors.observations }" rows="3"
                                placeholder="Ingrese observaciones adicionales"></textarea>
                            <div v-if="validationErrors.observations" class="invalid-feedback d-block" id="f-observations-error" role="alert">{{
                                validationErrors.observations }}</div>
                        </div>

                        <div class="col-12 mt-2">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <!-- GESTIÓN DE ARCHIVOS PDF -->
            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.15s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-file-pdf text-danger" aria-hidden="true"></i>
                        <h5 class="mb-0 fw-medium">Documentos PDF Asociados</h5>
                    </div>
                </div>

                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <div class="row g-3">
                        <div class="col-12 col-md-8 col-lg-6">
                            <label class="form-label" for="pdfFiles">Seleccionar archivos PDF</label>
                            <div class="input-group">
                                <input id="pdfFiles" ref="fileInput" type="file" class="form-control" accept=".pdf"
                                    multiple @change="handleFilesChange" />
                                <button v-if="isEditMode" class="btn btn-primary px-3" type="button"
                                    :disabled="selectedFiles.length === 0 || submitting" @click="uploadSelectedFiles">
                                    <i class="fad fa-cloud-upload-alt me-1" aria-hidden="true"></i> Subir
                                </button>
                            </div>
                            <small class="text-muted d-block mt-1">
                                <span v-if="isEditMode">Puedes seleccionar y subir archivos de inmediato.</span>
                                <span v-else>Los archivos seleccionados se subirán automáticamente al guardar el
                                    registro.</span>
                                (Max. 10MB c/u).
                            </small>
                        </div>
                    </div>

                    <!-- Archivos en cola de subida -->
                    <div v-if="selectedFiles.length > 0" class="mt-4">
                        <h6 class="fw-medium text-primary border-bottom pb-2">
                            <i class="fad fa-list-ul me-2"></i>{{ isEditMode ? 'Archivos por subir' : 'Archivos seleccionados' }} ({{ selectedFiles.length }})
                        </h6>
                        <ul class="list-group list-group-flush border rounded-3 mt-2">
                            <li v-for="(file, index) in selectedFiles" :key="index"
                                class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 bg-light">
                                <div class="d-flex align-items-center gap-2 text-truncate pe-3">
                                    <i class="fad fa-file-pdf text-muted"></i>
                                    <span class="small text-truncate fw-medium">{{ file.name }}</span>
                                    <span
                                        class="badge bg-secondary bg-opacity-10 text-secondary rounded-pill small ms-1">{{
                                            formatBytes(file.size) }}</span>
                                </div>
                                <button type="button" class="btn btn-link btn-sm text-danger p-0 m-0" title="Remover"
                                    @click="selectedFiles.splice(index, 1)">
                                    <i class="fas fa-times fs-5"></i>
                                </button>
                            </li>
                        </ul>
                    </div>

                    <!-- Archivos existentes -->
                    <div v-if="isEditMode" class="mt-4">
                        <h6 class="fw-medium border-bottom pb-2">
                            <i class="fad fa-folder-open me-2 text-muted"></i>Archivos cargados en el sistema ({{
                                pdfs.length }})
                        </h6>
                        <div v-if="pdfs.length === 0"
                            class="text-center py-4 text-muted border border-dashed rounded-3 bg-light mt-2">
                            <i class="fad fa-folder-open fs-3 mb-2 text-300"></i>
                            <p class="mb-0 small">No hay archivos PDF asociados a esta Planilla de Control.</p>
                        </div>
                        <ul v-else class="list-group list-group-flush border rounded-3 mt-2">
                            <li v-for="pdf in pdfs" :key="pdf.uuid"
                                class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                                <div class="d-flex align-items-center gap-2 text-truncate pe-3">
                                    <i class="fad fa-file-pdf text-danger fs-5"></i>
                                    <span class="small fw-medium text-truncate">{{ pdf.file_name || pdf.name }}</span>
                                    <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill small ms-1">{{
                                        formatBytes(pdf.size) }}</span>
                                </div>
                                <div class="d-flex gap-2 flex-shrink-0">
                                    <a :href="pdf.original_url || pdf.url" target="_blank"
                                        class="btn btn-sm btn-falcon-default" title="Ver / Descargar">
                                        <i class="fad fa-external-link-alt text-primary"></i>
                                    </a>
                                    <button type="button" class="btn btn-sm btn-falcon-default text-danger"
                                        title="Eliminar" @click="deleteAssociatedPdf(pdf.uuid)">
                                        <i class="fad fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- SABÍAS QUÉ -->
            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>Las planillas de control son fundamentales para auditar la entrega correcta de servicios
                                    y vehículos.</li>
                                <li>Asegúrate de vincular correctamente la empresa y el vehículo antes de guardar el
                                    registro.</li>
                                <li>Los registros inactivos no aparecerán en los reportes operativos diarios.</li>
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
 * @created_at 2026-06-29
 * @module {Features.Fleet}
 * @resource {ControlSheet}
 */

import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useControlSheetsStore } from '../store/controlSheets.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const store = useControlSheetsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);

const isEditMode = computed(() => route.params.id !== undefined);

const pageTitle = computed(() => isEditMode.value ? 'Actualizar Planilla de Control' : 'Nueva Planilla de Control');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [
    { label: 'Planillas de Control', to: '/planillas-de-control-de-servicios' },
    { label: isEditMode.value ? 'Editar' : 'Nuevo' }
]);

const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

const formData = reactive({
    company_uuid: '',
    vehicle_uuid: '',
    observations: '',
    is_active: '1',
});

const pdfs = ref([]);
const selectedFiles = ref([]);
const fileInput = ref(null);

const fetchPdfs = async () => {
    if (isEditMode.value) {
        try {
            pdfs.value = await store.getPdfs(route.params.id);
        } catch (error) {
            console.error('Error al cargar PDFs asociados', error);
        }
    }
};

const handleFilesChange = (event) => {
    const files = event.target.files;
    selectedFiles.value = Array.from(files);
};

const uploadSelectedFiles = async () => {
    if (selectedFiles.value.length === 0) return;
    try {
        submitting.value = true;
        await store.uploadPdfs(route.params.id, selectedFiles.value);
        selectedFiles.value = [];
        if (fileInput.value) fileInput.value.value = '';
        await fetchPdfs();
    } catch (error) {
        // Error manejado en el store
    } finally {
        submitting.value = false;
    }
};

const deleteAssociatedPdf = async (mediaUuid) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará de forma permanente el archivo PDF.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn btn-danger rounded-pill px-4',
            cancelButton: 'btn btn-outline-secondary rounded-pill me-2 px-4'
        },
        buttonsStyling: false
    });

    if (result.isConfirmed) {
        try {
            await store.deletePdf(route.params.id, mediaUuid);
            await fetchPdfs();
        } catch (error) {
            // Error manejado
        }
    }
};

const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (isSuperAdmin.value && !formData.company_uuid) {
        validationErrors.company_uuid = 'Este campo es obligatorio';
    }
    if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Este campo es obligatorio';
    if (formData.is_active === '' || formData.is_active === null) validationErrors.is_active = 'Este campo es obligatorio';

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/planillas-de-control-de-servicios');

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
            if (selectedFiles.value.length > 0) {
                await store.uploadPdfs(uuid, selectedFiles.value);
            }
        } else {
            const newItem = await store.createItem(formData);
            uuid = newItem?.uuid || newItem?.id;
            if (uuid && selectedFiles.value.length > 0) {
                await store.uploadPdfs(uuid, selectedFiles.value);
            }
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
                formData.is_active = (item.is_active == 1 || item.is_active === true || item.is_active === '1') ? '1' : '0';
            }
            await fetchPdfs();
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

.border-dashed {
    border-style: dashed !important;
    border-color: #dee2e6 !important;
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