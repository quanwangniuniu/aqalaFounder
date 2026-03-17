/**
 * Shared blog post data for Aqala.
 * Islamic articles and guides for daily inspiration.
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: "all" | "ramadan" | "deen" | "lifestyle" | "quran" | "rooms";
  href: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ramadan-recharge-2026",
    title: "Ramadan 2026: A Note from the Aqala Team",
    excerpt: "Staying present in worship when life gets heavy. How we built Aqala to support your journey.",
    date: "February 12, 2026",
    author: "Aqala Team",
    category: "ramadan",
    href: "/app/blog/ramadan-recharge-2026",
  },
  {
    slug: "laylat-al-qadr",
    title: "Laylat al-Qadr: When the Heavens Open",
    excerpt: "One night worth a thousand months. A practical guide to seeking this blessed night.",
    date: "March 12, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/laylat-al-qadr",
  },
  {
    slug: "last-10-nights",
    title: "Ramadan's Final Ten Nights: A Practical Guide",
    excerpt: "Not about pushing limits — about showing up tired, busy, and human.",
    date: "March 11, 2026",
    author: "Aqala Team",
    category: "ramadan",
    href: "/app/blog/last-10-nights",
  },
  {
    slug: "itikaf-during-ramadan",
    title: "I'tikaf: Stepping Back to Reconnect",
    excerpt: "When the world feels too loud, retreat into the mosque. A step-by-step guide.",
    date: "March 10, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/itikaf-during-ramadan",
  },
  {
    slug: "heart-feels-tired",
    title: "When Ramadan Feels Flat: What's Really Going On",
    excerpt: "The mid-Ramadan slump isn't failure. Understanding the spiritual rhythm.",
    date: "March 6, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/heart-feels-tired",
  },
  {
    slug: "simple-ramadan-dhikr",
    title: "Dhikr You Can Do Anywhere This Ramadan",
    excerpt: "Short, powerful remembrances for commutes, breaks, and quiet moments.",
    date: "March 3, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/simple-ramadan-dhikr",
  },
  {
    slug: "four-page-rule",
    title: "Finishing the Quran in 30 Days: The Four-Page Method",
    excerpt: "A simple daily target that adds up. How to pace yourself without burnout.",
    date: "March 2, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/four-page-rule",
  },
  {
    slug: "taraweeh-prayers",
    title: "Taraweeh: A Guide to the Night Prayers of Ramadan",
    excerpt: "Understanding the structure, intention, and beauty of these special prayers.",
    date: "March 1, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/taraweeh-prayers",
  },
  {
    slug: "sahur-guide",
    title: "Sahur: Starting Your Fast With Intention",
    excerpt: "The pre-dawn meal, the dua, and how to fuel your body and soul.",
    date: "February 28, 2026",
    author: "Aqala Team",
    category: "ramadan",
    href: "/app/blog/sahur-guide",
  },
  {
    slug: "ramadan-duas",
    title: "Duas to Make Throughout Ramadan",
    excerpt: "Essential supplications for the month — from opening the fast to seeking Laylat al-Qadr.",
    date: "February 25, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/ramadan-duas",
  },
  {
    slug: "habits-diminish-fasting",
    title: "Five Things That Can Weaken Your Fast's Reward",
    excerpt: "Fasting goes beyond abstaining from food. Steer clear of these habits to protect your spiritual gains.",
    date: "February 20, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/habits-diminish-fasting",
  },
  {
    slug: "sadaqah-acts-ramadan",
    title: "Ten Acts of Charity That Don't Require Money",
    excerpt: "From patience in traffic to visiting the sick — small deeds that multiply your Ramadan rewards.",
    date: "February 18, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/sadaqah-acts-ramadan",
  },
  {
    slug: "guilty-not-fasting-pregnant",
    title: "Not Fasting While Pregnant: Finding Peace in the Exemption",
    excerpt: "You're not skipping Ramadan — you're living it differently. How to release guilt and embrace the concession.",
    date: "February 15, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/guilty-not-fasting-pregnant",
  },
  {
    slug: "dua-after-breaking-fast",
    title: "The Power of Dua at Iftar Time",
    excerpt: "The moments after breaking your fast are among the most accepted for supplication. Learn the dua and why it matters.",
    date: "February 12, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/dua-after-breaking-fast",
  },
  {
    slug: "ramadan-niyyah-iftar-dua",
    title: "Niyyah and Iftar Dua: Getting the Basics Right",
    excerpt: "Worried about saying the intention correctly? A simple guide to starting and ending your fast with clarity.",
    date: "February 10, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/ramadan-niyyah-iftar-dua",
  },
  {
    slug: "new-muslim-first-ramadan",
    title: "Your First Ramadan: A Revert's Guide",
    excerpt: "A milestone for every new Muslim. How to navigate the physical and emotional journey of your first fasting month.",
    date: "February 8, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/new-muslim-first-ramadan",
  },
  {
    slug: "fasting-special-cases",
    title: "When Fasting Isn't Required: Exemptions and Making Up Days",
    excerpt: "Health comes first. A look at who is exempt and how to compensate for missed fasts.",
    date: "February 5, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/fasting-special-cases",
  },
  {
    slug: "history-madinah",
    title: "Madinah: From Yathrib to the City of Light",
    excerpt: "How the Hijrah in 622 CE turned a divided oasis into the heart of the first Muslim community.",
    date: "February 2, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/history-madinah",
  },
  {
    slug: "where-is-al-madinah",
    title: "Visiting Madinah: A Practical Guide",
    excerpt: "Location, preparation, and what to know before visiting the second holiest city in Islam.",
    date: "January 30, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/where-is-al-madinah",
  },
  {
    slug: "what-makes-madinah-special",
    title: "Why Madinah Matters: History and Significance",
    excerpt: "The City of the Prophet — a brief look at its place in Islamic history and the hearts of believers.",
    date: "January 28, 2026",
    author: "Aqala Team",
    category: "deen",
    href: "/app/blog/what-makes-madinah-special",
  },
  // Quran category posts
  {
    slug: "powerful-quranic-quotes",
    title: "Quranic Verses for Peace, Patience, and Gratitude",
    excerpt: "A selection of verses to carry through your day — for reflection and strength.",
    date: "March 5, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/powerful-quranic-quotes",
  },
  {
    slug: "quran-revelation",
    title: "How the Quran Was Revealed and Preserved",
    excerpt: "The gradual revelation over 23 years and the preservation of Allah's word.",
    date: "March 1, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/quran-revelation",
  },
  {
    slug: "tajweed-rules",
    title: "Essential Tajweed Rules for Clear Recitation",
    excerpt: "Core rules that build confidence. Start here and grow your recitation over time.",
    date: "February 25, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/tajweed-rules",
  },
  {
    slug: "tajweed-complete-guide",
    title: "Tajweed: A Guide to Reciting the Quran Correctly",
    excerpt: "Clarity, beauty, and correctness — the foundations of proper recitation.",
    date: "February 20, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/tajweed-complete-guide",
  },
  {
    slug: "5-tips-khatam-quran",
    title: "Five Ways to Complete the Quran This Ramadan",
    excerpt: "Whether you're new or experienced, practical steps to finish the Book in 30 days.",
    date: "February 15, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/5-tips-khatam-quran",
  },
  {
    slug: "5-reasons-khatam-quran",
    title: "Why Complete the Quran in Ramadan?",
    excerpt: "The spiritual reward and personal growth that come with finishing the Book.",
    date: "February 10, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/5-reasons-khatam-quran",
  },
  {
    slug: "significance-masjid-al-aqsa",
    title: "Masjid Al-Aqsa: Its Place in Islamic History",
    excerpt: "Jerusalem's Al-Aqsa — a site of profound spiritual and historical meaning.",
    date: "February 5, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/significance-masjid-al-aqsa",
  },
  {
    slug: "surah-al-fil-story",
    title: "Surah Al-Fil: The Story of the Elephant",
    excerpt: "How Allah protected the Kaaba — a lesson in divine power and mercy.",
    date: "February 1, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/surah-al-fil-story",
  },
  {
    slug: "surah-al-fatihah-benefits",
    title: "Surah Al-Fatihah: More Than an Opening",
    excerpt: "The spiritual depth and benefits of the chapter we recite in every rak'ah.",
    date: "January 28, 2026",
    author: "Aqala Team",
    category: "quran",
    href: "/app/blog/surah-al-fatihah-benefits",
  },
  // Lifestyle category posts
  {
    slug: "avoid-burnout-eid",
    title: "Staying Grounded During Eid: Avoiding Exhaustion",
    excerpt: "Joy and celebration can be draining. How to enjoy Eid without burning out.",
    date: "March 8, 2026",
    author: "Aqala Team",
    category: "lifestyle",
    href: "/app/blog/avoid-burnout-eid",
  },
  {
    slug: "maintain-progress-after-ramadan",
    title: "Carrying Ramadan's Growth Into the Rest of the Year",
    excerpt: "Practical ways to keep the spiritual momentum after the month ends.",
    date: "March 5, 2026",
    author: "Aqala Team",
    category: "lifestyle",
    href: "/app/blog/maintain-progress-after-ramadan",
  },
  {
    slug: "year-end-reflections",
    title: "Year-End Reflection: An Islamic Approach",
    excerpt: "Seven steps to look back and plan ahead with intention.",
    date: "February 28, 2026",
    author: "Aqala Team",
    category: "lifestyle",
    href: "/app/blog/year-end-reflections",
  },
  {
    slug: "acts-of-kindness",
    title: "Kindness in Islam: From Theory to Practice",
    excerpt: "The essence of kindness and how to live it in daily life.",
    date: "February 20, 2026",
    author: "Aqala Team",
    category: "lifestyle",
    href: "/app/blog/acts-of-kindness",
  },
  {
    slug: "intentionally-choosing-hijab",
    title: "Choosing Hijab With Intention",
    excerpt: "A reflection on the meaning and beauty behind the decision to wear hijab.",
    date: "February 15, 2026",
    author: "Aqala Team",
    category: "lifestyle",
    href: "/app/blog/intentionally-choosing-hijab",
  },
  {
    slug: "value-of-women-in-islam",
    title: "Women's Place and Value in Islamic Teachings",
    excerpt: "How Islam honours women's unique role and dignity.",
    date: "February 10, 2026",
    author: "Aqala Team",
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
