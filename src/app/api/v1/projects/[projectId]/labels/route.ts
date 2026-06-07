import { NextRequest } from "next/server"

/**
 * GET /api/v1/projects/[projectId]/labels - List project's labels
 * @deprecated Use v2 instead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
}

/**
 * POST /api/v1/projects/[projectId]/labels - Create a new label for the project
 * @deprecated Use v2 instead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
}
