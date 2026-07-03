# Sesión nocturna — 3 jul 2026

**Versión:** `v0.3.44`  
**Estado:** build ✅ · 46 tests ✅

---

## Para leer primero (sin jerga)

### ¿Qué son los “overrides”?

Cuando en **Estudio de imágenes** renombrás una foto o le ponés etiquetas, eso **no cambia el código** — se guarda en el teléfono como “override” (reemplazo encima del registro base). Lo mismo con **asignar un verso de la letanía a una imagen**.

| Nombre técnico | Qué es en la práctica |
|----------------|----------------------|
| `registryOverrides` | Renombres y tags del Asset Studio |
| `verseAssignments` | “Verso 12 de la letanía → imagen X” |

---

## Qué se hizo esta noche

### 1. Sincronización de arte en la nube (sin Firebase obligatorio)

- Al renombrar/asignar, se dispara un evento y **jsonblob** recibe un campo `artConfig` junto con el progreso (mismo `syncId` de siempre).
- Al abrir la app con ese ID, si la nube es **más nueva**, se aplican los nombres/asignaciones localmente.
- Archivos: `artConfigSync.js`, `useArtConfigCloudSync.js`, hooks en `imageRegistry.js` + `imageAssignments.js`.

**Flujo usuario:** SyncManager → compartir ID → en otro dispositivo importar el mismo ID → los renombres viajan.

**Flujo dev:** Sigue existiendo Exportar/Importar JSON en `/assets` para pegar en el repo.

### 2. Firebase preparado (falta tu boilerplate)

- `npm install firebase` añadido.
- `.env.example` con `REACT_APP_FIREBASE_*`.
- `src/config/firebase.js` — solo activo si hay API key + project ID.
- `src/services/firebaseArtConfig.js` — escribe/lee `users/{syncId}/meta/artConfig` en Firestore (carga lazy, no infla el bundle si no hay config).

**Cuando pegues el boilerplate:** copiá valores a `.env.local`, reiniciá `npm start`. Art config irá a jsonblob **y** Firestore en paralelo.

### 3. Vía Crucis y Vía Lucis (primera versión)

- `src/data/viaCrucisData.js` — 14+14 estaciones, textos base en español.
- Imágenes **provisionales**: rota misterios dolorosos (Crucis) y luminosos (Lucis).
- Libro → vitral **✝** junto a Faustina → menú Vía Crucis | Vía Lucis.
- URL: `?misterio=viacrucis` o `?misterio=vialucis`.

**Pendiente:** textos completos por estación (meditaciones), arte dedicado por estación.

### 4. Acceso móvil al renombrador (v0.3.43, reforzado)

- **Ajustes → Estudio de imágenes** → `/assets`.
- Exportar / Importar JSON para puente manual móvil ↔ dev.

### 5. Otros arreglos recientes (contexto)

- URL deep links para Faustina, Novena (`?dia=`), Sangre Preciosa.
- Plan nivel por defecto = La Semilla (1 rosario/día) para usuarios nuevos.
- Tests Jest + react-router v7, App smoke test en AppShell.

---

## Mapa de devociones en Libro (UI actual)

```
Píldoras: Gozosos | Dolorosos | Gloriosos | Luminosos   (solo rosario clásico)

Vitrales header:
  [Faustina] → Corona | Novena
  [✝ Estaciones] → Vía Crucis | Vía Lucis    ← NUEVO
  [L] Letanía Sangre
  [C] Corona Sangre
  [7] Ofrendas Sangre

✦ Ángel · Benito (hoja opcional)
```

No hay ítem en BottomNav — a propósito, para no ensuciar.

---

## Imágenes: ¿usamos más?

| Fuente | Uso |
|--------|-----|
| `imageRegistry.js` (~30 bundled) | Faustina, Sangre, versos P/A, vitrales |
| `public/gallery-images` (~388) | Misterios, latín, letanía legacy |
| Overrides usuario | Nombres/tags vía Asset Studio |
| Assignments usuario | Verso → imagen (letanía, P, A) |

El rosario clásico **aún** tiene paths sueltos en `RosarioPrayerBook.js` — migración gradual al registro.

---

## Sistema de voz (estado honesto)

| Feature | Estado |
|---------|--------|
| Grabar en Libro (`PrayerRecorder`) | ✅ |
| Estudio `/voz` (4 misterios) | ✅ |
| Borrar toma (✕) | ✅ sin confirmación |
| Cancelar grabación en curso | ✅ Estudio “Salir sesión” |
| Reproducir manual ▶ | ✅ |
| **Auto-play durante el rezo** | ❌ `pickRecordingForSlot` existe pero no está cableado |
| Grabar en Rosario virtual | ❌ |
| Sync grabaciones | ❌ IndexedDB local |

---

## Firebase — qué pegar cuando despiertes

1. Crear `.env.local` desde `.env.example`.
2. Firebase Console → Project settings → Web app → copiar config.
3. Firestore rules sugeridas (borrador):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{syncId}/meta/{doc} {
      allow read, write: if true;  // TEMP: abrir; luego auth o validación syncId
    }
  }
}
```

4. Opcional: migrar stats de jsonblob a Firestore en otra sesión.

---

## Archivos nuevos / tocados (referencia rápida)

```
src/utils/artConfigSync.js
src/utils/artConfigPortable.js
src/hooks/useArtConfigCloudSync.js
src/config/firebase.js
src/services/firebaseArtConfig.js
src/data/viaCrucisData.js
src/components/common/StationsDevotionThumb.jsx
.env.example
```

---

## Próximos pasos sugeridos (prioridad)

1. Pegar Firebase config + probar sync art entre móvil y `:3000`.
2. Textos completos Vía Crucis/Lucis + 14 imágenes cada una.
3. Cablear `pickRecordingForSlot` al avance del Libro/Rosario.
4. Menú “Más devociones” si siguen creciendo los vitrales.
5. Commit cuando quieras — no se hizo push.

---

## Cómo probar mañana (5 min)

1. `npm start` en `:3000` — badge `v0.3.44`.
2. Libro → vitral ✝ → Vía Crucis → navegar 15 pasos.
3. Ajustes → Estudio de imágenes → renombrar una imagen.
4. Sync → crear/usar sync ID → en otro navegador importar ID → ver si el nombre viaja.
5. Exportar JSON en móvil → Importar en dev.

Buen descanso.
