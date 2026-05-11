import { areSignUpsDisabled, isAnySocialLoginEnabled } from "@/actions/get-env";
import SignInForm from "@/components/auth/form/SignInForm";

export const metadata = {
  title: "Sign In",
};

export default async function SignInPage() {
  const showSocialButtons = await isAnySocialLoginEnabled();
  const signUpsDisabled = areSignUpsDisabled();
  return (
    <SignInForm showSocialButtons={showSocialButtons} signUpsDisabled={signUpsDisabled} />
  );
}