import { NextRequest } from "next/server";

/**
 * GET /api/v1/projects/[projectId] - Get project details
 * @deprecated Use v2 instead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
}

/**
 * PATCH /api/v1/projects/[projectId] - Update project details
 * @deprecated Use v2 instead
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
}

/**
 * DELETE /api/v1/projects/[projectId] - Delete a project
 * @deprecated Project deletion can't be done through the API anymore.
 */
export async function DELETE() {
  return new Response("Project deletion can't be done through the API anymore.", {
    status: 400,
  });
}