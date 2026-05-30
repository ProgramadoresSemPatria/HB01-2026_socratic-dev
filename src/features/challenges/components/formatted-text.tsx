import * as React from 'react'

const INLINE = /(\*\*[^*]+\*\*)|(`[^`]+`)/g

function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let lastIdx = 0
  let key = 0
  let m: RegExpExecArray | null
  INLINE.lastIndex = 0
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > lastIdx) out.push(text.slice(lastIdx, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) {
      out.push(
        <strong key={key++} className='font-semibold text-[#1b1916]'>
          {tok.slice(2, -2)}
        </strong>,
      )
    } else {
      out.push(
        <code
          key={key++}
          className='rounded bg-iris/5 px-1 py-0.5 font-mono text-[12.5px] text-iris'
        >
          {tok.slice(1, -1)}
        </code>,
      )
    }
    lastIdx = m.index + tok.length
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx))
  return out
}

export function FormattedText({ text }: { text: string }) {
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
          <li key={i}>{renderInline(b)}</li>
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
          {renderInline(raw)}
        </p>,
      )
    }
  }
  flush()

  return <div>{blocks}</div>
}
