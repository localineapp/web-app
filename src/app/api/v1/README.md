# API v1 Routes (Deprecated)

Go to [API v2 Routes](../v2) for the latest API endpoints and documentation.

> [!WARNING]
> These API routes are deprecated and will be removed in a future release. If you're building new features, please use the v2 API routes instead and migrate existing code when possible.

## Breaking Changes in v1 API
### `POST /api/v1/projects`
This endpoint was used to create a new project. This is no longer supported as projects should be created through the web interface. There is no replacement API endpoint for project creation in v2.
### `DELETE /api/v1/projects/[projectId]`
This endpoint was used to delete a project. This is no longer supported as project deletion should be performed through the web interface. There is no replacement API endpoint for project deletion in v2.
### `GET /api/v1/projects/[projectId]/api-keys`, `POST /api/v1/projects/[projectId]/api-keys`, `DELETE /api/v1/projects/[projectId]/api-keys/[keyId]`
These endpoints were used to manage project API keys. Due to the fact that API keys are now managed at the user level in v2, these endpoints are no longer supported. There are no replacement API endpoints for API key management in v2.
### `POST /api/v1/projects/[projectId]/members`, `PATCH /api/v1/projects/[projectId]/members/[userId]`, `DELETE /api/v1/projects/[projectId]/members/[userId]`
These endpoints were used to manage project members. Due to drastic changes in how project membership is handled in v2, these endpoints are no longer supported. To manage project members in v2, please refer to the new v2 API endpoints.