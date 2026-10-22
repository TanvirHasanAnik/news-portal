import React from "react";
import { getAllCategoriesWithSubcategories } from "@/repositories/categoryRepository";
import { CategoryHeader } from "./components/CategoryHeader";
import { CategoryManager } from "./components/CategoryManager";

export default async function CategoriesModule() {
  const categoriesWithSubs = await getAllCategoriesWithSubcategories();

  return (
    <div className="space-y-6">
      <CategoryHeader />
      <CategoryManager initialCategories={categoriesWithSubs} />
    </div>
  );
}

