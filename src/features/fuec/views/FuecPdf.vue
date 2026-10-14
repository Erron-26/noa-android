<!-- 
/** @author Darwin Montes @version 1.0.0 @created_at 2026-06-13 @module ContractExtraction @resource FuecPdf */
-->
<template>
    <div>
        <BasePageHeader 
            title="Vista Previa de FUEC" 
            description="Visualice, descargue o imprima el documento oficial del extracto de contrato."
            icon="fad fa-file-pdf text-danger" 
            :breadcrumbs="[{ label: 'FUEC', to: '/extracto-de-contrato' }, { label: 'Vista Previa' }]"
            :show-bg="true"
            :loading="loading" 
            :compact="true"
        />

        <div class="card border-0 shadow-sm mt-3">
            <div class="card-body p-2 p-md-3 p-lg-4">
                <!-- CONTROLES SUPERIORES -->
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-3 border-bottom">
                    <button class="btn btn-falcon-default btn-sm rounded-pill px-3" @click="goBack">
                        <i class="fad fa-arrow-left me-1"></i> Volver al listado
                    </button>
                    
                    <div class="d-flex gap-2" v-if="pdfUrl">
                        <button class="btn btn-falcon-success btn-sm rounded-pill px-3" @click="downloadPdf">
                            <i class="fad fa-download me-1"></i> Descargar PDF
                        </button>
                        <button class="btn btn-falcon-primary btn-sm rounded-pill px-3" @click="printPdf">
                            <i class="fad fa-print me-1"></i> Imprimir
                        </button>
                    </div>
                </div>

                <!-- CARGANDO / ERROR -->
                <div v-if="loading" class="d-flex flex-column align-items-center justify-content-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <h5 class="text-muted fw-normal">Generando vista previa del documento...</h5>
                    <p class="text-secondary small">Por favor espere un momento.</p>
                </div>

                <div v-else-if="error" class="d-flex flex-column align-items-center justify-content-center py-5 text-center">
                    <div class="avatar avatar-3xl mb-3">
                        <div class="avatar-name rounded-circle bg-danger-subtle text-danger fs-1">
                            <i class="fad fa-exclamation-triangle"></i>
                        </div>
                    </div>
                    <h5 class="text-danger fw-normal mb-2">No se pudo cargar el documento</h5>
                    <p class="text-secondary small mb-3 max-w-400">{{ error }}</p>
                    <button class="btn btn-outline-primary btn-sm rounded-pill px-4" @click="loadPdf">
                        <i class="fad fa-redo me-1"></i> Reintentar
                    </button>
                </div>

                <!-- VISOR IFRAME -->
                <div v-else-if="pdfUrl" class="pdf-viewer-container border rounded">
                    <iframe :src="pdfUrl" class="w-100 h-100 border-0 rounded" type="application/pdf"></iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFuecStore } from '../store/fuec.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import { logger } from '@/utils/logger.js';
import { aviso } from '@/utils/dialogs.js';

const route = useRoute();
const router = useRouter();
const store = useFuecStore();

const pdfUrl = ref(null);
const loading = ref(true);
const error = ref(null);
let rawBlob = null;

const goBack = () => router.push('/extracto-de-contrato');

const loadPdf = async () => {
    loading.value = true;
    error.value = null;
    
    // Revocar URL anterior si existe para evitar memory leaks
    if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
        pdfUrl.value = null;
    }

    try {
        const uuid = route.params.id;
        const blob = await store.getRawPdf(uuid);
        
        if (!blob || blob.size === 0) {
            throw new Error('El servidor retornó un documento vacío.');
        }

        rawBlob = blob;
        pdfUrl.value = URL.createObjectURL(blob);
    } catch (err) {
        logger.error('Error al generar la vista previa del FUEC', { message: err?.message ?? err });
        error.value = err.message || 'Ocurrió un error inesperado al intentar descargar el archivo desde el servidor.';
        
        await aviso({
            titulo: 'Error de carga',
            texto: error.value,
            icono: 'error',
        });
    } finally {
        loading.value = false;
    }
};

const downloadPdf = () => {
    if (!rawBlob) return;
    const a = document.createElement('a');
    a.href = pdfUrl.value;
    a.download = `FUEC-${route.params.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const printPdf = () => {
    if (!pdfUrl.value) return;
    const printWindow = window.open(pdfUrl.value, '_blank');
    if (printWindow) {
        printWindow.focus();
        // Nota: Muchos navegadores abren PDFs en visores integrados donde el window.print()
        // debe ser gestionado por el visor nativo o el usuario.
    }
};

onMounted(async () => {
    await loadPdf();
});

onUnmounted(() => {
    if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
    }
});
</script>

<style scoped>
.pdf-viewer-container {
    height: 75vh;
    min-height: 550px;
    background-color: #525659;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.15);
}

.max-w-400 {
    max-width: 400px;
}
</style>
