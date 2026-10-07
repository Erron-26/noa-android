/**
 * Módulo de actualización de la app (auto-update).
 * Ubicación: src/services/versionUpdate.service.js
 *
 * Interfaz:
 *   checkForUpdate({ force })  -> estado de la actualización (con caché de 6 h)
 *   installUpdate(info, onStatus) -> descarga e instala el APK (o abre el navegador)
 *   clearUpdateCache()
 *
 * Detrás de la interfaz viven: consulta del último Release de GitHub,
 * comparación semver, caché y reutilización del aviso si no hay red, y la
 * secuencia nativa de descarga + instalador. Nunca lanza excepciones.
 * Los puntos de sustitución (fetch, almacenamiento, plataforma) se inyectan
 * en `createVersionUpdater`; en la app se usan los reales por defecto.
 */

import { logger } from "@utils/logger.js";
import env from "@utils/env.js";

const GITHUB_OWNER = "solucionesintegralesmanasas";
const GITHUB_REPO = "noa-android";
const GITHUB_LATEST_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

const CACHE_KEY = "noa_version_check";
export const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const APK_MIME = "application/vnd.android.package-archive";

/** Normaliza un tag ("v1.0.0" -> "1.0.0"). */
export function parseTagVersion(tag) {
    return String(tag || "").trim().replace(/^[vV]/, "");
}

/**
 * Compara versiones semver. Retorna 1 si a > b, -1 si a < b, 0 si iguales.
 * Tolera segmentos faltantes ("1.0" == "1.0.0") e ignora sufijos ("-beta").
 */
export function compareVersions(a, b) {
    const norm = (v) =>
        parseTagVersion(v)
            .split(".")
            .map((s) => parseInt(String(s).split("-")[0], 10) || 0);
    const pa = norm(a);
    const pb = norm(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i += 1) {
        const x = pa[i] || 0;
        const y = pb[i] || 0;
        if (x > y) return 1;
        if (x < y) return -1;
    }
    return 0;
}

/* ---------------------------- adaptadores reales --------------------------- */

const storageReal = {
    get() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },
    set(payload) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        } catch {
            /* almacenamiento lleno o bloqueado: el check sigue funcionando */
        }
    },
    clear() {
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch {
            /* noop */
        }
    },
};

const plataformaReal = {
    async esNativa() {
        const { Capacitor } = await import("@capacitor/core");
        return Capacitor.isNativePlatform();
    },
    async descargarApk({ url, nombre }) {
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        const dl = await Filesystem.downloadFile({ url, path: nombre, directory: Directory.Cache });
        return dl && dl.path ? dl.path : nombre;
    },
    async abrirInstalador(filePath) {
        const { FileOpener } = await import("@capacitor-community/file-opener");
        await FileOpener.open({ filePath, contentType: APK_MIME });
    },
    abrirEnNavegador(url) {
        window.open(url, "_blank", "noopener");
    },
};

/* --------------------------------- módulo --------------------------------- */

/**
 * @param {object} [deps] puntos de sustitución (todos opcionales)
 * @param {Function} [deps.fetch]
 * @param {{get,set,clear}} [deps.storage]
 * @param {{esNativa,descargarApk,abrirInstalador,abrirEnNavegador}} [deps.plataforma]
 * @param {Function} [deps.now]
 * @param {string} [deps.currentVersion]
 */
export function createVersionUpdater(deps = {}) {
    const fetchFn = deps.fetch || ((...args) => fetch(...args));
    const storage = deps.storage || storageReal;
    const plataforma = { ...plataformaReal, ...(deps.plataforma || {}) };
    const now = deps.now || Date.now;
    const getCurrentVersion = () => deps.currentVersion || env.APP_VERSION;

    /** Último Release publicado, o null. Fetch nativo para que un fallo de red no pase por los interceptores de auth. */
    async function fetchLatestRelease() {
        try {
            const res = await fetchFn(GITHUB_LATEST_URL, {
                headers: { Accept: "application/vnd.github+json" },
            });
            if (!res.ok) {
                logger.warn("VersionUpdate: GitHub respondió HTTP " + res.status);
                return null;
            }
            const data = await res.json();
            const version = parseTagVersion(data.tag_name);
            if (!version) return null;
            const assetName = `NOA-v${version}.apk`;
            const asset = (data.assets || []).find((x) => x && x.name === assetName) || null;
            return {
                version,
                apkUrl: asset ? asset.browser_download_url : null,
                releaseUrl: data.html_url || "",
            };
        } catch (e) {
            logger.warn("VersionUpdate: no se pudo consultar GitHub", { error: e.message });
            return null;
        }
    }

    function estado(currentVersion, latest, extra = {}) {
        return {
            hasUpdate: !!latest && compareVersions(latest.version, currentVersion) > 0,
            currentVersion,
            latestVersion: latest ? latest.version : null,
            apkUrl: latest ? latest.apkUrl : null,
            releaseUrl: latest ? latest.releaseUrl : "",
            ...extra,
        };
    }

    /**
     * Estado de la actualización. Con caché vigente (< 6 h) y sin `force` no
     * consulta GitHub. Si GitHub no responde, reutiliza el último aviso
     * cacheado para que la alerta salga igual.
     */
    async function checkForUpdate({ force = false } = {}) {
        const currentVersion = getCurrentVersion();
        const cached = storage.get();
        const cachedLatest = cached && cached.latestVersion
            ? { version: cached.latestVersion, apkUrl: cached.apkUrl || null, releaseUrl: cached.releaseUrl || "" }
            : null;

        if (!force && cached && now() - (cached.timestamp || 0) < CHECK_INTERVAL_MS) {
            return estado(currentVersion, cachedLatest, { fromCache: true });
        }

        const latest = await fetchLatestRelease();
        if (!latest) {
            return estado(currentVersion, cachedLatest, { fromCache: !!cachedLatest });
        }
        const result = estado(currentVersion, latest, { fromCache: false });
        storage.set({
            timestamp: now(),
            latestVersion: result.latestVersion,
            apkUrl: result.apkUrl,
            releaseUrl: result.releaseUrl,
        });
        return result;
    }

    /**
     * Instala la actualización: en nativo descarga el APK y abre el
     * instalador; en web, o si algo falla, abre la descarga en el navegador.
     * Retorna "instalador" | "navegador". `onStatus(texto)` informa el avance.
     */
    async function installUpdate(info, onStatus = () => {}) {
        const urlNavegador = info.apkUrl || info.releaseUrl;
        const abrirNavegador = () => {
            if (urlNavegador) plataforma.abrirEnNavegador(urlNavegador);
            return "navegador";
        };

        if (!info.apkUrl || !(await plataforma.esNativa())) return abrirNavegador();

        onStatus("Descargando actualización…");
        let filePath;
        try {
            filePath = await plataforma.descargarApk({
                url: info.apkUrl,
                nombre: `NOA-v${info.latestVersion}.apk`,
            });
        } catch (e) {
            logger.warn("VersionUpdate: fallo la descarga del APK", { error: e.message });
            onStatus("No se pudo descargar. Intenta desde el navegador.");
            return abrirNavegador();
        }

        onStatus("Abriendo instalador…");
        try {
            await plataforma.abrirInstalador(filePath);
            onStatus("");
            return "instalador";
        } catch (e) {
            // Si el instalador no se abre: el navegador descarga y el usuario instala.
            logger.warn("VersionUpdate: FileOpener fallo, abro navegador", { error: e.message });
            onStatus("Completa la instalación desde el navegador.");
            return abrirNavegador();
        }
    }

    return { checkForUpdate, installUpdate, clearUpdateCache: () => storage.clear() };
}

const updater = createVersionUpdater();

export const checkForUpdate = updater.checkForUpdate;
export const installUpdate = updater.installUpdate;
export const clearUpdateCache = updater.clearUpdateCache;

export default { checkForUpdate, installUpdate, clearUpdateCache, compareVersions, parseTagVersion };
