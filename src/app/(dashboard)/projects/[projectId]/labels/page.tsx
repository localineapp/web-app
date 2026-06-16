import CreateLabelDialog from "@/components/dashboard/projects/project/labels/CreateLabelDialog"
import LabelsTable from "@/components/dashboard/projects/project/labels/LabelsTable"
import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Labels",
}

export default async function ProjectLabelsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description="Manage the labels for your project." />

        <div className="flex gap-2">
          <CreateLabelDialog />
        </div>
      </div>

      <div>
        <LabelsTable />
      </div>
    </div>
  )
}
