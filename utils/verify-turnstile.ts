import { HTTPException } from "hono/http-exception";

export default async function VerifyTurnstileToken(secret:string,token: string, ip?: string) {
    let formData = new FormData();
    formData.append('secret', secret)
    formData.append('response', token)
    if (ip) {
        formData.append('ip', ip)
    }
    return fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        body: formData,
        method: 'POST'
    }).then(async (res) => {
        let _ = (await res.json()) as { success: boolean }
        if(!_.success){
            throw new HTTPException(400,{message:"Captcha challange failed"})
        }
        return true
    })
}