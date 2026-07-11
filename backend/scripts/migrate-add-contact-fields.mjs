import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

const runMigration = async () => {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('✓ Connected to database');

    console.log('\nRunning migration: Adding contactemail and contactphone columns...');
    
    const migrationSQL = `
      ALTER TABLE t_applications
      ADD COLUMN IF NOT EXISTS contactemail VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contactphone VARCHAR(20);
    `;

    await client.query(migrationSQL);
    console.log('✓ Migration applied successfully');

    // Verify columns exist
    const result = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 't_applications' 
      AND column_name IN ('contactemail', 'contactphone')
      ORDER BY column_name;
    `);

    console.log('\n✓ Columns verified:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✓ Migration complete!');
  }
};

runMigration();
