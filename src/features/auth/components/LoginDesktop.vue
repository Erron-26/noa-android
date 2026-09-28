<template>
  <div class="login-preview">
    <div class="shape-bg s1"></div>
    <div class="shape-bg s2"></div>
    <div class="shape-bg s3"></div>
    <div class="glass-card">
      <div class="brand-panel">
        <div class="logo-box">
          <img :src="logoUrl" alt="NOA Transportes" class="brand-logo-img" width="1010" height="270" fetchpriority="high" decoding="async" />
        </div>
        <p class="brand-desc">Plataforma de gestión ERP diseñada para eficiencia, seguridad y escalabilidad en tu
          operación logística.</p>
        <div class="brand-badges">
          <span class="badge badge-blue">ERP</span>
          <span class="badge badge-green">Seguro</span>
          <span class="badge badge-sky">Cloud</span>
        </div>
        <div class="brand-terms">Términos y <span class="brand-terms-link" role="note">Condiciones</span></div>
      </div>
      <div class="form-panel">
        <div class="form-head">
          <h1 class="form-title-text">Iniciar Sesión</h1>
          <p class="form-sub">Accede a NOA Transportes para gestionar tu flota</p>
        </div>
        <hr class="divider-line">
        <form class="row g-3" @submit.prevent="handleLogin" novalidate>
          <div class="col-12">
            <div class="fgroup">
              <label class="flabel" for="login-email-desktop">Correo Electrónico o Número de Documento</label>
              <div class="iw">
                <i class="fas fa-envelope iico" aria-hidden="true"></i>
                <input
                  id="login-email-desktop"
                  class="finput"
                  :class="{ 'finput-error': errors.email }"
                  type="text"
                  autocomplete="username"
                  placeholder="nombre@empresa.com o documento"
                  v-model="formData.email"
                  :aria-invalid="!!errors.email"
                  :aria-describedby="errors.email ? 'login-email-desktop-error' : undefined"
                >
              </div>
              <span v-if="errors.email" id="login-email-desktop-error" class="ferror" role="alert">{{ errors.email }}</span>
            </div>
          </div>
          <div class="col-12">
            <div class="fgroup">
              <div class="flabel-row">
                <label class="flabel" for="login-password-desktop">Contraseña</label>
                <span class="flink flink-disabled" aria-disabled="true" title="Recuperación de contraseña no disponible por el momento">¿Olvidaste tu contraseña?</span>
              </div>
              <div class="iw">
                <i class="fas fa-lock iico" aria-hidden="true"></i>
                <input
                  id="login-password-desktop"
                  class="finput finput-pw"
                  :class="{ 'finput-error': errors.password }"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  v-model="formData.password"
                  :aria-invalid="!!errors.password"
                  :aria-describedby="errors.password ? 'login-password-desktop-error' : undefined"
                >
                <button
                  type="button"
                  class="pw-toggle"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" aria-hidden="true"></i>
                </button>
              </div>
              <span v-if="errors.password" id="login-password-desktop-error" class="ferror" role="alert">{{ errors.password }}</span>
            </div>
          </div>
          <div v-if="loginError" class="col-12">
            <div class="alert-error" role="alert">{{ loginError }}</div>
          </div>
          <div class="col-12">
            <button class="btn-main" type="submit" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="btn-spinner" aria-hidden="true"></span>
              {{ isSubmitting ? 'Accediendo...' : 'Iniciar sesión' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Login desktop / web (navegador).
 * Se muestra cuando NO es plataforma nativa Capacitor.
 * Sin acceso biométrico (solo móvil).
 * @author Darwin Montes
 * @version 2.0.0
 * @module {Features.Auth.Components}
 * @resource {Session}
 */
import { useLogin } from '../composables/useLogin.js';
import logoUrl from '@/assets/logo.svg';

const { formData, errors, isSubmitting, showPassword, loginError, handleLogin } = useLogin();
</script>

<style scoped>
.login-preview{font-family:'Outfit',sans-serif;--primary:#2c7be5;--primary-dark:#1a68d1;--accent:#00d27a;--sky:#00d2f4;background:linear-gradient(135deg,#f0f6ff 0%,#ffffff 50%,#f1f5f9 100%);border-radius:0;padding:clamp(1rem,4vw,3rem);min-height:100dvh;width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.shape-bg{position:absolute;border-radius:50%;filter:blur(50px);pointer-events:none;}
.s1{width:22%;min-width:180px;aspect-ratio:1;background:rgba(44,123,229,0.12);top:-6%;right:-4%;}
.s2{width:18%;min-width:150px;aspect-ratio:1;background:rgba(0,210,122,0.09);bottom:-5%;left:-4%;}
.s3{width:11%;min-width:100px;aspect-ratio:1;background:rgba(0,210,244,0.09);bottom:15%;right:8%;}
.glass-card{background:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.95);border-radius:20px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.04),0 20px 50px -10px rgba(44,123,229,0.12),0 0 0 1px rgba(226,232,240,0.5);display:grid;grid-template-columns:1fr 1.1fr;width:100%;max-width:min(960px,100%);}
@media (min-width: 1400px) {
  .glass-card{max-width:1020px;}
}
.brand-panel{background:linear-gradient(160deg,rgba(44,123,229,0.04) 0%,rgba(0,210,244,0.025) 100%);padding:clamp(1.5rem,3vw,2.5rem) clamp(1rem,2.5vw,1.75rem);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;border-right:1px solid #e2e8f0;position:relative;}
.brand-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#2c7be5,#00d2f4,#00d27a);}
.brand-panel::after{content:'';position:absolute;bottom:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(44,123,229,0.15),transparent);}
.logo-box{width:100%;max-width:min(340px,80%);margin:0 auto clamp(0.75rem,2vw,1.5rem);display:flex;align-items:center;justify-content:center;min-height:clamp(72px,10vw,110px);}
.brand-logo-img{width:clamp(200px,28vw,300px);height:auto;display:block;flex-shrink:0;}
.brand-desc{color:#475569;font-size:clamp(0.8rem,1.5vw,0.875rem);line-height:1.65;margin:0 0 clamp(1rem,2.5vw,1.75rem);display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;}
.brand-badges{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:clamp(1rem,2vw,1.5rem);}
.badge{font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:0.3px;}
.badge-blue{background:rgba(44,123,229,0.1);color:#1a68d1;}
.badge-green{background:rgba(0,210,122,0.1);color:#0a8a50;}
.badge-sky{background:rgba(0,210,244,0.1);color:#0899b0;}
.brand-terms{font-size:0.75rem;color:#64748b;}
.brand-terms a{color:#1a68d1;text-decoration:none;font-weight:500;}
.brand-terms-link{color:#1a68d1;font-weight:500;}
.form-panel{padding:clamp(1.5rem,3.5vw,2.5rem) clamp(1rem,3vw,2rem);background:#fff;display:flex;flex-direction:column;justify-content:center;}
.form-head{margin-bottom:clamp(1rem,2.5vw,1.5rem);}
.form-title-text{font-size:clamp(1.25rem,2.5vw,1.6rem);font-weight:700;color:#0f172a;margin:0 0 0.35rem;}
.form-sub{font-size:0.85rem;color:#64748b;margin:0;}
.divider-line{height:1px;background:linear-gradient(90deg,rgba(44,123,229,0.3),rgba(0,210,244,0.2),transparent);margin:0 0 1.5rem;border:none;}
.fgroup{margin-bottom:1.25rem;}
.flabel-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;}
.flabel{display:block;font-size:0.8rem;font-weight:600;color:#334155;letter-spacing:0.2px;margin-bottom:0.4rem;}
.flabel-row .flabel{margin-bottom:0;}
.flink{font-size:0.75rem;color:#1a68d1;text-decoration:none;font-weight:500;}
.flink-disabled{cursor:not-allowed;opacity:0.8;}
.flink:hover{text-decoration:underline;}
.iw{position:relative;display:flex;align-items:center;}
.iico{position:absolute;left:13px;color:#64748b;font-size:0.85rem;z-index:2;line-height:1;display:flex;align-items:center;}
.finput{width:100%;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 12px 10px 38px;color:#0f172a;font-size:0.9rem;font-family:'Outfit',sans-serif;box-sizing:border-box;transition:all 0.2s;}
.finput:focus{outline:none;border-color:#2c7be5;background:#fff;box-shadow:0 0 0 3px rgba(44,123,229,0.35);}
.finput:focus-visible{outline:2px solid #1a68d1;outline-offset:1px;}
.finput::placeholder{color:#64748b;}
.finput-pw{padding-right:38px;}
.finput-error{border-color:#e5484d;background:#fef4f4;}
.pw-toggle{position:absolute;right:10px;background:none;border:none;cursor:pointer;font-size:0.9rem;line-height:1;padding:4px;color:#64748b;display:flex;align-items:center;}
.pw-toggle:hover{color:#2c7be5;}
.ferror{display:block;font-size:0.75rem;color:#e5484d;margin-top:0.35rem;}
.alert-error{background:#fef4f4;border:1px solid #f4b8ba;color:#c2222a;font-size:0.82rem;padding:10px 12px;border-radius:8px;}
.btn-main{width:100%;padding:11px;background:linear-gradient(135deg,#2c7be5,#1a68d1);color:white;border:none;border-radius:10px;font-weight:700;font-size:0.95rem;margin-top:0.5rem;cursor:pointer;letter-spacing:0.2px;box-shadow:0 4px 16px rgba(44,123,229,0.35);font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;}
.btn-main:disabled{opacity:0.7;cursor:not-allowed;}
.btn-main:focus-visible,.flink:focus-visible,.pw-toggle:focus-visible,.brand-terms a:focus-visible{outline:2px solid #2c7be5;outline-offset:2px;}
@media (prefers-reduced-motion: reduce){
  .btn-spinner{animation:none;}
  .finput,.btn-main{transition:none;}
}
.btn-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

@media (max-width: 1024px) {
  .glass-card{max-width:min(860px,100%);}
}

@media (max-width: 768px) {
  .glass-card {
    grid-template-columns: 1fr;
    max-width: min(520px,100%);
  }
  .brand-panel {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    padding: clamp(1.25rem,4vw,2rem) clamp(1rem,4vw,1.5rem);
  }
  .brand-desc{-webkit-line-clamp:2;}
  .logo-box{min-height:64px;}
}

@media (max-width: 480px) {
  .login-preview {
    padding: 1rem;
    align-items:flex-start;
  }
  .glass-card{border-radius:16px;}
  .brand-badges {
    margin-bottom: 0.75rem;
  }
}
</style>
