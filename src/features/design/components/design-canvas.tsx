'use client'

import '@excalidraw/excalidraw/index.css'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { ExcalidrawApi } from '../utils/scene'

const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((m) => m.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className='grid h-full place-items-center text-sm text-[#6b6478]'>
        <span className='flex items-center gap-2'>
          <Loader2 className='size-4 animate-spin' /> Carregando canvas…
        </span>
      </div>
    ),
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
