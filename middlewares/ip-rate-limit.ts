import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { WorkerContext } from "../types";

const IPRateLimit: (prefix: string, ttl: number, limit: number) => MiddlewareHandler<WorkerContext> = (prefix, ttl, limit) => async (c, next) => {
    let ip = c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || c.req.header('X-Forwarded-For')
    if (!ip) {
        throw new HTTPException(400, { message: "Could not identify IP. We cannot proceed with the request at this moment." })
    }
    let key = `${prefix}:${ip}`
    let count = await c.get('REDIS').incr(key)
    if (count > limit) {
        throw new HTTPException(429, { message: "Too many requests" })
    }
    await c.get('REDIS').expire(key, ttl)
    return next()
}

export default IPRateLimit