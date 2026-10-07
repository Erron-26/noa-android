<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-clipboard-check text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <form @submit.prevent="handleSubmit" id="inspectionForm" novalidate>
                <!-- ═══════════════════════════════════════════════════════════ -->
                <!-- SECCIÓN 1 — Información General de la Inspección          -->
                <!-- ═══════════════════════════════════════════════════════════ -->
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
                        <div class="row g-3">
                            <!-- Vehículo -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="vehicle_uuid">Vehículo</label>
                                <PrimeSelect :input-id="'vehicle_uuid'" v-model="formData.vehicle_uuid"
                                    :options="filteredVehicles" option-value="uuid" option-label="vehicle_license_plate"
                                    placeholder="Seleccione..." showClear filter class="w-100"
                                    :invalid="!!validationErrors['vehicle_uuid']" />
                                <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">
                                    {{ validationErrors.vehicle_uuid }}
                                </div>
                                <div v-if="isConductor && assignedVehiclesLoaded && !filteredVehicles.length" class="form-text text-warning small">
                                    No tienes vehículos asignados en tus proyectos. Solicita la asignación para registrar inspecciones.
                                </div>
                                <div v-else-if="isConductor" class="form-text text-muted small">
                                    Solo tus vehículos asignados en proyecto.
                                </div>
                            </div>

                            <!-- Fecha de Inspección -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="inspection_date">Fecha de Inspección</label>
                                <input id="inspection_date" v-model="formData.inspection_date" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.inspection_date }" type="date" />
                                <div v-if="validationErrors.inspection_date" class="invalid-feedback d-block" id="f-inspection_date-error" role="alert">
                                    {{ validationErrors.inspection_date }}
                                </div>
                            </div>

                            <!-- Kilometraje -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="mileage">Kilometraje</label>
                                <input id="mileage" v-model.number="formData.mileage" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.mileage }" type="number" autocomplete="off"
                                    placeholder="Ingresa el kilometraje" />
                                <div v-if="validationErrors.mileage" class="invalid-feedback d-block" id="f-mileage-error" role="alert">
                                    {{ validationErrors.mileage }}
                                </div>
                            </div>

                            <!-- Km Recorridos -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label">Km Recorridos</label>
                                <input class="form-control" :value="kmTraveled + ' km'" disabled readonly
                                    tabindex="-1" aria-hidden="true" />
                            </div>

                            <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />

                            <!-- Empresa (v-if="isSuperAdmin") -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="isSuperAdmin">
                                <label class="form-label required" for="company_uuid">Empresa</label>
                                <PrimeSelect :input-id="'company_uuid'" v-model="formData.company_uuid"
                                    :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                                    placeholder="Seleccione..." showClear filter class="w-100"
                                    :invalid="!!validationErrors['company_uuid']" />
                                <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">
                                    {{ validationErrors.company_uuid }}
                                </div>
                            </div>

                            <!-- Nombre del Inspector -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                                <label class="form-label" for="inspector_name">Nombre del Inspector</label>
                                <input id="inspector_name" v-model="formData.inspector_name" class="form-control"
                                    type="text" autocomplete="off" placeholder="Ingresa el nombre del inspector" />
                            </div>

                            <!-- Conductor -->
                            <div class="col-12 col-sm-6 col-md-4 col-lg-6">
                                <label class="form-label" for="driver_uuid">Conductor</label>
                                <PrimeSelect :input-id="'driver_uuid'" v-model="formData.driver_uuid"
                                    :options="filteredDrivers" option-value="uuid" option-label="first_name"
                                    placeholder="Seleccione..." showClear filter class="w-100"
                                    :invalid="!!validationErrors['driver_uuid']" />
                                <div v-if="validationErrors.driver_uuid" class="invalid-feedback d-block" id="f-driver_uuid-error" role="alert">
                                    {{ validationErrors.driver_uuid }}
                                </div>
                            </div>

                            <div class="col-12">
                                <label class="form-label" for="notes">Notas Adicionales</label>
                                <textarea id="notes" v-model="formData.notes" class="form-control" rows="3"
                                    placeholder="Observaciones generales de la inspección"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ═══════════════════════════════════════════════════════════ -->
                <!-- SECCIÓN 2 — Resultados de Inspección (Checklist)          -->
                <!-- ═══════════════════════════════════════════════════════════ -->
                <div v-if="!isViewLoading" class="card border-0 shadow-sm mt-3 fade-in-up"
                    style="animation-delay: 0.2s;">
                    <div class="card-header bg-light py-2 px-3 border-bottom">
                        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 w-100">
                            <div class="d-flex align-items-center gap-2">
                                <i class="fad fa-tasks text-success"></i>
                                <h6 class="mb-0 fw-medium">Checklist de Inspección</h6>
                                <span class="badge bg-success bg-opacity-10 text-success ms-2">
                                    {{ selectedCount }} / {{ resultsData.length }} ítems seleccionados
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="card-body p-0">
                        <!-- Empty state -->
                        <div v-if="resultsData.length === 0" class="text-center py-5 text-muted">
                            <i class="fad fa-clipboard-list-check fs-1 mb-3 d-block opacity-50"></i>
                            <p class="mb-0">No hay ítems de inspección cargados en el catálogo.</p>
                        </div>

                        <!-- Agrupación explícita en 4 columnas como el formato físico -->
                        <div v-else class="row g-3 p-3">
                            <div v-for="(colCats, colIndex) in layoutColumns" :key="colIndex"
                                class="col-xl-3 col-lg-4 col-12 col-sm-6 col-md-4 col-lg-3">
                                <div v-for="category in colCats" :key="category"
                                    class="category-card mb-3 shadow-sm border border-light bg-white rounded-3 overflow-hidden">
                                    <!-- Category Header -->
                                    <div
                                        class="category-header d-flex align-items-center justify-content-between px-3 py-2 bg-light border-bottom">
                                        <div class="d-flex align-items-center gap-2">
                                            <i :class="getCategoryIcon(category)" class="text-secondary opacity-75"></i>
                                            <span class="text-uppercase fw-bold text-slate-700 small tracking-wider"
                                                style="font-size: 0.75rem;">{{ category || 'GENERAL' }}</span>
                                        </div>
                                        <span
                                            class="badge rounded-pill bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10 py-1 px-2"
                                            style="font-size: 0.7rem;">
                                            {{ getCategoryCount(category) }} ítems
                                        </span>
                                    </div>

                                    <!-- Category Items List -->
                                    <div class="category-body">
                                        <div v-for="result in groupedResults[category]"
                                            :key="result.item_uuid + '_' + result.is_selected"
                                            class="inspection-item d-flex align-items-center justify-content-between p-2 border-bottom transition-all"
                                            :class="{
                                                'item-aprobado': result.is_selected
                                            }">

                                            <!-- Item Description & Notes -->
                                            <div class="item-info flex-grow-1 pe-2 cursor-pointer"
                                                @click="editItemObservations(result)"
                                                :title="result.observations ? result.observations : 'Clic para agregar observaciones'">
                                                <div class="d-flex align-items-center gap-1">
                                                    <span class="item-name fw-medium text-slate-800 text-wrap"
                                                        style="font-size: 0.8rem;">{{ result._item_name }}</span>
                                                    <i v-if="result.observations"
                                                        class="fad fa-comment-dots text-primary flex-shrink-0"
                                                        title="Ver/Editar Observaciones"></i>
                                                    <i v-else
                                                        class="fad fa-plus-circle text-muted opacity-0 hover-opacity-100 flex-shrink-0"
                                                        style="font-size: 0.75rem;" title="Agregar observaciones"></i>
                                                </div>
                                                <div v-if="result.observations"
                                                    class="item-observations text-muted text-truncate"
                                                    style="font-size: 0.7rem; max-width: 180px;"
                                                    :title="result.observations">
                                                    {{ result.observations }}
                                                </div>
                                            </div>

                                            <!-- Status Switchers (Only 'A' Button) -->
                                            <div class="status-actions d-flex gap-1 flex-shrink-0">
                                                <button type="button" class="btn-status btn-status-ok"
                                                    :class="{ 'active': result.is_selected }"
                                                    @click="toggleStatus(result)" title="Aprobado">
                                                    <i v-if="result.is_selected" key="check" class="fas fa-check"></i>
                                                    <span v-else key="text">A</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ═══════════════════════════════════════════════════════════ -->
                <!-- BOTONES DE ACCIÓN                                         -->
                <!-- ═══════════════════════════════════════════════════════════ -->
                <div v-if="!isViewLoading" class="mt-4 mb-4 fade-in-up" style="animation-delay: 0.3s;">
                    <div v-if="isEditMode" class="d-flex justify-content-start mb-2">
                        <button type="button" class="btn btn-outline-danger rounded-pill px-3 w-100 w-sm-auto"
                            @click="downloadPdf" :disabled="downloadingPdf">
                            <span v-show="downloadingPdf" class="spinner-border spinner-border-sm me-1"></span>
                            <i v-show="!downloadingPdf" class="fad fa-file-pdf me-1"></i>
                            {{ downloadingPdf ? "Generando..." : "Descargar PDF" }}
                        </button>
                    </div>
                    <div v-if="canEditToday" class="col-12">
                        <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                    </div>
                    <div v-else class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <button type="button" class="btn btn-outline-secondary rounded-pill px-3 w-100 w-sm-auto"
                            @click="goBack">
                            <i class="fas fa-times me-1"></i> Cancelar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { toast } from '@/utils/toast.js';
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVehicleInspectionsStore } from '../store/vehicleInspections.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import VehicleInspectionsService from '../services/vehicleInspections.service.js';
import ProjectsService from '../../projects/services/projects.service.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';
import Swal from 'sweetalert2';


const route = useRoute();
const router = useRouter();
const store = useVehicleInspectionsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);
const isConductor = computed(() => permissionsStore.hasRole('CONDUCTOR'));



const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Inspección' : 'Nueva Inspección');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos de la inspección en el sistema' : 'Completa los datos para crear una nueva inspección vehicular');
const breadcrumbs = computed(() => [{ label: 'Inspecciones', to: '/inspeccion-vehiculos' }, { label: isEditMode.value ? 'Editar' : 'Nuevo' },]);
const isViewLoading = ref(true);
const submitting = ref(false);
const downloadingPdf = ref(false);
const originalDate = ref(null);
const validationErrors = reactive({});

const canEditToday = computed(() => {
    if (!isEditMode.value) return true;
    if (!originalDate.value) return false;

    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const today = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];

    return originalDate.value === today;
});

// ── Header de la inspección ─────────────────────────────────────────────────
const formData = reactive({
    company_uuid: '',
    vehicle_uuid: '',
    inspection_date: '',
    inspector_name: '',
    mileage: 0,
    driver_uuid: '',
    notes: ''
});

// ── Filtros Reactivos ─────────────────────────────────────────────────────
// El conductor solo ve los vehículos asignados en sus proyectos.
const assignedVehicleUuids = ref([]);
const assignedVehiclesLoaded = ref(false);
const primaryVehicleUuid = ref(null);

const filteredVehicles = computed(() => {
    const all = (isConductor.value || !formData.company_uuid)
        ? (store.catalogs.vehicles || [])
        : (store.catalogs.vehicles || []).filter(v => v.company_uuid === formData.company_uuid);

    // El backend ya filtra los vehículos permitidos para el conductor.
    // Solo colocamos el vehículo principal primero si está definido.
    if (!isConductor.value || !primaryVehicleUuid.value) return all;
    const primary = all.find(v => v.uuid === primaryVehicleUuid.value);
    if (!primary) return all;
    return [primary, ...all.filter(v => v.uuid !== primaryVehicleUuid.value)];
});

/** Carga los vehículos asignados al conductor en sus proyectos (solo rol CONDUCTOR). */
const loadConductorAssignments = async () => {
    assignedVehicleUuids.value = [];
    primaryVehicleUuid.value = null;
    assignedVehiclesLoaded.value = false;
    const driverUuid = userStore.uuid_driver || userStore.third_party_uuid;
    if (!driverUuid) {
        assignedVehiclesLoaded.value = true;
        return;
    }
    try {
        const res = await ProjectsService.list({ third_party_uuid: driverUuid, per_page: 100 });
        const page = res?.data?.data ?? res?.data ?? {};
        const projects = Array.isArray(page) ? page : (page.data || []);
        const seen = new Set();
        const ordered = [];
        let primaryFound = false;
        const sortedProjects = [...(projects || [])].sort((a, b) => {
            const da = a.updated_at || a.created_at || '';
            const db = b.updated_at || b.created_at || '';
            return db.localeCompare(da);
        });
        for (const p of sortedProjects) {
            try {
                const det = await ProjectsService.get(p.uuid);
                const item = det?.data?.data ?? det?.data ?? det ?? {};
                const assigns = item.driverVehicleAssignments || item.driver_vehicle_assignments || item.assignments || [];
                const activeAssigns = assigns
                    .filter(a => a.is_active !== false && a.is_active !== 0 && a.vehicle_uuid && (!a.third_party_uuid || a.third_party_uuid === userStore.uuid_driver || a.third_party_uuid === userStore.third_party_uuid))
                    .sort((a, b) => (b.id || 0) - (a.id || 0));
                for (const a of activeAssigns) {
                    if (!seen.has(a.vehicle_uuid)) {
                        seen.add(a.vehicle_uuid);
                        ordered.push(a.vehicle_uuid);
                        if (a.vehicle && a.vehicle.uuid && (!store.catalogs.vehicles || !store.catalogs.vehicles.some(v => v.uuid === a.vehicle.uuid))) {
                            store.catalogs.vehicles = [...(store.catalogs.vehicles || []), a.vehicle];
                        }
                        if (!primaryFound) {
                            primaryVehicleUuid.value = a.vehicle_uuid;
                            primaryFound = true;
                        }
                    }
                }
            } catch (e) { /* proyecto sin detalle accesible */ }
        }
        assignedVehicleUuids.value = ordered;
    } catch (e) {
        console.warn('No se pudieron cargar las asignaciones del conductor', e?.message);
    } finally {
        assignedVehiclesLoaded.value = true;
    }
};

const filteredDrivers = computed(() => {
    if (isConductor.value || !formData.company_uuid) return store.catalogs.drivers || [];
    return (store.catalogs.drivers || []).filter(d => d.company_uuid === formData.company_uuid);
});

// ── Km Recorridos ─────────────────────────────────────────────────────────
const previousMileage = ref(0);

const kmTraveled = computed(() => {
    if (!formData.mileage || !previousMileage.value) return 0;
    return Math.max(0, (formData.mileage || 0) - previousMileage.value);
});

const fetchPreviousMileage = async (vehicleUuid) => {
    if (!vehicleUuid) {
        previousMileage.value = 0;
        return;
    }
    const excludeUuid = isEditMode.value ? route.params.id : null;
    previousMileage.value = await store.getPreviousMileage(vehicleUuid, excludeUuid);
};

watch(() => formData.vehicle_uuid, (newVal) => {
    if (newVal) {
        fetchPreviousMileage(newVal);
    } else {
        previousMileage.value = 0;
    }
});

// ── Resultados (checklist dinámico) ─────────────────────────────────────────
const resultsData = ref([]);

/** Cuenta de ítems seleccionados */
const selectedCount = computed(() => resultsData.value.filter(r => r.is_selected).length);

/** Agrupa los resultados por categoría del ítem */
const groupedResults = computed(() => {
    const groups = {};
    for (const result of resultsData.value) {
        const cat = result._category || 'General';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(result);
    }
    return groups;
});

/** Organiza las categorías en 4 columnas exactas siguiendo el formato físico SGFT04 */
const layoutColumns = computed(() => {
    const cols = [[], [], [], []];
    const categories = Object.keys(groupedResults.value);

    for (const cat of categories) {
        const catUpper = cat.toUpperCase();
        // Columna 1
        if (catUpper.includes('DOC') || catUpper.includes('EMERG') || catUpper.includes('EXTIN') || catUpper.includes('HERRAM')) {
            cols[0].push(cat);
        }
        // Columna 2
        else if (catUpper.includes('DOTACI') || catUpper.includes('LUCES')) {
            cols[1].push(cat);
        }
        // Columna 3
        else if (catUpper.includes('VIDRIO') || catUpper.includes('ESPEJO') || catUpper.includes('FLUIDO')) {
            cols[2].push(cat);
        }
        // Columna 4
        else if (catUpper.includes('NEUM') || catUpper.includes('LLANTA') || catUpper.includes('DESGAS') || catUpper.includes('PRES')) {
            cols[3].push(cat);
        }
        // Resto (Otros) para rellenar
        else {
            if (cols[1].length <= 2) cols[1].push(cat);
            else cols[3].push(cat);
        }
    }
    return cols;
});

const getCategoryIcon = (category) => {
    const cat = (category || '').toUpperCase();
    if (cat.includes('DOC')) return 'fad fa-file-certificate';
    if (cat.includes('EMERG')) return 'fad fa-exclamation-triangle';
    if (cat.includes('EXTIN')) return 'fad fa-fire-extinguisher';
    if (cat.includes('HERRAM')) return 'fad fa-tools';
    if (cat.includes('DOTACI')) return 'fad fa-hard-hat';
    if (cat.includes('LUCES')) return 'fad fa-lightbulb';
    if (cat.includes('VIDRIO') || cat.includes('ESPEJO')) return 'fad fa-window-maximize';
    if (cat.includes('FLUIDO') || cat.includes('ACEITE') || cat.includes('LIQUIDO')) return 'fad fa-tint';
    if (cat.includes('NEUM') || cat.includes('LLANTA') || cat.includes('RUEDA')) return 'fad fa-tire';
    if (cat.includes('FRENOS')) return 'fad fa-brackets-curly';
    if (cat.includes('PRES')) return 'fad fa-tachometer-alt';
    if (cat.includes('DESGAS')) return 'fad fa-chart-line-down';
    return 'fad fa-check-double';
};

const getCategoryCount = (category) => {
    return groupedResults.value[category]?.length || 0;
};



watch(() => formData.company_uuid, (newVal, oldVal) => {
    if (newVal !== oldVal && oldVal !== undefined && oldVal !== '') {
        if (formData.vehicle_uuid) {
            const valid = filteredVehicles.value.find(v => v.uuid === formData.vehicle_uuid);
            if (!valid) {
                formData.vehicle_uuid = '';
            }
        }
        if (formData.driver_uuid) {
            const valid = filteredDrivers.value.find(d => d.uuid === formData.driver_uuid);
            if (!valid) {
                formData.driver_uuid = '';
            }
        }
    }
});

// ── Validación ──────────────────────────────────────────────────────────────
const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (isEmpty(formData.company_uuid)) validationErrors.company_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Este campo es obligatorio';
    if (isEmpty(formData.inspection_date)) validationErrors.inspection_date = 'Este campo es obligatorio';
    if (formData.mileage === '' || formData.mileage === null || formData.mileage === undefined || formData.mileage <= 0) {
        validationErrors.mileage = 'Ingresa un kilometraje válido';
    }

    return Object.keys(validationErrors).length === 0;
};

const goBack = () => {
    const ret = route.query.return_to;
    if (ret) return router.push(ret);
    return router.push('/inspeccion-vehiculos');
};

/**
 * Construye el payload con el formato requerido por la API:
 */
const buildPayload = () => {
    const results = resultsData.value.map(r => {
        return {
            item_uuid: r.item_uuid,
            is_selected: r.is_selected ? 1 : 0,
            status: r.is_selected ? 'APROBADO' : 'NO_APROBADO',
            observations: r.observations || ''
        };
    });

    return {
        inspection: {
            company_uuid: formData.company_uuid,
            vehicle_uuid: formData.vehicle_uuid,
            inspection_date: formData.inspection_date,
            inspector_name: formData.inspector_name,
            mileage: formData.mileage,
            driver_uuid: formData.driver_uuid,
            notes: formData.notes,
            results
        }
    };
};

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
        const payload = buildPayload();
        let uuid = isEditMode.value ? route.params.id : null;

        if (isEditMode.value) {
            await store.updateItem(uuid, payload);
        } else {
            const newItem = await store.createItem(payload);
            uuid = newItem?.uuid || newItem?.id;
        }

        goBack();
    } catch (error) {
        toast('Error', 'No se pudo procesar la solicitud', 'error');
    } finally {
        submitting.value = false;
    }
};

const toggleStatus = (result) => {
    const idx = resultsData.value.findIndex(r => r.item_uuid === result.item_uuid);
    if (idx !== -1) {
        const item = resultsData.value[idx];
        item.is_selected = !item.is_selected;
        item.status = item.is_selected ? 'APROBADO' : '';
        resultsData.value[idx] = { ...item };
        resultsData.value = [...resultsData.value];
    }
};

const editItemObservations = async (result) => {
    const { value: formValues } = await Swal.fire({
        title: `Observaciones: ${result._item_name}`,
        html: `
            <div class="text-start">
                <textarea id="swal-obs" class="form-control" rows="4" placeholder="Ingresa observaciones detalladas...">${result.observations || ''}</textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                observations: document.getElementById('swal-obs').value
            };
        }
    });

    if (formValues) {
        result.observations = formValues.observations;
    }
};

const downloadPdf = async () => {
    try {
        downloadingPdf.value = true;
        await VehicleInspectionsService.downloadPdf(route.params.id);
    } catch (error) {
        console.error(error);
        toast('Error', 'No se pudo generar o descargar el PDF', 'error');
    } finally {
        downloadingPdf.value = false;
    }
};

/**
 * Inicializa los resultados a partir del catálogo de ítems.
 */
const initResultsFromCatalog = (existingResults = []) => {
    const temp = [];

    const catalogItems = store.catalogs.inspectionItems || [];
    for (const item of catalogItems) {
        const existing = existingResults.find(r => r.item_uuid === item.uuid);

        temp.push({
            item_uuid: item.uuid,
            _item_name: item.item_name || item.name || '—',
            _description: item.description || '',
            _category: item.category || 'General',
            is_selected: existing ? (existing.is_selected ? true : false) : false,
            status: existing?.status || 'APROBADO',
            observations: existing?.observations || ''
        });
    }
    resultsData.value = temp;
};

onMounted(async () => {
    isViewLoading.value = true;

    try {
        await store.loadFormOptions();
        if (!isSuperAdmin.value) {
            formData.company_uuid = userStore.company_uuid;
        }

        let existingResults = [];
        if (isEditMode.value) {
            const item = await store.fetchProfileById(route.params.id);
            if (item) {
                const dateOnly = (item.inspection_date || '').split(' ')[0].split('T')[0];
                originalDate.value = dateOnly;
                Object.assign(formData, {
                    company_uuid: item.company_uuid || '',
                    vehicle_uuid: item.vehicle_uuid || '',
                    inspection_date: dateOnly,
                    inspector_name: item.inspector_name || '',
                    mileage: item.mileage || 0,
                    driver_uuid: item.driver_uuid || '',
                    notes: item.notes || ''
                });
                existingResults = item.results || item.inspection_results || [];
                await fetchPreviousMileage(item.vehicle_uuid, route.params.id);
            }
        } else {
            const tzoffset = (new Date()).getTimezoneOffset() * 60000;
            const today = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
            formData.inspection_date = today;

            if (isConductor.value) {
                await loadConductorAssignments();
                const driverUuid = userStore.uuid_driver || userStore.third_party_uuid;
                if (driverUuid) {
                    formData.driver_uuid = driverUuid;
                }
            }

            // Prefill desde el Control de Servicios (retorno a la planilla)
            const q = route.query || {};
            if (q.inspection_date) formData.inspection_date = String(q.inspection_date).substring(0, 10);
            if (q.driver_uuid) formData.driver_uuid = q.driver_uuid;
            if (q.vehicle_uuid) {
                const ok = filteredVehicles.value.find(v => v.uuid === q.vehicle_uuid);
                if (ok || !isConductor.value) formData.vehicle_uuid = q.vehicle_uuid;
            }

            if (isConductor.value && !formData.vehicle_uuid) {
                if (primaryVehicleUuid.value && filteredVehicles.value.find(v => v.uuid === primaryVehicleUuid.value)) {
                    formData.vehicle_uuid = primaryVehicleUuid.value;
                } else if (filteredVehicles.value.length === 1) {
                    formData.vehicle_uuid = filteredVehicles.value[0].uuid;
                }
            }
        }

        initResultsFromCatalog(existingResults);
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

/* ===== CHECKLIST DE INSPECCIÓN (DIAGNÓSTICO) ===== */
.category-card {
    transition: all 0.25s ease;
    border: 1px solid #e2e8f0 !important;
}

.category-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.category-header {
    background-color: #f8fafc !important;
    border-bottom: 1px solid #e2e8f0;
}

.text-slate-700 {
    color: #475569;
}

.text-slate-800 {
    color: #1e293b;
}

.tracking-wider {
    letter-spacing: 0.05em;
}

.inspection-item {
    background-color: #ffffff;
    transition: all 0.15s ease-in-out;
    border-bottom: 1px solid #f1f5f9;
}

.inspection-item:last-child {
    border-bottom: none;
}

.inspection-item:hover {
    background-color: #f8fafc;
}

.inspection-item:hover .hover-opacity-100 {
    opacity: 0.6 !important;
}

.hover-opacity-100 {
    opacity: 0;
    transition: opacity 0.15s ease;
}

.hover-opacity-100:hover {
    opacity: 1 !important;
}

/* Colores de estado para filas */
.inspection-item.item-aprobado {
    background-color: rgba(16, 185, 129, 0.04) !important;
}

.inspection-item.item-aprobado:hover {
    background-color: rgba(16, 185, 129, 0.08) !important;
}

/* Botones de estado (A) */
.btn-status {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1.5px solid #cbd5e1;
    background-color: #ffffff;
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
    padding: 0;
}

.btn-status>* {
    pointer-events: none;
}

.btn-status:hover {
    transform: scale(1.05);
}

.btn-status-ok:hover {
    border-color: #10b981;
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.05);
}

.btn-status-ok.active {
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    color: #ffffff !important;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

.item-observations {
    color: #64748b;
    font-style: italic;
    margin-top: 0.1rem;
    display: block;
}

@media (max-width: 768px) {
    .btn-status {
        width: 38px;
        height: 38px;
        font-size: 0.85rem;
    }
    .inspection-item {
        padding: 10px 8px !important;
        min-height: 48px;
    }
    .category-header {
        padding: 10px 12px !important;
    }
}
</style>
