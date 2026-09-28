<template>
  <div class="login-screen">
    <div class="login-app">
      <!-- Hero de marca -->
      <div class="hero">
        <div class="hero-inner">
          <div class="logo-area">
            <img :src="logoUrl" alt="NOA Transportes" class="logo-img" width="1010" height="270" fetchpriority="high" decoding="async" />
          </div>

          <div class="hero-pills" aria-hidden="true">
            <span class="pill pill-erp">ERP</span>
            <span class="pill pill-seg">Seguro</span>
            <span class="pill pill-cloud">Cloud</span>
          </div>

          <p class="hero-tagline">Plataforma de gestión para flotas — eficiencia y control en un solo lugar</p>
        </div>
        <div class="hero-deco" aria-hidden="true"></div>
      </div>

      <!-- Tarjeta de acceso -->
      <div class="form-card">
        <div class="form-title">Iniciar sesión</div>
        <div class="form-sub">Accede para gestionar tu flota</div>
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
          </div>

          <div class="field">
            <div class="field-label field-label-row">
              <label for="login-password-mobile">Contraseña</label>
              <button
                type="button"
                class="forgot"
                disabled
                aria-disabled="true"
                title="Recuperación de contraseña no disponible por el momento"
              >¿Olvidaste tu contraseña?</button>
            </div>
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

        <div class="biometric-row" aria-hidden="true">
          <div class="bio-divider"></div>
          <span class="bio-text">o continúa con</span>
          <div class="bio-divider"></div>
        </div>

        <button class="bio-btn" type="button" @click="handleBiometric">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
          Acceso biométrico
        </button>

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
import { toast } from '@/utils/toast.js';
import logoUrl from '@/assets/logo.svg';

const { formData, errors, isSubmitting, showPassword, loginError, handleLogin } = useLogin();

/**
 * Acceso biométrico aún no disponible en esta versión: se informa sin romper el flujo.
 */
const handleBiometric = () => {
  toast('Acceso biométrico', 'El acceso con huella aún no está disponible en esta versión.', 'info');
};

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
  font-family: 'Inter', system-ui, sans-serif;
  background: #eef2f9;
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
  background: linear-gradient(160deg, #0c1f4a 0%, #0e2d6b 45%, #1a4db8 100%);
  padding: 28px 28px 44px;
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
.hero-deco {
  position: absolute;
  bottom: -1px; left: 0; right: 0;
  height: 36px;
  background: #eef2f9;
  clip-path: ellipse(60% 100% at 50% 100%);
}
.hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo-img {
  width: min(220px, 72%);
  height: auto;
  display: block;
  filter: drop-shadow(0 2px 16px rgba(0,0,0,.35));
}
.hero-pills {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.pill {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: .03em;
  backdrop-filter: blur(8px);
}
.pill-erp  { background: rgba(255,255,255,.12); color: #bfdbfe; border: 1px solid rgba(255,255,255,.15); }
.pill-seg  { background: rgba(34,197,94,.15);  color: #86efac; border: 1px solid rgba(34,197,94,.25); }
.pill-cloud{ background: rgba(56,189,248,.15); color: #7dd3fc; border: 1px solid rgba(56,189,248,.25); }
.hero-tagline {
  font-size: 13px;
  color: rgba(255,255,255,.45);
  text-align: center;
  line-height: 1.5;
  max-width: 240px;
  margin: 0;
}

/* ── Form card ── */
.form-card {
  background: #fff;
  margin: -4px 16px 0;
  border-radius: 24px;
  padding: 28px 22px 24px;
  box-shadow:
    0 8px 32px rgba(14,45,107,.12),
    0 1px 4px rgba(14,45,107,.08);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}
.form-title {
  font-size: 22px;
  font-weight: 800;
  color: #0c1f4a;
  letter-spacing: -.5px;
  margin-bottom: 4px;
}
.form-sub {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 24px;
  line-height: 1.4;
}
.form-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
  margin-bottom: 22px;
}

/* ── Campos ── */
.field { margin-bottom: 18px; }
.field-label {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  display: block;
}
.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.field-label-row label { margin: 0; }
.forgot {
  font-size: 11px;
  font-weight: 600;
  color: #3b82f6;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
}
.forgot:disabled { cursor: not-allowed; opacity: .8; }
.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 13px 14px;
  transition: border-color .2s, background-color .2s, box-shadow .2s;
}
.input-wrap:focus-within {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59,130,246,.1);
}
.input-wrap.input-error {
  border-color: #e5484d;
  background: #fef4f4;
}
.input-wrap svg {
  width: 17px; height: 17px;
  stroke: #94a3b8;
  flex-shrink: 0;
}
.login-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13.5px;
  font-family: inherit;
  color: #1e293b;
  padding: 0;
}
.login-input::placeholder { color: #94a3b8; }
.eye-btn {
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-family: inherit;
}
.eye-btn svg { stroke: #cbd5e1; }
.eye-btn:focus-visible, .forgot:focus-visible, .btn-login:focus-visible,
.bio-btn:focus-visible, .terms-link:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
.field-error {
  display: block;
  font-size: 12px;
  color: #e5484d;
  margin-top: 6px;
}
.alert-error {
  background: #fef4f4;
  border: 1px solid #f4b8ba;
  color: #c2222a;
  font-size: 13px;
  padding: 10px 12px;
  border-radius: 12px;
  margin-bottom: 14px;
}

/* ── CTA ── */
.btn-login {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  color: #fff;
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
.btn-login svg { width: 17px; height: 17px; stroke: #fff; flex-shrink: 0; }
.btn-login:disabled { opacity: .75; cursor: not-allowed; }
.btn-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin .7s linear infinite;
}
@keyframes login-spin { to { transform: rotate(360deg); } }

/* ── Biométrico ── */
.biometric-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
.bio-divider { flex: 1; height: 1px; background: #e2e8f0; }
.bio-text { font-size: 11px; color: #cbd5e1; white-space: nowrap; }
.bio-btn {
  width: 100%;
  padding: 12px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}
.bio-btn svg { width: 18px; height: 18px; stroke: #475569; flex-shrink: 0; }

/* ── Términos ── */
.terms {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 18px;
  line-height: 1.5;
}
.terms-link {
  color: #3b82f6;
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
  background: #eef2f9;
  flex-shrink: 0;
  flex-grow: 1;
}

@media (prefers-reduced-motion: reduce) {
  .btn-spinner { animation: none; }
  .input-wrap { transition: none; }
}
</style>
