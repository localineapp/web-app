import { NextRequest } from "next/server";

/**
 * PATCH /api/v1/projects/[projectId]/translations/[localeCode]/[termId] - Update a specific translation of a term in a locale
 * @deprecated Use v2 instead
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; localeCode: string; termId: string }> }
) {
  const { projectId, localeCode, termId } = await params;
}