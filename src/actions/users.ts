"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { unauthorized } from "next/navigation"
import { prisma } from "@/lib/prisma"

export async function isEmailTaken(email: string): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  return (
    (await prisma.user.count({
      where: {
        email,
      },
    })) > 0
  )
}
