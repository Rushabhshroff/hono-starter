import { DrizzleD1Database } from 'drizzle-orm/d1'
import { UsersTable } from './schemas'
import { Redis } from '@upstash/redis'
import { Context } from 'hono'
import { SESClient } from './utils/ses'
import * as schemas from './schemas'
export type Bindings = {
    DB: D1Database
    ANALYTICS: AnalyticsEngineDataset
    CF_ACCOUNT_ID: string
    WORKER_ENV: 'local' | 'production'
    WEBSITE_URL: string
    JWT_SECRET: string
    CF_TURNSTILE_SECRET: string,
    UPSTASH_REDIS_REST_URL: string,
    UPSTASH_REDIS_REST_TOKEN: string,
    SES_SECRET: string
    SES_KEY: string
    SES_REGION: string
}
export type Variables = {
    DB: DrizzleD1Database<typeof schemas>
    REDIS: Redis
    USER: User
    SES: SESClient
}

export type WorkerContext<B = unknown, V = unknown> = { Bindings: Bindings & B, Variables: Variables & V }

export class Service {
    constructor(protected readonly context:Context<WorkerContext>){}
}

export class Controller {
    constructor(protected readonly context:Context<WorkerContext>){}
}

export type User = typeof UsersTable.$inferSelect