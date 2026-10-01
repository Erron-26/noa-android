<script setup>
/**
 * @file MisFuecsView.vue
 * @description Vista de FUECs del Portal Conductor con estado vacío
 * @author Darwin Montes
 */
import DriverLayout from '@layouts/DriverLayout.vue';
import SectionHeader from '@components/driver/SectionHeader.vue';

defineEmits(['crear']);

const fuecs = [];

function onCreate() {
    // TODO: navegar a crear FUEC
}
</script>

<template>
    <DriverLayout title="Mis FUECs">
        <SectionHeader
            icon="certificate"
            icon-bg="var(--noa-green)"
            title="Extractos de contrato (FUEC)"
            :count="fuecs.length"
        />

        <!-- Estado vacío -->
        <div v-if="fuecs.length === 0" class="empty-card">
            <div class="empty-ring">
                <div class="empty-icon-circle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--noa-green-600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><circle cx="12" cy="14" r="2" /><path d="m10.5 15.5-1 3 2-1 2 1-1-3" /></svg>
                </div>
            </div>
            <h3 class="empty-title">Sin FUECs asignados</h3>
            <p class="empty-text">No hay extractos únicos de contrato activos o asignados a tus vehículos.</p>
            <button type="button" class="btn-create" @click="onCreate">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                Crear FUEC
            </button>
        </div>

        <!-- Tarjeta informativa -->
        <div class="info-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--noa-green-600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
            <div class="info-content">
                <div class="info-title">Documento legal en ruta</div>
                <div class="info-text">El FUEC debe estar vigente y a la mano durante cada servicio.</div>
            </div>
        </div>
    </DriverLayout>
</template>

<style scoped>
.empty-card {
    background: #fff;
    border: 1px solid var(--noa-border);
    border-radius: 16px;
    padding: 26px 20px 22px;
    text-align: center;
}

.empty-ring {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: var(--noa-green-50);
    border: 1.5px dashed var(--noa-green-300);
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-icon-circle {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: var(--noa-green-100);
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--noa-text);
    margin: 0 0 5px;
}

.empty-text {
    font-size: 12px;
    color: var(--noa-muted);
    line-height: 1.5;
    margin: 0 0 16px;
}

.btn-create {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--noa-blue);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    border-radius: 12px;
    padding: 11px 22px;
}

.info-card {
    background: var(--noa-green-50);
    border: 1px solid var(--noa-green-200);
    border-radius: 12px;
    padding: 11px 12px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-top: 12px;
}

.info-card svg {
    flex-shrink: 0;
    margin-top: 1px;
}

.info-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--noa-green-900);
    margin-bottom: 2px;
}

.info-text {
    font-size: 11px;
    color: var(--noa-green-900);
    line-height: 1.4;
}
</style>
