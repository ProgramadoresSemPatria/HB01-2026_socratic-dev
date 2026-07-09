'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ProfileSkeleton() {
  return (
    <div>
      <div className='mt-12 grid grid-cols-1 gap-y-6 sm:grid-cols-3'>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className='border-border sm:border-l sm:pl-8 sm:first:border-l-0 sm:first:pl-0'
          >
            <Skeleton className='h-11 w-16 sm:h-14' />
            <Skeleton className='mt-3 h-3 w-20' />
          </div>
        ))}
      </div>
      <div className='mt-14 border-b border-border pb-4'>
        <Skeleton className='h-3 w-28' />
        <Skeleton className='mt-3 h-3.5 w-64' />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className='flex items-center justify-between border-b border-border py-5'
        >
          <div>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='mt-2 h-3 w-44' />
          </div>
          <Skeleton className='h-9 w-[180px] rounded-full' />
        </div>
      ))}
      <div className='mt-10 flex items-center justify-between'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-9 w-28 rounded-full' />
      </div>
    </div>
  )
}
