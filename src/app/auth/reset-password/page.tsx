import ResetPasswordForm from "@/components/auth/form/ResetPasswordForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password",
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
