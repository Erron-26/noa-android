/**
 * Hook de pantalla completa: activa `noa-fullbleed` al montar y lo retira al
 * desmontar, en un solo lugar para que el par alta/baja no se desfase.
 */
import { onMounted, onUnmounted } from 'vue';
import { activarPantallaCompleta, desactivarPantallaCompleta } from '@/utils/pantallaCompleta.js';

export function usePantallaCompleta() {
    onMounted(() => activarPantallaCompleta());
    onUnmounted(() => desactivarPantallaCompleta());
}

export default usePantallaCompleta;
