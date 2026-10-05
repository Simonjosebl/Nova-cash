/**
 * Genera supabase/schema.sql concatenando, en orden, supabase/migrations/*.sql (R-18).
 * El esquema consolidado nunca se edita a mano: así no se desalinea de las migraciones.
 *
 * Uso: npm run db:schema
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MIGRATIONS = path.join(ROOT, 'supabase/migrations');
const OUTPUT = path.join(ROOT, 'supabase/schema.sql');

const header = [
  '-- Nova Cash · Esquema consolidado (GENERADO — no editar a mano).',
  '-- Es la concatenación, en orden, de supabase/migrations/*.sql. Para regenerarlo: npm run db:schema',
  '-- Úsalo solo para crear un proyecto nuevo desde cero en el SQL Editor; para uno existente aplica',
  '-- únicamente las migraciones que falten.',
  '',
].join('\n');

const files = fs
  .readdirSync(MIGRATIONS)
  .filter((file) => file.endsWith('.sql'))
  .sort();

const body = files
  .map((file) => {
    const sql = fs.readFileSync(path.join(MIGRATIONS, file), 'utf8').replace(/\r\n/g, '\n');
    const rule = '-- '.padEnd(72, '=');
    return `\n${rule}\n-- ${file}\n${rule}\n${sql.trimEnd()}\n`;
  })
  .join('');

fs.writeFileSync(OUTPUT, header + body);
console.log(`✓ supabase/schema.sql (${files.length} migraciones)`);
