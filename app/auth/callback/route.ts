import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase";
import { createApiClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/?env=missing", requestUrl.origin));
  }

  if (code) {
    const supabase = createApiClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/wizard", requestUrl.origin));
}
