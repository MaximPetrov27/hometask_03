import { blogsCollection } from "../../../db/mongo";
import type { PostDocument } from "../../../db/documents";
import type { PostView } from "../types/post";

function toIso(d: Date): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

export async function toPostView(doc: PostDocument): Promise<PostView> {
  const blog = await blogsCollection().findOne({ id: doc.blogId });
  return {
    id: doc.id,
    title: doc.title,
    shortDescription: doc.shortDescription,
    content: doc.content,
    blogId: doc.blogId,
    blogName: blog?.name ?? "",
    createdAt: toIso(doc.createdAt),
  };
}
