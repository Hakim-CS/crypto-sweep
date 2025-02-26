
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://loidoxjkkquhqejghngr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaWRveGpra3F1aHFlamdobmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1Nzc4ODIsImV4cCI6MjA1NjE1Mzg4Mn0.4rwT25GnjryrzEzfKTy0-cV_O_IlfrOZgeYAac63BsA';

export const supabase = createClient(supabaseUrl, supabaseKey);
