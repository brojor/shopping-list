import process from 'node:process';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { catalogTable } from './schema.js';
import items from '../items.json' with { type: 'json' };
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
}
const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);
try {
    const existingCatalogItems = await db.select({ id: catalogTable.id }).from(catalogTable).limit(1);
    if (existingCatalogItems.length > 0) {
        console.log('Catalog already seeded, skipping');
        process.exit(0);
    }
    await db.insert(catalogTable).values(items.map(name => ({ name })));
    console.log(`Catalog seeded with ${items.length} items`);
}
finally {
    await pool.end();
}
