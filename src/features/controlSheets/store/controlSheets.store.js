/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-29
 * @module {Features.Fleet}
 * @resource {ControlSheet}
 */

import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import controlSheetsService from '../services/controlSheets.service.js';

/**
 * Muestra un toast de SweetAlert2.
 * @param {string} title - Título del mensaje.
 * @param {string} text - Texto del mensaje.
 * @param {string} icon - Icono ('success', 'error', 'warning').
 */


export const useControlSheetsStore = defineStore('controlSheets', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: {},
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
    }),

    getters: {
        filteredItems: (state) => state.items,
        paginatedItems: (state) => state.items,
    },

    actions: {
        /**
         * Ejecuta una acción asíncrona manejando estados de carga y errores.
         * @param {Function} action - Función asíncrona a ejecutar.
         * @param {string} errorMsg - Mensaje de error por defecto.
         * @returns {Promise} Resultado de la acción.
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Obtiene la lista de registros con paginación server-side.
         * @returns {Promise}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await controlSheetsService.list({
                    page: this.pagination.currentPage,
                    per_page: this.pagination.itemsPerPage,
                    search: this.search || undefined,
                });
                const p = response?.data ?? response;
                this.items = p.data ?? [];
                this.pagination.currentPage = p.current_page ?? 1;
                this.pagination.totalItems = p.total ?? 0;
                this.pagination.totalPages = p.last_page ?? 1;
                this.pagination.itemsPerPage = p.per_page ?? this.pagination.itemsPerPage;
            }, 'Error al cargar los datos');
        },

        /**
         * Carga los catálogos necesarios para los formularios.
         * @returns {Promise}
         */
        async loadCatalogs() {
            try {
                this.catalogs = await controlSheetsService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },
        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza un elemento localmente en el estado.
         * @param {string} uuid - UUID del elemento.
         * @param {Object} patch - Datos parciales a mezclar.
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Post-procesamiento después de crear un registro.
         * @param {Object} response - Respuesta de la API.
         * @returns {Object} El registro creado.
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea un nuevo registro.
         * @param {Object} data - Datos del formulario.
         * @returns {Promise}
         */
        createItem(data) {
            return this._run(
                () => controlSheetsService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un registro existente.
         * @param {string} uuid - UUID del registro.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise}
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await controlSheetsService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina un registro.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await controlSheetsService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene el perfil/detalle de un registro.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise}
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await controlSheetsService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Carga un registro por ID para edición o vista.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise}
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await controlSheetsService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        /**
         * Obtiene los PDFs de la hoja de control.
         * @param {string} uuid - UUID de la hoja de control.
         * @returns {Promise<Array>} Listado de archivos.
         */
        async getPdfs(uuid) {
            return this._run(async () => {
                const response = await controlSheetsService.getPdfs(uuid);
                return response?.data ?? [];
            }, 'Error al obtener los archivos PDF');
        },

        /**
         * Sube múltiples archivos PDF.
         * @param {string} uuid - UUID de la hoja de control.
         * @param {FileList|Array} files - Archivos a subir.
         * @returns {Promise}
         */
        async uploadPdfs(uuid, files) {
            return this._run(async () => {
                const formData = new FormData();
                for (let i = 0; i < files.length; i++) {
                    formData.append('files[]', files[i]);
                }
                const response = await controlSheetsService.uploadMultiplePdfs(uuid, formData);
                await toast('¡Éxito!', 'Archivos subidos correctamente', 'success');
                return response?.data ?? response;
            }, 'Error al subir los archivos PDF');
        },

        /**
         * Elimina un PDF específico.
         * @param {string} uuid - UUID de la hoja de control.
         * @param {string} mediaUuid - UUID del archivo.
         * @returns {Promise}
         */
        async deletePdf(uuid, mediaUuid) {
            return this._run(async () => {
                await controlSheetsService.deletePdf(uuid, mediaUuid);
                await toast('¡Eliminado!', 'El archivo ha sido eliminado', 'success');
            }, 'Error al eliminar el archivo PDF');
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});