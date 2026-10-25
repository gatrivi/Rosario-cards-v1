# Rosario Cards

[![Version](https://img.shields.io/badge/version-v0.3.88-gold.svg)](src/data/releaseNotes.js)
[![Production](https://img.shields.io/badge/live-rosario.gatrivi.com-blue.svg)](https://rosario.gatrivi.com)
[![Documentation](https://img.shields.io/badge/docs-.docs%2Findex.md-brightgreen.svg)](.docs/index.md)

Una aplicación devocional interactiva, contemplativa y táctil diseñada para guiar el rezo del Santo Rosario y devociones históricas cristianas a través del arte sacro vitral, física 2D de cuentas y arte generativo.

**Producción:** [https://rosario.gatrivi.com](https://rosario.gatrivi.com) (despliegue continuo en Vercel sobre rama `cloud-rosary-v2`).

---

## 📖 Filosofía y Experiencia de Usuario ("Visual First")

La aplicación está construida bajo una premisa estética y contemplativa estricta: **el lenguaje primordial es visual y táctil**.
- **Sin distracciones:** Se eliminan barras ansiosas de progreso numérico o métricas de racha del área principal de oración.
- **Jerarquía sagrada:** Las imágenes de vitrales y arte sacro dominan la atmósfera, el texto sagrado fluye en un plano medio legible y la cadena de cuentas o el trazo de luz operan de manera táctil sobre la superficie.
- **Paz y reverencia:** Modales accesibles y tarjetas de cristal (*glassmorphism*) aseguran que la oración nunca sea opacada por la sobre-explicación.

---

## ✨ Superficies Principales de la Aplicación

1. **El Libro (Booklet / `/libro`):**
   - Cuaderno devocional de lectura contemplativa verso a verso sobre vitrales de arte sacro.
   - Variantes en español, latín y versiones breves.
   - Audio guía humano y sintético con reproducción continua o bajo demanda.
   - Estante de devociones con más de 15 recorridos litúrgicos (Vía Crucis, Divina Misericordia, Sagrado Corazón, Inmaculado Corazón, Medalla Milagrosa, etc.).

2. **La Rosa Sagrada (Meditation / `/rosa`):**
   - Experiencia de rezo guiado por el dedo (*hold-to-charge* y lectura fluida).
   - El dedo ilumina las palabras de plata a oro fundido a medida que se contempla cada verso.
   - Cada Ave María rezada nutre y florece una **Rosa Vectorial única**, generando una huella digital determinista (`roseFingerprint.js`) que plasma el tiempo de permanencia, la hora del día, la luz solar y el misterio rezado.
   - Soporte para devociones completas como la Coronilla de la Divina Misericordia (64 pasos con el símbolo del Sagrado Corazón y sus rayos) y la Coraza de San Patricio.

3. **Rosario Físico Virtual (Physics Rosary / `/rosario`):**
   - Simulación física interactiva con Matter.js de una corona completa de 61 cuentas (1 cruz, 1 medalla, 59 cuentas).
   - Física de terciopelo pesado: amortiguación muerta, alta fricción y nudos prevenidos matemáticamente.
   - Doble toque para ampliar las cuentas al tamaño del pulgar para personas mayores.
   - Gesto magnético de la Cruz: dibujar ✝ sobre el lienzo alinea y ordena las cuentas automáticamente.
   - Campanas y campanil procedural de Web Audio en cada cambio de oración e impacto físico.

4. **El Rosedal y Macetones (`/macetones`, `/jardin`):**
   - Compromiso diario de rosas a plantar (1, 2, 4 u 8 rosarios diarios).
   - Jardín histórico donde cada flor exhibe los trazos, tintas y colores de la oración particular que la engendró.

5. **El Camino de Peregrinación (`/camino`):**
   - Mapa SVG que traza el progreso devocional acumulado a través de santuarios y basílicas del mundo.

6. **Estudio de Voz y Arte (`/voz`, `/assets`):**
   - Estudio para grabación, preescucha y auditoría de paquetes de voz devocional.
   - Curador y catalogador de imágenes litúrgicas vitrales con asignación verso a verso.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, Create React App (`react-scripts 5.0.1`), `react-router-dom v7`.
- **Física:** `matter-js` (simulación de cuerpos rígidos y restricciones elásticas).
- **Audio:** Web Audio API (sintetizador de campanas y armónicos) + HTML5 Audio / Media Session API.
- **Gráficos:** SVG dinámico, Canvas 2D acelerado por hardware y D3.js.
- **Almacenamiento & Sincronización:** `localStorage`, `IndexedDB`, `jsonblob.com` (con debounce de 2 segundos) y soporte opcional para Firebase.
- **PWA:** Service Worker con caché offline para templos, monasterios o zonas sin cobertura móvil.

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ y npm

### Instalación y Ejecución
```bash
# Clonar el repositorio
git clone https://github.com/gatrivi/Rosario-cards-v1.git
cd Rosario-cards-v1

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local (ejecuta scripts de manifiesto automáticamente)
npm start
```
La aplicación abrirá en `http://localhost:3000`.

### Comandos de Construcción y Test
```bash
# Compilar paquete optimizado para producción
npm run build

# Ejecutar suite de pruebas (recomendado con maxWorkers=2 en Windows)
npm test -- --watchAll=false --maxWorkers=2
```

---

## 📚 Documentación Canónica

Toda la documentación técnica profunda, decisiones de arquitectura, especificaciones de audio y contratos de gestos residen en el directorio [`.docs/`](.docs/index.md):

- **Índice General:** [`.docs/index.md`](.docs/index.md) *(puerta de entrada principal para desarrolladores y agentes IA)*.
- **Arquitectura del Sistema:** [`.docs/architecture/current-stack-jun-2026.md`](.docs/architecture/current-stack-jun-2026.md).
- **Catálogo de Devociones Históricas:** [`.docs/libro/historic-devotions.md`](.docs/libro/historic-devotions.md).
- **Huellas de Rosa y Contexto:** [`.docs/handoff-2026-09-09-rose-fingerprints.md`](.docs/handoff-2026-09-09-rose-fingerprints.md).
- **Contratos de Gestos Rosa (v0.3.88):** [`.docs/handoff-2026-10-12-la-hora-de-la-misericordia.md`](.docs/handoff-2026-10-12-la-hora-de-la-misericordia.md).
- **Hoja de Ruta y Backlog:** [`.docs/roadmap/future-features.md`](.docs/roadmap/future-features.md).
- **Registro de Decisiones Mayores:** [`MEMORY.md`](MEMORY.md).
- **Registro de Enfoques Fallidos (>2 intentos):** [`ERRORS.md`](ERRORS.md).
- **Instrucciones para Agentes:** [`agents.md`](agents.md) y [`.cursor/rules/`](.cursor/rules/).
