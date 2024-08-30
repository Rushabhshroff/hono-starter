import { Context } from "hono";
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { addHours } from 'date-fns'
import { verify } from "hono/jwt";
import { User, WorkerContext } from "../types";
export default class Cookie {
    static setLogin(c: Context<WorkerContext>, token: string) {
        setCookie(c, 'session', token, {
            expires: addHours(new Date(), 24),
            httpOnly: true,
            secure: c.env.WORKER_ENV == 'production',
            sameSite: 'Strict'
        })
    }

    static async getUser(c: Context<WorkerContext>) {
        let token = getCookie(c, 'session')
        if (token) {
            return verify(token, c.env.JWT_SECRET).then((res) => res as User).catch((err) => undefined)
        }
    }

    static async deleteSession(c:Context<WorkerContext>){
        return deleteCookie(c,'session',{
            httpOnly: true,
            secure: c.env.WORKER_ENV == 'production',
            sameSite: 'Strict'
        })
    }
}