import { Skeleton } from '@/components/ui/skeleton'

export function ChallengeSkeleton() {
  return (
    <div className='flex h-screen flex-1 flex-col overflow-hidden bg-white'>
      <header className='flex h-14 shrink-0 items-center justify-between border-b border-[#DFE5E9] px-4'>
        <Skeleton className='h-6 w-28' />
        <div className='flex items-center gap-2'>
          <Skeleton className='hidden h-8 w-20 rounded-full md:block' />
          <Skeleton className='h-8 w-24 rounded-full' />
        </div>
      </header>
      <div className='grid min-h-0 flex-1 lg:grid-cols-[360px_1fr_400px]'>
        <aside className='space-y-3 border-r border-[#DFE5E9] p-6'>
          <Skeleton className='h-5 w-40 rounded-full' />
          <Skeleton className='h-7 w-3/4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='mt-4 h-24 w-full rounded-xl' />
        </aside>
        <section className='flex min-h-0 flex-col border-r border-[#DFE5E9]'>
          <div className='flex h-10 items-center justify-between border-b border-[#DFE5E9] px-4'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-20' />
          </div>
          <div className='flex-1 space-y-3 bg-[#0a0a0c] p-6'>
            <Skeleton className='h-4 w-1/2 bg-white/[0.06]' />
            <Skeleton className='h-4 w-2/3 bg-white/[0.06]' />
            <Skeleton className='h-4 w-1/3 bg-white/[0.06]' />
            <Skeleton className='h-4 w-3/5 bg-white/[0.06]' />
          </div>
        </section>
        <aside className='space-y-3 p-6'>
          <Skeleton className='h-16 w-full rounded-xl' />
          <Skeleton className='ml-auto h-12 w-3/4 rounded-xl' />
          <Skeleton className='h-12 w-2/3 rounded-xl' />
        </aside>
      </div>
    </div>
  )
}
