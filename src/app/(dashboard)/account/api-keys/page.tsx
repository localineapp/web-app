import { getApiKeysLimit } from "@/actions/get-env"
import ApiKeysTable from "@/components/dashboard/account/api-keys/ApiKeysTable"
import CreateApiKeyDialog from "@/components/dashboard/account/api-keys/CreateApiKeyDialog"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "API Keys",
}

export default async function ApiKeysPage() {
  const [apiKeys, apiKeysLimit] = await Promise.all([
    auth.api.listApiKeys({
      headers: await headers(),
    }),
    getApiKeysLimit(),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys and view their details.
          </p>
        </div>

        <div className="flex gap-2">
          <CreateApiKeyDialog
            apiKeysCount={apiKeys.total}
            apiKeysLimit={apiKeysLimit}
          />
        </div>
      </div>

      <div>
        <ApiKeysTable apiKeys={apiKeys.apiKeys} apiKeysLimit={apiKeysLimit} />
      </div>
    </div>
  )
}
