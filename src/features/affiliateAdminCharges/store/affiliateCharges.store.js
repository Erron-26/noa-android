import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import affiliateAdminChargesService from '../services/affiliateCharges.service.js';

/**
 * Store Pinia para la gestión de estado de Cargos Administrativos.
 * Maneja paginación server-side, carga de catálogos y operaciones CRUD.
 */


export const useAffiliateAdminChargesStore = defineStore('affiliateAdminCharges', {
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
         * Ejecuta una acción asíncrona manejando estados de loading y error.
         * @param {Function} action - Función asíncrona a ejecutar.
         * @param {string} errorMsg - Mensaje de error por defecto.
         * @returns {Promise<any>}
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Obtiene la lista paginada de cargos desde el servidor.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const response = await affiliateAdminChargesService.list({
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
         * Carga los catálogos necesarios para los formularios (Empresas, Vehículos).
         * @returns {Promise<Object>}
         */
        async loadCatalogs() {
            try {
                this.catalogs = await affiliateAdminChargesService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },
        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza un item en el array local tras una edición exitosa.
         * @param {string} uuid 
         * @param {Object} patch 
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Post-procesamiento tras crear un item (reset paginación, refresh).
         * @param {Object} response 
         * @returns {Object}
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea un nuevo cargo administrativo.
         * @param {Object} data 
         * @returns {Promise<Object>}
         */
        createItem(data) {
            return this._run(
                () => affiliateAdminChargesService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un cargo existente.
         * @param {string} uuid 
         * @param {Object} data 
         * @returns {Promise<Object>}
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await affiliateAdminChargesService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Aplica un pago mensual y auto-genera el siguiente periodo.
         * @param {string} uuid 
         * @param {Object} paymentData 
         * @returns {Promise<Object>}
         */
        applyMonthlyPayment(uuid, paymentData = {}) {
            return this._run(async () => {
                const response = await affiliateAdminChargesService.applyMonthlyPayment(uuid, paymentData);
                await toast('¡Pago Registrado!', 'Se ha aplicado el pago y se generó el cobro del próximo mes.', 'success');
                // Recargamos toda la lista para que se refleje el pago y aparezca el nuevo mes
                await this.fetchItems();
                return response?.data?.data ?? response?.data ?? response;
            }, 'Error al aplicar el pago de la mensualidad');
        },

        /**
         * Elimina un cargo administrativo.
         * @param {string} uuid 
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await affiliateAdminChargesService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene el perfil/detalle de un cargo.
         * @param {string} uuid 
         * @returns {Promise<Object>}
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await affiliateAdminChargesService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Carga un registro por ID para edición o visualización.
         * @param {string} uuid 
         * @returns {Promise<Object>}
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await affiliateAdminChargesService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        /**
         * Obtiene el historial de pagos de una referencia de pago.
         * @param {string} reference
         * @returns {Promise<Array>}
         */
        async fetchPaymentHistory(reference) {
            return this._run(async () => {
                const response = await affiliateAdminChargesService.getPaymentHistory(reference);
                return response?.data?.data ?? response?.data ?? [];
            }, 'Error al cargar el historial de pagos');
        },

        /**
         * Obtiene el cobro pendiente más antiguo de una referencia.
         * @param {string} reference
         * @returns {Promise<Object|null>}
         */
        async fetchPendingCharge(reference) {
            return this._run(async () => {
                const response = await affiliateAdminChargesService.getPendingCharge(reference);
                return response?.data?.data ?? response?.data ?? null;
            }, 'Error al obtener el cobro pendiente');
        },

        /**
         * Obtiene los cobros asociados a un vehículo.
         * @param {string} vehicleUuid
         * @returns {Promise<Array>}
         */
        async fetchItemsByVehicle(vehicleUuid) {
            return this._run(async () => {
                const response = await affiliateAdminChargesService.getByVehicle(vehicleUuid);
                return response?.data?.data ?? response?.data ?? [];
            }, 'Error al cargar cobros del vehículo');
        },

        /**
         * Actualiza el estado de un cargo.
         * @param {string} uuid
         * @param {Object} data
         * @returns {Promise<Object>}
         */
        async updateStatus(uuid, data) {
            return this._run(async () => {
                const response = await affiliateAdminChargesService.updateStatus(uuid, data);
                await toast('¡Éxito!', 'Estado actualizado correctamente', 'success');
                await this.fetchItems();
                return response?.data?.data ?? response?.data ?? response;
            }, 'Error al actualizar el estado del cobro');
        },

        /**
         * Obtiene el resumen consolidado de cobros.
         * @param {Object} params
         * @returns {Promise<Object>}
         */
        async fetchSummary(params = {}) {
            return this._run(async () => {
                const response = await affiliateAdminChargesService.getSummary(params);
                return response?.data?.data ?? response?.data ?? null;
            }, 'Error al obtener el resumen de cobros');
        },

        /**
         * Descarga y abre el recibo en una nueva pestaña.
         * @param {string} uuid 
         */
        async downloadReceipt(uuid) {
            return this._run(async () => {
                await affiliateAdminChargesService.downloadReceipt(uuid);
            }, 'Error al descargar el recibo');
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});