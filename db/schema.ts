import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable(
  "articles",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""),
    category: text("category").notNull().default("Journal de bord"),
    status: text("status").notNull().default("draft"),
    coverMediaId: text("cover_media_id"),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_articles_status_published_at").on(table.status, table.publishedAt),
  ],
);

export const projectUpdates = sqliteTable(
  "project_updates",
  {
    id: text("id").primaryKey(),
    period: text("period").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    status: text("status").notNull().default("upcoming"),
    position: integer("position").notNull().default(0),
    imageMediaId: text("image_media_id"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_project_updates_position").on(table.position),
    index("idx_project_updates_status").on(table.status),
  ],
);

export const media = sqliteTable(
  "media",
  {
    id: text("id").primaryKey(),
    objectKey: text("object_key").notNull().unique(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    altText: text("alt_text").notNull().default(""),
    caption: text("caption").notNull().default(""),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_media_created_at").on(table.createdAt)],
);
