"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { unauthorized } from "next/navigation"

export async function addPassword(password: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    return unauthorized()
  }

  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  })

  const hasPassword = accounts.some(
    (account) => account.providerId === "credential"
  )

  if (hasPassword) {
    throw new Error("Password already exists for this account.")
  }

  await auth.api.setPassword({
    headers: await headers(),
    body: {
      newPassword: password.trim(),
    },
  })
}
