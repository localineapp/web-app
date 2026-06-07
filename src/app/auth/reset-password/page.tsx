import ResetPasswordForm from "@/components/auth/form/ResetPasswordForm"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Reset Password",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
