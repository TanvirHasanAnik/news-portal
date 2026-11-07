import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { unstable_cache } from "next/cache";
import { TAGS } from "@/lib/cache/tags";
import { getActiveBreakingNews } from "@/repositories/curationRepository";
import { getAllCategoriesWithSubcategories } from "@/repositories/categoryRepository";
import { getPublishedArticles, mapDbArticleToFrontend } from "@/repositories/articleRepository";
import { getSocialLinks } from "@/repositories/socialLinksRepository";

const getCachedBreakingNews = unstable_cache(
  async () => getActiveBreakingNews(10),
  ["layout-breaking-news"],
  { tags: [TAGS.CURATION_BREAKING] }
);

const getCachedCategories = unstable_cache(
  async () => getAllCategoriesWithSubcategories(),
  ["layout-categories"],
  { tags: [TAGS.CATEGORIES] }
);

const getCachedHeadlines = unstable_cache(
  async () => getPublishedArticles({ limit: 3 }),
  ["layout-headlines"],
  { tags: [TAGS.ARTICLES_PUBLISHED] }
);

const getCachedSocialLinks = unstable_cache(
  async () => getSocialLinks(),
  ["layout-social-links"],
  { tags: [TAGS.SOCIAL_LINKS] }
);

export default async function SiteLayout({ children }) {
  let breakingNewsList = [];
  let dbCategories = [];
  let latestHeadlines = [];
  let socialLinks = {
    facebook: "",
    youtube: "",
    twitter: "",
    instagram: "",
  };

  try {
    const [breaking, cats, rawHeadlines, sLinks] = await Promise.all([
      getCachedBreakingNews(),
      getCachedCategories(),
      getCachedHeadlines(),
      getCachedSocialLinks(),
    ]);
    breakingNewsList = breaking || [];
    dbCategories = cats || [];
    latestHeadlines = (rawHeadlines || []).map(mapDbArticleToFrontend);
    if (sLinks) {
      socialLinks = sLinks;
    }
  } catch (err) {
    console.error("Error loading layout data:", err);
  }

  return (
    <>
      <Header
        breakingNewsList={breakingNewsList}
        latestHeadlines={latestHeadlines}
        categories={dbCategories}
        socialLinks={socialLinks}
      />
      <div className="flex-1">
        {children}
      </div>
      <Footer categories={dbCategories} socialLinks={socialLinks} />
    </>
  );
}
