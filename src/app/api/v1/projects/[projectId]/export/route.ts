import { NextRequest } from "next/server";

/**
 * GET /api/v1/projects/[projectId]/export - Export all project translations in JSON format
 * @deprecated Use v2 instead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
}