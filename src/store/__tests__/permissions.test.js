import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// La persistencia cifrada depende de Capacitor; aquí solo se prueba la decisión de roles.
vi.mock("@store/plugins/persistence.js", () => ({ permissionsPersistencePlugin: () => {} }));

import { usePermissionsStore } from "../modules/permissions.js";

function conRoles(roles, permissions = []) {
    const store = usePermissionsStore();
    store.setUser({ roles, permissions });
    return store;
}

describe("permissions store", () => {
    beforeEach(() => setActivePinia(createPinia()));

    describe("hasRole", () => {
        it("normaliza mayúsculas, guiones y guiones bajos", () => {
            const s = conRoles(["super_admin"]);
            expect(s.hasRole("SUPERADMIN")).toBe(true);
            expect(s.hasRole("super-admin")).toBe(true);
            expect(s.hasRole("CONDUCTOR")).toBe(false);
        });
        it("acepta roles como objetos con name", () => {
            expect(conRoles([{ name: "ADMIN_EMPRESA" }]).hasRole("admin_empresa")).toBe(true);
        });
        it("sin rol o sin roles devuelve false", () => {
            const s = conRoles([]);
            expect(s.hasRole("")).toBe(false);
            expect(s.hasRole("CONDUCTOR")).toBe(false);
        });
        it("tolera roles como objeto indexado", () => {
            expect(conRoles({ 0: "AFILIADO" }).hasRole("AFILIADO")).toBe(true);
        });
    });

    describe("isSuperAdmin / hasAnyRole", () => {
        it("isSuperAdmin reconoce las variantes del nombre", () => {
            expect(conRoles(["SUPERADMIN"]).isSuperAdmin).toBe(true);
            expect(conRoles(["super_admin"]).isSuperAdmin).toBe(true);
            expect(conRoles(["ADMIN_EMPRESA"]).isSuperAdmin).toBe(false);
        });
        it("hasAnyRole acepta cualquiera de la lista", () => {
            const s = conRoles(["EMPLEADO"]);
            expect(s.hasAnyRole("AFILIADO", "EMPLEADO", "CONDUCTOR")).toBe(true);
            expect(s.hasAnyRole("SUPERADMIN", "ADMIN_EMPRESA")).toBe(false);
        });
    });

    describe("can", () => {
        it("SUPERADMIN y administrador pasan siempre", () => {
            expect(conRoles(["SUPERADMIN"]).can("delete", "vehicles")).toBe(true);
            expect(conRoles(["administrador"]).can("delete", "vehicles")).toBe(true);
        });
        it("usa el formato recurso.accion", () => {
            const s = conRoles(["AFILIADO"], ["vehicles.index"]);
            expect(s.can("index", "vehicles")).toBe(true);
            expect(s.can("create", "vehicles")).toBe(false);
        });
        it("sin sujeto compara el permiso completo", () => {
            expect(conRoles(["AFILIADO"], ["locations.view"]).can("locations.view")).toBe(true);
        });
        it("el formato accion_recurso del antiguo rbac ya no concede acceso", () => {
            expect(conRoles(["AFILIADO"], ["index_vehicles"]).can("index", "vehicles")).toBe(false);
        });
    });

    it("clear deja al usuario sin roles ni permisos", () => {
        const s = conRoles(["SUPERADMIN"], ["a.b"]);
        s.clear();
        expect(s.isSuperAdmin).toBe(false);
        expect(s.can("b", "a")).toBe(false);
    });
});
