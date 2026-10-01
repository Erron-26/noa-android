/**
 * Servicio de detección de nueva versión (auto-update).
 * Ubicación: src/services/versionUpdate.service.js
 *
 * Consulta el último Release de GitHub y lo compara con la versión
 * compilada de la app (VITE_APP_VERSION). Nunca lanza excepciones:
 * si no hay internet o GitHub falla, reporta { hasUpdate: false }.
 */

import { logger } from "@utils/logger.js";
import env from "@utils/env.js";

const GITHUB_OWNER = "solucionesintegralesmanasas";
const GITHUB_REPO = "noa-android";
const GITHUB_LATEST_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

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

/**
 * Obtiene el último Release publicado. Usa fetch nativo (sin Axios) para
 * evitar que los interceptores de auth conviertan un fallo de red en 401.
 */
export async function fetchLatestRelease() {
    try {
        const res = await fetch(GITHUB_LATEST_URL, {
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
            tag: data.tag_name,
            version,
            apkUrl: asset ? asset.browser_download_url : null,
            releaseBody: data.body || "",
            releaseUrl: data.html_url || "",
        };
    } catch (e) {
        logger.warn("VersionUpdate: no se pudo consultar GitHub", { error: e.message });
        return null;
    }
}

/**
 * Orquestador: compara la versión compilada con la última publicada.
 * Retorna { hasUpdate, currentVersion, latestVersion, apkUrl, releaseUrl }.
 */
export async function checkForUpdate() {
    const currentVersion = env.APP_VERSION || "1.1.7";
    const latest = await fetchLatestRelease();
    if (!latest) {
        return { hasUpdate: false, currentVersion, latestVersion: null, apkUrl: null, releaseUrl: "" };
    }
    const hasUpdate = compareVersions(latest.version, currentVersion) > 0;
    return {
        hasUpdate,
        currentVersion,
        latestVersion: latest.version,
        apkUrl: latest.apkUrl,
        releaseUrl: latest.releaseUrl,
    };
}

export default { parseTagVersion, compareVersions, fetchLatestRelease, checkForUpdate };
