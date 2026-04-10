import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase";
import { createMiddlewareSupabaseClient } from "@/lib/supabase-server";

const protectedPrefixes = ["/wizard", "/modelos", "/checkout", "/download"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!hasSupabaseEnv()) {
    if (isProtected) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("env", "missing");
      return NextResponse.redirect(url);
    }
    return res;
  }

  const supabase = createMiddlewareSupabaseClient(req, res);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
