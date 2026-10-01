<script setup>
/**
 * @file InspeccionesView.vue
 * @description Vista de inspecciones preoperacionales del Portal Conductor
 * @author Darwin Montes
 */
import { ref, computed } from 'vue';
import DriverLayout from '@layouts/DriverLayout.vue';
import SectionHeader from '@components/driver/SectionHeader.vue';
import InspectionHistorySheet from '@features/vehicleInspections/components/InspectionHistorySheet.vue';

const filtros = ['Todas', 'Hoy', 'Esta semana'];
const filtroActivo = ref('Todas');

const inspecciones = ref([
    {
        placa: 'QWN628',
        modelo: 'TOYOTA 2026',
        fecha: '2026-09-28',
        conductor: 'Hector Emiro Avendaño Alvarez',
        km: 7937,
    },
]);

const showHistory = ref(false);

const inspeccionesFiltradas = computed(() => {
    if (filtroActivo.value === 'Todas') return inspecciones.value;
    return inspecciones.value;
});

const fmt = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const fmtKm = (v) => `${fmt.format(Number(v) || 0)} km`;

function setFiltro(f) {
    filtroActivo.value = f;
}

function onPdf() {
    // TODO: generar PDF
}

function openHistory() {
    showHistory.value = true;
}
</script>

<template>
    <DriverLayout title="Inspecciones">
        <SectionHeader
            icon="clipboard"
            icon-bg="var(--noa-blue-deep)"
            title="Inspecciones preoperacionales"
            :count="inspeccionesFiltradas.length"
        />

        <!-- Chips de filtro -->
        <div class="chips noa-hide-scrollbar">
            <button
                v-for="f in filtros"
                :key="f"
                type="button"
                class="chip"
                :class="{ 'chip-active': filtroActivo === f }"
                @click="setFiltro(f)"
            >
                {{ f }}
            </button>
        </div>

        <!-- Tarjetas de inspección -->
        <div class="cards-grid">
            <div v-for="insp in inspeccionesFiltradas" :key="insp.placa" class="insp-card">
                <div class="insp-bar"></div>
                <div class="insp-content">
                    <!-- Fila 1 -->
                    <div class="insp-row1">
                        <div class="insp-icon-box">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--noa-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>
                        </div>
                        <div class="insp-plate-info">
                            <div class="insp-plate">{{ insp.placa }}</div>
                            <div class="insp-model">{{ insp.modelo }}</div>
                        </div>
                        <div class="insp-date-chip">{{ insp.fecha }}</div>
                    </div>

                    <div class="insp-divider"></div>

                    <!-- Fila 2 -->
                    <div class="insp-row2">
                        <div class="insp-conductor">
                            <div class="insp-label">Conductor</div>
                            <div class="insp-conductor-name">{{ insp.conductor }}</div>
                        </div>
                        <div class="insp-km-chip">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                            {{ fmtKm(insp.km) }}
                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="insp-actions">
                        <button type="button" class="btn-pdf" @click="onPdf">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
                            PDF
                        </button>
                        <button type="button" class="btn-history" @click="openHistory">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--noa-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
                            Historial
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- FAB Nueva inspección -->
        <button type="button" class="fab">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
            Nueva inspección
        </button>

        <!-- Modal historial -->
        <InspectionHistorySheet
            v-model="showHistory"
            placa="QWN628"
            vehiculo="Toyota 2026"
            :total-inspecciones="1"
            :kilometraje-actual="7937"
            :km-recorridos="0"
        />
    </DriverLayout>
</template>

<style scoped>
.chips {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.chip {
    font-size: 11px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid var(--noa-border);
    color: var(--noa-text-3);
    white-space: nowrap;
    flex-shrink: 0;
}

.chip-active {
    background: var(--noa-navy);
    border-color: var(--noa-navy);
    color: #fff;
}

.cards-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.insp-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--noa-border);
}

.insp-bar {
    height: 3px;
    background: var(--noa-blue);
}

.insp-content {
    padding: 12px;
}

.insp-row1 {
    display: flex;
    align-items: center;
    gap: 10px;
}

.insp-icon-box {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--noa-blue-50);
    color: var(--noa-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.insp-plate-info {
    flex: 1;
    min-width: 0;
}

.insp-plate {
    font-size: 16px;
    font-weight: 700;
    color: var(--noa-text);
    line-height: 1.1;
}

.insp-model {
    font-size: 11px;
    color: var(--noa-muted);
    letter-spacing: .03em;
    margin-top: 1px;
}

.insp-date-chip {
    font-size: 11px;
    font-weight: 700;
    background: var(--noa-blue-100);
    color: var(--noa-blue-text);
    border-radius: 12px;
    padding: 3px 9px;
    white-space: nowrap;
    flex-shrink: 0;
}

.insp-divider {
    height: 1px;
    background: var(--noa-divider);
    margin: 11px 0;
}

.insp-row2 {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}

.insp-conductor {
    min-width: 0;
}

.insp-label {
    font-size: 11px;
    color: var(--noa-muted);
    margin-bottom: 3px;
}

.insp-conductor-name {
    font-size: 12px;
    font-weight: 700;
    color: var(--noa-text);
    line-height: 1.3;
}

.insp-km-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 700;
    color: var(--noa-blue-text);
    background: var(--noa-blue-50);
    border: 1px solid var(--noa-blue-100);
    border-radius: 9px;
    padding: 4px 8px;
    flex-shrink: 0;
    align-self: flex-start;
}

.insp-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.btn-pdf,
.btn-history {
    flex: 1;
    height: 40px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
}

.btn-pdf {
    background: var(--noa-blue);
    color: #fff;
}

.btn-history {
    background: var(--noa-surface);
    border: 1.5px solid var(--noa-border);
    color: var(--noa-text);
}

.fab {
    position: fixed;
    right: 12px;
    bottom: calc(var(--noa-nav-h) + var(--noa-safe-bottom) + 12px);
    background: var(--noa-blue);
    color: #fff;
    border-radius: 26px;
    padding: 12px 16px;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 40;
    box-shadow: 0 4px 12px rgba(37, 99, 235, .35);
}

/* Pantallas pequeñas */
@media (max-width: 359px) {
    .insp-row2 {
        flex-direction: column;
    }

    .insp-km-chip {
        align-self: flex-start;
    }
}

/* Tablet */
@media (min-width: 600px) {
    .cards-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
}

/* Landscape */
@media (max-height: 480px) {
    .fab {
        bottom: calc(52px + var(--noa-safe-bottom) + 12px);
    }
}
</style>
