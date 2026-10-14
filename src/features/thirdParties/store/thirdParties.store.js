import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import thirdPartiesService from '../services/thirdParties.service.js';

/**
 * Store Pinia para la gestión de estados de terceros.
 */
export const useThirdPartiesStore = defineStore('thirdParties', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: {},
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
        typeFilter: null,
    }),

    getters: {
        filteredItems: (state) => state.items,
        paginatedItems: (state) => state.items,
    },

    actions: {
        /**
         * Ejecuta una acción asíncrona manejando estados de carga y error.
         * @param {Function} action - Función asíncrona a ejecutar.
         * @param {string} errorMsg - Mensaje de error por defecto.
         * @returns {Promise<any>} Resultado de la acción.
         * @private
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Carga la lista de terceros con paginación server-side.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await thirdPartiesService.list({
                    page: this.pagination.currentPage,
                    per_page: this.pagination.itemsPerPage,
                    search: this.search || undefined,
                    type: this.typeFilter || undefined,
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
         * @returns {Promise<Object>} Catálogos cargados.
         */
        async loadCatalogs() {
            try {
                this.catalogs = await thirdPartiesService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },

        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza localmente un item en la lista.
         * @param {string} uuid - UUID del item.
         * @param {Object} patch - Datos parciales a actualizar.
         * @private
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Post-procesamiento tras creación exitosa.
         * @param {Object} response - Respuesta del servidor.
         * @returns {Object} Item creado.
         * @private
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            const message = response?.data?.message || response?.message || 'Registro creado correctamente';
            await toast('¡Éxito!', message, 'success');
            this.pagination.currentPage = 1;
            try { await this.fetchItems(); } catch (_e) { /* silencioso: no bloquear el redirect */ }
            return item;
        },

        /**
         * Crea un nuevo tercero.
         * @param {Object} data - Datos del tercero.
         * @returns {Promise<Object>} Tercero creado.
         */
        createItem(data) {
            return this._run(
                () => thirdPartiesService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un tercero existente.
         * @param {string} uuid - UUID del tercero.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>} Tercero actualizado.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await thirdPartiesService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                const message = response?.data?.message || response?.message || 'Registro actualizado correctamente';
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', message, 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina un tercero.
         * @param {string} uuid - UUID del tercero.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await thirdPartiesService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Sube la foto de perfil del tercero.
         * @param {string} uuid - UUID del tercero.
         * @param {File} file - Archivo de imagen.
         */
        async uploadPhoto(uuid, file) {
            return this._run(async () => {
                const response = await thirdPartiesService.uploadPhoto(uuid, file);
                const url = response?.data?.data?.photo_url || response?.data?.photo_url;
                if (url) {
                    this._patchLocal(uuid, { photo_url: url });
                }
                return url;
            }, 'Error al subir la foto de perfil');
        },

        /**
         * Obtiene las licencias de un conductor
         * @param {string} uuid - UUID del conductor
         * @returns {Promise<Array>}
         */
        async fetchDriverLicenses(uuid) {
            return this._run(async () => {
                const response = await thirdPartiesService.getDriverLicenses(uuid);
                return response?.data?.data ?? [];
            }, 'Error al cargar el historial de licencias');
        },

        /**
         * Crea una nueva licencia de conducción
         * @param {Object} data - Datos de la licencia
         */
        async createDriverLicense(data) {
            return this._run(async () => {
                const response = await thirdPartiesService.createDriverLicense(data);
                const message = response?.data?.message || response?.message || 'Licencia registrada correctamente.';
                await toast('Éxito', message, 'success');
                return response?.data?.data ?? response?.data;
            }, 'Error al registrar la licencia');
        },

        /**
         * Actualiza una licencia de conducción existente.
         * @param {string} uuid - UUID de la licencia.
         * @param {Object} data - Datos a actualizar.
         * @returns {Promise<Object>}
         */
        async updateDriverLicense(uuid, data) {
            return this._run(async () => {
                const response = await thirdPartiesService.updateDriverLicense(uuid, data);
                const message = response?.data?.message || response?.message || 'Licencia actualizada correctamente.';
                await toast('Éxito', message, 'success');
                return response?.data?.data ?? response?.data;
            }, 'Error al actualizar la licencia');
        },

        /**
         * Obtiene los aportes de seguridad social de un tercero.
         * @param {string} uuid - UUID del conductor o empleado.
         * @returns {Promise<Array>}
         */
        async fetchSocialSecurityContributions(uuid) {
            return this._run(async () => {
                const response = await thirdPartiesService.getSocialSecurityContributions(uuid);
                return response?.data?.data ?? [];
            }, 'Error al cargar el historial de seguridad social');
        },

        /**
         * Crea un nuevo aporte de seguridad social.
         * @param {Object} data - Datos del aporte.
         */
        async createSocialSecurityContribution(data) {
            return this._run(async () => {
                const response = await thirdPartiesService.createSocialSecurityContribution(data);
                const message = response?.data?.message || response?.message || 'Aporte de seguridad social registrado correctamente.';
                await toast('Éxito', message, 'success');
                return response?.data?.data ?? response?.data;
            }, 'Error al registrar el aporte de seguridad social');
        },

        /**
         * Actualiza un aporte de seguridad social existente.
         * @param {string} uuid - UUID del aporte.
         * @param {Object} data - Datos a actualizar.
         * @returns {Promise<Object>}
         */
        async updateSocialSecurityContribution(uuid, data) {
            return this._run(async () => {
                const response = await thirdPartiesService.updateSocialSecurityContribution(uuid, data);
                const message = response?.data?.message || response?.message || 'Aporte actualizado correctamente.';
                await toast('Éxito', message, 'success');
                return response?.data?.data ?? response?.data;
            }, 'Error al actualizar el aporte de seguridad social');
        },

        /**
         * Obtiene el perfil de un tercero.
         * @param {string} uuid - UUID del tercero.
         * @returns {Promise<Object>} Perfil del tercero.
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await thirdPartiesService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Carga un tercero por ID para edición o vista.
         * @param {string} uuid - UUID del tercero.
         * @returns {Promise<Object>} Datos del tercero.
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await thirdPartiesService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        setTypeFilter(type) { this.typeFilter = type; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.typeFilter = null; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});