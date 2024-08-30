import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import AuthRouter from './routes/auth'
import { Redis } from '@upstash/redis/cloudflare'
import Cookie from './utils/cookie'
import { cors } from 'hono/cors'
import ProfileRouter from './routes/profile'
import { WorkerContext } from './types'
import { SESClient } from './utils/ses'
import * as schemas from './schemas'
const app = new Hono<WorkerContext>()

app.use("*", async (c, next) => {
    c.set('DB', drizzle(c.env.DB,{schema:schemas}))
    c.set('REDIS', Redis.fromEnv(c.env))
    c.set('SES', new SESClient(c.env.SES_REGION, c.env.SES_KEY, c.env.SES_SECRET))
    let user = await Cookie.getUser(c);
    if (user) {
        c.set('USER', user);
    }
    return cors({
        origin: [c.env.WEBSITE_URL],
        credentials: true,
    })(c, next)
})

app.route('/auth', AuthRouter)
app.route('/profile', ProfileRouter)
export default app