<template>
  <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
  <DriverTrackingProvider />
  <!-- Shell móvil solo para conductor en Android nativo (mockup Capacitor) -->
  <MobileConductorLayout
    v-if="esMovilAndroidConductor"
    :iniciales="inicialesConductor"
    :nombre-conductor="nombreConductor"
    :no-leidas="noLeidas"
  >
    <slot>
      <router-view />
    </slot>
  </MobileConductorLayout>
  <template v-else>
    <Sidebar v-if="!shouldHideSidebar" />
    <div class="content" :class="{ 'no-sidebar-content': shouldHideSidebar }">
      <Navbar :hide-sidebar-toggle="shouldHideSidebar" :show-brand="shouldHideSidebar" />
      <main id="main-content" tabindex="-1">
        <slot>
          <router-view />
        </slot>
      </main>
      <Footer />
    </div>
  </template>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'
import MobileConductorLayout from '@/components/layout/MobileConductorLayout.vue'
import DriverTrackingProvider from '@/features/tracking/components/DriverTrackingProvider.vue'
import { useModoConductor } from '@/hooks/useModoConductor.js'
import { iniciales } from '@/features/dashboard/utils/presentacionConductor.js'
import { useNotificationsStore } from '@/features/notifications/store/notifications.store.js'
import { useUserStore } from '@store'

const route = useRoute()
const notificationsStore = useNotificationsStore()
const userStore = useUserStore()
const { movilConductor: esMovilAndroidConductor, dashboardDeConductor: isConductorDashboard } = useModoConductor()

const shouldHideSidebar = computed(() => {
  return Boolean(route.meta?.hideSidebar) || isConductorDashboard.value
})

const nombreConductor = computed(() => userStore.fullName || userStore.username || 'Conductor')

const inicialesConductor = computed(() => iniciales(nombreConductor.value))

const noLeidas = computed(() => notificationsStore.unreadCount || 0)

onMounted(() => {
  var isFluid = true
  if (isFluid) {
    var container = document.querySelector('[data-layout]')
    if (container) {
      container.classList.remove('container')
      container.classList.add('container-fluid')
    }
  }

  var navbarVertical = document.querySelector('.navbar-vertical')
  var navbarTopVertical = document.querySelector('.content .navbar-top')

  if (navbarVertical) navbarVertical.removeAttribute('style')
  if (navbarTopVertical) navbarTopVertical.removeAttribute('style')

  if (window.bootstrap?.Tooltip) {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      new window.bootstrap.Tooltip(el)
    })
  }

  if (typeof window.falconTheme?.init === 'function') {
    window.falconTheme.init()
  }

  const observer = new MutationObserver(() => {
    const newTheme = document.documentElement.getAttribute('data-bs-theme') || 'light'
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }))
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme']
  })
})
</script>

<style scoped>
.skip-link {
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
  transition: top 0.15s ease;
}
.skip-link:focus-visible {
  top: 12px;
  outline: 2px solid #2c7be5;
  outline-offset: 2px;
}
#main-content:focus {
  outline: none;
}
#main-content:focus-visible {
  outline: 2px solid #2c7be5;
  outline-offset: 2px;
}
.no-sidebar-content {
  margin-left: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

@media (min-width: 768px) {
  .no-sidebar-content {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
}
</style>
