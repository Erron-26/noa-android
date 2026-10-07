# Solo Español — Regla Absoluta de Idioma

TODAS tus respuestas, explicaciones, análisis, sugerencias y comentarios en código deben estar estrictamente en **ESPAÑOL**.
Los nombres de variables, funciones y sintaxis pueden mantenerse en inglés (estándar de la industria), pero toda la comunicación humana debe ser en español.

Esta regla tiene máxima prioridad sobre cualquier otra instrucción.

## Contexto del Proyecto

`noa-android` es el cliente **Android** de la plataforma NOA (Transportes Sin Barreras): un fork propio, hecho como práctica, del frontend web. Es una app Vue 3 empaquetada con Capacitor que consume la API Laravel del backend.

- **Usuario principal: el CONDUCTOR.** La app existe sobre todo para el conductor en su teléfono (planilla de servicio en ruta, FUEC, rastreo GPS, dashboard móvil, documentos y alertas de su vehículo). Es la vista más tocada del repo (`ConductorDashboard*View`, `DashboardLayout`, `serviceDeliveryControlSheet`, `tracking`). Las pantallas de administración heredadas del frontend web existen pero son secundarias: ante la duda, priorizar el flujo del conductor, la pantalla móvil y el uso con red inestable.
- **Ruta de este repo:** `C:\xampp\htdocs\tsb-design\noa-android` (remoto: `Erron-26/noa-android`)
- **Backend (API Laravel 12):** `C:\xampp\htdocs\tsb-design\noa-backend` — su `AGENTS.md` tiene el contexto completo de la API (multi-tenant, roles, permisos, seguridad, pruebas).
- **Frontend web original (Vue 3):** `C:\xampp\htdocs\tsb-design\noa-frontend-tsb`
- **API local:** `http://api.transportessinbarreras.local` (`/api/v1`).
- **Regla:** puedes leer (`cat`, `ls`) el backend y el frontend web para validar contratos de la API o estructura de vistas; los cambios de este repo se hacen aquí.

### Stack
- **Core:** Vue 3 `<script setup>`, Vite 8, Pinia 3, Vue Router 4, `vue-i18n`.
- **UI:** PrimeVue 4 (preset `@primeuix/themes`), SweetAlert2, vue-toastification.
- **HTTP:** Axios (contra la API del backend); `CapacitorHttp` habilitado en `capacitor.config.json`.
- **Nativo:** Capacitor 8 (`android/`), plugins `geolocation`, `filesystem`, `preferences`, `share`, `file-opener`.
- **App ID:** `com.transportessinbarreras.noa`, `androidScheme: https`, `webDir: dist`.

### Estructura
`src/` → `features/`, `components/`, `pages/`, `views/`, `layouts/`, `router/`, `store/` (Pinia), `services/`, `hooks/`, `utils/`, `types/`. `android/` es el proyecto Gradle nativo. `scripts/` contiene `a11y-audit.js` y `perf-budget.js`.

### Comandos
- `npm run dev` / `build` / `preview`
- `npm test` = `test:a11y` + `test:perf` (auditoría de accesibilidad y presupuesto de peso)
- `npm run cap:sync` (build + `cap sync`), `npm run cap:open:android`

### Lanzamientos (quién publica y cómo)
**Este repo (`Erron-26/noa-android`) es un fork de práctica: aquí NO se publican los releases oficiales.** El proyecto real pertenece a la organización `solucionesintegralesmanasas` (origen del backend y del frontend web: `solucionesintegralesmanasas/noa-backend` y `.../noa-frontend-tsb`) y soy auxiliar. Los releases salen del repo original `solucionesintegralesmanasas/noa-android`, que es el que consulta el auto-update de la app (`src/services/versionUpdate.service.js`, `GITHUB_OWNER`); ese valor es correcto, no se cambia al del fork. Los cambios llegan al original **por Pull Request** desde este fork (remotos: `origin` = `Erron-26/noa-android`, `upstream` = `solucionesintegralesmanasas/noa-android`). No crear tags `v*` aquí esperando que lleguen a los usuarios.

- **Mecánica (la misma en el original):** `git tag vX.Y.Z && git push origin vX.Y.Z` dispara `.github/workflows/android-release.yml` (Node 22, Java 21, SDK 36): `npm ci` → sincroniza `VITE_APP_VERSION` (`.env.production`) y `package.json` con el tag → `build --mode production` → verifica estilos en `dist/` → `cap sync android` → `versionName` = tag y `versionCode` = actual de `android/app/build.gradle` + 1 → `assembleRelease` firmado → publica `NOA-vX.Y.Z.apk` y `.sha256.txt` en el Release. Un tag = un commit en `main`. No editar la versión a mano.
- **Firma:** keystore único (`.jks`, nunca en git) en los secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Mismo `applicationId` y misma firma o la app instalada no se actualiza. Este fork no tiene esos secrets, así que su workflow no produce una APK firmada útil. En local, `Run` de Android Studio usa `debug` sin keystore.
- **Cuerpo del Release:** obligatorio, desde `.github/RELEASE_TEMPLATE.md` (ajustar versión y sección "Incluye"). Naming estricto de assets; verificaciones previas (firma, `aapt dump badging`, instalación limpia y actualización encima) en `docs/RELEASE.md`.
- **Cómo se relaciona con el resto (backend/frontend web):** el frontend web despliega por FTP a hosting compartido en cada push (`deploy.yml`, con `VITE_ENV_PRODUCTION` como secret); su `appflow.yml` genera Android debug en `main`/`develop` y release en tag `v*`. El backend no tiene workflows: se despliega a mano (`php artisan migrate --force` cuando hay migraciones nuevas). Ramas de trabajo del backend y del frontend: `feature` → `develop` → `main`; este fork trabaja sobre `main`.
- **Flujo de PR (acordado):** una rama por propósito, nunca trabajo directo en `main` del fork: `git fetch upstream && git switch -c <tipo>/<tema> upstream/main` → commits → `git push -u origin <rama>` → `gh pr create --repo solucionesintegralesmanasas/noa-android --base main --head Erron-26:<rama>`. **Rama base: `main`** del original (confirmado por el usuario; no usar `feature`). Para actualizar el fork: `git fetch upstream && git merge --ff-only upstream/main`. Los PR los abre el usuario o se hacen a su petición explícita; el cuerpo del PR termina con la línea de atribución indicada por el sistema. El tag y el release los hace el responsable del original, no el PR.
- **Antes de proponer un release/PR al original:** que `.env.production` apunte a `https://api.transportessinbarreras.com/api/v1/`; que los cambios de contrato con la API (rutas, permisos) existan ya en el backend desplegado; y subir una versión nueva en `package.json` solo vía tag, no en el commit.

### Convenciones (heredadas del frontend web)
- Formularios con accesibilidad mínima: `label for` ↔ `input id`, `aria-invalid`, errores con `role="alert"`, `aria-label` en español en botones solo-icono.
- Notificaciones por `utils/toast.js`, no importar `sweetalert2` directo; sin `console.*` directo (usar `logger`) si existe en este repo.
- Una pantalla que llama a una ruta con permiso propio debe condicionar la llamada con el store de permisos, no depender del 403.
- Diseño móvil primero: modales y layouts adaptados a pantalla móvil; el estado nunca se comunica solo con color.
- Todo cambio que afecte el peso o el rendimiento se mide con `npm run test:perf` antes y después.

## Convención de Commits

- Mensajes directos en español, en una sola línea, formato `tipo(scope): descripción corta` (p. ej. `fix(android): ...`).
- Sin cuerpo ni bullets, salvo que el cambio lo exija para entenderse (máximo una o dos frases).
- Solo commitear tras revisar el código (`/code-review` o revisión propia) o cuando el usuario lo pida explícitamente.
- Tipos: feat, fix, refactor, perf, style, docs, test, build, ci, chore.
- **Ojo:** `.github/COMMIT_CONVENTION.md` (del repo original) pide título + cuerpo en viñetas + línea `Verificación:`. Los commits recientes y los de backend/frontend usan una línea; si el cambio va a subirse al original, confirmar con el responsable cuál aplica.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`Erron-26/noa-android`, via `gh`). See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
