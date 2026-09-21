const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:YUF3m4rdvwB2WLBO@db.zyhltmxgodkjesgtmjix.supabase.co:5432/postgres';
  
  console.log('Connecting to Supabase PostgreSQL...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Connected successfully! Reading schema_supabase.sql...');
    const sqlPath = path.join(__dirname, '..', 'schema_supabase.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing DDL migration script...');
    await client.query(sql);
    console.log('Migration completed successfully! All tables and seed data created.');
    client.release();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
