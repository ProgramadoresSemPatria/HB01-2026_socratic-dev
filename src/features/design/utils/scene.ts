type SceneEl = {
  type?: string
  text?: string
  id?: string
  containerId?: string | null
  x?: number
  y?: number
  width?: number
  height?: number
  points?: number[][]
  isDeleted?: boolean
}

export type ExcalidrawApi = {
  getSceneElements: () => readonly unknown[]
  getAppState: () => Record<string, unknown>
  getFiles: () => Record<string, unknown>
  updateScene: (scene: { elements: readonly unknown[] }) => void
}

type ShapeKind = 'rectangle' | 'ellipse' | 'diamond'
type Spec = {
  shape: ShapeKind
  emoji: string
  bg: string
  w: number
  h: number
}

const SPEC: Record<string, Spec> = {
  client:   { shape: 'ellipse',   emoji: '👤', bg: '#e7f0ff', w: 200, h: 90 },
  gateway:  { shape: 'rectangle', emoji: '🚪', bg: '#fff1e6', w: 210, h: 90 },
  service:  { shape: 'rectangle', emoji: '⚙️', bg: '#f1f0fb', w: 220, h: 90 },
  external: { shape: 'rectangle', emoji: '☁️', bg: '#eef0f2', w: 200, h: 90 },
  queue:    { shape: 'rectangle', emoji: '📨', bg: '#eafaf5', w: 200, h: 90 },
  cache:    { shape: 'diamond',   emoji: '⚡', bg: '#fff7d6', w: 140, h: 140 },
  database: { shape: 'ellipse',   emoji: '🗄️', bg: '#e8f8ee', w: 180, h: 130 },
  storage:  { shape: 'ellipse',   emoji: '📦', bg: '#f3eefe', w: 180, h: 120 },
}

const TIER: Record<string, number> = {
  client: 0,
  gateway: 1,
  service: 2,
  external: 2,
  queue: 3,
  cache: 3,
  database: 4,
  storage: 4,
}

function specFor(type: string | undefined): Spec {
  return SPEC[type ?? ''] ?? SPEC.service
}

// Deterministic small jitter per node id, so the same diagram always renders
// the same way but doesn't sit on a perfect grid.
function jitter(id: string, range: number): { dx: number; dy: number } {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const a = ((h >>> 0) % 1000) / 1000
  const b = (((h >>> 10) >>> 0) % 1000) / 1000
  return { dx: (a - 0.5) * 2 * range, dy: (b - 0.5) * range }
}

export async function buildSceneElements(
  nodes: { id: string; label: string; type?: string; note?: string }[],
  edges: { from: string; to: string; label?: string }[],
): Promise<readonly unknown[]> {
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw')

  const COL_GAP = 70
  const ROW_GAP = 110
  const JITTER_X = 16
  const JITTER_Y = 6

  // Bucket nodes by tier; each tier becomes a horizontal row.
  const tiers = new Map<number, typeof nodes>()
  for (const n of nodes) {
    const t = TIER[n.type ?? ''] ?? 2
    if (!tiers.has(t)) tiers.set(t, [])
    tiers.get(t)!.push(n)
  }
  const sortedTiers = [...tiers.keys()].sort((a, b) => a - b)

  // First pass: compute each row's geometry (widths + max height).
  const rowGeom = sortedTiers.map((t) => {
    const row = tiers.get(t)!
    let totalW = 0
    let maxH = 0
    for (const n of row) {
      const s = specFor(n.type)
      totalW += s.w
      if (s.h > maxH) maxH = s.h
    }
    totalW += COL_GAP * Math.max(0, row.length - 1)
    return { tier: t, row, totalW, maxH }
  })

  // Use the widest row as the canvas width — others are centered against it.
  const canvasW = Math.max(...rowGeom.map((r) => r.totalW))
  const pos = new Map<
    string,
    { x: number; y: number; cx: number; cy: number; spec: Spec }
  >()

  let cursorY = 0
  for (const { row, totalW, maxH } of rowGeom) {
    const offset = (canvasW - totalW) / 2
    let cursorX = offset
    for (const n of row) {
      const s = specFor(n.type)
      const j = jitter(n.id, 1)
      const x = cursorX + j.dx * JITTER_X
      // Vertically centre each shape on the row baseline so different heights align.
      const y = cursorY + (maxH - s.h) / 2 + j.dy * JITTER_Y
      pos.set(n.id, {
        x,
        y,
        cx: x + s.w / 2,
        cy: y + s.h / 2,
        spec: s,
      })
      cursorX += s.w + COL_GAP
    }
    cursorY += maxH + ROW_GAP
  }

  // Render: each box has the SHORT label inside; the longer note sits BELOW
  // the box as a free-floating text element so it never gets clipped.
  const skeleton: unknown[] = []
  for (const n of nodes) {
    const p = pos.get(n.id)!
    const s = p.spec
    skeleton.push({
      type: s.shape,
      id: n.id,
      x: p.x,
      y: p.y,
      width: s.w,
      height: s.h,
      backgroundColor: s.bg,
      label: {
        text: `${s.emoji} ${n.label}`,
        fontSize: 16,
      },
    })
    if (n.note) {
      skeleton.push({
        type: 'text',
        x: p.x + s.w / 2 - 110,
        y: p.y + s.h + 6,
        text: n.note,
        fontSize: 12,
      })
    }
  }

  // Arrows: border-to-border, no bindings → predictable, never pierce.
  const byId = new Map(nodes.map((n) => [n.id, n.id]))
  const byLabel = new Map(
    nodes.map((n) => [n.label.trim().toLowerCase(), n.id]),
  )
  const resolve = (ref: string): string | undefined =>
    byId.get(ref) ?? byLabel.get((ref ?? '').trim().toLowerCase())

  const borderPoint = (
    p: { x: number; y: number; cx: number; cy: number; spec: Spec },
    tx: number,
    ty: number,
  ) => {
    const dx = tx - p.cx
    const dy = ty - p.cy
    const hw = p.spec.w / 2
    const hh = p.spec.h / 2
    const s = Math.min(hw / (Math.abs(dx) || 1e-6), hh / (Math.abs(dy) || 1e-6))
    return [p.cx + dx * s, p.cy + dy * s] as const
  }

  for (const e of edges) {
    const fromId = resolve(e.from)
    const toId = resolve(e.to)
    if (!fromId || !toId || fromId === toId) continue
    const a = pos.get(fromId)!
    const b = pos.get(toId)!
    const [sx, sy] = borderPoint(a, b.cx, b.cy)
    const [ex, ey] = borderPoint(b, a.cx, a.cy)
    skeleton.push({
      type: 'arrow',
      x: sx,
      y: sy,
      points: [
        [0, 0],
        [ex - sx, ey - sy],
      ],
    })
    if (e.label) {
      const dx = ex - sx
      const dy = ey - sy
      const len = Math.hypot(dx, dy) || 1
      const off = 20
      const px = (dy / len) * off
      const py = (-dx / len) * off
      skeleton.push({
        type: 'text',
        x: (sx + ex) / 2 + px - 36,
        y: (sy + ey) / 2 + py - 8,
        text: e.label,
        fontSize: 11,
      })
    }
  }

  skeleton.unshift({
    type: 'text',
    x: canvasW / 2 - 160,
    y: -56,
    text: 'Comece no topo • siga as setas',
    fontSize: 18,
  })

  return convertToExcalidrawElements(skeleton as never) as readonly unknown[]
}

export function summarizeElements(elements: readonly unknown[]): string {
  const els = (elements as SceneEl[]).filter((e) => !e.isDeleted)
  if (els.length === 0) return 'O canvas está vazio — nada desenhado ainda.'

  const labelByContainer = new Map<string, string>()
  const looseTexts: { text: string; cx: number; cy: number }[] = []
  for (const e of els) {
    if (e.type === 'text' && e.text?.trim()) {
      const txt = e.text.trim()
      if (e.containerId) {
        labelByContainer.set(e.containerId, txt)
      } else {
        looseTexts.push({
          text: txt,
          cx: (e.x ?? 0) + (e.width ?? 0) / 2,
          cy: (e.y ?? 0) + (e.height ?? 0) / 2,
        })
      }
    }
  }

  type Shape = {
    id?: string
    label: string
    cx: number
    cy: number
    note?: string
  }
  const shapes: Shape[] = []
  for (const e of els) {
    if (!['rectangle', 'ellipse', 'diamond'].includes(e.type ?? '')) continue
    const cx = (e.x ?? 0) + (e.width ?? 0) / 2
    const cy = (e.y ?? 0) + (e.height ?? 0) / 2
    shapes.push({
      id: e.id,
      label: (e.id && labelByContainer.get(e.id)) || 'componente',
      cx,
      cy,
    })
  }

  // Map loose texts to their nearest shape — that's the "note below".
  for (const t of looseTexts) {
    let best: Shape | null = null
    let bd = Infinity
    for (const s of shapes) {
      const d = (s.cx - t.cx) ** 2 + (s.cy - t.cy) ** 2
      if (d < bd) {
        bd = d
        best = s
      }
    }
    if (best && bd < 240 * 240) {
      best.note = best.note ? `${best.note}; ${t.text}` : t.text
    }
  }

  const nearest = (x: number, y: number): Shape | null => {
    let best: Shape | null = null
    let bd = Infinity
    for (const s of shapes) {
      const d = (s.cx - x) ** 2 + (s.cy - y) ** 2
      if (d < bd) {
        bd = d
        best = s
      }
    }
    return best
  }

  const connections: string[] = []
  for (const e of els) {
    if (e.type !== 'arrow' && e.type !== 'line') continue
    const pts = e.points ?? []
    if (pts.length < 2) continue
    const last = pts[pts.length - 1]
    const from = nearest(
      (e.x ?? 0) + (pts[0][0] ?? 0),
      (e.y ?? 0) + (pts[0][1] ?? 0),
    )
    const to = nearest(
      (e.x ?? 0) + (last[0] ?? 0),
      (e.y ?? 0) + (last[1] ?? 0),
    )
    if (!from || !to || from === to) continue
    const lbl = e.id ? labelByContainer.get(e.id) : undefined
    connections.push(
      lbl
        ? `${from.label} →(${lbl}) ${to.label}`
        : `${from.label} → ${to.label}`,
    )
  }

  const nodes = shapes
    .map((s) => (s.note ? `${s.label} (${s.note})` : s.label))
    .join(', ')

  const lines = [
    `Elementos no canvas: ${els.length} (${shapes.length} formas, ${connections.length} conexões).`,
    shapes.length
      ? `Nós: ${nodes}.`
      : 'Ainda não há formas com rótulo.',
  ]
  if (connections.length) lines.push(`Conexões (setas): ${connections.join('; ')}.`)
  return lines.join('\n')
}

export async function exportScenePng(api: ExcalidrawApi): Promise<string | null> {
  const { exportToBlob } = await import('@excalidraw/excalidraw')
  const blob = await exportToBlob({
    elements: api.getSceneElements(),
    appState: {
      ...api.getAppState(),
      exportBackground: true,
      viewBackgroundColor: '#ffffff',
    },
    files: api.getFiles(),
    mimeType: 'image/png',
  } as never)
  return blobToBase64(blob)
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
