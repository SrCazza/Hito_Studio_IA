import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 See Other: el navegador hace GET a /login (un 307 re-POSTearía a una
  // página GET-only y rompería con error).
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
