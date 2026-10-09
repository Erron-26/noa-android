import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import vehicleInspectionsService from '../services/vehicleInspections.service.js';

/**
 * Store Pinia para la gestión de estado de inspecciones de vehículos.
 * Maneja paginación server-side, carga de catálogos y operaciones CRUD.
 */


export const useVehicleInspectionsStore = defineStore('vehicleInspections', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: {},
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
        historyItems: [],
        historyLoading: false,
        kmTraveledMap: {}, // { vehicleUuid: kmTraveled }
        vehicleTotalKmMap: {}, // { vehicleUuid: totalKmTraveled }
    }),

    getters: {
        filteredItems: (state) => state.items,
        paginatedItems: (state) => state.items,
        recentInspections: (state) => {
            const previousMileage = new Map();
            const seen = new Set();

            for (const item of state.items) {
                const vehicleUuid = item.vehicle?.uuid;
                if (!vehicleUuid) continue;
                if (!seen.has(vehicleUuid)) {
                    seen.add(vehicleUuid);
                } else if (!previousMileage.has(vehicleUuid)) {
                    previousMileage.set(vehicleUuid, item.mileage);
                }
            }

            const result = [];
            const added = new Set();
            for (const item of state.items) {
                const vehicleUuid = item.vehicle?.uuid;
                if (!vehicleUuid || added.has(vehicleUuid)) continue;
                added.add(vehicleUuid);
                const prevSamePage = previousMileage.get(vehicleUuid);
                const prev = prevSamePage ?? state.kmTraveledMap[vehicleUuid];
                const kmTraveled = prev !== undefined && prev !== null ? Math.max(0, (item.mileage || 0) - prev) : null;
                const totalKmTraveled = item.total_km_traveled ?? state.vehicleTotalKmMap[vehicleUuid] ?? 0;
                result.push({ 
                    ...item, 
                    km_traveled: kmTraveled,
                    total_km_traveled: totalKmTraveled
                });
            }
            return result;
        },
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
         * Obtiene la lista de inspecciones con paginación server-side.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return this._run(async () => {
                const { isConductor, uuidDriver } = vehicleInspectionsService._getUserContext();

                const params = {
                    page: this.pagination.currentPage,
                    per_page: this.pagination.itemsPerPage,
                    search: this.search || undefined,
                    sort: '-inspection_date',
                };

                // Para conductores: filtrar por driver_uuid (su UUID propio como conductor),
                // no por third_party_uuid (que puede ser del afiliado/propietario del vehículo)
                if (isConductor && uuidDriver) {
                    params.driver_uuid = uuidDriver;
                }

                const response = await vehicleInspectionsService.list(params);
                const p = response?.data ?? response;
                this.items = p.data ?? [];
                this.pagination.currentPage = p.current_page ?? 1;
                this.pagination.totalItems = p.total ?? 0;
                this.pagination.totalPages = p.last_page ?? 1;
                this.pagination.itemsPerPage = p.per_page ?? this.pagination.itemsPerPage;
                this.populateKmTraveled();
            }, 'Error al cargar los datos');
        },

        /**
         * Carga los catálogos necesarios para los formularios.
         * @returns {Promise<Object>} Catálogos cargados.
         */
        async loadCatalogs() {
            try {
                this.catalogs = await vehicleInspectionsService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },
        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Actualiza localmente un item en la lista sin recargar todo.
         * @param {string} uuid - UUID del item.
         * @param {Object} patch - Datos parciales a actualizar.
         * @private
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Post-procesamiento después de crear un item.
         * @param {Object} response - Respuesta de la API.
         * @returns {Object} Item creado.
         * @private
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea una nueva inspección.
         * @param {Object} data - Datos de la inspección.
         * @returns {Promise<Object>} Inspección creada.
         */
        createItem(data) {
            return this._run(
                () => vehicleInspectionsService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza una inspección existente.
         * @param {string} uuid - UUID de la inspección.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>} Inspección actualizada.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await vehicleInspectionsService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina una inspección.
         * @param {string} uuid - UUID de la inspección.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await vehicleInspectionsService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene una inspección por UUID para el formulario de edición.
         * @param {string} uuid - UUID de la inspección.
         * @returns {Promise<Object>} Datos de la inspección.
         */
        async fetchProfileById(uuid) {
            return this._run(async () => {
                const response = await vehicleInspectionsService.get(uuid);
                const item = response?.data?.data ?? response?.data ?? response;
                this.selectedItem = item;
                return item;
            }, 'Error al cargar el registro');
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },

        async getPreviousMileage(vehicleUuid, excludeUuid = null) {
            try {
                const response = await vehicleInspectionsService.getVehicleHistory(vehicleUuid, { per_page: 10 });
                const items = response?.data?.data ?? response?.data ?? [];
                items.sort((a, b) => {
                    const dateDiff = new Date(b.inspection_date) - new Date(a.inspection_date);
                    if (dateDiff !== 0) return dateDiff;
                    return (b.mileage || 0) - (a.mileage || 0);
                });
                const prev = excludeUuid ? items.find(item => item.uuid !== excludeUuid) : items[0];
                return prev?.mileage ?? null;
            } catch {
                return null;
            }
        },

        async populateKmTraveled() {
            const seen = new Set();
            const promises = [];

            for (const item of this.items) {
                const vUuid = item.vehicle?.uuid;
                if (!vUuid || seen.has(vUuid)) continue;
                seen.add(vUuid);

                promises.push(
                    (async () => {
                        try {
                            const response = await vehicleInspectionsService.getVehicleHistory(vUuid, { per_page: 100 });
                            const historyItems = response?.data?.data ?? response?.data ?? [];
                            if (historyItems.length > 0) {
                                historyItems.sort((a, b) => {
                                    const dateDiff = new Date(b.inspection_date) - new Date(a.inspection_date);
                                    if (dateDiff !== 0) return dateDiff;
                                    return (b.mileage || 0) - (a.mileage || 0);
                                });

                                const newest = historyItems[0].mileage || 0;
                                const oldest = historyItems[historyItems.length - 1].mileage || 0;
                                this.vehicleTotalKmMap[vUuid] = Math.max(0, newest - oldest);

                                const prev = historyItems[1];
                                this.kmTraveledMap[vUuid] = prev ? prev.mileage : null;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    })()
                );
            }

            await Promise.allSettled(promises);
        },

        async fetchHistory(vehicleUuid) {
            this.historyLoading = true;
            try {
                const response = await vehicleInspectionsService.getVehicleHistory(vehicleUuid, { per_page: 100 });
                const p = response?.data ?? response;
                const items = p.data ?? [];
                items.sort((a, b) => {
                    const dateDiff = new Date(b.inspection_date) - new Date(a.inspection_date);
                    if (dateDiff !== 0) return dateDiff;
                    return (b.mileage || 0) - (a.mileage || 0);
                });
                this.historyItems = items;
            } catch (error) {
                this.historyItems = [];
            } finally {
                this.historyLoading = false;
            }
        },
    },
});