/**
 * Shared blog post data for Muslim Pro replica.
 * Matches content from muslimpro.com/blog and muslimpro.com/category/deen
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: "all" | "ramadan" | "deen" | "lifestyle" | "quran" | "qalbox";
  href: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ramadan-recharge-2026",
    title: "Ramadan Re:Charge 2026 | Letter from Nafees, Muslim Pro CEO",
    excerpt: "As the weight of daily life continues, how do we…",
    date: "February 12, 2026",
    author: "Muslim Pro Contributor",
    category: "ramadan",
    href: "/app/blog/ramadan-recharge-2026",
  },
  {
    slug: "laylat-al-qadr",
    title: "What Actually Happens on Laylat al-Qadr?",
    excerpt: "The barrier between heaven and earth disappears on Laylat al-Qadr.…",
    date: "March 12, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/laylat-al-qadr",
  },
  {
    slug: "last-10-nights",
    title: "What to Expect from the Last 10 Nights of Ramadan",
    excerpt: "The last 10 nights of Ramadan are not about pushing…",
    date: "March 11, 2026",
    author: "Muslim Pro Contributor",
    category: "ramadan",
    href: "/app/blog/last-10-nights",
  },
  {
    slug: "itikaf-during-ramadan",
    title: "How Do You Perform I'tikaf Correctly During Ramadan?",
    excerpt: "Is the world too loud? Discover how Itikaf can help…",
    date: "March 10, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/itikaf-during-ramadan",
  },
  {
    slug: "heart-feels-tired",
    title: "Why Your Heart Feels Tired This Ramadan",
    excerpt: "The flatness you feel halfway through Ramadan isn't a sign…",
    date: "March 6, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/heart-feels-tired",
  },
  {
    slug: "simple-ramadan-dhikr",
    title: "Simple Ramadan Dhikr for Everyday Practice",
    excerpt: "Ramadan often begins with strong intentions. You want to pray…",
    date: "March 3, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/simple-ramadan-dhikr",
  },
  {
    slug: "four-page-rule",
    title: "Complete the Quran in Ramadan With This 4-Page Rule",
    excerpt: "Is your Quran goal slipping away? Don't quit. Here is…",
    date: "March 2, 2026",
    author: "Muslim Pro Contributor",
    category: "quran",
    href: "/app/blog/four-page-rule",
  },
  {
    slug: "taraweeh-prayers",
    title: "The Complete Guide to Ramadan Taraweeh Prayers",
    excerpt: "You might feel overwhelmed by the long nights of Ramadan.…",
    date: "March 1, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/taraweeh-prayers",
  },
  {
    slug: "sahur-guide",
    title: "The Sahur Guide You Need for This Ramadan",
    excerpt: "Master your morning routine. Get the Sahur Dua, best energy…",
    date: "February 28, 2026",
    author: "Muslim Pro Contributor",
    category: "ramadan",
    href: "/app/blog/sahur-guide",
  },
  {
    slug: "ramadan-duas",
    title: "The Ramadan Duas Every Believer Should Make This Month",
    excerpt: "Ramadan arrives, and you raise your hands, knowing this month…",
    date: "February 25, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/ramadan-duas",
  },
  {
    slug: "habits-diminish-fasting",
    title: "5 Habits That Diminish the Reward of Your Ramadan Fasting",
    excerpt: "Ramadan fasting is more than just giving up food. Avoid these 5 habits to ensure your fast is accepted and spiritually rewarding.",
    date: "February 20, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/habits-diminish-fasting",
  },
  {
    slug: "sadaqah-acts-ramadan",
    title: "Ten Simple Sadaqah Acts To Transform Your Ramadan",
    excerpt: "You don't need money to give charity. Here are 10 simple Sadaqah acts, from traffic patience to visiting the sick, that will transform your Ramadan rewards.",
    date: "February 18, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/sadaqah-acts-ramadan",
  },
  {
    slug: "guilty-not-fasting-pregnant",
    title: "Why You Shouldn't Feel Guilty for Not Fasting While Pregnant",
    excerpt: "You aren't skipping Ramadan; you're experiencing it differently. Learn how to handle the guilt of not fasting and find peace in your concession.",
    date: "February 15, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/guilty-not-fasting-pregnant",
  },
  {
    slug: "dua-after-breaking-fast",
    title: "Why Should You Make Dua After Breaking Your Ramadan Fast",
    excerpt: "The moments right after you break your Ramadan fast are among the most powerful for a believer. Discover why this specific time is never rejected and learn the beautiful dua that asks Allah to erase your mistakes entirely.",
    date: "February 12, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/dua-after-breaking-fast",
  },
  {
    slug: "ramadan-niyyah-iftar-dua",
    title: "Perfect Your Fast With The Right Ramadan Niyyah And Iftar Dua",
    excerpt: "You might feel a subtle anxiety as Ramadan approaches. You worry about getting the details right to ensure your fast counts. Did I say the intention correctly? Is my dua […]",
    date: "February 10, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/ramadan-niyyah-iftar-dua",
  },
  {
    slug: "new-muslim-first-ramadan",
    title: "What Every New Muslim Should Expect During Their First Ramadan",
    excerpt: "Your first Ramadan is a massive milestone. Discover how new Muslims can navigate the physical and emotional changes of their first fasting month.",
    date: "February 8, 2026",
    author: "Muslim Pro Contributor",
    category: "deen",
    href: "/app/blog/new-muslim-first-ramadan",
  },
  {
    slug: "fasting-special-cases",
    title: "Fasting in Special Cases: Pregnancy, Illness, and Other Exemptions",
    excerpt: "Fasting is a pillar of Islam, but health comes first. Explore the compassionate rules for those who are pregnant, sick, or traveling, and learn how to make up missed days.",
    date: "February 5, 2026",
    author: "Siti Zahidah",
    category: "deen",
    href: "/app/blog/fasting-special-cases",
  },
  {
    slug: "history-madinah",
    title: "The History of Madinah from Hijrah to the Heart of Islamic Civilization",
    excerpt: "Madinah, the home of Prophet Muhammad ﷺ, was originally Yathrib—a divided oasis that longed for unity and justice. The Hijrah (migration) in 622 CE transformed it into Al-Madinah Al-Munawwarah, the enlightened city and the bedrock of the first Muslim community.",
    date: "February 2, 2026",
    author: "Siti Zahidah",
    category: "deen",
    href: "/app/blog/history-madinah",
  },
  {
    slug: "where-is-al-madinah",
    title: "Where Is Al Madinah: A Muslim's Guide to Visiting the City of the Prophet ﷺ",
    excerpt: "Al Madinah Al-Munawwarah is the second holiest city in Islam, located in the Hejaz region of western Saudi Arabia, approximately 400 km north of Makkah.",
    date: "January 30, 2026",
    author: "Siti Zahidah",
    category: "deen",
    href: "/app/blog/where-is-al-madinah",
  },
  {
    slug: "what-makes-madinah-special",
    title: "What Makes Madinah City Special: History, Meaning and Significance",
    excerpt: "Known as the City of the Prophet, Madinah holds a special place in every Muslim's heart. Discover the history behind this sanctuary of peace and why it continues to inspire millions.",
    date: "January 28, 2026",
    author: "Siti Zahidah",
    category: "deen",
    href: "/app/blog/what-makes-madinah-special",
  },
  // Quran category posts
  {
    slug: "powerful-quranic-quotes",
    title: "Powerful Quranic Quotes for Daily Life: Find Peace and Purpose",
    excerpt: "Find peace and purpose with this curated collection of beautiful Quranic quotes and verses about life, patience, gratitude, and healing.",
    date: "March 5, 2026",
    author: "Muslim Pro Contributor",
    category: "quran",
    href: "/app/blog/powerful-quranic-quotes",
  },
  {
    slug: "quran-revelation",
    title: "The Quran's Revelation: How the Holy Book Was Revealed and Preserved",
    excerpt: "The Quran is believed by Muslims to be the direct and unaltered word of God (Allah), revealed gradually to Prophet Muhammad ﷺ over 23 years, starting in 610 CE.",
    date: "March 1, 2026",
    author: "Muslim Pro Contributor",
    category: "quran",
    href: "/app/blog/quran-revelation",
  },
  {
    slug: "tajweed-rules",
    title: "Tajweed Rules Every Muslim Should Know (With Examples)",
    excerpt: "Many learners worry that mastering Tajweed is difficult, but starting with the core rules builds confidence and accuracy over time.",
    date: "February 25, 2026",
    author: "Siti Zahidah",
    category: "quran",
    href: "/app/blog/tajweed-rules",
  },
  {
    slug: "tajweed-complete-guide",
    title: "Tajweed of Quran: Complete Guide to Perfecting Your Recitation",
    excerpt: "Tajweed is the key to reciting the Quran with clarity, beauty, and correctness — just as it was revealed.",
    date: "February 20, 2026",
    author: "Siti Zahidah",
    category: "quran",
    href: "/app/blog/tajweed-complete-guide",
  },
  {
    slug: "5-tips-khatam-quran",
    title: "5 Simple Tips to Help You Khatam the Quran This Ramadan",
    excerpt: "Join thousands of Muslims worldwide in completing the Quran together. Whether you're a seasoned reciter or new to the Quran, deepen your connection with Allah.",
    date: "February 15, 2026",
    author: "Muhammad Adli",
    category: "quran",
    href: "/app/blog/5-tips-khatam-quran",
  },
  {
    slug: "5-reasons-khatam-quran",
    title: "5 Reasons You Should Aim to Khatam the Quran This Ramadan",
    excerpt: "Completing (Khatam) the Quran in Ramadan is one of the greatest achievements a Muslim can strive and aim for.",
    date: "February 10, 2026",
    author: "zaidani",
    category: "quran",
    href: "/app/blog/5-reasons-khatam-quran",
  },
  {
    slug: "significance-masjid-al-aqsa",
    title: "Significance of Masjid Al-Aqsa",
    excerpt: "Al-Aqsa Mosque, located in Jerusalem, holds profound significance for Muslims as a site rich in historical and spiritual legacy.",
    date: "February 5, 2026",
    author: "Ustazah Nurfilzah",
    category: "quran",
    href: "/app/blog/significance-masjid-al-aqsa",
  },
  {
    slug: "surah-al-fil-story",
    title: "Quran Learning: The Story of Surah Al-Fil & The Elephant",
    excerpt: "The Quran tells a remarkable story in Surah Al-Fil about how Allah protected the Kaaba from a powerful ruler named Abraha.",
    date: "February 1, 2026",
    author: "Ustazah Nurfilzah",
    category: "quran",
    href: "/app/blog/surah-al-fil-story",
  },
  {
    slug: "surah-al-fatihah-benefits",
    title: "Quran Learning: The Benefits of Surah Al-Fatihah",
    excerpt: "Surah Al-Fatihah is not merely an obligatory recitation in prayer but a treasure filled with spiritual benefits.",
    date: "January 28, 2026",
    author: "Ustaz Abdul Hakim",
    category: "quran",
    href: "/app/blog/surah-al-fatihah-benefits",
  },
  // Lifestyle category posts
  {
    slug: "avoid-burnout-eid",
    title: "How to Avoid Burning Out During Eid Festivities",
    excerpt: "Eid is a time for joy, but the hustle of preparations and celebrations can easily leave you feeling drained.",
    date: "March 8, 2026",
    author: "Muhammad Adli",
    category: "lifestyle",
    href: "/app/blog/avoid-burnout-eid",
  },
  {
    slug: "maintain-progress-after-ramadan",
    title: "How Do I Maintain My Progress After Ramadan?",
    excerpt: "As Ramadan comes to an end, many of us wonder how to maintain the spiritual growth we've experienced.",
    date: "March 5, 2026",
    author: "Muhammad Adli",
    category: "lifestyle",
    href: "/app/blog/maintain-progress-after-ramadan",
  },
  {
    slug: "year-end-reflections",
    title: "7 Steps To Guide You Through Your Year-End Reflections",
    excerpt: "Embark on a purposeful year-end reflection journey aligned with Islamic teachings.",
    date: "February 28, 2026",
    author: "zaidani",
    category: "lifestyle",
    href: "/app/blog/year-end-reflections",
  },
  {
    slug: "acts-of-kindness",
    title: "Exploring Acts of Kindness in Islamic Teachings",
    excerpt: "If only every human realizes the essence and substance of kindness and manifests it in their daily lives.",
    date: "February 20, 2026",
    author: "Ustazah Eka Budhi Setiani",
    category: "lifestyle",
    href: "/app/blog/acts-of-kindness",
  },
  {
    slug: "intentionally-choosing-hijab",
    title: "Intentionally Choosing Hijab",
    excerpt: "A reflection on the beauty and intention behind wearing hijab in Islam.",
    date: "February 15, 2026",
    author: "Muslim Pro Contributor",
    category: "lifestyle",
    href: "/app/blog/intentionally-choosing-hijab",
  },
  {
    slug: "value-of-women-in-islam",
    title: "The Value of Women in Islam",
    excerpt: "Islam respects and values women's femininity. Women have their own particularities, just as men have theirs.",
    date: "February 10, 2026",
    author: "Muslim Pro Contributor",
    category: "lifestyle",
    href: "/app/blog/value-of-women-in-islam",
  },
];

export const POSTS_PER_PAGE = 10;

export function getPostsForCategory(category: string): BlogPost[] {
  if (category === "all" || !category) {
    return BLOG_POSTS;
  }
  return BLOG_POSTS.filter((p) => p.category === category);
}

export function getPaginatedPosts(posts: BlogPost[], page: number) {
  const start = (page - 1) * POSTS_PER_PAGE;
  return posts.slice(start, start + POSTS_PER_PAGE);
}

export function getTotalPages(posts: BlogPost[]) {
  return Math.ceil(posts.length / POSTS_PER_PAGE);
}
