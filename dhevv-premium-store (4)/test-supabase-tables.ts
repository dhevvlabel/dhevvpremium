import { supabase } from './lib/supabase.ts';

async function test() {
  const tables = ['orders', 'vouchers', 'Store Status', 'Users Dhevv Premium', 'products', 'prices', 'product_variants'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    console.log(table, error ? error.message : 'exists');
  }
}
test();
