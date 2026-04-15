import { supabase } from './lib/supabase.ts';

async function test() {
  const { data, error } = await supabase.from('site_settings').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
test();
