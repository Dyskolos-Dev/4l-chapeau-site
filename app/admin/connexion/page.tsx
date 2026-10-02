/* eslint-disable @next/next/no-html-link-for-pages -- Vinext's Link shim blocks native navigation in this deployment. */

import { redirect } from "next/navigation";
import { getCurrentAdminUser, safeAdminReturnPath } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/content-repository";
import { AdminLoginForm } from "./admin-login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const [user, params, settings] = await Promise.all([
    getCurrentAdminUser(),
    searchParams,
    getSiteSettings(),
  ]);
  if (user) redirect("/admin");

  const returnTo = safeAdminReturnPath(params.return_to);

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <a className="admin-login-brand" href="/" aria-label={`Retour à l’accueil ${settings.identity.associationName}`}>
          <span>{settings.branding.mark || "4L"}</span> {settings.identity.associationName}
        </a>
        <p className="eyebrow">Portail équipage</p>
        <h1>On prend le volant&nbsp;?</h1>
        <p>
          Cet espace est réservé à {settings.identity.team.map((member) => member.name).join(" et ")} pour piloter les contenus de l’association.
        </p>
        <AdminLoginForm returnTo={returnTo} />
        <a className="admin-public-link" href="/">Retour au site</a>
      </section>
    </main>
  );
}
