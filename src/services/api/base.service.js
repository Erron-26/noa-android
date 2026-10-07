import { logger } from "@utils/logger.js";
import apiClient from "@services/api/client.js";
import { useUserStore } from "@store/modules/user.js";
import { usePermissionsStore } from "@store/modules/permissions.js";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const ROLES = Object.freeze({
    SUPERADMIN: 'SUPERADMIN',
    CONDUCTOR: 'CONDUCTOR',
    AFILIADO: 'AFILIADO',
    EMPLEADO: 'EMPLEADO',
});
export class BaseService {
    constructor({ resourcePath, tenantId = null, metadata = {} }) {
        this.resourcePath = resourcePath.replace(/^\/+/, '').replace(/\/+$/, '');
        this.tenantId = tenantId;
        this.metadata = { module: "api", resource: resourcePath, ...metadata };
    }

    _getInstance() {
        return this.tenantId ? apiClient.forTenant(this.tenantId) : apiClient.global;
    }

    /**
     * Obtiene el contexto del usuario actual (Empresa y Tercero) 
     * validando si es SUPERADMIN (retorna null para omitir filtros).
     */
    _getUserContext() {
        const userStore = useUserStore();
        const permissionsStore = usePermissionsStore();

        const roles = permissionsStore.roles || [];

        const validRoles = roles
            .filter(role => typeof role === 'string')
            .map(role => role.toUpperCase());

        const hasRole = (role) => validRoles.includes(role);

        const isSuperAdmin = hasRole(ROLES.SUPERADMIN);
        const isConductor = hasRole(ROLES.CONDUCTOR);
        const hasAfiliadoRole = hasRole(ROLES.AFILIADO);
        const hasEmpleadoRole = hasRole(ROLES.EMPLEADO);

        // "isAfiliado" = tiene acceso de tipo afiliado (afiliado, empleado o conductor)
        const isAfiliado = hasAfiliadoRole || hasEmpleadoRole || isConductor;

        // Con el nuevo ajuste del backend:
        // - userStore.third_party_uuid = UUID del Afiliado (dueño de los vehículos)
        // - userStore.uuid_driver = UUID original del Conductor
        const thirdPartyUuid = isSuperAdmin ? null : userStore.third_party_uuid;
        const uuidDriver = isSuperAdmin
            ? null
            : (userStore.uuid_driver || userStore.third_party_uuid);

        return {
            companyUuid: isSuperAdmin ? null : userStore.company_uuid,
            thirdPartyUuid,
            uuidDriver,
            isSuperAdmin,
            isAfiliado,
            isConductor,
            isAfiliadoRole: hasAfiliadoRole, // se mantiene el nombre original de salida
        };
    }
    _checkPermission(action, subject) {
        const permissionsStore = usePermissionsStore();
        const actionMap = { 'read': 'index', 'create': 'create', 'update': 'update', 'delete': 'delete' };
        const backendAction = actionMap[action] || action;
        const target = subject ?? this.metadata.service ?? this.metadata.resource.replace(/^\/+/, "");

        if (!permissionsStore.can(backendAction, target)) {
            throw new Error(`Permission denied: ${target}.${backendAction}`);
        }
    }

    async _request(method, url, { data, params, config = {} } = {}) {
        const fullUrl = url.startsWith("http") ? url : `${this.resourcePath}${url}`;

        // Inyectar filtro automáticamente si es AFILIADO y es una petición GET
        const requestParams = { ...params };
        if (method.toUpperCase() === 'GET') {
            const { isAfiliado, thirdPartyUuid } = this._getUserContext();
            if (isAfiliado && thirdPartyUuid) {
                // Se envía a nivel plano en lugar de anidado en 'filter'
                // Esto evita que Axios lo envíe como [object Object] y que Spatie QueryBuilder 
                // explote con un error 400 (InvalidFilterQuery) en catálogos que no lo admiten.
                requestParams.third_party_uuid = thirdPartyUuid;
            }
        }

        try {
            const response = await this._getInstance()({ method, url: fullUrl, data, params: requestParams, ...config });
            return response.data;
        } catch (error) {
            logger.error(`💥 ${method} Failed`, { url: fullUrl, message: error.message });
            throw error;
        }
    }

    // ─── Helpers multipart ────────────────────────────────────────────────

    /**
     * Convierte un objeto plano a FormData.
     * Si prepend es true, agrega _method=PUT para Laravel.
     */
    _toFormData(data, { methodOverride } = {}) {
        const form = new FormData();
        if (methodOverride) form.append("_method", methodOverride);

        for (const [key, value] of Object.entries(data)) {
            if (value == null) continue;
            if (value instanceof Blob) form.append(key, value);
            else if (typeof value === "boolean") form.append(key, value ? "1" : "0");
            else if (typeof value === "object") form.append(key, JSON.stringify(value));
            else form.append(key, value);
        }
        return form;
    }

    async _multipart(method, url, formData) {
        const instance = this._getInstance();

        const response = await instance({
            method,
            url: `${this.resourcePath}${url}`,
            data: formData,
            // Forzar multipart: quitar el Content-Type "application/json" que
            // trae por defecto client.js, para que axios establezca el boundary.
            headers: { 'Content-Type': undefined },
            transformRequest: [(data) => data],
        });
        return response.data;
    }

    // ─── Helpers PDF ──────────────────────────────────────────────────────

    /**
     * Convierte un Blob a base64 (sin el prefijo data:...).
     */
    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                const base64 = typeof result === 'string' && result.includes(',')
                    ? result.split(',')[1]
                    : result;
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Helper genérico para visualizar/descargar archivos PDF.
     * - Web: abre el PDF en una nueva pestaña.
     * - Android/iOS: guarda en caché y abre con el visor/app nativa mediante Share API.
     */
    async _downloadPdf(url, filename = 'documento.pdf') {
        const instance = this._getInstance();
        const fullUrl = url.startsWith('http') ? url : `${this.resourcePath}${url}`;
        const cleanFileName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

        let response;
        try {
            response = await instance.get(fullUrl, { responseType: 'blob' });
        } catch (err) {
            throw await this._blobErrorToMessage(err);
        }
        const blob = new Blob([response.data], { type: 'application/pdf' });

        // ─── PLATAFORMA NATIVA (Android + iOS) ────────────────────────────
        if (Capacitor.isNativePlatform()) {
            try {
                const base64Data = await this._blobToBase64(blob);

                // Guardamos en Cache para no requerir permisos de almacenamiento.
                // (El resultado no se usa: el archivo queda disponible en caché.)
                await Filesystem.writeFile({
                    path: cleanFileName,
                    data: base64Data,
                    directory: Directory.Cache,
                    recursive: true,
                });

                // Obtenemos la URI nativa del archivo guardado
                const { uri } = await Filesystem.getUri({
                    path: cleanFileName,
                    directory: Directory.Cache,
                });

                // Abrimos el archivo con la app de PDF nativa del dispositivo
                await Share.share({
                    title: cleanFileName,
                    url: uri,
                    dialogTitle: 'Abrir o compartir PDF',
                });

                return;
            } catch (err) {
                logger.warn('[_downloadPdf] Error abriendo PDF nativo, usando fallback web:', err);
                // Si Share falla (ej. usuario cancela), no hacemos nada más
                if (err?.message?.includes('Share canceled') || err?.errorMessage?.includes('canceled')) {
                    return;
                }
                // Fallback: notificar con el toast estándar (carga diferida)
                const { toast } = await import("@utils/toast.js");
                await toast('Error al abrir PDF', 'No se pudo abrir el archivo PDF. Asegúrese de tener una app lectora de PDFs instalada.', 'error');
                return;
            }
        }

        // ─── NAVEGADOR WEB ────────────────────────────────────────────────
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    }

    /**
     * Descarga un archivo Excel como blob en web y nativo.
     */
    async _downloadExcel(url, filename = 'reporte.xlsx') {
        const instance = this._getInstance();
        const fullUrl = url.startsWith('http') ? url : `${this.resourcePath}${url}`;
        let response;
        try {
            response = await instance.get(fullUrl, { responseType: 'blob' });
        } catch (err) {
            throw await this._blobErrorToMessage(err);
        }
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    }

    /**
     * Convierte un error blob del backend en un Error con mensaje legible.
     * Maneja respuestas inesperadas (como errores de servidor HTML) que no son PDFs.
     */
    async _blobErrorToMessage(err) {
        try {
            const data = err?.response?.data;
            if (data instanceof Blob) {
                const texto = await data.text();
                // Filtrar mensajes que no son errores de PDF (ej. propiedades CSS aleatorias)
                if (texto && texto.length < 500) {
                    const textoLimpo = texto.trim();
                    // Evitar mostrar propiedades CSS u otros ruidos del servidor como mensaje de error
                    const patronesNoValidos = [
                        /object.fit/i,
                        /not a recognized CSS property/i,
                    ];
                    const esMensajeNoValido = patronesNoValidos.some(p => p.test(textoLimpo));
                    if (!esMensajeNoValido) {
                        try {
                            const json = JSON.parse(textoLimpo);
                            const msg = json?.message || json?.error;
                            if (msg) {
                                const e = new Error(msg);
                                e.response = err.response;
                                return e;
                            }
                        } catch {
                            // Si no es JSON válido, usar el texto crudo (pero ya filtrado)
                            const e = new Error(textoLimpo);
                            e.response = err.response;
                            return e;
                        }
                    }
                }
                // Si el mensaje es inválido o ocurrió un error, intentar parseo JSON completo
                try {
                    const json = JSON.parse(texto || '');
                    const msg = json?.message || json?.error;
                    if (msg) {
                        const e = new Error(msg);
                        e.response = err.response;
                        return e;
                    }
                } catch {
                    // Ignorar y caer al error original
                }
            }
        } catch {
            // cae al error original
        }
        return err;
    }

    // ─── CRUD base ────────────────────────────────────────────────────────

    async list(params = {}, config = {}) {
        this._checkPermission("read");
        return this._request("GET", "", { params, config });
    }

    async create(data, config = {}) {
        this._checkPermission("create");
        return this._request("POST", "", { data, config });
    }
}