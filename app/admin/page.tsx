import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-auth";
import {
  ensureCmsStarterContent,
  getAdminContent,
  getSiteSettings,
} from "@/lib/content-repository";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdminUser("/admin");
  await ensureCmsStarterContent();
  const [content, settings] = await Promise.all([
    getAdminContent(),
    getSiteSettings(),
  ]);

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-topbar">
          <div>
            <p className="eyebrow">4L CHAPEAU · Administration</p>
            <h1>Le tableau de bord.</h1>
          </div>
          <div className="admin-topbar-actions">
            <Link className="admin-public-link" href="/">
              Voir le site
            </Link>
            <span className="admin-user">Connecté : {user.displayName}</span>
            <form action="/api/admin/auth/logout" method="post">
              <button className="admin-logout" type="submit">Se déconnecter</button>
            </form>
          </div>
        </div>
        <AdminDashboard
          initialArticles={content.articles}
          initialMedia={content.media}
          initialUpdates={content.updates}
          initialSupportLinks={content.supportLinks}
          initialSettings={settings}
        />
      </div>
    </main>
  );
}
