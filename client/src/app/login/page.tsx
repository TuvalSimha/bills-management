import { Metadata } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UserLoginForm } from "@/components/user-login-form"

export const metadata: Metadata = {
    title: "Authentication",
    description: "Authentication forms built using the components.",
}

export default function AuthenticationPage() {
    return (
        <>
            <div className="p-24 sm:p-20 md:p-12">
                <Link
                    href="/signin"
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "absolute right-4 top-4 md:right-8 md:top-8"
                    )}
                >
                    Create User
                </Link>
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Login to your account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email and password to login.
                        </p>
                    </div>
                    <UserLoginForm />
                </div>
            </div>
        </>
    )
}