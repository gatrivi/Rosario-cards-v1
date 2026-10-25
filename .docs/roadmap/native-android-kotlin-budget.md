# Presupuesto & Arquitectura: App Nativa Android (Kotlin)

> **Documento de evaluación técnica y hoja de ruta.**  
> Estado: Evaluativo / Hoja de ruta futura (Backlog Rango 5).  
> Meta: Analizar viabilidad, equivalencias de stack, arquitectura recomendada y estimación de esfuerzo para una versión nativa de Rosario Cards en Kotlin / Jetpack Compose.

---

## 1. Resumen Ejecutivo y Decisión Actual

Actualmente **Rosario Cards** opera como una PWA (Progressive Web App) en React 19 optimizada para móviles (táctil, pantalla completa `100dvh`, soporte offline con Service Worker y almacenamiento local en IndexedDB / localStorage).

**Veredicto actual:** Mantener la PWA como plataforma móvil principal mientras se completa el catálogo de devociones, arte y audio. Desarrollar la aplicación nativa en Kotlin una vez alcanzada la estabilidad funcional total en web, o cuando se requieran capacidades exclusivas de plataforma (compañero para Wear OS, widgets de escritorio con el misterio del día, lock-screen audio notification nativo de baja latencia o renderizado físico a 120Hz sin sobrecarga de V8).

---

## 2. Mapa de Equivalencias Tecnológicas (Web → Android)

| Subsistema | Rosario Web (React 19) | Android Nativo (Kotlin) | Notas de Migración |
|------------|------------------------|-------------------------|---------------------|
| **UI & Layout** | React 19 + CSS Modules / Glassmorphism | Jetpack Compose + Material 3 | Compose simplifica los estados reactivos; glassmorphism requiere `Modifier.blur()` (Android 12+) o render-scripts degradados para Android <12. |
| **Rosario Físico** | Matter.js (Verlet 2D constraints) | Box2D nativo (C++ vía NDK / libGDX) o Simulador Verlet personalizado en Kotlin | Un integrador Verlet puro en Kotlin (~400 líneas) es más ligero que una suite de física completa y reproduce exactamente la topología de 61 cuentas. |
| **Rosa Vectorial** | SVG dinámico + Canvas 2D (`RoseDrawing`, `VerseDrawing`) | Android `Canvas` / Compose `DrawScope` con `Path` | Alta fidelidad: Compose permite shaders AGSL (Android 13+) para el brillo áureo y degradados de tinta de las huellas (`roseFingerprint.js`). |
| **Audio SFX** | Web Audio API (osciladores sintéticos y convolución) | Oboe (C++) / SoundPool / AudioTrack | Oboe garantiza latencia ultra-baja (<10ms) en toque de cuentas. |
| **Voz Devocional** | HTML5 `<audio>` + Media Session API | AndroidX Media3 (ExoPlayer) + MediaSessionService | Compatible directo con el contrato JSON de CatTS (`NarrationDocument` / manifest v1). Permite background playback continuo. |
| **Base de Datos** | localStorage + IndexedDB | Room (SQLite) + Jetpack DataStore | Migración trivial de modelos de oración, huellas de rosas (últimas 500) y progreso diario. |
| **Sincronización** | `fetch` debounced (jsonblob / Firebase REST) | Ktor Client / Retrofit + WorkManager | WorkManager asegura sincronización periódica en segundo plano aun con app cerrada. |

---

## 3. Estimación de Esfuerzo (Desglose por Fases)

### Fase 1: Núcleo Devocional y Libro (Booklet)
- **Alcance:** Motor de secuencias litúrgicas (`buildSequence`), visor de oraciones verso a verso, catálogo de devociones históricas (15+ devociones), selector de misterios y reproductor de audio guía con Media3.
- **Esfuerzo estimado:** 3 semanas (1 desarrollador senior Android).
- **Riesgo:** Bajo.

### Fase 2: Rosa de Foco y Trazado Vectorial
- **Alcance:** Gesto táctil "hold-to-charge" y lectura fluida guiada por el dedo, contratos de gestos (cálculo de cajas de texto, sin reflow bajo el pulgar, avance tras beat de Amén), algoritmo determinista de huella de rosa (`roseFingerprint`), visualización del jardín (`JardinDeRosas`).
- **Esfuerzo estimado:** 3 semanas.
- **Riesgo:** Medio (requiere precisión micrométrica en `PointerInputScope` y métricas de fuentes).

### Fase 3: Rosario Físico de Cuentas (Physics Engine)
- **Alcance:** Cadena cerrada de 61 nodos (1 cruz, 1 medalla, 59 cuentas), restricciones rígidas y elásticas, detección de gestos táctiles (zoom de pulgar, doble toque, arrastre magnético, trazado de cruz ✝), sintetizador procedural de campanas e impacto de cuentas.
- **Esfuerzo estimado:** 4 semanas.
- **Riesgo:** Alto (afinar la sensación táctil de "terciopelo pesado", fricción y evitar nudos en la cadena).

### Fase 4: Camino de Peregrinación, Rosedal y Sincronización
- **Alcance:** Mapa SVG del camino a Luján/Jerusalén, macetones de compromiso diario, sincronización en segundo plano con WorkManager, empaquetado offline de arte vitral (Asset Pack de Play Store).
- **Esfuerzo estimado:** 2.5 semanas.
- **Riesgo:** Bajo a Medio.

---

## 4. Presupuesto Global Estimado

- **Tiempo total estimado:** ~12.5 semanas (aprox. 500 horas de desarrollo especializado).
- **Costos de infraestructura / licencias:**
  - Cuenta Google Play Developer: $25 USD (pago único).
  - Almacenamiento/CDN de arte y paquetes de voz: cubierto por infraestructura actual (CatTS / Firebase / Cloudflare R2).
- **Estrategia recomendada:** No iniciar el desarrollo nativo hasta congelar la especificación de datos de Cat Audio Engine (Fase 1 de CatTS) y contar con la biblioteca de vitrales y audios completa.
