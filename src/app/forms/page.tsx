"use client";

import { useState, useEffect } from "react";
import { getApiPath } from "@/src/lib/url";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import EditFormDialog from "@/src/components/EditFormDialog";

interface Form {
  id: string;
  name: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  status: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface EditingFormData {
  id: string;
  name: string;
  createdByName: string;
}

export default function FormsDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<EditingFormData | null>(null);
  const [savingFormId, setSavingFormId] = useState<string | null>(null);
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

      setUser(userData);

      // Buscar todos os formulários
      const formsResponse = await fetch(getApiPath("/api/forms"));
      const formsData = await formsResponse.json() as { forms?: Form[] };
      setAllForms(formsData.forms || []);
    } catch (err) {
      setError("Erro ao carregar dados");
      console.error(err);
      addToast("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  }

  function openEditDialog(currentForm: Form) {
    setEditingForm({
      id: currentForm.id,
      name: currentForm.name,
      createdByName: currentForm.createdByName,
    });
    setEditDialogOpen(true);
  }

  function closeEditDialog() {
    setEditingForm(null);
    setEditDialogOpen(false);
  }

  async function saveFormChanges() {
    if (!editingForm) return;

    if (!editingForm.name.trim()) {
      addToast("Nome do formulário é obrigatório", "error");
      return;
    }

    setSavingFormId(editingForm.id);
    try {
      const response = await fetch(getApiPath(`/api/forms/${editingForm.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingForm.name }),
      });

      if (response.ok) {
        setAllForms(
          allForms.map((f) =>
            f.id === editingForm.id
              ? { ...f, name: editingForm.name }
              : f
          )
        );
        closeEditDialog();
        addToast("Formulário atualizado com sucesso", "success");
      } else {
        const errorData = await response.json() as { error?: string };
        addToast(errorData.error || "Erro ao atualizar formulário", "error");
      }
    } catch (err) {
      console.error("Erro ao atualizar formulário:", err);
      addToast("Erro ao atualizar formulário", "error");
    } finally {
      setSavingFormId(null);
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
        <div className="px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Formulários</h1>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
            <AddIcon fontSize="small" />
            Novo Formulário
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-8">
        {allForms.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            <p>Nenhum formulário encontrado</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="px-6 py-4 text-left font-bold text-sm">Nome</th>
                    <th className="px-6 py-4 text-left font-bold text-sm">ID</th>
                    <th className="px-6 py-4 text-left font-bold text-sm">Criado por</th>
                    <th className="px-6 py-4 text-left font-bold text-sm">Data de Criação</th>
                    <th className="px-6 py-4 text-center font-bold text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {allForms.map((form) => (
                    <tr
                      key={form.id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {form.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                        {form.id}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {form.createdByName}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(form.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openEditDialog(form)}
                          title="Editar formulário"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-primary hover:bg-blue-200 transition-colors cursor-pointer"
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

      {/* Edit Dialog */}
      <EditFormDialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        editingForm={editingForm}
        onFormChange={setEditingForm}
        onSave={saveFormChanges}
        savingFormId={savingFormId}
      />
    </div>
  );
}
