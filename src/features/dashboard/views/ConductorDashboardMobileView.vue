<template>
  <div class="conductor-mobile">
    <!-- Hero del conductor, réplica del mockup Android -->
    <div class="hero-card" role="region" aria-labelledby="titulo-conductor">
      <div class="hero-driver">
        <span class="hero-avatar" aria-hidden="true">{{ iniciales }}</span>
        <div class="hero-info">
          <p class="hero-greeting">{{ saludo }}</p>
          <h1 id="titulo-conductor" class="hero-name">Sr. {{ primerNombre }}</h1>
          <p class="hero-badges">
            <span class="badge badge-rol">
              <i class="fas fa-steering-wheel" aria-hidden="true"></i> ROL CONDUCTOR
            </span>
            <span v-if="licencia" class="badge badge-licencia">
              Cat. {{ licencia.category || 'C2' }} · {{ licencia.status || 'ACTIVA' }}
            </span>
          </p>
          <p class="hero-meta">
            <span v-if="documento">CC: {{ documento }}</span>
            <span v-if="licencia?.due_date"> · Vence: {{ licencia.due_date }}</span>
          </p>
        </div>
      </div>
      <dl class="stats-strip">
        <div class="stat-item">
          <dt>Inspecciones</dt>
          <dd>{{ kpis.inspections_count || 0 }}</dd>
        </div>
        <div class="stat-item">
          <dt>Planillas</dt>
          <dd>{{ kpis.control_sheets_count || 0 }}</dd>
        </div>
        <div class="stat-item">
          <dt>FUECs</dt>
          <dd>{{ kpis.fuecs_count || 0 }}</dd>
        </div>
        <div class="stat-item">
          <dt>Servicios</dt>
          <dd>{{ kpis.service_delivery_count || 0 }}</dd>
        </div>
      </dl>
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         BANNER DE FLUJO OPERATIVO PRIORITARIO
         Prioridad 1: Inspección Preoperacional Diaria
         Prioridad 2: Inicio / Control de Servicio en Ruta
    ═══════════════════════════════════════════════════════════ -->
    <div class="priority-flow-card" :class="tieneInspeccionHoy ? 'is-inspected' : 'is-pending'" role="region" aria-labelledby="titulo-prioridad">

      <!-- Caso 1: Inspección pendiente — banner amber compacto -->
      <template v-if="!tieneInspeccionHoy">
        <div class="pf-compact-row">
          <div class="pf-left">
            <span class="pf-pulse-dot" aria-hidden="true"></span>
            <i class="fas fa-clipboard-check pf-icon" aria-hidden="true"></i>
            <span id="titulo-prioridad" class="pf-label">Preoperacional pendiente</span>
            <span v-if="primerVehiculo" class="pf-plate">{{ formatearPlaca(primerVehiculo.plate) }}</span>
          </div>
          <router-link to="/inspeccion-vehiculos/crear" class="pf-action-btn pf-btn-amber">
            Iniciar <i class="fas fa-arrow-right ms-1" aria-hidden="true"></i>
          </router-link>
        </div>
      </template>

      <!-- Caso 2: Inspección completada → opción de servicio compacta -->
      <template v-else>
        <div class="pf-compact-row">
          <div class="pf-left">
            <i class="fas fa-check-circle pf-icon pf-icon-green" aria-hidden="true"></i>
            <span id="titulo-prioridad" class="pf-label">
              {{ tieneServicioActivo ? 'Servicio en curso' : 'Listo para salir a ruta' }}
            </span>
            <span v-if="primerVehiculo" class="pf-plate pf-plate-green">{{ formatearPlaca(primerVehiculo.plate) }}</span>
          </div>
          <!-- Si hay servicio activo: Continuar -->
          <router-link
            v-if="tieneServicioActivo && activeService.service_uuid"
            :to="`/planilla-de-control-de-prestacion-servicios/control-de-servicios?service_uuid=${activeService.service_uuid}`"
            class="pf-action-btn pf-btn-green"
          >
            Continuar <i class="fas fa-arrow-right ms-1" aria-hidden="true"></i>
          </router-link>
          <!-- Si no hay servicio activo: Iniciar -->
          <router-link
            v-else
            to="/planilla-de-control-de-prestacion-servicios/control-de-servicios"
            class="pf-action-btn pf-btn-blue"
          >
            Iniciar <i class="fas fa-arrow-right ms-1" aria-hidden="true"></i>
          </router-link>
        </div>
      </template>

    </div>

    <!-- Módulos de gestión operativa -->
    <div class="mobile-section" role="region" aria-labelledby="titulo-modulos">
      <div class="section-header">
        <h2 id="titulo-modulos" class="section-title">
          <span class="section-icon" aria-hidden="true"><i class="fas fa-th-large" aria-hidden="true"></i></span>
          Gestión operativa
        </h2>
      </div>
      <ul class="module-list">
        <li>
          <router-link class="module-row" to="/inspeccion-vehiculos">
            <span class="mr-icon is-blue" aria-hidden="true"><i class="fas fa-tasks-alt" aria-hidden="true"></i></span>
            <span class="mr-texts">
              <span class="mr-title">Inspecciones</span>
              <span class="mr-desc">Historial de seguridad vial pre-operacional</span>
            </span>
            <span class="mr-badge">{{ kpis.inspections_count || 0 }} regs</span>
            <i class="fas fa-chevron-right mr-chevron" aria-hidden="true"></i>
          </router-link>
        </li>

        <li>
          <router-link class="module-row" to="/planillas-de-control-de-servicios">
            <span class="mr-icon is-neutral" aria-hidden="true"><i class="fas fa-clipboard-list" aria-hidden="true"></i></span>
            <span class="mr-texts">
              <span class="mr-title">Planillas de control</span>
              <span class="mr-desc">Verificación de documentos PDF y auditoría</span>
            </span>
            <span class="mr-badge">{{ kpis.control_sheets_count || 0 }} regs</span>
            <i class="fas fa-chevron-right mr-chevron" aria-hidden="true"></i>
          </router-link>
        </li>

        <li>
          <router-link class="module-row" to="/extracto-de-contrato">
            <span class="mr-icon is-green" aria-hidden="true"><i class="fas fa-file-contract" aria-hidden="true"></i></span>
            <span class="mr-texts">
              <span class="mr-title">FUEC y extractos</span>
              <span class="mr-desc">Extractos únicos de contrato vigentes</span>
            </span>
            <span class="mr-badge">{{ kpis.fuecs_count || 0 }} activos</span>
            <i class="fas fa-chevron-right mr-chevron" aria-hidden="true"></i>
          </router-link>
        </li>

        <li>
          <router-link class="module-row" to="/planilla-de-control-de-prestacion-servicios">
            <span class="mr-icon is-teal" aria-hidden="true"><i class="fas fa-route" aria-hidden="true"></i></span>
            <span class="mr-texts">
              <span class="mr-title">Control de servicio</span>
              <span class="mr-desc">Planillas PCP, hora y km de recorrido</span>
            </span>
            <span class="mr-badge">{{ kpis.service_delivery_count || 0 }} servicios</span>
            <i class="fas fa-chevron-right mr-chevron" aria-hidden="true"></i>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Vehículos -->
    <div class="mobile-section" role="region" aria-labelledby="titulo-vehiculos">
      <div class="section-header">
        <h2 id="titulo-vehiculos" class="section-title">
          <span class="section-icon is-orange" aria-hidden="true"><i class="fas fa-truck" aria-hidden="true"></i></span>
          Mis Vehículos
        </h2>
        <div class="vehicle-search">
          <label class="visually-hidden" for="f-buscar-placa-movil">Buscar placa o marca</label>
          <input
            id="f-buscar-placa-movil"
            v-model="busqueda"
            type="search"
            placeholder="🔍 Buscar placa..."
            autocomplete="off"
          />
        </div>
      </div>
      <div v-if="vehiculosFiltrados.length > 0" class="vehicle-list">
        <article v-for="vehiculo in vehiculosFiltrados" :key="vehiculo.uuid" class="vehicle-card">
          <h3 class="vehicle-plate">{{ formatearPlaca(vehiculo.plate) }}</h3>
          <p class="vehicle-data">{{ vehiculo.brand }} {{ vehiculo.line }} · Modelo {{ vehiculo.model || 'N/A' }}</p>
          <p class="vehicle-km">{{ formatearNumero(vehiculo.current_mileage) }} km</p>
        </article>
      </div>
      <div v-else class="empty-vehicle" role="status">
        <p class="ev-icon" aria-hidden="true">🚌</p>
        <p class="ev-title">Sin vehículos asignados</p>
        <p class="ev-sub">No tienes vehículos vinculados a proyectos o extractos de contrato (FUEC) activos.</p>
        <button v-if="busqueda" type="button" class="mc-btn-secondary" @click="busqueda = ''">Limpiar búsqueda</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore, usePermissionsStore, useUserStore } from '@store';
import { useDashboardStore } from '../store/dashboard.store';
import { logger } from '@utils/logger.js';
import { primerNombre as primerNombreDe, iniciales as inicialesDe, saludoPorHora, filtrarVehiculos, formatearNumero, formatearPlaca } from '../utils/presentacionConductor.js';

const authStore = useAuthStore();
const userStore = useUserStore();
const permissionsStore = usePermissionsStore();
const dashboardStore = useDashboardStore();

const busqueda = ref('');

const datos = computed(() => dashboardStore.conductorData || {});
const nombreCompleto = computed(() => {
  void permissionsStore.roles;
  void authStore.currentTenant;
  return datos.value.conductor?.name || userStore.fullName || userStore.username || 'Conductor';
});
const primerNombre = computed(() => primerNombreDe(nombreCompleto.value));
const iniciales = computed(() => inicialesDe(nombreCompleto.value));
const saludo = computed(() => saludoPorHora());
const vehiculosFiltrados = computed(() => filtrarVehiculos(vehiculos.value, busqueda.value));
const documento = computed(() => datos.value.conductor?.document || null);
const licencia = computed(() => datos.value.conductor?.license || null);
const kpis = computed(() => datos.value.kpis || {});
const vehiculos = computed(() => datos.value.vehicles || []);

const primerVehiculo = computed(() => {
  if (vehiculos.value && vehiculos.value.length > 0) {
    return vehiculos.value[0];
  }
  return null;
});

const activeService = computed(() => datos.value.active_service || null);
const tieneServicioActivo = computed(() => !!activeService.value);

const tzoffset = (new Date()).getTimezoneOffset() * 60000;
const hoyStr = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];

const inspeccionHoy = computed(() => {
  const lista = datos.value.recent_inspections || [];
  const encontrada = lista.find((item) => {
    const f = item.date || item.inspection_date;
    if (!f) return false;
    return String(f).substring(0, 10) === hoyStr;
  });
  if (encontrada) return encontrada;

  if (datos.value.has_today_inspection) {
    return { date: hoyStr };
  }
  return null;
});

const tieneInspeccionHoy = computed(() => !!inspeccionHoy.value);

onMounted(async () => {
  try {
    await dashboardStore.fetchConductorDashboardData(30);
  } catch (error) {
    logger.error('No se pudo cargar el panel móvil del conductor', error);
  }
});
</script>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
.conductor-mobile {
  width: 100% !important;
  max-width: 100vw !important;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 0 10px;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
}
.conductor-mobile section,
.conductor-mobile .mobile-section {
  padding: 0 !important;
  margin: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.hero-card {
  margin: 14px 16px 0;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #2563eb 100%);
  border-radius: 20px;
  padding: 18px 18px 16px;
  color: #ffffff !important;
  box-shadow: 0 3px 10px rgba(12, 36, 97, 0.25);
  position: relative;
  overflow: hidden;
}
.hero-card::before {
  content: '';
  position: absolute;
  top: -30px; right: -30px;
  width: 120px; height: 120px;
  border-radius: 50%;
  background: rgba(255,255,255,.06);
}
.hero-card::after {
  content: '';
  position: absolute;
  bottom: -20px; right: 30px;
  width: 80px; height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,.04);
}
.hero-driver {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 2;
}
.hero-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: #ffffff !important;
  flex-shrink: 0;
  overflow: hidden !important;
}
.hero-greeting {
  font-size: var(--noa-text-meta);
  color: #93c5fd !important;
  font-weight: 400;
  margin: 0;
}
.hero-name {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff !important;
  margin: 1px 0 0;
}
.hero-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 6px 0 0;
}
.badge {
  font-size: var(--noa-text-meta);
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}
.badge-rol {
  background: #f97316 !important;
  color: #ffffff !important;
}
.badge-licencia {
  background: rgba(34,197,94,.25) !important;
  color: #86efac !important;
  border: 1px solid rgba(34,197,94,.3) !important;
}
.hero-meta {
  font-size: var(--noa-text-meta);
  color: rgba(255,255,255,.5) !important;
  font-weight: 400;
  margin: 3px 0 0;
}
.hero-meta span { color: rgba(255,255,255,.7) !important; }
.stats-strip {
  display: flex;
  gap: 8px;
  margin: 14px 0 0;
  padding: 0;
  position: relative;
  z-index: 2;
}
.stat-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.1) !important;
  border: none !important;
  border-radius: 12px;
  padding: 8px 6px;
  text-align: center;
  display: flex;
  flex-direction: column-reverse;
  gap: 1px;
  backdrop-filter: blur(4px);
}
.stat-item dd {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff !important;
}
.stat-item dt {
  font-size: var(--noa-text-meta);
  font-weight: 400;
  color: rgba(255,255,255,.55) !important;
  letter-spacing: 0;
  text-transform: none;
}
/* ── BANNER PREOPERACIONAL COMPACTO ── */
.priority-flow-card {
  margin: 10px 16px 0;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(226, 232, 240, 0.8);
  overflow: hidden;
}
.priority-flow-card.is-pending {
  border-left: 4px solid #f97316;
  background: #fffbf5;
}
.priority-flow-card.is-inspected {
  border-left: 4px solid #10b981;
  background: #f6fef9;
}
/* Fila compacta */
.pf-compact-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.pf-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.pf-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f97316;
  flex-shrink: 0;
  animation: pulse-dot 1.4s infinite;
}
.pf-icon {
  font-size: 13px;
  color: #f97316;
  flex-shrink: 0;
}
.pf-icon-green { color: #16a34a; }
.pf-label {
  font-size: var(--noa-text-meta);
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pf-plate {
  font-size: var(--noa-text-meta);
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1px 6px;
  white-space: nowrap;
  flex-shrink: 0;
}
.pf-plate-green {
  color: #166534;
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.pf-action-btn {
  flex-shrink: 0;
  font-size: var(--noa-text-meta);
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 8px;
  text-decoration: none !important;
  color: #fff !important;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.pf-action-btn:active { opacity: 0.85; }
.pf-btn-amber { background: #f97316; }
.pf-btn-green { background: #16a34a; }
.pf-btn-blue  { background: #2563eb; }
.priority-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.priority-badge-wrap {
  display: flex;
  align-items: center;
}
.priority-pill {
  font-size: var(--noa-text-meta);
  font-weight: 800;
  letter-spacing: 0.3px;
  padding: 2px 8px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.pill-warning {
  background: #ffedd5;
  color: #c2410c;
  border: 1px solid #fed7aa;
}
.pill-success {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.priority-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ea580c;
  animation: pulse-dot 1.4s infinite;
}
@keyframes pulse-dot {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 6px #ea580c; }
  100% { transform: scale(0.95); opacity: 0.7; }
}
.priority-vehicle-tag {
  font-size: var(--noa-text-meta);
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.priority-vehicle-tag.is-success {
  color: #166534;
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.priority-body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.priority-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.box-warning {
  background: #fff7ed;
  color: #f97316;
  border: 1px solid #ffedd5;
}
.box-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}
.priority-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.priority-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a !important;
  margin: 0;
  line-height: 1.25;
}
.priority-desc {
  font-size: var(--noa-text-meta);
  color: #475569 !important;
  margin: 0;
  line-height: 1.35;
  font-weight: 500;
}
.priority-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 2px;
}
.priority-main-btn {
  width: 100%;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: var(--noa-text-meta);
  font-weight: 800 !important;
  text-align: center;
  text-decoration: none !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #ffffff !important;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: all 0.15s ease;
}
.btn-warning-action {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
}
.btn-warning-action:active {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%) !important;
  transform: scale(0.98);
}
.btn-success-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}
.btn-success-action:active {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  transform: scale(0.98);
}
.btn-primary-action {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
}
.btn-primary-action:active {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
  transform: scale(0.98);
}
.priority-blocked-btn {
  width: 100%;
  border-radius: 9px;
  padding: 7px 10px;
  font-size: var(--noa-text-meta);
  font-weight: 600;
  text-align: center;
  background: #f1f5f9 !important;
  color: #94a3b8 !important;
  border: 1px dashed #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: not-allowed;
}
.priority-sub-btn {
  font-size: var(--noa-text-meta);
  color: #2563eb !important;
  font-weight: 700;
  text-align: center;
  text-decoration: none !important;
  padding: 4px 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.mc-btn-secondary,
a.mc-btn-secondary,
button.mc-btn-secondary {
  border-radius: var(--noa-radius-md);
  padding: 8px 14px;
  min-height: var(--noa-touch-min);
  font-size: var(--noa-text-body);
  font-weight: 600;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  text-decoration: none !important;
  background: transparent;
  border: 1px solid var(--noa-line);
  color: var(--noa-ink);
  cursor: pointer;
}
.mc-btn-secondary:active,
a.mc-btn-secondary:active {
  background: var(--noa-paper);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 16px 16px 8px;
  margin: 0;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}
.section-icon {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: #1e40af;
  color: #ffffff !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--noa-text-meta);
}
.section-icon.is-orange {
  background: #f97316;
}
.module-list {
  list-style: none;
  margin: 0;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
}
.module-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 10px 12px;
  background: var(--noa-card);
  border-radius: var(--noa-radius-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
  text-decoration: none !important;
  box-sizing: border-box;
}
.module-row:active {
  background: var(--noa-paper);
}
.mr-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.mr-icon.is-blue { color: var(--noa-action); background: #eff6ff; }
.mr-icon.is-neutral { color: var(--noa-ink-soft); background: var(--noa-paper); }
.mr-icon.is-green { color: var(--noa-success); background: #f0fdf4; }
.mr-icon.is-teal { color: var(--noa-teal); background: #f0fdfa; }
.mr-texts {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.mr-title {
  font-size: var(--noa-text-body);
  font-weight: 700;
  color: var(--noa-ink);
}
.mr-desc {
  font-size: var(--noa-text-meta);
  color: var(--noa-ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mr-badge {
  font-size: var(--noa-text-meta);
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--noa-radius-full);
  background: var(--noa-paper);
  color: var(--noa-ink-soft);
  white-space: nowrap;
  flex-shrink: 0;
}
.mr-chevron {
  color: var(--noa-line);
  font-size: var(--noa-text-meta);
  flex-shrink: 0;
}
.vehicle-search input {
  font-size: var(--noa-text-meta);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 8px;
  color: #94a3b8;
  background: #f8fafc;
  width: 110px;
  font-family: inherit;
}
.vehicle-search input::placeholder { color: #94a3b8; }
.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 16px;
  margin: 4px 0 0;
  box-sizing: border-box;
}
.vehicle-card {
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.7);
}
.vehicle-plate {
  font-size: 13px;
  margin: 0;
  color: #0f172a !important;
  font-weight: 800;
}
.vehicle-data {
  font-size: var(--noa-text-meta);
  color: #475569 !important;
  margin: 1px 0;
  font-weight: 500;
}
.vehicle-km {
  font-size: 12px;
  font-weight: 800;
  color: #1d4ed8 !important;
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.empty-vehicle {
  background: #fff;
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  margin: 4px 16px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.ev-icon {
  font-size: 36px;
  margin: 0 0 10px;
  opacity: 0.45;
}
.ev-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}
.ev-sub {
  font-size: var(--noa-text-meta);
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 8px;
}
.mobile-footer-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 24px;
}
.mobile-logout-full-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #dc2626 !important;
  border: 1.5px solid #fecaca !important;
  border-radius: 12px !important;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 16px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s ease;
}
.mobile-logout-full-btn:active {
  background: #fef2f2;
  border-color: #fca5a5 !important;
  transform: scale(0.98);
}
.mobile-logout-full-btn:disabled {
  opacity: 0.6;
  pointer-events: none;
}
.mobile-app-version {
  font-size: var(--noa-text-meta);
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}
</style>
