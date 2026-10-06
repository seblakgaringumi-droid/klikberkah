import { createClient } from '@supabase/supabase-js';

const rawUrl = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_URL || (import.meta.env as Record<string, string | undefined>)?.NEXT_PUBLIC_SUPABASE_URL)) ||
  'https://bjogkxquvqgikypjpmkz.supabase.co';

export const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || (import.meta.env as Record<string, string | undefined>)?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqb2dreHF1dnFnaWt5cGpwbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NzkyMDgsImV4cCI6MjEwNjQ1NTIwOH0.RX8bmKXzG4vWAhw7c4TGxxuvRyXWYnYdwhIK5oMEg2s';

// Resolve same-origin proxy endpoint if browser is HTTPS but raw target is HTTP to avoid Mixed Content blocks
export const getEffectiveSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:' && rawUrl.startsWith('http://')) {
      return `${window.location.origin}/supabase-vps`;
    }
  }
  return rawUrl;
};

export const SUPABASE_URL = getEffectiveSupabaseUrl();
export const RAW_SUPABASE_URL = rawUrl;
export const NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

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
