import { createMiddlewareClient, createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/supabase.types";

export function createCookieServerClient() {
  return createServerComponentClient<Database>({ cookies });
}

export function createApiClient() {
  return createRouteHandlerClient<Database>({ cookies });
}

export function createMiddlewareSupabaseClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient<Database>({ req, res });
}
