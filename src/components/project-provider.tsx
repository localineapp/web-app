"use client"

import { FullProject } from "@/types/project"
import { createContext, useContext } from "react"

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

export function useProject() {
  const project = useContext(ProjectContext)

  if (!project) {
    throw new Error("useProject must be used within ProjectProvider")
  }

  return project
}
