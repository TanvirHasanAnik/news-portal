import LatestMixedSection from "../components/LatestMixedSection";
import HandpickedNewsSection from "../components/HandpickedNewsSection";
import CategoryScrollSection from "../components/CategoryScrollSection";

export default function Home() {
  return (
    <>
      {/* 1. Requirement 2: Latest Mixed Category Published Section */}
      <LatestMixedSection />

      {/* 2. Handpicked News Section (বাছাইকৃত সংবাদ) - Column ratio 2:1 */}
      <HandpickedNewsSection />

      {/* 3. Requirement 3: Categorized news showcase sections */}
      <CategoryScrollSection />
    </>
  );
}

