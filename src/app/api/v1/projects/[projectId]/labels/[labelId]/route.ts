import { NextRequest } from "next/server"

/**
 * PATCH /api/v1/projects/[projectId]/labels/[labelId] - Update a specific label for the project
 * @deprecated Use v2 instead
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; labelId: string }> }
) {
  const { projectId, labelId } = await params
}

/**
 * DELETE /api/v1/projects/[projectId]/labels/[labelId] - Delete a specific label from the project
 * @deprecated Use v2 instead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; labelId: string }> }
) {
  const { projectId, labelId } = await params
}
