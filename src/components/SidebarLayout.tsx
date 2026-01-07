"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/src/components/Sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hideSidebarRoutes = ["/login", "/register"];
  const shouldShowSidebar = !hideSidebarRoutes.includes(pathname);

  useEffect(() => {
    // Buscar dados do usuário para a sidebar
    if (shouldShowSidebar) {
      const fetchUser = async () => {
        try {
          const response = await fetch("/api/auth/me");
          const userData = await response.json();
          if (response.ok) {
            setUser(userData);
          } else {
            // Use full reload redirect to avoid router/client-hook render timing issues
            window.location.href = "/login";
          }
        } catch (err) {
          console.error("Erro ao buscar usuário:", err);
          window.location.href = "/login";
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    } else {
      setLoading(false);
    }
  }, [shouldShowSidebar, router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  }

  if (shouldShowSidebar && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (shouldShowSidebar) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar
          userName={user?.name || ""}
          userRole={user?.role || "user"}
          onLogout={handleLogout}
        />
        <div className="ml-60 flex-1 flex flex-col">{children}</div>
      </div>
    );
  }

  return <>{children}</>;
}
