import { MiddlewareHandler } from "hono";
import Cookie from "../utils/cookie";
import { HTTPException } from "hono/http-exception";
import { WorkerContext } from "../types";

const VerifyLogin:MiddlewareHandler<WorkerContext> = async (c,next)=>{
    if(!c.get('USER')){
        throw new HTTPException(401,{message:"Login is required for this action"})
    }
    return next()
}

export default VerifyLogin;