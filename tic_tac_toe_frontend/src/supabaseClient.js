import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
/**
 * Initializes and exports the Supabase client using environment variables.
 * REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY must be in .env.
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
