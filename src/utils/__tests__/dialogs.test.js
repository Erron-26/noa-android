import { describe, it, expect, vi } from "vitest";
import { createDialogs, escaparHtml } from "../dialogs.js";

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

    it("si cerrar corre mientras Swal se importa, el modal tardío no se abre", async () => {
        let resolver;
        const carga = new Promise((res) => { resolver = res; });
        const fake = swalFake({});
        const { dialogos } = deps(null, null);
        const conCarga = createDialogs({
            cargarSwal: () => carga.then(() => fake),
            logger: { warn: vi.fn() },
            base: (o) => o,
        });
        const promesa = conCarga.mostrarCargando({});
        conCarga.cerrar();
        resolver();
        await promesa;
        expect(fake.fire).not.toHaveBeenCalled();
        expect(dialogos).toBeDefined();
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

describe("escaparHtml", () => {
    it("escapa una URL con caracteres peligrosos", () => {
        expect(escaparHtml('https://x.test/?a=1&b=<script>"q\'')).toBe(
            'https://x.test/?a=1&amp;b=&lt;script&gt;&quot;q&#39;'
        );
    });
    it("tolera nulo", () => {
        expect(escaparHtml(null)).toBe("");
    });
});

describe("copiarEnlace", () => {
    function conPortapapeles(resultado, portapapeles) {
        const fake = swalFake(resultado);
        const notify = vi.fn(async () => {});
        const dialogos = createDialogs({
            cargarSwal: async () => fake,
            logger: { warn: vi.fn(), error: vi.fn() },
            base: (o) => o,
            notify,
            portapapeles,
        });
        return { dialogos, fake, notify };
    }

    it("copia la URL exacta y avisa el éxito", async () => {
        const portapapeles = { writeText: vi.fn(async () => {}) };
        const { dialogos, fake, notify } = conPortapapeles({ isConfirmed: true }, portapapeles);
        const url = "https://firma.test/abc?x=1&y=2";
        await expect(dialogos.copiarEnlace(url, { descripcion: "Vigencia <b>1 hora</b>:" })).resolves.toBe("copiado");
        expect(portapapeles.writeText).toHaveBeenCalledWith(url);
        const html = fake.fire.mock.calls[0][0].html;
        expect(html).toContain("https://firma.test/abc?x=1&amp;y=2");
        expect(html).not.toContain("?x=1&y=2");
        expect(notify).toHaveBeenCalledWith("¡Copiado!", expect.any(String), "success");
    });

    it("descartado no toca el portapapeles", async () => {
        const portapapeles = { writeText: vi.fn(async () => {}) };
        const { dialogos } = conPortapapeles({ isDismissed: true }, portapapeles);
        await expect(dialogos.copiarEnlace("https://x.test")).resolves.toBe("descartado");
        expect(portapapeles.writeText).not.toHaveBeenCalled();
    });

    it("portapapeles roto registra y avisa sin lanzar", async () => {
        const portapapeles = { writeText: vi.fn(async () => { throw new Error("denegado"); }) };
        const { dialogos, notify } = conPortapapeles({ isConfirmed: true }, portapapeles);
        await expect(dialogos.copiarEnlace("https://x.test")).resolves.toBe("fallo-copia");
        expect(notify).toHaveBeenCalledWith("Error", expect.any(String), "warning");
    });

    it("sin portapapeles ni Swal, resuelve sin lanzar", async () => {
        const dialogos = createDialogs({
            cargarSwal: async () => { throw new Error("sin red"); },
            logger: { warn: vi.fn(), error: vi.fn() },
            base: (o) => o,
            notify: vi.fn(async () => {}),
            portapapeles: null,
        });
        await expect(dialogos.copiarEnlace("https://x.test")).resolves.toBe("descartado");
    });
});
