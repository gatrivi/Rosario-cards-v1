# Rosario — baseline funcional antes del hardening de Luján 2026

Fecha de captura: 2026-08-18

## Punto de retorno

- Rama de producción al iniciar: `cloud-rosary-v2`
- Commit exacto: `19b4fc0950e2e02f49f511fb3d8823ca78b9ca2f`
- Rama de trabajo: `agent/lujan-launch-hardening`
- Regla: si un cambio rompe un flujo documentado aquí, comparar contra el commit base antes de intentar una segunda solución.

## Objetivo de esta baseline

Registrar el comportamiento que ya existe y que no debe perderse durante el hardening previo a la Peregrinación a Luján. Este documento es una red de seguridad funcional, no una afirmación de que todo esté libre de bugs.

## Núcleo que funciona hoy

### Arranque / PWA

- La app entra por `src/index.js` y renderiza `AppShell` dentro de `BrowserRouter` y `ErrorBoundary`.
- El service worker se registra y existe un flujo de actualización de PWA.
- Existe captura local de errores para diagnóstico desde la propia app.
- Hay fallback de navegación de la PWA hacia `index.html`.

### Flujo principal de oración

- `Libro` es la experiencia guiada principal.
- `Rosario` ofrece la experiencia física/virtual alternativa.
- Existe progreso por misterio y paso.
- Libro y Rosario comparten progreso clásico mediante la capa de sync actual.
- Hay misterios Gozosos, Dolorosos, Gloriosos y Luminosos.
- La app puede iniciar directamente el Rosario correspondiente al día.
- El primer ingreso ofrece un camino simple para empezar a rezar.

### Libro

- Muestra secuencia de oraciones por misterio.
- Soporta variantes y oraciones opcionales.
- Tiene navegación adelante/atrás.
- Incluye imágenes y modo visual.
- Incluye opciones de voz/audio.
- Permite compartir contenido generado desde la app.
- Tiene outline/índice y controles móviles.

### Rosa

- Existe como vista independiente.
- Tiene cobertura automatizada de interacción, dibujo/progreso y sincronización clásica.
- Las correcciones recientes preservan el contrato de interacción de Rosa.

### Rosario Matter.js

- Existe la vista física de rosario.
- Soporta interacción táctil.
- Las correcciones recientes incluyen comportamiento de pinch/viewport sin reinicializar la experiencia principal.

### Devociones

- Hay selector/galería visual de devociones.
- La galería puede abrirse fullscreen.
- Las devociones pueden entrar al flujo de oración de Libro.
- Existe un camino visual para volver al Rosario; su preservación exacta de contexto se considera un bug a corregir, no una feature a eliminar.

### Peregrinación a Luján

- Existe una vista dedicada a Luján 2026.
- Comunica que quien peregrina puede usar Rosario sin cargo.
- Tiene acción para compartir la app.
- Tiene entrada directa a rezar.
- Incluye acceso a Diario/Rosedal.
- Existe soporte de donación condicionado a configuración por entorno.

### Navegación

Navegación primaria actual:

- Libro
- Rosario
- Más

Dentro de Más existen accesos a experiencias secundarias como Diario, Rosedal, Camino, Rosa, Voz y Autorezo.

### Voz / grabación

- La grabación de oración funciona localmente mediante `MediaRecorder`.
- Las tomas locales se guardan en IndexedDB.
- Se soportan múltiples tomas por oración/slot.
- Existe infraestructura para biblioteca de voz compartida en Firebase.

Importante: durante el hardening puede desactivarse temporalmente la publicación automática compartida sin considerar eso una regresión; guardar localmente sí es parte de la baseline.

### Configuración y accesibilidad práctica

- Existen modos/ajustes de lectura y oración.
- Hay controles pensados para uso móvil y con una mano.
- Existen ajustes persistidos localmente.
- La app expone información de versión/actualización.

### Sync

- Hay persistencia local.
- Existe sincronización remota mediante el mecanismo actual basado en sync ID.
- La lógica actual intenta impedir que estados viejos del Rosario físico hagan retroceder el progreso clásico del Libro.

No se considera requisito de esta baseline que el sistema actual de sync permanezca arquitectónicamente igual; sí debe sobrevivir el comportamiento observable de continuar una oración.

## Contratos que NO deben romperse

1. Abrir app → empezar a rezar sin crear cuenta.
2. Libro → avanzar → recargar → conservar progreso razonablemente.
3. Libro ↔ Rosario → conservar misterio/paso clásico.
4. Abrir devoción → rezarla → poder volver al Rosario.
5. Rosa → interactuar sin perder el progreso clásico.
6. Rosario Matter.js → tap/drag/pinch sin navegación accidental.
7. Primera visita → CTA claro para rezar hoy.
8. Grabación → permiso de micrófono → grabar → guardar localmente.
9. PWA instalada → abrir y actualizar sin quedar en una versión vieja indefinidamente.
10. Vista Luján → rezar / compartir / ver donación si está configurada.

## Cobertura automatizada existente relevante

El repositorio ya contiene tests para varias áreas, entre ellas:

- `BookletView`
- `DevotionsShelf`
- `MobileElementStepper`
- `PrayerRecorder`
- `RoseView`
- interacciones/dibujo de Rosa
- `VirtualRosaryPhysics`
- sincronización de configuración artística
- progreso/layout de Libro
- sincronización cloud/clásica

El workflow específico de Rosa valida actualmente sólo un subconjunto. Durante el hardening se ampliará CI, pero primero se conserva esta lista como inventario de cobertura ya existente.

## Regresiones conocidas en el punto base

Estas fallas YA EXISTEN en el commit base; corregirlas no significa que un cambio nuevo haya roto la app:

- Volver desde una devoción puede resetear al misterio por defecto/paso 0 y hacer reload completo.
- Existen diálogos nativos del browser (`alert`, `confirm`, `prompt`) en varias vistas.
- La publicación compartida de voz ocurre sin un consentimiento explícito separado del guardado local.
- Las reglas versionadas de Firebase dejan escrituras compartidas abiertas.
- El feedback usa un bucket JSONBlob identificable desde el cliente.
- El paquete offline no precachea de forma proactiva todo lo necesario para caminar sin señal.
- Hay versiones de app inconsistentes entre `package.json`, `AppShell`, `index.js` y service worker.

## Checklist manual de recuperación

Antes de declarar roto un cambio nuevo:

- [ ] Comparar archivo afectado contra `19b4fc0`.
- [ ] Probar `/libro` en viewport móvil.
- [ ] Avanzar 3 pasos y recargar.
- [ ] Cambiar Libro ↔ Rosario y revisar progreso.
- [ ] Abrir una devoción.
- [ ] Probar Rosa.
- [ ] Probar Matter.js: tap, drag y pinch.
- [ ] Probar grabación local con permiso concedido y denegado.
- [ ] Probar `/peregrinacion`.
- [ ] Probar instalación/update PWA cuando aplique.

## Política durante hardening

Orden de prioridad:

1. Seguridad / integridad de datos.
2. No perder progreso de oración.
3. No romper mobile.
4. Offline para peregrinación.
5. Compartir/donaciones.
6. Recién después, features nuevas.

Si una mejora P0 exige sacrificar temporalmente una feature insegura —por ejemplo publicación pública de voz— se conserva el flujo local y se documenta explícitamente la degradación segura.
