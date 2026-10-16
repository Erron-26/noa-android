## NOA v1.2.2 — Ajustes del login móvil y ancho completo

App de Transportes Sin Barreras para Android (Vue + Capacitor).

### Incluye
- Login móvil a ancho completo: la pantalla sangra hasta los bordes (neutraliza el padding lateral del contenedor) y el comportamiento se centraliza en una sola utilidad (`noa-fullbleed` + `usePantallaCompleta`) en lugar de CSS duplicado entre vistas.
- Tokens de diseño para el login: los colores y gradientes que estaban fijos en `LoginMobile.vue` pasan a variables en `tokens.css` (hero, botón principal, campos, estados de enfoque y error).
- Se retira el botón "Acceso biométrico" del login (solo mostraba un aviso de que no estaba disponible); la biometría queda documentada como investigación futura, sin implementar (`docs/features/biometria.md`).
- Prueba unitaria de la utilidad de pantalla completa (`src/utils/__tests__/pantallaCompleta.test.js`).
- Nuevo `.env.development` para desarrollo local (no afecta los builds de release).

### Requisitos
- Android 7.0 o superior.
- Conexión a https://apinoatransportes.solucionesintegralesmana.com.
- Permisos: ubicación (incluida en segundo plano), notificaciones, ejecución en segundo plano e instalación de paquetes.

### Instalación
1. Descargar `NOA-v1.2.2.apk` desde este Release.
2. Permitir "instalar apps desconocidas" cuando Android lo pida.
3. Abrir NOA e iniciar sesión con tu usuario.

### Actualizaciones futuras
- Instalar el APK nuevo encima, sin desinstalar: conserva datos y sesión.
- La propia app detecta la nueva versión y ofrece la descarga automática.
- Verifica el SHA256 con el `.sha256.txt` adjunto si lo descargaste fuera de aquí.

### Verificación técnica
- `applicationId com.transportessinbarreras.noa`, `versionName 1.2.2`, `versionCode 11` (build.gradle 10 + 1), APK firmado release.
- Para la próxima versión solo cambian versión y la sección "Incluye".
