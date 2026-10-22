import React from "react";
import { getCuratedNews } from "@/repositories/curationRepository";
import { getPublishedArticles } from "@/repositories/articleRepository";
import { CurationHeader } from "./components/CurationHeader";
import { CurationTabsManager } from "./components/CurationTabsManager";

export default async function CurationModule() {
  const [curatedItems, publishedArticles] = await Promise.all([
    getCuratedNews(),
    getPublishedArticles({ limit: 40 }),
  ]);

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

