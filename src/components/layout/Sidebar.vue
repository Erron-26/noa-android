<template>
    <nav v-if="showSidebar" class="navbar navbar-light navbar-vertical navbar-expand-xl" aria-label="Navegación principal">
        <div class="d-flex align-items-center">
            <router-link class="navbar-brand" to="/dashboard">
                <div class="d-flex align-items-center py-2 gap-4">
                    <img loading="lazy" src="/noa.svg" alt="NOA Transportes" class="sidebar-brand-icon" />
                    <NoaBadge size="40px" class="sidebar-brand-badge" />
                </div>
            </router-link>
        </div>

        <div class="collapse navbar-collapse" id="navbarVerticalCollapse">
            <div class="navbar-vertical-content scrollbar">
                <ul class="navbar-nav flex-column mb-3" id="navbarVerticalNav">

                    <!-- ═══════════════════════════════════════ -->
                    <!-- DASHBOARD                              -->
                    <!-- ═══════════════════════════════════════ -->
                    <li class="nav-item">
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/dashboard', true) }" to="/dashboard">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-chart-pie"></span></span>
                                <span class="nav-link-text ps-1">Dashboard</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- NOTIFICACIONES -->
                    <li class="nav-item">
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/notificaciones') }" to="/notificaciones">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-bell"></span></span>
                                <span class="nav-link-text ps-1">Notificaciones</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- ═══════════════════════════════════════ -->
                    <!-- SECCIÓN 1: EMPRESA                     -->
                    <!-- ═══════════════════════════════════════ -->
                    <li class="nav-item"
                        v-if="can('companies.index') || can('companies.show') || can('branches.index') || can('economic_activities.index') || can('bank_details.index') || can('tax_information.index') || can('enabling_resolutions.index') || can('conveyor_capacity.index') || can('employee.index') || can('experiences.index') || can('tax_declarations.index') || can('rup_records.index') || can('financial_statements.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Empresa</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <!-- Perfil de Empresa (era "Inf. de empresa") -->
                        <button class="nav-link dropdown-indicator w-100 text-start bg-transparent border-0"
                            :aria-expanded="isOpen('company')" aria-controls="company"
                            @click="toggleCollapse('company')" type="button"
                            v-if="can('companies.index') || can('companies.profile') || can('branches.index') || can('economic_activities.index') || can('bank_details.index') || can('tax_information.index') || can('enabling_resolutions.index') || can('conveyor_capacity.index') || can('employee.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-building" aria-hidden="true"></span></span>
                                <span class="nav-link-text ps-1">Perfil de Empresa</span>
                            </div>
                        </button>
                        <ul class="nav collapse" :class="{ show: isOpen('company') }" id="company"
                            v-if="can('companies.index') || can('companies.profile') || can('branches.index') || can('economic_activities.index') || can('bank_details.index') || can('tax_information.index') || can('enabling_resolutions.index') || can('conveyor_capacity.index') || can('employee.index')">
                            <li class="nav-item" v-if="can('companies.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresa/listas-empresa') }"
                                    to="/empresa/listas-empresa">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Empresas</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-else-if="can('companies.profile')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink(`/empresa/perfil/${userStore.company_uuid}`) }"
                                    :to="`/empresa/perfil/${userStore.company_uuid}`">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Mi empresa</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('branches.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/sucursales/listas-sucursal') }"
                                    to="/empresas/sucursales/listas-sucursal">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Sedes</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('economic_activities.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/actividades-economicas/listas-actividades-economicas') }"
                                    to="/empresas/actividades-economicas/listas-actividades-economicas">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Actividades Económicas</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('bank_details.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/datos-bancarios') }"
                                    to="/empresas/datos-bancarios">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Datos Bancarios</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('tax_information.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/informacion-tributaria') }"
                                    to="/empresas/informacion-tributaria">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Información Tributaria</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('enabling_resolutions.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/resoluciones-habilitacion') }"
                                    to="/empresas/resoluciones-habilitacion">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Resoluciones de Habilitación</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('conveyor_capacity.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/capacidad-transportadora') }"
                                    to="/empresas/capacidad-transportadora">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Capacidad Transportadora</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('employee.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/terceros/empleados') }"
                                    to="/terceros/empleados">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Empleados</span></div>
                                </router-link>
                            </li>
                        </ul>

                        <!-- Información Técnica -->
                        <button class="nav-link dropdown-indicator w-100 text-start bg-transparent border-0"
                            :aria-expanded="isOpen('informacion-tecnica')" aria-controls="informacion-tecnica"
                            @click="toggleCollapse('informacion-tecnica')" type="button"
                            v-if="can('experiences.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-tools" aria-hidden="true"></span></span>
                                <span class="nav-link-text ps-1">Información Técnica</span>
                            </div>
                        </button>
                        <ul class="nav collapse" :class="{ show: isOpen('informacion-tecnica') }" id="informacion-tecnica">
                            <li class="nav-item" v-if="can('experiences.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/experiencias') }"
                                    to="/empresas/experiencias">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Experiencias</span></div>
                                </router-link>
                            </li>
                        </ul>

                        <!-- Información Financiera -->
                        <button class="nav-link dropdown-indicator w-100 text-start bg-transparent border-0"
                            :aria-expanded="isOpen('informacion-financiera')" aria-controls="informacion-financiera"
                            @click="toggleCollapse('informacion-financiera')" type="button"
                            v-if="can('rup_records.index') || can('tax_declarations.index') || can('financial_statements.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon" v-once><span class="fas fa-chart-line" aria-hidden="true"></span></span>
                                <span class="nav-link-text ps-1">Información Financiera</span>
                            </div>
                        </button>
                        <ul class="nav collapse" :class="{ show: isOpen('informacion-financiera') }" id="informacion-financiera">
                            <li class="nav-item" v-if="can('rup_records.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/registro-unico-de-proponentes') }"
                                    to="/empresas/registro-unico-de-proponentes">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">RUP</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('tax_declarations.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/declaraciones-de-renta') }"
                                    to="/empresas/declaraciones-de-renta">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Declaraciones de Renta</span></div>
                                </router-link>
                            </li>
                            <li class="nav-item" v-if="can('financial_statements.index')">
                                <router-link class="nav-link"
                                    :class="{ 'active': isActiveLink('/empresas/estados-financieros') }"
                                    to="/empresas/estados-financieros">
                                    <div class="d-flex align-items-center"><span class="nav-link-text ps-1">Estados Financieros</span></div>
                                </router-link>
                            </li>
                        </ul>
                    </li>

                    <!-- ═══════════════════════════════════════════════ -->
                    <!-- SECCIÓN 2: PERSONAS Y CONTRATOS               -->
                    <!-- (era "Terceros" — incluye Contratos Laborales) -->
                    <!-- ═══════════════════════════════════════════════ -->
                    <li class="nav-item"
                        v-if="can('customer.index') || can('supplier.index') || can('affiliate.index') || can('driver.index') || can('third_parties.index') || can('employmentContracts.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Personas y Contratos</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros/afiliados') }"
                            to="/terceros/afiliados" v-if="can('affiliate.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-handshake"></span></span>
                                <span class="nav-link-text ps-1">Afiliados</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros/conductores') }"
                            to="/terceros/conductores" v-if="can('driver.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-id-card"></span></span>
                                <span class="nav-link-text ps-1">Conductores</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros/proveedores') }"
                            to="/terceros/proveedores" v-if="can('supplier.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-boxes"></span></span>
                                <span class="nav-link-text ps-1">Proveedores</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros/clientes') }"
                            to="/terceros/clientes" v-if="can('customer.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-user-tie"></span></span>
                                <span class="nav-link-text ps-1">Clientes</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/terceros', true) }"
                            to="/terceros" v-if="can('third_parties.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-address-book"></span></span>
                                <span class="nav-link-text ps-1">Todos (Terceros)</span>
                            </div>
                        </router-link>

                        <!-- Contratos Laborales — movido desde la sección de Terceros/RRHH -->
                        <router-link class="nav-link"
                            :class="{ 'active': isActiveLink('/recursos-humanos/contratos-laborales/listas') }"
                            to="/recursos-humanos/contratos-laborales/listas"
                            v-if="can('employmentContracts.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-user-clock"></span></span>
                                <span class="nav-link-text ps-1">Contratos Laborales</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- ═══════════════════════════════════════════════════ -->
                    <!-- SECCIÓN 3: FLOTA Y MANTENIMIENTO                  -->
                    <!-- (era "Flota" — sin Planillas de Control)           -->
                    <!-- ═══════════════════════════════════════════════════ -->
                    <li class="nav-item"
                        v-if="can('vehicles.index') || can('vehicle_inspections.index') || can('maintenance.index') || can('maintenance.forecast')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Flota y Mantenimiento</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/vehiculos') }"
                            to="/vehiculos" v-if="can('vehicles.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-truck-moving"></span></span>
                                <span class="nav-link-text ps-1">Vehículos</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/inspeccion-vehiculos') }"
                            to="/inspeccion-vehiculos" v-if="can('vehicle_inspections.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-clipboard-check"></span></span>
                                <span class="nav-link-text ps-1">Inspecciones</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/mantenimiento', true) }"
                            to="/mantenimiento" v-if="can('maintenance.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-toolbox"></span></span>
                                <span class="nav-link-text ps-1">Mantenimientos</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/mantenimiento/proyeccion', true) }"
                            to="/mantenimiento/proyeccion" v-if="can('maintenance.forecast')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-calendar-check"></span></span>
                                <span class="nav-link-text ps-1">Proyección Mantenimiento</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- ═══════════════════════════════════════════════════════════ -->
                    <!-- SECCIÓN 4: OPERACIÓN DE SERVICIOS                         -->
                    <!-- (nuevo: Proyectos + Planillas de Control + PCP + FUEC)    -->
                    <!-- ═══════════════════════════════════════════════════════════ -->
                    <li class="nav-item"
                        v-if="can('projects.index') || can('control_sheets.index') || can('service_delivery_control_sheets.index') || can('fuec.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Operación de Servicios</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <!-- Proyectos — movido desde su sección solitaria "Operación" -->
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/proyectos') }"
                            to="/proyectos" v-if="can('projects.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-briefcase"></span></span>
                                <span class="nav-link-text ps-1">Proyectos</span>
                            </div>
                        </router-link>

                        <!-- Planillas de Control — movido desde "Flota" -->
                        <router-link class="nav-link"
                            :class="{ 'active': isActiveLink('/planillas-de-control-de-servicios') }"
                            to="/planillas-de-control-de-servicios" v-if="can('control_sheets.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-clipboard-list"></span></span>
                                <span class="nav-link-text ps-1">Planillas de Control</span>
                            </div>
                        </router-link>

                        <!-- PCP — nombre completo en lugar de sigla -->
                        <router-link class="nav-link"
                            :class="{ 'active': isActiveLink('/planilla-de-control-de-prestacion-servicios') }"
                            to="/planilla-de-control-de-prestacion-servicios"
                            v-if="can('service_delivery_control_sheets.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-route"></span></span>
                                <span class="nav-link-text ps-1">PCP — Prestación de Servicios</span>
                            </div>
                        </router-link>

                        <!-- FUEC — movido desde "Operaciones y Finanzas" -->
                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/extracto-de-contrato') }"
                            to="/extracto-de-contrato" v-if="can('fuec.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-passport"></span></span>
                                <span class="nav-link-text ps-1">FUEC</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- ═══════════════════════════════════════════════════ -->
                    <!-- SECCIÓN 5: FINANZAS                               -->
                    <!-- (era "Operaciones y Finanzas" — solo Cuotas Adm.) -->
                    <!-- ═══════════════════════════════════════════════════ -->
                    <li class="nav-item" v-if="can('affiliate_admin_charges.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Finanzas</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/pagos-de-administracion') }"
                            to="/pagos-de-administracion" v-if="can('affiliate_admin_charges.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-file-invoice-dollar"></span></span>
                                <span class="nav-link-text ps-1">Cuotas de Administración</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- ═══════════════════════════════════════ -->
                    <!-- SECCIÓN 6: GEOLOCALIZACIÓN             -->
                    <!-- (sin cambios)                          -->
                    <!-- ═══════════════════════════════════════ -->
                    <li class="nav-item"
                        v-if="can('locations.view') || can('locations.geofences') || can('locations.history') || can('locations.alerts')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Geolocalización</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/rastreo/mapa-en-vivo') }"
                            to="/rastreo/mapa-en-vivo" v-if="can('locations.view')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-map-marked-alt"></span></span>
                                <span class="nav-link-text ps-1">Mapa en Vivo</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/rastreo', true) }"
                            to="/rastreo" v-if="can('locations.view')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-satellite-dish"></span></span>
                                <span class="nav-link-text ps-1">Rastreo de Conductores</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/rastreo/geocercas') }"
                            to="/rastreo/geocercas" v-if="can('locations.geofences')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-draw-polygon"></span></span>
                                <span class="nav-link-text ps-1">Geocercas</span>
                            </div>
                        </router-link>
                    </li>

                    <!-- ═══════════════════════════════════════════ -->
                    <!-- SECCIÓN 7: SEGURIDAD Y ACCESO              -->
                    <!-- (era "Seguridad")                          -->
                    <!-- ═══════════════════════════════════════════ -->
                    <li class="nav-item"
                        v-if="can('users.index') || can('roles.index') || can('third_parties.index') || can('companies.index')">
                        <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">Seguridad y Acceso</div>
                            <div class="col ps-0"><hr class="mb-0 navbar-vertical-divider" /></div>
                        </div>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/usuarios') }"
                            to="/usuarios"
                            v-if="can('users.index') || can('third_parties.index') || can('companies.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-users"></span></span>
                                <span class="nav-link-text ps-1">Usuarios</span>
                            </div>
                        </router-link>

                        <router-link class="nav-link" :class="{ 'active': isActiveLink('/roles-permissions') }"
                            to="/roles-permissions"
                            v-if="can('roles.index') || can('companies.index')">
                            <div class="d-flex align-items-center">
                                <span class="nav-link-icon"><span class="fas fa-shield-alt"></span></span>
                                <span class="nav-link-text ps-1">Roles y Permisos</span>
                            </div>
                        </router-link>
                    </li>

                </ul>
                <div class="settings my-3"></div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore, usePermissionsStore, useUserStore } from '@store';
import NoaBadge from '@/components/NoaBadge.vue';
import { useSidebar } from '@/hooks/useSidebar.js';
import { esDashboardDeConductor } from '@utils/modoConductor.js';

const route = useRoute();
const authStore = useAuthStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();
const { toggleCollapse, isOpen, isActiveLink } = useSidebar();

const isConductorDashboard = computed(() => esDashboardDeConductor({
    path: route.path,
    view: route.query.view ?? null,
    esConductor: permissionsStore.hasRole('CONDUCTOR'),
}));

const showSidebar = computed(() => {
    if (!authStore.isAuthenticated) return false;
    if (route.meta?.hideSidebar) return false;
    if (isConductorDashboard.value) return false;
    return true;
});
const closeMobileSidebar = () => {
    const collapseEl = document.getElementById('navbarVerticalCollapse');
    if (collapseEl && collapseEl.classList.contains('show')) {
        collapseEl.classList.remove('show');
        const toggler = document.querySelector('.navbar-toggler-humburger-icon');
        if (toggler) {
            toggler.setAttribute('aria-expanded', 'false');
            toggler.classList.add('collapsed');
        }
    }
};

watch(() => route.path, () => {
    closeMobileSidebar();
});

const can = (action, subject) => permissionsStore.can(action, subject);
</script>

<style scoped>
.sidebar-brand-icon {
    height: 36px;
    width: auto;
    flex-shrink: 0;
}
</style>
