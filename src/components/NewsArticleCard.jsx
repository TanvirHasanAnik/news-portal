import React from "react";
import NewsCard, {
  VerticalNewsCard,
  HorizontalNewsCard,
  HeroNewsCard,
  CompactNewsCard,
  RowSummaryNewsCard,
  EmphasizedNewsCard,
} from "./NewsCard";

/**
 * NewsArticleCard (Compatibility Wrapper)
 * 
 * Re-exports and wraps the unified `NewsCard` component.
 * Maps legacy `variant="standard"` to `variant="vertical"`.
 */
export default function NewsArticleCard({
  news,
  variant = "standard",
  showCategory = true,
  showSubcategory = true,
  showTime = false,
  className = "",
  imageClassName = "",
  ...props
}) {
  const mappedVariant = variant === "standard" ? "vertical" : variant;

  return (
    <NewsCard
      news={news}
      variant={mappedVariant}
      showCategory={showCategory}
      showSubcategory={showSubcategory}
      showTime={showTime}
      className={className}
      imageClassName={imageClassName}
      {...props}
    />
  );
}

export {
  NewsCard,
  VerticalNewsCard,
  HorizontalNewsCard,
  HeroNewsCard,
  CompactNewsCard,
  RowSummaryNewsCard,
  EmphasizedNewsCard,
};
