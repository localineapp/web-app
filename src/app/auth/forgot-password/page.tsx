import ForgotPasswordForm from "@/components/auth/form/ForgotPasswordForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
