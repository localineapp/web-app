import { getRequestConfig } from "next-intl/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default getRequestConfig(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user
  const locale = user ? user.locale : "en_US"

  return {
    locale: locale.replace("_", "-"),
    messages: await safeLoadMessages(locale),
    onError() {},
    getMessageFallback({ namespace, key }) {
      return namespace ? `${namespace}.${key}` : key
    },
  }
})

async function safeLoadMessages(locale: string) {
  try {
    return (await import(`../../i18n/${locale}.json`)).default
  } catch {
    return {}
  }
}
