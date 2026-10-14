<template>
  <article class="mobile-card" :class="[`mc-${variant}`]">
    <!-- Badge superior derecho -->
    <span v-if="badge || $slots.badge" class="mc-count">
      <slot name="badge">{{ badge }}</slot>
    </span>

    <!-- Cabecera de tarjeta: Icono + Título + Subtítulo -->
    <div class="mc-header">
      <div v-if="iconClass || $slots.icon" class="mc-icon-wrap">
        <slot name="icon">
          <i :class="iconClass" aria-hidden="true"></i>
        </slot>
      </div>
      <div class="mc-header-info">
        <h3 v-if="title" class="mc-title">{{ title }}</h3>
        <p v-if="subtitle" class="mc-desc">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Contenido principal / Detalles -->
    <div v-if="$slots.default" class="mc-body">
      <slot />
    </div>

    <!-- Fila de Acciones inferiores -->
    <div v-if="$slots.actions" class="mc-actions">
      <slot name="actions" />
    </div>
  </article>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'blue', // 'blue' | 'orange' | 'green' | 'teal' | 'neutral'
    validator: (v) => ['blue', 'orange', 'green', 'teal', 'neutral'].includes(v),
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  badge: {
    type: [String, Number],
    default: '',
  },
  iconClass: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.mobile-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.6);
  margin-bottom: 8px;
}

/* Línea de acento superior de 3px idéntica al mockup */
.mobile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}

.mc-blue::before { background: #3b82f6; }
.mc-orange::before { background: #f97316; }
.mc-green::before { background: #22c55e; }
.mc-teal::before { background: #14b8a6; }
.mc-neutral::before { background: #64748b; }

.mc-count {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: var(--noa-text-meta);
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
}

.mc-blue .mc-count { background: #dbeafe; color: #1d4ed8; }
.mc-orange .mc-count { background: #ffedd5; color: #c2410c; }
.mc-green .mc-count { background: #dcfce7; color: #15803d; }
.mc-teal .mc-count { background: #ccfbf1; color: #0f766e; }
.mc-neutral .mc-count { background: #f1f5f9; color: #475569; }

.mc-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 50px; /* Espacio para el badge */
}

.mc-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.mc-blue .mc-icon-wrap { background: #eff6ff; color: #3b82f6; }
.mc-orange .mc-icon-wrap { background: #fff7ed; color: #f97316; }
.mc-green .mc-icon-wrap { background: #f0fdf4; color: #22c55e; }
.mc-teal .mc-icon-wrap { background: #f0fdfa; color: #14b8a6; }
.mc-neutral .mc-icon-wrap { background: #f8fafc; color: #64748b; }

.mc-header-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mc-title {
  font-size: var(--noa-text-body);
  font-weight: 700;
  color: var(--noa-ink);
  margin: 0;
  line-height: 1.3;
}

.mc-desc {
  font-size: var(--noa-text-meta);
  color: var(--noa-ink-soft);
  margin: 2px 0 0;
  line-height: 1.3;
}

.mc-body {
  font-size: var(--noa-text-body);
  color: var(--noa-ink-soft);
}

.mc-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

:deep(.mc-btn-primary),
:deep(a.mc-btn-primary),
:deep(button.mc-btn-primary) {
  border-radius: var(--noa-radius-md);
  padding: 8px 10px;
  font-size: var(--noa-text-meta);
  font-weight: 700;
  min-height: var(--noa-touch-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  cursor: pointer;
  flex: 1;
  text-decoration: none !important;
  text-align: center;
  color: #ffffff !important;
  transition: all 0.15s ease;
}
:deep(.mc-btn-primary *),
:deep(a.mc-btn-primary *),
:deep(button.mc-btn-primary *) {
  color: #ffffff !important;
}

.mc-blue :deep(.mc-btn-primary),
.mc-blue :deep(a.mc-btn-primary) { background: #2563eb !important; color: #ffffff !important; }
.mc-blue :deep(.mc-btn-primary:active),
.mc-blue :deep(a.mc-btn-primary:active) { background: #1d4ed8 !important; }

.mc-orange :deep(.mc-btn-primary),
.mc-orange :deep(a.mc-btn-primary) { background: #f97316 !important; color: #ffffff !important; }
.mc-orange :deep(.mc-btn-primary:active),
.mc-orange :deep(a.mc-btn-primary:active) { background: #ea580c !important; }

.mc-green :deep(.mc-btn-primary),
.mc-green :deep(a.mc-btn-primary) { background: #22c55e !important; color: #ffffff !important; }
.mc-green :deep(.mc-btn-primary:active),
.mc-green :deep(a.mc-btn-primary:active) { background: #16a34a !important; }

.mc-teal :deep(.mc-btn-primary),
.mc-teal :deep(a.mc-btn-primary) { background: #14b8a6 !important; color: #ffffff !important; }
.mc-teal :deep(.mc-btn-primary:active),
.mc-teal :deep(a.mc-btn-primary:active) { background: #0d9488 !important; }

.mc-neutral :deep(.mc-btn-primary),
.mc-neutral :deep(a.mc-btn-primary) { background: #334155 !important; color: #ffffff !important; }
.mc-neutral :deep(.mc-btn-primary:active),
.mc-neutral :deep(a.mc-btn-primary:active) { background: #1e293b !important; }

:deep(.mc-btn-secondary),
:deep(a.mc-btn-secondary),
:deep(button.mc-btn-secondary) {
  border-radius: var(--noa-radius-md);
  padding: 8px 10px;
  font-size: var(--noa-text-meta);
  font-weight: 600;
  min-height: var(--noa-touch-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  flex: 1;
  text-decoration: none !important;
  text-align: center;
  background: var(--noa-paper);
  border: 1px solid var(--noa-line) !important;
  color: var(--noa-ink) !important;
  transition: all 0.15s ease;
}
:deep(.mc-btn-secondary:active),
:deep(a.mc-btn-secondary:active) {
  background: #e2e8f0 !important;
}
</style>
