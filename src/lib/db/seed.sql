-- Default Users
INSERT OR IGNORE INTO users (id, name, email, role, status, bio)
VALUES 
  ('usr_superadmin', 'প্রধান সম্পাদক', 'admin@aloshbe.com', 'super_admin', 'active', 'প্রধান সম্পাদক ও সিস্টেম সুপার অ্যাডমিন'),
  ('usr_reporter', 'নিজস্ব প্রতিবেদক', 'reporter@aloshbe.com', 'reporter', 'active', 'আলো আসবে সংবাদ পরিবার');

-- Default Categories
INSERT OR IGNORE INTO categories (id, name, slug, is_permanent, sort_order)
VALUES
  ('cat_latest', 'সর্বশেষ', 'latest', 1, 1),
  ('cat_handpicked', 'বাছাইকৃত', 'handpicked', 1, 2),
  ('cat_national', 'জাতীয়', 'national', 0, 3),
  ('cat_politics', 'রাজনীতি', 'politics', 0, 4),
  ('cat_economy', 'অর্থনীতি', 'economy', 0, 5),
  ('cat_international', 'আন্তর্জাতিক', 'international', 0, 6),
  ('cat_sports', 'খেলাধুলা', 'sports', 0, 7),
  ('cat_entertainment', 'বিনোদন', 'entertainment', 0, 8),
  ('cat_technology', 'প্রযুক্তি', 'technology', 0, 9),
  ('cat_lifestyle', 'জীবনযাপন', 'lifestyle', 0, 10),
  ('cat_career', 'চাকরি ও ক্যারিয়ার', 'career', 0, 11),
  ('cat_opinion', 'মতামত', 'opinion', 0, 12);

-- Default Subcategories
INSERT OR IGNORE INTO subcategories (id, category_id, name, slug, sort_order)
VALUES
  ('cat_national_s_1', 'cat_national', 'রাজধানী', 'sub_national_1', 1),
  ('cat_national_s_2', 'cat_national', 'সারাদেশ', 'sub_national_2', 2),
  ('cat_national_s_3', 'cat_national', 'আইন ও আদালত', 'sub_national_3', 3),
  ('cat_national_s_4', 'cat_national', 'শিক্ষা', 'sub_national_4', 4),
  ('cat_national_s_5', 'cat_national', 'স্বাস্থ্য', 'sub_national_5', 5),
  ('cat_national_s_6', 'cat_national', 'প্রশাসন', 'sub_national_6', 6),

  ('cat_politics_s_1', 'cat_politics', 'সরকার', 'sub_politics_1', 1),
  ('cat_politics_s_2', 'cat_politics', 'দলীয় সংবাদ', 'sub_politics_2', 2),
  ('cat_politics_s_3', 'cat_politics', 'সংসদ', 'sub_politics_3', 3),
  ('cat_politics_s_4', 'cat_politics', 'নির্বাচন', 'sub_politics_4', 4),
  ('cat_politics_s_5', 'cat_politics', 'কূটনীতি', 'sub_politics_5', 5),

  ('cat_economy_s_1', 'cat_economy', 'ব্যাংকিং ও বিমা', 'sub_economy_1', 1),
  ('cat_economy_s_2', 'cat_economy', 'শেয়ারবাজার', 'sub_economy_2', 2),
  ('cat_economy_s_3', 'cat_economy', 'ব্যবসা-বাণিজ্য', 'sub_economy_3', 3),
  ('cat_economy_s_4', 'cat_economy', 'রাজস্ব', 'sub_economy_4', 4),
  ('cat_economy_s_5', 'cat_economy', 'বাজেট', 'sub_economy_5', 5),

  ('cat_international_s_1', 'cat_international', 'এশিয়া', 'sub_international_1', 1),
  ('cat_international_s_2', 'cat_international', 'মধ্যপ্রাচ্য', 'sub_international_2', 2),
  ('cat_international_s_3', 'cat_international', 'ইউরোপ-আমেরিকা', 'sub_international_3', 3),
  ('cat_international_s_4', 'cat_international', 'ভারত', 'sub_international_4', 4),
  ('cat_international_s_5', 'cat_international', 'যুদ্ধ ও সংঘাত', 'sub_international_5', 5),

  ('cat_sports_s_1', 'cat_sports', 'ক্রিকেট', 'sub_sports_1', 1),
  ('cat_sports_s_2', 'cat_sports', 'ফুটবল', 'sub_sports_2', 2),
  ('cat_sports_s_3', 'cat_sports', 'আন্তর্জাতিক ক্রীড়া', 'sub_sports_3', 3),
  ('cat_sports_s_4', 'cat_sports', 'টেনিস', 'sub_sports_4', 4),
  ('cat_sports_s_5', 'cat_sports', 'স্থানীয় টুর্নামেন্ট', 'sub_sports_5', 5),

  ('cat_entertainment_s_1', 'cat_entertainment', 'চলচ্চিত্র', 'sub_entertainment_1', 1),
  ('cat_entertainment_s_2', 'cat_entertainment', 'নাটক ও ওটিটি', 'sub_entertainment_2', 2),
  ('cat_entertainment_s_3', 'cat_entertainment', 'সঙ্গীত', 'sub_entertainment_3', 3),
  ('cat_entertainment_s_4', 'cat_entertainment', 'টেলিভিশন', 'sub_entertainment_4', 4),
  ('cat_entertainment_s_5', 'cat_entertainment', 'হলিউড-বলিউড', 'sub_entertainment_5', 5),

  ('cat_technology_s_1', 'cat_technology', 'স্মার্টফোন ও গ্যাজেট', 'sub_technology_1', 1),
  ('cat_technology_s_2', 'cat_technology', 'কৃত্রিম বুদ্ধিমত্তা', 'sub_technology_2', 2),
  ('cat_technology_s_3', 'cat_technology', 'ইন্টারনেট', 'sub_technology_3', 3),
  ('cat_technology_s_4', 'cat_technology', 'তথ্যপ্রযুক্তি খাত', 'sub_technology_4', 4),
  ('cat_technology_s_5', 'cat_technology', 'উদ্ভাবন', 'sub_technology_5', 5),

  ('cat_lifestyle_s_1', 'cat_lifestyle', 'স্বাস্থ্য ও রূপচর্চা', 'sub_lifestyle_1', 1),
  ('cat_lifestyle_s_2', 'cat_lifestyle', 'ভ্রমণ', 'sub_lifestyle_2', 2),
  ('cat_lifestyle_s_3', 'cat_lifestyle', 'রেসিপি ও খাবার', 'sub_lifestyle_3', 3),
  ('cat_lifestyle_s_4', 'cat_lifestyle', 'ফ্যাশন', 'sub_lifestyle_4', 4),
  ('cat_lifestyle_s_5', 'cat_lifestyle', 'পরামর্শ', 'sub_lifestyle_5', 5),

  ('cat_career_s_1', 'cat_career', 'সরকারি চাকরি', 'sub_career_1', 1),
  ('cat_career_s_2', 'cat_career', 'বেসরকারি নিয়োগ', 'sub_career_2', 2),
  ('cat_career_s_3', 'cat_career', 'ক্যারিয়ার গাইড', 'sub_career_3', 3),
  ('cat_career_s_4', 'cat_career', 'বিসিএস প্রস্তুতি', 'sub_career_4', 4),
  ('cat_career_s_5', 'cat_career', 'উচ্চশিক্ষা', 'sub_career_5', 5),

  ('cat_opinion_s_1', 'cat_opinion', 'সম্পাদকীয়', 'sub_opinion_1', 1),
  ('cat_opinion_s_2', 'cat_opinion', 'কলাম', 'sub_opinion_2', 2),
  ('cat_opinion_s_3', 'cat_opinion', 'মুক্তমত', 'sub_opinion_3', 3),
  ('cat_opinion_s_4', 'cat_opinion', 'বিশ্লেষণ', 'sub_opinion_4', 4);

