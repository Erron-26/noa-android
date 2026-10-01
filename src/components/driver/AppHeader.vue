<script setup>
/**
 * @file AppHeader.vue
 * @description Header del Portal Conductor con botón atrás, título y acciones
 * @author Darwin Montes
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@store/modules/user.js';

const props = defineProps({
    title: { type: String, default: '' },
    subtitle: { type: String, default: 'Portal Conductor' },
    showBack: { type: Boolean, default: true },
});

const emit = defineEmits(['logout']);

const router = useRouter();
const userStore = useUserStore();

const initials = computed(() => userStore.initials || 'US');

function goBack() {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push('/dashboard');
    }
}
</script>

<template>
    <header class="app-header">
        <button v-if="showBack" type="button" class="back-btn" aria-label="Volver" @click="goBack">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
        </button>

        <div class="header-texts">
            <div class="header-title">{{ title }}</div>
            <div class="header-subtitle">{{ subtitle }}</div>
        </div>

        <div class="header-actions">
            <button type="button" class="action-circle" aria-label="Notificaciones">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            </button>
            <button type="button" class="action-circle avatar-btn" aria-label="Perfil">
                <span>{{ initials }}</span>
            </button>
            <button type="button" class="action-circle logout-btn" aria-label="Cerrar sesión" @click="emit('logout')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--noa-danger-soft)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
            </button>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    background: var(--noa-navy);
    padding: calc(14px + var(--noa-safe-top)) 14px 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    position: sticky;
    top: 0;
    z-index: 10;
}

.back-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(255, 255, 255, .12);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.header-texts {
    flex: 1;
    min-width: 0;
}

.header-title {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.header-subtitle {
    font-size: 11px;
    color: var(--noa-navy-soft);
    margin-top: 1px;
}

.header-actions {
    display: flex;
    gap: 5px;
    background: rgba(255, 255, 255, .08);
    border-radius: 22px;
    padding: 3px;
    flex-shrink: 0;
}

.action-circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, .1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-btn {
    background: var(--noa-blue);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
}

.logout-btn {
    background: rgba(232, 53, 90, .28);
}

/* Landscape */
@media (max-height: 480px) {
    .app-header {
        padding-top: calc(8px + var(--noa-safe-top));
        padding-bottom: 8px;
    }
}
</style>
