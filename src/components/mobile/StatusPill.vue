<template>
  <span class="status-pill" :style="{ '--sp-color': estado.color }">
    <i :class="estado.icono" aria-hidden="true"></i>
    <span class="sp-text">{{ estado.etiqueta }}</span>
  </span>
</template>

<script setup>
/**
 * Pastilla de estado del conductor: color + icono + texto.
 * Nunca comunica el estado solo con color. La lógica vive en
 * `utils/estadoBadge.js` (pura y probada).
 */
import { computed } from 'vue';
import { describirEstado } from '@/utils/estadoBadge.js';

const props = defineProps({
  estado: { type: String, default: '' },
});

const estado = computed(() => describirEstado(props.estado));
</script>

<style scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: var(--noa-radius-full);
  border: 1px solid var(--sp-color);
  color: var(--sp-color);
  background: var(--noa-card);
  font-size: var(--noa-text-meta);
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}

.status-pill i {
  font-size: var(--noa-text-meta);
}

.sp-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
