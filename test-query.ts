import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

async function run() {
  const { data, error } = await supabase.from('pedidos').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Order Example:', data[0]);
    if (data[0]) {
        console.log('Available columns:', Object.keys(data[0]));
    }
  }
}
run();