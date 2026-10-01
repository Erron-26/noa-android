<script setup>
/**
 * @file ConfirmLogoutDialog.vue
 * @description Diálogo de confirmación de cierre de sesión con Teleport
 * @author Darwin Montes
 */
import { useRouter } from 'vue-router';
import { useAuthStore } from '@store/modules/auth.js';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    userName: { type: String, default: '' },
    userRole: { type: String, default: 'Conductor' },
    userInitials: { type: String, default: 'US' },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const router = useRouter();
const authStore = useAuthStore();

function close() {
    emit('update:modelValue', false);
}

async function confirm() {
    emit('update:modelValue', false);
    emit('confirm');
    await authStore.logout({ redirect: false });
    router.replace('/login');
}
</script>

<template>
    <Teleport to="body">
        <Transition name="dialog-fade">
            <div v-if="modelValue" class="dialog-overlay" @click.self="close">
                <Transition name="dialog-scale" appear>
                    <div class="dialog-box" role="alertdialog" aria-modal="true" aria-labelledby="logout-title">
                        <div class="dialog-icon-outer">
                            <div class="dialog-icon-inner">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--noa-danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
                            </div>
                        </div>

                        <h2 id="logout-title" class="dialog-title">¿Cerrar sesión?</h2>
                        <p class="dialog-text">Saldrás de tu cuenta en este dispositivo. Podrás volver a ingresar cuando quieras.</p>

                        <div class="user-chip">
                            <div class="user-avatar">{{ userInitials }}</div>
                            <span class="user-info">{{ userName }} · {{ userRole }}</span>
                        </div>

                        <div class="dialog-actions">
                            <button type="button" class="btn-cancel" @click="close">Cancelar</button>
                            <button type="button" class="btn-confirm" @click="confirm">Sí, salir</button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: var(--noa-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22px;
}

.dialog-box {
    width: 100%;
    max-width: 340px;
    background: #fff;
    border-radius: 22px;
    padding: 24px 20px 18px;
    text-align: center;
}

.dialog-icon-outer {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: var(--noa-danger-50);
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dialog-icon-inner {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--noa-danger-100);
    display: flex;
    align-items: center;
    justify-content: center;
}

.dialog-title {
    font-size: 19px;
    font-weight: 700;
    color: var(--noa-text);
    margin: 0 0 6px;
}

.dialog-text {
    font-size: 13px;
    color: var(--noa-text-3);
    line-height: 1.5;
    margin: 0 0 14px;
}

.user-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--noa-surface);
    border: 1px solid var(--noa-border);
    border-radius: 20px;
    padding: 4px 12px 4px 4px;
    margin-bottom: 18px;
}

.user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--noa-blue);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-info {
    font-size: 12px;
    font-weight: 600;
    color: var(--noa-text);
}

.dialog-actions {
    display: flex;
    gap: 10px;
}

.btn-cancel,
.btn-confirm {
    height: 46px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-cancel {
    background: var(--noa-surface);
    border: 1.5px solid var(--noa-border);
    color: var(--noa-text-2);
    flex: 1;
}

.btn-confirm {
    background: var(--noa-danger);
    color: #fff;
    flex: 1.2;
}

/* Animaciones */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
    transition: opacity 200ms ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
    opacity: 0;
}

.dialog-scale-enter-active {
    transition: transform 220ms cubic-bezier(.32, 1, .6, 1), opacity 220ms ease;
}

.dialog-scale-enter-from {
    transform: scale(.95);
    opacity: 0;
}

.dialog-scale-leave-active {
    transition: transform 180ms ease-in, opacity 180ms ease;
}

.dialog-scale-leave-to {
    transform: scale(.95);
    opacity: 0;
}
</style>
