import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getD1(): D1Database {
  if (!env.DB) {
    throw new Error(
      "La base de données est indisponible. Vérifiez la liaison D1 du site.",
    );
  }

  return env.DB;
}

export function getBucket(): R2Bucket {
  if (!env.BUCKET) {
    throw new Error(
      "Le stockage des images est indisponible. Vérifiez la liaison R2 du site.",
    );
  }

  return env.BUCKET;
}

export function getDb() {
  return drizzle(getD1(), { schema });
}
