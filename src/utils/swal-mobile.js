/**
 * Configuración móvil central para SweetAlert2.
 * Ubicación: src/utils/swal-mobile.js
 *
 * En Android WebView (360-412px) el popup default de 32em (512px)
 * desborda. Este helper fuerza ancho fluido + clase `noa-swal-mobile`
 * que el CSS global `modals-android.css` limita a `100vw - 1.5rem`.
 * En desktop no cambia nada visual: solo añade max-width seguro.
 */

let SwalPromise = null;

function getSwal() {
    if (!SwalPromise) {
        SwalPromise = import('sweetalert2').then(({ default: Swal }) => Swal);
    }
    return SwalPromise;
}

/** ¿Estamos en la app Android nativa? (marca `.is-android` en App.vue) */
export function isAndroidView() {
    try {
        return document.body?.classList?.contains('is-android') ?? false;
    } catch {
        return false;
    }
}

/** Base responsive para todo `Swal.fire` no-toast. */
export function mobileBaseConfig(overrides = {}) {
    const custom = overrides.customClass || {};
    return {
        width: '100%',
        padding: '1.25rem',
        focusConfirm: false,
        reverseButtons: true,
        allowOutsideClick: true,
        ...overrides,
        customClass: {
            popup: ['noa-swal-mobile', custom.popup || 'rounded-3 shadow'].filter(Boolean).join(' '),
            ...(custom.confirmButton ? { confirmButton: custom.confirmButton } : {}),
            ...(custom.cancelButton ? { cancelButton: custom.cancelButton } : {}),
            ...(custom.denyButton ? { denyButton: custom.denyButton } : {}),
            ...(custom.htmlContainer ? { htmlContainer: custom.htmlContainer } : {}),
        },
    };
}

/** `Swal.fire` con defaults móviles. Carga diferida, nunca rompe el flujo. */
export async function fireMobile(options = {}) {
    const Swal = await getSwal();
    return Swal.fire(mobileBaseConfig(options));
}

export default { isAndroidView, mobileBaseConfig, fireMobile };
