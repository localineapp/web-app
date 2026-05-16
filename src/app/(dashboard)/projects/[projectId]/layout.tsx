import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>
}): Promise<Metadata> {
  const { projectId } = await params

  return {
    title: { default: projectId, template: `%s | ${projectId}` },
    robots: "noindex",
  }
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: Promise<{ projectId: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user

  return <>{children}</>
}