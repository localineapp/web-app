"use server"

import { unauthorized } from "next/navigation"
import { isProduction } from "@/actions/get-env"
import { prisma } from "@/lib/prisma"
import { User } from "@prisma/client"

export async function setRole(userId: string, role: string): Promise<User> {
  if (await isProduction()) {
    return unauthorized()
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
  })
}
