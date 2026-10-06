export const SITE = {
  name: "Grrand Quiz",
  tagline: "Where smart gets social.",
  description:
    "Five questions, twenty seconds each. A new daily round everyone plays together, plus twelve categories to master. Free to play.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://grrand-quiz.vercel.app",
};

// Credit line shown in every footer. The role line changes per system.
export const CREDIT = {
  name: "Hermann Kapepe",
  title: "Founder of Witty Enterprises",
  role: "Product Designer, UI Architect and UX Designer",
};

export const CITIES = ["Lusaka", "Kitwe", "Ndola", "Kabwe", "Livingstone", "Chipata", "Kasama", "Solwezi", "Mansa", "Mongu", "Choma", "Elsewhere"] as const;
export const TEAM_KINDS = ["school", "class", "crew"] as const;
