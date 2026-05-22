/**
 * DELETE /api/v1/projects/[projectId]/api-keys/[keyId] - Delete an API key from the project
 * @deprecated API keys are no longer part of projects, and can't be managed through the API anymore.
 */
export async function DELETE() {
  return new Response(
    "API keys are no longer part of projects, and can't be managed through the API anymore.",
    {
      status: 400,
    }
  )
}
