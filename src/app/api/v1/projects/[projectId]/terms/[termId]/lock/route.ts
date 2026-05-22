import { NextRequest } from "next/server"

/**
 * PATCH /api/v1/projects/[projectId]/terms/[termId]/lock - Update a term's lock status in the project
 * @deprecated Use v2 instead
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; termId: string }> }
) {
  const { projectId, termId } = await params
}
