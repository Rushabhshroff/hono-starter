import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import VerifyTurnstileToken from "../utils/verify-turnstile";
import { WorkerContext } from "../types";

const VerifyTurnstile: MiddlewareHandler<WorkerContext> = async (c, next) => {
    if(c.env.WORKER_ENV == 'local') return next()
    let token = c.req.header('X-Turnstile-Token');
    let ip = c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || c.req.header('X-Forwarded-For')
    if (!token) {
        throw new HTTPException(401, { message: "Please complete captcha challange" })
    }
    try {
        await VerifyTurnstileToken(c.env.CF_TURNSTILE_SECRET,token, ip)
        return next()
    } catch {
        throw new HTTPException(400, { message: "Captcha challange failed. Please refresh the page and try again." })
    }
}

export default VerifyTurnstile