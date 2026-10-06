import { createClient } from '@supabase/supabase-js';

const rawUrl = 'https://bjogkxquvqgikypjpmkz.supabase.co';

export const getEffectiveSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:' && rawUrl.startsWith('http://')) {
      return `${window.location.origin}/supabase-vps`;
    }
  }
  return rawUrl;
};

export const SUPABASE_URL = getEffectiveSupabaseUrl();
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqb2dreHF1dnFnaWt5cGpwbWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NzkyMDgsImV4cCI6MjEwNjQ1NTIwOH0.RX8bmKXzG4vWAhw7c4TGxxuvRyXWYnYdwhIK5oMEg2s';

export const NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
