import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { User } from "@prisma/client"
import { ApiKey } from "@better-auth/api-key"
import { FullProject } from "@/types/project"
import { findProject } from "@/lib/project"
import {
  hasPermission,
  ProjectPermissionValue,
} from "@/lib/project-permissions"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function validateRequest<T = {}>(
  {
    permission,
    adminPermission,
  }: {
    permission?: ProjectPermissionValue
    adminPermission?: Parameters<
      typeof auth.api.userHasPermission
    >[0] extends undefined
      ? never
      : NonNullable<
          Parameters<typeof auth.api.userHasPermission>[0]
        >["body"]["permissions"]
  },
  handler: (
    request: NextRequest,
    params: T,
    auth: {
      apiKey: Omit<ApiKey, "key">
      user: User
      project: FullProject | null
    }
  ) => Promise<Response>
) {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    const authorization = request.headers.get("authorization")
    const pathname = request.nextUrl.pathname
    const apiVersion = pathname.startsWith("/api/v2/") ? "v2" : "v1"

    if (!authorization) {
      return Response.json(
        {
          error: {
            code: "MISSING_AUTHORIZATION",
            message: "Authorization header is required",
            status: 401,
          },
        },
        {
          status: 401,
          headers: createHeaders({
            options: {
              version: apiVersion,
            },
          }),
        }
      )
    }

    if (!authorization.startsWith("Bearer ")) {
      return Response.json(
        {
          error: {
            code: "INVALID_AUTHORIZATION",
            message: "Authorization header must start with 'Bearer '",
            status: 401,
          },
        },
        {
          status: 401,
          headers: createHeaders({
            options: {
              version: apiVersion,
            },
          }),
        }
      )
    }

    const apiKey = authorization.slice(7)

    const data = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
      },
    })

    if (!data.valid || !data.key) {
      return Response.json(
        {
          error: {
            code: "INVALID_API_KEY",
            message: "The provided API key is invalid",
            status: 401,
          },
        },
        {
          status: 401,
          headers: createHeaders({
            options: {
              version: apiVersion,
            },
          }),
        }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: data.key?.referenceId,
      },
    })

    if (!user) {
      return Response.json(
        {
          error: {
            code: "USER_NOT_FOUND",
            message: "The user associated with the API key was not found",
            status: 500,
          },
        },
        {
          status: 500,
          headers: createHeaders({
            options: {
              version: apiVersion,
            },
          }),
        }
      )
    }

    const params = await context.params
    let project: FullProject | null = null
    if (params && typeof params === "object" && "projectId" in params) {
      project = await findProject(params.projectId as string, user)
      if (!project) {
        return Response.json(
          {
            error: {
              code: "PROJECT_NOT_FOUND",
              message: "Project not found or you don't have access to it",
              status: 404,
            },
          },
          {
            status: 404,
            headers: createHeaders({
              options: {
                version: apiVersion,
              },
            }),
          }
        )
      }

      if (permission) {
        const member = project.members.find((m) => m.userId === user.id)
        const canManage =
          hasPermission(member?.role.permissions ?? 0n, permission) ||
          (
            await auth.api.userHasPermission({
              body: {
                // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
                role: user.role ?? "user",
                permissions: {
                  projects: ["update"],
                },
              },
            })
          ).success

        if (!canManage) {
          return Response.json(
            {
              error: {
                code: "FORBIDDEN",
                message: "You don't have permission to access this resource",
                status: 403,
              },
            },
            {
              status: 403,
              headers: createHeaders({
                options: {
                  version: apiVersion,
                },
              }),
            }
          )
        }
      }
    } else if (adminPermission) {
      const hasAdminPermission = await auth.api.userHasPermission({
        body: {
          // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
          role: user.role ?? "user",
          permissions: adminPermission,
        },
      })

      if (!hasAdminPermission.success) {
        return Response.json(
          {
            error: {
              code: "FORBIDDEN",
              message: "You don't have permission to access this resource",
              status: 403,
            },
          },
          {
            status: 403,
            headers: createHeaders({
              options: {
                version: apiVersion,
              },
            }),
          }
        )
      }
    }

    return handler(request, params, {
      apiKey: data.key,
      user: user,
      project: project || null,
    })
  }
}

export function createHeaders({
  apiKey,
  options,
}: {
  apiKey?: Omit<ApiKey, "key"> | ApiKey | null
  options?: {
    version?: string
    deprecated?: boolean
  }
}): HeadersInit {
  return {
    "x-api-version": options?.version || "v1",
    ...((options?.deprecated || options?.version === "v1") && {
      "x-deprecation-warning":
        "This API version is deprecated and will be removed in the future. Please migrate to v2.",
    }),
    ...(apiKey && {
      "x-rate-limit-enabled": apiKey.rateLimitEnabled ? "true" : "false",
      ...(apiKey.rateLimitEnabled && {
        "x-rate-limit-time-window":
          apiKey.rateLimitTimeWindow?.toString() || "0",
        "x-rate-limit-max": apiKey.rateLimitMax?.toString() || "0",
        "x-rate-limit-remaining": apiKey.rateLimitEnabled
          ? Math.max(
              0,
              (apiKey.rateLimitMax || 0) - (apiKey.requestCount || 0)
            ).toString()
          : "0",
      }),
    }),
  }
}

export function handleApiError(
  error: unknown,
  options: { version: string }
): Response {
  if (error instanceof Error) {
    const code =
      error.cause && typeof error.cause === "object" && "code" in error.cause
        ? error.cause.code
        : "INTERNAL_SERVER_ERROR"
    const status =
      error.cause && typeof error.cause === "object" && "status" in error.cause
        ? error.cause.status
        : 500
    const message = error.message || "An unknown error occurred."

    return Response.json(
      {
        error: {
          code,
          message,
          status,
        },
      },
      {
        // @ts-expect-error - status can be any number, but the ResponseInit type expects a specific set of numbers.
        status,
        headers: createHeaders({
          options: {
            version: options.version,
          },
        }),
      }
    )
  } else {
    return Response.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred. Please try again later.",
          status: 500,
        },
      },
      {
        status: 500,
        headers: createHeaders({
          options: {
            version: options.version,
          },
        }),
      }
    )
  }
}
