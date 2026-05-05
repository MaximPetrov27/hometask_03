import type { BlogDocument } from "../../../db/documents";
import type { BlogView } from "../types/blog";

export function toBlogView(doc: BlogDocument): BlogView {
  const created =
    doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt);
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    websiteUrl: doc.websiteUrl,
    createdAt: created.toISOString(),
    isMembership: doc.isMembership,
  };
}
