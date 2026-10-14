/**
 * Store de detección de nueva versión (auto-update).
 * Ubicación: src/features/versionUpdate/store/versionUpdate.store.js
 *
 * Solo estado de presentación: la comprobación, la caché de 6 horas y la
 * instalación viven en `@services/versionUpdate.service.js`. "Después"
 * oculta el banner sin descartar la versión (vuelve a ofrecerse en el
 * próximo check).
 */

import { defineStore } from "pinia";
import { checkForUpdate, clearUpdateCache } from "@services/versionUpdate.service.js";
import { logger } from "@utils/logger.js";

export const useVersionUpdateStore = defineStore("versionUpdate", {
    state: () => ({
        latestVersion: null,
        currentVersion: null,
        hasUpdate: false,
        apkUrl: null,
        releaseUrl: "",
        dismissedFor: null, // versión que el usuario descartó con "Después"
        isChecking: false,
        lastCheck: null,
    }),

    getters: {
        /** El banner solo se ofrece si hay update y no fue descartado. */
        shouldOffer: (state) => state.hasUpdate && state.dismissedFor !== state.latestVersion,
    },

    actions: {
        async check({ force = false } = {}) {
            if (this.isChecking) return;
            this.isChecking = true;
            try {
                const result = await checkForUpdate({ force });
                this.hasUpdate = result.hasUpdate;
                this.latestVersion = result.latestVersion;
                this.currentVersion = result.currentVersion;
                this.apkUrl = result.apkUrl;
                this.releaseUrl = result.releaseUrl;
                this.lastCheck = Date.now();
                logger.info("VersionUpdate: check completado", {
                    hasUpdate: this.hasUpdate,
                    latestVersion: this.latestVersion,
                    fromCache: result.fromCache,
                });
            } finally {
                this.isChecking = false;
            }
        },

        dismiss() {
            this.dismissedFor = this.latestVersion;
        },

        reset() {
            this.$reset();
            clearUpdateCache();
        },
    },
});
