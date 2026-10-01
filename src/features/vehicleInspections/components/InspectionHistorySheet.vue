<script setup>
/**
 * Bottom sheet "Historial de Inspecciones" — app NOA Transportes (Android/Capacitor).
 * Ubicación: src/features/vehicleInspections/components/InspectionHistorySheet.vue
 *
 * Solo lectura, sin librerías de UI externas (CSS puro + SVG inline).
 * Uso: <InspectionHistorySheet v-model="show" placa="QWN628" ... />
 */
import { computed, watch } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    placa: { type: String, default: 'QWN628' },
    vehiculo: { type: String, default: 'Toyota 2026' },
    totalInspecciones: { type: Number, default: 1 },
    kilometrajeActual: { type: Number, default: 7937 },
    kmRecorridos: { type: Number, default: 0 },
    registros: {
        type: Array,
        default: () => ([
            { fecha: '2026-09-28', reciente: true, inspector: 'Jefe / Cristian', iniciales: 'JC', odometro: 7937 },
        ]),
    },
});

const emit = defineEmits(['update:modelValue', 'close']);

const fmt = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const fmtKm = (v) => fmt.format(Number(v) || 0);

function close() {
    emit('update:modelValue', false);
    emit('close');
}

/* StatusBar del mismo azul del header mientras el sheet está abierto.
 * Import dinámico con try/catch: el plugin @capacitor/status-bar no está
 * instalado; si existe se usa, si no se omite sin romper la app. */
async function paintStatusBar(open) {
    try {
        const { StatusBar } = await import('@capacitor/status-bar');
        await StatusBar.setBackgroundColor({ color: open ? '#0c2461' : '#001C41' });
    } catch {
        /* Plugin no disponible: se omite silenciosamente */
    }
}

watch(() => props.modelValue, (open) => {
    try {
        document.body.style.overflow = open ? 'hidden' : '';
    } catch {
        /* DOM no disponible */
    }
    paintStatusBar(open);
});

const kmActualFmt = computed(() => fmtKm(props.kilometrajeActual));
const kmRecorridosFmt = computed(() => `+${fmtKm(props.kmRecorridos)}`);
</script>

<template>
    <Teleport to="body">
        <Transition name="noa-sheet-anim">
            <div v-if="modelValue" class="noa-overlay" @click.self="close" role="dialog" aria-modal="true" aria-label="Historial de inspecciones">
                <div class="noa-sheet">
                    <!-- 1. Drag handle (decorativo) -->
                    <div class="noa-drag"><span class="noa-drag-bar"></span></div>

                    <!-- 2. Header -->
                    <div class="noa-header">
                        <div class="noa-header-left">
                            <div class="noa-icon-box" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
                            </div>
                            <div>
                                <div class="noa-htitle">Historial de inspecciones</div>
                                <div class="noa-hsub">Portal Conductor · NOA Transportes</div>
                            </div>
                        </div>
                        <button type="button" class="noa-close" aria-label="Cerrar historial" @click="close">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <!-- Contenido con scroll interno -->
                    <div class="noa-body">
                        <!-- 3. Banner vehículo -->
                        <div class="noa-vehicle">
                            <div class="noa-plate"><span>{{ placa }}</span></div>
                            <div class="noa-vinfo">
                                <div class="noa-vname">{{ vehiculo }}</div>
                                <div class="noa-vdesc">Historial de kilometraje e inspecciones</div>
                            </div>
                            <div class="noa-vbadge">
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M2 22h20" /><path d="M10 6h4M10 10h4M10 14h4" /></svg>
                                Público
                            </div>
                        </div>

                        <!-- 4. Stats grid -->
                        <div class="noa-stats">
                            <div class="noa-stat ns-blue">
                                <div class="noa-stat-label">Total inspecciones</div>
                                <div class="noa-stat-row">
                                    <div class="noa-stat-val">{{ totalInspecciones }}</div>
                                    <div class="noa-stat-icon si-blue" aria-hidden="true">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div class="noa-stat ns-cyan">
                                <div class="noa-stat-label">Kilometraje actual</div>
                                <div class="noa-stat-row">
                                    <div class="noa-stat-val noa-stat-km">{{ kmActualFmt }}<span class="noa-stat-unit">km</span></div>
                                    <div class="noa-stat-icon si-cyan" aria-hidden="true">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div class="noa-stat ns-green noa-stat-wide">
                                <div class="noa-stat-label">Km totales recorridos</div>
                                <div class="noa-stat-row">
                                    <div class="noa-stat-val noa-stat-green">{{ kmRecorridosFmt }}<span class="noa-stat-unit">km en este período</span></div>
                                    <div class="noa-stat-icon si-green" aria-hidden="true">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 5. Tabla de registros -->
                        <div class="noa-section-title">Registros de inspección</div>
                        <div class="noa-table-wrap">
                            <div class="noa-table-head">
                                <div class="noa-th">Fecha</div>
                                <div class="noa-th">Inspector</div>
                                <div class="noa-th noa-th-right">Odómetro</div>
                            </div>
                            <div v-for="(r, i) in registros" :key="i" class="noa-table-row">
                                <div>
                                    <div class="noa-date-val">{{ r.fecha }}</div>
                                    <span v-if="r.reciente" class="noa-badge-reciente">Reciente</span>
                                </div>
                                <div class="noa-inspector">
                                    <div class="noa-avatar">{{ r.iniciales }}</div>
                                    <div class="noa-iname">{{ r.inspector }}</div>
                                </div>
                                <div class="noa-odo">{{ fmtKm(r.odometro) }} km</div>
                            </div>
                            <div class="noa-total-row">
                                <span class="noa-total-label">Total recorrido histórico:</span>
                                <span class="noa-total-val">{{ fmtKm(kmRecorridos) }} km</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style>
/* ═══ Variables base responsive (valores del mockup como punto medio) ═══ */
:root {
    --noa-pad: clamp(12px, 3.5vw, 16px);
    --noa-gap: clamp(8px, 2vw, 11px);
    --noa-radius: clamp(10px, 2.5vw, 12px);
    --noa-font-xs: clamp(8px, 2.2vw, 10px);
    --noa-font-sm: clamp(11px, 2.8vw, 13px);
    --noa-font-md: clamp(12px, 3.2vw, 14px);
    --noa-font-lg: clamp(18px, 4.5vw, 24px);
    --noa-font-xl: clamp(18px, 5.5vw, 22px);
    --noa-stat-icon: clamp(28px, 7vw, 32px);
    --noa-avatar: clamp(20px, 5.5vw, 24px);
    --noa-sheet-radius: clamp(16px, 4vw, 20px);
}

/* ═══ Overlay ═══ */
.noa-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(12, 33, 97, 0.55);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    font-family: 'Inter', system-ui, sans-serif;
}

/* ═══ Bottom sheet ═══ */
.noa-sheet {
    width: 100%;
    background: #ffffff;
    border-radius: var(--noa-sheet-radius) var(--noa-sheet-radius) 0 0;
    overflow: hidden;
    max-height: 92dvh;
    display: flex;
    flex-direction: column;
}

.noa-body {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px));
}

/* Animación de entrada */
.noa-sheet-anim-enter-from { transform: translateY(100%); opacity: 0; }
.noa-sheet-anim-enter-active { transition: transform 300ms cubic-bezier(.32, 1, .6, 1), opacity 200ms ease; }
.noa-sheet-anim-enter-to { transform: translateY(0); opacity: 1; }
.noa-sheet-anim-leave-active { transition: transform 250ms ease-in, opacity 200ms ease; }
.noa-sheet-anim-leave-to { transform: translateY(100%); opacity: 0; }

/* ═══ 1. Drag handle ═══ */
.noa-drag { display: flex; justify-content: center; padding: 10px 0 2px; }
.noa-drag-bar { width: 36px; height: 4px; background: #e2e8f0; border-radius: 2px; }

/* ═══ 2. Header ═══ */
.noa-header {
    background: #0c2461;
    padding: 12px 16px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}
.noa-header-left { display: flex; align-items: center; gap: 9px; }
.noa-icon-box {
    width: 32px; height: 32px;
    background: rgba(255, 255, 255, .12);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
}
.noa-htitle { font-size: var(--noa-font-md); font-weight: 700; color: #fff; line-height: 1.1; }
.noa-hsub { font-size: var(--noa-font-xs); color: #93c5fd; margin-top: 1px; }
.noa-close {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, .2);
    background: rgba(255, 255, 255, .08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
}

/* ═══ 3. Banner vehículo ═══ */
.noa-vehicle {
    margin: 12px 14px;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 11px 13px;
    display: flex;
    align-items: center;
    gap: 11px;
}
.noa-plate {
    background: #1d4ed8;
    border-radius: 7px;
    padding: 5px 10px;
    flex-shrink: 0;
}
.noa-plate span { font-size: 12px; font-weight: 700; color: #fff; letter-spacing: .06em; }
.noa-vinfo { min-width: 0; }
.noa-vname { font-size: 13px; font-weight: 700; color: #1e293b; }
.noa-vdesc { font-size: 10px; color: #94a3b8; margin-top: 1px; line-height: 1.3; }
.noa-vbadge {
    margin-left: auto;
    flex-shrink: 0;
    font-size: 9px;
    font-weight: 600;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    padding: 3px 8px;
    border-radius: 20px;
    color: #64748b;
    white-space: nowrap;
    display: flex; align-items: center; gap: 4px;
}

/* ═══ 4. Stats grid ═══ */
.noa-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 0 14px 12px;
}
.noa-stat {
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 11px 12px;
    position: relative;
    overflow: hidden;
    min-width: 0;
}
.noa-stat::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: var(--noa-radius) var(--noa-radius) 0 0;
}
.ns-blue::before { background: #2563eb; }
.ns-cyan::before { background: #0891b2; }
.ns-green::before { background: #22c55e; }
.noa-stat-wide { grid-column: 1 / -1; }
.noa-stat-label {
    font-size: 9px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: .06em;
    text-transform: uppercase;
    margin-bottom: 6px;
}
.noa-stat-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.noa-stat-val { font-size: 22px; font-weight: 700; color: #1e293b; line-height: 1; }
.noa-stat-km { font-size: 18px; }
.noa-stat-green { color: #16a34a; }
.noa-stat-unit { font-size: 11px; font-weight: 400; color: #94a3b8; margin-left: 3px; }
.noa-stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
}
.si-blue { background: #dbeafe; }
.si-cyan { background: #cffafe; }
.si-green { background: #dcfce7; }

/* ═══ 5. Tabla de registros ═══ */
.noa-section-title {
    font-size: 11px;
    font-weight: 700;
    color: #1e293b;
    padding: 0 14px 7px;
}
.noa-table-wrap {
    margin: 0 14px 18px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
}
.noa-table-head {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr;
    background: #f8fafc;
    padding: 7px 11px;
    border-bottom: 1px solid #e2e8f0;
}
.noa-th {
    font-size: 9px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: .06em;
    text-transform: uppercase;
}
.noa-th-right { text-align: right; }
.noa-table-row {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr;
    padding: 11px 11px;
    align-items: center;
    background: #fff;
    border-bottom: 1px solid #f1f5f9;
}
.noa-date-val { font-size: 12px; font-weight: 700; color: #1e293b; }
.noa-badge-reciente {
    display: inline-block;
    margin-top: 3px;
    font-size: 8px;
    font-weight: 700;
    background: #dbeafe;
    color: #1d4ed8;
    padding: 2px 6px;
    border-radius: 20px;
}
.noa-inspector { display: flex; align-items: center; gap: 6px; min-width: 0; }
.noa-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #e0e7ff;
    font-size: 9px;
    font-weight: 700;
    color: #4338ca;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
}
.noa-iname { font-size: 11px; color: #1e293b; font-weight: 500; line-height: 1.3; }
.noa-odo { font-size: 12px; font-weight: 700; color: #1e293b; text-align: right; }
.noa-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 11px;
    background: #f8fafc;
}
.noa-total-label { font-size: 11px; font-weight: 700; color: #64748b; }
.noa-total-val { font-size: 13px; font-weight: 700; color: #1e293b; }

/* ═══ Breakpoints Android ═══ */
/* Small (360dp - Moto G, Galaxy A) */
@media (max-width: 374px) {
    :root { --noa-font-xl: 18px; --noa-stat-icon: 28px; }
    .noa-plate span { font-size: 11px; }
}

/* Normal (390–412dp - Pixel, Galaxy S): valores base, sin override */

/* Large (428dp) */
@media (min-width: 428px) and (max-width: 599px) {
    :root { --noa-pad: 18px; --noa-font-xl: 26px; }
}

/* Tablet (600dp+) */
@media (min-width: 600px) {
    .noa-overlay { align-items: center; }
    .noa-sheet {
        max-width: 520px;
        border-radius: var(--noa-sheet-radius);
        margin: auto;
    }
}

/* ═══ Ajustes visuales del mockup ═══ */
.noa-stat::before { border-radius: 12px 12px 0 0; }
.noa-table-row { padding: 11px 11px; }
</style>
