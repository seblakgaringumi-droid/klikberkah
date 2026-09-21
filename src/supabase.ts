import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_URL || (import.meta.env as Record<string, string | undefined>)?.NEXT_PUBLIC_SUPABASE_URL)) ||
  'https://kquxfvcbgogjpthhsseg.supabase.co';

export const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || (import.meta.env as Record<string, string | undefined>)?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdXhmdmNiZ29nanB0aGhzc2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MDI0OTEsImV4cCI6MjEwMTk3ODQ5MX0.xYs1LZHOYbNssk_6T0zpLzsXACjJxh4ksJnCMkUky9s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
