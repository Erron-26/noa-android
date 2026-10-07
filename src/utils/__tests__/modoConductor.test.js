import { describe, it, expect } from "vitest";
import { esModoConductor, esDashboardDeConductor, esMovilConductor, esRutaOperativaConductor } from "../modoConductor.js";

describe("esModoConductor", () => {
    it("usa el rol salvo que ?view lo fuerce", () => {
        expect(esModoConductor({ esConductor: true })).toBe(true);
        expect(esModoConductor({ esConductor: false })).toBe(false);
        expect(esModoConductor({ view: "conductor", esConductor: false })).toBe(true);
        expect(esModoConductor({ view: "admin", esConductor: true })).toBe(false);
    });
});

describe("esDashboardDeConductor", () => {
    it("la ruta del conductor siempre cuenta, el panel general solo con el rol", () => {
        expect(esDashboardDeConductor({ path: "/dashboard/conductor" })).toBe(true);
        expect(esDashboardDeConductor({ path: "/dashboard", esConductor: true })).toBe(true);
        expect(esDashboardDeConductor({ path: "/dashboard", esConductor: false })).toBe(false);
        expect(esDashboardDeConductor({ path: "/vehiculos", esConductor: true })).toBe(false);
    });
    it("?view=admin lo anula incluso en la ruta del conductor", () => {
        expect(esDashboardDeConductor({ path: "/dashboard/conductor", view: "admin" })).toBe(false);
    });
});

describe("esMovilConductor", () => {
    const base = { path: "/dashboard", esConductor: true };
    it("Android nativo con rol conductor en ruta operativa", () => {
        expect(esMovilConductor({ ...base, esAndroidNativo: true })).toBe(true);
    });
    it("conductor en web: solo hasta 768 px", () => {
        expect(esMovilConductor({ ...base, ancho: 700 })).toBe(true);
        expect(esMovilConductor({ ...base, ancho: 768 })).toBe(true);
        expect(esMovilConductor({ ...base, ancho: 769 })).toBe(false);
    });
    it("un administrador en Android nativo no recibe el shell del conductor", () => {
        expect(esMovilConductor({ path: "/dashboard", esConductor: false, esAndroidNativo: true })).toBe(false);
    });
    it("fuera de las rutas operativas no aplica", () => {
        expect(esMovilConductor({ ...base, path: "/configuracion/marcas", esAndroidNativo: true })).toBe(false);
    });
    it("?view=conductor previsualiza y ?view=admin anula", () => {
        expect(esMovilConductor({ path: "/dashboard", view: "conductor", esConductor: false })).toBe(true);
        expect(esMovilConductor({ ...base, view: "admin", esAndroidNativo: true })).toBe(false);
    });
});

describe("esRutaOperativaConductor", () => {
    it("reconoce prefijos", () => {
        expect(esRutaOperativaConductor("/planilla-de-control-de-prestacion-servicios/12")).toBe(true);
        expect(esRutaOperativaConductor("/roles-permissions")).toBe(false);
    });
});
