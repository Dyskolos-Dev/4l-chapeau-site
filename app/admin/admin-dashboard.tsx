"use client";

import { useState, type FormEvent } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Article, Media, ProjectUpdate, SupportLink } from "@/lib/content";

type Props = {
  initialArticles: Article[];
  initialUpdates: ProjectUpdate[];
  initialMedia: Media[];
  initialSupportLinks: SupportLink[];
};

type ApiError = { error?: string };

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as ApiError;
  return body.error ?? "Une erreur est survenue. Réessayez dans un instant.";
}

export function AdminDashboard({
  initialArticles,
  initialUpdates,
  initialMedia,
  initialSupportLinks,
}: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const [updates, setUpdates] = useState(initialUpdates);
  const [media, setMedia] = useState(initialMedia);
  const [supportLinks, setSupportLinks] = useState(initialSupportLinks);
  const [busy, setBusy] = useState<
    "article" | "update" | "media" | "link" | "link-toggle" | "link-remove" | null
  >(null);
  const [notice, setNotice] = useState("");

  async function submitArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const payload = {
      title: fields.get("title"),
      category: fields.get("category"),
      excerpt: fields.get("excerpt"),
      content: fields.get("content"),
      publish: fields.get("publish") === "on",
    };

    setBusy("article");
    setNotice("");
    try {
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { article: Article };
      setArticles((items) => [result.article, ...items]);
      form.reset();
      setNotice(
        result.article.status === "published"
          ? "L’article est en ligne sur le journal de bord."
          : "L’article a été enregistré en brouillon.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible d’enregistrer l’article.");
    } finally {
      setBusy(null);
    }
  }

  async function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const payload = Object.fromEntries(fields.entries());

    setBusy("update");
    setNotice("");
    try {
      const response = await fetch("/api/admin/updates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { update: ProjectUpdate };
      setUpdates((items) => [...items, result.update].sort((a, b) => a.position - b.position));
      form.reset();
      setNotice("L’avancée a été ajoutée à la frise du projet.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible d’enregistrer l’avancée.");
    } finally {
      setBusy(null);
    }
  }

  async function submitMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = new FormData(form);

    setBusy("media");
    setNotice("");
    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: payload,
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { media: Media };
      setMedia((items) => [result.media, ...items]);
      form.reset();
      setNotice("L’image est ajoutée à la galerie publique.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible d’importer l’image.");
    } finally {
      setBusy(null);
    }
  }

  async function submitSupportLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const payload = {
      provider: fields.get("provider"),
      label: fields.get("label"),
      url: fields.get("url"),
      position: fields.get("position"),
      isActive: fields.get("isActive") === "on",
    };

    setBusy("link");
    setNotice("");
    try {
      const response = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { link: SupportLink };
      setSupportLinks((items) => [...items, result.link].sort((a, b) => a.position - b.position));
      form.reset();
      setNotice(
        result.link.isActive
          ? "Le bouton de soutien apparaît maintenant sur l’accueil et la page Soutenir."
          : "Le bouton a été enregistré mais reste masqué jusqu’à son activation.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible d’enregistrer ce bouton.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleSupportLink(link: SupportLink) {
    setBusy("link-toggle");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/links/${link.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !link.isActive }),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { link: SupportLink };
      setSupportLinks((items) => items.map((item) => item.id === link.id ? result.link : item));
      setNotice(result.link.isActive ? "Le bouton est visible sur le site." : "Le bouton est désormais masqué.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de modifier ce bouton.");
    } finally {
      setBusy(null);
    }
  }

  async function removeSupportLink(link: SupportLink) {
    setBusy("link-remove");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/links/${link.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await errorMessage(response));
      setSupportLinks((items) => items.filter((item) => item.id !== link.id));
      setNotice("Le bouton de soutien a été supprimé.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de supprimer ce bouton.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <section className="admin-stats" aria-label="Vue d’ensemble">
        <article className="admin-stat">
          <span>Articles enregistrés</span>
          <strong>{articles.length}</strong>
        </article>
        <article className="admin-stat">
          <span>Étapes de projet</span>
          <strong>{updates.length}</strong>
        </article>
        <article className="admin-stat">
          <span>Images dans la galerie</span>
          <strong>{media.length}</strong>
        </article>
        <article className="admin-stat">
          <span>Boutons de soutien</span>
          <strong>{supportLinks.filter((link) => link.isActive).length}</strong>
        </article>
      </section>

      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <Tabs defaultValue="articles">
        <TabsList className="admin-tabs-list" aria-label="Contenus à gérer">
          <TabsTrigger className="admin-tabs-trigger" value="articles">
            Journal de bord
          </TabsTrigger>
          <TabsTrigger className="admin-tabs-trigger" value="updates">
            Avancées du projet
          </TabsTrigger>
          <TabsTrigger className="admin-tabs-trigger" value="media">
            Galerie & médias
          </TabsTrigger>
          <TabsTrigger className="admin-tabs-trigger" value="support">
            Soutiens & boutons
          </TabsTrigger>
        </TabsList>

        <TabsContent className="admin-panel" value="articles">
          <div className="admin-panel-grid">
            <section className="admin-card">
              <h2>Nouvel article</h2>
              <p>Publiez une nouvelle de l’atelier, d’un essai ou d’un événement.</p>
              <form className="admin-form" onSubmit={submitArticle}>
                <label>
                  Titre
                  <input name="title" maxLength={140} required />
                </label>
                <label>
                  Catégorie
                  <input name="category" defaultValue="Journal de bord" maxLength={80} />
                </label>
                <label>
                  Chapô
                  <textarea name="excerpt" maxLength={380} required />
                </label>
                <label>
                  Contenu
                  <textarea name="content" maxLength={12000} placeholder="Le détail de la nouvelle…" />
                </label>
                <label className="admin-check">
                  <input name="publish" type="checkbox" defaultChecked />
                  Publier immédiatement
                </label>
                <button className="admin-submit" disabled={busy !== null} type="submit">
                  {busy === "article" ? "Enregistrement…" : "Ajouter l’article"}
                </button>
              </form>
            </section>
            <section className="admin-card">
              <h2>Derniers articles</h2>
              {!articles.length ? (
                <p className="admin-empty">Aucun article ajouté pour l’instant.</p>
              ) : (
                <ul className="admin-list">
                  {articles.slice(0, 8).map((article) => (
                    <li className="admin-list-item" key={article.id}>
                      <div>
                        <strong>{article.title}</strong>
                        <small>{article.category}</small>
                      </div>
                      <span className="admin-pill">
                        {article.status === "published" ? "Publié" : "Brouillon"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </TabsContent>

        <TabsContent className="admin-panel" value="updates">
          <div className="admin-panel-grid">
            <section className="admin-card">
              <h2>Ajouter une avancée</h2>
              <p>Faites évoluer la frise visible sur la page d’accueil.</p>
              <form className="admin-form" onSubmit={submitUpdate}>
                <div className="admin-form-row">
                  <label>
                    Période
                    <input name="period" placeholder="Octobre 2026" maxLength={50} required />
                  </label>
                  <label>
                    Position
                    <input name="position" type="number" defaultValue="100" min="0" max="9999" />
                  </label>
                </div>
                <label>
                  Titre
                  <input name="title" maxLength={140} required />
                </label>
                <label>
                  Résumé
                  <textarea name="summary" maxLength={650} required />
                </label>
                <label>
                  Statut
                  <select name="status" defaultValue="upcoming">
                    <option value="upcoming">À venir</option>
                    <option value="current">En cours</option>
                    <option value="complete">Terminé</option>
                  </select>
                </label>
                <button className="admin-submit" disabled={busy !== null} type="submit">
                  {busy === "update" ? "Enregistrement…" : "Ajouter l’avancée"}
                </button>
              </form>
            </section>
            <section className="admin-card">
              <h2>Frise actuelle</h2>
              {!updates.length ? (
                <p className="admin-empty">Les jalons de départ restent affichés tant qu’aucune avancée n’est ajoutée.</p>
              ) : (
                <ul className="admin-list">
                  {updates.slice(0, 10).map((update) => (
                    <li className="admin-list-item" key={update.id}>
                      <div>
                        <strong>{update.title}</strong>
                        <small>{update.period}</small>
                      </div>
                      <span className="admin-pill">
                        {update.status === "current"
                          ? "En cours"
                          : update.status === "complete"
                            ? "Terminé"
                            : "À venir"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </TabsContent>

        <TabsContent className="admin-panel" value="media">
          <div className="admin-panel-grid">
            <section className="admin-card">
              <h2>Ajouter une image</h2>
              <p>JPG, PNG, WebP ou AVIF, jusqu’à 8 Mo. Le texte alternatif est obligatoire.</p>
              <form className="admin-form" onSubmit={submitMedia}>
                <label>
                  Fichier image
                  <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
                </label>
                <label>
                  Texte alternatif
                  <input name="altText" maxLength={220} placeholder="Décrivez l’image pour tous les visiteurs" required />
                </label>
                <label>
                  Légende
                  <textarea name="caption" maxLength={380} placeholder="Facultatif" />
                </label>
                <button className="admin-submit" disabled={busy !== null} type="submit">
                  {busy === "media" ? "Import en cours…" : "Ajouter à la galerie"}
                </button>
              </form>
            </section>
            <section className="admin-card">
              <h2>Images importées</h2>
              {!media.length ? (
                <p className="admin-empty">Les images que vous importerez apparaîtront ici et dans la galerie publique.</p>
              ) : (
                <ul className="admin-list">
                  {media.slice(0, 8).map((item) => (
                    <li className="admin-list-item" key={item.id}>
                      <div className="admin-media-preview">
                        <img src={`/api/media/${item.id}`} alt="" />
                        <div>
                          <strong>{item.caption || item.fileName}</strong>
                          <small>{item.altText}</small>
                        </div>
                      </div>
                      <span className="admin-pill">Image</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </TabsContent>

        <TabsContent className="admin-panel" value="support">
          <div className="admin-panel-grid">
            <section className="admin-card">
              <h2>Ajouter un bouton de soutien</h2>
              <p>Publiez un lien HelloAsso, Tipeee ou partenaire. Les boutons actifs apparaissent directement sur l’accueil.</p>
              <form className="admin-form" onSubmit={submitSupportLink}>
                <div className="admin-form-row">
                  <label>
                    Plateforme
                    <select name="provider" defaultValue="helloasso">
                      <option value="helloasso">HelloAsso</option>
                      <option value="tipeee">Tipeee</option>
                      <option value="other">Autre lien</option>
                    </select>
                  </label>
                  <label>
                    Ordre d’affichage
                    <input name="position" type="number" defaultValue="100" min="0" max="9999" />
                  </label>
                </div>
                <label>
                  Libellé du bouton
                  <input name="label" maxLength={100} placeholder="Soutenir notre 4L" required />
                </label>
                <label>
                  URL de destination
                  <input name="url" type="url" maxLength={1500} placeholder="https://www.helloasso.com/..." required />
                </label>
                <label className="admin-check">
                  <input name="isActive" type="checkbox" defaultChecked />
                  Afficher ce bouton tout de suite
                </label>
                <button className="admin-submit" disabled={busy !== null} type="submit">
                  {busy === "link" ? "Publication…" : "Ajouter le bouton"}
                </button>
              </form>
            </section>
            <section className="admin-card">
              <h2>Boutons publiés</h2>
              {!supportLinks.length ? (
                <p className="admin-empty">Ajoutez ici les liens de soutien qui doivent apparaître sur le site.</p>
              ) : (
                <ul className="admin-list">
                  {supportLinks.map((link) => (
                    <li className="admin-list-item" key={link.id}>
                      <div className="admin-link-entry">
                        <div className="admin-link-entry-main">
                          <strong>{link.label}</strong>
                          <small>{link.provider === "helloasso" ? "HelloAsso" : link.provider === "tipeee" ? "Tipeee" : "Autre lien"} · position {link.position}</small>
                          <a href={link.url} rel="noopener noreferrer" target="_blank">{link.url}</a>
                        </div>
                        <div className="admin-link-entry-actions">
                          <button
                            className={cn("admin-link-toggle", !link.isActive && "is-off")}
                            disabled={busy !== null}
                            onClick={() => toggleSupportLink(link)}
                            type="button"
                          >
                            {link.isActive ? "Visible" : "Masqué"}
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button aria-label={`Supprimer ${link.label}`} className="admin-link-remove" disabled={busy !== null} type="button">×</button>
                            </AlertDialogTrigger>
                            <AlertDialogContent size="sm">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce bouton ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  « {link.label} » disparaîtra des pages publiques et de cette liste.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction className="admin-dialog-action" onClick={() => removeSupportLink(link)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <span className="admin-pill">{link.isActive ? "Actif" : "Masqué"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
