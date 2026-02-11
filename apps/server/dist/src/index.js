import process from 'node:process';
import { serve } from '@hono/node-server';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Hono } from 'hono';
import { catalogTable, listItemTable, listTable } from './db/schema.js';
import 'dotenv/config';
const app = new Hono();
const api = new Hono();
const db = drizzle(process.env.DATABASE_URL);
api.get('/', (c) => {
    return c.text('Hello Hono!');
});
// GET /catalog?query=
api.get('/catalog', async (c) => {
    const catalogItems = await db.select().from(catalogTable);
    return c.json(catalogItems);
});
// GET /lists
api.get('/lists', async (c) => {
    const lists = await db.select().from(listTable);
    return c.json(lists);
});
// POST /lists
api.post('/lists', async (c) => {
    const [list] = await db.insert(listTable).values({}).returning();
    return c.json({ id: list.id });
});
// GET /lists/{listId}/items
api.get('/lists/:listId/items', async (c) => {
    const { listId } = c.req.param();
    const listItems = await db.select().from(listItemTable).where(eq(listItemTable.listId, Number(listId)));
    return c.json(listItems);
});
// POST /lists/{listId}/items
api.post('/lists/:listId/items', async (c) => {
    const { listId } = c.req.param();
    const { name, catalogId, quantity = 1 } = await c.req.json();
    console.log({ listId, name, catalogId, quantity });
    if (!name && !catalogId) {
        return c.json({ error: 'Name or catalogId are required' }, 400);
    }
    if (catalogId) {
        const [catalogItem] = await db.select().from(catalogTable).where(eq(catalogTable.id, catalogId));
        if (!catalogItem) {
            return c.json({ error: 'Catalog item not found' }, 404);
        }
        await db.insert(listItemTable).values({ listId: Number(listId), catalogId, name: catalogItem.name, quantity });
    }
    if (name) {
        const [catalogItem] = await db.insert(catalogTable).values({ name }).onConflictDoNothing().returning();
        await db.insert(listItemTable).values({ listId: Number(listId), catalogId: catalogItem.id, name, quantity });
    }
    const listItems = await db.select().from(listItemTable).where(eq(listItemTable.listId, Number(listId)));
    return c.json(listItems);
});
app.route('/api', api);
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
