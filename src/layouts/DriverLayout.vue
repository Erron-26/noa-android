<script setup>
/**
 * @file DriverLayout.vue
 * @description Layout base del Portal Conductor: header + contenido + nav + diálogo logout
 * @author Darwin Montes
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@store/modules/user.js';
import AppHeader from '@components/driver/AppHeader.vue';
import BottomNav from '@components/driver/BottomNav.vue';
import ConfirmLogoutDialog from '@components/driver/ConfirmLogoutDialog.vue';

const props = defineProps({
    title: { type: String, default: '' },
    subtitle: { type: String, default: 'Portal Conductor' },
    showBack: { type: Boolean, default: true },
});

const router = useRouter();
const userStore = useUserStore();

const showLogoutDialog = ref(false);

const userName = computed(() => userStore.fullName || userStore.username || 'Usuario');
const userRole = computed(() => 'Conductor');
const userInitials = computed(() => userStore.initials || 'US');

function openLogout() {
    showLogoutDialog.value = true;
}

function onLogoutConfirm() {
    showLogoutDialog.value = false;
}
</script>

<template>
    <div class="driver-layout">
        <AppHeader
            :title="title"
            :subtitle="subtitle"
            :show-back="showBack"
            @logout="openLogout"
        />

        <main class="driver-main">
            <slot />
        </main>

        <BottomNav />

        <ConfirmLogoutDialog
            v-model="showLogoutDialog"
            :user-name="userName"
            :user-role="userRole"
            :user-initials="userInitials"
            @confirm="onLogoutConfirm"
        />
    </div>
</template>

<style scoped>
.driver-layout {
    min-height: 100dvh;
    background: var(--noa-bg);
    display: flex;
    flex-direction: column;
}

.driver-main {
    flex: 1;
    padding: 12px 12px calc(var(--noa-nav-h) + var(--noa-safe-bottom) + 12px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

/* Pantallas pequeñas */
@media (max-width: 359px) {
    .driver-main {
        padding: 10px 10px calc(var(--noa-nav-h) + var(--noa-safe-bottom) + 10px);
    }
}

/* Grandes */
@media (min-width: 428px) and (max-width: 599px) {
    .driver-main {
        padding: 16px 16px calc(var(--noa-nav-h) + var(--noa-safe-bottom) + 16px);
    }
}

/* Tablet */
@media (min-width: 600px) {
    .driver-main {
        max-width: 560px;
        margin: 0 auto;
        width: 100%;
    }
}

/* Landscape */
@media (max-height: 480px) {
    .driver-main {
        padding-bottom: calc(52px + var(--noa-safe-bottom) + 12px);
    }
}
</style>
