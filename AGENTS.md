# Solo Español — Regla Absoluta de Idioma

TODAS tus respuestas, explicaciones, análisis, sugerencias y comentarios en código deben estar estrictamente en **ESPAÑOL**.
No uses inglés ni ningún otro idioma para comunicarte, a menos que el usuario lo pida explícitamente.
Los nombres de variables, funciones y sintaxis de programación pueden mantenerse en inglés (estándar de la industria),
pero toda la comunicación humana debe ser en español.

Esta regla tiene máxima prioridad sobre cualquier otra instrucción.

## Contexto del Proyecto

`noa-android` es el cliente **Android** de la plataforma NOA (Transportes Sin Barreras): un fork de práctica del frontend web. Es una app Vue 3 empaquetada con Capacitor que consume la API Laravel del backend.

- **Usuario principal: el CONDUCTOR.** La app existe sobre todo para el conductor en su teléfono: planilla de servicio en ruta, FUEC, rastreo GPS, dashboard móvil, documentos y alertas de su vehículo. Las pantallas de administración heredadas del frontend web existen pero son secundarias. Ante la duda, se prioriza el flujo del conductor, la pantalla móvil y el uso con red inestable.
- **Ruta de este repo:** `C:\xampp\htdocs\tsb-design\noa-android` (`origin` = `Erron-26/noa-android`, `upstream` = `solucionesintegralesmanasas/noa-android`).
- **Backend (API Laravel 12):** `C:\xampp\htdocs\tsb-design\noa-backend`. Su `AGENTS.md` tiene el contexto completo de la API: multi-tenant, roles, permisos, seguridad y pruebas.
- **Frontend web original (Vue 3):** `C:\xampp\htdocs\tsb-design\noa-frontend-tsb`.
- **API local:** `http://api.transportessinbarreras.local` (`/api/v1`).
- **Lectura de otros repos:** se puede leer el backend y el frontend web (`cat`, `ls`, búsquedas) para validar contratos de la API o la estructura de vistas. Los cambios de este repo se hacen aquí.

## Principio de Diseño: Peor Caso Primero

Toda decisión de UI, de datos y de pruebas se diseña pensando en el conductor en las peores condiciones, no en el caso ideal:

- Sin red o con red intermitente: la app debe mostrar el último estado conocido o un aviso claro, nunca una pantalla vacía sin explicación.
- API caída, error 500 o respuesta sin mensaje: el usuario recibe un texto de respaldo en español, nunca un error técnico ni un estado en blanco.
- Permiso denegado o rol sin acceso: la acción no aparece, en lugar de dejar un botón que falle con 403.
- Sol fuerte en cabina, una sola mano, teléfono de gama baja: contraste AA, objetivos táctiles de 48 dp, texto de 14 sp o más para el contenido.
- Pruebas: cada módulo nuevo se prueba primero con sus casos negativos (fallo de red, respuesta vacía, aviso que también falla) antes que con el caso feliz.

## Stack

- **Core:** Vue 3 `<script setup>`, Vite 8, Pinia 3, Vue Router 4, `vue-i18n`.
- **UI:** PrimeVue 4 (preset `@primeuix/themes`), SweetAlert2 (solo a través de `utils/toast.js`), vue-toastification.
- **HTTP:** Axios contra la API del backend. `CapacitorHttp` habilitado en `capacitor.config.json`.
- **Nativo:** Capacitor 8 (`android/`), plugins `geolocation`, `filesystem`, `preferences`, `share`, `file-opener`.
- **Pruebas:** Vitest 5 (`vitest.config.js`, entorno `node`, incluye `src/**/*.test.js`, alias `@`, `@utils`, `@store`, `@services`, `@features`).
- **App ID:** `com.transportessinbarreras.noa`, `androidScheme: https`, `webDir: dist`.

## Estructura

`src/` → `features/` (un módulo por dominio: `services/`, `store/`, `views/`, `components/`, `routes.js`), `components/`, `pages/`, `layouts/`, `router/` (`guards/` activos), `store/` (Pinia: `modules/`, `plugins/`, `helpers/`), `services/` (`api/` con `BaseService` y `client.js`, `security/`, `versionUpdate.service.js`), `hooks/`, `utils/`, `types/`.

`android/` es el proyecto Gradle nativo. `scripts/` contiene `a11y-audit.js` y `perf-budget.js`.

## Comandos

- `npm run dev` / `build` / `preview`.
- `npm run test:unit`: pruebas Vitest. **Hoy `npm test` no las incluye** (`test:a11y` + `test:perf`); correr ambas hasta decidir cambiarlo.
- `npm run test:a11y`: conteo de antipatrones de accesibilidad en `src/`, con delta contra el último reporte.
- `npm run test:perf`: presupuesto de peso sobre `dist/` y `index.html`. Requiere `npm run build` previo. Solo informa, no bloquea.
- `npm run cap:sync` (build + `cap sync`), `npm run cap:open:android`.

## Arquitectura y Patrones

El repo sigue patrones intencionales. Un código nuevo debe encajar en ellos, no inventar uno paralelo.

- **Capas:** vistas → stores (Pinia) → servicios de feature → `BaseService` → `apiClient` → interceptores.
- **Servicios:** cada feature tiene su servicio que extiende `BaseService` (`resourcePath`, `metadata`). Las llamadas HTTP pasan por `_request`, `_downloadPdf` o `_multipart`. No usar `apiClient` directo desde una feature; `DashboardService` es la excepción pendiente de migrar.
- **Stores:** cada feature exporta `useXxxStore` con `state`, `getters` y `actions`. Las acciones que llaman a la API se ejecutan con `runStoreAction(this, action, errorMsg)` (`src/store/helpers/runStoreAction.js`): gestiona `loading`, `error`, el aviso y el relanzamiento. **No copiar un `_run` local**: los stores que aún lo tienen (21) se migran a este ayudante.
- **Stores singleton de configuración:** `store/index.js` registra plugins por ID de store (persistencia, cifrado, logger) con `PLUGIN_REGISTRY`. Un store nuevo que necesite persistencia se añade ahí.
- **Módulos puros:** la lógica de decisión vive en funciones puras sin Pinia ni DOM ni Capacitor (`utils/modoConductor.js`, `features/dashboard/utils/presentacionConductor.js`). Los hooks (`hooks/useModoConductor.js`) las conectan con la app.
- **Inyección de dependencias:** los módulos con efectos externos exponen una fábrica con dependencias opcionales (`createVersionUpdater(deps)`). Así se prueban sin red ni plataforma.
- **Plataforma:** `LoginView.vue` es un dispatcher entre `LoginMobile` y `LoginDesktop` según Capacitor; `?mobile=1|0` solo sirve para previsualizar en navegador.
- **Interceptores:** `services/api/interceptors.js` es la cadena única de request y response. Los 401 limpian la sesión y emiten `auth:unauthorized`; las rutas `/login` y `/refresh-token` gestionan su propio error.
- **Eventos del navegador:** `app:toast` y `auth:unauthorized` son el canal para avisar fuera de un store. No crear canales nuevos.
- **Guards:** `router/index.js` ejecuta en orden `authGuard`, `twoFAGuard`, `tenantGuard` y `permissionsGuard`. `router/middleware/` está muerto y se elimina.
- **Hooks de formulario:** `useAccessibleForm` (y `useFormManager`, que lo envuelve) son el estándar para formularios nuevos.

## Convenciones

### Formularios y accesibilidad
- `label for` ↔ `input id` (`f-<campo>`, puntos a guiones); `:aria-invalid`; `:aria-describedby` apunta a `f-<campo>-error`; errores con `id` y `role="alert"`; foco al primer error con `.focus()`.
- Iconos decorativos con `aria-hidden="true"`; botones solo-icono con `aria-label` en español.
- Sin `role="button"` en `router-link`, `<a>` sin `href`, `href="#"`, `javascript:void(0)` ni `aria-label` en inglés.
- Un campo que se repite en varias vistas se extrae a un componente compartido. Los wrappers de select y fecha del frontend web (`PrimeSelect`, `DateInput`) aún no existen en este repo: portarlos antes de usarlos.

### Avisos, logs y errores
- Avisos al usuario con `utils/toast.js`. No importar `sweetalert2` directamente.
- Logs con `utils/logger.js`. No usar `console.*` directo. Los 79 archivos actuales que lo usan se migran poco a poco.
- Error de API sin mensaje útil: usar el mensaje de respaldo en español, nunca un error técnico.

### Permisos y roles
- Una pantalla que llama a una ruta con permiso propio condiciona la llamada con `permissionsStore.can('<permiso>')` y oculta la tarjeta o el botón. No depender de que el backend responda 403.
- `permissionsStore.hasRole()` normaliza nombres (`super-admin` = `super_admin` = `SUPERADMIN`). Usar `hasRole('superadmin')` y `hasRole('administrador')` según el caso.
- Para el conductor: `hasRole('CONDUCTOR')` y `useModoConductor()`, nunca comparar el rol a mano en cada vista.

### Diseño móvil
- Diseño móvil primero: modales y layouts adaptados a pantalla de teléfono (360–412 dp).
- Objetivos táctiles de 48 dp como mínimo; el CTA principal en la zona del pulgar.
- **El estado nunca se comunica solo con color:** cada estado lleva icono y texto.
- Texto de 14 sp o más para contenido; 12 sp solo para metadatos. Nada por debajo de 12 sp.
- Sin efectos de hover; usar estados pressed y ripple.
- **Naranja (`#F97316`): reservado para pendientes y alertas del conductor** (preoperacional pendiente, acciones urgentes en ruta). Se sigue el rediseño de Stitch, no el criterio del backend. "Editar" usa tratamiento neutro (texto o icono, sin naranja).

### Estilos
- Los estilos van en `<style scoped>` del componente. No duplicar bloques de estilo entre vistas: si se repiten, se extraen a un componente o a una clase compartida.
- Los colores de marca viven como valores fijos hoy (`#0C2461`, `#2563EB`, `#F97316`, `#16A34A`, `#14B8A6`, fondo `#F0F3F8`). Mover a tokens antes del rediseño masivo.

## Pruebas

- **Ubicación:** `__tests__/` junto al módulo (p. ej. `src/store/helpers/__tests__/runStoreAction.test.js`). Solo `*.test.js`.
- **Funciones puras primero:** si la lógica depende de Pinia, Capacitor o red, extraerla a una función pura o inyectar la dependencia (fábrica con `deps`).
- **Casos negativos obligatorios:** fallo de red, respuesta vacía, error sin mensaje, aviso que también falla, permiso denegado, estado sin datos.
- **Forma de la respuesta:** al probar listados, armar la respuesta con la misma forma que devuelve `BaseService` (`{ success, message, data }`; un listado paginado está en `r.data.data`). Una prueba con otra forma pasa en verde con la pantalla vacía.
- **Componentes Vue:** hoy no hay entorno DOM. Antes de la primera prueba de componente, añadir `jsdom` y `@vue/test-utils` en un PR propio y declarar `// @vitest-environment jsdom` en la primera línea de cada archivo.
- **Estado actual:** 58 pruebas en 5 archivos (`npm run test:unit`, 2026-10-09).

## Medición de Rendimiento y Accesibilidad

Todo cambio que afecte peso, arranque o interacción se mide antes y después. Una mejora sin medición no está completa.

- **Línea base 2026-10-09** (en `upstream/main` + PR #1 + `runStoreAction`): `totalJS` 2860.8 kB (2861.0 kB tras `runStoreAction`), `totalCSS` 288 kB, `indexJS` 140.7 kB, `vendor-primevue` 806.3 kB, 158 chunks JS, 87 CSS. `totalJS` ya supera el presupuesto de 1800 kB: el aviso es histórico, no bloqueante, pero no debe subir.
- **Criterio de aceptación:** si el JS inicial sube, el CSS total sube o el tiempo hasta datos empeora más de 5 %, el cambio se corrige o se revierte antes de seguir.
- **Accesibilidad (2026-10-09):** `<label>` sin `for` = 91; `v-model` sin `id` = 129; `<i>` sin `aria-hidden` = 959; `href="#"` = 1. No deben subir.
- **Protocolo:** construir con `npm run build` y medir con `npm run test:perf` antes y después. Los reportes en `docs/metrics/` se commitean solo cuando el cambio es de rendimiento deliberado.

## Convención de Commits

- Mensajes directos en español, en una sola línea, formato `tipo(scope): descripción corta` (p. ej. `fix(android): ...`).
- Sin cuerpo ni bullets, salvo que el cambio lo exija. Si lo exige: una o dos frases, tres puntos como máximo. Nunca el listado de archivos.
- **Cuándo commitear:** solo después de revisar el código (`/code-review` o revisión propia contra este archivo), o cuando el usuario lo pida explícitamente. Si la revisión encuentra hallazgos, se corrigen antes de commitear.
- Tipos: feat, fix, refactor, perf, style, docs, test, build, ci, chore.
- **Ojo:** `.github/COMMIT_CONVENTION.md` (del repo original) pide título, cuerpo en viñetas y línea `Verificación:`. Los commits recientes usan una línea. Para el original, confirmar con el responsable antes de subir.
- Reescribir commits (`commit --amend`, `rebase`) solo en ramas que no se han subido, o con permiso explícito.

## Flujo de Ramas y PR

- **Nunca trabajar directo en `main` del fork.** Una rama por propósito, partiendo de `upstream/main`:
  `git fetch upstream` → `git switch -c <tipo>/<tema> upstream/main` → commits → `git push -u origin <rama>` → `gh pr create --repo solucionesintegralesmanasas/noa-android --base main --head Erron-26:<rama>`.
- **Antes de crear la rama, comprobar que no tenga upstream en el original.** Tras `git switch -c ... upstream/main`, ejecutar `git branch --unset-upstream`. Sin esto, un `git push` puede apuntar al `main` del original.
- **Rama base:** `main` del original (confirmado por el usuario). No usar `feature`.
- **PR apiladas:** evitar. Una PR por propósito; si dos cambios dependen uno del otro, van en una sola PR.
- **Quién abre la PR:** el usuario, o el agente cuando el usuario lo pida explícitamente.
- **Cuerpo del PR:** resumen, cambios, verificación (tests, build, perf) y pendientes. Sin línea de atribución ni firma (decisión del usuario).
- **Estado actual:** PR #1 abierta en el original (`refactor/modo-conductor-pr`, OPEN, MERGEABLE, 2026-10-09). PR #1 del fork abierta y apilada sobre ella (`refactor/store-run-helper`, 2026-10-09): al fusionarse la del original, esta se reubica a su `main` y se reabre allí. Rama activa: `refactor/store-run-helper` (subida).
- Para actualizar el fork: `git fetch upstream && git merge --ff-only upstream/main`.

## Lanzamientos (quién publica y cómo)

**Este repo (`Erron-26/noa-android`) es un fork de práctica: aquí NO se publican los releases oficiales.** El proyecto real pertenece a la organización `solucionesintegralesmanasas`. Los releases salen del repo original `solucionesintegralesmanasas/noa-android`, que es el que consulta el auto-update de la app (`src/services/versionUpdate.service.js`, `GITHUB_OWNER`). Ese valor es correcto y no se cambia al del fork. No crear tags `v*` aquí esperando que lleguen a los usuarios.

- **Mecánica (la misma en el original):** `git tag vX.Y.Z && git push origin vX.Y.Z` dispara `.github/workflows/android-release.yml` (Node 22, Java 21, SDK 36): `npm ci` → sincroniza `VITE_APP_VERSION` (`.env.production`) y `package.json` con el tag → `build --mode production` → verifica estilos en `dist/` → `cap sync android` → `versionName` = tag y `versionCode` = actual de `android/app/build.gradle` + 1 → `assembleRelease` firmado → publica `NOA-vX.Y.Z.apk` y `.sha256.txt` en el Release. Un tag = un commit en `main`. No editar la versión a mano.
- **Firma:** keystore único (`.jks`, nunca en git) en los secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Mismo `applicationId` y misma firma o la app instalada no se actualiza. Este fork no tiene esos secrets. En local, `Run` de Android Studio usa `debug` sin keystore.
- **Cuerpo del Release:** obligatorio, desde `.github/RELEASE_TEMPLATE.md`. Naming estricto de assets; verificaciones previas (firma, `aapt dump badging`, instalación limpia y actualización encima) en `docs/RELEASE.md`.
- **Antes de proponer un release o PR al original:** `.env.production` apunta a `https://api.transportessinbarreras.com/api/v1/`; los cambios de contrato con la API (rutas, permisos) ya existen en el backend desplegado; la versión de `package.json` solo sube vía tag.

## Relación con Backend y Frontend Web

- **Frontend web:** despliega por FTP en cada push (`deploy.yml`); `appflow.yml` genera Android debug en `main`/`develop` y release en tag `v*`.
- **Backend:** no tiene workflows. Se despliega a mano (`php artisan migrate --force` cuando hay migraciones nuevas). Antes de subir un cambio que dependa de una ruta o permiso nuevo, comprobar que ya está en producción.
- **Permisos:** el backend exige permisos por recurso (middleware `authz`, `permission:` de Spatie). Un permiso nuevo en la app requiere su ruta y su permiso en el backend.
- **Multi-tenant:** la app envía la empresa activa en `X-Company-UUID`. El backend responde 403 si la empresa no es del usuario.

## Estado del Proyecto (2026-10-09)

### Hecho
- **Actualización de la app:** `versionUpdate.service.js` con fábrica inyectable y 16 pruebas (PR #1).
- **Roles:** `hasRole()` como comparación única; `rbac.js` retirado; 26 vistas migradas (PR #1).
- **Modo conductor:** `utils/modoConductor.js`, `hooks/useModoConductor.js` y `presentacionConductor.js`, probados (PR #1).
- **Documentación del agente y de dominio:** `AGENTS.md` y `docs/agents/` (PR #1).
- **Ayudante de stores:** `runStoreAction` con 12 pruebas (casos de error incluidos); 5 stores del conductor migrados (`refactor/store-run-helper`, subida con PR apilada en el fork).

### Pendiente (en orden sugerido)
1. Hecho 2026-10-09: `refactor/store-run-helper` subida con su PR apilada en el fork (base `refactor/modo-conductor-pr`). Al fusionarse la PR #1 del original, reubicarla a su `main` y reabrirla allí.
2. Migrar los 21 stores restantes a `runStoreAction`, en lotes por feature, midiendo cada lote.
3. Eliminar `src/router/middleware/` (`auth.js`, `role.js` no tienen referencias).
4. Renombrar restos de la plantilla original: evento `factus:logout` (`store/index.js`) y `FactusNext` en `utils/logger.js` y `utils/plugins.js`.
5. Migrar `DashboardService` a `BaseService`.
6. Unificar la lógica de conductor duplicada: `Sidebar.vue` (`isConductorDashboard`) y `esConductor()` de `router/guards/auth.js` pasan a usar `useModoConductor` o `hasRole`.
7. Decidir si `?view=conductor` oculta el sidebar en cualquier ruta o solo en las operativas, y probarlo.
8. Migrar `console.*` (79 archivos) a `logger` y `sweetalert2` directo (36 archivos) a `toast`, en PRs separados por feature.
9. Añadir `test:unit` a `npm test`, o documentar que no va.
10. Login móvil: contraste del logo (decisión: texto + icono, sin asset), tagline con más contraste, "¿Olvidaste tu contraseña?" con estilo deshabilitado real. Comparar con el rediseño de Stitch (`DESIGN.md`) y medir antes y después.
11. Portal del conductor: revisar el enlace "Ver todo" (hoy lleva a `/dashboard/conductor`, la misma pantalla).
12. Rediseño móvil del conductor con Stitch: primero tokens compartidos, luego Inicio, después el resto. Pendiente de decisión: si el sidebar se oculta por completo para el rol conductor.
13. Decidir si `AGENTS.md` y `docs/agents/` se quedan en el repo (ya están en PR #1).

### Decisiones abiertas
- Ninguna pendiente. La última abierta (commit de este archivo) se resolvió el 2026-10-09.

## Reglas para el Agente

- Responder y comentar siempre en español.
- Antes de cambiar código, leer el archivo y los módulos vecinos; no inventar un patrón nuevo si ya existe uno.
- No commitear sin revisión o sin petición explícita. No subir ramas ni abrir PR sin petición explícita.
- Una mejora de rendimiento o visual se mide con `npm run build` + `npm run test:perf`. Una lógica nueva llega con sus pruebas, incluidos los casos negativos.
- Antes de comprometer un cambio que toque el original, confirmar `.env.production`, contratos de API y versión.
- Si una decisión de producto no está en este archivo (naranja, sidebar, atribución), preguntar; no decidirla en silencio.
- En modo plan no se modifican archivos ni se ejecutan comandos que los alteren.

## Agent skills

### Issue tracker

Issues en GitHub Issues de este repo (`Erron-26/noa-android`, vía `gh`). Ver `docs/agents/issue-tracker.md`.

### Domain docs

Layout de contexto único. Ver `docs/agents/domain.md`.
