# Acceso biométrico (investigación)

Fecha: 2026-10-14. Estado: **investigación, sin implementar.**

Decisión de producto: primero se entra **siempre** con usuario y contraseña; la huella
se ofrece **después**, como una comodidad. Nunca como única vía de acceso.

## Por qué se quitó el botón del login

El login tenía un botón "Acceso biométrico" que solo mostraba un aviso de que no
estaba disponible. No tenía sentido: todavía no existe ninguna huella registrada y el
flujo pedido es el inverso (credenciales primero, huella después). Se retiró. La
función se diseñará cuando se implemente de verdad.

## Lo que ya existe

- Login con Laravel Sanctum. `POST /login` devuelve
  `{ access_token, expires_in, token_type, user }`.
- `src/services/security/token-manager.js` persiste el access token.
- `src/services/security/secure-storage.js`: AES-GCM con clave derivada de
  `VITE_ENCRYPTION_KEY`. **Aviso: esa clave viaja en el bundle**, así que esto es
  ofuscación, no un secreto. No sirve como única protección de nada.
- Backend: `POST /refresh-token` **rota** el par de tokens; el refresh dura 30 días
  (`auth.tokens.refresh_token_days`) y lleva la habilidad `refresh`.

## La restricción que condiciona todo el diseño

`POST /login` **no devuelve el refresh token en el cuerpo**: lo manda en una cookie
HTTP-only. En Android nativo, con `CapacitorHttp` habilitado, las cookies no las ve
JavaScript ni se reenvían de forma fiable entre reinicios de la app.

Sin el refresh token a mano no hay forma de restaurar la sesión sin volver a pedir
credenciales, que es justo lo que la huella debe evitar. Por tanto:

> **Para implementar biometría hay que tocar el backend.** No es solo trabajo de la app.

## Flujo propuesto

1. Ingreso normal con usuario y contraseña.
2. Si el dispositivo tiene biometría disponible y enrolada, y el usuario no la ha
   rechazado antes, se ofrece "Activar ingreso con huella".
3. Al aceptar, se guarda el **refresh token** (nunca la contraseña) en almacenamiento
   respaldado por hardware, a su vez custodiado por la huella.
4. En el login, si hay un token guardado y la biometría está disponible, aparece
   "Ingresar con huella".
5. La huella desbloquea el token; la app lo canjea por una sesión con
   `POST /refresh-token` (que ya rota el token) y guarda el nuevo.
6. Cualquier fallo cae al formulario de credenciales.

## Plugins para Capacitor 8

| Plugin | Versión | Licencia | Qué aporta | Nota |
|---|---|---|---|---|
| `@aparajita/capacitor-biometric-auth` | 10.0.0 | MIT | `checkBiometry()` + `authenticate()`; simula en web | Solo autentica; el almacén va aparte |
| `@capgo/capacitor-native-biometric` | 8.4.2 | MPL-2.0 | Autentica **y** guarda credenciales en Keystore (`accessControl: BIOMETRY_CURRENT_SET`) | Hace las dos cosas; licencia copyleft débil por archivo |
| `@aparajita/capacitor-secure-storage` | — | MIT | Keystore/Keychain para el token | Se combina con el primero |

Recomendación: `@aparajita/capacitor-biometric-auth` (MIT) para autenticar, y el token
en un almacén respaldado por hardware. Sea cual sea el plugin, **no guardar la
contraseña**: lo que se guarda es el refresh token.

Nota Android: `biometryType` no es fiable (un equipo puede reportar hardware que las
apps no pueden usar). La lógica se decide con `isAvailable`, no con el tipo.

## Casos negativos (obligatorios antes de dar la función por buena)

- Sin biometría o sin enrolar: la opción no se ofrece; el login no se bloquea.
- Bloqueo por intentos fallidos: se cae a credenciales con aviso claro, sin insistir.
- El usuario cancela la huella: se queda en el formulario, sin error técnico.
- Sin red o API caída: credenciales; nunca una pantalla vacía.
- Token expirado o revocado: se borra lo guardado y se piden credenciales.
- Cierre de sesión: se revoca en el servidor y se borra el token guardado.
- Cambio de usuario o de huellas en el teléfono: se invalida lo guardado.
- Teléfono prestado o robado: el Keystore protege el token y la huella lo custodia;
  conviene una caducidad corta para el token guardado.

## Cambios necesarios en el backend (bloqueante)

- Que `POST /login` entregue el `refresh_token` en el cuerpo para el cliente nativo
  (por ejemplo con un header `X-Client: android`), o una ruta dedicada de restauración
  de sesión. Hoy solo va por cookie.
- Confirmar el tiempo de vida y la rotación del refresh (la rotación ya existe).
- Confirmar que la sesión restaurada respeta la empresa activa (`X-Company-UUID`): el
  token no debe fijar una empresa distinta a la que el usuario elija.

## Lo que no se hace

- No se guarda la contraseña.
- No se usa la huella como única autenticación.
- No se guarda nada en `localStorage`.

## Pendiente de decidir

- ¿La opción vive en Perfil, o solo se ofrece una vez tras el primer ingreso?
- ¿Caducidad propia del token guardado (30 días, o menos)?
- ¿Se permite borrar el acceso con huella desde Perfil?
