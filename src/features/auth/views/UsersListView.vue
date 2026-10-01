<template>
    <BasePageHeader
        title="Gestión de Usuarios"
        description="Administra los usuarios del sistema y sus roles de acceso."
        icon="fad fa-users text-primary"
        :show-refresh="true"
        :loading="store.loading"
        :breadcrumbs="[{ label: 'Seguridad' }, { label: 'Usuarios' }]"
        @refresh="store.fetchItems()"
    />

    <!-- Barra búsqueda -->
    <div class="card border-0 shadow-sm mb-3">
        <div class="card-body py-2">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                <div class="d-flex align-items-center gap-2 flex-grow-1">
                    <h6 class="mb-0 fw-medium text-nowrap">Búsqueda</h6>
                    <div class="input-group input-group-sm w-100" style="max-width: 420px;">
                        <span class="input-group-text bg-light border-end-0"><i class="fad fa-search text-muted" /></span>
                        <input v-model="searchQuery" class="form-control border-start-0" type="search" placeholder="Buscar por nombre o email..." aria-label="Buscar usuario" @input="onSearchInput" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button" @click="clearSearch"><i class="fad fa-times" /></button>
                    </div>
                </div>
                <small class="text-muted text-nowrap">
                    <i class="fad fa-filter me-1" />{{ store.pagination.totalItems }} usuario{{ store.pagination.totalItems !== 1 ? 's' : '' }}
                </small>
            </div>
        </div>
    </div>

    <!-- Tabla -->
    <div class="card border-0 shadow-sm users-table-card">
        <div class="bg-holder d-none d-lg-block bg-card"
            style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
        <div v-if="isViewLoading" class="card-body p-0">
            <div class="table-responsive scrollbar">
                <table class="table table-sm mb-0">
                    <thead>
                        <tr>
                            <th v-for="width in ['45%', '65%', '60%', '55%']" :key="width" style="padding:12px 8px">
                                <div class="skeleton-text" :style="`height:16px;width:${width}`" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="n in store.pagination.itemsPerPage" :key="`sk-${n}`">
                            <td><div class="skeleton-text" style="height:18px;width:82%" /></td>
                            <td><div class="skeleton-text" style="height:24px;width:72%" /></td>
                            <td><div class="skeleton-badge mx-auto" style="height:24px;width:72px" /></td>
                            <td>
                                <div class="d-flex justify-content-center gap-1">
                                    <div v-for="i in 2" :key="i" class="skeleton-icon" style="height:28px;width:28px" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-else class="card-body p-0">
            <div class="table-responsive scrollbar">
                <DataTable :value="store.items" lazy :paginator="true" :rows="store.pagination.itemsPerPage" :totalRecords="store.pagination.totalItems"
                    :first="(store.pagination.currentPage - 1) * store.pagination.itemsPerPage" :loading="store.loading" :rowsPerPageOptions="[10,25,50]"
                    responsiveLayout="scroll" tableStyle="min-width: 48rem" class="table table-sm mb-0 professional-table"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                    emptyMessage="No se encontraron usuarios" @page="onPage">
                    <Column field="email" header="Correo" sortable>
                        <template #body="{ data }">
                            <div class="d-flex align-items-center gap-2">
                                <i class="fad fa-envelope text-primary" style="font-size:13px" />
                                <span class="text-dark text-break" :title="data.email" style="font-size:.85rem">{{ data.email || '-' }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column header="Rol" style="min-width:260px">
                        <template #body="{ data }">
                            <div v-if="!data.roles || data.roles.length === 0" class="text-muted small"><i class="fad fa-ban me-1" />Sin rol asignado</div>
                            <div v-else class="d-flex flex-wrap gap-1">
                                <span v-for="role in data.roles" :key="role" class="badge rounded-pill d-inline-flex align-items-center gap-1 role-badge" :class="roleBadgeClass(role)" style="font-size:.72rem;padding: .4em .65em;">
                                    <i :class="roleIcon(role)" style="font-size:.7rem" />
                                    {{ role }}
                                    <button type="button" class="btn-close btn-close-white ms-1" style="font-size:.55rem;width:.7em;height:.7em;opacity:.8" title="Quitar rol" @click="confirmRemoveRole(data, role)" />
                                </span>
                            </div>
                        </template>
                    </Column>
                    <Column field="status" header="Estado" sortable style="width:130px" class="text-center">
                        <template #body="{ data }">
                            <span class="badge rounded-pill badge-subtle" :class="data.status ? 'badge-subtle-success' : 'badge-subtle-warning'"
                                :title="data.status ? 'Usuario activo' : 'Usuario inactivo'" style="font-size:.8rem;padding:.4em .75em">
                                <i :class="data.status ? 'fad fa-check-circle me-1' : 'fad fa-circle me-1'" style="font-size:10px" />
                                {{ data.status ? 'Activo' : 'Inactivo' }}
                            </span>
                        </template>
                    </Column>
                    <Column header="Acciones" style="width:120px" class="text-center">
                        <template #body="{ data }">
                            <div class="btn-group btn-group-sm" role="group">
                                <button class="btn btn-falcon-default" type="button" title="Editar roles" :aria-label="`Editar roles de ${data.email}`" @click="openRolesModal(data)"><i class="fad fa-user-shield text-primary" style="font-size:14px" /></button>
                                <button class="btn btn-falcon-default" type="button" title="Ver perfil" :aria-label="`Ver perfil de ${data.email}`" @click="goProfile(data)"><i class="fad fa-eye text-secondary" style="font-size:14px" /></button>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <!-- Modal edición de roles -->
    <div class="modal fade" id="userRolesModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header" style="background: linear-gradient(135deg,#0f172a 0%,#1e293b 100%);">
                    <h6 class="modal-title text-white fw-bold"><i class="fad fa-user-shield me-2" />Editar roles de {{ editingUser?.name }}</h6>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" />
                </div>
                <div class="modal-body">
                    <p class="text-muted small mb-2">Selecciona los roles que debe conservar el usuario. Al guardar se sincronizan exactamente los seleccionados (los no marcados se quitan).</p>
                    <div v-if="store.rolesCatalog.length === 0" class="alert alert-warning py-2 small">No se pudo cargar el catálogo de roles.</div>
                    <div class="d-flex flex-column gap-2" style="max-height: 320px; overflow-y: auto;">
                        <label v-for="r in availableRoles" :key="r.name" class="d-flex align-items-center gap-2 p-2 border rounded" :class="editRoles.includes(r.name) ? 'bg-primary bg-opacity-10 border-primary' : 'bg-light'">
                            <input type="checkbox" class="form-check-input m-0" :value="r.name" v-model="editRoles" />
                            <span class="fw-medium" style="font-size:.85rem">{{ r.name }}</span>
                            <small class="text-muted ms-auto" style="font-size:.75rem">{{ r.description || '' }}</small>
                        </label>
                    </div>
                    <div class="mt-3 d-flex flex-wrap gap-1">
                        <span class="small text-muted me-2">Roles actuales:</span>
                        <span v-for="role in editingUser?.roles || []" :key="role" class="badge bg-secondary" style="font-size:.7rem">{{ role }}</span>
                    </div>
                </div>
                <div class="modal-footer bg-light border-top-0">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="saveRoles">
                        <i v-if="saving" class="fas fa-spinner fa-spin me-1" />{{ saving ? 'Guardando...' : 'Guardar roles' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUsersStore } from '../store/users.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Swal from 'sweetalert2';
import { toast } from '@/utils/toast.js';

const router = useRouter();
const store = useUsersStore();

const isViewLoading = ref(true);
const searchQuery = ref('');
const saving = ref(false);
const editingUser = ref(null);
const editRoles = ref([]);

let modalInstance = null;
const availableRoles = computed(() => {
    const cats = store.rolesCatalog;
    // Normalizar: puede venir como [{name, ...}] o {data:[...]}
    const list = Array.isArray(cats) ? cats : (cats?.data ?? []);
    return list.map(r => ({ name: r.name, description: r.description || '' })).filter(r => r.name);
});

const roleBadgeClass = (role) => {
    const map = { SUPERADMIN: 'bg-dark', ADMIN_EMPRESA: 'bg-primary', EMPLEADO: 'bg-info text-dark', AFILIADO: 'bg-success', CONDUCTOR: 'bg-warning text-dark' };
    return map[role] || 'bg-secondary';
};
const roleIcon = (role) => {
    const map = { SUPERADMIN: 'fad fa-crown', ADMIN_EMPRESA: 'fad fa-building', EMPLEADO: 'fad fa-briefcase', AFILIADO: 'fad fa-handshake', CONDUCTOR: 'fad fa-steering-wheel' };
    return map[role] || 'fad fa-shield-alt';
};

let searchTimer = null;
const onSearchInput = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => store.setSearch(searchQuery.value), 350);
};
const clearSearch = () => { searchQuery.value = ''; store.clearSearch(); };
const onPage = (event) => {
    const { first, rows } = event;
    if (rows !== store.pagination.itemsPerPage) store.pagination.itemsPerPage = rows;
    store.setPage(Math.floor(first / rows) + 1);
};

const goProfile = (user) => {
    // Si tiene tercero vinculado, ir a perfil de tercero; si no, mostrar info
    if (user.third_party_uuid) router.push(`/terceros/perfil/${user.third_party_uuid}`);
    else toast('Info', `UUID usuario: ${user.uuid}`, 'info');
};

const confirmRemoveRole = async (user, role) => {
    const result = await Swal.fire({
        title: `¿Quitar rol "${role}"?`,
        text: `Se quitará el rol "${role}" al usuario "${user.name}" (${user.email}). Esta acción es reversible asignándolo de nuevo.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, quitar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
    });
    if (!result.isConfirmed) return;
    try {
        await store.removeRole(user.uuid, role);
    } catch (e) {
        // Error ya toastado por el store
    }
};

const openRolesModal = (user) => {
    editingUser.value = user;
    editRoles.value = [...(user.roles || [])];
    // Bootstrap modal
    const el = document.getElementById('userRolesModal');
    if (window.bootstrap?.Modal) {
        modalInstance = window.bootstrap.Modal.getOrCreateInstance(el);
        modalInstance.show();
    } else {
        // Fallback: mostrar con clase
        el.classList.add('show');
        el.style.display = 'block';
    }
};

const saveRoles = async () => {
    if (!editingUser.value) return;
    saving.value = true;
    try {
        await store.syncRoles(editingUser.value.uuid, [...editRoles.value]);
        if (modalInstance) modalInstance.hide();
        else document.getElementById('userRolesModal').style.display = 'none';
    } finally {
        saving.value = false;
    }
};

onMounted(async () => {
    isViewLoading.value = true;
    try {
        await Promise.all([store.fetchItems(), store.fetchRolesCatalog()]);
    } finally {
        isViewLoading.value = false;
    }
});
</script>

<style scoped>
.users-table-card { border-radius: .75rem !important; }
.badge .btn-close { filter: brightness(0) invert(1); }
.role-badge { transition: transform .15s ease, box-shadow .15s ease; }
.role-badge:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0, 0, 0, .1); }
.badge-subtle { font-weight: 500; white-space: nowrap; transition: all .15s ease; }
.badge-subtle-success { background: rgba(25, 135, 84, .1); color: #198754; border: 1px solid rgba(25, 135, 84, .2); }
.badge-subtle-warning { background: rgba(255, 193, 7, .1); color: #856404; border: 1px solid rgba(255, 193, 7, .2); }
.badge-subtle:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0, 0, 0, .1); }
.skeleton-text, .skeleton-badge, .skeleton-icon { background: #e9ecef; border-radius: 4px; animation: pulse 1.2s infinite; }
.skeleton-badge { border-radius: 999px; }
.skeleton-icon { border-radius: .25rem; }
.text-break { word-break: break-word; overflow-wrap: break-word; }
.scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.scrollbar::-webkit-scrollbar-track { background: #f1f3f5; border-radius: 3px; }
.scrollbar::-webkit-scrollbar-thumb { background: #adb5bd; border-radius: 3px; }

:deep(.professional-table .p-datatable-thead > tr > th) {
    padding: .625rem .75rem !important;
    font-size: .75rem !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: #495057;
    border-bottom: 2px solid #e9ecef !important;
    background: #f8f9fa;
}

:deep(.professional-table .p-datatable-tbody > tr > td) {
    padding: .625rem .75rem !important;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
    font-size: .825rem !important;
    color: #212529;
    transition: background-color .15s ease;
}

:deep(.professional-table .p-datatable-tbody > tr:hover) { background: #f8f9fa !important; }
:deep(.professional-table .p-datatable-tbody > tr:last-child > td) { border-bottom: none; }
:deep(.professional-table .btn-group .btn) { padding: .3rem .5rem; transition: all .15s ease; }
:deep(.professional-table .btn-group .btn:hover) { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0, 0, 0, .12); z-index: 1; }
:deep(.professional-table .btn-group .btn + .btn) { margin-left: -1px; }
:deep(.professional-table .p-paginator) { padding: .5rem 1rem !important; background: #f8f9fa !important; border-top: 1px solid #e9ecef !important; border-radius: 0 0 .75rem .75rem !important; }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
</style>
