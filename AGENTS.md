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

`src/` → `features/` (un módulo por dominio: `services/`, `store/`, `views/`, `components/`, `routes.js`), `components/` (`mobile/`, `layout/`), `pages/`, `router/` (`guards/` activos), `store/` (Pinia: `modules/`, `plugins/`, `helpers/`), `services/` (`api/` con `BaseService` y `client.js`, `security/`, `versionUpdate.service.js`), `hooks/`, `utils/`, `styles/` (`tokens.css`), `types/`.

Limpieza 2026-10-13: se retiraron `src/views/`, `src/layouts/` y `src/components/driver/` (subárbol sin ruteo), más 25 archivos sin referencia y `assets/brand-tokens.css`. La app se arma solo con `features/*/views/` y `pages/`.

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
- **Servicios:** cada feature tiene su servicio que extiende `BaseService` (`resourcePath`, `metadata`). Las llamadas HTTP pasan por `_request`, `_downloadPdf` o `_multipart`. No usar `apiClient` directo desde una feature.
- **Stores:** cada feature exporta `useXxxStore` con `state`, `getters` y `actions`. Las acciones que llaman a la API se ejecutan con `runStoreAction(this, action, errorMsg)` (`src/store/helpers/runStoreAction.js`): gestiona `loading`, `error`, el aviso y el relanzamiento. **No copiar un `_run` local**: ya no queda ninguno en features (los 26 migrados; `rolesandpermissions`, `notifications` y `tracking` usan manejo inline propio).
- **Stores singleton de configuración:** `store/index.js` registra plugins por ID de store (persistencia, cifrado, logger) con `PLUGIN_REGISTRY`. Un store nuevo que necesite persistencia se añade ahí.
- **Módulos puros:** la lógica de decisión vive en funciones puras sin Pinia ni DOM ni Capacitor (`utils/modoConductor.js`, `features/dashboard/utils/presentacionConductor.js`). Los hooks (`hooks/useModoConductor.js`) las conectan con la app.
- **Inyección de dependencias:** los módulos con efectos externos exponen una fábrica con dependencias opcionales (`createVersionUpdater(deps)`). Así se prueban sin red ni plataforma.
- **Plataforma:** `LoginView.vue` es un dispatcher entre `LoginMobile` y `LoginDesktop` según Capacitor; `?mobile=1|0` solo sirve para previsualizar en navegador.
- **Interceptores:** `services/api/interceptors.js` es la cadena única de request y response. Los 401 limpian la sesión y emiten `auth:unauthorized`; las rutas `/login` y `/refresh-token` gestionan su propio error.
- **Eventos del navegador:** `app:toast`, `auth:unauthorized` y `noa:logout` son el canal para avisar fuera de un store. No crear canales nuevos.
- **Guards:** `router/index.js` ejecuta en orden `authGuard`, `twoFAGuard`, `tenantGuard` y `permissionsGuard`. Sin carpeta `middleware` (eliminada 2026-10-13: no tenía referencias).
- **Hooks de formulario:** `useAccessibleForm` (y `useFormManager`, que lo envuelve) son el estándar para formularios nuevos.

## Convenciones

### Formularios y accesibilidad
- `label for` ↔ `input id` (`f-<campo>`, puntos a guiones); `:aria-invalid`; `:aria-describedby` apunta a `f-<campo>-error`; errores con `id` y `role="alert"`; foco al primer error con `.focus()`.
- Iconos decorativos con `aria-hidden="true"`; botones solo-icono con `aria-label` en español.
- Sin `role="button"` en `router-link`, `<a>` sin `href`, `href="#"`, `javascript:void(0)` ni `aria-label` en inglés.
- Un campo que se repite en varias vistas se extrae a un componente compartido. Los wrappers de select y fecha del frontend web (`PrimeSelect`, `DateInput`) aún no existen en este repo: portarlos antes de usarlos.

### Avisos, logs y errores
- Avisos al usuario con `utils/toast.js`. No importar `sweetalert2` directamente.
- Logs con `utils/logger.js`. No usar `console.*` directo. Quedan 66 archivos que lo usan (eran 79 al 2026-10-09); los 6 features del conductor ya están migrados, el resto se migra poco a poco.
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
- **Paleta (decisión 2026-10-13, Stitch para Android):** `primary #00103e`, `primary-container #0C2461`, `secondary #0051D5`, `secondary-container #316bf3`, éxito `#16A34A`, servicios `#14B8A6`. Fondo y superficies según `DESIGN.md` de Stitch. **Naranja (`#F97316`): reservado para pendientes y alertas del conductor** (preoperacional pendiente, acciones urgentes en ruta). "Editar" usa tratamiento neutro (texto o icono, sin naranja).
- **Navegación del conductor (decisión 2026-10-13):** 4 pestañas como en las pantallas (Inicio, Inspección, Servicios, Perfil). FUEC no va en la barra: el conductor no crea FUEC, solo los ve y descarga desde la tarjeta de Inicio.
- **Perfil (decisión 2026-10-13):** se conserva la versión de la app. Modo nocturno, datos offline y central 24/7 no están planeados; el modo nocturno queda anotado como idea futura, sin diseño.
- **Sidebar (verificado 2026-10-13):** en Android nativo nunca se monta (`DashboardLayout` usa `MobileConductorLayout`; el `Sidebar` solo existe en web/escritorio). Sin acción necesaria en nativo; en web sigue oculto en el dashboard del conductor.
- **Servicios (validado contra el backend 2026-10-13):** existen kilometraje, horas, recorridos con origen/destino, peajes, estados y novedad por recorrido. No existen aforo/pasajeros a bordo, ETA ni hitos de ruta: la pantalla se maqueta solo con datos reales.

### Estilos
- Los estilos van en `<style scoped>` del componente. No duplicar bloques de estilo entre vistas: si se repiten, se extraen a un componente o a una clase compartida.
- Los colores de marca viven como valores fijos hoy. La F1 del rediseño los mueve a `src/styles/tokens.css` con la paleta Stitch decidida arriba.

## Pruebas

- **Ubicación:** `__tests__/` junto al módulo (p. ej. `src/store/helpers/__tests__/runStoreAction.test.js`). Solo `*.test.js`.
- **Funciones puras primero:** si la lógica depende de Pinia, Capacitor o red, extraerla a una función pura o inyectar la dependencia (fábrica con `deps`).
- **Casos negativos obligatorios:** fallo de red, respuesta vacía, error sin mensaje, aviso que también falla, permiso denegado, estado sin datos.
- **Forma de la respuesta:** al probar listados, armar la respuesta con la misma forma que devuelve `BaseService` (`{ success, message, data }`; un listado paginado está en `r.data.data`). Una prueba con otra forma pasa en verde con la pantalla vacía.
- **Componentes Vue:** hoy no hay entorno DOM. Antes de la primera prueba de componente, añadir `jsdom` y `@vue/test-utils` en un PR propio y declarar `// @vitest-environment jsdom` en la primera línea de cada archivo.
- **Estado actual:** 83 pruebas en 7 archivos (`npm run test:unit`, 2026-10-13).

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
- Los ajustes de `AGENTS.md` que documentan un cambio van en el mismo commit de ese cambio, no en commits `docs` separados.
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
- **Estado actual:** PR #1 abierta en el original (`refactor/modo-conductor-pr`, OPEN, MERGEABLE). Incluye: módulos de actualización/roles/modo conductor, `runStoreAction` + 5 stores del conductor y la migración de los 21 stores restantes. Rama activa: `refactor/modo-conductor-pr` (subida).
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
- **Ayudante de stores:** `runStoreAction` con 12 pruebas (casos de error incluidos); los 26 stores migrados, sin ningún `_run` local.

### Pendiente (en orden sugerido)
1. Hecho 2026-10-09/13: `runStoreAction` + migración completa de los 26 stores, fusionados en `refactor/modo-conductor-pr` (rama `refactor/store-run-helper` y su PR del fork ya cerradas; `refactor/store-run-rest` fusionada directo por ser el mismo repo).
2. Hecho 2026-10-13: los 21 stores restantes migrados a `runStoreAction`; ya no queda ningún `_run` local. Peso total −1.3 kB.
3. Hecho 2026-10-13: `src/router/middleware/` eliminado (sin referencias).
4. Hecho 2026-10-13: restos `FactusNext` renombrados a NOA y evento `factus:logout` a `noa:logout`.
5. Hecho 2026-10-13: `DashboardService` migrado a `BaseService` con 5 pruebas (`refactor/limpieza-consistencia`); el store consume el cuerpo `{ success, data }`. Peso neutro (+0.1 kB).
6. Hecho 2026-10-13: `Sidebar.vue` usa la regla única (`esDashboardDeConductor`); no queda lógica duplicada en vistas. El guard (`router/guards/auth.js`) sigue decidiendo solo por rol a propósito: el `?view` no lo toca hasta que se cierre el punto 7.
7. Hecho 2026-10-13: `?view=conductor` solo rige en rutas operativas (decisión del usuario); fuera de ellas no oculta el sidebar. `?view=admin` lo anula en todas. Fijado con pruebas; el guard no usa `?view`.
8. En curso (2026-10-13): `console.*` migrado a `logger` en los 6 features del conductor (de 79 a 66 archivos). `utils/dialogs.js` (`aviso`, `confirmar`, `mostrarCargando`, `cerrarDialogo`, `copiarEnlace`, `escaparHtml`) con 17 pruebas, incluida la guardia anti-spinner-atascado; copiar-enlace triplicado extraído; URL escapadas. 9 vistas migradas y 6 libres de `Swal`. Quedan 3 vistas con `Swal` directo por formularios embebidos con validación inline (VehiclesListView, VehicleInspectionFormView, FuecFormView).
9. Añadir `test:unit` a `npm test`, o documentar que no va.
10. Login móvil: contraste del logo (decisión: texto + icono, sin asset), tagline con más contraste, "¿Olvidaste tu contraseña?" con estilo deshabilitado real. Comparar con el rediseño de Stitch (`DESIGN.md`) y medir antes y después.
11. Hecho 2026-10-13: se retiró el enlace "Ver todo" del portal (llevaba a la misma pantalla); cada tarjeta tiene su propia acción.
12. Rediseño móvil del conductor con Stitch (decisiones 2026-10-13 en Diseño móvil; diseños en `Diseños Stitch/`, 5 pantallas). F0 línea base lista (`docs/metrics/perf-baseline-rediseno.json`: JS 2859.8, CSS 288, índice 141.2). F1 hecha (2026-10-13, `redesign/stitch-conductor`): tokens en `src/styles/tokens.css` (solo variables, sin cambio visual) e Inter acotado en `index.html`. Medición: JS idéntico, CSS +0.7 kB (+0.24 %), a11y sin deltas. Limpieza previa (2026-10-13, fusionada en la rama): se retiró el subárbol `views/driver` + `layouts/` + `components/driver/` sin ruteo, `driver-tokens.css` y `brand-tokens.css` (colisión de `--noa-primary`), más 25 archivos sin referencia. F2 hecha (2026-10-13): `MobileCard`, `MobileSectionHeader`, `MobileEmptyState` y la barra inferior de `MobileConductorLayout` usan tokens y los mínimos (14/12 sp, 48 dp); barra con 4 pestañas (FUEC fuera). Nuevo `utils/estadoBadge.js` (puro, 6 pruebas) y `components/mobile/StatusPill.vue` (se usará en F4/F5). Medición: JS 2859.6, índice 141.0, CSS 289.1 (+0.7 kB), a11y sin deltas. F3 hecha (2026-10-13): login móvil con marca en texto + icono (sin asset), badge "Portal Conductor", tagline con más contraste, ayuda bajo el documento, inputs de 56 dp, botones de 52 dp y "olvidé mi contraseña" con estilo deshabilitado real. Medición: JS 2860.3, índice 141.0, CSS 290.4, a11y sin deltas. F4 hecha (2026-10-13): en el portal del conductor se retiró el enlace redundante "Ver todo", la sección es "Gestión operativa" y el grid 2×2 pasó a lista vertical tipo Stitch (una fila por módulo, navega al listado; decisión: el "+ Nueva" queda en el listado). Los 24 tamaños por debajo de 12 sp subieron al mínimo. Medición: JS 2859.3, índice 141.0, CSS 288.6, a11y sin deltas. Sigue F5 inspecciones.
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
