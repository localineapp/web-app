import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { User } from "@prisma/client"
import { ApiKey } from "@better-auth/api-key"

export async function withApiKey<T>(
  handler: (
    request: NextRequest,
    params: { params: Promise<T> },
    auth: { apiKey: Omit<ApiKey, "key"> | null; user: User | null }
  ) => Promise<Response>
) {
  return async (request: NextRequest, params: { params: Promise<T> }) => {
    const authorization = request.headers.get("authorization")

    if (!authorization) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!authorization.startsWith("Bearer ")) {
      return Response.json(
        { error: "Invalid authorization format" },
        { status: 401 }
      )
    }

    const apiKey = authorization.slice(7)

    const data = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
      },
    })

    if (!data.valid) {
      return Response.json(
        { error: data.error || "Invalid API key", status: 401 },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: data.key?.referenceId,
      },
    })

    return handler(request, params, { apiKey: data.key, user: user || null })
  }
}

export function createHeaders(
  apiKey?: Omit<ApiKey, "key"> | ApiKey | null,
  options?: {
    version?: string
    deprecated?: boolean
  }
): HeadersInit {
  return {
    "x-api-version": options?.version || "v1",
    ...(options?.deprecated && {
      "x-deprecation-warning":
        "This API version is deprecated and will be removed in the future. Please migrate to v2.",
    }),
    "x-rate-limit-enabled": apiKey?.rateLimitEnabled ? "true" : "false",
    ...(apiKey?.rateLimitEnabled && {
      "x-rate-limit-time-window":
        apiKey?.rateLimitTimeWindow?.toString() || "0",
      "x-rate-limit-max": apiKey?.rateLimitMax?.toString() || "0",
      "x-rate-limit-remaining": apiKey?.rateLimitEnabled
        ? Math.max(
            0,
            (apiKey.rateLimitMax || 0) - (apiKey.requestCount || 0)
          ).toString()
        : "0",
    }),
  }
}
