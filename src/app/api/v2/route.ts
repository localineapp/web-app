import { ApiReference } from '@scalar/nextjs-api-reference'

const config: Parameters<typeof ApiReference>[0] = {
  url: '/api/v2/openapi.yml',
  telemetry: false,
}

export const GET = ApiReference(config)