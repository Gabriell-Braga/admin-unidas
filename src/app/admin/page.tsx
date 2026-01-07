"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import { getApiPath } from "@/src/lib/url";
import EditUserDialog from "@/src/components/EditUserDialog";

interface User {
  id: string;
  email: string;
  name: string;
  status: "pending" | "active" | "blocked";
  role: "admin" | "user";
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface EditingUserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "pending" | "active" | "blocked";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditingUserData | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  function addToast(message: string, type: "success" | "error") {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  async function fetchData() {
    try {
      // Obter informações do usuário logado
      const userResponse = await fetch(getApiPath("/api/auth/me"));
      const userData = await userResponse.json() as { role?: string };

      if (!userResponse.ok) {
        router.push(getAppPath("/login"));
        return;
      }

      // Se não for admin, redirecionar para formulários
      if (userData.role !== "admin") {
        router.push(getAppPath("/forms"));
        return;
      }

      setUser(userData);

      // Se for admin, buscar todos os usuários
      if (userData.role === "admin") {
        const usersResponse = await fetch(getApiPath("/api/users/all"));
        const usersData = await usersResponse.json() as { users?: User[] };
        setAllUsers(usersData.users || []);
      }
    } catch (err) {
      setError("Erro ao carregar dados");
      console.error(err);
      addToast("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  }

  function openEditDialog(currentUser: User) {
    // Impedir edição do próprio usuário
    if (currentUser.id === user?.id) {
      addToast("Você não pode editar sua própria conta", "error");
      return;
    }

    // Impedir edição do admin principal
    if (currentUser.id === "admin-001-unidas") {
      addToast("Não é permitido editar o administrador principal", "error");
      return;
    }

    setEditingUser({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      status: currentUser.status,
    });
    setEditDialogOpen(true);
  }

  function closeEditDialog() {
    setEditingUser(null);
    setEditDialogOpen(false);
  }

  async function saveUserChanges() {
    if (!editingUser) return;

    if (!editingUser.name.trim()) {
      addToast("Nome é obrigatório", "error");
      return;
    }

    setSavingUserId(editingUser.id);
    try {
      const response = await fetch(getApiPath(`/api/users/${editingUser.id}/role`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editingUser.role,
          name: editingUser.name,
          status: editingUser.status,
        }),
      });

      if (response.ok) {
        setAllUsers(
          allUsers.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  role: editingUser.role,
                  name: editingUser.name,
                  status: editingUser.status,
                }
              : u
          )
        );
        closeEditDialog();
        addToast("Usuário atualizado com sucesso", "success");
      } else {
        const errorData = await response.json() as { error?: string };
        addToast(errorData.error || "Erro ao atualizar usuário", "error");
      }
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      addToast("Erro ao atualizar usuário", "error");
    } finally {
      setSavingUserId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-5">
        <h2 className="text-red-600 text-lg">{error}</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-md border-l-4 animate-slide-in ${
              toast.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-primary">Gerenciamento de Usuários</h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-8">
        {user?.role === "admin" ? (
          <div>
            {allUsers.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                <p>Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="px-6 py-4 text-left font-bold text-sm">Nome</th>
                        <th className="px-6 py-4 text-left font-bold text-sm">Email</th>
                        <th className="px-6 py-4 text-left font-bold text-sm">Status</th>
                        <th className="px-6 py-4 text-left font-bold text-sm">Cargo</th>
                        <th className="px-6 py-4 text-center font-bold text-sm">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((currentUser) => (
                        <tr
                          key={currentUser.id}
                          className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {currentUser.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {currentUser.email}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                currentUser.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : currentUser.status === "blocked"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {currentUser.status === "active"
                                ? "Ativo"
                                : currentUser.status === "blocked"
                                ? "Bloqueado"
                                : "Pendente"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                currentUser.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {currentUser.role === "admin" ? "Admin" : "Usuário"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => openEditDialog(currentUser)}
                              disabled={
                                currentUser.id === user?.id ||
                                currentUser.id === "admin-001-unidas"
                              }
                              title={
                                currentUser.id === user?.id
                                  ? "Você não pode editar sua própria conta"
                                  : currentUser.id === "admin-001-unidas"
                                  ? "Não é permitido editar o administrador principal"
                                  : "Editar usuário"
                              }
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-primary hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <EditIcon fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Edit Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        editingUser={editingUser}
        onUserChange={setEditingUser}
        onSave={saveUserChanges}
        savingUserId={savingUserId}
      />
    </div>
  );
}
