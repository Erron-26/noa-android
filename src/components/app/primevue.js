/**
 * Configuración de PrimeVue para NOA
 * Ubicación: src/components/app/primevue.js
 */

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

const primeVueOptions = {
    ripple: true,
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.system-never'
        },
    },
    // Tu locale ya estaba muy completo, lo mantengo intacto
    locale: {
        startsWith: 'Empieza con',
        contains: 'Contiene',
        notContains: 'No contiene',
        endsWith: 'Termina con',
        equals: 'Igual a',
        notEquals: 'Distinto de',
        noFilter: 'Sin filtro',
        clear: 'Limpiar',
        apply: 'Aplicar',
        accept: 'Aceptar',
        reject: 'Cancelar',
        emptyMessage: 'Sin opciones',
        emptyFilterMessage: 'Sin resultados',
    },
};

export function installPrimeVue(app) {
    app.use(PrimeVue, primeVueOptions);

    // Sin registro global de componentes (ARQ-013 paso 2): cada vista importa
    // localmente lo que usa (DataTable/Column, Select, MultiSelect, Button,
    // Menu, Dialog, Image) para que viajen en chunks diferidos, no en el arranque.
}