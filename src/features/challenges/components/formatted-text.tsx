import * as React from 'react'

export const LineCitationContext = React.createContext<
  ((start: number, end?: number) => void) | null
>(null)

const INLINE =
  /(\*\*[^*]+\*\*)|(`[^`]+`)|\b((?:linhas?|lines?)\s+(\d+)(?:\s*(?:[-–—]|a|e|to|and)\s*(\d+))?)/gi

function renderInline(
  text: string,
  onLine: ((start: number, end?: number) => void) | null,
): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let lastIdx = 0
  let key = 0
  let m: RegExpExecArray | null
  INLINE.lastIndex = 0
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > lastIdx) out.push(text.slice(lastIdx, m.index))
    const tok = m[0]
    if (m[1]) {
      out.push(
        <strong key={key++} className='font-medium text-ink'>
          {tok.slice(2, -2)}
        </strong>,
      )
    } else if (m[2]) {
      out.push(
        <code
          key={key++}
          className='rounded bg-primary/5 px-1 py-0.5 font-mono text-[12.5px] text-primary'
        >
          {tok.slice(1, -1)}
        </code>,
      )
    } else {
      const start = Number(m[4])
      const end = m[5] ? Number(m[5]) : undefined
      if (onLine && Number.isFinite(start)) {
        out.push(
          <button
            key={key++}
            type='button'
            onClick={() => onLine(start, end)}
            className='cursor-pointer text-primary underline decoration-dotted underline-offset-2 hover:decoration-solid'
          >
            {tok}
          </button>,
        )
      } else {
        out.push(tok)
      }
    }
    lastIdx = m.index + tok.length
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx))
  return out
}

export function FormattedText({ text }: { text: string }) {
  const onLine = React.useContext(LineCitationContext)
  const lines = (text ?? '').split('\n')
  const blocks: React.ReactNode[] = []
  let bullets: string[] = []

  const flush = () => {
    if (!bullets.length) return
    blocks.push(
      <ul
        key={`ul-${blocks.length}`}
        className='my-2 list-disc space-y-1.5 pl-5'
      >
        {bullets.map((b, i) => (
          <li key={i}>{renderInline(b, onLine)}</li>
        ))}
      </ul>,
    )
    bullets = []
  }

  for (const raw of lines) {
    const bullet = raw.match(/^\s*[-*]\s+(.*)$/)
    if (bullet) {
      bullets.push(bullet[1])
      continue
    }
    flush()
    if (raw.trim()) {
      blocks.push(
        <p key={`p-${blocks.length}`} className='my-2'>
          {renderInline(raw, onLine)}
        </p>,
      )
    }
  }
  flush()

  return <div>{blocks}</div>
}
