import { z } from "zod";
import { ForgotPasswordBodyDto, ResetPasswordBodyDto, SignInBodyDto, SignUpBodyDto } from "../dto/auth";
import UserController from "../controllers/user";
import { sign, verify } from 'hono/jwt'
import { compareSync } from 'bcryptjs'
import { HTTPException } from "hono/http-exception";
import { addHours, addMinutes } from "date-fns";
import SendPasswordResetEmail from "../templates/email/reset-email";
import { Service, User, WorkerContext } from "../types";
import SendVerificationEmail from "../templates/email/verify-email";
import { Context } from "hono";

export default class AuthService extends Service {
    private readonly userController:UserController
    constructor(context:Context<WorkerContext>){
        super(context);
        this.userController = new UserController(context)
    }

    async SignUp(body: z.infer<typeof SignUpBodyDto>) {
        console.log(body)
        let user = await this.userController.CreateUser(body.fullname, body.email, 'password', body.password)
        //@ts-ignore
        delete user.password;
        let token = await sign(user, this.context.env.JWT_SECRET)
        await this.SendVerificationEmail(user)
        return { token, user }
    }

    async SignIn(body: z.infer<typeof SignInBodyDto>) {
        let user = await this.userController.FindUserByEmail(body.email);
        if (user) {
            if (user.provider == 'password') {
                let valid = compareSync(body.password, user.password!);
                if (valid) {
                    //@ts-ignore
                    delete user.password
                    const token = await sign(user, this.context.env.JWT_SECRET)
                    await this.userController.UpdateUser(user.email,{
                        last_login: new Date()
                    })
                    return { token, user }
                } else {
                    throw new HTTPException(400, { message: "Invalid Password" })
                }
            } else {
                throw new HTTPException(400, { message: "This email was used with a different provider. Please use the same provider to Sign In." })
            }
        } else {
            throw new HTTPException(400, { message: "No such user existis. Please Sign Up." })
        }
    }

    async ForgotPassword(body: z.infer<typeof ForgotPasswordBodyDto>) {
        let user = await this.userController.FindUserByEmail(body.email);
        if (user) {
            let token = await sign({
                email: body.email,
                timestamp: Date.now(),
                exp: addMinutes(Date.now(), 30).getTime() / 1000
            }, this.context.env.JWT_SECRET)
            const action_url = `${this.context.env.WEBSITE_URL}/reset-password?token=${token}`
            await SendPasswordResetEmail(this.context.get('SES'),user.email, user.fullname, action_url)
            return true
        }
        return false
    }

    async SendVerificationEmail(user: User) {
        if (!user.email_verified) {
            let token = await sign({ email: user.email, expiry: addHours(new Date(), 24),purpose:'verify' }, this.context.env.JWT_SECRET);
            let action_url = `${this.context.env.WEBSITE_URL}/verify?token=${token}`;
            await SendVerificationEmail(this.context.get('SES'),user.email, user.fullname, action_url)
        }
        return true
    }

    async ResetPassword(body: z.infer<typeof ResetPasswordBodyDto>) {
        try {
            let payload = await verify(body.token, this.context.env.JWT_SECRET)
            let success = await this.userController.SetUserPassword(payload.email,body.password);
            return success
        } catch (err) {
            if (err.name !== HTTPException.name) {
                throw new HTTPException(400, { message: "Password Reset Token is either invalid or has expired" })
            }else{
                throw err
            }
        }
    }
}