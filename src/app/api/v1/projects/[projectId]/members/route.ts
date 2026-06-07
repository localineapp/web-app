import { NextRequest } from "next/server"

/**
 * GET /api/v1/projects/[projectId]/members - List project's members
 * @deprecated Use v2 instead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
}

/**
 * POST /api/v1/projects/[projectId]/members - Add a new member to the project
 * @deprecated Members backend has been changed drastically in v2, therefore this endpoint is no longer supported. Use v2 instead.
 */
export async function POST() {
  return new Response(
    "Members backend has been changed drastically in v2, therefore this endpoint is no longer supported. Use v2 instead.",
    {
      status: 400,
    }
  )
}
