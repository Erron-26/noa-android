<template>
    <div class="rp-container animate-fade-in">

        <!-- Toast -->
        <Transition name="toast">
            <div v-if="toast" class="rp-toast" :class="toast.type">
                <i class="fas" :class="toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
                <span>{{ toast.message }}</span>
            </div>
        </Transition>

        <!-- Header -->
        <BasePageHeader title="Roles y permisos" subtitle="Administra los niveles de acceso del personal."
            icon="fas fa-shield-alt text-primary" topLabel="Control de seguridad"
            :breadcrumbs="[{ label: 'Seguridad' }, { label: 'Roles y permisos', active: true }]">
            <template #actions>
                <button class="rp-btn-primary" @click="showNewRoleForm = !showNewRoleForm">
                    <i class="fas" :class="showNewRoleForm ? 'fa-times' : 'fa-plus'"></i>
                    {{ showNewRoleForm ? 'Cancelar' : 'Crear rol' }}
                </button>
            </template>
        </BasePageHeader>

        <!-- Formulario nuevo rol -->
        <Transition name="accordion">
            <div v-if="showNewRoleForm" class="rp-card form-card mb-4">
                <div class="form-card-header">
                    <i class="fas fa-shield-alt"></i>
                    <span>Crear nuevo rol</span>
                </div>
                <div class="form-card-body">
                    <div class="row g-3 mb-3">
                        <div class="col-12 col-md-6">
                            <label class="rp-label">Nombre del rol</label>
                            <div class="rp-input-wrap">
                                <i class="fas fa-tag rp-input-icon"></i>
                                <input v-model="newRole.name" type="text" autocomplete="off" class="rp-input"
                                    placeholder="Ej: Coordinador, Auditor" />
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="rp-label">Descripción</label>
                            <div class="rp-input-wrap">
                                <i class="fas fa-info-circle rp-input-icon"></i>
                                <input v-model="newRole.description" type="text" autocomplete="off" class="rp-input"
                                    placeholder="Breve descripción del rol" />
                            </div>
                        </div>
                    </div>

                    <!-- Color -->
                    <div class="mb-4">
                        <label class="rp-label mb-2">Color del rol</label>
                        <div class="color-picker">
                            <button v-for="c in COLORS" :key="c.key" class="color-dot"
                                :class="{ active: newRole.color === c.key }" :style="{ background: c.solid }"
                                :title="c.label" @click="newRole.color = c.key">
                                <i v-if="newRole.color === c.key" class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Permisos iniciales -->
                    <div>
                        <label class="rp-label mb-2">Permisos iniciales</label>
                        <div class="perms-scroll-box">
                            <div class="row g-2">
                                <div v-for="mod in modules" :key="mod.id" class="col-12 col-md-6 col-lg-4 col-xl-3">
                                    <div class="perm-module-card">
                                        <div class="perm-module-top">
                                            <span class="mod-emoji-sm">{{ mod.icon }}</span>
                                            <span class="mod-name-sm" :title="mod.label">{{ mod.label }}</span>
                                        </div>
                                        <div class="chips-row">
                                            <template v-for="ac in actions" :key="ac">
                                                <span v-if="isValidPerm(mod.id, ac)" class="perm-chip-toggle"
                                                    :class="[`pct-${ac}`, { active: newRoleHasPerm(mod.id, ac) }]"
                                                    @click="toggleNewPerm(mod.id, ac)">
                                                    <i class="fas" :class="getActionIcon(ac)"></i>
                                                    {{ getActionLabel(ac) }}
                                                </span>
                                            </template>
                                        </div>
                                        <button class="btn-select-all" @click="toggleAllNew(mod.id)">
                                            <i class="fal fa-check-double"></i> Seleccionar todos
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-footer">
                        <button class="rp-btn-ghost" @click="cancelNewRole">Cancelar</button>
                        <button class="rp-btn-primary" :disabled="!newRole.name.trim() || loading" @click="createRole">
                            <i v-if="loading" class="fas fa-spinner fa-spin me-1"></i>
                            Confirmar y crear rol
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Grid de roles -->
        <div class="rp-card roles-section mb-4">
            <div class="roles-section-head">
                <h4><i class="fas fa-users-cog text-primary me-2"></i>Roles del sistema</h4>
                <span class="count-badge">{{ roles.length }} roles</span>
            </div>
            <div class="roles-grid">
                <div v-for="rol in roles" :key="rol.id" class="role-card"
                    :class="{ active: selectedRole?.id === rol.id }" @click="selectRole(rol)">
                    <div class="role-card-top">
                        <div class="role-card-name-row">
                            <span class="role-icon-box" :style="{ background: getColor(rol.color).bg }">
                                {{ getRoleIcon(rol) }}
                            </span>
                            <span class="role-dot" :style="{ background: getColor(rol.color).solid }"></span>
                            <h5 class="role-name" :style="{ color: getColor(rol.color).text }">{{ rol.displayName }}
                            </h5>
                        </div>
                        <span class="role-color-pill"
                            :style="{ background: getColor(rol.color).bg, color: getColor(rol.color).text }">
                            {{ getColor(rol.color).label }}
                        </span>
                    </div>
                    <p class="role-desc">{{ rol.description }}</p>
                    <div class="role-card-footer">
                        <span class="perm-count"><i class="fas fa-key me-1"></i>{{ totalPerms(rol) }} permisos</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Matriz de permisos -->
        <div v-if="selectedRole" class="rp-card matrix-card">

            <!-- Cabecera matrix -->
            <div class="matrix-head">
                <div class="matrix-head-left">
                    <span class="matrix-role-badge"
                        :style="{ background: getColor(selectedRole.color).bg, color: getColor(selectedRole.color).text }">
                        <span class="role-badge-icon me-2">{{ getRoleIcon(selectedRole) }}</span>{{ selectedRole.displayName }}
                    </span>
                    <p class="matrix-desc">{{ selectedRole.description }}</p>
                </div>
                <div class="matrix-head-right">
                    <div class="rp-search-wrap">
                        <i class="fas fa-search rp-search-icon"></i>
                        <input v-model="filterText" type="text" autocomplete="off" class="rp-search-input"
                            placeholder="Buscar módulo..." />
                    </div>
                    <template v-if="!editMode">
                        <button class="rp-btn-edit" @click="editMode = true; filterText = ''">
                            <i class="fas fa-edit me-1"></i>Habilitar edición
                        </button>
                    </template>
                    <template v-else>
                        <button class="rp-btn-ghost" @click="cancelEdit">Cancelar</button>
                        <button class="rp-btn-save" :disabled="loading" @click="saveChanges">
                            <i v-if="loading" class="fas fa-spinner fa-spin me-1"></i>
                            <i v-else class="fas fa-check me-1"></i>Guardar cambios
                        </button>
                    </template>
                </div>
            </div>

            <!-- Tabla -->
            <div v-if="!isReady" class="rp-loading" style="padding:1.5rem">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Cargando permisos...</span>
            </div>
            <div v-else class="matrix-table-wrap">

                <!-- Encabezado columnas -->
                <div class="matrix-col-head" :style="gridStyle">
                    <div class="col-mod-label">Módulo del sistema</div>
                    <div v-for="ac in actions" :key="ac" class="col-ac-label" :class="`col-ac-${ac}`">
                        <span class="ac-icon-box"><i class="fas" :class="getActionIcon(ac)"></i></span>
                        <span class="ac-text">{{ getActionLabel(ac) }}</span>
                    </div>
                    <div v-if="editMode" class="col-ac-label text-muted">
                        <span class="ac-icon-box" style="background:transparent;border:0.5px solid #cbd5e1"><i
                                class="fal fa-check-double"></i></span>
                        <span class="ac-text">Todos</span>
                    </div>
                </div>

                <!-- Filas -->
                <div class="matrix-rows">
                    <div v-for="mod in filteredModules" :key="mod.id" class="matrix-row" :style="gridStyle">
                        <div class="row-mod-info">
                            <span class="mod-emoji-badge">{{ mod.icon }}</span>
                            <div>
                                <div class="mod-label">{{ mod.label }}</div>
                                <div class="mod-sublabel">Permisos de {{ mod.label.toLowerCase() }}</div>
                            </div>
                        </div>

                        <div v-for="ac in actions" :key="ac" class="row-ac-cell">
                            <div class="perm-cell" :class="[
                                isValidPerm(mod.id, ac)
                                    ? (hasPermission(mod.id, ac) ? `cell-on cell-on-${ac}` : 'cell-off')
                                    : 'perm-cell-empty',
                                { editable: editMode && isValidPerm(mod.id, ac) }
                            ]" @click="isValidPerm(mod.id, ac) && togglePerm(mod.id, ac)">
                                <i class="fas" :class="isValidPerm(mod.id, ac)
                                    ? (hasPermission(mod.id, ac)
                                        ? getActionIcon(ac)
                                        : (editMode ? getActionIcon(ac) + ' cell-ghost-icon' : 'fa-lock'))
                                    : 'fa-minus'"></i>
                            </div>
                        </div>

                        <div v-if="editMode" class="row-ac-cell">
                            <button class="btn-all-row" @click="toggleAll(mod.id)" title="Marcar/desmarcar todos">
                                <i class="fal fa-check-double"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Empty state -->
                    <div v-if="filteredModules.length === 0" class="matrix-empty">
                        <i class="fas fa-shield-alt"></i>
                        <h5>Sin resultados</h5>
                        <p>No se encontraron módulos con la búsqueda actual.</p>
                        <button v-if="!editMode" class="rp-btn-edit" @click="editMode = true; filterText = ''">
                            Asignar permisos
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer resumen -->
            <div class="matrix-footer">
                <div class="summary-badges">
                    <span v-for="ac in actions" :key="ac" class="sum-badge" :class="`sum-${ac}`">
                        <i class="fas me-1" :class="getActionIcon(ac)"></i>
                        {{ getActionLabel(ac) }}: <strong>{{modules.filter(m => hasPermission(m.id, ac)).length}}/{{
                            modules.length }}</strong>
                    </span>
                </div>
                <span class="sum-total">
                    <i class="fas fa-shield-alt me-1"></i>
                    Total: <strong>{{ totalPerms(selectedRole) }}</strong> permisos activos
                </span>
            </div>

        </div>

        <!-- Placeholder sin rol seleccionado -->
        <div v-else-if="!loading" class="rp-card matrix-empty-full">
            <i class="fas fa-mouse-pointer"></i>
            <p>Selecciona un rol para ver y gestionar sus permisos.</p>
        </div>

        <!-- Loading inicial -->
        <div v-if="loading && roles.length === 0" class="rp-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando roles...</span>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import BasePageHeader from '@/components/BasePageHeader.vue'
import { useRolesAndPermissionsStore } from '../store/rolesandpermissions.store.js'

const store = useRolesAndPermissionsStore()

// ── Paleta de colores ──────────────────────────────────────────────────────────
const COLORS = [
    { key: 'purple', label: 'Morado', solid: '#8b5cf6', bg: 'rgba(206,203,246,0.45)', text: '#3C3489' },
    { key: 'blue', label: 'Azul', solid: '#3b82f6', bg: 'rgba(181,212,244,0.45)', text: '#0c447c' },
    { key: 'teal', label: 'Turquesa', solid: '#14b8a6', bg: 'rgba(159,225,203,0.45)', text: '#085041' },
    { key: 'coral', label: 'Coral', solid: '#f97316', bg: 'rgba(245,196,179,0.45)', text: '#712B13' },
    { key: 'green', label: 'Verde', solid: '#10b981', bg: 'rgba(192,221,151,0.45)', text: '#27500A' },
    { key: 'amber', label: 'Ámbar', solid: '#f59e0b', bg: 'rgba(250,199,117,0.45)', text: '#633806' },
]
function getColor(key) {
    return COLORS.find(c => c.key === key) ?? { solid: '#888', bg: 'rgba(211,209,199,.45)', text: '#444', label: key }
}

// ── Estado ─────────────────────────────────────────────────────────────────────
const roles = ref([])
const modules = ref([])
const actions = ref([])
const validPerms = ref(new Set())
const selectedRole = ref(null)
const editMode = ref(false)
const filterText = ref('')
const showNewRoleForm = ref(false)
const loading = ref(false)
const toast = ref(null)
const isReady = ref(false)

const newRole = reactive({ name: '', description: '', color: 'blue', perms: {} })

// ── Grid CSS ───────────────────────────────────────────────────────────────────
const gridStyle = computed(() => ({
    gridTemplateColumns: `1.5fr repeat(${actions.value.length}, minmax(38px,46px))${editMode.value ? ' minmax(38px,46px)' : ''}`
}))

// ── Módulos filtrados ──────────────────────────────────────────────────────────
const filteredModules = computed(() => {
    let list = modules.value

    if (!editMode.value && selectedRole.value) {
        list = list.filter(m => {
            const p = selectedRole.value.perms[m.id]
            return p && p.length > 0
        })
    }

    if (filterText.value.trim()) {
        const t = filterText.value.toLowerCase()
        list = list.filter(m => m.label.toLowerCase().includes(t) || m.id.toLowerCase().includes(t))
    }

    return list
})

// ── Etiquetas ─────────────────────────────────────────────────────────────────
const fmt = v => String(v || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim()

const MODULE_LABELS = {
    affiliate: 'Afiliados', affiliate_admin_charges: 'Cobros de Administración',
    bank_details: 'Datos bancarios',
    branches: 'Sucursales', business_collaboration_agreements: 'Acuerdos colaboración',
    cost_centers: 'Centros de costos', customer: 'Clientes',
    driver: 'Conductores', driver_licenses: 'Licencias conductor',
    economic_activities: 'Act. económicas',
    employee: 'Empleados', employmentContracts: 'Contratos laborales',
    enabling_resolutions: 'Res. habilitación', experiences: 'Experiencias',
    financial_statements: 'Estados financieros',
    fleet_service_contracts: 'Contratos flota', fuec: 'FUEC', inspection_results: 'Resultados inspección',
    maintenance: 'Mantenimiento', maintenance_parts: 'Repuestos', objects_contracts: 'Contratos objetos',
    occupational_safety_records: 'Seguridad ocupacional', operation_cards: 'Tarjetas operación',
    procedures: 'Procedimientos',
    projects: 'Proyectos',
    rup_records: 'Registros RUP', security_contributions: 'Aportes seguridad',
    service_delivery_control_sheets: 'Hojas entrega', service_provision_contracts: 'Contratos prestación', supplier: 'Proveedores',
    system_configurations: 'Config. sistema',
    tax_declarations: 'Declaraciones tributarias', tax_information: 'Info tributaria',
    territorial_directors: 'Directores territoriales',
    third_parties: 'Terceros', vehicle_documents: 'Doc. vehículos', vehicle_inspections: 'Inspecciones vehículos',
    vehicles: 'Vehículos',
    capacity_inventory: 'Inventario capacidad', companies: 'Empresas', contacts: 'Contactos',
    contractors: 'Contratistas', control_sheets: 'Hojas de control', conveyor_capacity: 'Cap. transportadora',
    brands: 'Marcas', vehicle_classes: 'Clases de Vehículos', inspection_items: 'Ítems de Inspección',
    withholdings: 'Retenciones', radicacion_to: 'Radicación TO', 'reports.vehicles': 'Reportes de Vehículos',
    users: 'Usuarios', roles: 'Roles del sistema', permissions: 'Permisos del sistema', locations: 'Geolocalización',
}

const MODULE_ICONS = {
    users: '👥', roles: '🛡️', permissions: '🔑', companies: '🏢', contacts: '📇', branches: '🏬',
    economic_activities: '📊', bank_details: '🏦', tax_information: '🧾', enabling_resolutions: '📜',
    conveyor_capacity: '🚛', experiences: '⭐', rup_records: '📋', financial_statements: '📈',
    tax_declarations: '📑', occupational_safety_records: '🦺', customer: '🧑‍🤝‍🧑', supplier: '🏭',
    employee: '👷', employmentContracts: '📝', affiliate: '🤝', driver: '🚚', third_parties: '👥',
    cost_centers: '💼',
    affiliate_admin_charges: '💸',
    vehicles: '🚐', vehicle_documents: '📄', operation_cards: '💳',
    business_collaboration_agreements: '🤝', maintenance: '🔧', maintenance_parts: '⚙️',
    vehicle_inspections: '🔍', inspection_results: '✅', driver_licenses: '🪪',
    security_contributions: '🛡️', territorial_directors: '🧭', procedures: '📝',
    fleet_service_contracts: '📄', service_provision_contracts: '📄', capacity_inventory: '📦', objects_contracts: '📦',
    contractors: '👷', fuec: '📊', system_configurations: '⚙️', control_sheets: '📋',
    service_delivery_control_sheets: '📋', projects: '📈', locations: '📍',
    brands: '🏷️', vehicle_classes: '🚗', inspection_items: '🔎',
    withholdings: '🧾', radicacion_to: '📤', 'reports.vehicles': '📊',
}

const ACTION_LABELS = {
    index: 'Listar', create: 'Crear', update: 'Editar', delete: 'Eliminar',
    profile: 'Perfil', show: 'Detalle', view: 'Ver', edit: 'Editar',
    'toggle-status': 'Estado',
    change_branch: 'Cambiar sede', history_pdf: 'Historial PDF',
    technical_sheet_pdf: 'Ficha técnica', cold_chain_pdf: 'PDF cadena de frío', close_exception: 'Cerrar con excepción', forecast: 'Pronóstico',
    'export-excel': 'Exportar Excel', 'export-pdf': 'Exportar PDF',
    track: 'Rastrear', history: 'Historial', geofences: 'Geocercas', alerts: 'Alertas',
}

const ACTION_ICONS = {
    index: 'fa-eye', list: 'fa-list', create: 'fa-plus', update: 'fa-pen', edit: 'fa-pen',
    delete: 'fa-trash-alt', profile: 'fa-user', show: 'fa-eye',
    view: 'fa-eye', 'toggle-status': 'fa-toggle-on',
    change_branch: 'fa-exchange-alt', history_pdf: 'fa-file-pdf',
    technical_sheet_pdf: 'fa-file-alt', cold_chain_pdf: 'fa-snowflake', close_exception: 'fa-lock', forecast: 'fa-chart-line',
    'export-excel': 'fa-file-excel', 'export-pdf': 'fa-file-pdf',
    track: 'fa-location-arrow', history: 'fa-history', geofences: 'fa-draw-polygon', alerts: 'fa-bell',
}

const ROLE_LABELS = {
    superadmin: 'Superadministrador', super_admin: 'Superadministrador', admin: 'Administrador',
    administrator: 'Administrador', admin_empresa: 'Admin. empresa', manager: 'Administrador',
    user: 'Usuario', employee: 'Empleado', empleado: 'Empleado', affiliate: 'Afiliado',
    afiliado: 'Afiliado', driver: 'Conductor', conductor: 'Conductor',
    coord_mantenimiento: 'Coord. mantenimiento', coordinator_maintenance: 'Coord. mantenimiento',
    guest: 'Invitado', operator: 'Operador', coordinator: 'Coordinador', auditor: 'Auditor',
}

function getModuleLabel(id) {
    const l = MODULE_LABELS[id] || fmt(id)
    return l.charAt(0).toUpperCase() + l.slice(1)
}
function getModuleIcon(id) { return MODULE_ICONS[id] || '🔧' }

function getRoleIcon(role) {
    const name = `${role?.internalName || ''} ${role?.displayName || ''}`.toLowerCase()
    if (name.includes('super') || name.includes('admin')) return getModuleIcon('roles')
    if (name.includes('auditor')) return getModuleIcon('inspection_results')
    if (name.includes('coordinador') || name.includes('coordinator')) return getModuleIcon('users')
    if (name.includes('operador') || name.includes('operator')) return getModuleIcon('vehicles')
    return getModuleIcon('permissions')
}
function getActionLabel(ac) { const l = ACTION_LABELS[ac] || fmt(ac); return l.charAt(0).toUpperCase() + l.slice(1) }
function getActionIcon(ac) { return ACTION_ICONS[ac] || 'fa-key' }
function getRoleLabel(name) {
    const l = ROLE_LABELS[String(name || '').toLowerCase()] || fmt(name)
    return l.charAt(0).toUpperCase() + l.slice(1)
}
function getRoleDesc(desc, name) {
    if (!desc) return `Rol del sistema: ${getRoleLabel(name)}`
    return fmt(desc)
}

// ── Procesado de permisos de la API ───────────────────────────────────────────
// Los nombres pueden tener 2 segmentos (modulo.accion) o 3 (reports.vehicles.index):
// el módulo son todos los segmentos menos el último, la acción es el último.
const splitPerm = (name) => {
    const p = String(name).split('.')
    return { mod: p.slice(0, -1).join('.'), act: p.at(-1) }
}

const ACTION_ORDER = ['index', 'create', 'update', 'delete', 'profile', 'show', 'view', 'edit', 'change_branch', 'history_pdf', 'technical_sheet_pdf', 'cold_chain_pdf', 'close_exception', 'forecast', 'export-excel', 'export-pdf', 'toggle-status', 'track', 'history', 'geofences', 'alerts']

function processPermissions(apiPerms) {
    if (!Array.isArray(apiPerms) || apiPerms.length === 0) {
        validPerms.value = new Set()
        modules.value = []
        actions.value = []
        return
    }
    const mods = new Set(), acts = new Set(), valid = new Set()
    apiPerms.forEach(p => {
        if (!p?.name || typeof p.name !== 'string') return
        valid.add(p.name)
        const { mod: m, act: a } = splitPerm(p.name)
        if (m && a) { mods.add(m); acts.add(a) }
    })
    validPerms.value = valid
    modules.value = Array.from(mods).sort().map(m => ({ id: m, label: getModuleLabel(m), icon: getModuleIcon(m) }))
    actions.value = Array.from(acts).sort((a, b) => {
        const ia = ACTION_ORDER.indexOf(a), ib = ACTION_ORDER.indexOf(b)
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
}

function mapPerms(apiRole) {
    const result = {}
    modules.value.forEach(m => { result[m.id] = [] })
        ; (apiRole.permissions || []).forEach(p => {
            const { mod: m, act: a } = splitPerm(p.name)
            if (result[m] && !result[m].includes(a)) result[m].push(a)
        })
    return result
}

function initNewRolePerms() {
    modules.value.forEach(m => { newRole.perms[m.id] = [] })
}

// ── Carga ──────────────────────────────────────────────────────────────────────
const BACKUP_PERMS = [
    'users.index', 'users.create', 'users.update', 'users.delete',
    'fuec.index', 'fuec.create', 'fuec.update', 'fuec.delete',
    'projects.index', 'projects.create', 'projects.update', 'projects.delete',
    'branches.index', 'branches.create', 'branches.update', 'branches.delete',
    'vehicles.index', 'vehicles.create', 'vehicles.update', 'vehicles.delete',
    'rup_records.index', 'rup_records.create', 'rup_records.update', 'rup_records.delete',
].map(name => ({ name }))

async function loadRoles() {
    loading.value = true
    isReady.value = false
    try {
        await store.fetchAllPermissions()
        await store.fetchRoles()
        // Normalizar por si el store devuelve {data:[]} o directamente []
        const permsRaw = store.allPermissions
        const permsArray = Array.isArray(permsRaw) ? permsRaw : (Array.isArray(permsRaw?.data) ? permsRaw.data : null)
        const toProcess = permsArray?.length ? permsArray : BACKUP_PERMS
        // Asegurar que el DOM esté limpio antes de procesar 60+ módulos
        await nextTick()
        processPermissions(toProcess)
        initNewRolePerms()

        roles.value = store.roles.map((r, i) => ({
            id: r.id,
            internalName: r.name,
            displayName: getRoleLabel(r.name),
            description: getRoleDesc(r.description, r.name),
            color: COLORS[i % COLORS.length].key,
            perms: mapPerms(r),
        }))

        if (roles.value.length) selectedRole.value = roles.value[0]
        await nextTick()
        isReady.value = true
    } catch {
        await nextTick()
        processPermissions(BACKUP_PERMS)
        initNewRolePerms()
        roles.value = [
            { id: 1, internalName: 'ADMINISTRADOR', displayName: 'Administrador', description: 'Sin conexión con el servidor.', color: 'purple', perms: mapPerms({ permissions: BACKUP_PERMS }) },
        ]
        selectedRole.value = roles.value[0]
        showToast('Error de conexión. Mostrando datos locales.', 'warning')
    } finally {
        loading.value = false
    }
}

onMounted(loadRoles)

// ── Lógica de permisos ─────────────────────────────────────────────────────────
function isValidPerm(mod, ac) { return validPerms.value.has(`${mod}.${ac}`) }
function hasPermission(mod, ac) { return selectedRole.value?.perms[mod]?.includes(ac) ?? false }
function newRoleHasPerm(mod, ac) { return newRole.perms[mod]?.includes(ac) ?? false }
function validActions(mod) { return actions.value.filter(a => isValidPerm(mod, a)) }

function togglePerm(mod, ac) {
    if (!editMode.value) return
    const perms = selectedRole.value.perms[mod] ||= []
    const idx = perms.indexOf(ac)
    idx >= 0 ? perms.splice(idx, 1) : perms.push(ac)
}

function toggleAll(mod) {
    if (!editMode.value) return
    const perms = selectedRole.value.perms[mod] ||= []
    const valid = validActions(mod)
    const allOn = valid.every(a => perms.includes(a))
    if (allOn) { valid.forEach(a => { const i = perms.indexOf(a); if (i >= 0) perms.splice(i, 1) }) }
    else { valid.forEach(a => { if (!perms.includes(a)) perms.push(a) }) }
}

function toggleNewPerm(mod, ac) {
    const perms = newRole.perms[mod] ||= []
    const idx = perms.indexOf(ac)
    idx >= 0 ? perms.splice(idx, 1) : perms.push(ac)
}

function toggleAllNew(mod) {
    const perms = newRole.perms[mod] ||= []
    const valid = validActions(mod)
    const allOn = valid.every(a => perms.includes(a))
    if (allOn) { valid.forEach(a => { const i = perms.indexOf(a); if (i >= 0) perms.splice(i, 1) }) }
    else { valid.forEach(a => { if (!perms.includes(a)) perms.push(a) }) }
}

function totalPerms(rol) {
    if (!rol?.perms) return 0
    return Object.values(rol.perms).reduce((s, p) => s + p.length, 0)
}

// ── Acciones de UI ─────────────────────────────────────────────────────────────
function selectRole(rol) {
    selectedRole.value = rol
    editMode.value = false
}

async function saveChanges() {
    if (!selectedRole.value) return
    loading.value = true
    try {
        const permNames = []
        Object.entries(selectedRole.value.perms).forEach(([mod, acts]) => {
            acts.forEach(a => permNames.push(`${mod}.${a}`))
        })
        await store.updateRole(selectedRole.value.id, {
            name: selectedRole.value.internalName || selectedRole.value.displayName.toUpperCase().replace(/\s+/g, '_'),
            guard_name: 'api',
            permissions: permNames,
        })
        editMode.value = false
        showToast('Permisos guardados correctamente.', 'success')
        await loadRoles()
    } catch {
        editMode.value = false
        showToast('Error al guardar. Cambios aplicados localmente.', 'warning')
    } finally {
        loading.value = false
    }
}

function cancelEdit() {
    editMode.value = false
    loadRoles()
}

async function createRole() {
    if (!newRole.name.trim()) return
    loading.value = true
    try {
        const permNames = []
        Object.entries(newRole.perms).forEach(([mod, acts]) => {
            acts.forEach(a => permNames.push(`${mod}.${a}`))
        })
        await store.createRole({
            name: newRole.name.toUpperCase().replace(/\s+/g, '_'),
            guard_name: 'api',
            permissions: permNames,
        })
        const name = newRole.name
        cancelNewRole()
        showToast(`Rol "${name}" creado correctamente.`, 'success')
        await loadRoles()
    } catch {
        const fallback = {
            id: Date.now(),
            internalName: newRole.name.toUpperCase().replace(/\s+/g, '_'),
            displayName: newRole.name,
            description: newRole.description || 'Sin descripción',
            color: newRole.color,
            perms: JSON.parse(JSON.stringify(newRole.perms)),
        }
        roles.value.push(fallback)
        selectedRole.value = fallback
        showToast(`Rol "${fallback.displayName}" creado localmente.`, 'warning')
        cancelNewRole()
    } finally {
        loading.value = false
    }
}

function cancelNewRole() {
    showNewRoleForm.value = false
    newRole.name = ''
    newRole.description = ''
    newRole.color = 'blue'
    modules.value.forEach(m => { newRole.perms[m.id] = [] })
}

function showToast(message, type = 'success') {
    toast.value = { message, type }
    setTimeout(() => { toast.value = null }, 3500)
}
</script>

<style scoped>

/* ── Base ── */
.rp-container {
    font-family: 'Outfit', sans-serif;
    padding: .875rem clamp(.75rem, 1.5vw, 1.25rem);
    max-width: 1280px;
    margin: 0 auto;
    color: #1e293b;
    background: #f8fafc;
    min-height: 100vh;
}

/* ── Toast ── */
.rp-toast {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 1050;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 18px;
    border-radius: 12px;
    background: white;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, .1);
    border: 1px solid #e2e8f0;
    font-size: .875rem;
    font-weight: 500;
}

.rp-toast.success {
    border-left: 4px solid #10b981;
}

.rp-toast.warning {
    border-left: 4px solid #f59e0b;
}

.toast-enter-active,
.toast-leave-active {
    transition: all .3s cubic-bezier(.16, 1, .3, 1);
}

.toast-enter-from {
    transform: translateY(-16px) scale(.9);
    opacity: 0;
}

.toast-leave-to {
    transform: translateX(40px);
    opacity: 0;
}

/* ── Tarjeta base ── */
.rp-card {
    background: white;
    border-radius: 16px;
    border: 1px solid rgba(226, 232, 240, .8);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, .02), 0 10px 15px -3px rgba(0, 0, 0, .03);
    overflow: hidden;
}

/* ── Botones ── */
.rp-btn-primary {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    color: white;
    border: none;
    padding: 9px 16px;
    border-radius: 10px;
    font-family: inherit;
    font-size: .85rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: opacity .15s;
}

.rp-btn-primary:disabled {
    opacity: .55;
    cursor: not-allowed;
}

.rp-btn-primary:not(:disabled):hover {
    opacity: .85;
}

.rp-btn-ghost {
    background: white;
    border: 1px solid #cbd5e1;
    color: #475569;
    padding: 9px 16px;
    border-radius: 10px;
    font-family: inherit;
    font-size: .85rem;
    font-weight: 600;
    cursor: pointer;
}

.rp-btn-ghost:hover {
    background: #f8fafc;
}

.rp-btn-edit {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    padding: 7px 13px;
    border-radius: 8px;
    font-family: inherit;
    font-size: .8rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.rp-btn-edit:hover {
    background: #dbeafe;
}

.rp-btn-save {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    padding: 7px 13px;
    border-radius: 8px;
    font-family: inherit;
    font-size: .8rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.rp-btn-save:disabled {
    opacity: .55;
    cursor: not-allowed;
}

/* ── Label e input ── */
.rp-label {
    display: block;
    font-size: .75rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: .4px;
    margin-bottom: 6px;
}

.rp-input-wrap {
    position: relative;
}

.rp-input-icon {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: .85rem;
}

.rp-input {
    width: 100%;
    padding: 9px 12px 9px 36px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-family: inherit;
    font-size: .9rem;
    color: #1e293b;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
}

.rp-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .15);
}

/* ── Formulario nuevo rol ── */
.form-card-header {
    background: linear-gradient(135deg, #0f172a, #1e293b);
    color: white;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: .95rem;
}

.form-card-body {
    padding: clamp(.75rem, 2vw, 1.5rem);
}

/* Color picker */
.color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.color-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 1px #cbd5e1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: .7rem;
    transition: transform .15s, box-shadow .15s;
}

.color-dot.active {
    transform: scale(1.15);
    box-shadow: 0 0 0 2.5px #0f172a;
}

/* Permisos scroll */
.perms-scroll-box {
    max-height: 380px;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    background: #f8fafc;
}

.perm-module-card {
    background: white;
    border: 1px solid rgba(226, 232, 240, .8);
    border-radius: 12px;
    padding: 12px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.perm-module-top {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
    width: 100%;
}

.mod-emoji-sm {
    width: 30px;
    height: 30px;
    min-width: 30px;
    background: #f1f5f9;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.mod-name-sm {
    font-size: .78rem;
    font-weight: 700;
    line-height: 1.3;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    flex: 1 1 auto;
    min-width: 0;
    display: block;
    overflow: hidden;
}

.chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.perm-chip-toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: .72rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    color: #64748b;
    user-select: none;
    transition: all .15s;
}

.perm-chip-toggle.active.pct-index {
    background: #dbeafe;
    color: #1d4ed8;
    border-color: #3b82f6;
}

.perm-chip-toggle.active.pct-create {
    background: #ccfbf1;
    color: #0f766e;
    border-color: #0d9488;
}

.perm-chip-toggle.active.pct-update,
.perm-chip-toggle.active.pct-edit {
    background: #fef3c7;
    color: #b45309;
    border-color: #d97706;
}

.perm-chip-toggle.active.pct-delete {
    background: #fee2e2;
    color: #b91c1c;
    border-color: #dc2626;
}

.perm-chip-toggle.active.pct-show {
    background: #ede9fe;
    color: #6b21a8;
    border-color: #7c3aed;
}

.perm-chip-toggle.active.pct-profile {
    background: #e0f2fe;
    color: #0369a1;
    border-color: #0284c7;
}

.perm-chip-toggle.active.pct-view {
    background: #dbeafe;
    color: #1e40af;
    border-color: #3b82f6;
}

.perm-chip-toggle.active.pct-toggle-status {
    background: #e0e7ff;
    color: #3730a3;
    border-color: #4f46e5;
}

.perm-chip-toggle.active.pct-change_branch {
    background: #e0e7ff;
    color: #4338ca;
    border-color: #6366f1;
}

.perm-chip-toggle.active.pct-history_pdf {
    background: #fee2e2;
    color: #991b1b;
    border-color: #ef4444;
}

.perm-chip-toggle.active.pct-technical_sheet_pdf {
    background: #ffedd5;
    color: #9a3412;
    border-color: #f97316;
}

.perm-chip-toggle.active.pct-cold_chain_pdf {
    background: #ecfeff;
    color: #155e75;
    border-color: #06b6d4;
}

.perm-chip-toggle.active.pct-forecast {
    background: #f0fdf4;
    color: #166534;
    border-color: #22c55e;
}

.perm-chip-toggle.active.pct-close_exception {
    background: #fef3c7;
    color: #92400e;
    border-color: #d97706;
}

.perm-chip-toggle.active.pct-export-excel {
    background: #ccfbf1;
    color: #0f766e;
    border-color: #0d9488;
}

.perm-chip-toggle.active.pct-export-pdf {
    background: #fee2e2;
    color: #b91c1c;
    border-color: #dc2626;
}

.btn-select-all {
    margin-top: auto;
    background: transparent;
    border: none;
    border-top: 1px solid #f1f5f9;
    padding-top: 8px;
    color: #64748b;
    font-size: .72rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    font-family: inherit;
}

.btn-select-all:hover {
    color: #0f172a;
}

.form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
}

/* Transición acordeón */
.accordion-enter-active,
.accordion-leave-active {
    transition: all .3s cubic-bezier(.16, 1, .3, 1);
}

.accordion-enter-from,
.accordion-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* ── Sección de roles ── */
.roles-section {
    padding: .875rem 1rem;
    overflow: visible;
}

.roles-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 8px;
}

.roles-section-head h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
}

.count-badge {
    background: #f1f5f9;
    color: #334155;
    padding: 5px 11px;
    border-radius: 8px;
    font-size: .78rem;
    font-weight: 700;
}

.roles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 10px;
}

.role-card {
    background: white;
    border: 1px solid rgba(226, 232, 240, .8);
    border-radius: 12px;
    padding: .75rem;
    cursor: pointer;
    transition: transform .2s, box-shadow .2s, border-color .2s;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 6px rgba(0, 0, 0, .03);
}

.role-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 18px -4px rgba(0, 0, 0, .08);
}

.role-card.active {
    border: 1.5px solid #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .12);
    background: #f8fafc;
}

.role-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    gap: 6px;
    min-width: 0;
}

.role-card-name-row {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    flex: 1;
}

.role-icon-box {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    font-size: 1rem;
    flex: 0 0 30px;
}

.role-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
}

.role-name {
    font-size: .82rem;
    font-weight: 700;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.role-color-pill {
    font-size: .62rem;
    font-weight: 800;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 12px;
    white-space: nowrap;
    flex-shrink: 0;
}

.role-desc {
    font-size: .78rem;
    color: #64748b;
    line-height: 1.4;
    flex: 1;
    margin: 0 0 .75rem;
    word-break: break-word;
}

.role-card-footer {
    padding-top: 8px;
    border-top: 1px solid #f1f5f9;
}

.perm-count {
    font-size: .75rem;
    font-weight: 600;
    color: #475569;
}

/* ── Matriz ── */
.matrix-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    flex-wrap: wrap;
    gap: 8px;
}

.matrix-head-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex-wrap: wrap;
}

.matrix-role-badge {
    padding: 5px 14px;
    border-radius: 20px;
    font-size: .88rem;
    font-weight: 800;
    text-transform: uppercase;
    white-space: nowrap;
}

.matrix-desc {
    font-size: .78rem;
    color: #64748b;
    margin: 0;
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.matrix-head-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.rp-search-wrap {
    position: relative;
}

.rp-search-icon {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: .85rem;
}

.rp-search-input {
    padding: 7px 12px 7px 33px;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    font-family: inherit;
    font-size: .8rem;
    background: #f8fafc;
    color: #1e293b;
    outline: none;
    width: 160px;
    transition: border-color .15s;
}

.rp-search-input:focus {
    border-color: #3b82f6;
}

/* Tabla matrix */
.matrix-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: .75rem 1rem;
}

.matrix-col-head {
    display: grid;
    align-items: center;
    padding: 6px 10px;
    background: #f8fafc;
    border-radius: 10px;
    margin-bottom: 6px;
    min-width: 620px;
}

.col-mod-label {
    font-size: .78rem;
    font-weight: 700;
    color: #475569;
}

.col-ac-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.col-ac-label.col-ac-index {
    color: #2563eb;
}

.col-ac-label.col-ac-create {
    color: #0d9488;
}

.col-ac-label.col-ac-update,
.col-ac-label.col-ac-edit {
    color: #d97706;
}

.col-ac-label.col-ac-delete {
    color: #dc2626;
}

.col-ac-label.col-ac-show {
    color: #7c3aed;
}

.col-ac-label.col-ac-profile {
    color: #0284c7;
}

.col-ac-label.col-ac-view {
    color: #2563eb;
}

.col-ac-label.col-ac-toggle-status {
    color: #4f46e5;
}

.col-ac-label.col-ac-change_branch {
    color: #4338ca;
}

.col-ac-label.col-ac-history_pdf {
    color: #dc2626;
}

.col-ac-label.col-ac-technical_sheet_pdf {
    color: #ea580c;
}

.col-ac-label.col-ac-cold_chain_pdf {
    color: #0891b2;
}

.col-ac-label.col-ac-forecast {
    color: #16a34a;
}

.col-ac-label.col-ac-close_exception {
    color: #b45309;
}

.col-ac-label.col-ac-export-excel {
    color: #0d9488;
}

.col-ac-label.col-ac-export-pdf {
    color: #dc2626;
}

.ac-icon-box {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .7rem;
}

.ac-text {
    font-size: .6rem;
    font-weight: 800;
    text-transform: uppercase;
}

.matrix-rows {
    min-width: 620px;
}

.matrix-row {
    display: grid;
    align-items: center;
    background: white;
    border: 1px solid rgba(226, 232, 240, .8);
    border-radius: 10px;
    padding: 7px 10px;
    margin-bottom: 5px;
    transition: box-shadow .15s;
}

.matrix-row:hover {
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, .05);
}

.row-mod-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.mod-emoji-badge {
    width: 28px;
    height: 28px;
    min-width: 28px;
    background: #f1f5f9;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .9rem;
}

.mod-label {
    font-size: .74rem;
    font-weight: 700;
    color: #0f172a;
    word-break: break-word;
}

.mod-sublabel {
    font-size: .65rem;
    color: #94a3b8;
}

.row-ac-cell {
    display: flex;
    justify-content: center;
    align-items: center;
}

.perm-cell {
    width: 24px;
    height: 24px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .72rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #94a3b8;
    transition: transform .15s;
}

.perm-cell.editable {
    cursor: pointer;
}

.perm-cell.editable:hover {
    transform: scale(1.12);
}

.perm-cell.cell-on {
    color: white;
    border-color: transparent;
}

.perm-cell.cell-on.cell-on-index {
    background: #3b82f6;
}

.perm-cell.cell-on.cell-on-create {
    background: #10b981;
}

.perm-cell.cell-on.cell-on-update,
.perm-cell.cell-on.cell-on-edit {
    background: #f59e0b;
}

.perm-cell.cell-on.cell-on-delete {
    background: #ef4444;
}

.perm-cell.cell-on.cell-on-show {
    background: #8b5cf6;
}

.perm-cell.cell-on.cell-on-profile {
    background: #0ea5e9;
}

.perm-cell.cell-on.cell-on-view {
    background: #3b82f6;
}

.perm-cell.cell-on.cell-on-toggle-status {
    background: #6366f1;
}

.perm-cell.cell-on.cell-on-change_branch {
    background: #6366f1;
}

.perm-cell.cell-on.cell-on-history_pdf {
    background: #ef4444;
}

.perm-cell.cell-on.cell-on-technical_sheet_pdf {
    background: #f97316;
}

.perm-cell.cell-on.cell-on-cold_chain_pdf {
    background: #06b6d4;
}

.perm-cell.cell-on.cell-on-forecast {
    background: #22c55e;
}

.perm-cell.cell-on.cell-on-close_exception {
    background: #f59e0b;
}

.perm-cell.cell-on.cell-on-export-excel {
    background: #10b981;
}

.perm-cell.cell-on.cell-on-export-pdf {
    background: #ef4444;
}

.cell-ghost-icon {
    opacity: .35;
}

.perm-cell-empty {
    width: 24px;
    height: 24px;
}

.btn-all-row {
    width: 24px;
    height: 24px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    color: #475569;
    font-size: .7rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-all-row:hover {
    background: #e2e8f0;
}

/* Empty state */
.matrix-empty {
    text-align: center;
    padding: 3rem 1rem;
    color: #94a3b8;
}

.matrix-empty i {
    font-size: 3rem;
    opacity: .2;
    display: block;
    margin-bottom: .75rem;
}

.matrix-empty h5 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 .5rem;
    color: #64748b;
}

.matrix-empty p {
    font-size: .82rem;
    margin: 0 0 1rem;
}

/* Footer resumen */
.matrix-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .625rem 1rem;
    border-top: 1px solid #f1f5f9;
    background: #f8fafc;
    flex-wrap: wrap;
    gap: 6px;
}

.summary-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.sum-badge {
    font-size: .72rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
}

.sum-badge.sum-index {
    background: #dbeafe;
    color: #1e40af;
}

.sum-badge.sum-create {
    background: #ccfbf1;
    color: #0f766e;
}

.sum-badge.sum-update,
.sum-badge.sum-edit {
    background: #fef3c7;
    color: #92400e;
}

.sum-badge.sum-delete {
    background: #fee2e2;
    color: #991b1b;
}

.sum-badge.sum-show {
    background: #ede9fe;
    color: #5b21b6;
}

.sum-badge.sum-profile {
    background: #e0f2fe;
    color: #0369a1;
}

.sum-badge.sum-view {
    background: #dbeafe;
    color: #1e40af;
}

.sum-badge.sum-toggle-status {
    background: #c7d2fe;
    color: #3730a3;
}

.sum-badge.sum-change_branch {
    background: #e0e7ff;
    color: #3730a3;
}

.sum-badge.sum-history_pdf {
    background: #fee2e2;
    color: #991b1b;
}

.sum-badge.sum-technical_sheet_pdf {
    background: #ffedd5;
    color: #9a3412;
}

.sum-badge.sum-cold_chain_pdf {
    background: #ecfeff;
    color: #155e75;
}

.sum-badge.sum-forecast {
    background: #dcfce7;
    color: #166534;
}

.sum-total {
    font-size: .8rem;
    color: #475569;
    font-weight: 500;
}

/* Placeholder sin selección */
.matrix-empty-full {
    text-align: center;
    padding: 3rem 1rem;
    color: #94a3b8;
}

.matrix-empty-full i {
    font-size: 2.5rem;
    opacity: .2;
    display: block;
    margin-bottom: .5rem;
}

.matrix-empty-full p {
    font-size: .85rem;
    margin: 0;
}

/* Loading */
.rp-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 3rem;
    color: #64748b;
    font-size: .9rem;
}

/* ── Responsive 14" (1024–1366px) ── */
@media (max-width: 1366px) {
    .rp-search-input {
        width: 155px;
    }

    .matrix-desc {
        max-width: 220px;
    }

    .roles-section-head h4 {
        font-size: .9rem;
    }
}

/* ── Responsive móvil ── */
@media (max-width: 768px) {
    .rp-container {
        padding: .75rem .625rem;
    }

    .matrix-head,
    .matrix-footer {
        padding: .625rem .875rem;
    }

    .matrix-head-right {
        width: 100%;
    }

    .matrix-head-right .rp-btn-ghost,
    .matrix-head-right .rp-btn-save,
    .matrix-head-right .rp-btn-edit {
        flex: 1;
        justify-content: center;
    }

    .rp-search-input {
        width: 100%;
    }

    .matrix-desc {
        display: none;
    }

    .form-footer {
        flex-direction: column-reverse;
    }

    .form-footer button {
        width: 100%;
        justify-content: center;
    }
}

/* ── Fade in ── */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(6px);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

.animate-fade-in {
    animation: fadeIn .35s ease both;
}
</style>
