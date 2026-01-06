"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: "500px",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}>
        <h1 style={{
          fontSize: "72px",
          fontWeight: 700,
          margin: "0 0 20px 0",
          color: "#f44",
        }}>
          403
        </h1>
        <h2 style={{
          fontSize: "24px",
          fontWeight: 600,
          margin: "0 0 15px 0",
        }}>
          Acesso Negado
        </h2>
        <p style={{
          fontSize: "16px",
          color: "#666",
          margin: "0 0 30px 0",
        }}>
          Você não tem permissão para acessar esta página. Sua conta pode estar aguardando aprovação de um administrador.
        </p>
        <Link href="/login" style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "#146ef5",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
          fontWeight: 600,
        }}>
          Voltar para Login
        </Link>
      </div>
    </div>
  );
}
