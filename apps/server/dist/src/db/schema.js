import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
export const catalogTable = pgTable('catalog', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export const listTable = pgTable('list', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export const listItemTable = pgTable('list_item', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    listId: integer().references(() => listTable.id),
    catalogId: integer().references(() => catalogTable.id),
    name: varchar({ length: 255 }).notNull(),
    quantity: integer().notNull().default(1),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
