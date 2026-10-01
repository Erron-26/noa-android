<template>
    <Dialog v-model:visible="visible" :modal="true" :closable="true" :draggable="false" :style="{ width: '560px', maxWidth: '95vw' }" :breakpoints="{ '960px': '92vw', '640px': '95vw' }" :content-style="{ overflowY: 'auto' }" class="p-fluid">
        <template #header>
            <div class="d-flex align-items-center gap-2">
                <i class="fad fa-file-chart-column text-primary fs-4" aria-hidden="true"></i>
                <h5 class="mb-0 fw-bold">Reportes de Control de Servicio (solo cerradas)</h5>
            </div>
        </template>
        <div class="p-1">
            <div class="alert alert-info py-2 px-3 mb-3 small d-flex align-items-center gap-2" style="border-radius: 6px;">
                <i class="fad fa-info-circle text-primary" aria-hidden="true"></i>
                <span>Un solo formulario: elige el tipo y completa sus campos. El PDF sale en OPE-F-006 y el Excel en filas. El mensual marca historial solo.</span>
            </div>
            <label class="form-label required fw-medium" for="rep-tipo">Tipo de reporte</label>
            <PrimeSelect input-id="rep-tipo" v-model="tipo" :options="tipos" option-label="label" option-value="value" class="w-100 mb-3" :invalid="!!error" />

            <div class="row g-2">
                <div v-if="tipo === 'rango' || muestraRango" class="col-12 col-sm-6">
                    <label class="form-label" for="rep-desde">Desde</label>
                    <input id="rep-desde" v-model="filtros.fecha_desde" type="date" class="form-control form-control-sm" :max="filtros.fecha_hasta || undefined" />
                </div>
                <div v-if="tipo === 'rango' || muestraRango" class="col-12 col-sm-6">
                    <label class="form-label" for="rep-hasta">Hasta (máx 62 días)</label>
                    <input id="rep-hasta" v-model="filtros.fecha_hasta" type="date" class="form-control form-control-sm" :min="filtros.fecha_desde || undefined" />
                </div>
                <div v-if="tipo === 'vehiculo' || tipo === 'mensual'" class="col-12">
                    <label class="form-label" for="rep-veh">Vehículo {{ tipo === 'mensual' ? '(opcional)' : '' }}</label>
                    <select id="rep-veh" v-model="filtros.vehicle_uuid" class="form-select form-select-sm">
                        <option value="">{{ tipo === 'mensual' ? 'Todos los vehículos' : 'Seleccione...' }}</option>
                        <option v-for="v in vehicles" :key="v.uuid" :value="v.uuid">{{ v.vehicle_license_plate }}</option>
                    </select>
                </div>
                <div v-if="tipo === 'conductor'" class="col-12">
                    <label class="form-label" for="rep-conductor">Conductor</label>
                    <select id="rep-conductor" v-model="filtros.third_party_uuid" class="form-select form-select-sm">
                        <option value="">Seleccione...</option>
                        <option v-for="c in drivers" :key="c.uuid" :value="c.uuid">{{ nombreConductor(c) }}</option>
                    </select>
                </div>
                <div v-if="tipo === 'dia'" class="col-12">
                    <label class="form-label" for="rep-dia">Fecha</label>
                    <input id="rep-dia" v-model="filtros.fecha" type="date" class="form-control form-control-sm" />
                </div>
                <div v-if="tipo === 'mensual'" class="col-12 col-sm-6">
                    <label class="form-label" for="rep-month">Mes</label>
                    <select id="rep-month" v-model="filtros.month" class="form-select form-select-sm">
                        <option v-for="m in 12" :key="m" :value="m">{{ nombreMes(m) }}</option>
                    </select>
                </div>
                <div v-if="tipo === 'mensual'" class="col-12 col-sm-6">
                    <label class="form-label" for="rep-year">Año</label>
                    <select id="rep-year" v-model="filtros.year" class="form-select form-select-sm">
                        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                    </select>
                </div>
            </div>

            <div v-if="error" class="alert alert-warning py-2 px-3 mt-3 mb-0 small" role="alert">{{ error }}</div>

            <div class="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                <button type="button" class="btn btn-falcon-default btn-sm" @click="visible = false">Cerrar</button>
                <button type="button" class="btn btn-sm btn-danger text-white" :disabled="downloading || !valido" @click="descargar('pdf')">
                    <span v-if="downloading" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fad fa-file-pdf me-1" aria-hidden="true"></i>PDF
                </button>
                <button type="button" class="btn btn-sm btn-success text-white" :disabled="downloading || !valido" @click="descargar('excel')">
                    <span v-if="downloading" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fad fa-file-excel me-1" aria-hidden="true"></i>Excel
                </button>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import Dialog from 'primevue/dialog';
import PrimeSelect from 'primevue/select';
import { useServiceDeliveryControlSheetStore } from '../store/serviceDeliveryControlSheet.store.js';

defineProps({ vehicles: { type: Array, default: () => [] }, drivers: { type: Array, default: () => [] } });
const visible = defineModel('visible', { default: false });
const store = useServiceDeliveryControlSheetStore();
const downloading = ref(false);
const error = ref('');
const tipo = ref('rango');
const filtros = reactive({ fecha_desde: '', fecha_hasta: '', fecha: '', vehicle_uuid: '', third_party_uuid: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
const tipos = [
    { label: '1. Por rango de fechas', value: 'rango' },
    { label: '2. Por vehículo', value: 'vehiculo' },
    { label: '3. Por conductor', value: 'conductor' },
    { label: '4. Por día', value: 'dia' },
    { label: '5. Mensual (igual que Planilla Mensual)', value: 'mensual' },
];
const years = computed(() => { const a = new Date().getFullYear(); return [a, a - 1, a - 2]; });
const muestraRango = computed(() => tipo.value === 'vehiculo' || tipo.value === 'conductor');
const nombreMes = (m) => ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m - 1];
const nombreConductor = (c) => [c.first_name, c.last_name].filter(Boolean).join(' ') || c.driver_name_and_surname || c.uuid;
const valido = computed(() => !validar());
const validar = () => {
    if (tipo.value === 'rango') {
        if (!filtros.fecha_desde || !filtros.fecha_hasta) return 'El rango requiere fecha desde y hasta.';
        const dias = (new Date(filtros.fecha_hasta) - new Date(filtros.fecha_desde)) / 86400000;
        if (dias < 0) return 'La fecha hasta no puede ser menor que desde.';
        if (dias > 62) return 'El rango máximo es 62 días para no colgar el PDF.';
        return '';
    }
    if (tipo.value === 'vehiculo' && !filtros.vehicle_uuid) return 'Elige el vehículo.';
    if (tipo.value === 'conductor' && !filtros.third_party_uuid) return 'Elige el conductor.';
    if (tipo.value === 'dia' && !filtros.fecha) return 'Elige la fecha del día.';
    if (tipo.value === 'mensual' && (!filtros.month || !filtros.year)) return 'Elige mes y año.';
    return '';
};
const descargar = async (formato) => {
    error.value = validar();
    if (error.value) return;
    downloading.value = true;
    try {
        const params = {};
        if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
        if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
        if (tipo.value === 'dia') params.fecha = filtros.fecha;
        if (filtros.vehicle_uuid) params.vehicle_uuid = filtros.vehicle_uuid;
        if (tipo.value === 'conductor') params.third_party_uuid = filtros.third_party_uuid;
        if (tipo.value === 'mensual') { params.month = filtros.month; params.year = filtros.year; }
        await store.downloadReport(tipo.value, params, formato);
    } catch (e) {
        error.value = e?.response?.data?.message || e?.message || 'No se pudo generar el reporte. Revisa que haya días cerrados en ese filtro.';
    } finally { downloading.value = false; }
};
</script>
