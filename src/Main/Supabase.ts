import { createClient } from '@supabase/supabase-js'
let VITE_SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmd3R5emR3Z2hrcWV1bWJjY2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNTc3NzEsImV4cCI6MjA0NzkzMzc3MX0.qo3opZ4TmhBqqd9Pt1G6u-wvTdruBx66ENP1RpI3uvU"
//Anon Key
const supabaseUrl = 'https://qfwtyzdwghkqeumbccer.supabase.co'
const supabaseKey = VITE_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
