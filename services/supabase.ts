// Fix: Add a triple-slash directive to include Vite client types. This adds type
// definitions for `import.meta.env` and resolves the TypeScript errors.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'

// Read Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// The createClient function will throw an error if the URL or key is invalid.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);