<template>
  <div class="login-screen">
    <div class="login-app">
      <!-- Hero de marca -->
      <div class="hero">
        <div class="hero-inner">
          <div class="brand">
            <span class="brand-logo" aria-hidden="true">
              <img src="/noa.svg" alt="" />
            </span>
            <span class="brand-texts">
              <span class="brand-name">NOA</span>
              <span class="brand-sub">Transportes</span>
            </span>
          </div>

          <span class="hero-badge">
            <span class="hero-badge-dot" aria-hidden="true"></span>Portal Conductor
          </span>

          <p class="hero-tagline">Plataforma de gestión para flotas — eficiencia y control en ruta</p>
        </div>
      </div>

      <!-- Tarjeta de acceso -->
      <div class="form-card">
        <div class="form-title">Iniciar sesión</div>
        <div class="form-sub">Accede para gestionar tu flota y turno operativo</div>
        <div class="form-divider" aria-hidden="true"></div>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="field">
            <label class="field-label" for="login-email-mobile">Correo o número de documento</label>
            <div class="input-wrap" :class="{ 'input-error': errors.email }">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                id="login-email-mobile"
                class="login-input"
                type="text"
                autocomplete="username"
                placeholder="nombre@empresa.com o documento"
                v-model="formData.email"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'login-email-mobile-error' : undefined"
              >
            </div>
            <span v-if="errors.email" id="login-email-mobile-error" class="field-error" role="alert">{{ errors.email }}</span>
            <p v-else class="field-help">Ingresa tu cédula colombiana o correo institucional</p>
          </div>

          <div class="field">
            <label class="field-label" for="login-password-mobile">Contraseña</label>
            <div class="input-wrap" :class="{ 'input-error': errors.password }">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input
                id="login-password-mobile"
                class="login-input"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                v-model="formData.password"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'login-password-mobile-error' : undefined"
              >
              <button
                type="button"
                class="eye-btn"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="23" x2="23" y2="1"/></svg>
              </button>
            </div>
            <span v-if="errors.password" id="login-password-mobile-error" class="field-error" role="alert">{{ errors.password }}</span>
          </div>

          <div v-if="loginError" class="alert-error" role="alert">{{ loginError }}</div>

          <button class="btn-login" type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="btn-spinner" aria-hidden="true"></span>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
            {{ isSubmitting ? 'Accediendo...' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="terms">
          Al ingresar aceptas los
          <button type="button" class="terms-link" @click="handleLegal('Términos y Condiciones')">Términos y Condiciones</button><br>y la
          <button type="button" class="terms-link" @click="handleLegal('Política de Privacidad')">Política de Privacidad</button>
        </div>
      </div>

      <div class="bottom-pad" aria-hidden="true"></div>
    </div>
  </div>
</template>

<script setup>
/**
 * Login móvil (Android nativo / Capacitor).
 * Diseño según mockup NOA-Transportes—Login-Mockup-Android.
 * Solo se muestra cuando Capacitor.isNativePlatform() es true.
 * @author Darwin Montes
 * @version 2.0.0
 * @module {Features.Auth.Components}
 * @resource {Session}
 */
import { useLogin } from '../composables/useLogin.js';
import { usePantallaCompleta } from '@/hooks/usePantallaCompleta.js';
import { toast } from '@/utils/toast.js';

const { formData, errors, isSubmitting, showPassword, loginError, handleLogin } = useLogin();

/** Ancho completo del teléfono (hook compartido con el shell del conductor). */
usePantallaCompleta();

/**
 * Documentos legales aún no publicados en la app: se informa sin romper el flujo.
 * @param {string} nombre - Nombre del documento solicitado.
 */
const handleLegal = (nombre) => {
  toast(nombre, 'El documento aún no está disponible en esta versión.', 'info');
};

</script>

<style scoped>
.login-screen {
  font-family: var(--noa-font);
  background: var(--noa-fondo);
  min-height: 100dvh;
  width: 100%;
  display: flex;
  justify-content: center;
}
.login-app {
  width: min(480px, 100%);
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

/* ── Hero ── */
.hero {
  background: var(--noa-hero);
  padding: calc(20px + env(safe-area-inset-top)) 24px 44px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.hero::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56,130,246,.2) 0%, transparent 70%);
}
.hero::after {
  content: '';
  position: absolute;
  bottom: 10px; left: -40px;
  width: 150px; height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,205,.15) 0%, transparent 70%);
}
.hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-logo {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: var(--noa-card);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .25);
  flex-shrink: 0;
}
.brand-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.brand-texts {
  display: flex;
  flex-direction: column;
  line-height: 1;
  text-align: left;
}
.brand-name {
  font-size: 26px;
  font-weight: 800;
  color: var(--noa-on-primary);
  letter-spacing: -.02em;
}
.brand-sub {
  font-size: var(--noa-text-meta);
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--noa-tertiary-fixed, #7dd3fc);
  margin-top: 2px;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--noa-radius-full);
  background: rgba(255, 255, 255, .12);
  border: 1px solid rgba(255, 255, 255, .18);
  font-size: var(--noa-text-meta);
  font-weight: 600;
  color: rgba(255, 255, 255, .92);
}
.hero-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--noa-live);
}
.hero-tagline {
  font-size: var(--noa-text-body);
  color: rgba(255,255,255,.82);
  text-align: center;
  line-height: 1.5;
  max-width: 260px;
  margin: 0;
}

/* ── Form card ── */
/* Hoja a sangre completa, esquinas superiores curvas (estilo Stitch). */
.form-card {
  background: var(--noa-card);
  margin: -24px 0 0;
  border-radius: var(--noa-radius-xl) var(--noa-radius-xl) 0 0;
  padding: 28px 22px calc(24px + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 30px rgba(12, 36, 97, .12);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}
.form-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--noa-primary-container);
  letter-spacing: -.5px;
  margin-bottom: 4px;
}
.form-sub {
  font-size: var(--noa-text-body);
  color: var(--noa-ink-soft);
  margin-bottom: 24px;
  line-height: 1.4;
}
.form-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--noa-line-soft), transparent);
  margin-bottom: 22px;
}

/* ── Campos ── */
.field { margin-bottom: 18px; }
.field-label {
  font-size: var(--noa-text-body);
  font-weight: 700;
  color: var(--noa-ink-form);
  margin-bottom: 8px;
  display: block;
}
.field-help {
  font-size: var(--noa-text-meta);
  color: var(--noa-ink-soft);
  margin: 6px 0 0;
  line-height: 1.4;
}
.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: var(--noa-input-min);
  background: var(--noa-campo);
  border: 1.5px solid var(--noa-line-soft);
  border-radius: 14px;
  padding: 13px 14px;
  transition: border-color .2s, background-color .2s, box-shadow .2s;
}
.input-wrap:focus-within {
  border-color: var(--noa-enfoque);
  background: var(--noa-card);
  box-shadow: 0 0 0 3px rgba(59,130,246,.1);
}
.input-wrap.input-error {
  border-color: var(--noa-error-vivo);
  background: var(--noa-error-fondo);
}
.input-wrap svg {
  width: 17px; height: 17px;
  stroke: var(--noa-muted);
  flex-shrink: 0;
}
.login-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--noa-text-title);
  font-family: inherit;
  color: var(--noa-ink-form);
  padding: 0;
}
.login-input::placeholder { color: var(--noa-muted); }
.eye-btn {
  background: none;
  border: none;
  padding: 0;
  min-width: var(--noa-touch-min);
  min-height: var(--noa-touch-min);
  margin: -10px -10px -10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: inherit;
}
.eye-btn svg { stroke: var(--noa-muted); }
.eye-btn:focus-visible, .btn-login:focus-visible,
.terms-link:focus-visible {
  outline: 2px solid var(--noa-enfoque);
  outline-offset: 2px;
}
.field-error {
  display: block;
  font-size: var(--noa-text-meta);
  color: var(--noa-error-vivo);
  margin-top: 6px;
}
.alert-error {
  background: var(--noa-error-fondo);
  border: 1px solid var(--noa-error-borde);
  color: var(--noa-error-texto);
  font-size: var(--noa-text-body);
  padding: 10px 12px;
  border-radius: 12px;
  margin-bottom: 14px;
}

/* ── CTA ── */
.btn-login {
  width: 100%;
  min-height: var(--noa-touch-cta);
  padding: 15px;
  background: var(--noa-cta);
  border: none;
  border-radius: 14px;
  font-size: var(--noa-text-body);
  font-weight: 700;
  font-family: inherit;
  color: var(--noa-on-primary);
  letter-spacing: .02em;
  cursor: pointer;
  margin-top: 6px;
  box-shadow:
    0 4px 14px rgba(37,99,235,.4),
    0 1px 3px rgba(37,99,235,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}
.btn-login::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
  transform: skewX(-20deg);
}
.btn-login svg { width: 17px; height: 17px; stroke: var(--noa-on-primary); flex-shrink: 0; }
.btn-login:disabled { opacity: .75; cursor: not-allowed; }
.btn-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: var(--noa-on-primary);
  border-radius: 50%;
  animation: login-spin .7s linear infinite;
}
@keyframes login-spin { to { transform: rotate(360deg); } }

/* ── Términos ── */
.terms {
  text-align: center;
  font-size: var(--noa-text-meta);
  color: var(--noa-ink-soft);
  margin-top: 18px;
  line-height: 1.5;
}
.terms-link {
  color: var(--noa-enfoque);
  font-weight: 600;
  font-size: inherit;
  font-family: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.bottom-pad {
  height: 28px;
  background: var(--noa-fondo);
  flex-shrink: 0;
  flex-grow: 1;
}

@media (prefers-reduced-motion: reduce) {
  .btn-spinner { animation: none; }
  .input-wrap { transition: none; }
}
</style>
