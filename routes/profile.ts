import { Hono } from "hono";
import Cookie from "../utils/cookie";
import { WorkerContext } from "../types";

const ProfileRouter = new Hono<WorkerContext>();

ProfileRouter.get('/', async (c)=>{
    let user = await Cookie.getUser(c);

    return c.json(user)
})

ProfileRouter.get('/logout', async (c)=>{
    Cookie.deleteSession(c)

    return c.redirect(`${c.env.WEBSITE_URL}/auth/sign-in`)
})

export default ProfileRouter;