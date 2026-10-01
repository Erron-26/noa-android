/**
 * Hook para acciones comunes en tablas: eliminar con confirmación y tooltips Bootstrap.
 *
 * Ubicación: src/hooks/useTableActions.js
 */
import Swal from 'sweetalert2';
import { mobileBaseConfig } from '@utils/swal-mobile.js';

/**
 * @param {object} store   - Pinia store que expone deleteItem(id)
 * @param {object} router  - Instancia del router de Vue (opcional)
 */
export function useTableActions(store, router = null) {

    /**
     * Muestra diálogo de confirmación y elimina el registro.
     *
     * @param {object} item     - Registro a eliminar. Debe tener uuid o id.
     * @param {object} options  - { title, html, confirmText, cancelText, nameField }
     */
    const confirmDelete = async (item, options = {}) => {
        const name = item[options.nameField ?? 'name'] ?? 'este registro';

        const { isConfirmed } = await Swal.fire(mobileBaseConfig({
            title:             options.title       ?? '¿Eliminar registro?',
            html:              options.html        ?? `
                <p class="mb-2">¿Estás seguro de eliminar <strong>"${name}"</strong>?</p>
                <div class="alert alert-warning small mb-0 mt-2">
                    <i class="fad fa-exclamation-triangle me-1"></i>
                    Esta acción no se puede deshacer.
                </div>`,
            icon:              'warning',
            showCancelButton:  true,
            confirmButtonText: options.confirmText ?? '<i class="fad fa-trash-alt me-1"></i>Sí, eliminar',
            cancelButtonText:  options.cancelText  ?? '<i class="fad fa-times me-1"></i>Cancelar',
            confirmButtonColor: '#dc3545',
            cancelButtonColor:  '#6c757d',
            reverseButtons: true,
            focusCancel: true,
            customClass: {
                popup: 'rounded-3 shadow',
                confirmButton: 'rounded-pill px-4',
                cancelButton: 'rounded-pill px-4',
            },
        }));

        if (!isConfirmed) return false;

        if (store?.deleteItem) {
            await store.deleteItem(item.uuid ?? item.id ?? item);
        }
        return true;
    };

    /** Inicializa tooltips de Bootstrap en el documento */
    const initTooltips = () => {
        if (!window.bootstrap?.Tooltip) return;
        setTimeout(() => {
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                window.bootstrap.Tooltip.getInstance(el)?.dispose();
                new window.bootstrap.Tooltip(el, { trigger: 'hover', delay: { show: 200, hide: 100 } });
            });
        }, 100);
    };

    /** Destruye todos los tooltips activos */
    const destroyTooltips = () => {
        if (!window.bootstrap?.Tooltip) return;
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            window.bootstrap.Tooltip.getInstance(el)?.dispose();
        });
    };

    return { confirmDelete, initTooltips, destroyTooltips };
}