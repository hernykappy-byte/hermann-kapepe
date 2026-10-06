export const SITE = {
  name: "Grrand Quiz",
  tagline: "Where smart gets social.",
  description:
    "Five questions, twenty seconds each. A new daily round everyone plays together, plus twelve categories to master. Free to play.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://grrand-quiz.vercel.app",
};

// Credit line shown in every footer. The role line changes per system.
// ASSUMPTION: role line below was chosen by Claude. Hermann to confirm or replace.
export const CREDIT = {
  name: "Hermann Kapepe",
  title: "Founder of Witty Enterprises",
  role: "Social Quiz Platform Architect",
};
