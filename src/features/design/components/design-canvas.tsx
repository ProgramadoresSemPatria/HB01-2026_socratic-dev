'use client'

import '@excalidraw/excalidraw/index.css'
import { useT } from '@/lib/i18n'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { ExcalidrawApi } from '../utils/scene'

const copy = {
  en: { loadingCanvas: 'Loading canvas…' },
  pt: { loadingCanvas: 'Carregando canvas…' },
}

function CanvasLoading() {
  const t = useT(copy)
  return (
    <div className='grid h-full place-items-center text-sm text-muted-foreground'>
      <span className='flex items-center gap-2'>
        <Loader2 className='size-4 animate-spin' /> {t.loadingCanvas}
      </span>
    </div>
  )
}

const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((m) => m.Excalidraw),
  {
    ssr: false,
    loading: () => <CanvasLoading />,
  },
)

export function DesignCanvas({
  initialElements,
  onApi,
  onChange,
}: {
  initialElements?: readonly unknown[]
  onApi: (api: ExcalidrawApi) => void
  onChange: (elements: readonly unknown[]) => void
}) {
  return (
    <div className='h-full w-full'>
      <Excalidraw
        excalidrawAPI={(api) => onApi(api as unknown as ExcalidrawApi)}
        onChange={(elements) => onChange(elements)}
        initialData={
          {
            elements: initialElements ?? [],
            appState: { viewBackgroundColor: '#ffffff' },
            scrollToContent: true,
          } as never
        }
      />
    </div>
  )
}
