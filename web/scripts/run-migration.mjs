import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');

const envPath = resolve(__dirname, '..', '.env.local');
const envFile = readFileSync(envPath, 'utf8');
const match = envFile.match(/^SUPABASE_DB_URL=(.+)$/m);
if (!match) {
    console.error('SUPABASE_DB_URL not found in web/.env.local');
    process.exit(1);
}
const connectionString = match[1].trim();

const files = process.argv.slice(2);
if (files.length === 0) {
    console.error('usage: node scripts/run-migration.mjs <sql-file> [more-sql-files]');
    process.exit(1);
}

const client = new Client({ connectionString });
await client.connect();
console.log('connected to database');

for (const relPath of files) {
    const abs = resolve(repoRoot, relPath);
    const sql = readFileSync(abs, 'utf8');
    console.log(`running ${relPath}`);
    await client.query(sql);
    console.log(`  ok`);
}

const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema='public' AND table_type='BASE TABLE'
     ORDER BY table_name`
);
console.log('tables:', rows.map((r) => r.table_name).join(', '));

await client.end();
