import { describe, it, expect, vi } from "vitest";
import {
    CLASE_PANTALLA_COMPLETA,
    activarPantallaCompleta,
    desactivarPantallaCompleta,
} from "../pantallaCompleta.js";

const documentoFalso = () => {
    const agregadas = [];
    const retiradas = [];
    return {
        agregadas,
        retiradas,
        body: {
            classList: {
                add: (c) => agregadas.push(c),
                remove: (c) => retiradas.push(c),
            },
        },
    };
};

describe("pantallaCompleta", () => {
    it("expone una sola clase compartida", () => {
        expect(CLASE_PANTALLA_COMPLETA).toBe("noa-fullbleed");
    });

    it("activar añade la clase al body", () => {
        const doc = documentoFalso();
        activarPantallaCompleta(doc);
        expect(doc.agregadas).toEqual(["noa-fullbleed"]);
    });

    it("desactivar retira la clase del body", () => {
        const doc = documentoFalso();
        desactivarPantallaCompleta(doc);
        expect(doc.retiradas).toEqual(["noa-fullbleed"]);
    });

    it("sin documento no lanza (pruebas, SSR)", () => {
        expect(() => activarPantallaCompleta(undefined)).not.toThrow();
        expect(() => desactivarPantallaCompleta(undefined)).not.toThrow();
    });

    it("con documento sin body no lanza", () => {
        expect(() => activarPantallaCompleta({})).not.toThrow();
        expect(() => desactivarPantallaCompleta({})).not.toThrow();
    });

    it("si el DOM falla, no lanza ni bloquea", () => {
        const doc = {
            body: {
                classList: {
                    add: () => { throw new Error("DOM roto"); },
                    remove: () => { throw new Error("DOM roto"); },
                },
            },
        };
        expect(() => activarPantallaCompleta(doc)).not.toThrow();
        expect(() => desactivarPantallaCompleta(doc)).not.toThrow();
    });

    it("usa la misma clase al activar y al desactivar", () => {
        const agregar = vi.fn();
        const retirar = vi.fn();
        const doc = { body: { classList: { add: agregar, remove: retirar } } };
        activarPantallaCompleta(doc);
        desactivarPantallaCompleta(doc);
        expect(agregar).toHaveBeenCalledWith(retirar.mock.calls[0][0]);
    });
});
