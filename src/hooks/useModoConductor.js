// src/hooks/useModoConductor.js
// Conecta la regla pura de `@utils/modoConductor.js` con la ruta, los roles y
// la plataforma. DashboardLayout y DashboardView la usan para no divergir.
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePermissionsStore } from '@store/modules/permissions.js';
import { usePlatform } from '@/hooks/usePlatform.js';
import { esModoConductor, esDashboardDeConductor, esMovilConductor } from '@utils/modoConductor.js';

export function useModoConductor() {
    const route = useRoute();
    const permissionsStore = usePermissionsStore();
    const { esAndroidNativo } = usePlatform();
    const ancho = ref(typeof window === 'undefined' ? Infinity : window.innerWidth);

    const actualizarAncho = () => { ancho.value = window.innerWidth; };
    onMounted(() => window.addEventListener('resize', actualizarAncho));
    onUnmounted(() => window.removeEventListener('resize', actualizarAncho));

    const contexto = computed(() => ({
        path: route.path,
        view: route.query.view ?? null,
        esConductor: permissionsStore.hasRole('CONDUCTOR'),
        esAndroidNativo: esAndroidNativo.value,
        ancho: ancho.value,
    }));

    return {
        esConductor: computed(() => contexto.value.esConductor),
        modoConductor: computed(() => esModoConductor(contexto.value)),
        dashboardDeConductor: computed(() => esDashboardDeConductor(contexto.value)),
        movilConductor: computed(() => esMovilConductor(contexto.value)),
    };
}

export default useModoConductor;
