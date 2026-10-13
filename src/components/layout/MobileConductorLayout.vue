<template>
  <a href="#contenido-movil" class="mobile-skip-link">Saltar al contenido principal</a>
  <div class="mobile-shell">
    <!-- Barra superior compacta estilo mockup Android -->
    <header class="mobile-topnav" :class="{ 'is-subpage': !esInicio }">
      <!-- Caso 1: Inicio (Dashboard) -->
      <div v-if="esInicio" class="mobile-brand">
        <div class="mobile-logo-wrap" title="NOA Transportes">
          <img src="/noa.svg" alt="NOA Transportes" class="mobile-logo-img" />
        </div>
        <div class="mobile-brand-text">
          <strong>NOA Transportes</strong>
          <small>Portal Conductor</small>
        </div>
      </div>

      <!-- Caso 2: Subpágina operativa (Inspecciones, FUECs, Planillas, Formularios) -->
      <div v-else class="mobile-subnav">
        <button
          type="button"
          class="mobile-back-btn"
          aria-label="Volver a la pantalla anterior"
          @click="irAtras"
        >
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </button>
        <div class="mobile-page-header">
          <h1 class="mobile-page-title">{{ tituloActual }}</h1>
          <span class="mobile-page-sub">Portal Conductor</span>
        </div>
      </div>

      <div class="mobile-actions">
        <router-link
          to="/notificaciones"
          class="mobile-bell"
          aria-label="Ver notificaciones"
        >
          <i class="fas fa-bell" aria-hidden="true"></i>
          <span v-if="tieneNoLeidas" class="mobile-bell-dot" aria-hidden="true"></span>
        </router-link>
        <router-link
          to="/profile"
          class="mobile-avatar"
          :aria-label="`Ver perfil de ${nombreConductor}`"
        >
          {{ iniciales }}
        </router-link>
        <button
          type="button"
          class="mobile-logout"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          :disabled="isLoggingOut"
          @click="ejecutarCerrarSesion"
        >
          <span v-if="isLoggingOut" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <i v-else class="fas fa-sign-out-alt" aria-hidden="true"></i>
        </button>
      </div>
    </header>

    <!-- Contenido desplazable: la vista móvil del conductor -->
    <main id="contenido-movil" tabindex="-1" class="mobile-scroll">
      <slot />
    </main>

    <!-- Navegación inferior fija, zona de pulgar -->
    <nav class="mobile-bottomnav" aria-label="Navegación principal del conductor">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="mobile-nav-item"
        :class="{ 'is-active': esActiva(item) }"
        :aria-current="esActiva(item) ? 'page' : undefined"
      >
        <i :class="item.icono" aria-hidden="true"></i>
        <span>{{ item.etiqueta }}</span>
        <span v-if="esActiva(item)" class="mobile-nav-dot" aria-hidden="true"></span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore, useConfigStore, usePermissionsStore } from '@store';
import { confirmLogout } from '@/utils/confirm.js';
import { logger } from '@utils/logger.js';

const props = defineProps({
  iniciales: { type: String, default: 'CO' },
  nombreConductor: { type: String, default: 'Conductor' },
  noLeidas: { type: Number, default: 0 },
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const configStore = useConfigStore();
const permissionsStore = usePermissionsStore();

const isLoggingOut = ref(false);

async function ejecutarCerrarSesion() {
  if (isLoggingOut.value) return;

  const confirmado = await confirmLogout();
  if (!confirmado) return;

  isLoggingOut.value = true;
  configStore.setLoading(true, 'Cerrando sesión...');

  try {
    await authStore.logout({ redirect: true });
  } catch (error) {
    isLoggingOut.value = false;
    configStore.setLoading(false);
    logger.error('Error al cerrar sesión desde vista móvil:', error);
  }
}

onMounted(() => {
  document.body.classList.add('mobile-conductor-active');
  const container = document.querySelector('[data-layout]');
  if (container) {
    container.classList.add('mobile-full-width');
  }
});

onUnmounted(() => {
  document.body.classList.remove('mobile-conductor-active');
  const container = document.querySelector('[data-layout]');
  if (container) {
    container.classList.remove('mobile-full-width');
  }
});

const tieneNoLeidas = computed(() => Number(props.noLeidas) > 0);

const esInicio = computed(() => {
  return route.path === '/dashboard' || route.path === '/dashboard/conductor';
});

const tituloActual = computed(() => {
  const p = route.path;
  if (p.includes('/inspeccion-vehiculos/crear')) return 'Nueva Inspección';
  if (p.includes('/inspeccion-vehiculos/editar')) return 'Editar Inspección';
  if (p.includes('/inspeccion-vehiculos')) return 'Inspecciones';

  if (p.includes('/planillas-de-control-de-servicios/crear')) return 'Nueva Planilla';
  if (p.includes('/planillas-de-control-de-servicios/editar')) return 'Editar Planilla';
  if (p.includes('/planillas-de-control-de-servicios')) return 'Planillas de Control';

  if (p.includes('/planilla-de-control-de-prestacion-servicios/control-de-servicios')) return 'Control en Ruta';
  if (p.includes('/planilla-de-control-de-prestacion-servicios/crear')) return 'Nuevo Control';
  if (p.includes('/planilla-de-control-de-prestacion-servicios')) return 'Control de Servicio';

  if (p.includes('/extracto-de-contrato/crear')) return 'Nuevo FUEC';
  if (p.includes('/extracto-de-contrato/perfil')) return 'FUEC · En Ruta';
  if (p.includes('/extracto-de-contrato')) return 'Mis FUECs';

  if (p.includes('/vehiculos')) return 'Mis Vehículos';
  if (p.includes('/profile')) return 'Mi Perfil';
  if (p.includes('/notificaciones')) return 'Notificaciones';

  return route.meta?.title || 'NOA Transportes';
});

function irAtras() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/dashboard');
  }
}

// ── ACCESOS INFERIORES CONDICIONADOS POR PERMISOS DEL ROL CONDUCTOR ──────────
const items = computed(() => {
  const lista = [
    { to: '/dashboard', etiqueta: 'Inicio', icono: 'fas fa-home', prefijos: ['/dashboard'] },
  ];

  // 1. Inspecciones Vehiculares (Preoperacional diario)
  if (permissionsStore.hasRole('CONDUCTOR') || permissionsStore.can('vehicle_inspections.index')) {
    lista.push({
      to: '/inspeccion-vehiculos',
      etiqueta: 'Inspección',
      icono: 'fas fa-clipboard-check',
      prefijos: ['/inspeccion-vehiculos'],
    });
  }

  // 2. Control de Servicios en Ruta (PCP - Planillas de prestación de servicio)
  if (permissionsStore.hasRole('CONDUCTOR') || permissionsStore.can('service_delivery_control_sheets.index')) {
    lista.push({
      to: '/planilla-de-control-de-prestacion-servicios/control-de-servicios',
      etiqueta: 'Servicios',
      icono: 'fas fa-route',
      prefijos: ['/planilla-de-control-de-prestacion-servicios'],
    });
  } else if (permissionsStore.can('control_sheets.index')) {
    // Si no tiene PCP pero sí planillas de control
    lista.push({
      to: '/planillas-de-control-de-servicios',
      etiqueta: 'Planillas',
      icono: 'fas fa-clipboard-list',
      prefijos: ['/planillas-de-control-de-servicios'],
    });
  }

  // 3. Perfil del conductor (credenciales, licencia y configuración)
  lista.push({
    to: '/profile',
    etiqueta: 'Perfil',
    icono: 'fas fa-user',
    prefijos: ['/profile'],
  });

  return lista;
});

function esActiva(item) {
  if (item.to === '/dashboard') return route.path === '/dashboard' || route.path === '/dashboard/conductor';
  return item.prefijos.some((prefijo) => route.path.startsWith(prefijo));
}
</script>

<style scoped>
.mobile-skip-link {
  position: absolute;
  top: -48px;
  left: 12px;
  z-index: 2000;
  background: #0f172a;
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  text-decoration: none;
}
.mobile-skip-link:focus-visible {
  top: 12px;
  outline: 2px solid #2c7be5;
  outline-offset: 2px;
}
.mobile-shell {
  min-height: 100dvh;
  width: 100% !important;
  max-width: 100vw !important;
  display: flex;
  flex-direction: column;
  background: #f0f3f8;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box;
}
/* Status bar + notch Android: viewport-fit=cover ya está en index.html */
.mobile-topnav {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100% !important;
  background: #0c2461;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: env(safe-area-inset-top);
  padding-left: calc(14px + env(safe-area-inset-left));
  padding-right: calc(14px + env(safe-area-inset-right));
  padding-bottom: 14px;
  box-sizing: border-box;
}
.mobile-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mobile-logo-wrap {
  width: 36px;
  height: 36px;
  background: #ffffff;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}
.mobile-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.mobile-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.mobile-brand-text strong {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff !important;
  letter-spacing: 0.02em;
}
.mobile-brand-text small {
  font-size: 10.5px;
  color: #e0f2fe !important;
  font-weight: 600;
}
.mobile-subnav {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}
.mobile-back-btn {
  width: 34px;
  height: 34px;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s ease;
}
.mobile-back-btn:active {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(0.95);
}
.mobile-page-header {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.mobile-page-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}
.mobile-page-sub {
  font-size: 10px;
  color: #93c5fd;
  line-height: 1.2;
}
.mobile-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  padding: 3px 4px 3px 5px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
.mobile-bell {
  width: 32px;
  height: 32px;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-decoration: none !important;
  border: none !important;
  outline: none !important;
  overflow: visible;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s ease;
}
.mobile-bell:active {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(0.95);
}
.mobile-bell i {
  font-size: 14px;
}
.mobile-bell-dot {
  position: absolute;
  top: 4px;
  right: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50% !important;
  background: #f97316;
  border: 1.5px solid #0c2461;
}
.mobile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none !important;
  border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
  outline: none !important;
  overflow: hidden !important;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s ease;
}
.mobile-avatar:active {
  transform: scale(0.95);
  opacity: 0.9;
}
.mobile-logout {
  width: 32px;
  height: 32px;
  border-radius: 50% !important;
  background: rgba(239, 68, 68, 0.22);
  color: #fee2e2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(248, 113, 113, 0.45) !important;
  outline: none !important;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.mobile-logout:active {
  background: rgba(239, 68, 68, 0.45);
  transform: scale(0.95);
}
.mobile-logout:disabled {
  opacity: 0.6;
  pointer-events: none;
}
.mobile-logout i {
  font-size: 13px;
}
.mobile-scroll {
  flex: 1;
  width: 100% !important;
  max-width: 100vw !important;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
  padding-left: 0 !important;
  padding-right: 0 !important;
  box-sizing: border-box;
}
.mobile-scroll:focus {
  outline: none;
}
.mobile-scroll:focus-visible {
  outline: 2px solid #2c7be5;
  outline-offset: -2px;
}
.mobile-bottomnav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 4px 12px;
  font-size: var(--noa-text-meta);
  font-weight: 600;
  color: var(--noa-ink-soft);
  text-decoration: none;
  position: relative;
  min-height: 56px;
}
.mobile-nav-item i {
  font-size: 24px;
}
.mobile-nav-item.is-active {
  color: var(--noa-action);
}
.mobile-nav-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--noa-action);
}

/* ── ADAPTACIÓN DE VISTAS Y FORMULARIOS OPERATIVOS EN MÓVIL ────────── */
:deep(.breadcrumb) {
  display: none !important;
}
:deep(.bg-holder) {
  display: none !important;
}
:deep(.card) {
  border-radius: 16px !important;
  border: 1px solid rgba(226, 232, 240, 0.7) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03) !important;
}
:deep(.card-header) {
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  background-color: #f8fafc !important;
  font-weight: 600;
  font-size: 13px;
}
:deep(.form-control),
:deep(.form-select),
:deep(.p-select) {
  border-radius: 10px !important;
  min-height: 42px;
  font-size: 13px !important;
  border-color: #cbd5e1;
}
:deep(.form-label) {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}
:deep(.btn) {
  border-radius: 10px;
  min-height: 40px;
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* ── REGLAS GLOBALES DE ANCHO COMPLETO EN MÓVIL ────────── */
:global(body.mobile-conductor-active) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
}
:global(body.mobile-conductor-active .main),
:global(body.mobile-conductor-active [data-layout="container"]),
:global(body.mobile-conductor-active .container),
:global(body.mobile-conductor-active .container-fluid),
:global(body.mobile-conductor-active #app) {
  width: 100% !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}
:global(.mobile-full-width) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  max-width: 100vw !important;
  width: 100% !important;
}
:global(body.mobile-conductor-active section) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
:global(body.mobile-conductor-active a.mc-btn-primary),
:global(body.mobile-conductor-active button.mc-btn-primary),
:global(body.mobile-conductor-active .mc-btn-primary) {
  color: #ffffff !important;
  text-decoration: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .mobile-shell * {
    animation: none;
    transition: none;
  }
}
</style>
