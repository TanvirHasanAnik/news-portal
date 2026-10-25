import React from "react";
import { getCuratedNews } from "@/repositories/curationRepository";
import { getPublishedArticles } from "@/repositories/articleRepository";
import { CurationHeader } from "./components/CurationHeader";
import { CurationTabsManager } from "./components/CurationTabsManager";

export default async function CurationModule() {
  let curatedItems = [];
  let publishedArticles = [];

  try {
    const [cItems, pArticles] = await Promise.all([
      getCuratedNews(),
      getPublishedArticles({ limit: 40 }),
    ]);
    curatedItems = cItems || [];
    publishedArticles = pArticles || [];
  } catch (err) {
    console.error("[CurationModule error]:", err);
  }

  return (
    <div className="space-y-6">
      <CurationHeader />
      <CurationTabsManager
        initialItems={curatedItems}
        articles={publishedArticles}
      />
    </div>
  );
}
