<template>
  <div class="mobile-empty-state">
    <div class="mes-icon" aria-hidden="true">
      <slot name="icon">
        <i v-if="iconClass" :class="iconClass"></i>
        <span v-else>{{ emoji }}</span>
      </slot>
    </div>
    <h3 class="mes-title">{{ title }}</h3>
    <p v-if="description" class="mes-sub">{{ description }}</p>
    <div v-if="$slots.action || actionText" class="mes-action">
      <slot name="action">
        <button
          type="button"
          class="mes-btn"
          @click="$emit('action')"
        >
          <i v-if="actionIcon" :class="actionIcon" class="me-1" aria-hidden="true"></i>
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  emoji: {
    type: String,
    default: '📋',
  },
  iconClass: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
  actionIcon: {
    type: String,
    default: 'fas fa-plus',
  },
});

defineEmits(['action']);
</script>

<style scoped>
.mobile-empty-state {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin: 10px 0;
}

.mes-icon {
  font-size: 38px;
  margin-bottom: 12px;
  opacity: 0.55;
  display: inline-block;
  line-height: 1;
}

.mes-title {
  font-size: var(--noa-text-title);
  font-weight: 700;
  color: var(--noa-ink);
  margin: 0 0 6px;
}

.mes-sub {
  font-size: var(--noa-text-meta);
  color: var(--noa-ink-soft);
  line-height: 1.5;
  margin: 0 auto 16px;
  max-width: 280px;
}

.mes-action {
  display: flex;
  justify-content: center;
}

.mes-btn {
  background: var(--noa-action);
  color: var(--noa-on-action);
  font-size: var(--noa-text-body);
  font-weight: 600;
  padding: 8px 16px;
  min-height: var(--noa-touch-min);
  border-radius: var(--noa-radius-md);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(0, 81, 213, 0.25);
  transition: background 0.15s ease;
}

.mes-btn:active {
  background: var(--noa-action-container);
}
</style>
