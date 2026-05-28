type SceneEl = {
  type?: string
  text?: string
  id?: string
  containerId?: string | null
  startBinding?: { elementId?: string } | null
  endBinding?: { elementId?: string } | null
  isDeleted?: boolean
}

export type ExcalidrawApi = {
  getSceneElements: () => readonly unknown[]
  getAppState: () => Record<string, unknown>
  getFiles: () => Record<string, unknown>
  updateScene: (scene: { elements: readonly unknown[] }) => void
}

// Builds Excalidraw elements from an architecture graph (nodes + edges),
// laid out in a grid. Used by "Resolver pra mim" to draw the solution.
export async function buildSceneElements(
  nodes: { id: string; label: string }[],
  edges: { from: string; to: string }[],
): Promise<readonly unknown[]> {
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw')
  const COLS = 3
  const W = 200
  const H = 90
  const GAP_X = 90
  const GAP_Y = 80

  const skeleton: unknown[] = nodes.map((n, i) => ({
    type: 'rectangle',
    id: n.id,
    x: (i % COLS) * (W + GAP_X),
    y: Math.floor(i / COLS) * (H + GAP_Y),
    width: W,
    height: H,
    backgroundColor: '#f1f0fb',
    label: { text: n.label },
  }))

  const ids = new Set(nodes.map((n) => n.id))
  for (const e of edges) {
    if (ids.has(e.from) && ids.has(e.to)) {
      skeleton.push({
        type: 'arrow',
        x: 0,
        y: 0,
        start: { id: e.from },
        end: { id: e.to },
      })
    }
  }

  return convertToExcalidrawElements(skeleton as never) as readonly unknown[]
}

export function summarizeElements(elements: readonly unknown[]): string {
  const els = (elements as SceneEl[]).filter((e) => !e.isDeleted)
  if (els.length === 0) return 'O canvas está vazio — nada desenhado ainda.'

  const labelByContainer = new Map<string, string>()
  const standalone: string[] = []
  for (const e of els) {
    if (e.type === 'text' && e.text?.trim()) {
      const t = e.text.trim()
      if (e.containerId) labelByContainer.set(e.containerId, t)
      else standalone.push(t)
    }
  }

  const boxes = [...labelByContainer.values(), ...standalone]
  const connections: string[] = []
  for (const e of els) {
    if (e.type !== 'arrow' && e.type !== 'line') continue
    const fromL = (e.startBinding?.elementId &&
      labelByContainer.get(e.startBinding.elementId)) || '?'
    const toL = (e.endBinding?.elementId &&
      labelByContainer.get(e.endBinding.elementId)) || '?'
    connections.push(`${fromL} → ${toL}`)
  }

  const shapes = els.filter((e) =>
    ['rectangle', 'ellipse', 'diamond'].includes(e.type ?? ''),
  ).length

  const lines = [
    `Elementos no canvas: ${els.length} (${shapes} formas, ${connections.length} conexões).`,
    boxes.length
      ? `Nós/rótulos: ${boxes.join(', ')}.`
      : 'Ainda não há rótulos de texto nas formas.',
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
