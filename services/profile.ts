import { verify } from "hono/jwt";
import { Service } from "../types";
import UserController from "../controllers/user";
import { HTTPException } from "hono/http-exception";

export default class ProfileService extends Service {
    async verifyProfile(token: string) {
        try {
            const payload = await verify(token, this.context.env.JWT_SECRET);
            if (payload.purpose && payload.purpose == 'verify') {
                await new UserController(this.context).UpdateUser(payload.email, { email_verified: true })
            }
        } catch (err) {
            throw new HTTPException(400, { message: "Verification link expired or is invalid." })
        }
    }
}