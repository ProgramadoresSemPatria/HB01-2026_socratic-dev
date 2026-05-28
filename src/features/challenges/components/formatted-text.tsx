export function FormattedText({ text }: { text: string }) {
  const parts = (text ?? '').split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('`') ? (
          <code
            key={i}
            className='rounded bg-iris/5 px-1 py-0.5 font-mono text-[12.5px] text-iris'
          >
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i} className='whitespace-pre-line'>
            {p}
          </span>
        ),
      )}
    </>
  )
}
