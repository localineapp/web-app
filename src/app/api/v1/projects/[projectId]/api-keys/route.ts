/**
 * GET /api/v1/projects/[projectId]/api-keys - List project's API keys
 * @deprecated API keys are no longer part of projects, and can't be accessed through the API anymore.
 */
export async function GET() {
  return new Response(
    "API keys are no longer part of projects, and can't be accessed through the API anymore.",
    {
      status: 400,
    }
  )
}

/**
 * POST /api/v1/projects/[projectId]/api-keys - Create a new API key for the project
 * @deprecated API keys are no longer part of projects, and can't be managed through the API anymore.
 */
export async function POST() {
  return new Response(
    "API keys are no longer part of projects, and can't be managed through the API anymore.",
    {
      status: 400,
    }
  )
}
