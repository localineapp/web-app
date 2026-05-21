import { NextRequest } from "next/server";

/**
 * GET /api/v1/projects/[projectId]/terms - List project's terms
 * @deprecated Use v2 instead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
}

/**
 * POST /api/v1/projects/[projectId]/terms - Add a new term to the project
 * @deprecated Use v2 instead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
}