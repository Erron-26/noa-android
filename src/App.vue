<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import DashboardLayout from '@/components/DashboardLayout.vue';
import { useNotificationsStore } from '@/features/notifications/store/notifications.store.js';
import { useConfigStore } from '@/store/modules/config.js';
import Noatspinner from '@/components/Noatspinner.vue';
import NavProgressBar from '@/components/NavProgressBar.vue';
import { useAuthStore } from '@/store/modules/auth.js';
import { useVersionUpdateStore } from '@/features/versionUpdate/store/versionUpdate.store.js';
import VersionUpdateBanner from '@/components/VersionUpdateBanner.vue';
import VersionUpdateModal from '@/components/VersionUpdateModal.vue';

// El modal de actualización solo aplica en la app Android nativa.
// En web (navegador) no se muestra — el banner ya cubre ese caso.
const isNative = Capacitor.isNativePlatform();

const route = useRoute();
const notificationsStore = useNotificationsStore();
const configStore = useConfigStore();
const versionUpdateStore = useVersionUpdateStore();

const showVersionBanner = computed(() => {
  if (!isNative) return false;
  if (route.path === '/login') return false;
  if (configStore.isAppLoading) return false;
  return versionUpdateStore.shouldOffer;
});

const layoutComponent = computed(() => {
  if (route.meta?.layout === 'dashboard') {
    return DashboardLayout;
  }
  return null;
});

onMounted(() => {
  // Marca Android nativo para CSS responsive solo en app (.is-android).
  // En web/desktop no se añade: los modales quedan intactos.
  try {
    if (isNative) document.body.classList.add('is-android');
    else document.body.classList.remove('is-android');
  } catch {
    /* DOM no disponible: no bloquea el arranque */
  }
  notificationsStore.startExpiryAlertInterval();
  // Check de nueva versión al abrir: forzado (sin throttle) para avisar
  // de una vez, incluso sin iniciar sesión. Si falla la red, el store
  // reutiliza el último aviso cacheado. Silencioso si no hay update.
  versionUpdateStore.check({ force: true });
});

onUnmounted(() => {
  notificationsStore.stopExpiryAlertInterval();
});

/* ─── Auto-sync notificaciones tras guardar formularios ─── */
const FORM_ROUTES = ['/crear', '/editar', '/nuevo'];

watch(() => route.path, (newPath, oldPath) => {
  // Apagar el spinner de cierre de sesión de forma segura:
  // LoginView.vue se encarga en su onMounted de apagarlo cuando ya está pintado en pantalla.
  // Aquí dejamos un temporizador de seguridad como respaldo para evitar bucles infinitos.
  if (newPath === '/login') {
    setTimeout(() => {
      configStore.setLoading(false);
    }, 600);
    return;
  }
  if (newPath === '/dashboard') {
    configStore.setLoading(false);
  }

  const fromForm = FORM_ROUTES.some(seg => oldPath?.includes(seg));
  const toNonForm = !FORM_ROUTES.some(seg => newPath?.includes(seg));

  if (fromForm && toNonForm) {
    setTimeout(() => {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated) {
            notificationsStore.requestSync();
        }
    }, 800);
  }
});

const getAvatarClass = (type) => {
    switch (type) {
        case 'VEHICLE_DOCUMENT': return 'bg-subtle-info text-info'
        case 'OPERATION_CARD': return 'bg-subtle-warning text-warning'
        case 'DRIVER_LICENSE': return 'bg-subtle-success text-success'
        case 'FIRST_RTM': return 'bg-subtle-danger text-danger'
        case 'AGREEMENT': return 'bg-subtle-primary text-primary'
        case 'AFFILIATE_CHARGE': return 'bg-subtle-success text-success'
        case 'SOCIAL_SECURITY_MORA': return 'bg-subtle-danger text-danger'
        default: return 'bg-subtle-secondary text-secondary'
    }
}

const getInitialsLabel = (type) => {
    switch (type) {
        case 'VEHICLE_DOCUMENT': return 'DV'
        case 'OPERATION_CARD': return 'TO'
        case 'DRIVER_LICENSE': return 'LC'
        case 'FIRST_RTM': return 'RT'
        case 'AGREEMENT': return 'CO'
        case 'AFFILIATE_CHARGE': return 'CA'
        case 'SOCIAL_SECURITY_MORA': return 'SS'
        default: return 'AL'
    }
}
</script>

<template>
  <!-- Barra de progreso de navegación entre rutas (NProgress-style) -->
  <NavProgressBar />

  <Transition name="fade">
    <Noatspinner v-if="configStore.isAppLoading" :message="configStore.loadingMessage" />
  </Transition>

  <component :is="layoutComponent" v-if="layoutComponent">
    <router-view />
  </component>
  <router-view v-else />

  <!-- Alerta de nueva versión (web y Android): no intrusiva, oculta en /login -->
  <VersionUpdateBanner v-if="showVersionBanner" />

  <!-- Modal de nueva versión: SOLO en app Android nativa (Capacitor).
       En web el VersionUpdateBanner ya informa sin ser intrusivo. -->
  <VersionUpdateModal v-if="isNative" />

  <!-- Alertas temporales transitorias; el conteo persistente vive en los clumps del Navbar -->
  <div class="expiry-notifications-hub">
    <TransitionGroup name="toast-fade" tag="div" class="expiry-toast-stack">
      <div v-for="toast in notificationsStore.activeExpiryToasts" :key="toast.id"
        class="expiry-toast-item shadow-lg p-3 rounded bg-white border d-flex align-items-start"
        :class="{ 'expiry-toast-item--priority': toast.priority === 'PRIORITARIA' }"
        role="status"
        @mouseenter="notificationsStore.pauseExpiryToastTimer(toast.id)"
        @mouseleave="notificationsStore.resumeExpiryToastTimer(toast.id)"
        @focusin="notificationsStore.pauseExpiryToastTimer(toast.id)"
        @focusout="notificationsStore.resumeExpiryToastTimer(toast.id)">
        <div class="toast-avatar me-3">
          <div class="avatar avatar-xl">
            <div class="avatar-name rounded-circle d-flex align-items-center justify-content-center fw-bold fs-11"
              :class="getAvatarClass(toast.type)">
              <span>{{ getInitialsLabel(toast.type) }}</span>
            </div>
          </div>
        </div>
        <div class="toast-body flex-grow-1 min-w-0">
          <div class="d-flex justify-content-between align-items-baseline mb-1">
            <h6 class="toast-title mb-0 fs-11 text-900 fw-bold text-truncate pe-2">
              {{ toast.title }}
            </h6>
            <span v-if="toast.priority === 'PRIORITARIA'" class="fs-10 text-white fw-bold flex-shrink-0 priority-toast-badge">
              EMPRESA
            </span>
            <span v-else class="fs-10 text-danger fw-bold flex-shrink-0 animate-pulse">
              ¡VENCE HOY!
            </span>
          </div>
          <p class="toast-message mb-0 text-700 fs-10" style="line-height: 1.4;">
            {{ toast.message }}
          </p>
          <small class="text-500 fs-11 mt-1 d-block">
            <i class="far fa-clock me-1" aria-hidden="true"></i>{{ toast.created_at }}
          </small>
        </div>
        <button
          type="button"
          class="expiry-toast-close"
          title="Cerrar notificación"
          aria-label="Cerrar notificación"
          @click.stop="notificationsStore.dismissExpiryToast(toast.id)"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
/* Centro de alertas: anclado con z-index superior para visibilidad garantizada */
.expiry-notifications-hub {
  position: fixed;
  top: 68px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  width: min(360px, calc(100vw - 28px));
  pointer-events: none;
}

.expiry-notifications-hub > * {
  pointer-events: auto;
}

.expiry-toast-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.expiry-toast-item {
  width: 100%;
  pointer-events: auto;
  background-color: #ffffff;
  border-radius: 14px !important;
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
  border-left: 4px solid #ef4444 !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

/* Prioritarias: diferencia visual clara sobre las normales */
.expiry-toast-item--priority {
  border: 1px solid var(--bs-danger) !important;
  border-left: 5px solid var(--bs-danger) !important;
  background-color: #fff5f5 !important;
}

.dark .expiry-toast-item--priority {
  background-color: #2a1518 !important;
  border-color: var(--bs-danger) !important;
  border-left-color: var(--bs-danger) !important;
}

.priority-toast-badge {
  background-color: var(--bs-danger);
  border-radius: 999px;
  padding: 2px 8px;
  letter-spacing: 0.04em;
}

.dark .expiry-toast-item {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  border-left-color: #ef4444 !important;
}

.expiry-toast-close {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  padding: 0;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.expiry-toast-close:hover,
.expiry-toast-close:active {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
  transform: scale(1.05);
}

.dark .expiry-toast-close {
  background: #334155;
  border-color: #475569;
  color: #cbd5e1;
}

.dark .expiry-toast-close:hover,
.dark .expiry-toast-close:active {
  background: #7f1d1d;
  border-color: #991b1b;
  color: #fecaca;
}

@media (max-width: 576px) {
  .expiry-notifications-hub {
    top: calc(64px + env(safe-area-inset-top));
    left: 12px;
    right: 12px;
    width: auto;
    max-width: 100%;
    align-items: stretch;
  }
  .expiry-toast-item {
    border-radius: 14px !important;
    padding: 12px !important;
  }
  .expiry-toast-close {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    font-size: 16px;
  }
}

/* Animaciones y Transiciones de Vue */
.toast-fade-enter-active {
  animation: toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-fade-leave-active {
  position: absolute;
  width: 100%;
  transition: all 0.3s ease;
}
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

@keyframes toast-slide-in {
  0% {
    opacity: 0;
    transform: translateX(120px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .toast-fade-enter-active,
  .toast-fade-leave-active,
  .animate-pulse,
  .toast-slide-in,
  .toast-slide-out,
  .fade-enter-active,
  .fade-leave-active {
    animation: none;
    transition: none;
  }
}

/* ────────────────────────────────────────────────────────
   SweetAlert2 Thin Toast Styles (Custom)
──────────────────────────────────────────────────────── */
.toast-thin {
    padding: 0.5rem 0.9rem !important;
    min-height: auto !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, .12) !important;
}

.toast-thin .swal2-title {
    font-size: 0.85rem !important;
    font-weight: 500 !important;
    margin: 0 !important;
    padding: 0 0.4rem !important;
}

.toast-thin .swal2-icon {
    width: 1.6rem !important;
    height: 1.6rem !important;
    margin: 0 0.3rem 0 0 !important;
}

.toast-thin .swal2-icon .swal2-icon-content {
    font-size: 1rem !important;
}

.toast-thin .swal2-html-container {
    margin: 0 !important;
}

.toast-thin-bar {
    height: 2px !important;
}

@keyframes toastSlideIn {
    from {
        transform: translateX(40px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes toastSlideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(40px);
        opacity: 0;
    }
}

.toast-slide-in {
    animation: toastSlideIn .25s ease-out;
}

.toast-slide-out {
    animation: toastSlideOut .2s ease-in;
}
</style>
