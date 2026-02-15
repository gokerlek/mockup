import { useDesignStore } from '@/stores/useDesignStore'
import {
  IconSettings,
  IconPalette,
  IconTypography,
  IconTransform,
  Icon3dRotate,
  IconShadow,
  IconFlipVertical,
  IconPhoto,
} from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PropertiesPanel() {
  const elements = useDesignStore.useElements()
  const selectedIds = useDesignStore.useSelectedIds()
  const updateElement = useDesignStore.useUpdateElement()

  const selectedElements = elements.filter((e) => selectedIds.includes(e.id))
  const el = selectedElements.length === 1 ? selectedElements[0] : null

  return (
    <div
      className="w-[280px] bg-card border-l border-border flex flex-col"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* ─── Header ─── */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <IconSettings size={16} className="text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Properties
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {!el ? (
            selectedElements.length > 1 ? (
              <div className="flex items-center justify-center h-32 text-xs text-muted-foreground/40">
                {selectedElements.length} elements selected
              </div>
            ) : (
              <CanvasProperties />
            )
          ) : (
            <Tabs defaultValue="design">
              <TabsList className="w-full">
                <TabsTrigger value="design" className="flex-1">
                  <IconPalette size={14} />
                  Design
                </TabsTrigger>
                {el.type === 'text' && (
                  <TabsTrigger value="text" className="flex-1">
                    <IconTypography size={14} />
                    Text
                  </TabsTrigger>
                )}
              </TabsList>

              {/* ─── Design Tab ─── */}
              <TabsContent value="design">
                <div className="space-y-4 mt-2">
                  {/* ── Transform ── */}
                  <PropertySection
                    title="Transform"
                    icon={<IconTransform size={14} />}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <NumberField
                        label="X"
                        value={el.x}
                        onChange={(v) => updateElement(el.id, { x: v })}
                      />
                      <NumberField
                        label="Y"
                        value={el.y}
                        onChange={(v) => updateElement(el.id, { y: v })}
                      />
                      <NumberField
                        label="W"
                        value={el.width}
                        onChange={(v) => updateElement(el.id, { width: v })}
                      />
                      <NumberField
                        label="H"
                        value={el.height}
                        onChange={(v) => updateElement(el.id, { height: v })}
                      />
                    </div>
                  </PropertySection>

                  <Separator />

                  {/* ── Rotation ── */}
                  <PropertySection
                    title="Rotation"
                    icon={<Icon3dRotate size={14} />}
                  >
                    <div className="space-y-3">
                      {/* Rotate X */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Rotate X
                          </Label>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {Math.round(el.rotateX * (180 / Math.PI))}°
                          </span>
                        </div>
                        <Slider
                          value={[Math.round(el.rotateX * (180 / Math.PI))]}
                          onValueChange={(v) => {
                            const val = Array.isArray(v) ? v[0] : v
                            updateElement(el.id, {
                              rotateX: val * (Math.PI / 180),
                            })
                          }}
                          min={-90}
                          max={90}
                          step={1}
                        />
                      </div>

                      {/* Rotate Y */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Rotate Y
                          </Label>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {Math.round(el.rotateY * (180 / Math.PI))}°
                          </span>
                        </div>
                        <Slider
                          value={[Math.round(el.rotateY * (180 / Math.PI))]}
                          onValueChange={(v) => {
                            const val = Array.isArray(v) ? v[0] : v
                            updateElement(el.id, {
                              rotateY: val * (Math.PI / 180),
                            })
                          }}
                          min={-90}
                          max={90}
                          step={1}
                        />
                      </div>

                      {/* Rotate Z */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Rotate Z
                          </Label>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {Math.round(el.rotateZ * (180 / Math.PI))}°
                          </span>
                        </div>
                        <Slider
                          value={[Math.round(el.rotateZ * (180 / Math.PI))]}
                          onValueChange={(v) => {
                            const val = Array.isArray(v) ? v[0] : v
                            updateElement(el.id, {
                              rotateZ: val * (Math.PI / 180),
                            })
                          }}
                          min={-90}
                          max={90}
                          step={1}
                        />
                      </div>

                      {/* Perspective */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Perspective
                          </Label>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {(el.perspective ?? 0) === 0
                              ? 'Off'
                              : `${el.perspective}px`}
                          </span>
                        </div>
                        <Slider
                          value={[el.perspective ?? 0]}
                          onValueChange={(v) => {
                            const val = Array.isArray(v) ? v[0] : v
                            updateElement(el.id, { perspective: val })
                          }}
                          min={0}
                          max={5000}
                          step={50}
                        />
                      </div>
                    </div>
                  </PropertySection>

                  <Separator />

                  {/* ── Fill & Stroke ── */}
                  <PropertySection
                    title="Fill & Stroke"
                    icon={<IconPalette size={14} />}
                  >
                    <div className="space-y-3">
                      <ColorPicker
                        label="Fill"
                        value={el.fill}
                        onChange={(v) => updateElement(el.id, { fill: v })}
                      />
                      <ColorPicker
                        label="Stroke"
                        value={el.stroke}
                        onChange={(v) => updateElement(el.id, { stroke: v })}
                      />
                      <NumberField
                        label="Stroke W"
                        value={el.strokeWidth}
                        onChange={(v) =>
                          updateElement(el.id, { strokeWidth: v })
                        }
                        min={0}
                        step={1}
                      />
                    </div>
                  </PropertySection>

                  <Separator />

                  {/* ── Opacity ── */}
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Opacity
                    </Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[Math.round(el.opacity * 100)]}
                        onValueChange={(v) => {
                          const val = Array.isArray(v) ? v[0] : v
                          updateElement(el.id, { opacity: val / 100 })
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                        {Math.round(el.opacity * 100)}%
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* ── Border Radius ── */}
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Border Radius
                    </Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[el.borderRadius]}
                        onValueChange={(v) => {
                          const val = Array.isArray(v) ? v[0] : v
                          updateElement(el.id, { borderRadius: val })
                        }}
                        min={0}
                        max={200}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                        {el.borderRadius}
                      </span>
                    </div>
                  </div>

                  {/* ── Image-specific ── */}
                  {el.type === 'image' && (
                    <>
                      <Separator />
                      <PropertySection
                        title="Image"
                        icon={<IconPhoto size={14} />}
                      >
                        <div className="space-y-3">
                          {/* Upload / Change */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*'
                              input.onchange = () => {
                                const file = input.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  updateElement(el.id, {
                                    src: reader.result as string,
                                  })
                                }
                                reader.readAsDataURL(file)
                              }
                              input.click()
                            }}
                          >
                            {el.src ? 'Change Image' : 'Upload Image'}
                          </Button>

                          {/* Fit Mode */}
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Fit Mode
                            </Label>
                            <Select
                              value={el.imageFit || 'cover'}
                              onValueChange={(v) => {
                                if (v)
                                  updateElement(el.id, {
                                    imageFit: v as 'cover' | 'contain' | 'fill',
                                  })
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cover">Cover</SelectItem>
                                <SelectItem value="contain">Contain</SelectItem>
                                <SelectItem value="fill">Fill</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PropertySection>
                    </>
                  )}

                  <Separator />

                  {/* ── Shadow ── */}
                  <PropertySection
                    title="Shadow"
                    icon={<IconShadow size={14} />}
                  >
                    <div className="space-y-3">
                      {/* Enable toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={el.shadowEnabled}
                          onChange={(e) =>
                            updateElement(el.id, {
                              shadowEnabled: e.target.checked,
                            })
                          }
                          className="rounded border-border"
                        />
                        <span className="text-xs text-muted-foreground">
                          Enable shadow
                        </span>
                      </label>

                      {el.shadowEnabled && (
                        <>
                          <ColorPicker
                            label="Shadow Color"
                            value={el.shadowColor}
                            onChange={(v) =>
                              updateElement(el.id, { shadowColor: v })
                            }
                          />
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Blur
                            </Label>
                            <div className="flex items-center gap-3">
                              <Slider
                                value={[el.shadowBlur]}
                                onValueChange={(v) => {
                                  const val = Array.isArray(v) ? v[0] : v
                                  updateElement(el.id, { shadowBlur: val })
                                }}
                                min={0}
                                max={100}
                                step={1}
                                className="flex-1"
                              />
                              <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                                {el.shadowBlur}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <NumberField
                              label="Offset X"
                              value={el.shadowOffsetX}
                              onChange={(v) =>
                                updateElement(el.id, { shadowOffsetX: v })
                              }
                              step={1}
                            />
                            <NumberField
                              label="Offset Y"
                              value={el.shadowOffsetY}
                              onChange={(v) =>
                                updateElement(el.id, { shadowOffsetY: v })
                              }
                              step={1}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </PropertySection>

                  <Separator />

                  {/* ── Reflection ── */}
                  <PropertySection
                    title="Reflection"
                    icon={<IconFlipVertical size={14} />}
                  >
                    <div className="space-y-3">
                      {/* Enable toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={el.reflectionEnabled}
                          onChange={(e) =>
                            updateElement(el.id, {
                              reflectionEnabled: e.target.checked,
                            })
                          }
                          className="rounded border-border"
                        />
                        <span className="text-xs text-muted-foreground">
                          Enable reflection
                        </span>
                      </label>

                      {el.reflectionEnabled && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Opacity
                            </Label>
                            <div className="flex items-center gap-3">
                              <Slider
                                value={[Math.round(el.reflectionOpacity * 100)]}
                                onValueChange={(v) => {
                                  const val = Array.isArray(v) ? v[0] : v
                                  updateElement(el.id, {
                                    reflectionOpacity: val / 100,
                                  })
                                }}
                                min={0}
                                max={100}
                                step={1}
                                className="flex-1"
                              />
                              <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                                {Math.round(el.reflectionOpacity * 100)}%
                              </span>
                            </div>
                          </div>
                          <NumberField
                            label="Distance"
                            value={el.reflectionDistance}
                            onChange={(v) =>
                              updateElement(el.id, { reflectionDistance: v })
                            }
                            min={0}
                            step={1}
                          />
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Height %
                            </Label>
                            <div className="flex items-center gap-3">
                              <Slider
                                value={[el.reflectionHeight]}
                                onValueChange={(v) => {
                                  const val = Array.isArray(v) ? v[0] : v
                                  updateElement(el.id, {
                                    reflectionHeight: val,
                                  })
                                }}
                                min={5}
                                max={100}
                                step={1}
                                className="flex-1"
                              />
                              <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                                {el.reflectionHeight}%
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </PropertySection>
                </div>
              </TabsContent>

              {/* ─── Text Tab ─── */}
              {el.type === 'text' && (
                <TabsContent value="text">
                  <div className="space-y-4 mt-2">
                    {/* ── Font Family ── */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Font Family
                      </Label>
                      <Select
                        value={el.fontFamily}
                        onValueChange={(v) => {
                          if (v) updateElement(el.id, { fontFamily: v })
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'Inter',
                            'Arial',
                            'Georgia',
                            'Courier New',
                            'Verdana',
                            'Helvetica',
                            'Times New Roman',
                          ].map((f) => (
                            <SelectItem key={f} value={f}>
                              <span style={{ fontFamily: f }}>{f}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ── Size & Weight ── */}
                    <div className="grid grid-cols-2 gap-2">
                      <NumberField
                        label="Size"
                        value={el.fontSize}
                        onChange={(v) => updateElement(el.id, { fontSize: v })}
                        min={1}
                        step={1}
                      />
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Weight
                        </Label>
                        <Select
                          value={String(el.fontWeight)}
                          onValueChange={(v) => {
                            if (v)
                              updateElement(el.id, { fontWeight: Number(v) })
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { v: '100', l: 'Thin' },
                              { v: '200', l: 'Extra Light' },
                              { v: '300', l: 'Light' },
                              { v: '400', l: 'Regular' },
                              { v: '500', l: 'Medium' },
                              { v: '600', l: 'Semi Bold' },
                              { v: '700', l: 'Bold' },
                              { v: '800', l: 'Extra Bold' },
                              { v: '900', l: 'Black' },
                            ].map((w) => (
                              <SelectItem key={w.v} value={w.v}>
                                {w.l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* ── Text Color ── */}
                    <ColorPicker
                      label="Text Color"
                      value={el.color}
                      onChange={(v) => updateElement(el.id, { color: v })}
                    />

                    <Separator />

                    {/* ── Line Height ── */}
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Line Height
                      </Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[el.lineHeight * 100]}
                          onValueChange={(v) => {
                            const val = Array.isArray(v) ? v[0] : v
                            updateElement(el.id, { lineHeight: val / 100 })
                          }}
                          min={50}
                          max={500}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                          {el.lineHeight.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* ── Letter Spacing ── */}
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Letter Spacing
                      </Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[el.letterSpacing]}
                          onValueChange={(v) => {
                            const val = Array.isArray(v) ? v[0] : v
                            updateElement(el.id, { letterSpacing: val })
                          }}
                          min={-5}
                          max={20}
                          step={0.5}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                          {el.letterSpacing}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* ── Text Align ── */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Alignment
                      </Label>
                      <div className="flex gap-1">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <Button
                            key={align}
                            variant={
                              el.textAlign === align ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() =>
                              updateElement(el.id, { textAlign: align })
                            }
                            className="flex-1 capitalize"
                          >
                            {align}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function CanvasProperties() {
  const frameBackground = useDesignStore.useFrameBackground()
  const setFrameBackground = useDesignStore.useSetFrameBackground()
  const canvasBackground = useDesignStore.useCanvasBackground()
  const setCanvasBackground = useDesignStore.useSetCanvasBackground()
  const gridEnabled = useDesignStore.useGridEnabled()
  const toggleGrid = useDesignStore.useToggleGrid()
  const gridSize = useDesignStore.useGridSize()
  const setGridSize = useDesignStore.useSetGridSize()
  const snapEnabled = useDesignStore.useSnapEnabled()
  const toggleSnap = useDesignStore.useToggleSnap()

  return (
    <div className="space-y-4">
      <PropertySection title="Frame Background" icon={<IconPhoto size={14} />}>
        <Tabs
          value={frameBackground.type}
          onValueChange={(v) => setFrameBackground({ type: v as any })}
        >
          <TabsList className="w-full">
            <TabsTrigger value="solid" className="flex-1">
              Solid
            </TabsTrigger>
            <TabsTrigger value="gradient" className="flex-1">
              Gradient
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1">
              Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solid" className="mt-2">
            <ColorPicker
              label="Color"
              value={frameBackground.color || '#ffffff'}
              onChange={(c) => setFrameBackground({ color: c })}
            />
          </TabsContent>

          <TabsContent value="gradient" className="mt-2 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Type
              </Label>
              <Select
                value={frameBackground.gradientType || 'linear'}
                onValueChange={(v) =>
                  setFrameBackground({ gradientType: v as any })
                }
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                  <SelectItem value="conic">Conic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(frameBackground.gradientType === 'linear' ||
              !frameBackground.gradientType) && (
              <NumberField
                label="Angle"
                value={frameBackground.gradientAngle || 180}
                onChange={(v) => setFrameBackground({ gradientAngle: v })}
                max={360}
                step={15}
              />
            )}

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Colors
              </Label>
              {(frameBackground.gradientColors || ['#000', '#fff']).map(
                (c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <ColorPicker
                        label=""
                        value={c}
                        onChange={(v) => {
                          const next = [
                            ...(frameBackground.gradientColors || [
                              '#000',
                              '#fff',
                            ]),
                          ]
                          next[i] = v
                          setFrameBackground({ gradientColors: next })
                        }}
                      />
                    </div>
                    {(frameBackground.gradientColors || []).length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          const next = [
                            ...(frameBackground.gradientColors || []),
                          ]
                          next.splice(i, 1)
                          setFrameBackground({ gradientColors: next })
                        }}
                      >
                        <span className="text-xs">x</span>
                      </Button>
                    )}
                  </div>
                ),
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-7"
                onClick={() =>
                  setFrameBackground({
                    gradientColors: [
                      ...(frameBackground.gradientColors || ['#000', '#fff']),
                      '#888888',
                    ],
                  })
                }
              >
                Add Color
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-2 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = () => {
                  const file = input.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    setFrameBackground({
                      type: 'image',
                      src: reader.result as string,
                    })
                  }
                  reader.readAsDataURL(file)
                }
                input.click()
              }}
            >
              {frameBackground.src ? 'Change Image' : 'Upload Image'}
            </Button>
            {frameBackground.src && (
              <img
                src={frameBackground.src}
                className="mt-2 rounded border border-border w-full h-32 object-cover"
              />
            )}
          </TabsContent>
        </Tabs>
      </PropertySection>

      <Separator />

      <PropertySection title="Workspace" icon={<IconPalette size={14} />}>
        <ColorPicker
          label="Background"
          value={canvasBackground}
          onChange={setCanvasBackground}
        />
      </PropertySection>

      <Separator />

      <PropertySection title="Grid & Snap" icon={<IconSettings size={14} />}>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={gridEnabled}
              onChange={toggleGrid}
              className="rounded border-border"
            />
            <span className="text-xs text-muted-foreground">Show Grid</span>
          </label>

          {gridEnabled && (
            <NumberField
              label="Grid Size"
              value={gridSize}
              onChange={setGridSize}
              min={5}
              step={5}
            />
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={snapEnabled}
              onChange={toggleSnap}
              className="rounded border-border"
            />
            <span className="text-xs text-muted-foreground">Snap to Grid</span>
          </label>
        </div>
      </PropertySection>
    </div>
  )
}

// ─── Number Field ────────────────────────────────────────────

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="h-7 text-xs tabular-nums"
      />
    </div>
  )
}

// ─── Color Picker ────────────────────────────────────────────

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            />
          }
        >
          <div
            className="w-4 h-4 rounded border border-border"
            style={{
              backgroundColor: value === 'transparent' ? '#ffffff' : value,
            }}
          />
          <span className="text-xs font-mono">{value}</span>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" side="left">
          <div className="space-y-3">
            {/* Native color picker */}
            <input
              type="color"
              value={value === 'transparent' ? '#000000' : value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-32 rounded-md border border-border cursor-pointer bg-transparent"
            />

            {/* Hex input */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground w-10 shrink-0">
                Hex
              </Label>
              <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-7 text-xs font-mono"
              />
            </div>

            {/* Quick colors */}
            <div className="flex flex-wrap gap-1.5">
              {[
                '#000000',
                '#ffffff',
                '#ef4444',
                '#f97316',
                '#eab308',
                '#22c55e',
                '#3b82f6',
                '#8b5cf6',
                '#ec4899',
                'transparent',
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => onChange(c)}
                  className={`w-6 h-6 rounded border border-border cursor-pointer transition-transform hover:scale-110 ${
                    value === c ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  style={{
                    backgroundColor: c === 'transparent' ? '#ffffff' : c,
                    backgroundImage:
                      c === 'transparent'
                        ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                        : undefined,
                    backgroundSize: c === 'transparent' ? '8px 8px' : undefined,
                    backgroundPosition:
                      c === 'transparent'
                        ? '0 0, 0 4px, 4px -4px, -4px 0'
                        : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ─── Property Section ────────────────────────────────────────

function PropertySection({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {title}
        </Label>
      </div>
      {children}
    </div>
  )
}
