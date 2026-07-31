import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isSupabaseConfigured,
  MISSING_CONFIG_MESSAGE,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/config";

export default async function proxy(request: NextRequest) {
  // Sem configuração o site inteiro cairia em 500, inclusive as páginas
  // públicas. Preferimos seguir sem checar sessão: o layout do dashboard
  // valida o usuário de novo e o RLS barra qualquer acesso a dados.
  if (!isSupabaseConfigured) {
    console.error(MISSING_CONFIG_MESSAGE);
    return NextResponse.next({ request });
  }

  try {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Importante: não rodar código entre createServerClient e getUser,
    // senão a sessão pode não ser renovada corretamente.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    if (!user && pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }

    if (user && (pathname === "/sign-in" || pathname === "/sign-up")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (error) {
    // Instabilidade no Supabase não pode derrubar o site: o layout do
    // dashboard e o RLS continuam protegendo os dados.
    console.error("[inDash] Falha ao validar a sessão no proxy:", error);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    // Tudo, exceto estáticos e imagens
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
