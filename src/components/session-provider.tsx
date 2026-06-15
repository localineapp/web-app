"use client"

import { auth } from "@/lib/auth"
import { createContext, useContext } from "react"

type Session = Awaited<ReturnType<typeof auth.api.getSession>>

const SessionContext = createContext<Session>(null)

export function SessionProvider({
  session,
  children,
}: {
  session: Session
  children: React.ReactNode
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const session = useContext(SessionContext)

  if (!session) {
    throw new Error("useSession must be used within SessionProvider")
  }

  return session
}
