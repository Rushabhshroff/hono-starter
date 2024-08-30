import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { v4 } from 'uuid'
export const UsersTable = sqliteTable('users', {
    id: text('id').$defaultFn(() => `user:${v4()}`).primaryKey(),
    fullname: text('fullname').notNull(),
    email: text('email').unique().notNull(),
    email_verified: integer('email_verified', { mode: 'boolean' }).default(false),
    password: text('password'),
    created_at: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
    updated_at: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
    last_login: integer('last_login', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
    provider: text('provider').notNull()
});
