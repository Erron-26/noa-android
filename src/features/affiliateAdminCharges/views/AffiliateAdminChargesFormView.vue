<template>
  <div class="row gx-3 fade-in-up">
    <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
      <BasePageHeader
          :title="pageTitle"
          :subtitle="pageSubtitle"
          icon="fad fa-file-invoice-dollar text-primary"
          :breadcrumbs="breadcrumbs"
          :show-back="true"
          @back="goBack"
      />

      <div class="card border-0 shadow-sm">
        <div class="card-header bg-light py-2 px-3 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <i class="fad fa-clipboard-list text-primary" style="font-size: 14px;"></i>
            <h5 class="mb-0 fw-medium" style="font-size: 0.95rem;">Información del Registro</h5>
            <span class="badge bg-primary bg-opacity-10 text-primary ms-2" style="font-size: 0.7rem;">
              <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
            </span>
          </div>
        </div>

        <div class="card-body position-relative">
          <!-- SKELETON FORM -->
          <div v-if="isViewLoading" role="status" aria-label="Cargando formulario">
            <span class="visually-hidden">Cargando...</span>
            <div class="row g-3">
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="skeleton-text mb-2" style="height: 16px; width: 80px;"></div>
                <div class="skeleton-select"></div>
              </div>
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="skeleton-text mb-2" style="height: 16px; width: 110px;"></div>
                <div class="skeleton-select"></div>
              </div>
            </div>
            <div class="row g-3">
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="skeleton-text mb-2" style="height: 16px; width: 70px;"></div>
                <div class="skeleton-input"></div>
              </div>
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="skeleton-text mb-2" style="height: 16px; width: 60px;"></div>
                <div class="skeleton-input"></div>
              </div>
            </div>
            <div class="row g-3 mt-2">
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="skeleton-text mb-2" style="height: 16px; width: 130px;"></div>
                <div class="skeleton-input"></div>
              </div>
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="skeleton-text mb-2" style="height: 16px; width: 150px;"></div>
                <div class="skeleton-input"></div>
              </div>
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="skeleton-text mb-2" style="height: 16px; width: 140px;"></div>
                <div class="skeleton-input"></div>
              </div>
            </div>
            <div class="d-flex justify-content-end mt-4 pt-3 border-top">
              <div class="skeleton-button me-2" style="width: 100px;"></div>
              <div class="skeleton-button" style="width: 140px;"></div>
            </div>
          </div>

          <form v-else @submit.prevent="handleSubmit" novalidate>
            <!-- SECCIÓN 1: DETALLES DEL COBRO -->
            <div class="col-12">
              <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                <i class="fad fa-info-circle me-2"></i>Detalles del Cobro
              </h6>
            </div>

            <div class="row g-3">
              <input type="hidden" v-if="!isSuperAdmin" v-model="formData.company_uuid" />
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" v-if="isSuperAdmin">
                <label class="form-label required fw-medium" for="company_uuid"
                  style="font-size: 0.9rem;">Empresa</label>
                <PrimeSelect :input-id="'f-company_uuid'" v-model="formData.company_uuid"
                  :options="store.catalogs.companies" option-value="uuid" option-label="business_name"
                  placeholder="Seleccione..." showClear filter class="w-100"
                  :invalid="!!validationErrors['company_uuid']" />
                <div v-if="validationErrors.company_uuid" class="invalid-feedback d-block" id="f-company_uuid-error" role="alert">{{
                  validationErrors.company_uuid }}</div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label required fw-medium" for="vehicle_uuid"
                  style="font-size: 0.9rem;">Vehículo</label>
                <PrimeSelect :input-id="'f-vehicle_uuid'" v-model="formData.vehicle_uuid"
                  :options="store.catalogs.vehicles" option-value="uuid" option-label="vehicle_license_plate"
                  placeholder="Seleccionar vehículo" showClear filter class="w-100"
                  :invalid="!!validationErrors['vehicle_uuid']" />
                <div v-if="validationErrors.vehicle_uuid" class="invalid-feedback d-block" id="f-vehicle_uuid-error" role="alert">{{
                  validationErrors.vehicle_uuid }}</div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label fw-medium" for="payment_reference" style="font-size: 0.9rem;"
                  :class="{ 'required': formData.charge_type === 'CUOTA_ADMINISTRACION' }">
                  Ref. Pago (Cuenta)
                </label>
                <input id="payment_reference" type="text" autocomplete="off" class="form-control" v-model="formData.payment_reference"
                  :placeholder="formData.charge_type === 'CUOTA_ADMINISTRACION' ? 'Ej: 26061112463045' : 'Se heredará del vehículo'"
                  :disabled="formData.charge_type !== 'CUOTA_ADMINISTRACION' && !!formData.charge_type"
                  :class="{ 'is-invalid': validationErrors.payment_reference }" />
                <div v-if="validationErrors.payment_reference" class="invalid-feedback d-block" id="f-payment_reference-error" role="alert">{{
                  validationErrors.payment_reference }}</div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label required fw-medium" for="charge_type" style="font-size: 0.9rem;">Tipo de
                  Cobro</label>
                <PrimeSelect :input-id="'f-charge_type'" v-model="formData.charge_type"
                  :options="[{ label: 'Cuota de Administración', value: 'CUOTA_ADMINISTRACION' }, { label: 'Pago Mensualidad', value: 'PAGO_MENSUALIDAD' }, { label: 'Pago de Cupo', value: 'PAGO_CUPO' }]"
                  option-label="label" option-value="value" placeholder="Seleccione..." showClear filter class="w-100"
                  :invalid="!!validationErrors['charge_type']" />
                <div v-if="validationErrors.charge_type" class="invalid-feedback d-block" id="f-charge_type-error" role="alert">{{
                  validationErrors.charge_type }}</div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label required fw-medium" for="amount" style="font-size: 0.9rem;">Monto</label>
                <div class="input-group">
                  <span class="input-group-text bg-light" aria-hidden="true"><i class="fad fa-dollar-sign"></i></span>
                  <input id="amount" type="number" step="0.01" class="form-control" v-model.number="formData.amount"
                    placeholder="0.00" :class="{ 'is-invalid': validationErrors.amount }"
                    :aria-invalid="!!validationErrors.amount"
                    :aria-describedby="validationErrors.amount ? 'f-amount-error' : undefined" />
                </div>
                <div v-if="validationErrors.amount" class="invalid-feedback d-block mt-1" id="f-amount-error" role="alert">{{
                  validationErrors.amount }}</div>
                <div v-if="tariffCalculated" class="text-success small mt-1">
                  <i class="fad fa-calculator me-1"></i>Calculado según tarifa de plataforma
                </div>
              </div>
            </div>

            <!-- SECCIÓN 2: FECHAS Y CONDICIONES -->
            <div class="col-12 mt-4">
              <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                <i class="fad fa-calendar-alt me-2"></i>Fechas y Condiciones
              </h6>
            </div>

            <div class="row g-3">
              <div class="col-12 mb-3">
                <label class="form-label required fw-medium" for="concept" style="font-size: 0.9rem;">Concepto</label>
                <textarea id="concept" class="form-control" v-model="formData.concept"
                  placeholder="Ej: Cuota Abril 2024" rows="2"
                  :class="{ 'is-invalid': validationErrors.concept }"></textarea>
                <div v-if="validationErrors.concept" class="invalid-feedback d-block" id="f-concept-error" role="alert">{{ validationErrors.concept }}</div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label required fw-medium" for="period_date" style="font-size: 0.9rem;">Fecha del
                  Período</label>
                <input id="period_date" type="date" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.period_date"
                  @change="handleDateChange('period_date')" :class="{ 'is-invalid': validationErrors.period_date }" />
                <div v-if="validationErrors.period_date" class="invalid-feedback d-block" id="f-period_date-error" role="alert">{{ validationErrors.period_date }}
                </div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label required fw-medium" for="due_date" style="font-size: 0.9rem;">Fecha de
                  Vencimiento</label>
                <input id="due_date" type="date" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.due_date"
                  @change="handleDateChange('due_date')" :class="{ 'is-invalid': validationErrors.due_date }" />
                <div v-if="validationErrors.due_date" class="invalid-feedback d-block" id="f-due_date-error" role="alert">{{ validationErrors.due_date }}</div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label required fw-medium" for="next_payment_date" style="font-size: 0.9rem;">Próximo
                  Vencimiento</label>
                <input id="next_payment_date" type="date" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.next_payment_date"
                  @change="handleDateChange('next_payment_date')"
                  :class="{ 'is-invalid': validationErrors.next_payment_date }" />
                <div v-if="validationErrors.next_payment_date" class="invalid-feedback d-block" id="f-next_payment_date-error" role="alert">{{
                  validationErrors.next_payment_date }}</div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label fw-medium" for="late_fee_percentage" style="font-size: 0.9rem;">Porcentaje de
                  Mora (%)</label>
                <div class="input-group">
                  <input id="late_fee_percentage" type="number" step="0.1" class="form-control"
                    v-model.number="formData.late_fee_percentage" placeholder="Ej: 1.5"
                    :class="{ 'is-invalid': validationErrors.late_fee_percentage }" />
                  <span class="input-group-text bg-light"><i class="fad fa-percent"></i></span>
                 </div>
                 <div v-if="validationErrors.late_fee_percentage" class="invalid-feedback w-100 mt-1 d-block" id="f-late_fee_percentage-error" role="alert">{{
                   validationErrors.late_fee_percentage }}</div>
              </div>
            </div>

            <!-- SECCIÓN 3: GESTIÓN DE PAGO Y ESTADO -->
            <div class="col-12 mt-4">
              <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                <i class="fad fa-money-check-edit me-2"></i>Gestión de Pago y Estado
              </h6>
            </div>

            <div class="row g-3">
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label required fw-medium" for="status" style="font-size: 0.9rem;">Estado</label>
                <PrimeSelect :input-id="'f-status'" v-model="formData.status"
                  :options="[{ label: 'Pendiente', value: 'PENDIENTE' }, { label: 'Pagado', value: 'PAGADO' }, { label: 'Vencido', value: 'VENCIDO' }, { label: 'En Mora', value: 'EN_MORA' }, { label: 'Anulado', value: 'ANULADO' }]"
                  option-label="label" option-value="value" class="w-100"
                  :invalid="!!validationErrors['status']" />
                <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">{{ validationErrors.status }}</div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <label class="form-label fw-medium" for="payment_method" style="font-size: 0.9rem;">Método de Pago</label>
                <PrimeSelect :input-id="'payment_method'" v-model="formData.payment_method"
                  :options="[{ label: 'Efectivo', value: 'EFECTIVO' }, { label: 'Transferencia', value: 'TRANSFERENCIA' }, { label: 'Cheque', value: 'CHEQUE' }, { label: 'Tarjeta', value: 'TARJETA' }, { label: 'Cortesía', value: 'CORTESIA' }, { label: 'Otro', value: 'OTRO' }]"
                  option-label="label" option-value="value" placeholder="Seleccione..." showClear filter class="w-100"
                  :invalid="!!validationErrors['payment_method']" />
                <div v-if="validationErrors.payment_method" class="invalid-feedback d-block" id="f-payment_method-error" role="alert">{{ validationErrors.payment_method }}</div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" v-if="formData.status === 'PAGADO'">
                <label class="form-label required fw-medium" for="payment_date" style="font-size: 0.9rem;">Fecha de
                  Pago</label>
                <input id="payment_date" type="date" placeholder="YYYY-MM-DD" class="form-control" v-model="formData.payment_date"
                  :class="{ 'is-invalid': validationErrors.payment_date }" />
                <div v-if="validationErrors.payment_date" class="invalid-feedback d-block" id="f-payment_date-error" role="alert">{{ validationErrors.payment_date }}
                </div>
              </div>

              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" v-if="formData.status === 'PAGADO'">
                <label class="form-label fw-medium" for="bank_reference" style="font-size: 0.9rem;">Referencia
                  Bancaria</label>
                <input id="bank_reference" type="text" autocomplete="off" class="form-control" v-model="formData.bank_reference"
                  placeholder="Ej: Transacción # o Ref. Banco"
                  :class="{ 'is-invalid': validationErrors.bank_reference }" />
                <div v-if="validationErrors.bank_reference" class="invalid-feedback d-block" id="f-bank_reference-error" role="alert">{{ validationErrors.bank_reference
                }}</div>
              </div>
            </div>

            <!-- SECCIÓN 4: INFORMACIÓN ADICIONAL -->
            <div class="col-12 mt-4">
              <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                <i class="fad fa-sticky-note me-2"></i>Información Adicional
              </h6>
            </div>

            <div class="row g-3">
              <div class="col-12 mb-3">
                <label class="form-label fw-medium" for="notes" style="font-size: 0.9rem;">Notas / Observaciones</label>
                <textarea id="notes" class="form-control" v-model="formData.notes" rows="3"
                  placeholder="Comentarios opcionales..." :class="{ 'is-invalid': validationErrors.notes }"></textarea>
                <div v-if="validationErrors.notes" class="invalid-feedback d-block" id="f-notes-error" role="alert">{{ validationErrors.notes }}</div>
              </div>
            </div>

            <!-- BOTONES -->
            <div class="col-12 mt-4 pt-3 border-top">
              <div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-end gap-2">
                <button type="button" class="btn btn-outline-secondary rounded-pill px-3 w-100 w-sm-auto order-1 order-sm-0" @click="goBack"
                  :disabled="submitting">
                  <i class="fas fa-times me-1" aria-hidden="true"></i> Cancelar
                </button>
                <button type="submit" class="btn btn-success rounded-pill px-4 shadow-sm w-100 w-sm-auto order-0 order-sm-1" :disabled="submitting" :aria-busy="submitting">
                  <span v-show="submitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <i v-show="!submitting" class="fas fa-check me-1" aria-hidden="true"></i>
                  <span aria-live="polite">
                    <span v-show="submitting">{{ isEditMode ? 'Actualizando...' : 'Guardando...' }}</span>
                    <span v-show="!submitting">{{ isEditMode ? 'Actualizar Cobro' : 'Guardar Cobro' }}</span>
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="card border-0 shadow-sm mt-3 mb-5">
        <div class="card-body py-3">
          <div class="d-flex align-items-start gap-3">
            <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
              <i class="fad fa-lightbulb text-primary fs-5"></i>
            </div>
            <div>
              <h6 class="fw-medium mb-1" style="font-size: 0.95rem;">¿Necesitas ayuda?</h6>
              <p class="text-muted small mb-0">
                <strong>Consejos:</strong>
                <span class="d-block mt-1">• La fecha de "Próximo Vencimiento" debe ser siempre posterior a la fecha de
                  "Vencimiento" actual.</span>
                <span class="d-block">• Los cargos con estado "En Mora" o "Vencido" pueden generar reportes automáticos
                  de cartera.</span>
                <span class="d-block">• Asegúrate de registrar la referencia bancaria si el pago ya fue realizado para
                  facilitar la conciliación.</span>
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
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAffiliateAdminChargesStore } from '../store/affiliateCharges.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useSystemConfigurationStore } from '@/features/systemConfiguration/store/systemConfiguration.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import VehiclesService from '@/features/vehicles/services/vehicles.service.js';

const route = useRoute();
const router = useRouter();
const store = useAffiliateAdminChargesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

const isSuperAdmin = computed(() => permissionsStore.isSuperAdmin);

const systemConfigStore = useSystemConfigurationStore();
const cutoffDay = ref(5);

const loadCutoffDay = async () => {
  try {
    const companyUuid = isSuperAdmin.value ? formData.company_uuid : userStore.company_uuid;
    if (!companyUuid) return;
    const config = await systemConfigStore.fetchByCompany(companyUuid);
    if (config?.payment_cutoff_day) {
      cutoffDay.value = Number(config.payment_cutoff_day);
    }
  } catch {
    cutoffDay.value = 5;
  }
};

const padCutoff = (day) => String(day).padStart(2, '0');

const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => (isEditMode.value ? 'Editar' : 'Crear') + ' Cuota de Administración');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos del registro en el sistema' : 'Completa los datos para crear un nuevo registro');
const breadcrumbs = computed(() => [ { label: 'Cuotas de Administración', to: '/pagos-de-administracion' }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);
const isViewLoading = ref(true);
const submitting = ref(false);
const tariffCalculated = ref(false);
const validationErrors = reactive({});

// Estado inicial del formulario
const formData = reactive({
  company_uuid: '',
  payment_reference: '',
  vehicle_uuid: '',
  charge_type: 'CUOTA_ADMINISTRACION',
  concept: '',
  amount: '',
  currency_code: 'COP',
  period_date: '',
  due_date: '',
  next_payment_date: '',
  late_fee_percentage: '0.00',
  status: 'PENDIENTE',
  payment_method: '',
  payment_date: '',
  bank_reference: '',
  notes: ''
});

// Lógica de cálculo de fechas dinámicas y corte
const handleDateChange = (field) => {
  if (!formData[field]) return;

  let [year, month, day] = formData[field].split('-');
  const cutDay = padCutoff(cutoffDay.value);

  // Ajustar el día al día de corte configurado
  if (day !== cutDay) {
    formData[field] = `${year}-${month}-${cutDay}`;
  }

  // Autocalcular fechas dependientes
  if (field === 'period_date') {
    let dateObj = new Date(`${year}-${month}-${cutDay}T12:00:00`);

    // due_date: 1 mes después
    dateObj.setMonth(dateObj.getMonth() + 1);
    formData.due_date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${cutDay}`;

    // next_payment_date: 2 meses después del period_date
    dateObj.setMonth(dateObj.getMonth() + 1);
    formData.next_payment_date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${cutDay}`;
  } else if (field === 'due_date') {
    let dateObj = new Date(`${year}-${month}-${cutDay}T12:00:00`);

    // next_payment_date: 1 mes después de due_date
    dateObj.setMonth(dateObj.getMonth() + 1);
    formData.next_payment_date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${cutDay}`;
  }
};

// Generación de Código / Referencia Única
const generatePaymentReference = () => {
  if (!isEditMode.value && formData.vehicle_uuid && formData.charge_type === 'CUOTA_ADMINISTRACION' && !formData.payment_reference) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 90 + 10);
    formData.payment_reference = `${yy}${mm}${dd}${hh}${min}${ss}${rand}`;
  }
};

// Monitorear si cambia el vehículo o el tipo de cobro para autogenerar o limpiar referencia
watch([() => formData.vehicle_uuid, () => formData.charge_type], ([newVehicle, newType]) => {
  if (newType === 'CUOTA_ADMINISTRACION') {
    generatePaymentReference();
  } else if (newType && newType !== 'CUOTA_ADMINISTRACION') {
    // Si es otro tipo de pago, vaciamos para que el backend herede la cuenta del vehículo
    formData.payment_reference = '';
  }
});

// Auto-calcular monto según tarifas de plataforma al seleccionar vehículo
watch(() => formData.vehicle_uuid, async (newVehicleUuid) => {
  tariffCalculated.value = false;
  if (!newVehicleUuid || isEditMode.value) return;

  try {
    const config = systemConfigStore.config;
    const rates = config?.platform_fee_rates;
    if (!rates || !rates.length) return;

    const response = await VehiclesService.get(newVehicleUuid);
    const vehicle = response?.data?.data ?? response?.data ?? response;
    if (!vehicle) return;

    let fee = 0;
    if (config.platform_fee_type === 'VEHICLE_CLASS') {
      const rate = rates.find(r => r.vehicle_class_uuid === vehicle.vehicle_class_uuid);
      if (rate) fee = Number(rate.fee);
    } else if (config.platform_fee_type === 'PASSENGER_RANGE') {
      const capacity = Number(vehicle.passenger_capacity) || Number(vehicle.seated_passenger_capacity) || 0;
      const rate = rates.find(r =>
        capacity >= Number(r.min_passengers) && capacity <= Number(r.max_passengers)
      );
      if (rate) fee = Number(rate.fee);
    }

    if (fee > 0) {
      formData.amount = fee;
      tariffCalculated.value = true;
    }
  } catch (err) {
    console.warn('Error al calcular tarifa:', err.message);
  }
}, { immediate: false });

// Recargar configuración si cambia la empresa (para SuperAdmin)
watch(() => formData.company_uuid, async (newCompanyUuid) => {
  if (newCompanyUuid) {
    await loadCutoffDay();
  }
});


const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);

const validateForm = () => {
  Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

  if (isSuperAdmin.value && !formData.company_uuid) validationErrors.company_uuid = 'Este campo es obligatorio';

  if (formData.charge_type === 'CUOTA_ADMINISTRACION' && !formData.payment_reference) {
    validationErrors.payment_reference = 'Este campo es obligatorio para cuotas iniciales';
  }

  if (isEmpty(formData.vehicle_uuid)) validationErrors.vehicle_uuid = 'Este campo es obligatorio';
  if (isEmpty(formData.charge_type)) validationErrors.charge_type = 'Este campo es obligatorio';
  if (isEmpty(formData.concept)) validationErrors.concept = 'Este campo es obligatorio';
  if (formData.amount === '' || formData.amount === null || formData.amount === undefined || formData.amount <= 0) validationErrors.amount = 'El monto debe ser mayor a 0';
  if (isEmpty(formData.period_date)) validationErrors.period_date = 'Este campo es obligatorio';
  if (isEmpty(formData.due_date)) validationErrors.due_date = 'Este campo es obligatorio';
  if (isEmpty(formData.next_payment_date)) validationErrors.next_payment_date = 'Este campo es obligatorio';
  if (isEmpty(formData.status)) validationErrors.status = 'Este campo es obligatorio';
  if (formData.status === 'PAGADO' && !formData.payment_date) validationErrors.payment_date = 'Este campo es obligatorio';

  return Object.keys(validationErrors).length === 0;
};

const goBack = () => router.push('/pagos-de-administracion');

const handleSubmit = async () => {
  if (!validateForm()) {
    await nextTick();
    const firstError = document.querySelector('[aria-invalid="true"], .is-invalid');
    if (firstError) {
        if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(firstError.tagName)) firstError.setAttribute('tabindex', '-1');
        firstError.focus({ preventScroll: true });
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return toast('Atención', 'Revisa los campos obligatorios marcados en rojo', 'warning');
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
    await loadCutoffDay();
    if (isEditMode.value) {
      const item = await store.fetchProfileById(route.params.id);
      if (item) {
        Object.assign(formData, item);
        formData.amount = Number(item.amount) || 0;
        formData.late_fee_percentage = Number(item.late_fee_percentage) || 0;
        formData.period_date = item.period_date ? item.period_date.split('T')[0] : '';
        formData.due_date = item.due_date ? item.due_date.split('T')[0] : '';
        formData.next_payment_date = item.next_payment_date ? item.next_payment_date.split('T')[0] : '';
        formData.payment_date = item.payment_date ? item.payment_date.split('T')[0] : '';
      }
    }
  } finally {
    isViewLoading.value = false;
  }
});

</script>

<style scoped>
/* ===== ANIMACIONES ===== */
.fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== VARIABLES ===== */
:root {
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --transition: 150ms ease-in-out;
}

/* ===== CARDS ===== */
.card {
  border-radius: 0.625rem !important;
  transition: box-shadow var(--transition);
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-header {
  border-radius: 0.625rem 0.625rem 0 0 !important;
  background: linear-gradient(135deg, #f8f9fa, #fff);
}

/* ===== TIPOGRAFÍA LEGIBLE ===== */
.fw-medium {
  font-weight: 500 !important;
}

.fw-semibold {
  font-weight: 600 !important;
}

/* ==================== SKELETON ANIMATION ==================== */



@keyframes skeleton-pulse {

  0%,
  100% {
    background-position: 200% 0;
    opacity: 1;
  }

  50% {
    background-position: -200% 0;
    opacity: 0.6;
  }
}

/* ===== NATIVE INPUT VALIDATION ===== */
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

/* ==================== SELECT2 UI FIXES ==================== */




</style>
