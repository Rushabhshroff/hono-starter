import { z } from 'zod'
export const SignUpBodyDto = z.object({
    fullname: z.string(),
    email: z.string().email(),
    password: z.string().min(8, "Password must be atleast 8 characters long"),
})

export const SignInBodyDto = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const ForgotPasswordBodyDto = z.object({
    email: z.string().email(),
})

export const ResetPasswordBodyDto = z.object({
    token: z.string(),
    password: z.string().min(8, "Password must be atleast 8 characters long")
})

export const VerifyAccountDto = z.object({
    token:z.string()
})