import { describe, it, expect } from "vitest";
import { describirEstado, TONOS } from "../estadoBadge.js";

describe("describirEstado", () => {
    it("traduce los estados conocidos a español con su tono", () => {
        expect(describirEstado("EN_CURSO")).toMatchObject({ etiqueta: "En curso", tono: "proceso" });
        expect(describirEstado("CERTIFICADA")).toMatchObject({ etiqueta: "Certificada", tono: "exito" });
        expect(describirEstado("PENDIENTE")).toMatchObject({ etiqueta: "Pendiente", tono: "pendiente" });
        expect(describirEstado("NO VIGENTE")).toMatchObject({ etiqueta: "No vigente", tono: "error" });
    });

    it("normaliza mayúsculas y espacios sobrantes", () => {
        expect(describirEstado("  activo ")).toMatchObject({ etiqueta: "Activo", tono: "exito" });
    });

    it("cada estado lleva siempre color e icono (nunca solo color)", () => {
        const d = describirEstado("PENDIENTE");
        expect(d.color).toBe(TONOS.pendiente.color);
        expect(d.icono).toBeTruthy();
    });

    it("usa el naranja solo para pendientes y alertas", () => {
        expect(describirEstado("PENDIENTE").color).toBe("var(--noa-alert)");
        expect(describirEstado("CERRADA_CON_EXCEPCION").color).toBe("var(--noa-alert)");
        expect(describirEstado("CERTIFICADA").color).not.toBe("var(--noa-alert)");
    });

    it("un estado desconocido se muestra tal cual, en tono neutro", () => {
        expect(describirEstado("LO_QUE_SEA")).toMatchObject({ etiqueta: "LO_QUE_SEA", tono: "neutro" });
    });

    it("sin estado (nulo o vacío) no rompe", () => {
        expect(describirEstado(null)).toMatchObject({ etiqueta: "Sin estado", tono: "neutro" });
        expect(describirEstado("   ")).toMatchObject({ etiqueta: "Sin estado", tono: "neutro" });
        expect(describirEstado(undefined)).toMatchObject({ etiqueta: "Sin estado", tono: "neutro" });
    });
});
