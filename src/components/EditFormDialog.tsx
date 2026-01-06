"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

interface EditingFormData {
  id: string;
  name: string;
  createdByName: string;
}

interface EditFormDialogProps {
  open: boolean;
  onClose: () => void;
  editingForm: EditingFormData | null;
  onFormChange: (form: EditingFormData) => void;
  onSave: () => void;
  savingFormId: string | null;
}

export default function EditFormDialog({
  open,
  onClose,
  editingForm,
  onFormChange,
  onSave,
  savingFormId,
}: EditFormDialogProps) {
  if (!editingForm) return null;

  const isLoading = savingFormId === editingForm.id;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#0066C2",
          color: "#fff",
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Editar Formulário
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{ color: "#fff", minWidth: "auto", padding: "4px" }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ paddingTop: "24px !important" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            fullWidth
            label="Nome do Formulário"
            value={editingForm.name}
            onChange={(e) =>
              onFormChange({ ...editingForm, name: e.target.value })
            }
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="ID do Formulário"
            value={editingForm.id}
            disabled
            helperText="ID não pode ser alterado"
          />

          <TextField
            fullWidth
            label="Criado por"
            value={editingForm.createdByName}
            disabled
            helperText="Criador não pode ser alterado"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ cursor: "pointer" }}>
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isLoading}
          sx={{ backgroundColor: "#0066C2", cursor: "pointer" }}
        >
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
