import { NextRequest, NextResponse } from "next/server";

// Rotas que não precisam autenticação
const publicRoutes = ["/login", "/register"];

// Rotas que precisam autenticação
const protectedRoutes = ["/admin", "/dashboard"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get("sessionToken")?.value;

  // Nota: não tratamos aqui a raiz '/' para evitar conflitos com o
  // redirecionamento server-side em src/app/page.tsx

  // Se está tentando acessar rotas protegidas sem autenticação
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se está logado e tenta acessar login/register, redireciona para dashboard
  if (publicRoutes.includes(pathname) && sessionToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
