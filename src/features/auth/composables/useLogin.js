import { onMounted, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.store.js';
import { useFormManager } from '@/hooks/useFormManager.js';
import { handleGlobalError } from '@/utils/error-handler.js';
import { useConfigStore } from '@store/modules/config.js';

/**
 * Lógica compartida del login (móvil + desktop).
 * Extraída de LoginView para no duplicar validación, mensajes y navegación.
 *
 * @author Darwin Montes
 * @module {Features.Auth.Composables}
 * @resource {Session}
 * @returns {{ formData: import('vue').Ref, errors: import('vue').Ref, isSubmitting: import('vue').Ref, showPassword: import('vue').Ref, loginError: import('vue').Ref, handleLogin: () => Promise<void> }}
 */
export function useLogin() {
  const router = useRouter();
  const authStore = useAuthStore();
  const configStore = useConfigStore();

  onMounted(() => {
    // Garantiza que el overlay de "Cerrando sesión..." se apague en cuanto el formulario esté montado
    configStore.setLoading(false);
  });

  const { formData, errors, isSubmitting, validateAndFocus } = useFormManager(
    { email: '', password: '' },
    {
      email: { required: true, label: 'El correo o número de documento' },
      password: { required: true, label: 'La contraseña' }
    }
  );

  const showPassword = shallowRef(false);
  const loginError = shallowRef('');

  /**
   * Extrae un mensaje legible del error de login (401/403/422/429/red).
   * @param {any} error - Error capturado de axios.
   * @returns {string}
   */
  const extraerMensajeLogin = (error) => {
    const datos = error?.response?.data;
    if (!error?.response && error?.request) return 'Sin conexión con el servidor. Verifica tu red o que la API esté en línea.';
    if (datos?.error?.details && Array.isArray(datos.error.details)) {
      const primero = datos.error.details[0];
      if (primero?.messages?.[0]) return primero.messages[0];
    }
    if (typeof datos?.message === 'string' && datos.message.trim() !== '') return datos.message;
    if (typeof error?.message === 'string' && error.message.trim() !== '') return error.message;
    return 'Correo o contraseña incorrectos.';
  };

  /**
   * Valida el formulario y autentica al usuario contra el store de sesión.
   * @returns {Promise<void>}
   */
  const handleLogin = async () => {
    loginError.value = '';
    if (!(await validateAndFocus())) return;

    isSubmitting.value = true;

    // Activar la barra de navegación no invasiva en el top
    configStore.startNavigation();

    try {
      await authStore.login({ email: String(formData.email || '').trim(), password: formData.password });
      router.push('/dashboard');
    } catch (error) {
      configStore.endNavigation();
      loginError.value = extraerMensajeLogin(error);
      handleGlobalError(error, 'LoginView', { redirectToErrorView: false, notifyUser: false });
    } finally {
      isSubmitting.value = false;
    }
  };

  return { formData, errors, isSubmitting, showPassword, loginError, handleLogin };
}

export default useLogin;
