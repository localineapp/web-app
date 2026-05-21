import { NextRequest } from "next/server";

/**
 * POST /api/v1/projects/[projectId]/import - Import project translations from a JSON file
 * @deprecated Use v2 instead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
}