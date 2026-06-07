import { NextRequest } from "next/server"

/**
 * PUT /api/v1/projects/[projectId]/terms/[termId]/labels - Update a term's labels in the project
 * @deprecated Use v2 instead
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; termId: string }> }
) {
  const { projectId, termId } = await params
}
