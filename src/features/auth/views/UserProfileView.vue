<template>
    <div class="profile-container animate-fade-in">
        <!-- Header de Perfil -->
        <BasePageHeader
            :title="userStore.fullName || 'Usuario ERP'"
            icon="fas fa-user-circle text-primary"
            topLabel="Perfil de Usuario"
            :breadcrumbs="[ { label: 'Inicio', to: '/dashboard' }, { label: 'Mi Perfil', active: true } ]"
        >
            <template #title-after>
                <span class="badge-role ms-2"><span class="fas fa-crown me-1"></span>{{ displayRoles }}</span>
            </template>
            <template #actions>
                <router-link to="/dashboard" class="btn btn-falcon-default btn-sm px-3">
                    <i class="fad fa-arrow-left me-1"></i>
                    <span class="d-none d-sm-inline">Volver al Dashboard</span>
                </router-link>
            </template>
        </BasePageHeader>

        <!-- Contenido principal en 2 columnas -->
        <div class="profile-layout">
            <!-- Columna Izquierda: Información Detallada y Seguridad -->
            <main class="profile-main">
                <div class="profile-card">
                    <div class="card-header">
                        <h4 class="card-title">
                            <span class="fas fa-id-card me-2 text-primary"></span> Información Personal
                        </h4>
                    </div>
                    <div class="card-body">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Nombre Completo</span>
                                <span class="info-value">{{ userStore.fullName || '—' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Correo Electrónico</span>
                                <span class="info-value text-primary">{{ userStore.email || '—' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Empresa / Organización</span>
                                <span class="info-value">{{ authStore.currentTenant?.name || 'Falcon Transportes S.A.S.' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Rol en la Empresa</span>
                                <span class="info-value text-capitalize">{{ authStore.currentTenant?.role || 'Usuario' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN DE SEGURIDAD 2FA INTERACTIVA -->
                <div class="profile-card" id="security-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4 class="card-title mb-0">
                            <span class="fas fa-shield-alt me-2 text-primary"></span> Seguridad y Doble Factor (2FA)
                        </h4>
                        <span v-if="twoFactorActive" class="badge-status active">
                            <span class="fas fa-check-circle me-1"></span> Protegido por 2FA
                        </span>
                        <span v-else class="badge-status risk">
                            <span class="fas fa-exclamation-triangle me-1"></span> 2FA Inactivo
                        </span>
                    </div>
                    <div class="card-body">
                        <!-- Caso 1: 2FA ya está activo -->
                        <div v-if="twoFactorActive" class="security-active-panel">
                            <div class="alert-shield">
                                <div class="shield-icon-container">
                                    <span class="fas fa-user-shield text-success fs-2"></span>
                                </div>
                                <div class="shield-text">
                                    <h5>Autenticación de dos factores (2FA) Activada</h5>
                                    <p>Tu cuenta cuenta con una capa extrema de seguridad. Cada inicio de sesión requerirá un código dinámico OTP desde tu aplicación móvil.</p>
                                </div>
                            </div>

                            <!-- Botón para desactivar -->
                            <div class="mt-4" v-if="!showDisableForm">
                                <button class="btn-disable-trigger" @click="showDisableForm = true">
                                    <span class="fas fa-unlock-alt me-1"></span> Desactivar Doble Factor
                                </button>
                            </div>

                            <!-- Formulario de desactivación -->
                            <div v-else class="disable-form-box mt-3 animate-fade-in">
                                <h5>Confirmar Desactivación de 2FA</h5>
                                <p class="text-muted small">Por motivos de seguridad, introduce tu contraseña actual para confirmar la desactivación del doble factor.</p>
                                <div class="form-group mb-3">
                                    <label class="form-label">Contraseña Actual</label>
                                    <input type="password" class="form-control" v-model="passwordToDisable" placeholder="Introduce tu contraseña">
                                </div>
                                <div class="d-flex gap-2">
                                    <button class="btn-confirm-disable" @click="handleDisable2FA" :disabled="isProcessing">
                                        {{ isProcessing ? 'Procesando...' : 'Confirmar y Desactivar' }}
                                    </button>
                                    <button class="btn-cancel" @click="showDisableForm = false; passwordToDisable = ''">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Caso 2: 2FA Inactivo -->
                        <div v-else class="security-inactive-panel">
                            <p class="text-muted mb-4">La autenticación de doble factor añade un paso adicional de verificación a tu cuenta. Al iniciar sesión, se solicitará un código de 6 dígitos generado por aplicaciones como Google Authenticator o Microsoft Authenticator.</p>
                            
                            <button v-if="!showSetup" class="btn-2fa-setup" @click="start2FASetup" :disabled="isProcessing">
                                <span class="fas fa-key me-1"></span> {{ isProcessing ? 'Cargando...' : 'Configurar Autenticación 2FA' }}
                            </button>

                            <!-- Flujo de configuración del 2FA -->
                            <div v-else class="setup-flow-box mt-3 animate-fade-in">
                                <div class="step-card mb-4">
                                    <div class="step-header">
                                        <span class="step-num">1</span>
                                        <h5>Escanea el Código QR</h5>
                                    </div>
                                    <p class="text-muted small">Abre tu aplicación móvil autenticadora y escanea el siguiente código QR:</p>
                                    
                                    <!-- Render del QR en SVG -->
                                    <div class="qr-code-wrapper" v-html="qrCodeSvg"></div>

                                    <!-- Llave secreta manual -->
                                    <div class="manual-key-box mt-3">
                                        <span class="key-label">¿No puedes escanear el código? Usa esta clave manual:</span>
                                        <div class="key-container">
                                            <code class="manual-key">{{ provisionalSecret }}</code>
                                        </div>
                                    </div>
                                </div>

                                <div class="step-card mb-4">
                                    <div class="step-header">
                                        <span class="step-num">2</span>
                                        <h5>Introduce el Código OTP</h5>
                                    </div>
                                    <p class="text-muted small">Escribe el código de 6 dígitos que muestra tu aplicación móvil para validar la configuración:</p>
                                    
                                    <div class="col-12 form-group col-md-6 mb-3">
                                        <input type="text" autocomplete="off" class="form-control otp-input" v-model="otpCode" placeholder="000000" maxlength="6">
                                    </div>

                                    <div class="d-flex gap-2">
                                        <button class="btn-confirm-setup" @click="handleConfirm2FA" :disabled="isProcessing">
                                            {{ isProcessing ? 'Verificando...' : 'Confirmar y Activar 2FA' }}
                                        </button>
                                        <button class="btn-cancel" @click="showSetup = false; otpCode = ''">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Códigos de recuperación generados -->
                        <div v-if="recoveryCodes.length > 0" class="recovery-codes-box mt-4 animate-fade-in">
                            <div class="alert alert-success border-0 shadow-sm">
                                <h5><span class="fas fa-check-circle me-1"></span> ¡Doble factor activado con éxito!</h5>
                                <p class="small mb-3">Guarda estos códigos de recuperación en un lugar seguro. Podrás usarlos para iniciar sesión si pierdes acceso a tu dispositivo móvil:</p>
                                <div class="recovery-codes-grid">
                                    <code v-for="(code, idx) in recoveryCodes" :key="idx" class="recovery-code-badge">{{ code }}</code>
                                </div>
                                <button class="btn-copy-codes mt-3" @click="copyRecoveryCodes">
                                    <span class="fas fa-copy me-1"></span> Copiar Códigos al Portapapeles
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Acceso a la administración de roles y permisos -->
            </main>

            <!-- Columna Derecha: Resumen e Información del Token -->
            <aside class="profile-sidebar">
                <div class="profile-card">
                    <div class="card-header">
                        <h4 class="card-title">
                            <span class="fas fa-info-circle me-2 text-primary"></span> Detalles de Sesión
                        </h4>
                    </div>
                    <div class="card-body">
                        <div class="session-details">
                            <div class="session-detail-item">
                                <span class="detail-label">Estado de la Cuenta</span>
                                <span class="badge-status active">Activo</span>
                            </div>
                            <div class="session-detail-item">
                                <span class="detail-label">Sesión Conectada</span>
                                <span class="badge-status info">Sanctum Activo</span>
                            </div>
                            <div class="session-detail-item">
                                <span class="detail-label">ID de Usuario</span>
                                <span class="font-monospace text-truncate text-muted" :title="permissionsStore.user?.id">{{ permissionsStore.user?.id || '—' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- INTEGRACIÓN GOOGLE DRIVE -->
                <div class="profile-card mt-3 animate-fade-in">
                    <div class="card-header">
                        <h4 class="card-title mb-0">
                            <span class="fab fa-google me-2 text-danger"></span> Google Drive
                        </h4>
                    </div>
                    <div class="card-body">
                        <div v-if="googleConnected" class="google-connected-panel">
                            <div class="d-flex align-items-center mb-3">
                                <span class="fab fa-google-drive text-success fs-3 me-3"></span>
                                <div class="text-truncate">
                                    <h6 class="mb-0 text-success fw-bold">Vinculado</h6>
                                    <span class="text-muted small text-truncate d-block" :title="googleEmail">{{ googleEmail }}</span>
                                </div>
                            </div>
                            <!-- Storage Bar -->
                            <div class="storage-bar-wrapper">
                                <div class="d-flex justify-content-between text-muted small mb-1">
                                    <span>Almacenamiento Usado</span>
                                    <span>{{ googleQuota.used }} / {{ googleQuota.total }}</span>
                                </div>
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar bg-success animate-pulse" role="progressbar" :style="{ width: googleQuota.percent + '%' }"></div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="google-disconnected-panel">
                            <p class="text-muted small mb-3">Vincula tu cuenta de Google Drive para respaldar de manera automática tus extractos FUEC y contratos firmados en la nube.</p>
                            <button class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2" style="border-radius: 8px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;" @click="redirectToGoogle" :disabled="isProcessing">
                                <span class="fab fa-google"></span> Vincular Google Drive
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
        <p class="profile-version text-center text-muted small mt-3 mb-0">NOA Transportes v{{ appVersion }}</p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BasePageHeader from '@/components/BasePageHeader.vue'
import { useRoute } from 'vue-router'
import { useUserStore, useAuthStore, usePermissionsStore } from '@store'
import apiClient from '@/services/api/client.js'
import Swal from 'sweetalert2'
import env from '@utils/env.js'

const appVersion = env.APP_VERSION

const route = useRoute()
const userStore = useUserStore()
const authStore = useAuthStore()
const permissionsStore = usePermissionsStore()

const twoFactorActive = ref(false)
const showSetup = ref(false)
const qrCodeSvg = ref('')
const provisionalSecret = ref('')
const otpCode = ref('')
const passwordToDisable = ref('')
const showDisableForm = ref(false)
const recoveryCodes = ref([])
const isProcessing = ref(false)

// Google Drive State
const googleConnected = ref(false)
const googleEmail = ref('')
const googleQuota = ref({ used: '0 B', total: '15 GB', percent: 0 })

// Consultar estado de Google Drive
const checkGoogleStatus = async () => {
    try {
        const response = await apiClient.global.get('/integrations/google-drive/storage-quota')
        const payload = response.data.data
        if (payload) {
            googleConnected.value = true
            googleEmail.value = permissionsStore.user?.google_email || 'Cuenta Vinculada'
            googleQuota.value = {
                used: payload.used || '2.4 GB',
                total: payload.total || '15 GB',
                percent: payload.percent || 16
            }
        }
    } catch (error) {
        // Fallback si no está el token de backend pero guardado local
        if (permissionsStore.user?.google_email) {
            googleConnected.value = true
            googleEmail.value = permissionsStore.user.google_email
        } else {
            googleConnected.value = false
        }
    }
}

// Redirigir a Google OAuth
const redirectToGoogle = async () => {
    try {
        isProcessing.value = true
        const response = await apiClient.global.get('/integrations/google-drive/authorize')
        const payload = response.data.data
        if (payload && payload.redirect_url) {
            window.location.href = payload.redirect_url
        } else {
            throw new Error('No se recibió la URL de redirección.')
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Vinculación',
            text: error.response?.data?.message || 'No se pudo iniciar el proceso de autorización con Google Drive.'
        })
    } finally {
        isProcessing.value = false
    }
}

const displayRoles = computed(() => {
    if (!permissionsStore.roles || permissionsStore.roles.length === 0) {
        return authStore.currentTenant?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Usuario'
    }
    return permissionsStore.roles.map(r => r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(' | ')
})

// Verificar el estado de 2FA en el montaje
const check2FAStatus = async () => {
    try {
        isProcessing.value = true
        // Consultamos de forma silenciosa si ya está activo mediante la llamada de habilitación
        await apiClient.global.get('/2fa/enable')
        // Si no arrojó error, el 2FA NO se encuentra confirmado y activo
        twoFactorActive.value = false
    } catch (error) {
        // Si la llamada arroja que ya está activo, seteamos el estado de protección activa
        if (error.response?.data?.error?.code === 'TWO_FACTOR_ALREADY_ENABLED' || error.response?.data?.error_code === 'TWO_FACTOR_ALREADY_ENABLED') {
            twoFactorActive.value = true
        } else {
            twoFactorActive.value = false
        }
    } finally {
        isProcessing.value = false
    }
}

// Iniciar configuración de 2FA
const start2FASetup = async () => {
    try {
        isProcessing.value = true
        const response = await apiClient.global.get('/2fa/enable')
        const payload = response.data.data
        
        qrCodeSvg.value = payload.qr_code
        provisionalSecret.value = payload.secret
        showSetup.value = true
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Configuración',
            text: error.response?.data?.message || 'No se pudo iniciar el proceso de activación de 2FA.'
        })
    } finally {
        isProcessing.value = false
    }
}

// Confirmar y activar 2FA
const handleConfirm2FA = async () => {
    if (!otpCode.value || otpCode.value.length < 6) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'El código de verificación debe poseer 6 dígitos.' })
        return
    }

    try {
        isProcessing.value = true
        const response = await apiClient.global.post('/2fa/confirm', { code: otpCode.value })
        const payload = response.data.data

        recoveryCodes.value = payload.recovery_codes || []
        twoFactorActive.value = true
        showSetup.value = false
        otpCode.value = ''

        Swal.fire({
            icon: 'success',
            title: '¡2FA Activado!',
            text: 'La autenticación de doble factor ha sido validada y guardada con éxito.'
        })
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Código Inválido',
            text: error.response?.data?.message || 'El código introducido no es válido o ha expirado.'
        })
    } finally {
        isProcessing.value = false
    }
}

// Desactivar 2FA
const handleDisable2FA = async () => {
    if (!passwordToDisable.value) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'La contraseña es obligatoria para confirmar.' })
        return
    }

    try {
        isProcessing.value = true
        await apiClient.global.post('/2fa/disable', { password: passwordToDisable.value })
        
        twoFactorActive.value = false
        showDisableForm.value = false
        passwordToDisable.value = ''
        recoveryCodes.value = []

        Swal.fire({
            icon: 'success',
            title: 'Doble Factor Desactivado',
            text: 'El 2FA ha sido retirado correctamente de tu cuenta.'
        })
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Contraseña incorrecta o error de solicitud.'
        })
    } finally {
        isProcessing.value = false
    }
}

// Copiar códigos de recuperación
const copyRecoveryCodes = () => {
    const text = recoveryCodes.value.join('\n')
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({ icon: 'success', title: 'Copiado', text: 'Códigos de recuperación copiados al portapapeles.', timer: 1500, showConfirmButton: false })
    })
}

// Cargar datos frescos del usuario autenticado desde la base de datos
const loadUserProfile = async () => {
    try {
        const response = await apiClient.global.get('/me')
        const payload = response.data.data
        if (payload && payload.user) {
            userStore.setProfile(payload.user)
            permissionsStore.setUser(payload.user)
        }
    } catch (error) {
        console.error('Error al sincronizar el perfil con el servidor:', error)
    }
}

onMounted(() => {
    loadUserProfile()
    check2FAStatus()
    checkGoogleStatus()
    // Si la URL contiene ?tab=security, hacemos scroll suave hacia la tarjeta
    if (route.query.tab === 'security') {
        setTimeout(() => {
            const el = document.getElementById('security-card')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 300)
    }
})
</script>

<style scoped>

.profile-container {
    font-family: 'Outfit', sans-serif;
    padding: 1.5rem;
    background: #f8fafc;
    min-height: 100vh;
    color: #1e293b;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}



.badge-role {
    font-size: 0.75rem;
    font-weight: 700;
    background: #fffbeb;
    color: #d97706;
    padding: 0.25rem 0.65rem;
    border-radius: 20px;
    border: 1px solid #fde68a;
    display: inline-flex;
    align-items: center;
}


/* Layout */
.profile-layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
}

@media (max-width: 992px) {
    .profile-layout {
        grid-template-columns: 1fr;
    }
}

.profile-main,
.profile-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Card */
.profile-card {
    background: white;
    border-radius: 16px;
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.card-header {
    padding: 1.25rem;
    border-bottom: 1px solid #f1f5f9;
}

.card-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
}

.card-body {
    padding: 1.25rem;
}

/* Info Grid */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.25rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0f172a;
}

/* 2FA STYLING */
.alert-shield {
    display: flex;
    gap: 1.25rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    padding: 1.25rem;
    border-radius: 12px;
}

.shield-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.shield-text h5 {
    font-size: 0.95rem;
    font-weight: 700;
    color: #166534;
    margin: 0 0 0.25rem 0;
}

.shield-text p {
    font-size: 0.825rem;
    color: #1e3a1e;
    margin: 0;
    line-height: 1.5;
}

.btn-disable-trigger {
    background: #fcf1f1;
    border: 1px solid #f5c2c2;
    color: #b91c1c;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.825rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-disable-trigger:hover {
    background: #fee2e2;
    transform: translateY(-1px);
}

.disable-form-box {
    background: #fef2f2;
    border: 1px solid #fee2e2;
    padding: 1.25rem;
    border-radius: 12px;
}

.disable-form-box h5 {
    font-size: 0.95rem;
    font-weight: 700;
    color: #991b1b;
    margin: 0 0 0.5rem 0;
}

.btn-confirm-disable {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.825rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-confirm-disable:hover {
    background: #b91c1c;
}

.btn-cancel {
    background: white;
    border: 1px solid #cbd5e1;
    color: #475569;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.825rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cancel:hover {
    background: #f8fafc;
}

/* Inactive */
.btn-2fa-setup {
    background: #2c7be5;
    color: white;
    border: none;
    padding: 0.65rem 1.25rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(44, 123, 229, 0.2);
}

.btn-2fa-setup:hover {
    background: #1b66ca;
    transform: translateY(-1px);
}

/* Setup Flow */
.setup-flow-box {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.step-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 1.25rem;
    border-radius: 12px;
}

.step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.step-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #2c7be5;
    color: white;
    font-size: 0.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

.step-header h5 {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
}

.qr-code-wrapper {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    display: inline-block;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

/* Evitar que el SVG rompa el contenedor */
.qr-code-wrapper :deep(svg) {
    display: block;
    width: 160px;
    height: 160px;
}

.manual-key-box {
    background: white;
    border: 1px solid #e2e8f0;
    padding: 0.75rem;
    border-radius: 8px;
}

.key-label {
    font-size: 0.75rem;
    color: #64748b;
    display: block;
    margin-bottom: 0.25rem;
}

.manual-key {
    font-family: monospace;
    font-size: 0.85rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.5px;
}

.otp-input {
    letter-spacing: 0.4rem;
    font-size: 1.1rem;
    font-weight: 700;
    text-align: center;
}

.btn-confirm-setup {
    background: #2c7be5;
    color: white;
    border: none;
    padding: 0.5rem 1.25rem;
    border-radius: 8px;
    font-size: 0.825rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-confirm-setup:hover {
    background: #1b66ca;
}

/* Recovery Codes */
.recovery-codes-box .alert {
    padding: 1.25rem;
    border-radius: 12px;
}

.recovery-codes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
}

.recovery-code-badge {
    background: white;
    border: 1px solid #bbf7d0;
    color: #14532d;
    padding: 0.4rem;
    border-radius: 6px;
    text-align: center;
    font-family: monospace;
    font-size: 0.8rem;
    font-weight: 700;
}

.btn-copy-codes {
    background: #15803d;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-copy-codes:hover {
    background: #166534;
}

/* Status Badges */
.badge-status {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.65rem;
    border-radius: 20px;
}

.badge-status.active {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}

.badge-status.risk {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
}

.badge-status.info {
    background: #eff6ff;
    color: #1d4ed8;
}

.form-control {
    border-radius: 8px;
    border: 1.5px solid #cbd5e1;
    padding: 0.5rem 0.75rem;
}

.form-control:focus {
    border-color: #2c7be5;
    box-shadow: 0 0 0 2px rgba(44, 123, 229, 0.15);
}

.form-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.35rem;
}

.session-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.session-detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}

.detail-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
}

.font-monospace {
    font-family: monospace;
    font-size: 0.75rem;
}

/* Animaciones */
.animate-fade-in {
    animation: fade-in 0.4s ease both;
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
