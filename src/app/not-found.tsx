import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BackgroundPattern } from "@/components/background-pattern";
import { AlertCircle, Home, LogInIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function NotFoundPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted relative overflow-hidden">
      <BackgroundPattern />

      <div className="text-center space-y-8 relative z-10 px-4">
        <div className="inline-flex items-center gap-2 font-semibold mb-8">
          <Image src="/logo.png" alt="Localine Logo" width={32} height={32} className="object-contain" />
          <span className="text-2xl">Localine</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
          </div>
          <h2 className="text-3xl font-semibold">Page Not Found</h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Go back to dashboard
              </Link>
            </Button>
          ) : (
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signin">
              <LogInIcon className="mr-2 h-5 w-5" />
              Sign into your account
            </Link>
          </Button>
          )}
        </div>
      </div>
    </div>
  );
}