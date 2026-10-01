<script setup>
/**
 * Modal bloqueante de nueva versión.
 * Se muestra en CUALQUIER ruta (incluido /login) apenas el store
 * detecta una versión mayor publicada en GitHub. No requiere
 * iniciar sesión: vive en App.vue fuera del router-view.
 */
import { ref } from "vue";
import { Capacitor } from "@capacitor/core";
import { useVersionUpdateStore } from "@/features/versionUpdate/store/versionUpdate.store.js";
import { logger } from "@utils/logger.js";

const versionStore = useVersionUpdateStore();
const statusMessage = ref("");
const isWorking = ref(false);

function openInBrowser() {
    if (versionStore.apkUrl) {
        window.open(versionStore.apkUrl, "_blank", "noopener");
    } else if (versionStore.releaseUrl) {
        window.open(versionStore.releaseUrl, "_blank", "noopener");
    }
}

async function handleUpdate() {
    // En web (no nativo) la instalación es manual: se abre la descarga.
    if (!Capacitor.isNativePlatform()) {
        openInBrowser();
        return;
    }
    if (!versionStore.apkUrl) {
        openInBrowser();
        return;
    }
    isWorking.value = true;
    statusMessage.value = "Descargando actualización…";
    try {
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        const fileName = `NOA-v${versionStore.latestVersion}.apk`;
        const dl = await Filesystem.downloadFile({
            url: versionStore.apkUrl,
            path: fileName,
            directory: Directory.Cache,
        });
        const filePath = dl && dl.path ? dl.path : fileName;
        statusMessage.value = "Abriendo instalador…";
        try {
            const { FileOpener } = await import('@capacitor-community/file-opener');
            await FileOpener.open({
                filePath,
                contentType: "application/vnd.android.package-archive",
            });
            statusMessage.value = "";
        } catch (e) {
            // Si el instalador no se abre: el navegador descarga y el usuario instala.
            logger.warn("VersionUpdate: FileOpener fallo, abro navegador", { error: e.message });
            statusMessage.value = "Completa la instalación desde el navegador.";
            openInBrowser();
        }
    } catch (e) {
        logger.warn("VersionUpdate: fallo la descarga del APK", { error: e.message });
        statusMessage.value = "No se pudo descargar. Intenta desde el navegador.";
        openInBrowser();
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
    class="version-update-overlay"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="version-update-title"
    aria-describedby="version-update-desc"
  >
    <div class="version-update-card shadow-lg">
      <div class="version-update-icon" aria-hidden="true">
        <i class="fas fa-circle-arrow-down" aria-hidden="true"></i>
      </div>
      <h2 id="version-update-title" class="version-update-title">
        Nueva versión disponible
      </h2>
      <p id="version-update-desc" class="version-update-desc">
        Ya está disponible <strong>NOA {{ versionStore.latestVersion }}</strong>
        <span v-if="versionStore.currentVersion">
          (tienes la {{ versionStore.currentVersion }})
        </span>.
        Actualiza para recibir los últimos cambios y correcciones.
      </p>
      <p v-if="statusMessage" class="version-update-status" role="status">
        {{ statusMessage }}
      </p>
      <div class="version-update-actions">
        <button
          type="button"
          class="btn btn-warning fw-bold"
          :disabled="isWorking"
          @click="handleUpdate"
        >
          {{ isWorking ? "Descargando…" : "Actualizar ahora" }}
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="isWorking"
          @click="handleLater"
        >
          Después
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.version-update-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  background: rgba(0, 28, 65, 0.55);
  overflow-y: auto;
}
.version-update-card {
  width: min(420px, calc(100vw - 2.5rem));
  max-width: calc(100vw - 2.5rem);
  max-height: 90dvh;
  overflow-y: auto;
  margin: auto;
  background: #ffffff;
  border-radius: 14px;
  padding: 28px 24px 24px;
  text-align: center;
  border-top: 4px solid var(--bs-warning, #ffc107);
}
.version-update-icon {
  font-size: 2.5rem;
  color: var(--bs-warning, #e6a800);
  margin-bottom: 8px;
}
.version-update-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #001c41;
  margin: 0 0 8px;
}
.version-update-desc {
  font-size: 0.9rem;
  color: #5e6e82;
  line-height: 1.5;
  margin: 0 0 4px;
}
.version-update-status {
  font-size: 0.8rem;
  color: #0a4ebb;
  margin: 8px 0 0;
}
.version-update-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}
.version-update-actions .btn {
  flex: 1;
}
</style>
