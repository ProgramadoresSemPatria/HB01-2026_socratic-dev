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

const NODE_STYLE: Record<
  string,
  { shape: 'rectangle' | 'ellipse' | 'diamond'; emoji: string; bg: string }
> = {
  client: { shape: 'ellipse', emoji: '👤', bg: '#e7f0ff' },
  gateway: { shape: 'rectangle', emoji: '🚪', bg: '#fff1e6' },
  service: { shape: 'rectangle', emoji: '⚙️', bg: '#f1f0fb' },
  database: { shape: 'ellipse', emoji: '🗄️', bg: '#e8f8ee' },
  cache: { shape: 'diamond', emoji: '⚡', bg: '#fff7d6' },
  queue: { shape: 'rectangle', emoji: '📨', bg: '#eafaf5' },
  storage: { shape: 'ellipse', emoji: '📦', bg: '#f3eefe' },
  external: { shape: 'rectangle', emoji: '☁️', bg: '#eef0f2' },
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

export async function buildSceneElements(
  nodes: { id: string; label: string; type?: string; note?: string }[],
  edges: { from: string; to: string; label?: string }[],
): Promise<readonly unknown[]> {
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw')
  const W = 280
  const H = 132
  const GAP_X = 90
  const GAP_Y = 180

  const tiers = new Map<number, typeof nodes>()
  for (const n of nodes) {
    const t = TIER[n.type ?? ''] ?? 2
    if (!tiers.has(t)) tiers.set(t, [])
    tiers.get(t)!.push(n)
  }
  const sortedTiers = [...tiers.keys()].sort((a, b) => a - b)
  const maxCols = Math.max(1, ...[...tiers.values()].map((r) => r.length))

  const pos = new Map<string, { x: number; y: number }>()
  sortedTiers.forEach((t, rowIdx) => {
    const row = tiers.get(t)!
    const offset = ((maxCols - row.length) / 2) * (W + GAP_X)
    row.forEach((n, colIdx) => {
      pos.set(n.id, {
        x: offset + colIdx * (W + GAP_X),
        y: rowIdx * (H + GAP_Y),
      })
    })
  })

  const skeleton: unknown[] = nodes.map((n) => {
    const p = pos.get(n.id)!
    const st = NODE_STYLE[n.type ?? ''] ?? NODE_STYLE.service
    return {
      type: st.shape,
      id: n.id,
      x: p.x,
      y: p.y,
      width: W,
      height: H,
      backgroundColor: st.bg,
      label: {
        text: n.note
          ? `${st.emoji} ${n.label}\n${n.note}`
          : `${st.emoji} ${n.label}`,
        fontSize: 13,
      },
    }
  })

  const byId = new Map(nodes.map((n) => [n.id, n.id]))
  const byLabel = new Map(nodes.map((n) => [n.label.trim().toLowerCase(), n.id]))
  const resolve = (ref: string): string | undefined =>
    byId.get(ref) ?? byLabel.get((ref ?? '').trim().toLowerCase())

  const border = (cx: number, cy: number, tx: number, ty: number) => {
    const dx = tx - cx
    const dy = ty - cy
    const s = Math.min(
      W / 2 / (Math.abs(dx) || 1e-6),
      H / 2 / (Math.abs(dy) || 1e-6),
    )
    return [cx + dx * s, cy + dy * s] as const
  }

  for (const e of edges) {
    const fromId = resolve(e.from)
    const toId = resolve(e.to)
    if (!fromId || !toId || fromId === toId) continue
    const a = pos.get(fromId)!
    const b = pos.get(toId)!
    const acx = a.x + W / 2
    const acy = a.y + H / 2
    const bcx = b.x + W / 2
    const bcy = b.y + H / 2
    const [sx, sy] = border(acx, acy, bcx, bcy)
    const [ex, ey] = border(bcx, bcy, acx, acy)
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
      const off = 22
      const px = (dy / len) * off
      const py = (-dx / len) * off
      skeleton.push({
        type: 'text',
        x: (sx + ex) / 2 + px - 40,
        y: (sy + ey) / 2 + py - 8,
        text: e.label,
        fontSize: 12,
      })
    }
  }

  skeleton.unshift({
    type: 'text',
    x: 0,
    y: -64,
    text: 'Comece no topo (👤) e siga as setas pra baixo até os dados',
    fontSize: 20,
  })

  return convertToExcalidrawElements(skeleton as never) as readonly unknown[]
}

export function summarizeElements(elements: readonly unknown[]): string {
  const els = (elements as SceneEl[]).filter((e) => !e.isDeleted)
  if (els.length === 0) return 'O canvas está vazio — nada desenhado ainda.'

  const labelByContainer = new Map<string, string>()
  for (const e of els) {
    if (e.type === 'text' && e.text?.trim() && e.containerId) {
      labelByContainer.set(e.containerId, e.text.trim())
    }
  }

  type Shape = { label: string; cx: number; cy: number }
  const shapes: Shape[] = []
  for (const e of els) {
    if (!['rectangle', 'ellipse', 'diamond'].includes(e.type ?? '')) continue
    shapes.push({
      label: (e.id && labelByContainer.get(e.id)) || 'componente',
      cx: (e.x ?? 0) + (e.width ?? 0) / 2,
      cy: (e.y ?? 0) + (e.height ?? 0) / 2,
    })
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
    const from = nearest((e.x ?? 0) + (pts[0][0] ?? 0), (e.y ?? 0) + (pts[0][1] ?? 0))
    const to = nearest((e.x ?? 0) + (last[0] ?? 0), (e.y ?? 0) + (last[1] ?? 0))
    if (!from || !to || from === to) continue
    const lbl = e.id ? labelByContainer.get(e.id) : undefined
    connections.push(
      lbl ? `${from.label} →(${lbl}) ${to.label}` : `${from.label} → ${to.label}`,
    )
  }

  const lines = [
    `Elementos no canvas: ${els.length} (${shapes.length} formas, ${connections.length} conexões).`,
    shapes.length
      ? `Nós: ${shapes.map((s) => s.label).join(', ')}.`
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
