/**
 * Router Principal
 * Ubicación: src/router/index.js
 */

import { createRouter, createWebHashHistory } from "vue-router";
import { handleGlobalError } from "@utils/error-handler.js";
import { authGuard } from "@router/guards/auth.js";
import { permissionsGuard } from "@router/guards/permissions.js";
import { twoFAGuard } from "@router/guards/2fa.js";
import { useConfigStore } from "@store/modules/config.js";
import { authRoutes } from "@features/auth/routes.js";
import { dashboardRoutes } from "@features/dashboard/routes.js";
import { companyRoutes } from "@features/companies/routes.js";
import { branchesRoutes } from "@features/branches/routes.js";
import { economicActivitiesRoutes } from "@features/economicactivity/routes.js";
import { bankDetailsRoutes } from "@features/bankDetails/routes.js";
import { taxInformationRoutes } from "@features/taxInformation/routes.js";
import { enablingResolutionsRoutes } from "@features/enablingResolutions/routes.js";
import { conveyorCapacityRoutes } from "@features/conveyorCapacity/routes.js";
import { experiencesRoutes } from "@features/experiences/routes.js";
import { rupRecordsRoutes } from "@features/rupRecords/routes.js";
import { taxDeclarationsRoutes } from "@features/taxDeclarations/routes.js";
import { financialStatementsRoutes } from "@features/financialStatements/routes.js";
import { thirdPartiesRoutes } from "@features/thirdParties/routes.js";
import { vehiclesRoutes } from "@features/vehicles/routes.js";
import { vehicleInspectionsRoutes } from "@features/vehicleInspections/routes.js";
import { vehicleDocumentsRoutes } from "@features/vehicleDocuments/routes.js";
import { operationCardsRoutes } from "@features/operationCards/routes.js";
import { maintenanceRoutes } from "@features/maintenance/routes.js";
import { businessCollaborationAgreementsRoutes } from "@features/businessCollaborationAgreements/routes.js";
import { fuecRoutes } from "@features/fuec/routes.js";
import { affiliateAdminChargesRoutes } from "@features/affiliateAdminCharges/routes.js";
import { notificationsRoutes } from "@features/notifications/routes.js";
import { systemConfigurationRoutes } from "@features/systemConfiguration/routes.js";
import { serviceDeliveryControlSheetRoutes } from "@features/serviceDeliveryControlSheet/routes.js";
import { controlSheetsRoutes } from "@features/controlSheets/routes.js";
import { assistantRoutes } from "@features/assistant/routes.js";
import { employmentContractsRoutes } from "@features/humanResources/routes.js";
import { projectsRoutes } from "@features/projects/routes.js";
import { trackingRoutes } from "@features/tracking/routes.js";


const tenantGuard = (to, from, next) => next(); // TODO: Implementar tenantGuard

const createRoute = (path, component, options = {}) => ({
    path,
    name: options.name,
    component,
    meta: { layout: options.layout || "default", ...options.meta },
    children: options.children || [],
});

const initialView = import.meta.env.VITE_INITIAL_VIEW || "home";

const routes = [
    createRoute(
        "/",
        () => initialView === "login"
            ? import("@features/auth/views/LoginView.vue")
            : import("@pages/HomeView.vue"),
        {
            name: "home",
            layout: initialView === "login" ? "auth" : "default",
            meta: {
                public: true,
                title: initialView === "login" ? "Iniciar Sesión" : "Inicio",
                guestOnly: initialView === "login"
            }
        }
    ),

    // Auth & Dashboard (Modular Feature Routes)
    ...authRoutes,
    ...dashboardRoutes,
    ...companyRoutes,
    ...branchesRoutes,
    ...economicActivitiesRoutes,
    ...bankDetailsRoutes,
    ...taxInformationRoutes,
    ...enablingResolutionsRoutes,
    ...conveyorCapacityRoutes,
    ...experiencesRoutes,
    ...rupRecordsRoutes,
    ...taxDeclarationsRoutes,
    ...financialStatementsRoutes,
    ...thirdPartiesRoutes,
    ...vehiclesRoutes,
    ...vehicleInspectionsRoutes,
    ...vehicleDocumentsRoutes,
    ...operationCardsRoutes,
    ...maintenanceRoutes,
    ...businessCollaborationAgreementsRoutes,
    ...fuecRoutes,
    ...affiliateAdminChargesRoutes,
    ...notificationsRoutes,
    ...systemConfigurationRoutes,
    ...serviceDeliveryControlSheetRoutes,
    ...controlSheetsRoutes,
    ...assistantRoutes,
    ...employmentContractsRoutes,
    ...projectsRoutes,
    ...trackingRoutes,
    // Errores - Estructura estandarizada
    createRoute("/401", () => import("@pages/errors/Error401.vue"), { layout: "minimal", meta: { title: "No autorizado" } }),
    createRoute("/403", () => import("@pages/errors/Error403.vue"), { layout: "minimal", meta: { title: "Acceso denegado" } }),
    createRoute("/404", () => import("@pages/errors/Error404.vue"), { layout: "minimal", meta: { title: "Página no encontrada" } }),
    createRoute("/500", () => import("@pages/errors/Error500.vue"), { layout: "minimal", meta: { title: "Error del servidor" } }),

    // Ruta pública para firmar inspecciones
    createRoute("/firma-documentos/:uuid", () => import("@pages/public/PublicSignatureView.vue"), { layout: "minimal", meta: { public: true, title: "Firma Digital de Inspección" } }),

    // Ruta pública para validación de FUEC (QR)
    createRoute("/validacion-de-fuec/:id?", () => import("@pages/FuecValidationView.vue"), { layout: "minimal", meta: { public: true, title: "Validación de FUEC" } }),

    // Catch-all
    { path: "/:pathMatch(.*)*", redirect: "/404" }
];

export const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({ top: 0 }),
});

/**
 * Orquestador de Guards
 * Ejecución secuencial garantiza que la seguridad se valide en orden.
 */
router.beforeEach(async (to, from, next) => {
    // Activar barra de progreso (protegido por si Pinia aún no está lista)
    try { useConfigStore().startNavigation(); } catch (_) { /* Pinia no lista aún */ }

    const guards = [authGuard, twoFAGuard, tenantGuard, permissionsGuard];

    for (const guard of guards) {
        let result;
        const nextFn = (r) => { result = r; };

        await guard(to, from, nextFn);

        if (result !== undefined) return next(result);
    }

    next();
});

router.afterEach((to) => {
    document.title = `${import.meta.env.VITE_APP_NAME || 'NOA'} - ${to.meta.title || 'Inicio'}`;

    // Finalizar barra de progreso de navegación
    try { useConfigStore().endNavigation(); } catch (_) { /* Pinia no lista aún */ }
});

router.onError((error) => {
    handleGlobalError(error, "router");
});

export default router;