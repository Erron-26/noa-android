import { createApp } from "vue";
import App from "./App.vue";
import "./assets/brand-tokens.css";
import "./assets/primevue-bridge.css";
import "./assets/modals-android.css";
// Estilos de SweetAlert2 (los toasts usan import() diferido, el CSS queda en el bundle inicial)
import "sweetalert2/dist/sweetalert2.min.css";
// Importación usando alias definido en vite.config.js -> @utils apunta a src/utils/
import { registerPlugins } from "@utils/plugins.js";

// Silenciar logs en producción globalmente (solo deja warn y error)
if (import.meta.env.MODE === 'production') {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    console.trace = noop;
}

/**
 * Muestra una interfaz de error minimalista y segura.
 */
function displayErrorUI(error) {
    const container = document.body;
    container.innerHTML = ""; // Limpieza total

    const div = document.createElement("div");
    div.style.cssText = "padding:2rem; font-family:system-ui; color:#d32f2f; line-height:1.5;";

    div.innerHTML = `
    <h2 style="margin-top:0">Error crítico de inicialización</h2>
    <p>La aplicación no pudo arrancar debido a un fallo en los plugins:</p>
    <pre style="background:#f8f9fa; padding:1rem; overflow:auto; border-radius:4px; font-size:0.85rem;">
    ${error?.message || "Error desconocido"}
    </pre>`;
    container.appendChild(div);
}

/**
 * Inicialización asíncrona de la aplicación.
 */
async function bootstrap() {
    try {
        const app = createApp(App);

        // Registro de plugins centralizado en src/utils/plugins.js
        await registerPlugins(app);

        // Montaje tras asegurar que todo el core está listo
        app.mount("#app");
    } catch (error) {
        console.error("❌ Fallo crítico en el bootstrap de la aplicación:", error);
        displayErrorUI(error);
    }
}

// Ejecución
bootstrap();

// Soporte HMR optimizado para la estructura real
if (import.meta.hot) {
    import.meta.hot.accept("./App.vue", () => {
        console.debug("HMR: App.vue actualizado");
    });

    import.meta.hot.accept("@utils/plugins.js", () => {
        console.debug("HMR: Reiniciando por cambio en plugins...");
        import.meta.hot.invalidate();
    });
}
