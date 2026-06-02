import { createHeaders, validateRequest } from "@/lib/api"
import { toJsonSafe } from "@/lib/utils"
import { NextRequest } from "next/server"

/**
 * GET /api/v2/projects/[projectId] - Get project details
 */
export const GET = validateRequest(async (_, __, { project }) => {
  return Response.json(toJsonSafe(project), {
    headers: createHeaders({
      options: {
        version: "v2",
      },
    }),
  })
})

/**
 * PATCH /api/v2/projects/[projectId] - Update project details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
}
