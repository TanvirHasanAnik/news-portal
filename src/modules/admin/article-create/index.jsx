import React from "react";
import { getDynamicCategoriesWithSubcategories } from "@/repositories/categoryRepository";
import {
  getRecentArticles,
  getArticleById,
  getArticleBySlug,
  mapDbArticleToFrontend,
} from "@/repositories/articleRepository";
import {
  ArticleCreateHeader,
  ArticleCreateForm,
  RecentArticlesList,
} from "./components";
import { isLowerRole } from "@/config/roles";

/**
 * Single-Purpose Module: Article Creation & Editing
 * Server Component that resolves edit target (if editId provided), enforces RBAC,
 * and renders the article creation/editing form with audit tracking.
 */
export default async function ArticleCreateModule({ currentUser, searchParams }) {
  const isLower = isLowerRole(currentUser?.role);
  const editId = searchParams?.editId;

  let initialArticle = null;
  let isUnauthorizedEdit = false;

  if (editId) {
    try {
      const rawArticle = (await getArticleById(editId)) || (await getArticleBySlug(editId));
      if (rawArticle) {
        if (currentUser?.role === "reporter") {
          const isAuthor =
            rawArticle.author_id === currentUser?.id ||
            rawArticle.created_by === currentUser?.username;
          if (!isAuthor) {
            isUnauthorizedEdit = true;
          }
        } else if (currentUser?.role === "sub_editor") {
          const isAuthor =
            rawArticle.author_id === currentUser?.id ||
            rawArticle.created_by === currentUser?.username;
          const isReporterSubmitted =
            (rawArticle.status === "pending" || rawArticle.status === "pending_approval") &&
            (rawArticle.author_role === "reporter" || rawArticle.created_by !== currentUser?.username);
          if (!isAuthor && !isReporterSubmitted) {
            isUnauthorizedEdit = true;
          }
        }
        if (!isUnauthorizedEdit) {
          initialArticle = mapDbArticleToFrontend(rawArticle);
        }
      }
    } catch (err) {
      console.error("[ArticleCreateModule edit fetch error]:", err);
    }
  }

  // Fetch only dynamic content categories and role-scoped recent articles
  const recentFilter = isLower
    ? { authorId: currentUser?.id, createdBy: currentUser?.username, limit: 5 }
    : { limit: 5 };

  const [categoriesWithSubs, recentArticles] = await Promise.all([
    getDynamicCategoriesWithSubcategories(),
    getRecentArticles(recentFilter),
  ]);

  if (isUnauthorizedEdit) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200 text-red-700 shadow-sm space-y-2">
        <h2 className="text-base font-bold">অননুমোদিত অ্যাক্সেস</h2>
        <p className="text-xs text-slate-500">
          অন্য কোনো প্রতিবেদকের সংবাদ সম্পাদনা করার অনুমতি আপনার অ্যাকাউন্টে নেই।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Module Header with Audit Metadata when editing */}
      <ArticleCreateHeader initialArticle={initialArticle} currentUser={currentUser} />

      {/* Article Form (Client Component with Create/Edit and Workflow States) */}
      <ArticleCreateForm
        categories={categoriesWithSubs}
        initialArticle={initialArticle}
        currentUser={currentUser}
      />

      {/* Live Recent Articles List (Scoped by role) */}
      <div className="pt-4">
        <RecentArticlesList articles={recentArticles} isLowerRole={isLower} />
      </div>
    </div>
  );
}

