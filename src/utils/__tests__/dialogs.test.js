import { describe, it, expect, vi } from "vitest";
import { createDialogs } from "../dialogs.js";

function swalFake(resultado = {}) {
    return {
        fire: vi.fn(async () => resultado),
        showLoading: vi.fn(),
        close: vi.fn(),
    };
}

function deps(swal, resultado) {
    const fake = swal || swalFake(resultado);
    return {
        dialogos: createDialogs({
            cargarSwal: async () => fake,
            logger: { warn: vi.fn(), error: vi.fn() },
            base: (opciones) => opciones,
        }),
        fake,
    };
}

describe("confirmar", () => {
    it("responde true solo si el usuario confirma", async () => {
        const { dialogos, fake } = deps(null, { isConfirmed: true });
        await expect(dialogos.confirmar({ titulo: "¿Eliminar?" })).resolves.toBe(true);
        expect(fake.fire).toHaveBeenCalledTimes(1);
        const opciones = fake.fire.mock.calls[0][0];
        expect(opciones.showCancelButton).toBe(true);
    });

    it("responde false al cancelar o descartar", async () => {
        const { dialogos } = deps(null, { isDismissed: true });
        await expect(dialogos.confirmar({})).resolves.toBe(false);
    });

    it("sin Swal no ejecuta a ciegas: responde false sin lanzar", async () => {
        const dialogos = createDialogs({
            cargarSwal: async () => { throw new Error("sin red para el chunk"); },
            logger: { warn: vi.fn() },
            base: (o) => o,
        });
        await expect(dialogos.confirmar({ titulo: "¿Eliminar?" })).resolves.toBe(false);
    });

    it("el modo peligro usa icono de advertencia", async () => {
        const { dialogos, fake } = deps(null, { isConfirmed: true });
        await dialogos.confirmar({ peligro: true });
        expect(fake.fire.mock.calls[0][0].icon).toBe("warning");
    });
});

describe("aviso", () => {
    it("muestra el modal y devuelve su resultado", async () => {
        const { dialogos, fake } = deps(null, { isConfirmed: true });
        const resultado = await dialogos.aviso({ titulo: "Atención", texto: "Sin sedes" });
        expect(resultado).toEqual({ isConfirmed: true });
        expect(fake.fire.mock.calls[0][0].confirmButtonText).toBe("Aceptar");
    });

    it("acepta html para contenido enriquecido", async () => {
        const { dialogos, fake } = deps(null, {});
        await dialogos.aviso({ titulo: "Enlace", html: "<b>url</b>" });
        expect(fake.fire.mock.calls[0][0].html).toBe("<b>url</b>");
    });

    it("sin Swal resuelve como descartado sin lanzar", async () => {
        const dialogos = createDialogs({
            cargarSwal: async () => { throw new Error("sin red"); },
            logger: { warn: vi.fn() },
            base: (o) => o,
        });
        await expect(dialogos.aviso({ titulo: "X" })).resolves.toEqual({ dismissed: true });
    });
});

describe("mostrarCargando / cerrar", () => {
    it("abre sin botones ni cierre externo y activa el spinner", async () => {
        const { dialogos, fake } = deps(null, {});
        await dialogos.mostrarCargando({ titulo: "Generando…" });
        const opciones = fake.fire.mock.calls[0][0];
        expect(opciones.allowOutsideClick).toBe(false);
        expect(opciones.showConfirmButton).toBe(false);
        opciones.didOpen();
        expect(fake.showLoading).toHaveBeenCalledTimes(1);
    });

    it("cerrar tras mostrar llama a close; sin abrir no lanza", async () => {
        const { dialogos, fake } = deps(null, {});
        expect(() => dialogos.cerrar()).not.toThrow();
        await dialogos.mostrarCargando({});
        dialogos.cerrar();
        expect(fake.close).toHaveBeenCalledTimes(1);
    });

    it("si todo falla (carga y registro), nada lanza", async () => {
        const dialogos = createDialogs({
            cargarSwal: async () => { throw new Error("roto"); },
            logger: { warn: () => { throw new Error("logger roto"); } },
            base: (o) => o,
        });
        await expect(dialogos.mostrarCargando({})).resolves.toBeUndefined();
        expect(() => dialogos.cerrar()).not.toThrow();
    });
});
