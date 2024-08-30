import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { ForgotPasswordBodyDto, ResetPasswordBodyDto, SignInBodyDto, SignUpBodyDto, VerifyAccountDto } from "../dto/auth";
import AuthService from "../services/auth";
import Cookie from "../utils/cookie";
import IPRateLimit from "../middlewares/ip-rate-limit";
import UserRateLimit from "../middlewares/user-rate-limit";
import VerifyTurnstile from "../middlewares/verify-turnstile";
import { WorkerContext } from "../types";
import ProfileService from "../services/profile";
const AuthRouter = new Hono<WorkerContext>()

AuthRouter.post('/sign-up', VerifyTurnstile, zValidator('json', SignUpBodyDto), async (c) => {
    let body = c.req.valid('json')
    let { token, user } = await new AuthService(c).SignUp(body);
    Cookie.setLogin(c, token)
    return c.json(user)
})

AuthRouter.post('/sign-in', VerifyTurnstile, zValidator('json', SignInBodyDto), async (c) => {
    let body = c.req.valid('json')
    let { token, user } = await new AuthService(c).SignIn(body);
    Cookie.setLogin(c, token)
    return c.json(user)
})

AuthRouter.post('/forgot-password', VerifyTurnstile, IPRateLimit('email', 120, 1), zValidator('json', ForgotPasswordBodyDto), async (c) => {
    let body = c.req.valid('json')
    let done = await new AuthService(c).ForgotPassword(body);
    return c.json({
        success: done
    })
})

AuthRouter.get('/resend-verification-email', UserRateLimit('email', 120, 1), async (c) => {
    let done = await new AuthService(c).SendVerificationEmail(c.get('USER')!)
    return c.json({
        success: done
    })
})

AuthRouter.post('/reset-password', zValidator('json', ResetPasswordBodyDto), async (c) => {
    let body = c.req.valid('json')
    let res = await new AuthService(c).ResetPassword(body)
    return c.json({
        success: res
    })
})

AuthRouter.get('/verify', zValidator('query', VerifyAccountDto), async (c) => {
    const { token } = c.req.valid('query')
    await new ProfileService(c).verifyProfile(token)
    return c.json({
        success: true
    })
})

export default AuthRouter;