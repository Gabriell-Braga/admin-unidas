"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

interface EditingUserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "pending" | "active" | "blocked";
}

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  editingUser: EditingUserData | null;
  onUserChange: (user: EditingUserData) => void;
  onSave: () => void;
  savingUserId: string | null;
}

export default function EditUserDialog({
  open,
  onClose,
  editingUser,
  onUserChange,
  onSave,
  savingUserId,
}: EditUserDialogProps) {
  if (!editingUser) return null;

  const isLoading = savingUserId === editingUser.id;

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
        Editar Usuário
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
            label="Nome"
            value={editingUser.name}
            onChange={(e) =>
              onUserChange({ ...editingUser, name: e.target.value })
            }
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="Email"
            value={editingUser.email}
            disabled
            helperText="Email não pode ser alterado"
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Cargo
            </Typography>
            <Select
              fullWidth
              value={editingUser.role}
              onChange={(e) =>
                onUserChange({
                  ...editingUser,
                  role: e.target.value as "admin" | "user",
                })
              }
              disabled={isLoading}
            >
              <MenuItem value="user">Usuário</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Status
            </Typography>
            <Select
              fullWidth
              value={editingUser.status}
              onChange={(e) =>
                onUserChange({
                  ...editingUser,
                  status: e.target.value as "pending" | "active" | "blocked",
                })
              }
              disabled={isLoading}
            >
              <MenuItem value="pending">Pendente</MenuItem>
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="blocked">Bloqueado</MenuItem>
            </Select>
          </Box>
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
