import { describe, it, expect } from "vitest";
import { describirEstado, TONOS } from "../estadoBadge.js";

describe("describirEstado", () => {
    it("traduce los estados conocidos a español con su tono", () => {
        expect(describirEstado("EN_CURSO")).toMatchObject({ etiqueta: "En curso", tono: "proceso" });
        expect(describirEstado("CERTIFICADA")).toMatchObject({ etiqueta: "Certificada", tono: "exito" });
        expect(describirEstado("PENDIENTE")).toMatchObject({ etiqueta: "Pendiente", tono: "pendiente" });
        expect(describirEstado("NO VIGENTE")).toMatchObject({ etiqueta: "No vigente", tono: "error" });
        expect(describirEstado("FIRMADO")).toMatchObject({ etiqueta: "Firmado", tono: "exito" });
    });

    it("normaliza mayúsculas y espacios sobrantes", () => {
        expect(describirEstado("  activo ")).toMatchObject({ etiqueta: "Activo", tono: "exito" });
    });

    it("cada estado lleva fondo, texto, borde e icono con contraste (nunca solo color)", () => {
        const d = describirEstado("PENDIENTE");
        expect(d.fondo).toBe(TONOS.pendiente.fondo);
        expect(d.texto).toBe(TONOS.pendiente.texto);
        expect(d.borde).toBeTruthy();
        expect(d.icono).toBeTruthy();
    });

    it("usa el naranja solo en el borde de pendientes y alertas", () => {
        expect(describirEstado("PENDIENTE").borde).toBe("var(--noa-alert)");
        expect(describirEstado("CERRADA_CON_EXCEPCION").borde).toBe("var(--noa-alert)");
        expect(describirEstado("CERTIFICADA").borde).not.toBe("var(--noa-alert)");
    });

    it("un estado desconocido se humaniza en tono neutro", () => {
        expect(describirEstado("EN_REVISION")).toMatchObject({ etiqueta: "En Revision", tono: "neutro" });
    });

    it("sin estado (nulo o vacío) no rompe", () => {
        expect(describirEstado(null)).toMatchObject({ etiqueta: "Sin estado", tono: "neutro" });
        expect(describirEstado("   ")).toMatchObject({ etiqueta: "Sin estado", tono: "neutro" });
        expect(describirEstado(undefined)).toMatchObject({ etiqueta: "Sin estado", tono: "neutro" });
    });
});
