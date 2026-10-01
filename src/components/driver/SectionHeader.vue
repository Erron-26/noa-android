<script setup>
/**
 * @file SectionHeader.vue
 * @description Encabezado de sección con icono, título y contador
 * @author Darwin Montes
 */
defineProps({
    icon: { type: String, default: '' },
    iconBg: { type: String, default: 'var(--noa-blue)' },
    title: { type: String, default: '' },
    count: { type: Number, default: 0 },
});
</script>

<template>
    <div class="section-header">
        <div class="section-icon" :style="{ background: iconBg }">
            <svg v-if="icon === 'clipboard'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>
            <svg v-else-if="icon === 'certificate'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><circle cx="12" cy="14" r="2" /><path d="m10.5 15.5-1 3 2-1 2 1-1-3" /></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </div>
        <div class="section-title">{{ title }}</div>
        <div class="section-count">{{ count }}</div>
    </div>
</template>

<style scoped>
.section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.section-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.section-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--noa-text);
    flex: 1;
}

.section-count {
    font-size: 11px;
    font-weight: 700;
    background: var(--noa-border);
    color: var(--noa-text-2);
    border-radius: 12px;
    padding: 2px 8px;
}
</style>
