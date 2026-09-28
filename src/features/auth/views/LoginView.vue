<template>
  <LoginMobile v-if="mostrarMovil" />
  <LoginDesktop v-else />
</template>

<script setup>
/**
 * Dispatcher del login: móvil (Capacitor nativo) vs desktop (navegador).
 * La lógica de sesión vive en ../composables/useLogin.js y es compartida.
 * @author Darwin Montes
 * @version 2.0.0
 * @module {Features.Auth}
 * @resource {Session}
 */
import { computed } from 'vue';
import { usePlatform } from '@/hooks/usePlatform.js';
import LoginMobile from '../components/LoginMobile.vue';
import LoginDesktop from '../components/LoginDesktop.vue';

const { esNativo } = usePlatform();

/**
 * Override solo para previsualizar en navegador:
 * /?mobile=1#/login → móvil, /?mobile=0#/login → desktop.
 * Sin parámetro se respeta Capacitor.isNativePlatform().
 */
const forzarMovil = computed(() => {
  try {
    return new URLSearchParams(window.location.search).get('mobile');
  } catch {
    return null;
  }
});

const mostrarMovil = computed(() =>
  forzarMovil.value === '1' ? true : forzarMovil.value === '0' ? false : esNativo.value
);
</script>
