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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  articleCategoryOptions,
  type Article,
  type Media,
  type ProjectUpdate,
  type SiteSettings,
  type SupportLink,
} from "@/lib/content";
import { SiteSettingsPanel } from "./site-settings-panel";

type Props = {
  initialArticles: Article[];
  initialUpdates: ProjectUpdate[];
  initialMedia: Media[];
  initialSupportLinks: SupportLink[];
  initialSettings: SiteSettings;
};

type ApiError = { error?: string };

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as ApiError;
  return body.error ?? "Une erreur est survenue. Réessayez dans un instant.";
}

function mediaChoiceLabel(item: Media): string {
  return item.caption || item.altText || item.fileName;
}

function MediaSelect({
  defaultValue = null,
  description,
  label,
  media,
  name,
}: {
  defaultValue?: string | null;
  description: string;
  label: string;
  media: Media[];
  name: string;
}) {
  return (
    <label>
      {label}
      <select defaultValue={defaultValue ?? ""} name={name}>
        <option value="">Aucune image</option>
        {media.map((item) => (
          <option key={item.id} value={item.id}>
            {mediaChoiceLabel(item)} · {item.fileName}
          </option>
        ))}
      </select>
      <small>{description}</small>
    </label>
  );
}

function ArticleCategoryField({
  defaultValue = "Atelier & préparation",
}: {
  defaultValue?: string;
}) {
  return (
    <label>
      Catégorie
      <input
        defaultValue={defaultValue}
        list="article-category-suggestions"
        maxLength={80}
        name="category"
        required
      />
      <small>Choisissez une suggestion ou créez votre propre rubrique.</small>
    </label>
  );
}

export function AdminDashboard({
  initialArticles,
  initialUpdates,
  initialMedia,
  initialSupportLinks,
  initialSettings,
}: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const [updates, setUpdates] = useState(initialUpdates);
  const [media, setMedia] = useState(initialMedia);
  const [supportLinks, setSupportLinks] = useState(initialSupportLinks);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  async function submitArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const payload = {
      title: fields.get("title"),
      category: fields.get("category"),
      excerpt: fields.get("excerpt"),
      content: fields.get("content"),
      coverMediaId: fields.get("coverMediaId"),
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
          ? "L’article est en ligne dans les actualités."
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
      setEditingLinkId(null);
      setNotice("Le bouton de soutien a été supprimé.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de supprimer ce bouton.");
    } finally {
      setBusy(null);
    }
  }

  async function updateArticle(
    event: FormEvent<HTMLFormElement>,
    article: Article,
  ) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const payload = {
      title: fields.get("title"),
      category: fields.get("category"),
      excerpt: fields.get("excerpt"),
      content: fields.get("content"),
      coverMediaId: fields.get("coverMediaId"),
      publish: fields.get("publish") === "on",
    };

    setBusy("article-edit");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { article: Article };
      setArticles((items) =>
        items.map((item) => (item.id === article.id ? result.article : item)),
      );
      setEditingArticleId(null);
      setNotice("L’article a été mis à jour.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de modifier cet article.");
    } finally {
      setBusy(null);
    }
  }

  async function removeArticle(article: Article) {
    setBusy("article-remove");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      setArticles((items) => items.filter((item) => item.id !== article.id));
      setEditingArticleId(null);
      setNotice("L’article a été supprimé.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de supprimer cet article.");
    } finally {
      setBusy(null);
    }
  }

  async function updateProjectUpdate(
    event: FormEvent<HTMLFormElement>,
    update: ProjectUpdate,
  ) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const payload = {
      period: fields.get("period"),
      title: fields.get("title"),
      summary: fields.get("summary"),
      status: fields.get("status"),
      position: fields.get("position"),
      imageMediaId: fields.get("imageMediaId"),
    };

    setBusy("update-edit");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/updates/${update.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { update: ProjectUpdate };
      setUpdates((items) =>
        items
          .map((item) => (item.id === update.id ? result.update : item))
          .sort((left, right) => left.position - right.position),
      );
      setEditingUpdateId(null);
      setNotice("L’avancée du projet a été mise à jour.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de modifier cette avancée.");
    } finally {
      setBusy(null);
    }
  }

  async function removeProjectUpdate(update: ProjectUpdate) {
    setBusy("update-remove");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/updates/${update.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      setUpdates((items) => items.filter((item) => item.id !== update.id));
      setEditingUpdateId(null);
      setNotice("L’avancée du projet a été supprimée.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de supprimer cette avancée.");
    } finally {
      setBusy(null);
    }
  }

  async function updateMedia(event: FormEvent<HTMLFormElement>, item: Media) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const payload = {
      altText: fields.get("altText"),
      caption: fields.get("caption"),
    };

    setBusy("media-edit");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/media/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { media: Media };
      setMedia((items) =>
        items.map((mediaItem) => (mediaItem.id === item.id ? result.media : mediaItem)),
      );
      setEditingMediaId(null);
      setNotice("Les informations de l’image ont été mises à jour.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de modifier cette image.");
    } finally {
      setBusy(null);
    }
  }

  async function removeMedia(item: Media) {
    setBusy("media-remove");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/media/${item.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as {
        unlinked?: { articles?: number; updates?: number };
      };
      setMedia((items) => items.filter((mediaItem) => mediaItem.id !== item.id));
      setArticles((items) =>
        items.map((article) =>
          article.coverMediaId === item.id
            ? { ...article, coverMediaId: null }
            : article,
        ),
      );
      setUpdates((items) =>
        items.map((update) =>
          update.imageMediaId === item.id
            ? { ...update, imageMediaId: null }
            : update,
        ),
      );
      setEditingMediaId(null);
      const unlinkedCount =
        (result.unlinked?.articles ?? 0) + (result.unlinked?.updates ?? 0);
      setNotice(
        unlinkedCount
          ? `L’image a été supprimée et retirée de ${unlinkedCount} contenu${unlinkedCount > 1 ? "s" : ""}.`
          : "L’image a été supprimée de la galerie.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de supprimer cette image.");
    } finally {
      setBusy(null);
    }
  }

  async function updateSupportLink(
    event: FormEvent<HTMLFormElement>,
    link: SupportLink,
  ) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const payload = {
      provider: fields.get("provider"),
      label: fields.get("label"),
      url: fields.get("url"),
      position: fields.get("position"),
      isActive: fields.get("isActive") === "on",
    };

    setBusy("link-edit");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/links/${link.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { link: SupportLink };
      setSupportLinks((items) =>
        items
          .map((item) => (item.id === link.id ? result.link : item))
          .sort((left, right) => left.position - right.position),
      );
      setEditingLinkId(null);
      setNotice("Le bouton de soutien a été mis à jour.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de modifier ce bouton.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <datalist id="article-category-suggestions">
        {articleCategoryOptions.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
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

      <Tabs defaultValue="site">
        <TabsList className="admin-tabs-list" aria-label="Contenus à gérer">
          <TabsTrigger className="admin-tabs-trigger" value="site">
            Site & équipage
          </TabsTrigger>
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

        <TabsContent className="admin-panel" value="site">
          <SiteSettingsPanel initialSettings={initialSettings} media={media} />
        </TabsContent>

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
                <ArticleCategoryField />
                <MediaSelect
                  description={
                    media.length
                      ? "Choisissez une image déjà importée pour illustrer la carte et l’article."
                      : "Importez d’abord une image dans l’onglet Galerie & médias."
                  }
                  label="Image de couverture"
                  media={media}
                  name="coverMediaId"
                />
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
                  {articles.map((article) => (
                    <li className="admin-list-item" key={article.id}>
                      <div>
                        <strong>{article.title}</strong>
                        <small>{article.category}</small>
                      </div>
                      <div className="admin-link-entry-actions">
                        <Dialog
                          onOpenChange={(open) => setEditingArticleId(open ? article.id : null)}
                          open={editingArticleId === article.id}
                        >
                          <DialogTrigger asChild>
                            <button className="admin-link-toggle" disabled={busy !== null} type="button">
                              Modifier
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Modifier l’article</DialogTitle>
                              <DialogDescription>
                                Corrigez le contenu ou choisissez de publier l’article.
                              </DialogDescription>
                            </DialogHeader>
                            <form className="admin-form" onSubmit={(event) => updateArticle(event, article)}>
                              <label>
                                Titre
                                <input defaultValue={article.title} maxLength={140} name="title" required />
                              </label>
                              <ArticleCategoryField defaultValue={article.category} />
                              <MediaSelect
                                defaultValue={article.coverMediaId}
                                description="Laissez “Aucune image” pour retirer la couverture de cet article."
                                label="Image de couverture"
                                media={media}
                                name="coverMediaId"
                              />
                              <label>
                                Chapô
                                <textarea defaultValue={article.excerpt} maxLength={380} name="excerpt" required />
                              </label>
                              <label>
                                Contenu
                                <textarea defaultValue={article.content} maxLength={12000} name="content" />
                              </label>
                              <label className="admin-check">
                                <input defaultChecked={article.status === "published"} name="publish" type="checkbox" />
                                Publier l’article
                              </label>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <button className="admin-link-toggle" disabled={busy !== null} type="button">Annuler</button>
                                </DialogClose>
                                <button className="admin-submit" disabled={busy !== null} type="submit">
                                  {busy === "article-edit" ? "Enregistrement…" : "Enregistrer"}
                                </button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button aria-label={`Supprimer ${article.title}`} className="admin-link-remove" disabled={busy !== null} type="button">×</button>
                          </AlertDialogTrigger>
                          <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                « {article.title} » disparaîtra définitivement des actualités.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction className="admin-dialog-action" disabled={busy !== null} onClick={() => removeArticle(article)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <span className="admin-pill">
                          {article.status === "published" ? "Publié" : "Brouillon"}
                        </span>
                      </div>
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
                <MediaSelect
                  description={
                    media.length
                      ? "Cette image sera affichée dans la frise et les aperçus de l’avancée."
                      : "Importez d’abord une image dans l’onglet Galerie & médias."
                  }
                  label="Image associée"
                  media={media}
                  name="imageMediaId"
                />
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
                  {updates.map((update) => (
                    <li className="admin-list-item" key={update.id}>
                      <div>
                        <strong>{update.title}</strong>
                        <small>{update.period}</small>
                      </div>
                      <div className="admin-link-entry-actions">
                        <Dialog
                          onOpenChange={(open) => setEditingUpdateId(open ? update.id : null)}
                          open={editingUpdateId === update.id}
                        >
                          <DialogTrigger asChild>
                            <button className="admin-link-toggle" disabled={busy !== null} type="button">
                              Modifier
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Modifier l’avancée</DialogTitle>
                              <DialogDescription>
                                Ajustez la période, le statut et l’ordre d’affichage de la frise.
                              </DialogDescription>
                            </DialogHeader>
                            <form className="admin-form" onSubmit={(event) => updateProjectUpdate(event, update)}>
                              <div className="admin-form-row">
                                <label>
                                  Période
                                  <input defaultValue={update.period} maxLength={50} name="period" required />
                                </label>
                                <label>
                                  Position
                                  <input defaultValue={update.position} max="9999" min="0" name="position" type="number" />
                                </label>
                              </div>
                              <label>
                                Titre
                                <input defaultValue={update.title} maxLength={140} name="title" required />
                              </label>
                              <label>
                                Résumé
                                <textarea defaultValue={update.summary} maxLength={650} name="summary" required />
                              </label>
                              <label>
                                Statut
                                <select defaultValue={update.status} name="status">
                                  <option value="upcoming">À venir</option>
                                  <option value="current">En cours</option>
                                  <option value="complete">Terminé</option>
                                </select>
                              </label>
                              <MediaSelect
                                defaultValue={update.imageMediaId}
                                description="Laissez “Aucune image” pour retirer l’illustration de cette avancée."
                                label="Image associée"
                                media={media}
                                name="imageMediaId"
                              />
                              <DialogFooter>
                                <DialogClose asChild>
                                  <button className="admin-link-toggle" disabled={busy !== null} type="button">Annuler</button>
                                </DialogClose>
                                <button className="admin-submit" disabled={busy !== null} type="submit">
                                  {busy === "update-edit" ? "Enregistrement…" : "Enregistrer"}
                                </button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button aria-label={`Supprimer ${update.title}`} className="admin-link-remove" disabled={busy !== null} type="button">×</button>
                          </AlertDialogTrigger>
                          <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette avancée ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                « {update.title} » disparaîtra de la frise du projet.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction className="admin-dialog-action" disabled={busy !== null} onClick={() => removeProjectUpdate(update)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <span className="admin-pill">
                          {update.status === "current"
                            ? "En cours"
                            : update.status === "complete"
                              ? "Terminé"
                              : "À venir"}
                        </span>
                      </div>
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
                  {media.map((item) => (
                    <li className="admin-list-item" key={item.id}>
                      <div className="admin-media-preview">
                        <img src={`/api/media/${item.id}`} alt="" />
                        <div>
                          <strong>{item.caption || item.fileName}</strong>
                          <small>{item.altText}</small>
                        </div>
                      </div>
                      <div className="admin-link-entry-actions">
                        <Dialog
                          onOpenChange={(open) => setEditingMediaId(open ? item.id : null)}
                          open={editingMediaId === item.id}
                        >
                          <DialogTrigger asChild>
                            <button className="admin-link-toggle" disabled={busy !== null} type="button">
                              Modifier
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
                            <DialogHeader>
                              <DialogTitle>Modifier l’image</DialogTitle>
                              <DialogDescription>
                                Le texte alternatif rend la galerie accessible à tous les visiteurs.
                              </DialogDescription>
                            </DialogHeader>
                            <form className="admin-form" onSubmit={(event) => updateMedia(event, item)}>
                              <label>
                                Texte alternatif
                                <input defaultValue={item.altText} maxLength={220} name="altText" required />
                              </label>
                              <label>
                                Légende
                                <textarea defaultValue={item.caption} maxLength={380} name="caption" />
                              </label>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <button className="admin-link-toggle" disabled={busy !== null} type="button">Annuler</button>
                                </DialogClose>
                                <button className="admin-submit" disabled={busy !== null} type="submit">
                                  {busy === "media-edit" ? "Enregistrement…" : "Enregistrer"}
                                </button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button aria-label={`Supprimer ${item.caption || item.fileName}`} className="admin-link-remove" disabled={busy !== null} type="button">×</button>
                          </AlertDialogTrigger>
                          <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette image sera retirée définitivement de la galerie et du stockage.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction className="admin-dialog-action" disabled={busy !== null} onClick={() => removeMedia(item)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <span className="admin-pill">Image</span>
                      </div>
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
                          <Dialog
                            onOpenChange={(open) => setEditingLinkId(open ? link.id : null)}
                            open={editingLinkId === link.id}
                          >
                            <DialogTrigger asChild>
                              <button className="admin-link-toggle" disabled={busy !== null} type="button">
                                Modifier
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
                              <DialogHeader>
                                <DialogTitle>Modifier le bouton de soutien</DialogTitle>
                                <DialogDescription>
                                  Le bouton sera mis à jour partout où il apparaît sur le site.
                                </DialogDescription>
                              </DialogHeader>
                              <form className="admin-form" onSubmit={(event) => updateSupportLink(event, link)}>
                                <div className="admin-form-row">
                                  <label>
                                    Plateforme
                                    <select defaultValue={link.provider} name="provider">
                                      <option value="helloasso">HelloAsso</option>
                                      <option value="tipeee">Tipeee</option>
                                      <option value="other">Autre lien</option>
                                    </select>
                                  </label>
                                  <label>
                                    Ordre d’affichage
                                    <input defaultValue={link.position} max="9999" min="0" name="position" type="number" />
                                  </label>
                                </div>
                                <label>
                                  Libellé du bouton
                                  <input defaultValue={link.label} maxLength={100} name="label" required />
                                </label>
                                <label>
                                  URL de destination
                                  <input defaultValue={link.url} maxLength={1500} name="url" required type="url" />
                                </label>
                                <label className="admin-check">
                                  <input defaultChecked={link.isActive} name="isActive" type="checkbox" />
                                  Afficher ce bouton
                                </label>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <button className="admin-link-toggle" disabled={busy !== null} type="button">Annuler</button>
                                  </DialogClose>
                                  <button className="admin-submit" disabled={busy !== null} type="submit">
                                    {busy === "link-edit" ? "Enregistrement…" : "Enregistrer"}
                                  </button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
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
