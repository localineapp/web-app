/**
 * PATCH /api/v1/projects/[projectId]/members/[userId] - Update a specific member in the project
 * @deprecated Members backend has been changed drastically in v2, therefore this endpoint is no longer supported. Use v2 instead.
 */
export async function PATCH() {
  return new Response("Members backend has been changed drastically in v2, therefore this endpoint is no longer supported. Use v2 instead.", {
    status: 400,
  });
}

/**
 * DELETE /api/v1/projects/[projectId]/members/[userId] - Remove a specific member from the project
 * @deprecated Members backend has been changed drastically in v2, therefore this endpoint is no longer supported. Use v2 instead.
 */
export async function DELETE() {
  return new Response("Members backend has been changed drastically in v2, therefore this endpoint is no longer supported. Use v2 instead.", {
    status: 400,
  });
}