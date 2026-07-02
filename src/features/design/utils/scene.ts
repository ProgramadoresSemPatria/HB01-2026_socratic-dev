type SceneEl = {
  type?: string
  text?: string
  id?: string
  containerId?: string | null
  groupIds?: string[]
  startBinding?: { elementId?: string } | null
  endBinding?: { elementId?: string } | null
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
  scrollToContent: (
    target?: readonly unknown[],
    opts?: { fitToContent?: boolean; animate?: boolean },
  ) => void
}

type SceneNode = {
  id: string
  label: string
  type?: string
  note?: string
  tier?: number
}
type SceneEdge = { from: string; to: string; label?: string; dashed?: boolean }

const STROKE = '#1b1916'

type Kind =
  | 'client'
  | 'gateway'
  | 'service'
  | 'worker'
  | 'external'
  | 'queue'
  | 'cache'
  | 'database'
  | 'storage'

const SPEC: Record<Kind, { w: number; h: number; fill: string; tier: number }> = {
  client:   { w: 240, h: 110, fill: '#F7F9FA', tier: 0 },
  gateway:  { w: 250, h: 110, fill: '#EAE7E4', tier: 1 },
  service:  { w: 260, h: 110, fill: '#EEEBFF', tier: 2 },
  worker:   { w: 250, h: 110, fill: '#EEEBFF', tier: 2 },
  external: { w: 270, h: 130, fill: '#DFE5E9', tier: 2 },
  queue:    { w: 250, h: 110, fill: '#DDD2C7', tier: 3 },
  cache:    { w: 210, h: 130, fill: '#DAD8EA', tier: 3 },
  database: { w: 230, h: 150, fill: '#E8EFDB', tier: 4 },
  storage:  { w: 230, h: 120, fill: '#E8EFDB', tier: 4 },
}

const ALIAS: Record<string, Kind> = {
  user: 'client', users: 'client', mobile: 'client', web: 'client',
  frontend: 'client', browser: 'client', app: 'client',
  lb: 'gateway', loadbalancer: 'gateway', 'load-balancer': 'gateway',
  proxy: 'gateway', 'api-gateway': 'gateway', apigateway: 'gateway', nginx: 'gateway',
  api: 'service', server: 'service', backend: 'service', microservice: 'service',
  cdn: 'external', 'third-party': 'external', saas: 'external',
  broker: 'queue', kafka: 'queue', rabbitmq: 'queue', sqs: 'queue',
  pubsub: 'queue', 'message-queue': 'queue',
  redis: 'cache', memcached: 'cache',
  db: 'database', sql: 'database', postgres: 'database', mysql: 'database',
  mongo: 'database', mongodb: 'database', nosql: 'database',
  s3: 'storage', blob: 'storage', bucket: 'storage', files: 'storage',
  'object-storage': 'storage',
  job: 'worker', cron: 'worker', consumer: 'worker', batch: 'worker',
}

function kindOf(type?: string): Kind {
  const k = (type ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-')
  if (k in SPEC) return k as Kind
  return ALIAS[k] ?? 'service'
}

// How much wider the shape must be than the text so the label fits its
// usable inner area (diamond/ellipse have less horizontal room than rects).
const TEXT_FACTOR: Record<Kind, number> = {
  client: 1, gateway: 1.06, service: 1, worker: 1, external: 1.9,
  queue: 1.12, cache: 2, database: 1.05, storage: 1.05,
}

type PlacedNode = SceneNode & { kind: Kind }
type Box = { x: number; y: number; w: number; h: number; fontSize: number }

function nodeSize(n: PlacedNode): { w: number; h: number; fontSize: number } {
  const s = SPEC[n.kind]
  const fontSize = n.note ? 16 : 20
  const lines = n.note ? [n.label, n.note] : [n.label]
  const maxLen = Math.max(...lines.map((l) => l.length))
  const textW = maxLen * fontSize * 0.62 + 52
  const w = Math.round(Math.min(460, Math.max(s.w, textW * TEXT_FACTOR[n.kind])))
  return { w, h: n.note ? s.h + 14 : s.h, fontSize }
}

function nodeSkeleton(n: PlacedNode, b: Box): Record<string, unknown>[] {
  const { x, y, w, h, fontSize } = b
  const fill = SPEC[n.kind].fill
  const base = {
    strokeColor: STROKE,
    strokeWidth: 2,
    roughness: 1,
    fillStyle: 'solid',
  }
  const label = {
    text: n.note ? `${n.label}\n${n.note}` : n.label,
    fontSize,
    strokeColor: STROKE,
  }
  const g = [`g-${n.id}`]

  switch (n.kind) {
    case 'database':
    case 'storage': {
      const rim = Math.min(38, Math.round(h * 0.26))
      return [
        { type: 'ellipse', x, y: y + h - rim, width: w, height: rim, backgroundColor: fill, groupIds: g, ...base },
        { type: 'rectangle', id: n.id, x, y: y + rim / 2, width: w, height: h - rim, backgroundColor: fill, label, groupIds: g, ...base, strokeColor: 'transparent' },
        { type: 'line', x, y: y + rim / 2, width: 0, height: h - rim, points: [[0, 0], [0, h - rim]], groupIds: g, ...base },
        { type: 'line', x: x + w, y: y + rim / 2, width: 0, height: h - rim, points: [[0, 0], [0, h - rim]], groupIds: g, ...base },
        { type: 'ellipse', x, y, width: w, height: rim, backgroundColor: fill, groupIds: g, ...base },
      ]
    }
    case 'external':
      return [
        { type: 'ellipse', x, y: y + h * 0.3, width: w * 0.46, height: h * 0.62, backgroundColor: fill, groupIds: g, ...base },
        { type: 'ellipse', x: x + w * 0.54, y: y + h * 0.28, width: w * 0.46, height: h * 0.64, backgroundColor: fill, groupIds: g, ...base },
        { type: 'ellipse', id: n.id, x: x + w * 0.12, y, width: w * 0.76, height: h, backgroundColor: fill, label, groupIds: g, ...base },
      ]
    case 'cache':
      return [
        { type: 'diamond', id: n.id, x, y, width: w, height: h, backgroundColor: fill, roundness: { type: 2 }, label, ...base },
      ]
    case 'gateway':
      return [
        { type: 'rectangle', id: n.id, x, y, width: w, height: h, backgroundColor: fill, roundness: { type: 3 }, label, groupIds: g, ...base },
        { type: 'rectangle', x: x + 7, y: y + 7, width: w - 14, height: h - 14, backgroundColor: 'transparent', roundness: { type: 3 }, groupIds: g, ...base, strokeWidth: 1 },
      ]
    case 'queue': {
      const slot = (i: number) => ({
        type: 'line',
        x: x + w - 22 - i * 14,
        y: y + h / 2 - 15,
        width: 0,
        height: 30,
        points: [[0, 0], [0, 30]],
        groupIds: g,
        ...base,
        strokeWidth: 1,
      })
      return [
        { type: 'rectangle', id: n.id, x, y, width: w, height: h, backgroundColor: fill, roundness: { type: 3 }, label, groupIds: g, ...base },
        slot(0), slot(1), slot(2),
      ]
    }
    case 'client':
      return [
        { type: 'rectangle', id: n.id, x, y, width: w, height: h, backgroundColor: fill, roundness: { type: 3 }, label, groupIds: g, ...base },
        { type: 'line', x: x + w / 2 - 22, y: y + h - 11, width: 44, height: 0, points: [[0, 0], [44, 0]], groupIds: g, ...base },
      ]
    case 'worker':
      return [
        { type: 'rectangle', id: n.id, x, y, width: w, height: h, backgroundColor: fill, roundness: { type: 3 }, label, ...base, strokeStyle: 'dashed' },
      ]
    default:
      return [
        { type: 'rectangle', id: n.id, x, y, width: w, height: h, backgroundColor: fill, roundness: { type: 3 }, label, ...base },
      ]
  }
}

// Longest-path layering from sources (Kahn); type tier as fallback for
// isolated nodes and cycle leftovers; node.tier overrides everything.
function computeLayers(
  nodeList: PlacedNode[],
  edgeList: SceneEdge[],
): Map<string, number> {
  const out = new Map<string, string[]>()
  const remaining = new Map<string, number>()
  const touched = new Set<string>()
  for (const n of nodeList) {
    out.set(n.id, [])
    remaining.set(n.id, 0)
  }
  for (const e of edgeList) {
    out.get(e.from)!.push(e.to)
    remaining.set(e.to, (remaining.get(e.to) ?? 0) + 1)
    touched.add(e.from)
    touched.add(e.to)
  }

  const layer = new Map<string, number>()
  const queue: string[] = []
  for (const n of nodeList) {
    if (touched.has(n.id) && remaining.get(n.id) === 0) {
      layer.set(n.id, 0)
      queue.push(n.id)
    }
  }
  while (queue.length) {
    const u = queue.shift()!
    for (const v of out.get(u) ?? []) {
      layer.set(v, Math.max(layer.get(v) ?? 0, (layer.get(u) ?? 0) + 1))
      const d = (remaining.get(v) ?? 0) - 1
      remaining.set(v, d)
      if (d === 0) queue.push(v)
    }
  }

  for (const n of nodeList) {
    if (typeof n.tier === 'number') {
      layer.set(n.id, Math.max(0, Math.round(n.tier)))
      continue
    }
    if (!touched.has(n.id)) {
      layer.set(n.id, SPEC[n.kind].tier)
      continue
    }
    if (!layer.has(n.id)) {
      let best = SPEC[n.kind].tier
      for (const e of edgeList) {
        if (e.to === n.id && layer.has(e.from)) {
          best = Math.max(best, layer.get(e.from)! + 1)
        }
      }
      layer.set(n.id, best)
    }
  }

  const values = [...new Set(layer.values())].sort((a, b) => a - b)
  const remap = new Map(values.map((v, i) => [v, i]))
  for (const [k, v] of layer) layer.set(k, remap.get(v)!)
  return layer
}

function borderPoint(a: Box, b: Box): [number, number] {
  const acx = a.x + a.w / 2
  const acy = a.y + a.h / 2
  const dx = b.x + b.w / 2 - acx
  const dy = b.y + b.h / 2 - acy
  const s = Math.min(
    a.w / 2 / (Math.abs(dx) || 1e-6),
    a.h / 2 / (Math.abs(dy) || 1e-6),
  )
  return [acx + dx * s, acy + dy * s]
}

export async function buildSceneElements(
  nodes: { id: string; label: string; type?: string; note?: string; tier?: number }[],
  edges: { from: string; to: string; label?: string; dashed?: boolean }[],
): Promise<readonly unknown[]> {
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw')

  const COL_GAP = 96
  const ROW_GAP = 150

  const seen = new Set<string>()
  const nodeList: PlacedNode[] = []
  for (const raw of nodes ?? []) {
    const id = String(raw.id ?? '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    nodeList.push({
      ...raw,
      id,
      label: String(raw.label ?? id),
      kind: kindOf(raw.type),
    })
  }
  if (nodeList.length === 0) return []

  const idSet = new Set(nodeList.map((n) => n.id))
  const byLabel = new Map(
    nodeList.map((n) => [n.label.trim().toLowerCase(), n.id]),
  )
  const resolve = (ref: unknown): string | undefined => {
    const r = String(ref ?? '').trim()
    return idSet.has(r) ? r : byLabel.get(r.toLowerCase())
  }

  const edgeList: SceneEdge[] = []
  const edgeSeen = new Set<string>()
  for (const e of edges ?? []) {
    const from = resolve(e.from)
    const to = resolve(e.to)
    if (!from || !to || from === to) continue
    const key = `${from}->${to}`
    if (edgeSeen.has(key)) continue
    edgeSeen.add(key)
    edgeList.push({ from, to, label: e.label, dashed: e.dashed })
  }

  const layer = computeLayers(nodeList, edgeList)
  const layers = new Map<number, PlacedNode[]>()
  for (const n of nodeList) {
    const l = layer.get(n.id)!
    if (!layers.has(l)) layers.set(l, [])
    layers.get(l)!.push(n)
  }
  const layerKeys = [...layers.keys()].sort((a, b) => a - b)

  const parentsOf = new Map<string, string[]>()
  for (const e of edgeList) {
    if (!parentsOf.has(e.to)) parentsOf.set(e.to, [])
    parentsOf.get(e.to)!.push(e.from)
  }

  // Order each row by barycenter of already-ranked parents (fewer crossings).
  const rank = new Map<string, number>()
  for (const lk of layerKeys) {
    const row = layers.get(lk)!
    const scored = row.map((n, i) => {
      const ps = (parentsOf.get(n.id) ?? []).filter((p) => rank.has(p))
      const score = ps.length
        ? ps.reduce((acc, p) => acc + rank.get(p)!, 0) / ps.length
        : 0.5
      return { n, i, score }
    })
    scored.sort((a, b) => a.score - b.score || a.i - b.i)
    layers.set(lk, scored.map((s) => s.n))
    scored.forEach((s, idx) => rank.set(s.n.id, (idx + 0.5) / scored.length))
  }

  const rows = layerKeys.map((lk) => {
    const sized = layers.get(lk)!.map((n) => ({ n, ...nodeSize(n) }))
    const totalW =
      sized.reduce((acc, s) => acc + s.w, 0) +
      COL_GAP * Math.max(0, sized.length - 1)
    const maxH = Math.max(...sized.map((s) => s.h))
    return { sized, totalW, maxH }
  })
  const canvasW = Math.max(...rows.map((r) => r.totalW))

  const box = new Map<string, Box>()
  let cursorY = 0
  for (const { sized, totalW, maxH } of rows) {
    let cursorX = (canvasW - totalW) / 2
    for (const s of sized) {
      box.set(s.n.id, {
        x: cursorX,
        y: cursorY + (maxH - s.h) / 2,
        w: s.w,
        h: s.h,
        fontSize: s.fontSize,
      })
      cursorX += s.w + COL_GAP
    }
    cursorY += maxH + ROW_GAP
  }

  const skeleton: Record<string, unknown>[] = []
  for (const lk of layerKeys) {
    for (const n of layers.get(lk)!) {
      skeleton.push(...nodeSkeleton(n, box.get(n.id)!))
    }
  }

  for (const e of edgeList) {
    const a = box.get(e.from)!
    const b = box.get(e.to)!
    const [sx, sy] = borderPoint(a, b)
    const [ex, ey] = borderPoint(b, a)
    skeleton.push({
      type: 'arrow',
      x: sx,
      y: sy,
      points: [
        [0, 0],
        [ex - sx, ey - sy],
      ],
      start: { id: e.from },
      end: { id: e.to },
      strokeColor: STROKE,
      strokeWidth: 2,
      roughness: 1,
      ...(e.dashed ? { strokeStyle: 'dashed' } : {}),
      ...(e.label ? { label: { text: e.label, fontSize: 12 } } : {}),
    })
  }

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

  // Composite nodes share groupIds — collapse each group into one component.
  type Comp = {
    label: string
    note?: string
    minX: number
    minY: number
    maxX: number
    maxY: number
    cx: number
    cy: number
  }
  const compByKey = new Map<string, Comp>()
  const compOfElement = new Map<string, Comp>()
  let anon = 0
  for (const e of els) {
    if (!['rectangle', 'ellipse', 'diamond'].includes(e.type ?? '')) continue
    const key = e.groupIds?.[0] ?? e.id ?? `anon-${anon++}`
    let c = compByKey.get(key)
    if (!c) {
      c = {
        label: '',
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
        cx: 0,
        cy: 0,
      }
      compByKey.set(key, c)
    }
    c.minX = Math.min(c.minX, e.x ?? 0)
    c.minY = Math.min(c.minY, e.y ?? 0)
    c.maxX = Math.max(c.maxX, (e.x ?? 0) + (e.width ?? 0))
    c.maxY = Math.max(c.maxY, (e.y ?? 0) + (e.height ?? 0))
    if (e.id) compOfElement.set(e.id, c)
    const raw = e.id ? labelByContainer.get(e.id) : undefined
    if (raw && !c.label) {
      const [first, ...rest] = raw.split('\n')
      c.label = first.trim()
      const note = rest.join(' ').trim()
      if (note) c.note = note
    }
  }
  const comps = [...compByKey.values()]
  for (const c of comps) {
    c.cx = (c.minX + c.maxX) / 2
    c.cy = (c.minY + c.maxY) / 2
    if (!c.label) c.label = 'componente'
  }

  const nearest = (x: number, y: number): Comp | null => {
    let best: Comp | null = null
    let bd = Infinity
    for (const c of comps) {
      const d = (c.cx - x) ** 2 + (c.cy - y) ** 2
      if (d < bd) {
        bd = d
        best = c
      }
    }
    return best && bd < 240 * 240 ? best : null
  }

  for (const t of looseTexts) {
    const c = nearest(t.cx, t.cy)
    if (c) c.note = c.note ? `${c.note}; ${t.text}` : t.text
  }

  const connections: string[] = []
  for (const e of els) {
    if (e.type !== 'arrow' && e.type !== 'line') continue
    if (e.groupIds?.[0] && compByKey.has(e.groupIds[0])) continue
    let from = e.startBinding?.elementId
      ? (compOfElement.get(e.startBinding.elementId) ?? null)
      : null
    let to = e.endBinding?.elementId
      ? (compOfElement.get(e.endBinding.elementId) ?? null)
      : null
    const pts = e.points ?? []
    if ((!from || !to) && pts.length >= 2) {
      const last = pts[pts.length - 1]
      from =
        from ??
        nearest((e.x ?? 0) + (pts[0][0] ?? 0), (e.y ?? 0) + (pts[0][1] ?? 0))
      to =
        to ??
        nearest((e.x ?? 0) + (last[0] ?? 0), (e.y ?? 0) + (last[1] ?? 0))
    }
    if (!from || !to || from === to) continue
    const lbl = e.id ? labelByContainer.get(e.id) : undefined
    connections.push(
      lbl
        ? `${from.label} →(${lbl}) ${to.label}`
        : `${from.label} → ${to.label}`,
    )
  }

  const nodesTxt = comps
    .map((c) => (c.note ? `${c.label} (${c.note})` : c.label))
    .join(', ')

  const lines = [
    `Elementos no canvas: ${els.length} (${comps.length} formas, ${connections.length} conexões).`,
    comps.length ? `Nós: ${nodesTxt}.` : 'Ainda não há formas com rótulo.',
  ]
  if (connections.length) {
    lines.push(`Conexões (setas): ${connections.join('; ')}.`)
  }
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
