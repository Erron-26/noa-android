import { describe, it, expect, vi, afterEach } from "vitest";
import dashboardService from "../dashboard.service.js";
import { BaseService } from "@services/api/base.service.js";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("DashboardService", () => {
    it("extiende BaseService con el recurso dashboard", () => {
        expect(dashboardService).toBeInstanceOf(BaseService);
        expect(dashboardService.resourcePath).toBe("dashboard");
    });

    it("pide el resumen con los días indicados y devuelve el cuerpo tal cual", async () => {
        const cuerpo = { success: true, message: "ok", data: { stats: [] } };
        const espia = vi.spyOn(dashboardService, "_request").mockResolvedValue(cuerpo);
        const resultado = await dashboardService.getSummary(30);
        expect(espia).toHaveBeenCalledWith("GET", "/summary", { params: { days: 30 } });
        expect(resultado).toBe(cuerpo);
    });

    it("pide actividad reciente y alertas en sus rutas", async () => {
        const espia = vi.spyOn(dashboardService, "_request").mockResolvedValue({ success: true, data: {} });
        await dashboardService.getRecentActivity();
        await dashboardService.getAlerts();
        expect(espia).toHaveBeenCalledWith("GET", "/recent-activity");
        expect(espia).toHaveBeenCalledWith("GET", "/alerts");
    });

    it("pide el resumen del conductor con los días indicados", async () => {
        const espia = vi.spyOn(dashboardService, "_request").mockResolvedValue({ success: true, data: {} });
        await dashboardService.getConductorSummary(7);
        expect(espia).toHaveBeenCalledWith("GET", "/conductor-summary", { params: { days: 7 } });
    });

    it("sin red propaga el error sin transformarlo", async () => {
        const original = new Error("Sin conexión");
        vi.spyOn(dashboardService, "_request").mockRejectedValue(original);
        await expect(dashboardService.getSummary()).rejects.toBe(original);
    });
});
