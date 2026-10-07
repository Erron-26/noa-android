import { describe, it, expect, vi } from "vitest";
import {
    compareVersions,
    parseTagVersion,
    createVersionUpdater,
    CHECK_INTERVAL_MS,
} from "../versionUpdate.service.js";

const release = (tag, { conApk = true } = {}) => ({
    ok: true,
    status: 200,
    json: async () => ({
        tag_name: tag,
        html_url: `https://github.com/x/releases/${tag}`,
        assets: conApk
            ? [{ name: `NOA-v${parseTagVersion(tag)}.apk`, browser_download_url: `https://dl/${tag}.apk` }]
            : [],
    }),
});

function memoria(inicial = null) {
    let valor = inicial;
    return {
        get: () => valor,
        set: (v) => { valor = v; },
        clear: () => { valor = null; },
        actual: () => valor,
    };
}

describe("compareVersions", () => {
    it("compara por segmentos numéricos", () => {
        expect(compareVersions("1.1.8", "1.1.7")).toBe(1);
        expect(compareVersions("1.1.7", "1.1.8")).toBe(-1);
        expect(compareVersions("1.10.0", "1.9.0")).toBe(1);
        expect(compareVersions("v1.1.7", "1.1.7")).toBe(0);
    });
    it("tolera segmentos faltantes y sufijos", () => {
        expect(compareVersions("1.0", "1.0.0")).toBe(0);
        expect(compareVersions("1.2.0-beta", "1.2.0")).toBe(0);
    });
});

describe("checkForUpdate", () => {
    it("detecta una versión mayor y guarda la caché", async () => {
        const storage = memoria();
        const u = createVersionUpdater({
            fetch: async () => release("v1.2.0"),
            storage,
            currentVersion: "1.1.7",
            now: () => 1000,
        });
        const r = await u.checkForUpdate();
        expect(r).toMatchObject({ hasUpdate: true, latestVersion: "1.2.0", apkUrl: "https://dl/v1.2.0.apk" });
        expect(storage.actual()).toMatchObject({ timestamp: 1000, latestVersion: "1.2.0" });
    });

    it("no hay actualización si la versión publicada es igual o menor", async () => {
        const u = createVersionUpdater({ fetch: async () => release("v1.1.7"), storage: memoria(), currentVersion: "1.1.7" });
        expect((await u.checkForUpdate()).hasUpdate).toBe(false);
    });

    it("sin asset del APK devuelve apkUrl nulo pero conserva el aviso", async () => {
        const u = createVersionUpdater({ fetch: async () => release("v1.2.0", { conApk: false }), storage: memoria(), currentVersion: "1.1.7" });
        const r = await u.checkForUpdate();
        expect(r).toMatchObject({ hasUpdate: true, apkUrl: null });
        expect(r.releaseUrl).toContain("v1.2.0");
    });

    it("no consulta GitHub con la caché vigente y sin force", async () => {
        const fetch = vi.fn(async () => release("v9.9.9"));
        const storage = memoria({ timestamp: 1000, latestVersion: "1.2.0", apkUrl: "u", releaseUrl: "r" });
        const u = createVersionUpdater({ fetch, storage, currentVersion: "1.1.7", now: () => 1000 + CHECK_INTERVAL_MS - 1 });
        const r = await u.checkForUpdate();
        expect(fetch).not.toHaveBeenCalled();
        expect(r).toMatchObject({ hasUpdate: true, latestVersion: "1.2.0", fromCache: true });
    });

    it("recalcula contra la versión actual: tras actualizar, la caché ya no avisa", async () => {
        const storage = memoria({ timestamp: 1000, latestVersion: "1.2.0" });
        const u = createVersionUpdater({ fetch: vi.fn(), storage, currentVersion: "1.2.0", now: () => 2000 });
        expect((await u.checkForUpdate()).hasUpdate).toBe(false);
    });

    it("consulta de nuevo con la caché vencida o con force", async () => {
        const fetch = vi.fn(async () => release("v1.3.0"));
        const storage = memoria({ timestamp: 0, latestVersion: "1.2.0" });
        const u = createVersionUpdater({ fetch, storage, currentVersion: "1.1.7", now: () => CHECK_INTERVAL_MS + 1 });
        expect((await u.checkForUpdate()).latestVersion).toBe("1.3.0");
        await u.checkForUpdate({ force: true });
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("sin red reutiliza el aviso cacheado", async () => {
        const storage = memoria({ timestamp: 0, latestVersion: "1.2.0", apkUrl: "u", releaseUrl: "r" });
        const u = createVersionUpdater({
            fetch: async () => { throw new Error("offline"); },
            storage,
            currentVersion: "1.1.7",
            now: () => CHECK_INTERVAL_MS * 10,
        });
        expect(await u.checkForUpdate({ force: true })).toMatchObject({ hasUpdate: true, latestVersion: "1.2.0", fromCache: true });
    });

    it("sin red y sin caché reporta que no hay actualización, sin lanzar", async () => {
        const u = createVersionUpdater({ fetch: async () => { throw new Error("offline"); }, storage: memoria(), currentVersion: "1.1.7" });
        expect(await u.checkForUpdate()).toMatchObject({ hasUpdate: false, latestVersion: null });
    });

    it("HTTP no exitoso o tag vacío no avisa", async () => {
        const mal = createVersionUpdater({ fetch: async () => ({ ok: false, status: 403 }), storage: memoria(), currentVersion: "1.1.7" });
        expect((await mal.checkForUpdate()).hasUpdate).toBe(false);
        const vacio = createVersionUpdater({ fetch: async () => ({ ok: true, json: async () => ({}) }), storage: memoria(), currentVersion: "1.1.7" });
        expect((await vacio.checkForUpdate()).hasUpdate).toBe(false);
    });
});

describe("installUpdate", () => {
    const info = { apkUrl: "https://dl/a.apk", releaseUrl: "https://r", latestVersion: "1.2.0" };
    const crear = (plataforma) => createVersionUpdater({ storage: memoria(), currentVersion: "1.1.7", plataforma });

    it("en web abre el navegador sin descargar", async () => {
        const p = { esNativa: async () => false, descargarApk: vi.fn(), abrirEnNavegador: vi.fn() };
        expect(await crear(p).installUpdate(info)).toBe("navegador");
        expect(p.descargarApk).not.toHaveBeenCalled();
        expect(p.abrirEnNavegador).toHaveBeenCalledWith("https://dl/a.apk");
    });

    it("en nativo sin APK abre la página del release", async () => {
        const p = { esNativa: async () => true, descargarApk: vi.fn(), abrirEnNavegador: vi.fn() };
        await crear(p).installUpdate({ ...info, apkUrl: null });
        expect(p.abrirEnNavegador).toHaveBeenCalledWith("https://r");
    });

    it("en nativo descarga y abre el instalador", async () => {
        const estados = [];
        const p = {
            esNativa: async () => true,
            descargarApk: vi.fn(async () => "/cache/NOA.apk"),
            abrirInstalador: vi.fn(async () => {}),
            abrirEnNavegador: vi.fn(),
        };
        expect(await crear(p).installUpdate(info, (t) => estados.push(t))).toBe("instalador");
        expect(p.descargarApk).toHaveBeenCalledWith({ url: "https://dl/a.apk", nombre: "NOA-v1.2.0.apk" });
        expect(p.abrirInstalador).toHaveBeenCalledWith("/cache/NOA.apk");
        expect(p.abrirEnNavegador).not.toHaveBeenCalled();
        expect(estados).toEqual(["Descargando actualización…", "Abriendo instalador…", ""]);
    });

    it("si falla la descarga cae al navegador", async () => {
        const estados = [];
        const p = {
            esNativa: async () => true,
            descargarApk: async () => { throw new Error("sin espacio"); },
            abrirInstalador: vi.fn(),
            abrirEnNavegador: vi.fn(),
        };
        expect(await crear(p).installUpdate(info, (t) => estados.push(t))).toBe("navegador");
        expect(p.abrirInstalador).not.toHaveBeenCalled();
        expect(estados.at(-1)).toBe("No se pudo descargar. Intenta desde el navegador.");
    });

    it("si no abre el instalador cae al navegador", async () => {
        const p = {
            esNativa: async () => true,
            descargarApk: async () => "/cache/NOA.apk",
            abrirInstalador: async () => { throw new Error("sin permiso"); },
            abrirEnNavegador: vi.fn(),
        };
        expect(await crear(p).installUpdate(info)).toBe("navegador");
        expect(p.abrirEnNavegador).toHaveBeenCalledWith("https://dl/a.apk");
    });
});
