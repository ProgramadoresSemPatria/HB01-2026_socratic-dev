import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

// Use this ONLY in server-side code (API routes, server actions).
// Never expose the service role key to the client.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
