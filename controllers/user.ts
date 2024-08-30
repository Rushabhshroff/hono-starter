import { eq } from "drizzle-orm";
import { UsersTable } from "../schemas";
import { hashSync } from 'bcryptjs'
import { HTTPException } from 'hono/http-exception'
import { Controller, User } from "../types";

export default class UserController extends Controller {
    async CreateUser(fullname: string, email: string, provider: string, password?: string) {
        let user = await this.context.get('DB').insert(UsersTable).values({
            fullname: fullname,
            email: email,
            password: password ? hashSync(password) : undefined,
            provider: provider
        }).returning().then((res) => res.at(0)).catch((err: Error) => {
            if (err.message.includes('UNIQUE constraint failed')) {
                throw new HTTPException(400, { message: "Email address already exists. Please Sign In." })
            }else{
                throw new HTTPException(500,{message:err.message})
            }
        })
        return user!
    }

    async FindUserByEmail(email: string) {
        return await this.context.get('DB').select().from(UsersTable).where(eq(UsersTable.email, email)).then((res) => res.at(0))
    }

    async FindUserById(id: string) {
        return await this.context.get('DB').select().from(UsersTable).where(eq(UsersTable.id, id)).then((res) => res.at(0))
    }

    async SetUserPassword(email: string, password: string) {
        return this.context.get('DB').update(UsersTable).set({
            password: hashSync(password),
            updated_at: new Date()
        }).where(eq(UsersTable.email, email)).then((res)=>res.success)
    }

    async UpdateUser(email:string,user:Partial<User>){
        return await this.context.get('DB').update(UsersTable).set(user).where(eq(UsersTable.email,email)).returning().then((res)=>res.at(0))
    }
}