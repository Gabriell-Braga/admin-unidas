"use client";

import { useState, FormEvent } from "react";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { getApiPath } from "@/src/lib/url";
import Link from "next/link";
import { getAppPath } from "@/src/lib/url";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.endsWith("@unidas.com.br")) {
      setError("Use um email com domínio @unidas.com.br");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiPath("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        setError(data.error || "Erro ao registrar");
        return;
      }

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push(getAppPath("/login"));
      }, 2000);
    } catch (err) {
      setError("Erro ao conectar ao servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="mb-6 flex justify-center">
          <img
            src="https://cdn.prod.website-files.com/6865244132669bb89826a742/690207961fe09cf80bda3e99_Institucional.svg"
            alt="Logo"
            className="h-10 w-auto"
          />
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="label-base">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-primary"
              placeholder="Seu nome"
            />
          </div>

          <div className="form-group">
            <label className="label-base">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-primary"
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label className="label-base">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-primary"
                placeholder="••••••••"
                style={{ paddingRight: 40 }}
              />
              <IconButton
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: 0
                }}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </div>
          </div>

          <div className="form-group">
            <label className="label-base">Confirmar Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-primary"
                placeholder="••••••••"
                style={{ paddingRight: 40 }}
              />
              <IconButton
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: 0
                }}
                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Já tem conta?{" "}
            <Link href={getAppPath("/login")} className="auth-link">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}