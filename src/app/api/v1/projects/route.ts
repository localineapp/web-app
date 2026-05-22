import { NextRequest } from "next/server"

/**
 * GET /api/v1/projects - List user's projects
 * @deprecated Use v2 instead
 */
export async function GET(request: NextRequest) {}

/**
 * POST /api/v1/projects - Create a new project
 * @deprecated Project creation can't be done through the API anymore.
 */
export async function POST(request: NextRequest) {
  return new Response(
    "Project creation can't be done through the API anymore.",
    {
      status: 400,
    }
  )
}
