import { describe, it, expect } from "vitest";
import { primerNombre, iniciales, saludoPorHora, filtrarVehiculos, formatearNumero, formatearPlaca } from "../presentacionConductor.js";

describe("primerNombre", () => {
    it("capitaliza la primera palabra", () => {
        expect(primerNombre("  ALIRIO mateus torres ")).toBe("Alirio");
    });
    it("sin nombre usa el respaldo", () => {
        expect(primerNombre("")).toBe("Conductor");
        expect(primerNombre(null)).toBe("Conductor");
    });
});

describe("iniciales", () => {
    it("dos primeras palabras, tolerando espacios múltiples", () => {
        expect(iniciales("alirio   mateus torres")).toBe("AM");
    });
    it("una palabra usa sus dos primeras letras; vacío usa el respaldo", () => {
        expect(iniciales("Alirio")).toBe("AL");
        expect(iniciales("")).toBe("CO");
    });
});

describe("saludoPorHora", () => {
    it("cambia en 12 y 18 h", () => {
        expect(saludoPorHora(new Date(2026, 9, 7, 11))).toBe("Buenos días");
        expect(saludoPorHora(new Date(2026, 9, 7, 12))).toBe("Buenas tardes");
        expect(saludoPorHora(new Date(2026, 9, 7, 18))).toBe("Buenas noches");
    });
});

describe("filtrarVehiculos", () => {
    const lista = [
        { plate: "GUX649", brand: "Chevrolet", line: "NPR", internal_number: "A-12" },
        { plate: "ABC123", brand: "Hino", line: "Bus", internal_number: "" },
    ];
    it("sin consulta devuelve todo", () => {
        expect(filtrarVehiculos(lista, "  ")).toHaveLength(2);
    });
    it("busca por placa, marca, línea y número interno sin distinguir mayúsculas", () => {
        expect(filtrarVehiculos(lista, "gux")).toHaveLength(1);
        expect(filtrarVehiculos(lista, "hino")[0].plate).toBe("ABC123");
        expect(filtrarVehiculos(lista, "npr")).toHaveLength(1);
        expect(filtrarVehiculos(lista, "a-12")).toHaveLength(1);
    });
    it("tolera campos nulos", () => {
        expect(filtrarVehiculos([{ plate: null }], "x")).toEqual([]);
    });
});

describe("formatos", () => {
    it("formatearPlaca separa placas de 6 caracteres", () => {
        expect(formatearPlaca("gux649")).toBe("GUX · 649");
        expect(formatearPlaca("ABC12")).toBe("ABC12");
        expect(formatearPlaca("")).toBe("SIN-PLACA");
    });
    it("formatearNumero usa separador de miles es-CO y 0 si no es numérico", () => {
        expect(formatearNumero(1234567)).toBe(Number(1234567).toLocaleString("es-CO"));
        expect(formatearNumero(null)).toBe("0");
        expect(formatearNumero("abc")).toBe("0");
    });
});
