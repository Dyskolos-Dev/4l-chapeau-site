import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getAdminContent } from "@/lib/content-repository";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [user, content] = await Promise.all([
    requireChatGPTUser("/admin"),
    getAdminContent(),
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
            <a className="admin-public-link" href="/">
              Voir le site
            </a>
            <span className="admin-user" title={user.email}>
              Connecté·e : {user.displayName}
            </span>
          </div>
        </div>
        <AdminDashboard
          initialArticles={content.articles}
          initialMedia={content.media}
          initialUpdates={content.updates}
        />
      </div>
    </main>
  );
}
