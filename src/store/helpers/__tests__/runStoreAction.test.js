import { describe, it, expect, vi } from "vitest";
import {
    runStoreAction,
    extractStoreErrorMessage,
    FALLBACK_ERROR_MESSAGE,
} from "../runStoreAction.js";

function estado() {
    return { loading: false, error: "previo" };
}

function deps() {
    return { notify: vi.fn(async () => {}), logger: { warn: vi.fn(), error: vi.fn() } };
}

describe("extractStoreErrorMessage", () => {
    it("prefiere el mensaje del backend al del error", () => {
        const error = new Error("Fallo genérico");
        error.response = { data: { message: "Vehículo no encontrado" } };
        expect(extractStoreErrorMessage(error, "Respaldo")).toBe("Vehículo no encontrado");
    });
    it("usa el mensaje del error si el backend no trae ninguno", () => {
        expect(extractStoreErrorMessage(new Error("Sin red"), "Respaldo")).toBe("Sin red");
    });
    it("acepta errores lanzados como texto", () => {
        expect(extractStoreErrorMessage("Corte de conexión", "Respaldo")).toBe("Corte de conexión");
    });
    it("usa el respaldo cuando el error viene vacío", () => {
        expect(extractStoreErrorMessage({}, "No se pudo cargar")).toBe("No se pudo cargar");
    });
    it("nunca queda vacío aunque falte todo", () => {
        expect(extractStoreErrorMessage(null, "")).toBe(FALLBACK_ERROR_MESSAGE);
    });
});

describe("runStoreAction", () => {
    it("en éxito devuelve el valor y limpia el estado sin avisar", async () => {
        const store = estado();
        const d = deps();
        const resultado = await runStoreAction(store, async () => 42, "Respaldo", d);
        expect(resultado).toBe(42);
        expect(store.loading).toBe(false);
        expect(store.error).toBe(null);
        expect(d.notify).not.toHaveBeenCalled();
    });

    it("con error de red guarda el mensaje, avisa una vez y relanza el original", async () => {
        const store = estado();
        const d = deps();
        const original = new Error("Sin conexión");
        original.code = "ERR_NETWORK";
        await expect(runStoreAction(store, async () => { throw original; }, "Respaldo", d))
            .rejects.toBe(original);
        expect(store.error).toBe("Sin conexión");
        expect(store.loading).toBe(false);
        expect(d.notify).toHaveBeenCalledTimes(1);
        expect(d.notify).toHaveBeenCalledWith("Error", "Sin conexión", "error");
    });

    it("con 500 usa el mensaje del backend", async () => {
        const store = estado();
        const d = deps();
        const original = new Error("Request failed with status code 500");
        original.response = { status: 500, data: { message: "Error interno del servidor" } };
        await expect(runStoreAction(store, async () => { throw original; }, "Respaldo", d))
            .rejects.toBe(original);
        expect(store.error).toBe("Error interno del servidor");
        expect(d.notify).toHaveBeenCalledWith("Error", "Error interno del servidor", "error");
    });

    it("con 422 guarda el error pero no dispara el aviso global", async () => {
        const store = estado();
        const d = deps();
        const original = new Error("Validation failed");
        original.response = { status: 422, data: { message: "La placa ya existe" } };
        await expect(runStoreAction(store, async () => { throw original; }, "Respaldo", d))
            .rejects.toBe(original);
        expect(store.error).toBe("La placa ya existe");
        expect(store.loading).toBe(false);
        expect(d.notify).not.toHaveBeenCalled();
    });

    it("si el aviso falla, igual restablece y relanza el error original", async () => {
        const store = estado();
        const d = deps();
        d.notify.mockRejectedValueOnce(new Error("SweetAlert roto"));
        const original = new Error("Sin conexión");
        await expect(runStoreAction(store, async () => { throw original; }, "Respaldo", d))
            .rejects.toBe(original);
        expect(store.error).toBe("Sin conexión");
        expect(store.loading).toBe(false);
        expect(d.logger.warn).toHaveBeenCalled();
    });

    it("si el registro falla, el flujo no se rompe", async () => {
        const store = estado();
        const d = deps();
        d.logger.error.mockImplementationOnce(() => { throw new Error("Logger roto"); });
        const resultado = await runStoreAction(store, async () => "ok", "Respaldo", d);
        expect(resultado).toBe("ok");
        expect(store.loading).toBe(false);
    });

    it("captura acciones que lanzan de forma síncrona", async () => {
        const store = estado();
        const d = deps();
        const original = new Error("Fallo inmediato");
        await expect(runStoreAction(store, () => { throw original; }, "Respaldo", d))
            .rejects.toBe(original);
        expect(store.loading).toBe(false);
    });
});
