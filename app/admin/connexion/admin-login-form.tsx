"use client";

import { useState, type FormEvent } from "react";

type Props = {
  returnTo: string;
};

type LoginResponse = {
  error?: string;
  returnTo?: string;
};

export function AdminLoginForm({ returnTo }: Props) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: fields.get("username"),
          password: fields.get("password"),
          returnTo,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as LoginResponse;
      if (!response.ok) throw new Error(payload.error || "Connexion impossible.");
      window.location.assign(payload.returnTo || "/admin");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Connexion impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <label>
        Identifiant
        <input
          autoCapitalize="none"
          autoComplete="username"
          name="username"
          placeholder="baptiste ou maxence"
          required
        />
      </label>
      <label>
        Mot de passe
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      {error ? <p className="admin-login-error" role="alert">{error}</p> : null}
      <button className="admin-submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Connexion…" : "Ouvrir le tableau de bord"}
      </button>
    </form>
  );
}
