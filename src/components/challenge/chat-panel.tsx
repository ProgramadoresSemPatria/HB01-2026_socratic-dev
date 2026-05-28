'use client'

import type { ChatMsg } from '@/lib/ai/types'
import { cn } from '@/lib/utils'
import { Lightbulb, Send } from 'lucide-react'
import { motion } from 'motion/react'
import { FormattedText } from './formatted-text'

export function ChatPanel({
  messages,
  scrollRef,
  thinking,
  input,
  setInput,
  sendUser,
  askHint,
  hintsUsed,
}: {
  messages: ChatMsg[]
  scrollRef: React.RefObject<HTMLDivElement | null>
  thinking: boolean
  input: string
  setInput: (v: string) => void
  sendUser: () => void
  askHint: (level: 1 | 2 | 3) => void
  hintsUsed: number
}) {
  return (
    <>
      <div className='flex h-10 items-center justify-between border-b border-white/[0.06] bg-white/[0.015] px-4'>
        <div className='flex items-center gap-2'>
          <div className='grid size-6 place-items-center rounded-full bg-gradient-to-br from-iris to-mint text-[9px] font-bold text-background'>
            S
          </div>
          <div className='text-[12px] font-medium'>Tutor Socrático</div>
        </div>
        <div className='font-mono text-[10px] text-muted-foreground/70'>
          {hintsUsed} hint{hintsUsed === 1 ? '' : 's'} usado
          {hintsUsed === 1 ? '' : 's'}
        </div>
      </div>

      <div
        ref={scrollRef}
        className='min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-[13.5px]'
      >
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {m.role === 'user' ? (
              <div className='flex justify-end'>
                <div className='max-w-[85%] rounded-2xl rounded-br-md bg-foreground/10 px-3.5 py-2 text-foreground/95'>
                  {m.text}
                </div>
              </div>
            ) : (
              <div className='flex gap-2'>
                <div className='grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-iris to-mint text-[9px] font-bold text-background'>
                  S
                </div>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl rounded-bl-md px-3.5 py-2 leading-relaxed',
                    m.hintLevel
                      ? 'border border-warning/20 bg-warning/10 text-foreground/95'
                      : 'border border-iris/15 bg-gradient-to-br from-iris/10 via-violet/5 to-mint/5 text-foreground/95',
                  )}
                >
                  {m.hintLevel && (
                    <div className='mb-1 flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-warning-foreground uppercase'>
                      <Lightbulb className='size-3' />
                      Hint nível {m.hintLevel}
                    </div>
                  )}
                  <FormattedText text={m.text} />
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex gap-2'
          >
            <div className='grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-iris to-mint text-[9px] font-bold text-background'>
              S
            </div>
            <div className='flex gap-1 rounded-2xl rounded-bl-md border border-iris/15 bg-iris/10 px-3.5 py-2'>
              <span className='size-1.5 animate-bounce rounded-full bg-iris' />
              <span className='size-1.5 animate-bounce rounded-full bg-iris [animation-delay:0.15s]' />
              <span className='size-1.5 animate-bounce rounded-full bg-iris [animation-delay:0.3s]' />
            </div>
          </motion.div>
        )}
      </div>

      <div className='border-t border-white/[0.04] px-3 pt-2 pb-1'>
        <div className='mb-1.5 font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase'>
          Preciso de uma pista
        </div>
        <div className='flex gap-1.5'>
          <HintBtn level={1} onClick={() => askHint(1)}>
            Vago
          </HintBtn>
          <HintBtn level={2} onClick={() => askHint(2)}>
            Médio
          </HintBtn>
          <HintBtn level={3} onClick={() => askHint(3)}>
            Quase direto
          </HintBtn>
        </div>
      </div>

      <div className='border-t border-white/[0.06] p-3'>
        <div className='flex items-end gap-2'>
          <div className='flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] transition-colors focus-within:border-iris/40'>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendUser()
                }
              }}
              placeholder='Pense primeiro. Depois pergunte...'
              rows={2}
              className='w-full resize-none bg-transparent px-3 py-2.5 text-[13.5px] outline-none placeholder:text-muted-foreground/50'
            />
          </div>
          <button
            onClick={sendUser}
            disabled={!input.trim() || thinking}
            className='grid size-10 shrink-0 place-items-center rounded-xl bg-foreground text-background transition-colors hover:bg-foreground/90 disabled:opacity-40'
          >
            <Send className='size-3.5' />
          </button>
        </div>
        <div className='mt-2 px-1 font-mono text-[10px] text-muted-foreground/50'>
          enter para enviar · shift+enter quebra linha
        </div>
      </div>
    </>
  )
}

function HintBtn({
  level,
  onClick,
  children,
}: {
  level: 1 | 2 | 3
  onClick: () => void
  children: React.ReactNode
}) {
  const cost = level * 4
  return (
    <button
      onClick={onClick}
      className='group flex-1 rounded-lg border border-white/[0.05] bg-white/[0.025] px-2.5 py-1.5 text-left transition-all hover:border-warning/30 hover:bg-warning/5'
    >
      <div className='flex items-center gap-1 text-[11px] font-medium'>
        <Lightbulb className='size-3 text-warning' />
        {children}
      </div>
      <div className='mt-0.5 font-mono text-[9px] text-muted-foreground/60'>
        -{cost} pts indep.
      </div>
    </button>
  )
}
