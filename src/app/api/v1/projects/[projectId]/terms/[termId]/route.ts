import { NextRequest } from "next/server"

/**
 * PATCH /api/v1/projects/[projectId]/terms/[termId] - Update a term in the project
 * @deprecated Use v2 instead
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; termId: string }> }
) {
  const { projectId, termId } = await params
}

/**
 * DELETE /api/v1/projects/[projectId]/terms/[termId] - Delete a term from the project
 * @deprecated Use v2 instead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; termId: string }> }
) {
  const { projectId, termId } = await params
}
