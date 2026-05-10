import { NextRequest, NextResponse } from "next/server"
import { auth } from "./lib/auth"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!pathname.startsWith("/auth") && !session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  } else if (pathname.startsWith("/auth") && session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next|api|static|logo.png|favicon.ico).*)",
}