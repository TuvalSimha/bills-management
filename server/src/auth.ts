import { PrismaClient, User } from "@prisma/client"
import { verify, JwtPayload } from "jsonwebtoken"

export const APP_SECRET = "mysecret123"

export async function authenticateUser(
    prisma: PrismaClient,
    request: Request
): Promise<User | null> {
    const header = request.headers.get('authorization')
    if (header !== null) {
        const token = header.split(' ')[1]
        const tokenPayload = verify(token, APP_SECRET) as JwtPayload
        const userId = tokenPayload.userId
        return await prisma.user.findUnique({ where: { id: userId } })
    }

    return null
}