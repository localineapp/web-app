import { getRequestConfig } from "next-intl/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default getRequestConfig(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const user = session?.user

  const locale = user?.locale || "en_US"

  return {
    locale: locale.replace("_", "-"),
    messages: (await import(`../../i18n/${locale}.json`)).default,
    onError() {},
    getMessageFallback({ namespace, key }) {
      return namespace ? `${namespace}.${key}` : key
    },
  }
})
