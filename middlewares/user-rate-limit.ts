import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { WorkerContext } from "../types";

const UserRateLimit: (prefix:string,ttl:number,limit:number) => MiddlewareHandler<WorkerContext> = (prefix,ttl,limit) => async (c, next) => {
    let user = c.get('USER')
    if (!user) {
        throw new HTTPException(401, { message: "Please login to continue" })
    }
    let key = `${prefix}:${user.id}`
    let count = await c.get('REDIS').incr(key)
    if(count > limit){
        throw new HTTPException(429,{message:"Too many requests"})
    }
    await c.get('REDIS').expire(key,ttl)
    return next()
}

export default UserRateLimit