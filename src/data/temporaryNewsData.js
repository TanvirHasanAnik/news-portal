/**
 * Temporary News Objects Data Source
 * 
 * Each news item is organized with a random category and timestamp ('time').
 * Note: 'time' is stored internally for sorting purposes and is not displayed in the UI.
 * This list can be imported and accessed from any section across the application.
 */

export const temporaryNewsList = [
  {
    id: "temp-1",
    category: "আন্তর্জাতিক",
    categorySlug: "international",
    time: "2026-10-15T21:45:00Z",
    headline: "মধ্যপ্রাচ্য শান্তি আলোচনায় নতুন সমঝোতা স্মারক: যুদ্ধবিরতির আশায় বিশ্ব সম্প্রদায়",
    summary: "দীর্ঘ টানাপোড়েনের পর জাতিসংঘ ও আন্তর্জাতিক মধ্যস্থতাকারীদের প্রচেষ্টায় অবশেষে যুদ্ধবিরতির একটি কাঠামোতে একমত হয়েছে সংঘাতময় পক্ষগুলো। অবিলম্বে মানবিক ত্রাণ পৌঁছানোর ঘোষণা দিয়েছে বিশ্ব খাদ্য সংস্থা।",
    image: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?q=80&w=800&auto=format&fit=crop",
    author: "আন্তর্জাতিক ডেস্ক",
    location: "নিউইয়র্ক",
    isMostRecent: true,
  },
  {
    id: "temp-2",
    category: "খেলাধুলা",
    categorySlug: "sports",
    time: "2026-10-15T20:30:00Z",
    headline: "মিরপুর শের-ই-বাংলায় শ্বাসরুদ্ধকর জয়: সিরিজের দ্বিতীয় ওয়ানডেতে বাংলাদেশের নাটকীয় জয়",
    summary: "শেষ ওভারে জয়ের জন্য দরকার ছিল ১২ রান। দুর্দান্ত ফিনিশিংয়ে দুই বল বাকি থাকতেই জয় ছিনিয়ে নিয়ে সিরিজ নিশ্চিত করল লাল-সবুজ প্রতিনিধিরা।",
    image: "https://images.unsplash.com/photo-1531415074868-036b1c57e359?q=80&w=600&auto=format&fit=crop",
    author: "ক্রীড়া প্রতিবেদক",
    location: "মিরপুর",
    isMostRecent: false,
  },
  {
    id: "temp-3",
    category: "তথ্যপ্রযুক্তি",
    categorySlug: "technology",
    time: "2026-10-15T19:15:00Z",
    headline: "দেশেই তৈরি হচ্ছে সাশ্রয়ী কৃত্রিম বুদ্ধিমত্তা চিপ, গবেষণাগারে অনন্য সাফল্য",
    summary: "বুয়েটের গবেষকদের যৌথ প্রচেষ্টায় অত্যন্ত স্বল্পমূল্যে এআই মডেল প্রসেসিং উপযোগী সেমিকন্ডাক্টর স্থাপত্যের প্রোটোটাইপ সফলভাবে প্রস্তুত হয়েছে।",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
    author: "প্রযুক্তি প্রতিবেদক",
    location: "ঢাকা",
    isMostRecent: false,
  },
  {
    id: "temp-4",
    category: "অর্থনীতি",
    categorySlug: "economy",
    time: "2026-10-15T18:00:00Z",
    headline: "রপ্তানি আয়ে নতুন মাইলফলক: তৈরি পোশাক ও আইসিটিতে রেকর্ড প্রবৃদ্ধি",
    summary: "চলতি অর্থবছরের প্রথম প্রান্তিকে রপ্তানি আয়ে অভূতপূর্ব গতি সঞ্চারিত হয়েছে। তৈরি পোশাকের পাশাপাশি তথ্যপ্রযুক্তি রফতানিতে রেকর্ড প্রবৃদ্ধি অর্জিত হয়েছে।",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop",
    author: "অর্থনৈতিক ব্যুরো",
    location: "ঢাকা",
    isMostRecent: false,
  },
  {
    id: "temp-5",
    category: "জাতীয়",
    categorySlug: "national",
    time: "2026-10-15T17:10:00Z",
    headline: "মেট্রোরেলের নতুন সম্প্রসারিত রুটের ট্রায়াল রান সফল, উদ্বোধনের জোর প্রস্তুতি",
    summary: "রাজধানীর যোগাযোগ ব্যবস্থার যুগান্তকারী অগ্রগতি হিসেবে নতুন রুটে শুরু হয়েছে পরীক্ষামূলক চলাচল। দ্রুতই এটি সর্বসাধারণের জন্য উন্মুক্ত করা হবে।",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop",
    author: "নিজস্ব প্রতিবেদক",
    location: "ঢাকা",
    isMostRecent: false,
  },
  {
    id: "temp-6",
    category: "বিনোদন",
    categorySlug: "entertainment",
    time: "2026-10-15T16:25:00Z",
    headline: "আন্তর্জাতিক চলচ্চিত্র উৎসবে প্রশংসিত বাংলাদেশি নির্মাতার নতুন পূর্ণদৈর্ঘ্য চলচ্চিত্র",
    summary: "কান ও টরন্টো চলচ্চিত্র উৎসবে প্রদর্শনের পর এবার আন্তর্জাতিক জুরিবোর্ডের ভূয়সী প্রশংসা কুড়াল তরুণ চলচ্চিত্র নির্মাতার নতুন সিনেমা।",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop",
    author: "বিনোদন ডেস্ক",
    location: "ঢাকা",
    isMostRecent: false,
  },
  {
    id: "temp-7",
    category: "রাজনীতি",
    categorySlug: "politics",
    time: "2026-10-15T15:40:00Z",
    headline: "গণতান্ত্রিক সংস্কার ও আগামী নির্বাচন নিয়ে জাতীয় সংলাপের আহ্বান",
    summary: "রাজনৈতিক দলগুলোর মধ্যকার পারস্পরিক দূরত্ব কমিয়ে একটি সুষ্ঠু ও অবাধ নির্বাচনের পথ তৈরিতে ঐক্যমত্য গঠনের তাগিদ দিয়েছেন বিশিষ্টজনরা।",
    image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=600&auto=format&fit=crop",
    author: "রাজনৈতিক বিশ্লেষক",
    location: "ঢাকা",
    isMostRecent: false,
  },
  {
    id: "temp-8",
    category: "জীবনযাপন",
    categorySlug: "lifestyle",
    time: "2026-10-15T14:15:00Z",
    headline: "শীতের আগমনে প্রকৃতিতে উৎসবের আমেজ: ভ্রমণের নতুন গন্তব্য সাজেক ও শ্রীমঙ্গল",
    summary: "হেমন্তের বিদায়লগ্নে কুয়াশাচ্ছন্ন সকাল আর মিষ্টি রোদের স্পর্শে পর্যটকদের পদচারণায় মুখরিত হয়ে উঠেছে দেশের বিভিন্ন প্রাকৃতিক পর্যটন কেন্দ্র।",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    author: "ফিচার লেখক",
    location: "সিলেট",
    isMostRecent: false,
  },
  {
    id: "temp-9",
    category: "স্বাস্থ্য",
    categorySlug: "health",
    time: "2026-10-15T13:20:00Z",
    headline: "ডেঙ্গু প্রতিরোধে নতুন প্রযুক্তির ট্রায়াল শুরু: অ্যান্টিবডি গবেষণায় নতুন আশার আলো",
    summary: "স্বাস্থ্য অধিদপ্তরের সহযোগিতায় রাজধানীর একাধিক বিশেষায়িত হাসপাতালে নতুন চিকিৎসাপদ্ধতির প্রাথমিক ক্লিনিক্যাল ট্রায়াল আশাব্যঞ্জক ফলাফল দেখিয়েছে।",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop",
    author: "স্বাস্থ্য প্রতিনিধি",
    location: "ঢাকা",
    isMostRecent: false,
  },
  {
    id: "temp-10",
    category: "পরিবেশ",
    categorySlug: "environment",
    time: "2026-10-15T11:45:00Z",
    headline: "উপকূলীয় অঞ্চলে ম্যানগ্রোভ বনায়ন প্রকল্প: দুর্যোগ সহনশীল বাঁধ নির্মাণে অগ্রগতি",
    summary: "জলবায়ু পরিবর্তনের ক্ষতিকর প্রভাব মোকাবিলায় সুন্দরবন সংলগ্ন জেলাগুলোতে সবুজ বেষ্টনী গড়ে তোলার কাজ দ্রুত গতিতে এগিয়ে চলছে।",
    image: "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=600&auto=format&fit=crop",
    author: "পরিবেশ প্রতিবেদক",
    location: "খুলনা",
    isMostRecent: false,
  },
];

/**
 * Utility helper to sort any news array by time descending (latest first).
 */
export const getSortedNewsByTime = (list = temporaryNewsList) => {
  return [...list].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );
};

