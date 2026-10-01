<script setup>
/**
 * @file BottomNav.vue
 * @description Navegación inferior del Portal Conductor con 5 ítems
 * @author Darwin Montes
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const items = [
    { name: 'Inicio', path: '/conductor', icon: 'home' },
    { name: 'Inspección', path: '/conductor/inspecciones', icon: 'clipboard' },
    { name: 'FUECs', path: '/conductor/fuecs', icon: 'certificate' },
    { name: 'Servicios', path: '/conductor/servicios', icon: 'route' },
    { name: 'Perfil', path: '/conductor/perfil', icon: 'user' },
];

const isActive = (path) => {
    if (path === '/conductor') return route.path === '/conductor';
    return route.path.startsWith(path);
};
</script>

<template>
    <nav class="bottom-nav">
        <router-link
            v-for="item in items"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'is-active': isActive(item.path) }"
        >
            <span class="nav-icon">
                <svg v-if="item.icon === 'home'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>
                <svg v-else-if="item.icon === 'clipboard'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>
                <svg v-else-if="item.icon === 'certificate'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><circle cx="12" cy="14" r="2" /><path d="m10.5 15.5-1 3 2-1 2 1-1-3" /></svg>
                <svg v-else-if="item.icon === 'route'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /></svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </span>
            <span class="nav-label">{{ item.name }}</span>
            <span v-if="isActive(item.path)" class="nav-dot"></span>
        </router-link>
    </nav>
</template>

<style scoped>
.bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    height: calc(var(--noa-nav-h) + var(--noa-safe-bottom));
    padding-bottom: var(--noa-safe-bottom);
    background: #fff;
    border-top: 1px solid var(--noa-border);
    display: flex;
    align-items: center;
}

.nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    font-size: 11px;
    font-weight: 600;
    color: var(--noa-muted);
    padding: 8px 4px;
    position: relative;
}

.nav-icon {
    display: block;
    margin-bottom: 1px;
}

.nav-dot {
    width: 4px;
    height: 4px;
    background: var(--noa-blue);
    border-radius: 50%;
    margin: 2px auto 0;
}

.is-active {
    color: var(--noa-blue);
}

/* Landscape */
@media (max-height: 480px) {
    .bottom-nav {
        height: calc(52px + var(--noa-safe-bottom));
    }

    .nav-item {
        padding: 4px 4px;
    }
}
</style>
