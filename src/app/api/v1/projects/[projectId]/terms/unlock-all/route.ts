import { NextRequest } from "next/server";

/**
 * POST /api/v1/projects/[projectId]/terms/unlock-all - Unlock all terms in the project
 * @deprecated Use v2 instead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
}