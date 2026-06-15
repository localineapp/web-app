"use client"

import { FullProject } from "@/types/project"
import { createContext, useContext } from "react"
import { useSession } from "@/components/session-provider"

const ProjectContext = createContext<FullProject | null>(null)

export function ProjectProvider({
  project,
  children,
}: {
  project: FullProject
  children: React.ReactNode
}) {
  return (
    <ProjectContext.Provider value={project}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject(): {
  project: FullProject
  member: FullProject["members"][number] | undefined
} {
  const project = useContext(ProjectContext)

  if (!project) {
    throw new Error("useProject must be used within ProjectProvider")
  }

  const { user } = useSession()
  const member = project.members.find((member) => member.userId === user.id)

  return { project, member }
}
