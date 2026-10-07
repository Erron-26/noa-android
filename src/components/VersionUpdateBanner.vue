<script setup>
import { ref } from "vue";
import { useVersionUpdateStore } from "@/features/versionUpdate/store/versionUpdate.store.js";
import { installUpdate } from "@services/versionUpdate.service.js";

const versionStore = useVersionUpdateStore();
const statusMessage = ref("");
const isWorking = ref(false);

async function handleUpdate() {
    isWorking.value = true;
    try {
        await installUpdate(
            {
                apkUrl: versionStore.apkUrl,
                releaseUrl: versionStore.releaseUrl,
                latestVersion: versionStore.latestVersion,
            },
            (texto) => { statusMessage.value = texto; },
        );
    } finally {
        isWorking.value = false;
    }
}

function handleLater() {
    versionStore.dismiss();
}
</script>

<template>
  <div
    v-if="versionStore.shouldOffer"
    class="version-update-banner shadow-lg"
    role="status"
    aria-live="polite"
    aria-label="Hay una nueva versión disponible"
  >
    <i class="fas fa-circle-arrow-down me-2" aria-hidden="true"></i>
    <p class="version-update-text mb-0">
      Hay una nueva versión <strong>NOA {{ versionStore.latestVersion }}</strong> disponible.
      <span v-if="statusMessage" class="version-update-status">{{ statusMessage }}</span>
    </p>
    <div class="version-update-actions">
      <button
        type="button"
        class="btn btn-sm btn-warning fw-bold"
        :disabled="isWorking"
        aria-label="Actualizar ahora a la nueva versión"
        @click="handleUpdate"
      >
        Actualizar ahora
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline-light"
        :disabled="isWorking"
        aria-label="Recordarme después"
        @click="handleLater"
      >
        Después
      </button>
    </div>
  </div>
</template>

<style scoped>
.version-update-banner {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 1090;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background-color: #1b1e22;
  color: #fff;
  border-left: 3px solid var(--bs-warning, #ffc107);
}
.version-update-text {
  flex-grow: 1;
  font-size: 0.85rem;
  line-height: 1.4;
}
.version-update-status {
  display: block;
  font-size: 0.75rem;
  opacity: 0.85;
}
.version-update-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
@media (max-width: 576px) {
  .version-update-banner {
    flex-wrap: wrap;
  }
  .version-update-actions {
    width: 100%;
  }
  .version-update-actions .btn {
    flex: 1;
  }
}
</style>
