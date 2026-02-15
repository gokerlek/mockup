# Broşür Tasarım Uygulaması — Mimari Doküman

> **Versiyon:** 1.0 | **Tarih:** 2026-02-12  
> **Stack:** React 19 · TanStack Start · Zustand (immer + auto-selectors) · React Three Fiber + drei · dnd-kit · Tailwind CSS v4

---

## 1. Genel Bakış

Canvas-based bir tasarım editörü. Figma benzeri deneyim sunar.

### Render Mimarisi (Dual-Layer)

Uygulama **iki katmanlı** bir render mimarisine sahiptir:

| Katman | Teknoloji | Sorumluluk |
|--------|-----------|------------|
| **3D Canvas Katmanı** | `@react-three/fiber` | Sahne, kamera, ışık, 3D obje dönüşümleri, perspective |
| **HTML/UI Katmanı** | `@react-three/drei` → `<Html />` | Metin, görseller ve UI elementlerini 3D uzayda HTML olarak render eder. Fontlar bozulmaz, standart input/div kullanılabilir |

### Ana Modüller

| # | Modül | Sorumluluk |
|---|-------|-----------|
| 1 | Canvas Engine (R3F) | 3D sahne, kamera kontrolleri, perspective, grid/snap |
| 2 | Layers Panel | Katman listesi, z-index, drag-reorder, visibility/lock |
| 3 | Selection Engine | Tek/çoklu seçim, bounding box, resize/rotate handles |
| 4 | Rich Text Editor | Inline editing, tipografi kontrolleri |
| 5 | Toolbar | Araç seçimi, hizalama, 3D transform kontrolleri |
| 6 | Properties Panel | Seçili objenin detaylı ayarları (sağ panel) |
| 7 | Frame Manager | Frame boyutu seçimi (A4, A5, Instagram vb.) |
| 8 | Export Engine | PNG/PDF dışa aktarma |
| 9 | Persistence | Auto-save / localStorage |

---

## 2. Sayfa Düzeni

```
┌──────────────────────────────────────────────────────┐
│                      TOOLBAR (top)                   │
├───────────┬──────────────────────────┬────────────────┤
│ LAYERS    │   R3F <Canvas>           │  PROPERTIES    │
│ PANEL     │   ├─ <OrthographicCamera>│  PANEL         │
│ (240px)   │   ├─ <FrameMesh>         │  (280px)       │
│           │   │  ├─ <Html> elements  │                │
│ - Layer 1 │   │  │  (text, images)   │  Position x,y  │
│ - Layer 2 │   │  └─ <GridHelper>     │  Size w,h      │
│ - Layer 3 │   ├─ <BoundingBoxGroup>  │  Rotation xyz  │
│  (drag)   │   └─ <SelectionMarquee>  │  Opacity       │
└───────────┴──────────────────────────┴────────────────┘
```

---

## 3. Dizin Yapısı

```
src/
├── routes/
│   ├── __root.tsx
│   ├── index.tsx                    # Frame seçim / dashboard
│   └── editor.tsx                   # Ana editör sayfası
│
├── stores/
│   ├── useDesignStore.ts            # Ana store (layers, selection, frame)
│   └── useToolStore.ts              # Aktif araç, toolbar state
│
├── components/
│   ├── editor/
│   │   ├── EditorLayout.tsx         # 3-panel layout shell
│   │   ├── Toolbar.tsx              # Üst toolbar
│   │   └── StatusBar.tsx            # Alt durum çubuğu
│   │
│   ├── canvas/
│   │   ├── DesignCanvas.tsx         # R3F <Canvas> wrapper + kamera
│   │   ├── FrameMesh.tsx            # 3D artboard plane (mesh)
│   │   ├── CanvasElement.tsx        # <Html> wrapper — element renderer
│   │   ├── BoundingBox.tsx          # Seçim kutusu + resize/rotate handles
│   │   ├── SelectionMarquee.tsx     # Çoklu seçim sürükleme alanı
│   │   ├── GridHelper.tsx           # R3F grid helper
│   │   └── SnapGuides.tsx           # Smart snap çizgileri
│   │
│   ├── layers/
│   │   ├── LayersPanel.tsx          # Panel container
│   │   ├── LayerItem.tsx            # Tek katman satırı
│   │   └── LayerDndContext.tsx      # dnd-kit context wrapper
│   │
│   ├── properties/
│   │   ├── PropertiesPanel.tsx      # Panel container
│   │   ├── TransformSection.tsx     # x, y, w, h, rotation
│   │   ├── AppearanceSection.tsx    # fill, stroke, opacity
│   │   └── TypographySection.tsx    # font, size, weight, lineH
│   │
│   ├── text/
│   │   ├── InlineTextEditor.tsx     # Çift-tık ile inline editing
│   │   └── FontPicker.tsx           # Google Fonts seçici
│   │
│   ├── toolbar/
│   │   ├── ToolSelector.tsx         # Araç seçim butonları
│   │   ├── AlignmentTools.tsx       # Hizalama butonları
│   │   ├── DistributeTools.tsx      # Dağıtım butonları
│   │   └── TransformControls.tsx    # 3D rotation sliders
│   │
│   ├── frame/
│   │   ├── FrameSelector.tsx        # Boyut seçici modal
│   │   └── framePresets.ts          # A4, A5, vb. preset'ler
│   │
│   ├── export/
│   │   ├── ExportDialog.tsx         # Export modal
│   │   └── exportUtils.ts           # html2canvas + jspdf logic
│   │
│   └── ui/                          # shadcn/ui (mevcut)
│
├── hooks/
│   ├── useCanvasPanZoom.ts          # Pan & zoom logic
│   ├── useMultiSelect.ts            # Shift+click & marquee
│   ├── useSnapEngine.ts             # Grid snapping logic
│   ├── useAutoSave.ts               # localStorage persistence
│   ├── useKeyboardShortcuts.ts      # Hotkeys
│   └── useElementResize.ts          # Resize handle logic
│
├── types/
│   ├── design.ts                    # DesignElement, Layer, Frame
│   ├── tools.ts                     # Tool enums
│   └── transform.ts                 # Transform, BoundingBox types
│
├── utils/
│   ├── geometry.ts                  # Nokta, rect hesaplamaları
│   ├── alignment.ts                 # Hizalama algoritmaları
│   └── idGenerator.ts               # nanoid wrapper
│
└── lib/
    └── utils.ts                     # Mevcut (cn helper)
```

---

## 4. State Mimarisi (Zustand + Immer + Auto-Selectors)

### 4.0 Store Kuralları

1. **Immer Middleware**: Tüm store'lar `immer` middleware kullanır. State mutasyonları doğrudan, tip-güvenli şekilde yapılır (`state.x = value`).
2. **Auto-Selectors**: `auto-zustand-selectors-hook` ile her state property ve action için optimize edilmiş selector hook'lar otomatik oluşturulur.
3. **Naming Convention**: Base store `useDesignStoreBase`, auto-selector wrapper `useDesignStore` olarak export edilir.

### 4.1 Store Oluşturma Şablonu

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createSelectorHooks } from 'auto-zustand-selectors-hook'

// 1) Base store: immer middleware ile
const useDesignStoreBase = create<DesignState & DesignActions>()(
  immer((set, get) => ({
    // --- State ---
    elements: [],
    selectedIds: [],
    frame: FRAME_PRESETS[0],
    gridEnabled: true,
    gridSize: 20,
    snapEnabled: true,

    // --- Actions (immer ile doğrudan mutasyon) ---
    addElement: (el) =>
      set((state) => {
        state.elements.push({
          ...el,
          id: nanoid(),
          zIndex: state.elements.length,
        })
      }),

    updateElement: (id, patch) =>
      set((state) => {
        const el = state.elements.find((e) => e.id === id)
        if (el) Object.assign(el, patch)
      }),

    reorderElement: (fromIndex, toIndex) =>
      set((state) => {
        const [moved] = state.elements.splice(fromIndex, 1)
        state.elements.splice(toIndex, 0, moved)
      }),

    toggleVisibility: (id) =>
      set((state) => {
        const el = state.elements.find((e) => e.id === id)
        if (el) el.visible = !el.visible
      }),

    toggleLock: (id) =>
      set((state) => {
        const el = state.elements.find((e) => e.id === id)
        if (el) el.locked = !el.locked
      }),
    // ... diğer action'lar
  }))
)

// 2) Auto-selectors ile sarma
export const useDesignStore = createSelectorHooks(useDesignStoreBase)
```

### 4.2 Kullanım (Auto-Selectors)

```typescript
// ❌ ESKİ: Manuel selector
const elements = useDesignStore((s) => s.elements)

// ✅ YENİ: Auto-generated selector hook
const elements = useDesignStore.useElements()
const addElement = useDesignStore.useAddElement()
const selectedIds = useDesignStore.useSelectedIds()

// Her property/action için otomatik hook → granüler re-render
```

### 4.3 DesignElement Tipi

```typescript
interface DesignElement {
  id: string
  type: 'text' | 'shape' | 'image'
  // Position & Size
  x: number; y: number; width: number; height: number
  // 3D Rotation
  rotateX: number; rotateY: number; rotateZ: number
  // Appearance
  opacity: number
  fill: string
  stroke: string; strokeWidth: number
  // Text-specific
  content?: string
  fontFamily?: string; fontSize?: number; fontWeight?: number
  lineHeight?: number; letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right'
  // Layer
  zIndex: number
  visible: boolean
  locked: boolean
  name: string
}
```

### 4.4 Design Store Interface

```typescript
interface DesignState {
  frame: FramePreset
  elements: DesignElement[]        // sıralı (index = z-order)
  selectedIds: string[]
  gridEnabled: boolean
  gridSize: number
  snapEnabled: boolean
}

interface DesignActions {
  // CRUD
  addElement: (el: Omit<DesignElement, 'id' | 'zIndex'>) => void
  updateElement: (id: string, patch: Partial<DesignElement>) => void
  deleteElements: (ids: string[]) => void
  duplicateElements: (ids: string[]) => void
  // Layer Ordering
  reorderElement: (fromIndex: number, toIndex: number) => void
  toggleVisibility: (id: string) => void
  toggleLock: (id: string) => void
  // Selection
  selectElement: (id: string, additive?: boolean) => void
  selectAll: () => void
  deselectAll: () => void
  setSelectedIds: (ids: string[]) => void
  // Alignment
  alignElements: (dir: 'left'|'right'|'top'|'bottom'|'centerH'|'centerV') => void
  distributeElements: (axis: 'horizontal' | 'vertical') => void
  // Frame & Grid
  setFrame: (preset: FramePreset) => void
  toggleGrid: () => void
  // Persistence
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => boolean
}
```

### 4.5 Tool Store (Immer + Auto-Selectors)

```typescript
type ToolType = 'select' | 'text' | 'rectangle' | 'ellipse' | 'image' | 'hand'

const useToolStoreBase = create<ToolState>()(immer((set) => ({
  activeTool: 'select',
  isEditing: false,
  setTool: (tool) => set((s) => { s.activeTool = tool }),
  setEditing: (v) => set((s) => { s.isEditing = v }),
})))

export const useToolStore = createSelectorHooks(useToolStoreBase)

// Kullanım:
const activeTool = useToolStore.useActiveTool()
const setTool = useToolStore.useSetTool()
```

### 4.6 Z-Index Stratejisi

```
elements[] dizisi = sıralı katman listesi
  → index 0  = en alttaki katman (renderOrder: 1)
  → index N  = en üstteki katman (renderOrder: N+1)

Layers Panel → elements[] ters sırada gösterilir (üst = en yüksek z)
Drag-reorder → dnd-kit onDragEnd → reorderElement(oldIndex, newIndex)
R3F render  → elements.map((el, i) => <group position-z={i * 0.01} />)
             veya <Html zIndexRange={[N-i, N-i]}>
```

---

## 5. Bileşen Detayları

### 5.1 Canvas Engine (React Three Fiber)

```tsx
// DesignCanvas.tsx — Ana R3F wrapper
<Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
  <ambientLight intensity={0.8} />
  <FrameMesh width={frame.width} height={frame.height}>
    {elements.map((el, i) => (
      <CanvasElement key={el.id} element={el} order={i}>
        {/* <Html> ile text/image render */}
      </CanvasElement>
    ))}
  </FrameMesh>
  <GridHelper visible={gridEnabled} />
  <OrbitControls enableRotate={false} /> {/* sadece pan/zoom */}
</Canvas>
```

| Özellik | Uygulama |
|---------|----------|
| Kamera | `OrthographicCamera` — 2D tasarım için ideal, zoom kolay |
| Perspective (3D) | Element'e `rotation={[rotX, rotY, rotZ]}` → gerçek 3D dönüşüm |
| Pan & Zoom | `OrbitControls` (enableRotate=false) veya custom `useCanvasPanZoom` |
| Grid | drei `<Grid />` veya custom `<GridHelper />` mesh |
| Snap | `useSnapEngine`: edge'leri grid + diğer elementlere snap |
| HTML Elements | `<Html>` bileşeni ile text/image → font bozulması yok |

### 5.2 Bounding Box & Handles

- **8 resize handle** (4 köşe + 4 kenar ortası)
- **1 rotate handle** (üstte, 20px offset)
- Çoklu seçimde: tüm seçilileri kapsayan birleşik bbox
- `useElementResize` hook: pointer events ile boyut/konum günceller

### 5.3 Multi-Selection

| Yöntem | Uygulama |
|--------|----------|
| Shift+Click | `selectElement(id, true)` → additive selection |
| Marquee | `SelectionMarquee` → boş alana mousedown → rect çiz → rect-intersect |

### 5.4 Inline Text Editing

```
1. Text element'e çift tık (R3F pointer event)
2. CanvasElement içindeki <Html> → InlineTextEditor'a dönüşür
3. contentEditable div aktif (aynı boyut/konum/font)
4. Blur veya Escape → text güncellenir, editing kapanır
Not: <Html> bileşeni sayesinde standart DOM input/contentEditable kullanılır,
     fontlar asla bozulmaz ve tüm CSS typography özellikleri çalışır.
```

### 5.5 Alignment

```
Tek seçili → frame'e göre hizala
Çoklu seçili → birbirine göre hizala (bbox referans)
```

---

## 6. Kütüphaneler

| İhtiyaç | Kütüphane | Neden |
|---------|-----------|-------|
| **3D Canvas** | `@react-three/fiber` | React ile Three.js entegrasyonu, sahne/kamera/ışık |
| **3D Yardımcılar** | `@react-three/drei` | `<Html>`, `<OrbitControls>`, `<Grid>` vb. hazır bileşenler |
| **State** | `zustand` + `immer` | Performanslı state, doğrudan mutasyon desteği |
| **Auto-Selectors** | `auto-zustand-selectors-hook` | Her property için otomatik optimize selector hook |
| **Drag (layers)** | `@dnd-kit/core` + `@dnd-kit/sortable` | Erişilebilir, performanslı sıralama |
| **Export PNG** | `html2canvas` | DOM → Canvas |
| **Export PDF** | `jspdf` | Client-side PDF |
| **Icons** | `@tabler/icons-react` | Projede mevcut |
| **ID** | `nanoid` | Kısa unique ID |
| **Fonts** | Google Fonts API | Runtime font yükleme |
| **3D Engine** | `three` | R3F peer dependency |

---

## 7. Frame Presets

```typescript
const FRAME_PRESETS = [
  { id: 'a4-p',  name: 'A4 Portrait',       width: 794,  height: 1123 },
  { id: 'a4-l',  name: 'A4 Landscape',      width: 1123, height: 794  },
  { id: 'a5-p',  name: 'A5 Portrait',       width: 559,  height: 794  },
  { id: 'a5-l',  name: 'A5 Landscape',      width: 794,  height: 559  },
  { id: 'ig-p',  name: 'Instagram Post',    width: 1080, height: 1080 },
  { id: 'ig-s',  name: 'Instagram Story',   width: 1080, height: 1920 },
  { id: 'fb-c',  name: 'Facebook Cover',    width: 820,  height: 312  },
  { id: 'tw-p',  name: 'Twitter Post',      width: 1200, height: 675  },
  { id: 'yt-t',  name: 'YouTube Thumbnail', width: 1280, height: 720  },
  { id: 'pres',  name: 'Presentation 16:9', width: 1920, height: 1080 },
  { id: 'custom',name: 'Custom',            width: 800,  height: 600  },
]
```

---

## 8. Auto-Save

```
Tetikleyiciler:
  - Element değişikliği → 2sn debounce ile kaydet
  - Layer reorder / Frame değişikliği → anlık kaydet
  - beforeunload → son state kaydet

Key: "mockup_design_{frameId}"
Format: JSON { frame, elements, gridEnabled, gridSize }
Yükleme: Sayfa açılışında loadFromLocalStorage()
```

---

## 9. Uygulama Fazları

### Faz 1 — Temel Altyapı
- [ ] Bağımlılık kurulumu:
  - `zustand`, `immer`, `auto-zustand-selectors-hook`
  - `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`
  - `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - `nanoid`, `html2canvas`, `jspdf`
- [ ] Type tanımlamaları (types/)
- [ ] Zustand store'ları (immer + auto-selectors ile)
- [ ] Frame presets
- [ ] Editor route + EditorLayout (3-panel)

### Faz 2 — R3F Canvas & Element Rendering
- [ ] DesignCanvas (R3F `<Canvas>` + OrthographicCamera)
- [ ] FrameMesh (artboard plane)
- [ ] CanvasElement (`<Html>` ile text, shape render)
- [ ] Toolbar'dan element ekleme
- [ ] Tek tıklama ile seçim (R3F pointer events)
- [ ] Canvas üzerinde drag ile taşıma

### Faz 3 — Bounding Box & Transform
- [ ] BoundingBox (8 resize handle + rotate handle)
- [ ] useElementResize hook
- [ ] Properties panel (position, size, rotation inputs)
- [ ] 3D rotation (rotateX, rotateY, rotateZ)

### Faz 4 — Layers Panel
- [ ] LayersPanel + LayerItem
- [ ] dnd-kit sortable ile drag-reorder
- [ ] Reorder → z-index sync
- [ ] Visibility toggle (eye icon)
- [ ] Lock toggle (lock icon)

### Faz 5 — Rich Text Editor
- [ ] InlineTextEditor (çift-tık)
- [ ] Toolbar tipografi kontrolleri
- [ ] Google Fonts entegrasyonu
- [ ] Font weight, line-height, letter-spacing

### Faz 6 — Multi-Selection & Alignment
- [ ] Shift+click çoklu seçim
- [ ] SelectionMarquee
- [ ] 6 yön alignment
- [ ] Horizontal/vertical distribution

### Faz 7 — Grid & Snap
- [ ] GridOverlay
- [ ] Snap engine (grid + element-to-element)
- [ ] SnapGuides
- [ ] Keyboard shortcuts

### Faz 8 — Export & Persistence
- [ ] ExportDialog
- [ ] PNG export (html2canvas)
- [ ] PDF export (jspdf)
- [ ] Auto-save (localStorage)

---

## 10. Veri Akışı

```
UI Event (click/drag/type)
    │
    ▼
Zustand Store (useDesignStore)
    │
    ├──▶ React Components re-render (Canvas, Layers, Properties)
    │
    └──▶ localStorage (debounced auto-save)
```

---

## 11. Performans

| Alan | Strateji |
|------|----------|
| R3F Canvas | `React.memo` + `useMemo`. `<Html>` sadece değişen elementler için re-render |
| Immer | Structural sharing — sadece mutate edilen state dilimi değişir |
| Auto-Selectors | Her property için granüler subscription → minimal re-render |
| Drag (layers) | dnd-kit DragOverlay (sanal sürükleme) |
| Drag (canvas) | R3F `useFrame` loop içinde pointer tracking |
| Auto-save | 2sn debounce, `JSON.stringify` sadece değişiklikte |
| Font loading | Lazy — sadece seçilen fontlar yüklenir |
| Three.js | `<Html>` `occlude` devre dışı (2D editör, gereksiz hesaplama) |

---

## 12. Keyboard Shortcuts

| Kısayol | Aksiyon |
|---------|---------|
| `Delete` | Seçilileri sil |
| `Ctrl+A` | Tümünü seç |
| `Ctrl+D` | Çoğalt |
| `Ctrl+S` | Kaydet |
| `Ctrl+E` | Export dialog |
| `V` | Select tool |
| `T` | Text tool |
| `R` | Rectangle tool |
| `O` | Ellipse tool |
| `H` | Hand (pan) tool |
| `Ctrl+G` | Grid toggle |
| `Escape` | Seçimi kaldır |
