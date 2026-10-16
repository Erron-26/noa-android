<template>
  <div class="conductor-mobile">
    <!-- Hero del conductor, réplica del mockup Android -->
    <div class="hero-card" role="region" aria-labelledby="titulo-conductor">
      <div class="hero-driver">
        <span class="hero-avatar" aria-hidden="true">{{ iniciales }}</span>
        <div class="hero-info">
          <p class="hero-greeting">{{ saludo }}</p>
          <h1 id="titulo-conductor" class="hero-name">{{ primerNombre }}</h1>
          <p class="hero-badges">
            <span class="badge badge-rol">
              <i class="fas fa-steering-wheel" aria-hidden="true"></i> ROL CONDUCTOR
            </span>
            <span v-if="licencia" class="badge badge-licencia">
              Cat. {{ licencia.category || 'C2' }} · {{ licencia.status || 'ACTIVA' }}
            </span>
          </p>
          <p v-if="documento" class="hero-meta">C.C. {{ documento }}</p>
          <p v-if="licencia?.due_date" class="hero-meta hero-meta-lic">
            <i class="fas fa-calendar" aria-hidden="true"></i>Licencia vence: {{ licencia.due_date }}
          </p>
        </div>
      </div>
      <dl class="stats-strip">
        <div class="stat-item">
          <dt>Inspecc.</dt>
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
    <div class="priority-flow-card" :class="{ 'is-inspected': tieneInspeccionHoy }" role="region" aria-labelledby="titulo-prioridad">

      <!-- Caso 1: Inspección pendiente — tarjeta ámbar con CTA a ancho completo -->
      <template v-if="!tieneInspeccionHoy">
        <div class="pf-pendiente-top">
          <span class="pf-icon-box" aria-hidden="true"><i class="fas fa-clipboard-list" aria-hidden="true"></i></span>
          <div class="pf-pendiente-texts">
            <p id="titulo-prioridad" class="pf-titulo"><span class="pf-pulse-dot" aria-hidden="true"></span>Preoperacional pendiente</p>
            <p class="pf-desc">Obligatorio antes de iniciar cualquier ruta asignada hoy.</p>
          </div>
        </div>
        <router-link to="/inspeccion-vehiculos/crear" class="pf-cta">
          Iniciar inspección diaria <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </router-link>
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
          <span class="section-icon" aria-hidden="true"><i class="fas fa-bus" aria-hidden="true"></i></span>
          Vehículo asignado
        </h2>
        <span class="section-meta">Flota NOA</span>
      </div>
      <div class="vehicle-search">
        <i class="fas fa-search" aria-hidden="true"></i>
        <label class="visually-hidden" for="f-buscar-placa-movil">Buscar por placa o número interno</label>
        <input
          id="f-buscar-placa-movil"
          v-model="busqueda"
          type="search"
          placeholder="Buscar por placa o número interno"
          autocomplete="off"
        />
      </div>
      <div v-if="vehiculosFiltrados.length > 0" class="vehicle-list">
        <article v-for="vehiculo in vehiculosFiltrados" :key="vehiculo.uuid" class="vehicle-card">
          <div class="vc-top">
            <span class="vc-icon" aria-hidden="true"><i class="fas fa-bus" aria-hidden="true"></i></span>
            <div class="vc-texts">
              <div class="vc-plate-row">
                <h3 class="vehicle-plate">{{ formatearPlaca(vehiculo.plate) }}</h3>
                <span v-if="vehiculo.internal_number" class="vc-interno">#{{ vehiculo.internal_number }}</span>
              </div>
              <p class="vehicle-data">{{ vehiculo.brand }} {{ vehiculo.line }}<template v-if="vehiculo.model"> · Modelo {{ vehiculo.model }}</template></p>
            </div>
          </div>
          <p class="vehicle-km"><i class="fas fa-tachometer-alt" aria-hidden="true"></i>{{ formatearNumero(vehiculo.current_mileage) }} km</p>
        </article>
      </div>
      <div v-else class="empty-vehicle" role="status">
        <p class="ev-icon" aria-hidden="true"><i class="fas fa-bus" aria-hidden="true"></i></p>
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
  max-width: 100% !important;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 0 10px;
  box-sizing: border-box;
  font-family: var(--noa-font);
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
  margin: 16px 16px 0;
  background: var(--noa-hero-inicio);
  border-radius: var(--noa-radius-xl);
  padding: 20px 20px 18px;
  color: var(--noa-on-primary) !important;
  box-shadow: 0 3px 10px color-mix(in srgb, var(--noa-primary-container) 25%, transparent);
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
  width: 56px;
  height: 56px;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: var(--noa-on-primary) !important;
  flex-shrink: 0;
  overflow: hidden !important;
}
.hero-greeting {
  font-size: var(--noa-text-meta);
  color: var(--noa-hero-soft) !important;
  font-weight: 400;
  margin: 0;
}
.hero-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--noa-on-primary) !important;
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
  background: var(--noa-alert) !important;
  color: var(--noa-on-primary) !important;
}
.badge-licencia {
  background: color-mix(in srgb, var(--noa-verde-vivo) 25%, transparent) !important;
  color: var(--noa-verde-claro) !important;
  border: 1px solid color-mix(in srgb, var(--noa-verde-vivo) 30%, transparent) !important;
}
.hero-meta {
  font-size: var(--noa-text-meta);
  color: rgba(255,255,255,.8) !important;
  font-weight: 400;
  margin: 3px 0 0;
}
.hero-meta-lic {
  display: flex;
  align-items: center;
  gap: 6px;
}
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
  color: var(--noa-on-primary) !important;
}
.stat-item dt {
  font-size: var(--noa-text-meta);
  font-weight: 400;
  color: rgba(255,255,255,.8) !important;
  letter-spacing: 0;
  text-transform: none;
}
/* ── TARJETA DE FLUJO PRIORITARIO ── */
.priority-flow-card {
  margin: 10px 16px 0;
  border-radius: 20px;
  background: var(--noa-fondo-ambar);
  border: 1px solid var(--noa-borde-ambar);
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.priority-flow-card.is-inspected {
  background: var(--noa-verde-fondo);
  border-color: var(--noa-borde-exito);
}
/* Pendiente estilo Stitch: icono + título + descripción + CTA a ancho completo */
.pf-pendiente-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.pf-icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--noa-radius-lg);
  background: var(--noa-ambar-claro);
  color: var(--noa-naranja-oscuro);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.pf-pendiente-texts {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.pf-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--noa-text-title);
  font-weight: 800;
  color: var(--noa-titulo-ambar);
  margin: 0;
}
.pf-desc {
  font-size: var(--noa-text-body);
  color: var(--noa-desc-ambar);
  margin: 0;
  line-height: 1.4;
}
.pf-cta {
  width: 100%;
  min-height: var(--noa-touch-cta);
  border-radius: var(--noa-radius-md);
  background: var(--noa-naranja-oscuro);
  color: var(--noa-on-primary) !important;
  font-size: var(--noa-text-body);
  font-weight: 700;
  text-decoration: none !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
}
.pf-cta:active { opacity: 0.9; }
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
  background: var(--noa-alert);
  flex-shrink: 0;
  animation: pulse-dot 1.4s infinite;
}
.pf-icon {
  font-size: 13px;
  color: var(--noa-alert);
  flex-shrink: 0;
}
.pf-icon-green { color: var(--noa-success); }
.pf-label {
  font-size: var(--noa-text-meta);
  font-weight: 700;
  color: var(--noa-ink-form);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pf-plate {
  font-size: var(--noa-text-meta);
  font-weight: 700;
  color: var(--noa-texto-secundario);
  background: var(--noa-fondo-secundario);
  border: 1px solid var(--noa-line-soft);
  border-radius: 6px;
  padding: 1px 6px;
  white-space: nowrap;
  flex-shrink: 0;
}
.pf-plate-green {
  color: var(--noa-texto-exito);
  background: var(--noa-tinte-verde);
  border-color: var(--noa-borde-exito);
}
.pf-action-btn {
  flex-shrink: 0;
  font-size: var(--noa-text-meta);
  font-weight: 700;
  padding: 5px 14px;
  min-height: var(--noa-touch-min);
  border-radius: 8px;
  text-decoration: none !important;
  color: var(--noa-on-primary) !important;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.pf-action-btn:active { opacity: 0.85; }
.pf-btn-green { background: var(--noa-success); }
.pf-btn-blue  { background: var(--noa-action); }
/* Clases priority, pill y box sin uso retiradas; la animación vive abajo. */
@keyframes pulse-dot {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 6px var(--noa-naranja-oscuro); }
  100% { transform: scale(0.95); opacity: 0.7; }
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
  font-size: var(--noa-text-title);
  font-weight: 700;
  color: var(--noa-ink);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}
.section-icon {
  color: var(--noa-action);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.section-meta {
  font-size: var(--noa-text-meta);
  font-weight: 600;
  color: var(--noa-ink-soft);
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
.mr-icon.is-blue { color: var(--noa-action); background: var(--noa-tinte-azul); }
.mr-icon.is-neutral { color: var(--noa-ink-soft); background: var(--noa-paper); }
.mr-icon.is-green { color: var(--noa-success); background: var(--noa-tinte-verde); }
.mr-icon.is-teal { color: var(--noa-teal); background: var(--noa-tinte-teal); }
.mr-texts {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.mr-title {
  font-size: var(--noa-text-title);
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
/* Barra de búsqueda a ancho completo (sin QR: plan lejano) */
.vehicle-search {
  margin: 8px 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: var(--noa-touch-cta);
  background: var(--noa-card);
  border: 1px solid var(--noa-line-soft);
  border-radius: var(--noa-radius-full);
  padding: 0 16px;
  box-sizing: border-box;
}
.vehicle-search > i {
  color: var(--noa-muted);
  font-size: 16px;
  flex-shrink: 0;
}
.vehicle-search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--noa-text-body);
  font-family: inherit;
  color: var(--noa-ink);
  padding: 0;
}
.vehicle-search input::placeholder { color: var(--noa-muted); }
.vehicle-search:focus-within {
  border-color: var(--noa-enfoque);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--noa-enfoque) 10%, transparent);
}
.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 16px;
  margin: 4px 0 0;
  box-sizing: border-box;
}
.vehicle-card {
  background: var(--noa-card);
  border-radius: var(--noa-radius-lg);
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--noa-line-soft);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vc-top {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.vc-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--noa-radius-md);
  background: var(--noa-paper);
  color: var(--noa-primary-container);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.vc-texts {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.vc-plate-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.vehicle-plate {
  font-size: var(--noa-text-title);
  margin: 0;
  color: var(--noa-ink) !important;
  font-weight: 800;
}
.vc-interno {
  font-size: var(--noa-text-meta);
  font-weight: 700;
  background: var(--noa-fondo-interno);
  color: var(--noa-primary);
  padding: 2px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}
.vehicle-data {
  font-size: var(--noa-text-meta);
  color: var(--noa-ink-soft) !important;
  margin: 1px 0 0;
  font-weight: 500;
}
.vehicle-km {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--noa-text-meta);
  font-weight: 600;
  color: var(--noa-ink-soft) !important;
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.empty-vehicle {
  background: var(--noa-card);
  border-radius: var(--noa-radius-lg);
  padding: 28px 20px;
  text-align: center;
  margin: 4px 16px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.ev-icon {
  font-size: 32px;
  color: var(--noa-muted);
  margin: 0 0 10px;
}
.ev-title {
  font-size: var(--noa-text-body);
  font-weight: 700;
  color: var(--noa-ink-form);
  margin: 0 0 4px;
}
.ev-sub {
  font-size: var(--noa-text-meta);
  color: var(--noa-ink-soft);
  line-height: 1.5;
  margin: 0 0 8px;
}
</style>
