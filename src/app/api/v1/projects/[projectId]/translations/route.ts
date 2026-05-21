import { NextRequest } from "next/server";

/**
 * GET /api/v1/projects/[projectId]/translations - List project's locales
 * @deprecated Use v2 instead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
}

/**
 * POST /api/v1/projects/[projectId]/translations - Add a new locale to the project
 * @deprecated Use v2 instead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
}