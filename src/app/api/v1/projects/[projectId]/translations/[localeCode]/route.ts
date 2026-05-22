import { NextRequest } from "next/server"

/**
 * GET /api/v1/projects/[projectId]/translations/[localeCode] - Get translations for a specific locale
 * @deprecated Use v2 instead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; localeCode: string }> }
) {
  const { projectId, localeCode } = await params
}

/**
 * DELETE /api/v1/projects/[projectId]/translations/[localeCode] - Delete a specific locale from the project
 * @deprecated Use v2 instead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; localeCode: string }> }
) {
  const { projectId, localeCode } = await params
}
