import { areSignUpsDisabled, isAnySocialLoginEnabled } from "@/actions/get-env";
import SignUpForm from "@/components/auth/form/SignUpForm";

export const metadata = {
  title: "Sign Up",
};

export default async function SignUpPage() {
  const showSocialButtons = isAnySocialLoginEnabled();
  const signUpsDisabled = areSignUpsDisabled();
  return (
    <SignUpForm showSocialButtons={showSocialButtons} signUpsDisabled={signUpsDisabled} />
  );
}