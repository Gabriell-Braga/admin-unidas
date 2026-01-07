"use client";

import { usePathname, useRouter } from "next/navigation";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";

interface SidebarProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

const DRAWER_WIDTH = 280;

export default function Sidebar({ userName, userRole, onLogout }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Usuários",
      icon: PeopleIcon,
      path: "/admin",
      roles: ["admin"],
    },
    {
      title: "Formulários",
      icon: AssignmentIcon,
      path: "/forms",
      roles: ["admin", "user"],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed h-screen w-60 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div>
          <img
            src="https://cdn.prod.website-files.com/6865244132669bb89826a742/690207961fe09cf80bda3e99_Institucional.svg"
            alt="Logo"
            className="h-auto w-full"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-0">
        <ul className="space-y-0">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer ${
                    active
                      ? "bg-blue-50 border-l-4 border-primary text-primary font-semibold"
                      : "text-gray-600 hover:bg-gray-100 border-l-4 border-transparent"
                  }`}
                >
                  <span className="shrink-0">
                    <Icon fontSize="small" />
                  </span>
                  <span>{item.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <hr className="border-gray-200" />

      {/* User Info and Logout at Bottom */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">
              {userRole === "admin" ? "Administrador" : "Usuário"}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer"
            title="Sair"
          >
            <LogoutIcon fontSize="small" />
          </button>
        </div>
      </div>
    </aside>
  );
}
